import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const ICONS: Record<ToastType, keyof typeof MaterialIcons.glyphMap> = {
  success: 'check-circle',
  error: 'error',
  info: 'info',
};

const COLORS: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.error,
  info: Colors.primary,
};

export function Toast({ visible, message, type = 'success', duration = 2500, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: false }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: false }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: false }),
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: false }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute top-12 left-5 right-5 z-50 bg-surface rounded-xl px-4 py-3 flex-row items-center gap-3 shadow-lg border border-outline-variant/20"
      style={{ opacity, transform: [{ translateY }] }}
    >
      <MaterialIcons name={ICONS[type]} size={22} color={COLORS[type]} />
      <Text className="text-body-md text-on-surface flex-1">{message}</Text>
    </Animated.View>
  );
}
