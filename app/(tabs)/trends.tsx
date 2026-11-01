import { View, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useMemo, useState, useEffect } from 'react';
import { useRecentTrends } from '../../src/hooks/useDailyTrends';
import { useNextDepartures } from '../../src/hooks/useNextDepartures';
import { useRoute } from '../../src/context/RouteContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Theme } from '../../src/utils/themes';
import { CarMeter } from '../../src/components/CarMeter';
import { capacityTone, CapacityTone } from '../../src/utils/capacityMeter';
import { typicalCrossingMinutes } from '../../src/utils/typicalCrossing';
import {
  DayType,
  DelayBand,
  ON_TIME_MAX_MINUTES,
  buildReliabilityGrid,
  dayTypeOf,
  delayBand,
  pickSailing,
  summarizeSailings,
  windowAround,
} from '../../src/utils/sailingStats';

type RangeDays = 7 | 30;
type GridMode = 'delay' | 'full';

const GRID_DAYS = 10;
// Sailings shown around yours before "Show all".
const COLLAPSED_SAILINGS = 7;
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function delayColor(band: DelayBand, theme: Theme): string {
  if (band === 'veryLate') return theme.colors.error;
  if (band === 'late') return theme.colors.warning;
  return theme.colors.success;
}

function fullColor(tone: CapacityTone, theme: Theme): string {
  if (tone === 'nearlyFull') return theme.colors.error;
  if (tone === 'filling') return theme.colors.warning;
  return theme.colors.success;
}

function formatDelay(minutes: number): string {
  return minutes > 0 ? `+${minutes}` : String(minutes);
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  theme,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  theme: Theme;
}) {
  return (
    <View style={[styles.segmented, { backgroundColor: theme.colors.inputBg }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={String(o.value)}
            style={[styles.segment, active && { backgroundColor: theme.colors.primary }]}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentText, { color: active ? '#fff' : theme.colors.textMuted }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TrendsScreen() {
  const { route, animationDirection, clearAnimation } = useRoute();
  const { theme } = useTheme();

  // Slide animation for direction changes - subtle horizontal slide
  const slideAnim = useState(() => new Animated.Value(0))[0];
  const opacityAnim = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    if (animationDirection) {
      const startX = animationDirection === 'right' ? 60 : -60;
      slideAnim.setValue(startX);
      opacityAnim.setValue(0.3);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start(() => clearAnimation());
    }
  }, [animationDirection, clearAnimation, slideAnim, opacityAnim]);

  const [range, setRange] = useState<RangeDays>(30);
  const [dayType, setDayType] = useState<DayType>(() => dayTypeOf(new Date()));
  const [gridMode, setGridMode] = useState<GridMode>('delay');
  const [showAll, setShowAll] = useState(false);
  // A sailing the user tapped, remembered per route so switching direction
  // falls back to that route's next boat.
  const [picked, setPicked] = useState<{ route: string; minute: number } | null>(null);

  const { data: monthSnapshots = [] } = useRecentTrends(route, 30);
  const { data: departures } = useNextDepartures(route);

  const rangeSnapshots = useMemo(() => {
    if (range === 30) return monthSnapshots;
    // Recomputed whenever the data refetches; a few minutes' drift in the cutoff is harmless.
    // eslint-disable-next-line react-hooks/purity
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return monthSnapshots.filter((s) => new Date(s.scheduledTime).getTime() >= cutoff);
  }, [monthSnapshots, range]);

  const sailings = useMemo(() => summarizeSailings(rangeSnapshots, dayType), [rangeSnapshots, dayType]);
  const grid = useMemo(() => buildReliabilityGrid(monthSnapshots, dayType, GRID_DAYS), [monthSnapshots, dayType]);
  const crossing = useMemo(() => typicalCrossingMinutes(rangeSnapshots, route), [rangeSnapshots, route]);

  // Open on the Ferry tab's next boat; otherwise the next sailing after now.
  const nextMinute = useMemo(() => {
    const next = departures?.find((d) => d.status !== 'departed' && !d.isCancelled);
    const t = next ? next.scheduledDeparture : new Date();
    return t.getHours() * 60 + t.getMinutes();
  }, [departures]);
  const preferredMinute = picked && picked.route === route ? picked.minute : nextMinute;
  const hero = pickSailing(sailings, preferredMinute);


  const visibleSailings = showAll ? sailings : windowAround(sailings, hero?.minuteOfDay, COLLAPSED_SAILINGS);
  const visibleGridRows = showAll ? grid.rows : windowAround(grid.rows, hero?.minuteOfDay, COLLAPSED_SAILINGS);
  // The sailing that most often misbehaved in the rows on screen, for a one-line callout.
  const callout = (() => {
    let worst: { label: string; count: number; of: number } | null = null;
    for (const row of visibleGridRows) {
      const seen = row.cells.filter((c) => c !== null);
      const count = seen.filter((c) =>
        gridMode === 'delay'
          ? delayBand(c!.delayMinutes) !== 'onTime'
          : c!.capacityPercent !== null && capacityTone(c!.capacityPercent) === 'nearlyFull',
      ).length;
      if (count > 0 && (!worst || count > worst.count)) worst = { label: row.label, count, of: seen.length };
    }
    return worst;
  })();

  const canExpand = sailings.length > COLLAPSED_SAILINGS || grid.rows.length > COLLAPSED_SAILINGS;
  const expandToggle = canExpand && (
    <TouchableOpacity style={[styles.expand, { borderTopColor: theme.colors.hoverBg }]} onPress={() => setShowAll((v) => !v)}>
      <Text style={[styles.expandText, { color: theme.colors.primary }]}>
        {showAll ? 'Show sailings near yours' : `Show all ${Math.max(sailings.length, grid.rows.length)} sailings`}
      </Text>
    </TouchableOpacity>
  );

  const heroBand = hero ? delayBand(hero.typicalDelay) : null;
  const heroTone = hero?.typicalCapacity != null ? capacityTone(hero.typicalCapacity) : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.pageBg }]} contentContainerStyle={styles.content}>
      <View style={styles.controlsRow}>
        <Segmented
          theme={theme}
          value={range}
          onChange={setRange}
          options={[{ value: 7, label: '7 days' }, { value: 30, label: '30 days' }]}
        />
        <Segmented
          theme={theme}
          value={dayType}
          onChange={setDayType}
          options={[{ value: 'weekday', label: 'Weekdays' }, { value: 'weekend', label: 'Weekends' }]}
        />
      </View>

      <Animated.View style={{ transform: [{ translateX: slideAnim }], opacity: opacityAnim }}>
        {/* Your sailing */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.cardBg }]}>
          {hero ? (
            <>
              <View style={styles.heroBody}>
                <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>
                  THE {hero.label} · {hero.sampleSize} SAILING{hero.sampleSize !== 1 ? 'S' : ''}
                </Text>
                <View style={styles.numbersRow}>
                  <View style={styles.numberCol}>
                    <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>LEAVES</Text>
                    <Text style={[styles.bigNumber, { color: delayColor(heroBand!, theme) }]}>
                      {formatDelay(hero.typicalDelay)}
                      <Text style={[styles.bigUnit, { color: theme.colors.textMuted }]}> min</Text>
                    </Text>
                    <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>typical vs schedule</Text>
                  </View>
                  <View style={styles.numberCol}>
                    <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>ON TIME</Text>
                    <Text style={[styles.bigNumber, { color: theme.colors.text }]}>
                      {hero.onTimePercent}
                      <Text style={[styles.bigUnit, { color: theme.colors.textMuted }]}>%</Text>
                    </Text>
                    <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>within {ON_TIME_MAX_MINUTES} min</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.meterStrip, { backgroundColor: theme.colors.inputBg }]}>
                {heroTone && hero.typicalCapacity !== null && (
                  <CarMeter percent={hero.typicalCapacity} color={fullColor(heroTone, theme)} emptyColor={theme.colors.hoverBg} />
                )}
                <View style={styles.meterLegend}>
                  <Text style={[styles.meterLegendText, { color: theme.colors.textMuted }]}>
                    {hero.typicalCapacity !== null ? `Car deck typically ${hero.typicalCapacity}% full` : 'No car deck data'}
                  </Text>
                  {crossing.minutes !== null && (
                    <Text style={[styles.meterLegendText, { color: theme.colors.textMuted }]}>Crossing {crossing.minutes} min</Text>
                  )}
                </View>
                <Text style={[styles.heroNote, { color: theme.colors.textMuted, borderTopColor: theme.colors.hoverBg }]}>
                  The Ferry tab falls back on these when live data is missing.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.heroBody}>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No {dayType === 'weekday' ? 'weekday' : 'weekend'} sailings recorded in the last {range} days
              </Text>
            </View>
          )}
        </View>

        {/* Every sailing — tap one to put it in the card above */}
        {sailings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sailings</Text>
            <View style={[styles.listCard, { backgroundColor: theme.colors.cardBg }]}>
              {visibleSailings.map((s, i) => {
                const selected = hero?.minuteOfDay === s.minuteOfDay;
                const band = delayBand(s.typicalDelay);
                return (
                  <TouchableOpacity
                    key={s.minuteOfDay}
                    style={[
                      styles.sailingRow,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.hoverBg },
                      selected && { backgroundColor: theme.colors.inputBg },
                    ]}
                    onPress={() => setPicked({ route, minute: s.minuteOfDay })}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.sailingTime, { color: theme.colors.text }, selected && styles.bold]}>{s.label}</Text>
                    <View style={[styles.pill, { borderColor: delayColor(band, theme) }]}>
                      <Text style={[styles.pillText, { color: delayColor(band, theme) }]}>{formatDelay(s.typicalDelay)}m</Text>
                    </View>
                    <View style={[styles.fillTrack, { backgroundColor: theme.colors.inputBg }]}>
                      {s.typicalCapacity !== null && (
                        <View
                          style={[
                            styles.fillBar,
                            { width: `${s.typicalCapacity}%`, backgroundColor: fullColor(capacityTone(s.typicalCapacity), theme) },
                          ]}
                        />
                      )}
                    </View>
                    <Text style={[styles.onTime, { color: theme.colors.textMuted }]}>{s.onTimePercent}%</Text>
                  </TouchableOpacity>
                );
              })}
              <View style={[styles.listLegend, { borderTopColor: theme.colors.hoverBg }]}>
                <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>Typical delay · car deck · on time</Text>
              </View>
              {expandToggle}
            </View>
          </View>
        )}

        {/* Sailing × day grid */}
        {grid.rows.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, styles.sectionTitleInline, { color: theme.colors.text }]}>Last {grid.days.length} days</Text>
              <Segmented
                theme={theme}
                value={gridMode}
                onChange={setGridMode}
                options={[{ value: 'delay', label: 'Delay' }, { value: 'full', label: 'Full' }]}
              />
            </View>
            <View style={[styles.listCard, styles.gridCard, { backgroundColor: theme.colors.cardBg }]}>
              <View style={styles.gridRow}>
                <View style={styles.gridLabel} />
                {grid.days.map((d) => (
                  <Text key={d} style={[styles.gridDay, { color: theme.colors.textMuted }]}>
                    {dayType === 'weekday' ? WEEKDAY_LETTERS[new Date(`${d}T12:00:00`).getDay()] : Number(d.slice(8))}
                  </Text>
                ))}
              </View>
              {visibleGridRows.map((row) => (
                <View key={row.minuteOfDay} style={styles.gridRow}>
                  <Text
                    style={[
                      styles.gridLabel,
                      styles.gridLabelText,
                      { color: theme.colors.text },
                      hero?.minuteOfDay === row.minuteOfDay && styles.bold,
                    ]}
                  >
                    {row.label}
                  </Text>
                  {row.cells.map((c, i) => {
                    let color = theme.colors.inputBg;
                    if (c && gridMode === 'delay') color = delayColor(delayBand(c.delayMinutes), theme);
                    if (c && gridMode === 'full' && c.capacityPercent !== null) color = fullColor(capacityTone(c.capacityPercent), theme);
                    return <View key={i} style={[styles.gridCell, { backgroundColor: color }]} />;
                  })}
                </View>
              ))}
              <View style={styles.gridLegend}>
                {(gridMode === 'delay'
                  ? [
                      { color: theme.colors.success, label: `≤${ON_TIME_MAX_MINUTES}m` },
                      { color: theme.colors.warning, label: 'late' },
                      { color: theme.colors.error, label: '10m+' },
                    ]
                  : [
                      { color: theme.colors.success, label: 'room' },
                      { color: theme.colors.warning, label: 'filling' },
                      { color: theme.colors.error, label: 'nearly full' },
                    ]
                ).map((l) => (
                  <View key={l.label} style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: l.color }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>{l.label}</Text>
                  </View>
                ))}
              </View>
              {callout && (
                <Text style={[styles.callout, { color: theme.colors.textMuted, borderTopColor: theme.colors.hoverBg }]}>
                  <Text style={[styles.bold, { color: theme.colors.text }]}>The {callout.label}</Text>
                  {gridMode === 'delay' ? ' left late on ' : ' was nearly full on '}
                  {callout.count} of {callout.of} days.
                </Text>
              )}
              {expandToggle}
            </View>
          </View>
        )}
      </Animated.View>

      <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
        {monthSnapshots.length} departures recorded (last 30 days)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 3,
    gap: 2,
  },
  segment: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Hero card — same anatomy as the Ferry tab's main card
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroBody: {
    padding: 18,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  numbersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numberCol: {
    flex: 1,
  },
  bigNumber: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 62,
    fontVariant: ['tabular-nums'],
  },
  bigUnit: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0,
  },
  numberSub: {
    fontSize: 14,
  },
  meterStrip: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
  },
  meterLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLegendText: {
    fontSize: 12,
  },
  heroNote: {
    fontSize: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitleInline: {
    marginBottom: 0,
  },
  listCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sailingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sailingTime: {
    width: 76,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  bold: {
    fontWeight: '700',
  },
  pill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 46,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  fillTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBar: {
    height: 8,
    borderRadius: 4,
  },
  onTime: {
    width: 40,
    textAlign: 'right',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  listLegend: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  legendText: {
    fontSize: 12,
  },
  // Grid
  gridCard: {
    padding: 14,
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridLabel: {
    width: 70,
  },
  gridLabelText: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  gridDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
  gridCell: {
    flex: 1,
    height: 18,
    borderRadius: 4,
  },
  gridLegend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  callout: {
    fontSize: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 8,
  },
  expand: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    alignItems: 'center',
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
