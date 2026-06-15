// src/contexts/ErrorToastContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getErrorMessage } from '../utils/errors';

interface ErrorToastContextData {
  showError: (err: unknown, fallback?: string) => void;
  showMessage: (message: string) => void;
}

const ErrorToastContext = createContext<ErrorToastContextData>({} as ErrorToastContextData);

export function ErrorToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 30, duration: 300, useNativeDriver: false }),
    ]).start(() => setMessage(null));
  }, []);

  const show = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
    timerRef.current = setTimeout(hide, 4000);
  }, [opacity, translateY, hide]);

  const showError = useCallback(
    (err: unknown, fallback?: string) => {
      const msg = getErrorMessage(err, fallback);
      show(msg);
    },
    [show]
  );

  const showMessage = useCallback(
    (msg: string) => show(msg),
    [show]
  );

  return (
    <ErrorToastContext.Provider value={{ showError, showMessage }}>
      {children}
      {message && (
        <Animated.View
          className="absolute left-5 right-5 z-50"
          style={{
            bottom: 100,
            opacity,
            transform: [{ translateY }],
          }}
        >
          <View className="bg-surface border border-error/30 rounded-xl px-4 py-3 flex-row items-center gap-3 shadow-lg">
            <View className="w-8 h-8 rounded-full bg-error/10 items-center justify-center">
              <MaterialIcons name="error-outline" size={18} color={Colors.error} />
            </View>
            <Text className="text-body-sm text-on-surface flex-1" numberOfLines={3}>
              {message}
            </Text>
            <TouchableOpacity onPress={hide} className="p-1">
              <MaterialIcons name="close" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ErrorToastContext.Provider>
  );
}

export function useErrorToast() {
  return useContext(ErrorToastContext);
}
