import {
  estimateCarWait,
  parseVehicleWaitNote,
  parseWaitFromAlert,
  CarWaitInputs,
} from './carWait';

const inputs = (over: Partial<CarWaitInputs>): CarWaitInputs => ({
  liveDriveUpSpaces: null,
  maxSpaces: 200,
  historicalCapacityPercent: null,
  historicalSampleSize: 0,
  waitNoteText: null,
  alertText: null,
  sailingIntervalMinutes: 45,
  ...over,
});

describe('parseVehicleWaitNote', () => {
  test.each([
    ['1 sailing wait', { sailings: 1 }],
    ['2-sailing wait', { sailings: 2 }],
    ['Two sailings for vehicles', { sailings: 2 }],
    ['approx 2 hour wait', { minutes: 120 }],
    ['90 minute wait', { minutes: 90 }],
    ['1.5 hour wait', { minutes: 90 }],
  ])('parses %s', (text, expected) => {
    expect(parseVehicleWaitNote(text)).toEqual(expected);
  });

  test.each(['', null, undefined, 'No wait', 'Boarding as usual'])('returns null for %s', (text) => {
    expect(parseVehicleWaitNote(text as string)).toBeNull();
  });

  test('does NOT read the static WSF "advance arrival" advisory as a wait', () => {
    // Verbatim from the live terminalwaittimes note for Kingston (terminal 12).
    const advisory =
      'Peak traffic volumes occur from the first morning departure until 10 AM. ' +
      'For this time period, a 60 minute advance arrival is recommended for vehicle traffic. ' +
      'For non-peak travel, a 20 minute advance arrival is recommended. ' +
      'Passengers should arrive at least 15 minutes prior to sailing.';
    expect(parseVehicleWaitNote(advisory)).toBeNull();
  });

  test('reads a real duration only when phrased as a wait', () => {
    expect(parseVehicleWaitNote('Currently a 45 minute wait for vehicles')).toEqual({ minutes: 45 });
  });

  test('prefers sailings over duration when both present', () => {
    expect(parseVehicleWaitNote('2 sailing wait, about 90 minutes')).toEqual({ sailings: 2 });
  });
});

describe('parseWaitFromAlert', () => {
  test('parses a vehicle-related alert', () => {
    expect(parseWaitFromAlert('Heavy traffic: vehicles facing a 2 sailing wait')).toEqual({ sailings: 2 });
  });

  test('ignores an alert with a number but no vehicle/wait wording', () => {
    // No "vehicle/car/drive-up/traffic/wait" words → not treated as an overflow wait.
    expect(parseWaitFromAlert('2 sailings cancelled due to mechanical issue')).toBeNull();
    expect(parseWaitFromAlert('Schedule change effective Monday')).toBeNull();
  });
});

describe('estimateCarWait — signal priority', () => {
  test('wait-note beats everything', () => {
    const e = estimateCarWait(
      inputs({
        waitNoteText: '2 sailing wait',
        alertText: '1 sailing wait',
        liveDriveUpSpaces: 0,
        historicalCapacityPercent: 100,
        historicalSampleSize: 10,
      }),
    );
    expect(e.reason).toBe('wait-note');
    expect(e.extraSailings).toBe(2);
    expect(e.extraMinutes).toBe(90);
    expect(e.confidence).toBe('high');
  });

  test('alert used when no wait-note', () => {
    const e = estimateCarWait(inputs({ alertText: 'vehicles: 1 sailing wait', liveDriveUpSpaces: 150 }));
    expect(e.reason).toBe('alert');
    expect(e.extraSailings).toBe(1);
    expect(e.extraMinutes).toBe(45);
  });

  test('duration alert converts minutes to sailings for the boardable count', () => {
    const e = estimateCarWait(inputs({ waitNoteText: '2 hour wait for vehicles', sailingIntervalMinutes: 60 }));
    expect(e.extraMinutes).toBe(120);
    expect(e.extraSailings).toBe(2);
  });
});

describe('estimateCarWait — live capacity', () => {
  test('near-zero spaces ⇒ miss this sailing', () => {
    const e = estimateCarWait(inputs({ liveDriveUpSpaces: 1, maxSpaces: 200 }));
    expect(e.reason).toBe('live-full');
    expect(e.extraSailings).toBe(1);
    expect(e.atRisk).toBe(true);
    expect(e.confidence).toBe('high');
  });

  test('85%+ full ⇒ at risk but no guaranteed miss', () => {
    const e = estimateCarWait(inputs({ liveDriveUpSpaces: 20, maxSpaces: 200 })); // 90% full
    expect(e.reason).toBe('live-full');
    expect(e.extraSailings).toBe(0);
    expect(e.atRisk).toBe(true);
    expect(e.confidence).toBe('medium');
  });

  test('plenty of room ⇒ none, and live overrides stale history', () => {
    const e = estimateCarWait(
      inputs({ liveDriveUpSpaces: 120, maxSpaces: 200, historicalCapacityPercent: 100, historicalSampleSize: 10 }),
    );
    expect(e.reason).toBe('none');
    expect(e.extraSailings).toBe(0);
    expect(e.atRisk).toBe(false);
  });
});

describe('estimateCarWait — historical fallback', () => {
  test('usually full ⇒ 1 sailing, low confidence', () => {
    const e = estimateCarWait(inputs({ historicalCapacityPercent: 99, historicalSampleSize: 6 }));
    expect(e.reason).toBe('history');
    expect(e.extraSailings).toBe(1);
    expect(e.confidence).toBe('low');
  });

  test('often busy ⇒ at risk only', () => {
    const e = estimateCarWait(inputs({ historicalCapacityPercent: 88, historicalSampleSize: 6 }));
    expect(e.reason).toBe('history');
    expect(e.extraSailings).toBe(0);
    expect(e.atRisk).toBe(true);
  });

  test('too few samples ⇒ none', () => {
    const e = estimateCarWait(inputs({ historicalCapacityPercent: 100, historicalSampleSize: 2 }));
    expect(e.reason).toBe('none');
  });

  test('no signals at all ⇒ none', () => {
    expect(estimateCarWait(inputs({})).reason).toBe('none');
  });
});
