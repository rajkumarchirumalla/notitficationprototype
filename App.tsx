import React, { useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNotifications } from './src/notifications/useNotifications';
import HomeScreen from './src/notifications/HomeScreen';
import ChatScreen from './src/ChatScreen';



export type RootStackParamList = {
  HomeScreen: undefined;
  ChatScreen: { chatId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useNotifications({
    backendUrl: 'http://192.168.0.24:3000',
    onNotificationTap: (data) => {
      console.log('🔗 Notification Deep Link:', data);
      if (data?.screen) {
        navigationRef.current?.navigate(data.screen, data);
      }
    },
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
