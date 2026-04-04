import Tesseract from 'tesseract.js';

/**
 * Service for OCR using Tesseract.js
 * Browser-based, no API keys needed!
 */
class OCRService {
  constructor() {
    this.isProcessing = false;
  }

  /**
   * Extract text from an image file
   * @param {File} imageFile - The image file to process
   * @param {string} language - Language code (default: 'eng')
   * @returns {Promise<{text: string, confidence: number, success: boolean, error?: string}>}
   */
  async extractText(imageFile, language = 'eng') {
    try {
      this.isProcessing = true;

      const result = await Tesseract.recognize(
        imageFile,
        language,
        {
          logger: (m) => {
            console.log(`OCR Progress: ${m.status} - ${Math.round(m.progress * 100)}%`);
          },
        }
      );

      this.isProcessing = false;

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        success: true,
        words: result.data.words,
      };
    } catch (error) {
      this.isProcessing = false;
      console.error('OCR Error:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message || 'Failed to process image',
      };
    }
  }

  /**
   * Extract text from multiple images
   * @param {File[]} imageFiles - Array of image files
   * @param {string} language - Language code
   * @returns {Promise<Array<{text: string, confidence: number, success: boolean}>>}
   */
  async extractTextFromMultiple(imageFiles, language = 'eng') {
    const promises = imageFiles.map((file) => this.extractText(file, language));
    return Promise.all(promises);
  }

  /**
   * Extract text from an image URL
   * @param {string} imageUrl - URL of the image
   * @param {string} language - Language code
   * @returns {Promise<{text: string, confidence: number, success: boolean}>}
   */
  async extractTextFromUrl(imageUrl, language = 'eng') {
    try {
      this.isProcessing = true;

      const result = await Tesseract.recognize(imageUrl, language, {
        logger: (m) => console.log(`OCR Progress: ${m.status}`),
      });

      this.isProcessing = false;

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        success: true,
      };
    } catch (error) {
      this.isProcessing = false;
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get supported languages
   * @returns {Array<{code: string, name: string}>}
   */
  getSupportedLanguages() {
    return [
      { code: 'eng', name: 'English' },
      { code: 'spa', name: 'Spanish' },
      { code: 'fra', name: 'French' },
      { code: 'deu', name: 'German' },
      { code: 'ita', name: 'Italian' },
      { code: 'por', name: 'Portuguese' },
      { code: 'rus', name: 'Russian' },
      { code: 'chi_sim', name: 'Chinese (Simplified)' },
      { code: 'chi_tra', name: 'Chinese (Traditional)' },
      { code: 'jpn', name: 'Japanese' },
      { code: 'kor', name: 'Korean' },
      { code: 'ara', name: 'Arabic' },
      { code: 'hin', name: 'Hindi' },
      { code: 'tha', name: 'Thai' },
      { code: 'vie', name: 'Vietnamese' },
      // Add more as needed
    ];
  }

  /**
   * Check if file is a valid image
   * @param {File} file
   * @returns {boolean}
   */
  isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
    return validTypes.includes(file.type);
  }

  /**
   * Preprocess image to improve OCR accuracy
   * Note: This is a placeholder - actual preprocessing would require Canvas API
   * @param {HTMLCanvasElement} canvas
   * @returns {HTMLCanvasElement}
   */
  preprocessImage(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const contrast = 1.5;
      const factor = (259 * (contrast * 256 + 255)) / (255 * (259 - contrast * 256));

      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}

// Export singleton instance
export const ocrService = new OCRService();

export default ocrService;
