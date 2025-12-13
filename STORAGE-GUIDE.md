# 🗄️ نظام التخزين الدائم - Persistent Storage System

## 📋 المقدمة

هذا النظام يوفر حلاً شاملاً لحفظ جميع تعديلاتك على التطبيق (الصور، الأصوات، الخلفيات، والإعدادات) بشكل **دائم وآمن**. عندما تغلق التطبيق وتعود إليه لاحقاً، ستجد كل شيء كما تركته تماماً.

---

## ✨ المميزات

✅ **حفظ تلقائي**: جميع التعديلات تُحفظ تلقائياً كل 30 ثانية  
✅ **حفظ عند الإغلاق**: حفظ نهائي عند إغلاق التطبيق  
✅ **دعم ملفات كبيرة**: حتى 10MB للصور و50MB للأصوات  
✅ **بحث سريع**: الوصول الفوري للملفات المحفوظة  
✅ **لا حد أقصى**: تخزين غير محدود (حسب المساحة المتاحة)  
✅ **متوافق**: يعمل على جميع المتصفحات الحديثة  
✅ **آمن**: البيانات محفوظة محلياً على جهازك  

---

## 🚀 كيفية الاستخدام

### 1️⃣ تحميل المكتبات

أضف هذه السطور في ملف `index.html` الخاص بك:

```html
<!-- مكتبات التخزين الدائم -->
<script src="src/storage.js"></script>
<script src="src/fileUploadManager.js"></script>
```

### 2️⃣ حفظ الصور

```javascript
// الطريقة الأولى: باستخدام File Input
const file = document.getElementById('fileInput').files[0];
const imageId = await FileUploadManager.handleImageUpload(file);

// الطريقة الثانية: باستخدام DataURL
const imageId = await storage.saveImage('my-image-1', imageDataUrl, {
    name: 'My Image',
    description: 'وصف الصورة'
});
```

### 3️⃣ تحميل الصور

```javascript
// الحصول على صورة واحدة
const imageData = await storage.getImage('my-image-1');
const dataUrl = await storage.blobToDataURL(imageData.blob);
document.querySelector('img').src = dataUrl;

// الحصول على جميع الصور
const allImages = await storage.getAllImages();
console.log(allImages);
```

### 4️⃣ حفظ الأصوات

```javascript
// حفظ صوت
const soundId = await FileUploadManager.handleSoundUpload(file);

// أو مباشرة
const soundId = await storage.saveSound('adhan-1', soundDataUrl, {
    name: 'صوت الآذان',
    prayerName: 'الفجر'
});
```

### 5️⃣ تحميل الأصوات

```javascript
// الحصول على صوت واحد
const soundData = await storage.getSound('adhan-1');
const dataUrl = await storage.blobToDataURL(soundData.blob);
document.querySelector('audio').src = dataUrl;

// الحصول على جميع الأصوات
const allSounds = await storage.getAllSounds();
```

### 6️⃣ حفظ الخلفيات

```javascript
// حفظ خلفية
const backgroundId = await FileUploadManager.handleBackgroundUpload(file);

// أو مباشرة
const bgId = await storage.saveBackground('bg-prayer', bgDataUrl, {
    name: 'خلفية الصلاة',
    theme: 'dark'
});
```

### 7️⃣ حفظ الإعدادات

```javascript
// حفظ إعدادات التطبيق
const settings = {
    theme: 'dark',
    language: 'ar',
    volume: 0.8,
    prayerTimes: {...},
    userId: 'user-123'
};

await storage.saveSettings(settings);

// استرجاع الإعدادات
const savedSettings = await storage.getSettings();
console.log(savedSettings);
```

### 8️⃣ حذف الملفات

```javascript
// حذف صورة واحدة
await storage.deleteImage('my-image-1');

// حذف صوت واحد
await storage.deleteSound('adhan-1');

// حذف خلفية واحدة
await storage.deleteBackground('bg-prayer');

// حذف جميع البيانات
await storage.clearAllData();
```

---

## 📝 أمثلة عملية

### مثال 1: تحديث خلفية الشاشة

```javascript
// عند اختيار خلفية جديدة
async function updateBackground(file) {
    try {
        // حفظ الخلفية
        const bgId = await FileUploadManager.handleBackgroundUpload(file);
        
        // تحديث الإعدادات
        const settings = await storage.getSettings() || {};
        settings.currentBackground = bgId;
        await storage.saveSettings(settings);
        
        // تطبيق الخلفية
        const dataUrl = await FileUploadManager.loadBackground(bgId);
        document.body.style.backgroundImage = `url('${dataUrl}')`;
        
        alert('✅ تم تحديث الخلفية بنجاح!');
    } catch (error) {
        alert('❌ خطأ: ' + error.message);
    }
}
```

### مثال 2: تحميل صوت الآذان

```javascript
// عند فتح التطبيق
async function initApp() {
    const settings = await storage.getSettings();
    
    if (settings && settings.adhanSoundId) {
        const soundData = await storage.getSound(settings.adhanSoundId);
        if (soundData) {
            const dataUrl = await storage.blobToDataURL(soundData.blob);
            document.getElementById('adhanAudio').src = dataUrl;
        }
    }
}

// عند الصلاة
async function playAdhan(prayerName) {
    const settings = await storage.getSettings();
    const audio = document.getElementById('adhanAudio');
    
    if (audio.src) {
        audio.play();
    }
}
```

### مثال 3: حفظ وتحميل صور متعددة

```javascript
// حفظ عدة صور
async function saveMultipleImages(files) {
    const savedIds = [];
    
    for (const file of files) {
        try {
            const id = await FileUploadManager.handleImageUpload(file);
            savedIds.push(id);
        } catch (error) {
            console.error(`❌ خطأ في حفظ ${file.name}:`, error);
        }
    }
    
    // حفظ قائمة الصور في الإعدادات
    const settings = await storage.getSettings() || {};
    settings.savedImageIds = savedIds;
    await storage.saveSettings(settings);
    
    return savedIds;
}

// تحميل جميع الصور المحفوظة
async function loadAllSavedImages() {
    const settings = await storage.getSettings();
    const images = [];
    
    if (settings && settings.savedImageIds) {
        for (const id of settings.savedImageIds) {
            const imageData = await storage.getImage(id);
            const dataUrl = await storage.blobToDataURL(imageData.blob);
            images.push({ id, dataUrl, ...imageData });
        }
    }
    
    return images;
}
```

---

## 🔍 العمليات الأساسية

### البحث في الملفات

```javascript
// الحصول على قائمة الصور مع البيانات الوصفية
async function getImagesList() {
    const images = await storage.getAllImages();
    return images.map(img => ({
        id: img.id,
        name: img.name,
        size: img.size,
        type: img.type,
        timestamp: new Date(img.timestamp).toLocaleString('ar-SA')
    }));
}

// البحث عن صورة بالاسم
async function searchImages(keyword) {
    const images = await storage.getAllImages();
    return images.filter(img => 
        (img.name || '').toLowerCase().includes(keyword.toLowerCase())
    );
}
```

### الحصول على إحصائيات التخزين

```javascript
async function getStorageStats() {
    const images = await storage.getAllImages();
    const sounds = await storage.getAllSounds();
    const backgrounds = await storage.getAllBackgrounds();
    
    let totalSize = 0;
    images.forEach(img => totalSize += img.size || 0);
    sounds.forEach(sound => totalSize += sound.size || 0);
    backgrounds.forEach(bg => totalSize += bg.size || 0);
    
    return {
        images: images.length,
        sounds: sounds.length,
        backgrounds: backgrounds.length,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
}
```

---

## ⚙️ الخيارات المتقدمة

### تحديد حجم أقصى للملفات

```javascript
// في ملف fileUploadManager.js
// قم بتعديل هذه الأسطر:

// للصور
if (file.size > 10 * 1024 * 1024) { // 10MB
    throw new Error('حجم الصورة يجب أن يكون أقل من 10MB');
}

// للأصوات
if (file.size > 50 * 1024 * 1024) { // 50MB
    throw new Error('حجم الصوت يجب أن يكون أقل من 50MB');
}
```

### إضافة أنواع ملفات جديدة

```javascript
// في ملف fileUploadManager.js
static isValidVideo(file) {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return validTypes.includes(file.type);
}
```

---

## 🎯 حالات الاستخدام الشائعة

### 1. ساعة الآذان الرقمية
- حفظ أصوات الآذان المخصصة
- حفظ صور الخلفيات
- حفظ أوقات الصلاة والإعدادات

### 2. تطبيق المعرض
- حفظ الصور المفضلة
- تنظيم الصور حسب الفئات
- حفظ البيانات الوصفية

### 3. مشغل الموسيقى
- حفظ قوائم التشغيل
- تذكر آخر أغنية تم تشغيلها
- حفظ تفضيلات المستخدم

---

## 📊 مقارنة بين الطرق

| الطريقة | الحد الأقصى | السرعة | الأمان | الاستخدام |
|--------|----------|-------|-------|---------|
| LocalStorage | ~5-10MB | سريع جداً | عالي | الإعدادات البسيطة |
| IndexedDB | غير محدود | سريع | عالي جداً | الملفات الكبيرة |
| SessionStorage | ~5-10MB | سريع جداً | منخفض | البيانات المؤقتة |

**النظام الحالي يستخدم IndexedDB + LocalStorage** ✅

---

## ⚠️ ملاحظات مهمة

1. **الخصوصية**: البيانات محفوظة محلياً على جهازك فقط
2. **النسخ الاحتياطية**: لا تنسَ عمل نسخ احتياطية للملفات المهمة
3. **مساحة التخزين**: افحص مساحة التخزين المتاحة قبل حفظ ملفات كبيرة
4. **توافقية المتصفح**: يدعم جميع المتصفحات الحديثة (Chrome, Firefox, Safari, Edge)
5. **حذف البيانات**: حذف السجل قد يؤدي لفقدان البيانات

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتم حفظ البيانات

**الحل**:
```javascript
// تحقق من فتح قاعدة البيانات
console.log('Database:', storage.db);

// تحقق من أذونات المتصفح
console.log('localStorage:', window.localStorage);
console.log('indexedDB:', window.indexedDB);
```

### المشكلة: الملفات المحفوظة لا تظهر

**الحل**:
```javascript
// تحقق من البيانات المحفوظة
const allData = await storage.getAllImages();
console.log('Saved images:', allData);
```

---

## 📞 الدعم والمساعدة

للمزيد من المعلومات، راجع:
- `storage.js` - مكتبة التخزين الرئيسية
- `fileUploadManager.js` - مدير رفع الملفات
- `storage-demo.html` - مثال عملي كامل

---

**تم تطوير هذا النظام بواسطة:** Al-Moazin Team  
**الإصدار:** 1.0  
**آخر تحديث:** 2025
