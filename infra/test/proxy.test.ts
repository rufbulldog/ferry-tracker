import { wsfPathFor } from '../lambda/proxy';

describe('wsfPathFor', () => {
  it('maps vessels', () => {
    expect(wsfPathFor('/wsf/vessels', null)).toBe('vessels/rest/vessellocations');
  });

  it('maps terminals', () => {
    expect(wsfPathFor('/wsf/terminals', null)).toBe('terminals/rest/terminalsailingspace');
  });

  it('maps bulletins with a terminal id', () => {
    expect(wsfPathFor('/wsf/bulletins/{terminalId}', { terminalId: '7' })).toBe(
      'terminals/rest/terminalbulletins/7'
    );
  });

  it('maps waittimes with a terminal id', () => {
    expect(wsfPathFor('/wsf/waittimes/{terminalId}', { terminalId: '12' })).toBe(
      'terminals/rest/terminalwaittimes/12'
    );
  });

  it('returns null for waittimes without a terminal id', () => {
    expect(wsfPathFor('/wsf/waittimes/{terminalId}', null)).toBeNull();
  });

  it('maps schedule with route + onlyRemaining', () => {
    expect(
      wsfPathFor('/wsf/schedule/{routeId}/{onlyRemaining}', {
        routeId: '5',
        onlyRemaining: 'true',
      })
    ).toBe('schedule/rest/scheduletoday/5/true');
  });

  it('returns null for unknown routes', () => {
    expect(wsfPathFor('/wsf/whatever', null)).toBeNull();
  });

  it('returns null when required path params are missing', () => {
    expect(wsfPathFor('/wsf/bulletins/{terminalId}', null)).toBeNull();
    expect(
      wsfPathFor('/wsf/schedule/{routeId}/{onlyRemaining}', { routeId: '5' })
    ).toBeNull();
  });
});
