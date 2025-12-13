/**
 * نظام التخزين الدائم للتطبيق
 * يحفظ: الصور، الأصوات، الخلفيات، والإعدادات
 */

class StorageManager {
  constructor() {
    this.dbName = 'AlMoazinDB';
    this.dbVersion = 1;
    this.db = null;
    this.initDB();
  }

  /**
   * تهيئة قاعدة البيانات IndexedDB
   */
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('خطأ في فتح قاعدة البيانات');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('تم فتح قاعدة البيانات بنجاح');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // إنشاء الجداول
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sounds')) {
          db.createObjectStore('sounds', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('backgrounds')) {
          db.createObjectStore('backgrounds', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * حفظ صورة
   * @param {string} id - معرّف فريد للصورة
   * @param {File|Blob|DataURL} imageData - بيانات الصورة
   * @param {object} metadata - بيانات إضافية (الاسم، التاريخ، إلخ)
   */
  async saveImage(id, imageData, metadata = {}) {
    try {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');

      // تحويل DataURL إلى Blob إذا لزم الأمر
      let blob = imageData;
      if (typeof imageData === 'string') {
        blob = this.dataURLToBlob(imageData);
      }

      const imageObject = {
        id,
        blob,
        timestamp: new Date().getTime(),
        ...metadata
      };

      return new Promise((resolve, reject) => {
        const request = store.put(imageObject);
        request.onsuccess = () => {
          console.log(`تم حفظ الصورة: ${id}`);
          this.updateLocalStorage('lastImageId', id);
          resolve(id);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حفظ الصورة:', error);
      throw error;
    }
  }

  /**
   * الحصول على صورة
   */
  async getImage(id) {
    try {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الصورة:', error);
      throw error;
    }
  }

  /**
   * حفظ صوت
   */
  async saveSound(id, soundData, metadata = {}) {
    try {
      const transaction = this.db.transaction(['sounds'], 'readwrite');
      const store = transaction.objectStore('sounds');

      let blob = soundData;
      if (typeof soundData === 'string') {
        blob = this.dataURLToBlob(soundData);
      }

      const soundObject = {
        id,
        blob,
        timestamp: new Date().getTime(),
        ...metadata
      };

      return new Promise((resolve, reject) => {
        const request = store.put(soundObject);
        request.onsuccess = () => {
          console.log(`تم حفظ الصوت: ${id}`);
          this.updateLocalStorage('lastSoundId', id);
          resolve(id);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حفظ الصوت:', error);
      throw error;
    }
  }

  /**
   * الحصول على صوت
   */
  async getSound(id) {
    try {
      const transaction = this.db.transaction(['sounds'], 'readonly');
      const store = transaction.objectStore('sounds');

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الصوت:', error);
      throw error;
    }
  }

  /**
   * حفظ خلفية
   */
  async saveBackground(id, backgroundData, metadata = {}) {
    try {
      const transaction = this.db.transaction(['backgrounds'], 'readwrite');
      const store = transaction.objectStore('backgrounds');

      let blob = backgroundData;
      if (typeof backgroundData === 'string') {
        blob = this.dataURLToBlob(backgroundData);
      }

      const backgroundObject = {
        id,
        blob,
        timestamp: new Date().getTime(),
        ...metadata
      };

      return new Promise((resolve, reject) => {
        const request = store.put(backgroundObject);
        request.onsuccess = () => {
          console.log(`تم حفظ الخلفية: ${id}`);
          this.updateLocalStorage('lastBackgroundId', id);
          resolve(id);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حفظ الخلفية:', error);
      throw error;
    }
  }

  /**
   * الحصول على خلفية
   */
  async getBackground(id) {
    try {
      const transaction = this.db.transaction(['backgrounds'], 'readonly');
      const store = transaction.objectStore('backgrounds');

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الخلفية:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الصور
   */
  async getAllImages() {
    try {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الصور:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الأصوات
   */
  async getAllSounds() {
    try {
      const transaction = this.db.transaction(['sounds'], 'readonly');
      const store = transaction.objectStore('sounds');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الأصوات:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الخلفيات
   */
  async getAllBackgrounds() {
    try {
      const transaction = this.db.transaction(['backgrounds'], 'readonly');
      const store = transaction.objectStore('backgrounds');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الخلفيات:', error);
      throw error;
    }
  }

  /**
   * حذف صورة
   */
  async deleteImage(id) {
    try {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log(`تم حذف الصورة: ${id}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
      throw error;
    }
  }

  /**
   * حذف صوت
   */
  async deleteSound(id) {
    try {
      const transaction = this.db.transaction(['sounds'], 'readwrite');
      const store = transaction.objectStore('sounds');

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log(`تم حذف الصوت: ${id}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حذف الصوت:', error);
      throw error;
    }
  }

  /**
   * حذف خلفية
   */
  async deleteBackground(id) {
    try {
      const transaction = this.db.transaction(['backgrounds'], 'readwrite');
      const store = transaction.objectStore('backgrounds');

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log(`تم حذف الخلفية: ${id}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حذف الخلفية:', error);
      throw error;
    }
  }

  /**
   * تحويل DataURL إلى Blob
   */
  dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const mimeType = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mimeType });
  }

  /**
   * تحويل Blob إلى DataURL
   */
  async blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * حفظ الإعدادات في LocalStorage
   */
  updateLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify({
        value,
        timestamp: new Date().getTime()
      }));
    } catch (error) {
      console.error('خطأ في حفظ البيانات في LocalStorage:', error);
    }
  }

  /**
   * الحصول على قيمة من LocalStorage
   */
  getFromLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item).value;
      }
      return null;
    } catch (error) {
      console.error('خطأ في الحصول على البيانات من LocalStorage:', error);
      return null;
    }
  }

  /**
   * حفظ إعدادات التطبيق
   */
  async saveSettings(settings) {
    try {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');

      return new Promise((resolve, reject) => {
        const request = store.put({
          key: 'appSettings',
          value: settings,
          timestamp: new Date().getTime()
        });
        request.onsuccess = () => {
          console.log('تم حفظ الإعدادات');
          this.updateLocalStorage('appSettings', settings);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      throw error;
    }
  }

  /**
   * الحصول على إعدادات التطبيق
   */
  async getSettings() {
    try {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');

      return new Promise((resolve, reject) => {
        const request = store.get('appSettings');
        request.onsuccess = () => {
          resolve(request.result ? request.result.value : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في الحصول على الإعدادات:', error);
      throw error;
    }
  }

  /**
   * حذف جميع البيانات
   */
  async clearAllData() {
    try {
      const transaction = this.db.transaction(['images', 'sounds', 'backgrounds', 'settings'], 'readwrite');

      return new Promise((resolve, reject) => {
        transaction.objectStore('images').clear();
        transaction.objectStore('sounds').clear();
        transaction.objectStore('backgrounds').clear();
        transaction.objectStore('settings').clear();

        transaction.oncomplete = () => {
          console.log('تم حذف جميع البيانات');
          localStorage.clear();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      throw error;
    }
  }
}

// إنشاء نسخة عامة من StorageManager
const storage = new StorageManager();

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storage;
}
