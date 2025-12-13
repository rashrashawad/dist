/**
 * 🔌 ملف التكامل السريع
 * يوضح كيفية دمج نظام التخزين الدائم في التطبيق الموجود
 */

// ============================================================
// 1️⃣ تحميل النظام عند بدء التطبيق
// ============================================================

async function setupPersistentStorage() {
    console.log('🔧 تحضير نظام التخزين الدائم...');
    
    try {
        // انتظر تهيئة قاعدة البيانات
        await new Promise(resolve => {
            const checkDB = setInterval(() => {
                if (storage && storage.db) {
                    clearInterval(checkDB);
                    resolve();
                }
            }, 100);
        });
        
        console.log('✅ نظام التخزين جاهز للعمل');
    } catch (error) {
        console.error('❌ خطأ في تحضير التخزين:', error);
    }
}

// استدعاء عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPersistentStorage);
} else {
    setupPersistentStorage();
}

// ============================================================
// 2️⃣ حفظ الخلفيات
// ============================================================

/**
 * عند اختيار خلفية جديدة
 */
async function saveNewBackground(file) {
    try {
        // حفظ الخلفية
        const backgroundId = await FileUploadManager.handleBackgroundUpload(file);
        console.log('✅ تم حفظ الخلفية:', backgroundId);
        
        // تحديث الإعدادات
        const settings = await storage.getSettings() || {};
        settings.currentBackgroundId = backgroundId;
        settings.lastBackgroundUpdate = new Date().getTime();
        
        await storage.saveSettings(settings);
        
        // تطبيق الخلفية على الصفحة
        await applyBackground(backgroundId);
        
        return backgroundId;
    } catch (error) {
        console.error('❌ خطأ في حفظ الخلفية:', error);
        throw error;
    }
}

/**
 * تطبيق خلفية محفوظة
 */
async function applyBackground(backgroundId) {
    try {
        const backgroundData = await storage.getBackground(backgroundId);
        if (backgroundData) {
            const dataUrl = await storage.blobToDataURL(backgroundData.blob);
            
            // طريقة 1: تطبيق على الـ body
            document.body.style.backgroundImage = `url('${dataUrl}')`;
            
            // طريقة 2: تطبيق على عنصر معين
            if (document.getElementById('backgroundElement')) {
                document.getElementById('backgroundElement').style.backgroundImage = `url('${dataUrl}')`;
            }
            
            console.log('✅ تم تطبيق الخلفية');
        }
    } catch (error) {
        console.error('❌ خطأ في تطبيق الخلفية:', error);
    }
}

/**
 * تحميل آخر خلفية محفوظة عند فتح التطبيق
 */
async function loadLastBackground() {
    try {
        const settings = await storage.getSettings();
        
        if (settings && settings.currentBackgroundId) {
            await applyBackground(settings.currentBackgroundId);
            console.log('✅ تم تحميل آخر خلفية');
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل الخلفية:', error);
    }
}

// ============================================================
// 3️⃣ حفظ الأصوات (آذان، تنبيهات، إلخ)
// ============================================================

/**
 * حفظ صوت آذان مخصص
 */
async function saveCustomAdhanSound(file, prayerName) {
    try {
        const soundId = await FileUploadManager.handleSoundUpload(file);
        console.log(`✅ تم حفظ صوت ${prayerName}:`, soundId);
        
        // تحديث الإعدادات
        const settings = await storage.getSettings() || {};
        
        if (!settings.prayerSounds) {
            settings.prayerSounds = {};
        }
        
        settings.prayerSounds[prayerName] = {
            soundId,
            uploadedAt: new Date().getTime(),
            fileName: file.name
        };
        
        await storage.saveSettings(settings);
        
        return soundId;
    } catch (error) {
        console.error(`❌ خطأ في حفظ صوت ${prayerName}:`, error);
        throw error;
    }
}

/**
 * تشغيل صوت آذان مخصص
 */
async function playCustomAdhanSound(prayerName) {
    try {
        const settings = await storage.getSettings();
        
        if (settings && settings.prayerSounds && settings.prayerSounds[prayerName]) {
            const soundId = settings.prayerSounds[prayerName].soundId;
            const soundData = await storage.getSound(soundId);
            
            if (soundData) {
                const dataUrl = await storage.blobToDataURL(soundData.blob);
                const audio = document.getElementById('audioRef') || new Audio();
                audio.src = dataUrl;
                audio.play();
                
                console.log(`✅ جاري تشغيل صوت ${prayerName}`);
            }
        }
    } catch (error) {
        console.error(`❌ خطأ في تشغيل صوت ${prayerName}:`, error);
    }
}

/**
 * حفظ صوت تنبيه مخصص
 */
async function saveAlertSound(file) {
    try {
        const soundId = await FileUploadManager.handleSoundUpload(file);
        
        const settings = await storage.getSettings() || {};
        settings.alertSoundId = soundId;
        
        await storage.saveSettings(settings);
        
        return soundId;
    } catch (error) {
        console.error('❌ خطأ في حفظ صوت التنبيه:', error);
        throw error;
    }
}

// ============================================================
// 4️⃣ حفظ الصور
// ============================================================

/**
 * حفظ صورة شخصية أو صورة الجهاز
 */
async function saveDeviceImage(file) {
    try {
        const imageId = await FileUploadManager.handleImageUpload(file);
        
        const settings = await storage.getSettings() || {};
        settings.deviceImageId = imageId;
        settings.deviceImageName = file.name;
        
        await storage.saveSettings(settings);
        
        return imageId;
    } catch (error) {
        console.error('❌ خطأ في حفظ صورة الجهاز:', error);
        throw error;
    }
}

/**
 * تطبيق صورة الجهاز على الشاشة
 */
async function applyDeviceImage(imageId) {
    try {
        const imageData = await storage.getImage(imageId);
        if (imageData) {
            const dataUrl = await storage.blobToDataURL(imageData.blob);
            
            if (document.getElementById('deviceImage')) {
                document.getElementById('deviceImage').src = dataUrl;
            }
            
            console.log('✅ تم تطبيق صورة الجهاز');
        }
    } catch (error) {
        console.error('❌ خطأ في تطبيق صورة الجهاز:', error);
    }
}

// ============================================================
// 5️⃣ حفظ الإعدادات الشاملة
// ============================================================

/**
 * حفظ كل الإعدادات مرة واحدة
 */
async function saveAllSettings(settingsObject) {
    try {
        // الحصول على الإعدادات الموجودة
        const currentSettings = await storage.getSettings() || {};
        
        // دمج الإعدادات الجديدة
        const mergedSettings = {
            ...currentSettings,
            ...settingsObject,
            lastSaved: new Date().getTime()
        };
        
        // حفظ الإعدادات
        await storage.saveSettings(mergedSettings);
        
        console.log('✅ تم حفظ جميع الإعدادات:', mergedSettings);
        
        return mergedSettings;
    } catch (error) {
        console.error('❌ خطأ في حفظ الإعدادات:', error);
        throw error;
    }
}

/**
 * تحميل كل الإعدادات
 */
async function loadAllSettings() {
    try {
        const settings = await storage.getSettings() || {
            theme: 'dark',
            language: 'ar',
            volume: 0.8,
            notifications: true
        };
        
        console.log('✅ تم تحميل الإعدادات:', settings);
        
        return settings;
    } catch (error) {
        console.error('❌ خطأ في تحميل الإعدادات:', error);
        return {};
    }
}

/**
 * تحديث إعداد واحد فقط
 */
async function updateSetting(key, value) {
    try {
        const settings = await storage.getSettings() || {};
        settings[key] = value;
        settings.lastSaved = new Date().getTime();
        
        await storage.saveSettings(settings);
        
        console.log(`✅ تم تحديث الإعداد: ${key} = ${value}`);
        
        return settings;
    } catch (error) {
        console.error(`❌ خطأ في تحديث الإعداد ${key}:`, error);
        throw error;
    }
}

// ============================================================
// 6️⃣ إدارة الملفات المتعددة
// ============================================================

/**
 * حفظ عدة صور
 */
async function saveMultipleImages(files) {
    const results = {
        success: [],
        failed: []
    };
    
    for (const file of files) {
        try {
            const imageId = await FileUploadManager.handleImageUpload(file);
            results.success.push({ name: file.name, id: imageId });
        } catch (error) {
            results.failed.push({ name: file.name, error: error.message });
        }
    }
    
    console.log('📸 نتائج حفظ الصور:', results);
    
    return results;
}

/**
 * حذف عدة صور
 */
async function deleteMultipleImages(imageIds) {
    for (const id of imageIds) {
        try {
            await FileUploadManager.deleteImage(id);
        } catch (error) {
            console.error(`❌ خطأ في حذف الصورة ${id}:`, error);
        }
    }
}

/**
 * الحصول على قائمة الملفات المحفوظة
 */
async function getStoredFilesList() {
    try {
        const images = await FileUploadManager.getImagesList();
        const sounds = await FileUploadManager.getSoundsList();
        const backgrounds = await FileUploadManager.getBackgroundsList();
        
        return {
            images,
            sounds,
            backgrounds,
            total: images.length + sounds.length + backgrounds.length
        };
    } catch (error) {
        console.error('❌ خطأ في الحصول على قائمة الملفات:', error);
        return null;
    }
}

// ============================================================
// 7️⃣ حفظ تلقائي دوري
// ============================================================

/**
 * نظام الحفظ التلقائي
 */
class AutoSaveManager {
    constructor(intervalSeconds = 30) {
        this.intervalSeconds = intervalSeconds;
        this.isDirty = false;
        this.pendingData = {};
        
        this.startAutoSave();
    }
    
    markDirty() {
        this.isDirty = true;
    }
    
    setPendingData(key, value) {
        this.pendingData[key] = value;
        this.markDirty();
    }
    
    startAutoSave() {
        setInterval(async () => {
            if (this.isDirty) {
                try {
                    await saveAllSettings(this.pendingData);
                    this.isDirty = false;
                    this.pendingData = {};
                    console.log('💾 تم الحفظ التلقائي');
                } catch (error) {
                    console.error('❌ خطأ في الحفظ التلقائي:', error);
                }
            }
        }, this.intervalSeconds * 1000);
    }
}

// إنشاء مدير الحفظ التلقائي
const autoSave = new AutoSaveManager(30);

// ============================================================
// 8️⃣ أمثلة التكامل مع الأحداث
// ============================================================

/**
 * عند تغيير الخلفية
 */
function onBackgroundChange(fileInput) {
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await saveNewBackground(file);
                alert('✅ تم حفظ الخلفية بنجاح!');
            } catch (error) {
                alert('❌ خطأ: ' + error.message);
            }
        }
    });
}

/**
 * عند تغيير صوت الآذان
 */
function onAdhanSoundChange(prayerName, fileInput) {
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await saveCustomAdhanSound(file, prayerName);
                alert(`✅ تم حفظ صوت ${prayerName} بنجاح!`);
            } catch (error) {
                alert('❌ خطأ: ' + error.message);
            }
        }
    });
}

/**
 * عند تغيير مستوى الصوت
 */
function onVolumeChange(volumeSlider) {
    volumeSlider.addEventListener('input', async (e) => {
        const volume = e.target.value;
        autoSave.setPendingData('volume', volume);
    });
}

/**
 * عند تبديل المظهر (داكن/فاتح)
 */
function onThemeToggle(themeButton) {
    themeButton.addEventListener('click', async (e) => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark');
        
        autoSave.setPendingData('theme', newTheme);
    });
}

// ============================================================
// 9️⃣ التنظيف والصيانة
// ============================================================

/**
 * حذف الملفات القديمة (أكثر من 30 يوم)
 */
async function deleteOldFiles(daysOld = 30) {
    const oneDay = 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - (daysOld * oneDay);
    
    const images = await storage.getAllImages();
    const sounds = await storage.getAllSounds();
    const backgrounds = await storage.getAllBackgrounds();
    
    let deletedCount = 0;
    
    // حذف الصور القديمة
    for (const img of images) {
        if (img.timestamp < cutoffTime) {
            await storage.deleteImage(img.id);
            deletedCount++;
        }
    }
    
    // حذف الأصوات القديمة
    for (const sound of sounds) {
        if (sound.timestamp < cutoffTime) {
            await storage.deleteSound(sound.id);
            deletedCount++;
        }
    }
    
    // حذف الخلفيات القديمة
    for (const bg of backgrounds) {
        if (bg.timestamp < cutoffTime) {
            await storage.deleteBackground(bg.id);
            deletedCount++;
        }
    }
    
    console.log(`🗑️ تم حذف ${deletedCount} ملفات قديمة`);
    
    return deletedCount;
}

/**
 * عرض إحصائيات التخزين
 */
async function showStorageStats() {
    try {
        const images = await storage.getAllImages();
        const sounds = await storage.getAllSounds();
        const backgrounds = await storage.getAllBackgrounds();
        
        let totalSize = 0;
        images.forEach(img => totalSize += img.size || 0);
        sounds.forEach(sound => totalSize += sound.size || 0);
        backgrounds.forEach(bg => totalSize += bg.size || 0);
        
        const stats = {
            images: {
                count: images.length,
                size: (images.reduce((sum, img) => sum + (img.size || 0), 0) / (1024 * 1024)).toFixed(2) + ' MB'
            },
            sounds: {
                count: sounds.length,
                size: (sounds.reduce((sum, sound) => sum + (sound.size || 0), 0) / (1024 * 1024)).toFixed(2) + ' MB'
            },
            backgrounds: {
                count: backgrounds.length,
                size: (backgrounds.reduce((sum, bg) => sum + (bg.size || 0), 0) / (1024 * 1024)).toFixed(2) + ' MB'
            },
            total: {
                count: images.length + sounds.length + backgrounds.length,
                sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            }
        };
        
        console.log('📊 إحصائيات التخزين:', stats);
        
        return stats;
    } catch (error) {
        console.error('❌ خطأ في حساب الإحصائيات:', error);
        return null;
    }
}

// ============================================================
// ✅ تصدير الدوال للاستخدام العام
// ============================================================

window.persistentStorageAPI = {
    // الخلفيات
    saveNewBackground,
    applyBackground,
    loadLastBackground,
    
    // الأصوات
    saveCustomAdhanSound,
    playCustomAdhanSound,
    saveAlertSound,
    
    // الصور
    saveDeviceImage,
    applyDeviceImage,
    
    // الإعدادات
    saveAllSettings,
    loadAllSettings,
    updateSetting,
    
    // الملفات المتعددة
    saveMultipleImages,
    deleteMultipleImages,
    getStoredFilesList,
    
    // الصيانة
    deleteOldFiles,
    showStorageStats,
    
    // الحفظ التلقائي
    autoSave
};

console.log('✅ تم تحميل API التخزين الدائم');
console.log('استخدمها كالتالي: window.persistentStorageAPI.functionName()');
