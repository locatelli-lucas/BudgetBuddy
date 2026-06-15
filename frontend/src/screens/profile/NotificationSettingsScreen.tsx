import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { notificationService } from '../../services/notification.service';
import { NotificationPreference } from '../../types/notification';

export function NotificationSettingsScreen({ navigation }: any) {
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    notificationService
      .getPreferences()
      .then(setPrefs)
      .catch(() => {
        setPrefs({
          budgetAlerts: true,
          unusualSpendingAlerts: true,
          aiInsights: true,
          billReminders: true,
          investmentAlerts: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof NotificationPreference) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    notificationService.updatePreferences(updated).finally(() => setSaving(false));
  };

  const items: { key: keyof NotificationPreference; label: string; subtitle: string; icon: string }[] = [
    { key: 'budgetAlerts', label: 'Alertas de Orçamento', subtitle: 'Quando atingir ou exceder limites', icon: 'account-balance-wallet' },
    { key: 'unusualSpendingAlerts', label: 'Gastos Incomuns', subtitle: 'Detecção de padrões atípicos de gasto', icon: 'trending-up' },
    { key: 'aiInsights', label: 'Recomendações IA', subtitle: 'Insights e sugestões personalizadas', icon: 'auto-awesome' },
    { key: 'billReminders', label: 'Lembretes de Contas', subtitle: 'Avisos sobre contas a vencer', icon: 'receipt-long' },
    { key: 'investmentAlerts', label: 'Alertas de Investimentos', subtitle: 'Mudanças significativas no mercado', icon: 'show-chart' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Notificações</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 pt-4">
          {items.map((item) => (
            <View
              key={item.key}
              className="bg-surface rounded-xl p-4 flex-row items-center gap-4 mb-3 border border-outline-variant/10"
            >
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <MaterialIcons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-body-md font-semibold text-on-surface">{item.label}</Text>
                <Text className="text-label-sm text-on-surface-variant">{item.subtitle}</Text>
              </View>
              <TouchableOpacity
                className={`w-12 h-6 rounded-full relative ${prefs?.[item.key] ? 'bg-primary' : 'bg-surface-container-highest'}`}
                onPress={() => toggle(item.key)}
                disabled={saving}
              >
                <View
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white ${
                    prefs?.[item.key] ? 'right-1' : 'left-1'
                  }`}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
