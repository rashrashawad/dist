import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [lockTime, setLockTime] = useState(5); // القيمة الافتراضية 5 دقائق
  const [isServiceActive, setIsServiceActive] = useState(false);

  useEffect(() => {
    // تحميل الإعدادات المحفوظة عند بدء التطبيق
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTime = await AsyncStorage.getItem('lockScreenTime');
      if (savedTime !== null) {
        setLockTime(parseInt(savedTime, 10));
      }

      const savedStatus = await AsyncStorage.getItem('serviceActive');
      if (savedStatus !== null) {
        setIsServiceActive(savedStatus === 'true');
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('lockScreenTime', lockTime.toString());
      await AsyncStorage.setItem('serviceActive', isServiceActive.toString());
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_SETTINGS,
          PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW,
        ]);

        if (
          granted['android.permission.WRITE_SETTINGS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.SYSTEM_ALERT_WINDOW'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert('صلاحيات مطلوبة', 'يجب منح جميع الصلاحيات ليعمل التطبيق بشكل صحيح');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const toggleService = async () => {
    const hasPermission = await requestPermissions();

    if (hasPermission) {
      const newStatus = !isServiceActive;
      setIsServiceActive(newStatus);

      if (newStatus) {
        // تفعيل الخدمة
        try {
          // استخدام الوحدة النمطية الأصلية لضبط وقت شاشة القفل
          NativeModules.LockScreenManager.setLockScreenTime(lockTime);
          Alert.alert('نجاح', `تم تفعيل الخدمة بمدة ${lockTime} دقيقة`);
        } catch (error) {
          console.error('خطأ في تفعيل الخدمة:', error);
          Alert.alert('خطأ', 'لم يتمكن من تفعيل الخدمة');
        }
      } else {
        // إيقاف الخدمة
        try {
          NativeModules.LockScreenManager.resetLockScreenTime();
          Alert.alert('نجاح', 'تم إيقاف الخدمة');
        } catch (error) {
          console.error('خطأ في إيقاف الخدمة:', error);
          Alert.alert('خطأ', 'لم يتمكن من إيقاف الخدمة');
        }
      }

      saveSettings();
    }
  };

  const adjustTime = (increment) => {
    const newTime = increment 
      ? Math.min(lockTime + 1, 30) 
      : Math.max(lockTime - 1, 1);
    setLockTime(newTime);

    // إذا كانت الخدمة نشطة، قم بتحديث الوقت فوراً
    if (isServiceActive) {
      try {
        NativeModules.LockScreenManager.setLockScreenTime(newTime);
      } catch (error) {
        console.error('خطأ في تحديث الوقت:', error);
      }
    }

    saveSettings();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>التحكم في وقت شاشة القفل</Text>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>مدة عرض الصورة:</Text>
          <View style={styles.timeControls}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => adjustTime(false)}
              disabled={lockTime <= 1}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.timeValue}>{lockTime} دقيقة</Text>

            <TouchableOpacity 
              style={styles.button} 
              onPress={() => adjustTime(true)}
              disabled={lockTime >= 30}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.toggleButton, {backgroundColor: isServiceActive ? '#4CAF50' : '#F44336'}]} 
          onPress={toggleService}
        >
          <Text style={styles.toggleButtonText}>
            {isServiceActive ? 'إيقاف الخدمة' : 'تفعيل الخدمة'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          ملاحظة: هذا التطبيق يتحكم في مدة عرض صورة شاشة القفل من 1 إلى 30 دقيقة.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  timeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  toggleButton: {
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '80%',
  },
  toggleButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default App;
