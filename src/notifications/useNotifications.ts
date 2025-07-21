import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
  requestSystemPermissions,
  getAndRegisterToken,
  displayLocalNotification,
} from './notificationUtils';

interface UseNotificationsProps {
  backendUrl: string;
  onNotificationTap: (data: any) => void; // Deep linking entry point
}

export const useNotifications = ({ backendUrl, onNotificationTap }: UseNotificationsProps) => {
  useEffect(() => {
    const initialize = async () => {
      const granted = await requestSystemPermissions();
      if (granted) await getAndRegisterToken(backendUrl);
    };
    initialize();

    // Foreground → show custom local notification
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📥 Foreground FCM:', remoteMessage);
      await displayLocalNotification(remoteMessage);
    });

    // Background notification (tap handler)
    const unsubscribeBackgroundOpen = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📲 Opened from background:', remoteMessage);
      onNotificationTap(remoteMessage.data);
    });

    // App launched by tapping a notification (cold start)
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('🚀 Opened from quit state:', remoteMessage);
        onNotificationTap(remoteMessage.data);
      }
    });

    // FCM token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
      console.log('🔄 FCM token refreshed:', token);
      await getAndRegisterToken(backendUrl);
    });

    // Local notification (Notifee) tap
    const unsubscribeNotifeePress = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('🖱️ Notifee tap event:', detail.notification?.data);
        onNotificationTap(detail.notification?.data);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackgroundOpen();
      unsubscribeTokenRefresh();
      unsubscribeNotifeePress();
    };
  }, [backendUrl, onNotificationTap]);
};
