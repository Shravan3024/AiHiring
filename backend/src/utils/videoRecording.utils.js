/**
 * Video Recording Handler - Phase 5
 * Manages WebRTC recording, compression, and storage
 */

// ==================== MEDIA RECORDER SETUP ====================

class VideoRecorder {
  constructor(options = {}) {
    this.mimeType = options.mimeType || 'video/webm;codecs=vp9';
    this.audioBitsPerSecond = options.audioBitsPerSecond || 128000;
    this.videoBitsPerSecond = options.videoBitsPerSecond || 2500000;
    this.chunks = [];
    this.mediaRecorder = null;
    this.stream = null;
    this.isRecording = false;
    this.startTime = null;
    this.pauseTime = null;
    this.totalPausedTime = 0;
  }

  /**
   * Initialize recorder with media stream
   */
  async init(constraints = {}) {
    try {
      const defaultConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        ...constraints
      };

      this.stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      this.setupMediaRecorder();
      return { success: true, stream: this.stream };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get media: ${error.message}`
      };
    }
  }

  /**
   * Setup MediaRecorder with optimal settings
   */
  setupMediaRecorder() {
    if (!this.stream) return;

    // Use supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    let selectedMimeType = this.mimeType;
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        break;
      }
    }

    const options = {
      mimeType: selectedMimeType,
      audioBitsPerSecond: this.audioBitsPerSecond,
      videoBitsPerSecond: this.videoBitsPerSecond
    };

    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
    };
  }

  /**
   * Start recording
   */
  start() {
    if (!this.mediaRecorder) return { success: false, error: 'Recorder not initialized' };

    if (this.mediaRecorder.state === 'recording') {
      return { success: false, error: 'Already recording' };
    }

    this.chunks = [];
    this.startTime = Date.now();
    this.totalPausedTime = 0;
    this.mediaRecorder.start();
    this.isRecording = true;

    return { success: true, message: 'Recording started' };
  }

  /**
   * Pause recording
   */
  pause() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return { success: false, error: 'Not recording' };
    }

    this.pauseTime = Date.now();
    this.mediaRecorder.pause();

    return { success: true, message: 'Recording paused' };
  }

  /**
   * Resume recording
   */
  resume() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'paused') {
      return { success: false, error: 'Not paused' };
    }

    if (this.pauseTime) {
      this.totalPausedTime += Date.now() - this.pauseTime;
      this.pauseTime = null;
    }

    this.mediaRecorder.resume();

    return { success: true, message: 'Recording resumed' };
  }

  /**
   * Stop recording and return blob
   */
  stop() {
    if (!this.mediaRecorder) return { success: false, error: 'Recorder not initialized' };

    if (this.mediaRecorder.state === 'inactive') {
      return { success: false, error: 'Not recording' };
    }

    const stopPromise = new Promise(resolve => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mediaRecorder.mimeType
        });

        const duration = this.getDuration();

        resolve({
          blob,
          mimeType: this.mediaRecorder.mimeType,
          duration
        });
      };

      this.mediaRecorder.stop();
    });

    this.isRecording = false;

    return stopPromise;
  }

  /**
   * Get recording duration in seconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime - this.totalPausedTime) / 1000);
  }

  /**
   * Stop all media tracks
   */
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Get blob as data URL
   */
  getBlobAsDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get blob as base64
   */
  getBlobAsBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// ==================== SPEECH RECOGNITION ====================

class SpeechTranscriber {
  constructor(language = 'en-US') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported');
    }

    this.recognition = new SpeechRecognition();
    this.language = language;
    this.transcript = '';
    this.interimTranscript = '';
    this.isListening = false;
    this.confidence = 0;

    this.setupRecognition();
  }

  /**
   * Configure speech recognition
   */
  setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.language = this.language;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      this.interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        const confidence = event.results[i][0].confidence;

        if (isFinal) {
          this.transcript += (this.transcript ? ' ' : '') + transcript;
          this.confidence = Math.max(this.confidence, confidence);
        } else {
          this.interimTranscript += transcript;
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  /**
   * Start listening
   */
  start() {
    if (this.isListening) return { success: false, error: 'Already listening' };

    this.transcript = '';
    this.interimTranscript = '';
    this.confidence = 0;

    try {
      this.recognition.start();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop listening
   */
  stop() {
    this.recognition.stop();
    return {
      transcript: this.transcript,
      confidence: Math.round(this.confidence * 100),
      wordCount: this.transcript.split(/\s+/).length
    };
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return this.transcript + this.interimTranscript;
  }

  /**
   * Abort recognition
   */
  abort() {
    this.recognition.abort();
    this.isListening = false;
  }
}

// ==================== CANVAS RECORDING ====================

class CanvasRecorder {
  constructor(canvas, fps = 30) {
    this.canvas = canvas;
    this.fps = fps;
    this.frameInterval = 1000 / fps;
    this.stream = null;
    this.mediaRecorder = null;
    this.isRecording = false;
    this.startTime = null;
    this.lastFrameTime = 0;
    this.chunks = [];
  }

  /**
   * Start canvas recording
   */
  start() {
    try {
      // Get canvas stream
      this.stream = this.canvas.captureStream(this.fps);
      this.setupMediaRecorder();
      this.mediaRecorder.start();
      this.isRecording = true;
      this.startTime = Date.now();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup media recorder for canvas
   */
  setupMediaRecorder() {
    this.chunks = [];

    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    };

    // Fallback for unsupported codec
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
  }

  /**
   * Stop canvas recording
   */
  stop() {
    if (!this.mediaRecorder) {
      return { success: false, error: 'Not recording' };
    }

    return new Promise(resolve => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        this.isRecording = false;
        this.stream.getTracks().forEach(track => track.stop());

        resolve({
          success: true,
          blob,
          duration
        });
      };

      this.mediaRecorder.stop();
    });
  }
}

// ==================== AUDIO PROCESSING ====================

class AudioProcessor {
  constructor(audioContext) {
    this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
  }

  /**
   * Setup audio analysis from stream
   */
  setupFromStream(stream) {
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    this.source.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  /**
   * Detect silence
   */
  detectSilence(threshold = 30) {
    if (!this.analyser) return false;

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }

    const average = sum / this.dataArray.length;
    return average < threshold;
  }

  /**
   * Get audio level (0-100)
   */
  getAudioLevel() {
    if (!this.analyser) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }

    return Math.round((sum / this.dataArray.length) * (100 / 255));
  }

  /**
   * Get frequency data
   */
  getFrequencyData() {
    if (!this.analyser) return null;

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

// ==================== EXPORTS ====================

module.exports = {
  VideoRecorder,
  SpeechTranscriber,
  CanvasRecorder,
  AudioProcessor
};
