import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './SmileCam.css';
import PaymentModal from '../PaymentModal/PaymentModal';

const SmileCam = () => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [cameraMode, setCameraMode] = useState('environment'); // 'environment' for rear, 'user' for front
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [modalStep, setModalStep] = useState(1); // 1: device, 2: camera (if mobile)
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const videoRef = useRef();
  const canvasRef = useRef();
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  const startCamera = async () => {
    try {
      setCameraError('');
      
      const constraints = {
        video: {
          facingMode: cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Failed to access camera. Please check permissions and try again.');
      
      // Try fallback to front camera if rear camera fails
      if (cameraMode === 'environment' && isMobile) {
        setCameraMode('user');
        setTimeout(() => startCamera(), 1000);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = () => {
    if (stream) {
      stopCamera();
      setCameraMode(cameraMode === 'environment' ? 'user' : 'environment');
      setTimeout(() => startCamera(), 500);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      setCapturedImage(blob);
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(capturePhoto, 100); // Small delay to ensure video is ready
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    processImage();
  };

  const processImage = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setProcessingResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setProcessingResult({
          success: false,
          error: 'Please log in to analyze images'
        });
        return;
      }

      const formData = new FormData();
      formData.append('image', capturedImage, 'capture.jpg');

      const response = await axios.post(`${API_BASE_URL}/smilecam/capture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setProcessingResult(response.data);
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      console.error('Image processing error:', error);
      
      if (error.response?.status === 401) {
        setProcessingResult({
          success: false,
          error: 'Please log in to analyze images'
        });
      } else if (error.response?.status === 402) {
        setIsPaymentModalOpen(true);
      } else {
        setProcessingResult({
          success: false,
          error: error.response?.data?.error || 'Failed to process image'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = async () => {
    setCapturedImage(null);
    setProcessingResult(null);
    
    // Reinitialize camera stream
    try {
      if (!stream) {
        const constraints = {
          video: {
            facingMode: cameraMode
          }
        };
        
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } else {
        // If stream exists, just reattach it
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error reinitializing camera:', error);
      setCameraError('Failed to reinitialize camera. Please refresh the page.');
    }
  };

  const downloadImage = () => {
    if (!capturedImage) return;
    const url = URL.createObjectURL(capturedImage);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smilecam_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    if (device === 'mobile') {
      setModalStep(2);
    } else {
      setCameraMode('user');
      setShowModal(false);
      setTimeout(() => startCamera(), 300);
    }
  };

  const handleCameraSelect = (mode) => {
    setCameraMode(mode);
    setShowModal(false);
    setTimeout(() => startCamera(), 300);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="smilecam">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            {modalStep === 1 && (
              <>
                <h2>Welcome to SmileCam</h2>
                <p>Please confirm your device type:</p>
                <div className="modal-btn-group">
                  <button className="modal-btn" onClick={() => handleDeviceSelect('laptop')}>💻 Laptop / PC</button>
                  <button className="modal-btn" onClick={() => handleDeviceSelect('mobile')}>📱 Mobile</button>
                </div>
              </>
            )}
            {modalStep === 2 && (
              <>
                <h2>Choose Camera</h2>
                <p>Which camera would you like to use?</p>
                <div className="modal-btn-group">
                  <button className="modal-btn" onClick={() => handleCameraSelect('user')}>🤳 Front Camera</button>
                  <button className="modal-btn" onClick={() => handleCameraSelect('environment')}>📷 Back Camera</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="camera-container">
        {!stream && !capturedImage && (
          <div className="camera-start">
            <div className="camera-icon">📸</div>
            <h3>Start Camera</h3>
            <p>Click the button below to start your camera</p>
            <button className="start-button" onClick={startCamera}>
              Start Camera
            </button>
          </div>
        )}

        {cameraError && (
          <div className="camera-error">
            <div className="error-icon">⚠️</div>
            <p>{cameraError}</p>
            <button className="retry-button" onClick={startCamera}>
              Try Again
            </button>
          </div>
        )}

        {stream && !capturedImage && (
          <div className="camera-view">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            
            <div className="camera-controls">
              {isMobile && (
                <button className="switch-camera-button" onClick={switchCamera}>
                  {cameraMode === 'environment' ? '📱 Front' : '📷 Rear'}
                </button>
              )}
              
              <button 
                className="capture-button"
                onClick={handleCapture}
                disabled={isCapturing}
              >
                {isCapturing ? 'Capturing...' : '📸 Capture'}
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="captured-view">
            <img 
              src={URL.createObjectURL(capturedImage)} 
              alt="Captured" 
              className="captured-image"
            />
            
            <div className="capture-controls">
              <button className="retake-button" onClick={retakePhoto}>
                🔄 Retake
              </button>
              
              <button 
                className="process-button"
                onClick={processImage}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : '🔍 Analyze'}
              </button>
              
              <button className="download-button" onClick={downloadImage}>
                💾 Download
              </button>
            </div>
          </div>
        )}

        {processingResult && !isPaymentModalOpen && (
          <div className={`processing-result ${processingResult.success ? 'success' : 'error'}`}>
            {processingResult.success ? (
              <>
                <h4>Analysis Complete!</h4>
                <div className="expression-details">
                  <p><strong>Smile Detected:</strong> {processingResult.expressions.smile}</p>
                  <p><strong>Confidence:</strong> {processingResult.expressions.confidence}%</p>
                </div>
              </>
            ) : (
              <>
                <h4>Analysis Failed</h4>
                <p>{processingResult.error}</p>
              </>
            )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="camera-info">
        <h3>📸 SmileCam Features</h3>
        <ul>
          <li>Real-time camera capture</li>
          <li>Mobile-optimized (rear/front camera support)</li>
          <li>Facial expression detection</li>
          <li>High-quality image capture</li>
          <li>Download captured photos</li>
        </ul>
      </div>
    </div>
  );
};

export default SmileCam; 