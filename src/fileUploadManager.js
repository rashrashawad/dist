/**
 * مساعد لإدارة رفع والتعامل مع الملفات
 */

class FileUploadManager {
  /**
   * التعامل مع رفع الصور
   */
  static async handleImageUpload(file) {
    if (!file) return null;

    if (!this.isValidImage(file)) {
      throw new Error('الملف يجب أن يكون صورة صحيحة (JPG, PNG, GIF, WebP)');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('حجم الصورة يجب أن يكون أقل من 10MB');
    }

    const id = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataURL = await this.fileToDataURL(file);

    await storage.saveImage(id, dataURL, {
      name: file.name,
      size: file.size,
      type: file.type
    });

    return id;
  }

  /**
   * التعامل مع رفع الأصوات
   */
  static async handleSoundUpload(file) {
    if (!file) return null;

    if (!this.isValidAudio(file)) {
      throw new Error('الملف يجب أن يكون صوت صحيح (MP3, WAV, OGG, M4A)');
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      throw new Error('حجم الصوت يجب أن يكون أقل من 50MB');
    }

    const id = `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataURL = await this.fileToDataURL(file);

    await storage.saveSound(id, dataURL, {
      name: file.name,
      size: file.size,
      type: file.type
    });

    return id;
  }

  /**
   * التعامل مع رفع الخلفيات
   */
  static async handleBackgroundUpload(file) {
    if (!file) return null;

    if (!this.isValidImage(file)) {
      throw new Error('الملف يجب أن يكون صورة صحيحة (JPG, PNG, GIF, WebP)');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('حجم الخلفية يجب أن يكون أقل من 10MB');
    }

    const id = `background_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataURL = await this.fileToDataURL(file);

    await storage.saveBackground(id, dataURL, {
      name: file.name,
      size: file.size,
      type: file.type
    });

    return id;
  }

  /**
   * التحقق من نوع الصورة
   */
  static isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * التحقق من نوع الصوت
   */
  static isValidAudio(file) {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    return validTypes.includes(file.type);
  }

  /**
   * تحويل الملف إلى DataURL
   */
  static fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * تحميل صورة محفوظة
   */
  static async loadImage(imageId) {
    const imageData = await storage.getImage(imageId);
    if (imageData) {
      return await storage.blobToDataURL(imageData.blob);
    }
    return null;
  }

  /**
   * تحميل صوت محفوظ
   */
  static async loadSound(soundId) {
    const soundData = await storage.getSound(soundId);
    if (soundData) {
      return await storage.blobToDataURL(soundData.blob);
    }
    return null;
  }

  /**
   * تحميل خلفية محفوظة
   */
  static async loadBackground(backgroundId) {
    const backgroundData = await storage.getBackground(backgroundId);
    if (backgroundData) {
      return await storage.blobToDataURL(backgroundData.blob);
    }
    return null;
  }

  /**
   * حذف صورة
   */
  static async deleteImage(imageId) {
    await storage.deleteImage(imageId);
  }

  /**
   * حذف صوت
   */
  static async deleteSound(soundId) {
    await storage.deleteSound(soundId);
  }

  /**
   * حذف خلفية
   */
  static async deleteBackground(backgroundId) {
    await storage.deleteBackground(backgroundId);
  }

  /**
   * الحصول على قائمة الصور المحفوظة
   */
  static async getImagesList() {
    const images = await storage.getAllImages();
    return images.map(img => ({
      id: img.id,
      name: img.name,
      size: img.size,
      timestamp: img.timestamp,
      type: img.type
    }));
  }

  /**
   * الحصول على قائمة الأصوات المحفوظة
   */
  static async getSoundsList() {
    const sounds = await storage.getAllSounds();
    return sounds.map(sound => ({
      id: sound.id,
      name: sound.name,
      size: sound.size,
      timestamp: sound.timestamp,
      type: sound.type
    }));
  }

  /**
   * الحصول على قائمة الخلفيات المحفوظة
   */
  static async getBackgroundsList() {
    const backgrounds = await storage.getAllBackgrounds();
    return backgrounds.map(bg => ({
      id: bg.id,
      name: bg.name,
      size: bg.size,
      timestamp: bg.timestamp,
      type: bg.type
    }));
  }
}

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileUploadManager;
}
