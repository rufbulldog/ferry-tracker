export const TERMINALS = {
  SEATTLE: 7,        // Colman Dock
  BAINBRIDGE: 3,     // Bainbridge Island
  KINGSTON: 12,      // Kingston
  EDMONDS: 8,        // Edmonds
} as const;

export type Route = 'seattle-bainbridge' | 'bainbridge-seattle' | 'kingston-edmonds' | 'edmonds-kingston';

export const ROUTES: Record<Route, { from: number; to: number; label: string }> = {
  'seattle-bainbridge': { from: TERMINALS.SEATTLE, to: TERMINALS.BAINBRIDGE, label: 'Seattle → BI' },
  'bainbridge-seattle': { from: TERMINALS.BAINBRIDGE, to: TERMINALS.SEATTLE, label: 'BI → Seattle' },
  'kingston-edmonds': { from: TERMINALS.KINGSTON, to: TERMINALS.EDMONDS, label: 'Kingston → Edmonds' },
  'edmonds-kingston': { from: TERMINALS.EDMONDS, to: TERMINALS.KINGSTON, label: 'Edmonds → Kingston' },
};
