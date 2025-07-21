import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'HomeScreen'>;
};

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text>🏠 Home Screen</Text>
      <Button
        title="Go to Chat Screen"
        onPress={() => navigation.navigate('ChatScreen', { chatId: 'manual-123' })}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
