import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NativeBaseProvider, Box } from "native-base";
import Navigation from './src/navigation';

export default function App() {
  return (
    <NativeBaseProvider>
        <Navigation />  
    </NativeBaseProvider>
  );
}