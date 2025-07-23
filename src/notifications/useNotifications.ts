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
  onNotificationTap: (data: any) => void; // Handle tap e.g. deep link
}

export const useNotifications = ({ backendUrl, onNotificationTap }: UseNotificationsProps) => {
  useEffect(() => {
    const initialize = async () => {
      const granted = await requestSystemPermissions();
      if (granted) {
        await getAndRegisterToken(backendUrl);
      }
    };
    initialize();

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📥 Foreground message:', remoteMessage);
      await displayLocalNotification(remoteMessage);
    });

    const unsubscribeBackgroundOpen = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📲 Background tap:', remoteMessage);
      onNotificationTap(remoteMessage?.data);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('🚀 Cold start tap:', remoteMessage);
        onNotificationTap(remoteMessage?.data);
      }
    });

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
      console.log('🔄 Token refreshed:', token);
      await getAndRegisterToken(backendUrl);
    });

    const unsubscribeNotifeeTap = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('🖱️ Local tap:', detail.notification?.data);
        onNotificationTap(detail.notification?.data);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackgroundOpen();
      unsubscribeTokenRefresh();
      unsubscribeNotifeeTap();
    };
  }, [backendUrl, onNotificationTap]);
};
