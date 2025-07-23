import { Alert, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

/** Ask for system notification permissions */
export const requestSystemPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Notification permission not granted.');
          return false;
        }
      }
      await notifee.requestPermission();
      return true;
    } else {
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
      });

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await notifee.requestPermission();
        return true;
      }

      Alert.alert('Permission Denied', 'Notification permission not granted.');
      return false;
    }
  } catch (error) {
    console.error('❌ Permission error:', error);
    return false;
  }
};

/** Register FCM token with backend */
export const getAndRegisterToken = async (backendUrl: string) => {
  try {
    const token = await messaging().getToken();
    console.log('📲 FCM Token:', token);

    await fetch(`${backendUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch (error) {
    
    console.error('❌ Token registration failed:', error);
  }
};

/** Display a local notification (foreground only) */
export const displayLocalNotification = async (remoteMessage: any) => {
  const { title, body, android } = remoteMessage.notification || {};
  const image = android?.imageUrl;
  const data = remoteMessage.data || {};

  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: title || 'New Notification',
    body: body || 'You have a new message.',
    data,
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
      style:
        Platform.OS === 'android' && image
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: image,
            }
          : undefined,
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
  });
};
