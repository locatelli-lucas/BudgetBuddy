import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { reportService } from '../../services/report-service';

export function CustomDateScreen({ navigation, route }: any) {
  const { showError } = useErrorToast();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleConfirm = async () => {
    if (startDate > endDate) {
      showError(new Error('A data inicial não pode ser posterior à data final.'));
      return;
    }
    setLoading(true);
    try {
      const pdfUri = await reportService.downloadPdf(
        startDate.getMonth() + 1,
        startDate.getFullYear()
      );
      // Pass the generated PDF URI back to the previous screen
      navigation.navigate('ReportPreview', {
        pdfUri,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
    } catch (err) {
      showError(err, 'Falha ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-on-surface">Período Personalizado</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 pt-6 gap-6">
        <View className="gap-2">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider">Data Inicial</Text>
          <TouchableOpacity
            className="bg-surface rounded-xl p-4 flex-row items-center gap-3 border border-outline-variant/10"
            onPress={() =>
              navigation.navigate('DatePicker', {
                initialDate: startDate.toISOString(),
                onSelect: (dateStr: string) => setStartDate(new Date(dateStr + 'T00:00:00')),
              })
            }
          >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
            </View>
            <Text className="text-body-lg text-on-surface flex-1">{formatDate(startDate)}</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View className="gap-2">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider">Data Final</Text>
          <TouchableOpacity
            className="bg-surface rounded-xl p-4 flex-row items-center gap-3 border border-outline-variant/10"
            onPress={() =>
              navigation.navigate('DatePicker', {
                initialDate: endDate.toISOString(),
                onSelect: (dateStr: string) => setEndDate(new Date(dateStr + 'T00:00:00')),
              })
            }
          >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
            </View>
            <Text className="text-body-lg text-on-surface flex-1">{formatDate(endDate)}</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
        <TouchableOpacity
          className="w-full h-14 bg-primary-container rounded-xl items-center justify-center"
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.onPrimaryContainer} />
          ) : (
            <Text className="text-body-md text-on-primary-container font-bold">Confirmar Período</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
