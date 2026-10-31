import { View, StyleSheet } from 'react-native';
import { METER_BARS, filledBars } from '../utils/capacityMeter';

interface CarMeterProps {
  /** Percent of drive-up space taken, 0–100. */
  percent: number;
  color: string;
  emptyColor: string;
  bars?: number;
}

// A row of bars that fills left to right as cars board — lit bars stand tall,
// empty ones sit low, so the fill level reads at a glance.
export function CarMeter({ percent, color, emptyColor, bars = METER_BARS }: CarMeterProps) {
  const lit = filledBars(percent, bars);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
    >
      {Array.from({ length: bars }, (_, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            i < lit ? { height: LIT_HEIGHT, backgroundColor: color } : { height: EMPTY_HEIGHT, backgroundColor: emptyColor },
          ]}
        />
      ))}
    </View>
  );
}

const LIT_HEIGHT = 48;
const EMPTY_HEIGHT = 20;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: LIT_HEIGHT,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
});
