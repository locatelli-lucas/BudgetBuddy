import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string; subtitle: string }[] = [
  { key: 'dark', label: 'Escuro', icon: 'dark-mode', subtitle: 'Tema premium com fundo escuro' },
  { key: 'light', label: 'Claro', icon: 'light-mode', subtitle: 'Tema claro com alto contraste' },
  { key: 'system', label: 'Sistema', icon: 'settings-suggest', subtitle: 'Acompanha a configuração do dispositivo' },
];

export function AppearanceScreen({ navigation }: any) {
  const { themeMode, colors, theme, setThemeMode } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-on-surface">Aparência</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 pt-4 gap-2">
        <Text className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Tema</Text>
        {THEME_OPTIONS.map((opt) => {
          const isActive = themeMode === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              className={`rounded-xl p-4 flex-row items-center gap-4 border ${
                isActive ? 'border-primary bg-primary/5' : 'bg-surface border-outline-variant/10'
              }`}
              onPress={() => setThemeMode(opt.key)}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <MaterialIcons name={opt.icon as any} size={22} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-body-md font-semibold text-on-surface">{opt.label}</Text>
                <Text className="text-label-sm text-on-surface-variant">{opt.subtitle}</Text>
              </View>
              {isActive && (
                <MaterialIcons name="check-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
