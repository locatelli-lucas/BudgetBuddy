import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Switch } from 'react-native';
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
        // Fallback to defaults
        setPrefs({
          pushEnabled: true,
          financeEnabled: true,
          investmentEnabled: true,
          newsEnabled: true,
          aiEnabled: true,
          systemEnabled: true,
          priceAlertEnabled: true,
          dividendAlertEnabled: true,
          dailySummaryEnabled: true,
          weeklySummaryEnabled: true,
          monthlySummaryEnabled: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: keyof NotificationPreference) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await notificationService.updatePreferences(updated);
    } catch (err) {
      // Revert if failed
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      title: 'Canais',
      items: [
        { key: 'pushEnabled', label: 'Notificações Push', subtitle: 'Receba alertas no seu celular', icon: 'notifications-active' },
      ]
    },
    {
      title: 'Categorias',
      items: [
        { key: 'financeEnabled', label: 'Finanças', subtitle: 'Gastos, orçamentos e contas', icon: 'account-balance-wallet' },
        { key: 'investmentEnabled', label: 'Investimentos', subtitle: 'Ativos, dividendos e mercado', icon: 'show-chart' },
        { key: 'newsEnabled', label: 'Notícias', subtitle: 'Eventos relevantes do mercado', icon: 'article' },
        { key: 'aiEnabled', label: 'Insights IA', subtitle: 'Análises e recomendações', icon: 'auto-awesome' },
        { key: 'systemEnabled', label: 'Sistema', subtitle: 'Atualizações e segurança', icon: 'settings' },
      ]
    },
    {
      title: 'Alertas Específicos',
      items: [
        { key: 'priceAlertEnabled', label: 'Alertas de Preço', subtitle: 'Quando ativos atingem alvos', icon: 'trending-up' },
        { key: 'dividendAlertEnabled', label: 'Dividendos', subtitle: 'Anúncios de pagamentos', icon: 'payments' },
      ]
    },
    {
      title: 'Resumos',
      items: [
        { key: 'dailySummaryEnabled', label: 'Resumo Diário', subtitle: 'Agenda e fechamento do dia', icon: 'today' },
        { key: 'weeklySummaryEnabled', label: 'Resumo Semanal', subtitle: 'Desempenho da semana', icon: 'date-range' },
        { key: 'monthlySummaryEnabled', label: 'Resumo Mensal', subtitle: 'Relatório completo do mês', icon: 'calendar-month' },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14 border-b border-outline-variant/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Configurações</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {sections.map((section, sIndex) => (
            <View key={sIndex} className="mb-6">
              <Text className="text-label-sm text-primary font-bold uppercase tracking-widest mb-3 ml-1">
                {section.title}
              </Text>
              {section.items.map((item) => (
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
                  <Switch
                    value={prefs?.[item.key as keyof NotificationPreference] as boolean}
                    onValueChange={() => toggle(item.key as keyof NotificationPreference)}
                    trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }}
                    thumbColor="white"
                    disabled={saving}
                  />
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            className="bg-primary/10 p-4 rounded-xl flex-row items-center justify-between border border-primary/20 mb-10"
            onPress={() => navigation.navigate('PriceAlerts')}
          >
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="notifications-paused" size={24} color={Colors.primary} />
              <Text className="text-body-md font-bold text-primary">Gerenciar Alertas de Preço</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
