import { tabBarColors, contrastRatio } from './tabBarColors';
import { themes, themeNames } from './themes';

describe('tabBarColors', () => {
  test.each(themeNames)('%s: active tab is visible on the bar', name => {
    const theme = themes[name];
    const { active } = tabBarColors(theme);
    expect(contrastRatio(active, theme.colors.cardBg)).toBeGreaterThanOrEqual(3);
  });

  test.each(themeNames)('%s: active tab is clearly distinct from inactive', name => {
    // Distinct by brightness, or by being a saturated color against the grey
    // inactive icons (e.g. Beavers orange is similar in brightness but obvious).
    const { active, inactive } = tabBarColors(themes[name]);
    const hex = active.replace('#', '');
    const ch = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    const isColor = (Math.max(...ch) - Math.min(...ch)) / 255 >= 0.15;
    expect(isColor || contrastRatio(active, inactive) >= 3).toBe(true);
  });

  test('dark-primary themes fall back to a readable color', () => {
    expect(tabBarColors(themes['kraken-navy']).active).toBe('#99D9D9');
    expect(tabBarColors(themes['mariners-navy']).active).toBe(themes['mariners-navy'].colors.text);
  });

  test('grey primaries use the bright text color so selection is obvious', () => {
    expect(tabBarColors(themes['seahawks-gray']).active).toBe(themes['seahawks-gray'].colors.text);
    // Rivalries' pillText is a real color (green) — prefer it over white.
    expect(tabBarColors(themes['seahawks-rivalries']).active).toBe('#4DD9A0');
  });

  test('themes with a readable primary keep it', () => {
    expect(tabBarColors(themes.seahawks).active).toBe('#69BE28');
  });
});
