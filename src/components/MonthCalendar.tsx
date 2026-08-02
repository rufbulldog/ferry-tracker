import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { isSameDay, startOfDay, formatMonthLabel } from '../utils/dateHelpers';

interface MonthCalendarProps {
  selected: Date;
  min?: Date | null;
  max?: Date | null;
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Lightweight month-grid date picker (pure JS/RN — no native date-picker dep). */
export function MonthCalendar({ selected, min, max, onSelect }: MonthCalendarProps) {
  const { theme } = useTheme();
  const [viewMonth, setViewMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

  const minDay = min ? startOfDay(min) : null;
  const maxDay = max ? startOfDay(max) : null;

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a flat list of cells: leading blanks + day numbers.
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (d: number) => {
    const day = startOfDay(new Date(year, month, d));
    if (minDay && day < minDay) return true;
    if (maxDay && day > maxDay) return true;
    return false;
  };

  const changeMonth = (delta: number) => setViewMonth(new Date(year, month + delta, 1));

  return (
    <View>
      {/* Month header with prev/next */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrow} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: theme.colors.text }]}>{formatMonthLabel(viewMonth)}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow} hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday row */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={[styles.weekday, { color: theme.colors.textMuted }]}>{w}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (d === null) return <View key={i} style={styles.cell} />;
          const day = new Date(year, month, d);
          const disabled = isDisabled(d);
          const isSel = isSameDay(day, selected);
          return (
            <TouchableOpacity
              key={i}
              style={styles.cell}
              disabled={disabled}
              onPress={() => onSelect(day)}
              activeOpacity={0.7}
            >
              <View style={[styles.dayInner, isSel && { backgroundColor: theme.colors.primary }]}>
                <Text
                  style={[
                    styles.dayText,
                    { color: disabled ? theme.colors.textMuted : theme.colors.text },
                    disabled && styles.dayDisabled,
                    isSel && styles.daySelectedText,
                  ]}
                >
                  {d}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthArrow: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  daySelectedText: {
    color: '#fff',
    fontWeight: '700',
  },
});
