import Constants from 'expo-constants';

/**
 * Safe version for Expo Go environment
 */
const useExpoPush = () => {
  return { expoPushToken: undefined, notification: undefined };
};

let usePush: () => { expoPushToken: string | undefined, notification: any } = useExpoPush;

// CRITICAL: SDK 53 + Expo Go throws error if expo-notifications is even LOADED.
// We must ensure that the require() call is truly unreachable for the Expo Go bundler.
if (false) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nativeModule = require('./usePushNotifications.native');
    usePush = nativeModule.usePushNotifications;
  } catch (e) {
    // Silently fail if native module is not available
  }
}

export function usePushNotifications() {
  return usePush();
}
