import React from 'react';
import AppDownload from '../../components/AppDownload/AppDownload';
import VideoPreview from '../../components/VideoPreview/VideoPreview';
import './Home.css';

const features = [
  {
    title: '🎵 YouTube/Video to MP3/WAV/FLAC',
    desc: 'Remember the days of burning CDs? Now you can extract the soul of any video into crystal-clear audio. From your favorite YouTube covers to that viral TikTok sound, transform visual moments into timeless audio memories. Perfect for creating playlists, podcasts, or just preserving those magical musical moments.',
    icon: '🎵',
    nostalgia: 'Like having a digital mixtape maker from the future!'
  },
  {
    title: '📄 PDF/DOC File Converter',
    desc: 'The digital equivalent of a magical typewriter that speaks every language. Transform your documents like a wizard casting spells—PDFs become editable text, Word docs become universal formats. No more "Sorry, I can\'t open that file" moments. Your documents, your way, instantly.',
    icon: '📄',
    nostalgia: 'Remember when you needed different software for every file type? Those days are gone!'
  },
  {
    title: '📸 Smile-Cam',
    desc: 'Capture joy in its purest form! This isn\'t just a camera—it\'s a happiness detector that finds and celebrates every smile. Perfect for family photos, social media, or just those moments when you want to ensure everyone\'s having a good time. Because life is better when you\'re smiling.',
    icon: '📸',
    nostalgia: 'Like having a personal photographer who knows exactly when to say "cheese!"'
  },
  {
    title: '🖼️ Image Resizer',
    desc: 'The digital darkroom of the future! Resize, crop, and convert your images with surgical precision. Whether you\'re preparing photos for social media, optimizing for web, or just want to make that perfect profile picture, this tool gives you the power to make every pixel count.',
    icon: '🖼️',
    nostalgia: 'Remember when you had to use expensive software to resize photos? Now it\'s just a click away!'
  },
  {
    title: '🎨 AI Image Generator',
    desc: 'Turn your imagination into reality with the power of AI! Describe your wildest dreams, and watch them come to life in stunning detail. From fantasy landscapes to futuristic cities, from cute robots to majestic dragons—if you can dream it, you can create it. No artistic skills required, just pure creativity.',
    icon: '🎨',
    nostalgia: 'Remember drawing stick figures? Now you can create masterpieces with just words!'
  },
  {
    title: '🔢AI Number Predictor',
    desc: 'Think of a number between 0 and 99, and let our playful AI try to read your mind! Experience a fun, animated prediction journey with neural networks, quantum algorithms, and a Matrix-inspired effect. It’s not about real mind-reading, but it’s a magical, interactive way to see AI in action!',
    icon: '🔢',
    nostalgia: 'Remember guessing games as a kid? Now, challenge the AI and enjoy the show!'
  }
];

const Home = () => {
  return (
    <div className="home-landing">
      <div className="landing-hero">
        <h1 className="landing-title">multi-tool.io</h1>
        <p className="landing-tagline">One Platform. Smarter Tools. Simpler Life</p>
        <p className="landing-desc">
          Step into the future of digital creativity! Multi-tool.io is your digital Swiss Army knife, 
          combining the nostalgia of classic tools with cutting-edge technology. Whether you're a 
          content creator, student, or just someone who loves making things easier, we've got you covered. 
          No more juggling between different apps—everything you need is right here.
        </p>
        <a href="/tools" className="landing-cta">🚀 Explore Our Tools</a>
      </div>
      
      <div className="landing-features">
        <h2>✨ Our Magical Tools</h2>
        <p className="features-intro">
          Discover tools that blend the comfort of familiar experiences with the excitement of modern innovation. 
          Each tool is crafted with love and designed to make your digital life a little bit more magical.
        </p>
        
        <div className="feature-list">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-content">
                <h3>{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <p className="nostalgia-quote">💭 {f.nostalgia}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="coming-soon-teaser">
          <h3>🔮 Coming Soon: More Magic!</h3>
          <p>
            We're cooking some incredible new tools that will make your jaw drop! 
            From AI-powered video editing to voice cloning technology, the future is bright and full of possibilities. 
            Stay tuned for updates that will revolutionize how you create and share content.
          </p>
          <a href="/tools" className="teaser-cta">Peek into the Future →</a>
        </div>
        
        <div className="video-preview-landing">
          <VideoPreview />
        </div>
        
        <div className="app-download-section">
          <AppDownload />
        </div>
      </div>
    </div>
  );
};

export default Home; 