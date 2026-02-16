export type ThemeName =
  | 'beavers'
  | 'beavers-white'
  | 'blazers'
  | 'blazers-white'
  | 'storm'
  | 'storm-green'
  | 'seahawks'
  | 'seahawks-gray'
  | 'seahawks-rivalries'
  | 'sounders'
  | 'sounders-aqua'
  | 'mariners'
  | 'mariners-navy'
  | 'kraken'
  | 'kraken-navy';

export interface Theme {
  name: ThemeName;
  label: string;
  logoUrl?: string;
  colors: {
    primary: string;
    primaryHover: string;
    primary500: string;
    pageBg: string;
    cardBg: string;
    inputBg: string;
    hoverBg: string;
    text: string;
    textMuted: string;
    pillText: string;
    border: string;
    borderSubtleDark: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  beavers: {
    name: 'beavers',
    label: 'Beavers',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png',
    colors: {
      primary: '#DC4405',
      primaryHover: '#b53905',
      primary500: '#D24A0B',
      pageBg: '#0f0f10',
      cardBg: '#1b1b1d',
      inputBg: '#242427',
      hoverBg: '#2f2f33',
      text: '#FFFFFF',
      textMuted: '#B8BDC4',
      pillText: '#D24A0B',
      border: '#D24A0B',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'beavers-white': {
    name: 'beavers-white',
    label: 'Beavers White',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png',
    colors: {
      primary: '#DC4405',
      primaryHover: '#b53905',
      primary500: '#D24A0B',
      pageBg: '#F2F2F2',
      cardBg: '#FFFFFF',
      inputBg: '#F0F0F0',
      hoverBg: '#E8E8E8',
      text: '#1A1A1A',
      textMuted: '#666666',
      pillText: '#DC4405',
      border: '#DC4405',
      borderSubtleDark: 'rgba(0, 0, 0, 0.06)',
      success: '#2E7D32',
      error: '#C62828',
      warning: '#E65100',
      info: '#1565C0',
    },
  },

  blazers: {
    name: 'blazers',
    label: 'Trail Blazers',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    colors: {
      primary: '#E03A3E',
      primaryHover: '#c83235',
      primary500: '#d3373b',
      pageBg: '#0e0f11',
      cardBg: '#181a1c',
      inputBg: '#212428',
      hoverBg: '#2c3034',
      text: '#F6F8FA',
      textMuted: '#B6BFC7',
      pillText: '#d3373b',
      border: '#d3373b',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'blazers-white': {
    name: 'blazers-white',
    label: 'Trail Blazers White',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    colors: {
      primary: '#E03A3E',
      primaryHover: '#c83235',
      primary500: '#d3373b',
      pageBg: '#F2F2F2',
      cardBg: '#FFFFFF',
      inputBg: '#F0F0F0',
      hoverBg: '#E8E8E8',
      text: '#1A1A1A',
      textMuted: '#666666',
      pillText: '#E03A3E',
      border: '#E03A3E',
      borderSubtleDark: 'rgba(0, 0, 0, 0.06)',
      success: '#2E7D32',
      error: '#C62828',
      warning: '#E65100',
      info: '#1565C0',
    },
  },

  storm: {
    name: 'storm',
    label: 'Storm',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/wnba/500/sea.png',
    colors: {
      primary: '#F9A01B',
      primaryHover: '#D78517',
      primary500: '#F9A01B',
      pageBg: '#0f1b14',
      cardBg: '#15251b',
      inputBg: '#1c3224',
      hoverBg: '#254030',
      text: '#F3F8F2',
      textMuted: '#B7CBBE',
      pillText: '#F9A01B',
      border: '#F9A01B',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'storm-green': {
    name: 'storm-green',
    label: 'Storm Green',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/wnba/500/sea.png',
    colors: {
      primary: '#2C5234',
      primaryHover: '#234229',
      primary500: '#2C5234',
      pageBg: '#0f1b14',
      cardBg: '#15251b',
      inputBg: '#1c3224',
      hoverBg: '#254030',
      text: '#F3F8F2',
      textMuted: '#B7CBBE',
      pillText: '#2C5234',
      border: '#2C5234',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  seahawks: {
    name: 'seahawks',
    label: 'Seahawks',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    colors: {
      primary: '#69BE28',
      primaryHover: '#4F9B1F',
      primary500: '#69BE28',
      pageBg: '#060E19',
      cardBg: '#0B1626',
      inputBg: '#12233A',
      hoverBg: '#1a3250',
      text: '#F4F7FA',
      textMuted: '#A8B2BD',
      pillText: '#69BE28',
      border: '#69BE28',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'seahawks-rivalries': {
    name: 'seahawks-rivalries',
    label: 'Seahawks Rivalries',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    colors: {
      primary: '#A5ACAF',
      primaryHover: '#8F989E',
      primary500: '#A5ACAF',
      pageBg: '#101820',
      cardBg: '#1A242E',
      inputBg: '#222E3A',
      hoverBg: '#2C3946',
      text: '#F4F7FA',
      textMuted: '#B7C0C9',
      pillText: '#4DD9A0',
      border: '#4DD9A0',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'seahawks-gray': {
    name: 'seahawks-gray',
    label: 'Seahawks Wild Grey',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    colors: {
      primary: '#A5ACAF',
      primaryHover: '#8F989E',
      primary500: '#A5ACAF',
      pageBg: '#060E19',
      cardBg: '#0B1626',
      inputBg: '#12233A',
      hoverBg: '#1a3250',
      text: '#F4F7FA',
      textMuted: '#B7C0C9',
      pillText: '#A5ACAF',
      border: '#A5ACAF',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  sounders: {
    name: 'sounders',
    label: 'Sounders',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/9726.png',
    colors: {
      primary: '#73BE21',
      primaryHover: '#5AA219',
      primary500: '#73BE21',
      pageBg: '#071A2C',
      cardBg: '#0D2438',
      inputBg: '#12304A',
      hoverBg: '#1a4060',
      text: '#EAF6EC',
      textMuted: '#A9C7AF',
      pillText: '#73BE21',
      border: '#73BE21',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'sounders-aqua': {
    name: 'sounders-aqua',
    label: 'Sounders Aqua',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/9726.png',
    colors: {
      primary: '#77C7D3',
      primaryHover: '#63aeb9',
      primary500: '#77C7D3',
      pageBg: '#061825',
      cardBg: '#0B2032',
      inputBg: '#102C41',
      hoverBg: '#183c55',
      text: '#E6FFF9',
      textMuted: '#B7E3DF',
      pillText: '#77C7D3',
      border: '#77C7D3',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  mariners: {
    name: 'mariners',
    label: 'Mariners',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png',
    colors: {
      primary: '#FFB81C',
      primaryHover: '#E0A015',
      primary500: '#FFB81C',
      pageBg: '#071322',
      cardBg: '#0D1F36',
      inputBg: '#132A45',
      hoverBg: '#1b3a5a',
      text: '#F7FAFF',
      textMuted: '#B4BECA',
      pillText: '#FFB81C',
      border: '#FFB81C',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'mariners-navy': {
    name: 'mariners-navy',
    label: 'Mariners Navy',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png',
    colors: {
      primary: '#003278',
      primaryHover: '#02285f',
      primary500: '#003278',
      pageBg: '#071322',
      cardBg: '#0D1F36',
      inputBg: '#132A45',
      hoverBg: '#1b3a5a',
      text: '#F7FAFF',
      textMuted: '#B4BECA',
      pillText: '#003278',
      border: '#003278',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },
  kraken: {
    name: 'kraken',
    label: 'Kraken',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png',
    colors: {
      primary: '#99D9D9',
      primaryHover: '#7BC4C4',
      primary500: '#99D9D9',
      pageBg: '#001628',
      cardBg: '#002240',
      inputBg: '#003058',
      hoverBg: '#004070',
      text: '#F0FAFA',
      textMuted: '#9BBFC5',
      pillText: '#99D9D9',
      border: '#99D9D9',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },

  'kraken-navy': {
    name: 'kraken-navy',
    label: 'Kraken Navy',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png',
    colors: {
      primary: '#001F5B',
      primaryHover: '#001845',
      primary500: '#001F5B',
      pageBg: '#001628',
      cardBg: '#002240',
      inputBg: '#003058',
      hoverBg: '#004070',
      text: '#F0FAFA',
      textMuted: '#9BBFC5',
      pillText: '#99D9D9',
      border: '#99D9D9',
      borderSubtleDark: 'rgba(255, 255, 255, 0.05)',
      success: '#38A169',
      error: '#E53E3E',
      warning: '#D69E2E',
      info: '#3182CE',
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'seahawks';

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes[DEFAULT_THEME];
}

export const themeNames: ThemeName[] = [
  'beavers',
  'beavers-white',
  'blazers',
  'blazers-white',
  'storm',
  'storm-green',
  'seahawks',
  'seahawks-rivalries',
  'seahawks-gray',
  'sounders',
  'sounders-aqua',
  'mariners',
  'mariners-navy',
  'kraken',
  'kraken-navy',
];
