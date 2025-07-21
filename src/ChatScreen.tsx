import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';


type ChatRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

const ChatScreen = () => {
  const route = useRoute<ChatRouteProp>();
  const { chatId } = route.params;

  return (
    <View style={styles.container}>
      <Text>💬 Chat Screen</Text>
      <Text>Chat ID: {chatId}</Text>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
