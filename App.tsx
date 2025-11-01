import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LiveKitOnboardingScreen from './src/screens/LiveKitOnboardingScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <LiveKitOnboardingScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
