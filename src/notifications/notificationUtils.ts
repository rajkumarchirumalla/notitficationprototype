import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

/** Ask for notification permissions */
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
  } catch (err) {
    console.error('❌ Permission error:', err);
    return false;
  }
};

/** Get & register FCM token */
export const getAndRegisterToken = async (backendUrl: string) => {
  try {
    const token = await messaging().getToken();
    console.log('📲 FCM Token:', token);
    await fetch(`${backendUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch (err) {
    console.error('❌ Token register error:', err);
  }
};

/** Show custom local notification (foreground only) */
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
    title: title || 'New Message',
    body: body || 'You received a message.',
    data, // pass full data for tap event
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
      style: image
        ? {
            type: AndroidStyle.BIGPICTURE,
            picture: image,
          }
        : undefined,
    },
  });
};
