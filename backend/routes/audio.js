import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import { authMiddleware, checkCredits } from '../middleware/auth.js';
import fetch from 'node-fetch'; // Add this import at the top if not present

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Convert YouTube URL to audio
router.post('/youtube', authMiddleware, checkCredits, async (req, res) => {
  try {
    const { url, format = 'mp3' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const outputDir = 'uploads/audio/output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${uuidv4()}.${format}`;
    const outputPath = path.join(outputDir, outputFileName);

    // 1. Get the video title with a separate yt-dlp call
    const ytDlpPath = 'yt-dlp'; // Use global yt-dlp in Docker/Render
    let videoTitle = 'audio';
    try {
      videoTitle = await new Promise((resolve, reject) => {
        let title = '';
        const titleProc = spawn(ytDlpPath, ['--print', '%(title)s', url]);
        titleProc.stdout.on('data', (data) => { title += data.toString(); });
        titleProc.on('close', (code) => {
          if (code === 0) resolve(title.trim().replace(/[^\w\s-]/g, '') || 'audio');
          else reject(new Error('yt-dlp failed to get title'));
        });
        titleProc.on('error', reject);
      });
    } catch (err) {
      console.error('yt-dlp title error:', err);
      videoTitle = 'audio';
    }

    // 2. Download audio and pipe to ffmpeg
    const ytDlpAudio = spawn(ytDlpPath, [
      '-f', 'bestaudio',
      '--no-playlist',
      '-o', '-',
      url
    ]);

    ytDlpAudio.on('error', (err) => {
      console.error('yt-dlp error:', err);
      res.status(500).json({ error: 'yt-dlp process failed', details: err.message });
      return;
    });
    ytDlpAudio.stderr.on('data', (data) => {
      // Suppress yt-dlp progress/info logs; only log if needed for debugging
      // (Uncomment the next line for debugging)
      // console.error('yt-dlp stderr:', data.toString());
    });
    ytDlpAudio.on('close', (code) => {
      if (code !== 0) {
        res.status(500).json({ error: 'yt-dlp process exited with error', code });
        return;
      }
    });

    ffmpeg(ytDlpAudio.stdout)
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .on('end', () => {
        res.json({
          success: true,
          message: 'Audio converted successfully',
          downloadUrl: `/uploads/audio/output/${outputFileName}`,
          filename: `${videoTitle}.${format}`,
          format: format
        });
        return;
      })
      .on('error', (err) => {
        // Only log actual errors
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Audio conversion failed', details: err.message });
        return;
      })
      .save(outputPath);

  } catch (error) {
    console.error('General YouTube conversion error:', error);
    res.status(500).json({ 
      error: 'YouTube conversion failed', 
      details: error.message,
      message: 'An unexpected error occurred while processing the YouTube video'
    });
    return;
  }
});

// Get YouTube video preview/info
router.get('/youtube/preview', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/v\/|\?v=|&v=)([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL or unable to extract video ID' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (!data.items || !data.items.length) {
      return res.status(404).json({ error: 'Video not found' });
    }
    const video = data.items[0];
    // Format duration (ISO 8601 to HH:MM:SS)
    function parseISODuration(iso) {
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(match[1] || 0, 10);
      const minutes = parseInt(match[2] || 0, 10);
      const seconds = parseInt(match[3] || 0, 10);
      return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    // Format view count
    function formatViews(views) {
      if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
      if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
      return views.toString();
    }
    const snippet = video.snippet;
    const stats = video.statistics;
    const contentDetails = video.contentDetails;
    const videoInfo = {
      title: snippet.title,
      channel: snippet.channelTitle,
      duration: parseISODuration(contentDetails.duration),
      views: formatViews(parseInt(stats.viewCount || '0', 10)),
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null,
      description: snippet.description?.substring(0, 200) + '...' || '',
      uploadDate: snippet.publishedAt,
      videoId: videoId
    };
    res.json(videoInfo);
  } catch (error) {
    console.error('YouTube preview error:', error);
    res.status(500).json({
      error: 'Failed to get video preview',
      details: error.message,
      message: 'An unexpected error occurred while fetching video information'
    });
  }
});

// Convert uploaded video to audio
router.post('/video', authMiddleware, checkCredits, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { format = 'mp3' } = req.body;
    const inputPath = req.file.path;
    
    const outputDir = 'uploads/audio/output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${uuidv4()}.${format}`;
    const outputPath = path.join(outputDir, outputFileName);

    // Convert video to audio using ffmpeg
    ffmpeg(inputPath)
      .audioCodec(format === 'mp3' ? 'libmp3lame' : format === 'wav' ? 'pcm_s16le' : 'flac')
      .audioBitrate(format === 'mp3' ? '192k' : format === 'wav' ? '1411k' : '320k')
      .on('end', () => {
        // Clean up the input file
        fs.unlinkSync(inputPath);
        
        res.download(outputPath, outputFileName, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up the output file after download
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          }, 5000);
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // Clean up the input file on error
        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
        }
        res.status(500).json({ error: 'Audio conversion failed', details: err.message });
      })
      .save(outputPath);

  } catch (error) {
    console.error('Video conversion error:', error);
    res.status(500).json({ error: 'Video conversion failed', details: error.message });
  }
});

// Download converted audio file
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/audio/output', filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up the file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router; 