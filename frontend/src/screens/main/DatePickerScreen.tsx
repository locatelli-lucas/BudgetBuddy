import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface DateObj {
  year: number;
  month: number; // 0-indexed
  day: number;
}

function dateToStr(d: DateObj): string {
  return `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function dateObjFromStr(s: string): DateObj {
  const [y, m, d] = s.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

/** Returns true if the calendar day (year, month, day) falls between start and end (inclusive). */
function isDayInRange(
  year: number, month: number, day: number,
  start: DateObj | null, end: DateObj | null,
): boolean {
  if (!start || !end) return false;
  const d = dateToStr({ year, month, day });
  return d >= dateToStr(start) && d <= dateToStr(end);
}

export function DatePickerScreen({ navigation, route }: any) {
  const mode: 'single' | 'range' = route.params?.mode ?? 'single';
  const onSelect = route.params?.onSelect;
  const initialDate = route.params?.initialDate
    ? new Date(route.params.initialDate)
    : new Date();

  // ─── Single-mode state ──────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  // ─── Range-mode state ───────────────────────────────────────────────
  const [rangeStart, setRangeStart] = useState<DateObj | null>(null);
  const [rangeEnd, setRangeEnd] = useState<DateObj | null>(null);
  const [pickingPhase, setPickingPhase] = useState<'start' | 'end'>('start');

  // ─── Calendar computation ───────────────────────────────────────────
  const calendarYear = selectedYear;
  const calendarMonth = selectedMonth;

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  // ─── Navigation handlers ────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // ─── Day tap ────────────────────────────────────────────────────────
  const handleDayPress = (day: number) => {
    const tapped: DateObj = { year: calendarYear, month: calendarMonth, day };

    if (mode === 'single') {
      setSelectedDay(day);
      return;
    }

    // Range mode
    if (pickingPhase === 'start') {
      setRangeStart(tapped);
      setRangeEnd(null);
      setPickingPhase('end');
    } else {
      // If tapped date is before start, swap them
      if (rangeStart && dateToStr(tapped) < dateToStr(rangeStart)) {
        setRangeEnd(rangeStart);
        setRangeStart(tapped);
      } else {
        setRangeEnd(tapped);
      }
      setPickingPhase('start'); // allow re-selecting
    }
  };

  // ─── Confirm ────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (mode === 'single') {
      const dateStr = dateToStr({ year: calendarYear, month: calendarMonth, day: selectedDay });
      if (onSelect) onSelect(dateStr);
    } else {
      if (rangeStart && rangeEnd) {
        if (onSelect) onSelect({
          startDate: dateToStr(rangeStart),
          endDate: dateToStr(rangeEnd),
        });
      }
    }
    navigation.goBack();
  };

  const canConfirm = mode === 'single' ? true : !!(rangeStart && rangeEnd);

  // ─── Helpers for day cell styling ───────────────────────────────────
  const getDayCellStyle = (day: number | null): string => {
    if (day === null) return '';

    if (mode === 'single') {
      return day === selectedDay ? 'bg-primary' : '';
    }

    // Range mode
    const d: DateObj = { year: calendarYear, month: calendarMonth, day };
    const isStart = rangeStart && dateToStr(d) === dateToStr(rangeStart);
    const isEnd = rangeEnd && dateToStr(d) === dateToStr(rangeEnd);
    const inRange = isDayInRange(calendarYear, calendarMonth, day, rangeStart, rangeEnd);

    if (isStart || isEnd) return 'bg-primary';
    if (inRange) return 'bg-primary-container';
    return '';
  };

  const getDayTextStyle = (day: number | null): string => {
    if (day === null) return '';

    if (mode === 'single') {
      return day === selectedDay ? 'text-on-primary font-bold' : 'text-on-surface';
    }

    const d: DateObj = { year: calendarYear, month: calendarMonth, day };
    const isStart = rangeStart && dateToStr(d) === dateToStr(rangeStart);
    const isEnd = rangeEnd && dateToStr(d) === dateToStr(rangeEnd);
    const inRange = isDayInRange(calendarYear, calendarMonth, day, rangeStart, rangeEnd);

    if (isStart || isEnd) return 'text-on-primary font-bold';
    if (inRange) return 'text-on-primary-container font-bold';
    return 'text-on-surface';
  };

  // ─── Render ─────────────────────────────────────────────────────────
  const headerTitle = mode === 'range' ? 'Selecionar Período' : 'Selecionar Data';
  const phaseHint = mode === 'range'
    ? (pickingPhase === 'start' ? 'Toque na data inicial' : rangeStart ? 'Toque na data final' : 'Toque na data inicial')
    : null;

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">{headerTitle}</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 pt-4">
        {/* Month/Year Navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handlePrevMonth} className="p-2">
            <MaterialIcons name="chevron-left" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-headline-md font-bold text-on-surface">
              {MONTHS[calendarMonth]} {calendarYear}
            </Text>
          </View>
          <TouchableOpacity onPress={handleNextMonth} className="p-2">
            <MaterialIcons name="chevron-right" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Phase hint (range mode only) */}
        {phaseHint && (
          <View className="items-center mb-3">
            <Text className="text-body-sm text-on-surface-variant">{phaseHint}</Text>
          </View>
        )}

        {/* Week Day Headers */}
        <View className="flex-row mb-2">
          {weekDayLabels.map((label, i) => (
            <View key={i} className="flex-1 items-center py-2">
              <Text className="text-label-sm text-on-surface-variant font-medium">{label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row">
            {week.map((day, di) => {
              const bgClass = getDayCellStyle(day);
              const textClass = getDayTextStyle(day);
              return (
                <TouchableOpacity
                  key={di}
                  className={`flex-1 aspect-square items-center justify-center rounded-full ${bgClass}`}
                  disabled={day === null}
                  onPress={() => day && handleDayPress(day)}
                >
                  {day !== null && (
                    <Text className={`text-body-md ${textClass}`}>
                      {day}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Selected range summary (range mode only) */}
      {mode === 'range' && rangeStart && (
        <View className="px-5 pb-2">
          <View className="flex-row items-center justify-center gap-3 py-2 bg-surface-container-low rounded-lg">
            <Text className="text-body-md text-on-surface font-medium">
              {rangeStart.day}/{rangeStart.month + 1}/{rangeStart.year}
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color={Colors.onSurfaceVariant} />
            <Text className="text-body-md text-on-surface font-medium">
              {rangeEnd
                ? `${rangeEnd.day}/${rangeEnd.month + 1}/${rangeEnd.year}`
                : '—'}
            </Text>
          </View>
        </View>
      )}

      <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
        <TouchableOpacity
          className={`w-full h-14 rounded-xl items-center justify-center ${canConfirm ? 'bg-primary-container' : 'bg-surface-container-highest'}`}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          <Text className={`text-body-md font-bold ${canConfirm ? 'text-on-primary-container' : 'text-on-surface-variant/40'}`}>
            Confirmar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
