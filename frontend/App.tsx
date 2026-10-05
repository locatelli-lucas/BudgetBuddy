import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ErrorToastProvider } from './src/contexts/ErrorToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from './src/contexts/ThemeContext';
import { Colors } from './src/constants/colors';
import { usePushNotifications } from './src/hooks/usePushNotifications';

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

function AppContent() {
  usePushNotifications();
  return (
    <>
      <ThemedStatusBar />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemeProvider>
          <ErrorToastProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ErrorToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
