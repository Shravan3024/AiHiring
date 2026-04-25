/**
 * API Key Rotator Utility
 * Handles multiple API keys for Google Generative AI to avoid rate limits.
 */
const logger = require('./logger');

class KeyRotator {
  constructor() {
    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    this.keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
    this.currentIndex = 0;
    
    if (this.keys.length === 0) {
      logger.error("No Gemini API keys found in environment variables!");
    } else {
      logger.info(`KeyRotator initialized with ${this.keys.length} keys.`);
    }
  }

  /**
   * Get the next API key in the rotation
   */
  getNextKey() {
    if (this.keys.length === 0) return null;
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }

  /**
   * Get a random API key
   */
  getRandomKey() {
    if (this.keys.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.keys.length);
    return this.keys[randomIndex];
  }

  /**
   * Get all keys
   */
  getAllKeys() {
    return this.keys;
  }
}

module.exports = new KeyRotator();
