export const TERMINALS = {
  SEATTLE: 7,        // Colman Dock
  BAINBRIDGE: 3,     // Bainbridge Island
  KINGSTON: 12,      // Kingston
  EDMONDS: 8,        // Edmonds
} as const;

// WSDOT terminal camera URLs - images refresh every ~5 minutes
export const TERMINAL_CAMERAS: Record<number, { name: string; url: string }[]> = {
  [TERMINALS.SEATTLE]: [
    { name: 'Main Holding', url: 'https://images.wsdot.wa.gov/wsf/colman/seattlemain.jpg' },
    { name: 'Pier 48 Overflow', url: 'https://images.wsdot.wa.gov/wsf/colman/SeattleHold.jpg' },
  ],
  [TERMINALS.BAINBRIDGE]: [
    { name: 'Terminal Holding', url: 'https://images.wsdot.wa.gov/wsf/Bainbridge/Bainbridge.jpg' },
    { name: 'Winslow Way (S)', url: 'https://images.wsdot.wa.gov/orflow/305vc00022.jpg' },
    { name: 'Winslow Way (N)', url: 'https://images.wsdot.wa.gov/orflow/305vc00021.jpg' },
    { name: 'High School Rd (S)', url: 'https://images.wsdot.wa.gov/orflow/305vc00029.jpg' },
    { name: 'High School Rd (N)', url: 'https://images.wsdot.wa.gov/orflow/305vc00028.jpg' },
  ],
  [TERMINALS.KINGSTON]: [
    { name: 'Terminal', url: 'https://images.wsdot.wa.gov/wsf/kingston/terminal/kingston.jpg' },
    { name: 'Toll Booths', url: 'https://images.wsdot.wa.gov/wsf/kingston/washington.jpg' },
    { name: 'Ferry Sign East', url: 'https://images.wsdot.wa.gov/wsf/kingston/fse/fse.jpg' },
    { name: 'Ferry Sign West', url: 'https://images.wsdot.wa.gov/wsf/kingston/fsw/fsw.jpg' },
    { name: 'Barber', url: 'https://images.wsdot.wa.gov/wsf/kingston/barber/barber.jpg' },
  ],
  [TERMINALS.EDMONDS]: [
    { name: 'Holding', url: 'https://images.wsdot.wa.gov/wsf/edmonds/holding.jpg' },
    { name: 'Dayton St', url: 'https://images.wsdot.wa.gov/wsf/edmonds/104dayton.jpg' },
    { name: 'VMS Sign', url: 'https://images.wsdot.wa.gov/wsf/edmonds/104vms_wts.jpg' },
    { name: 'Underpass', url: 'https://images.wsdot.wa.gov/wsf/edmonds/104underpass.jpg' },
    { name: 'Pine St', url: 'https://images.wsdot.wa.gov/wsf/edmonds/104pine.jpg' },
  ],
};

// ETA / Check-in constants
export const ETA_CONTACT_NUMBER = process.env.EXPO_PUBLIC_ETA_CONTACT ?? '';
export const FERRY_CROSSING_MINUTES = 35;
export const FERRY_TO_HOME_FALLBACK_MINUTES = 15;

export type Route = 'seattle-bainbridge' | 'bainbridge-seattle' | 'kingston-edmonds' | 'edmonds-kingston';

export const ROUTES: Record<Route, { from: number; to: number; label: string }> = {
  'seattle-bainbridge': { from: TERMINALS.SEATTLE, to: TERMINALS.BAINBRIDGE, label: 'Seattle → BI' },
  'bainbridge-seattle': { from: TERMINALS.BAINBRIDGE, to: TERMINALS.SEATTLE, label: 'BI → Seattle' },
  'kingston-edmonds': { from: TERMINALS.KINGSTON, to: TERMINALS.EDMONDS, label: 'Kingston → Edmonds' },
  'edmonds-kingston': { from: TERMINALS.EDMONDS, to: TERMINALS.KINGSTON, label: 'Edmonds → Kingston' },
};
