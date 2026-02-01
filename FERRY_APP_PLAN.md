# Bainbridge-Seattle Ferry Tracker App

## Implementation Plan

---

## 1. Project Overview

### Goal
Build a React Native app that shows real-time ferry information for the Bainbridge Island ↔ Seattle route, helping you predict when to arrive at the terminal.

### Key Features
- **Next sailings** — upcoming departures from both terminals
- **Vessel info** — which boat is assigned to each sailing
- **Real-time delays** — compare scheduled vs actual departure times
- **Space availability** — vehicle spots remaining (drive-up and reservation)
- **Arrival predictor** — recommend when to arrive based on current conditions

### Target Platforms
- iOS and Android via React Native (Expo recommended for faster development)

---

## 2. Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native + Expo | Cross-platform, fast iteration, OTA updates |
| **Language** | TypeScript | Type safety for API responses |
| **State Management** | TanStack Query (React Query) | Excellent for API caching, refetching, background updates |
| **Navigation** | Expo Router | File-based routing, simple setup |
| **HTTP Client** | Axios or fetch | Standard REST calls |
| **Storage** | AsyncStorage | Persist user preferences (default terminal, etc.) |
| **UI Components** | React Native Paper or Tamagui | Material Design / cross-platform styling |

---

## 3. WSF API Integration

### Authentication
Register at https://wsdot.wa.gov/traffic/api/ to get a free API access code.
>done, see below
```
API_ACCESS_CODE=WSF_KEY_REDACTED
```

### Base URLs
```
SCHEDULE_API = https://www.wsdot.wa.gov/ferries/api/schedule/rest
VESSELS_API  = https://www.wsdot.wa.gov/ferries/api/vessels/rest
TERMINALS_API = https://www.wsdot.wa.gov/ferries/api/terminals/rest
```

### Key Endpoints for This App

#### 1. Today's Schedule
```
GET /scheduletoday/{routeId}/{onlyRemainingTimes}?apiaccesscode={key}
```
- Returns scheduled departures for the route
- Set `onlyRemainingTimes=true` to get only upcoming sailings

#### 2. Vessel Locations (Real-time)
```
GET /vessellocations?apiaccesscode={key}
```
- Updates every **5 seconds**
- Contains: `VesselName`, `LeftDock`, `ScheduledDeparture`, `Eta`, `AtDock`, `DepartingTerminalID`, `ArrivingTerminalID`

#### 3. Terminal Space Availability
```
GET /terminalconditions?apiaccesscode={key}
```
- Returns `DriveUpSpaceCount` and `ReservationSpaceCount` per terminal
- Shows how many vehicle spots remain

#### 4. Terminal Wait Times
```
GET /terminalwaittimes/{terminalId}?apiaccesscode={key}
```
- Estimated wait time for vehicles

### Terminal IDs
```typescript
const TERMINALS = {
  SEATTLE: 7,        // Colman Dock
  BAINBRIDGE: 3,     // Bainbridge Island
} as const;
```

### Route ID
You'll need to fetch routes first to get the exact route ID, or discover it from the schedule API. The route code is `sea-bi`.

---

## 4. Project Structure

```
ferry-tracker/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with navigation
│   ├── index.tsx                 # Home screen (next departures)
│   ├── schedule.tsx              # Full schedule view
│   ├── vessel/[id].tsx           # Vessel detail screen
│   └── settings.tsx              # User preferences
│
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance with API key
│   │   ├── schedule.ts           # Schedule API functions
│   │   ├── vessels.ts            # Vessels API functions
│   │   ├── terminals.ts          # Terminals API functions
│   │   └── types.ts              # TypeScript interfaces for API responses
│   │
│   ├── hooks/
│   │   ├── useSchedule.ts        # TanStack Query hook for schedule
│   │   ├── useVesselLocations.ts # Real-time vessel polling hook
│   │   ├── useTerminalConditions.ts
│   │   └── useNextDeparture.ts   # Computed hook combining data
│   │
│   ├── components/
│   │   ├── DepartureCard.tsx     # Single departure display
│   │   ├── VesselStatus.tsx      # Vessel location/status badge
│   │   ├── SpaceAvailability.tsx # Vehicle spots remaining
│   │   ├── DelayIndicator.tsx    # On-time / X min late display
│   │   ├── CountdownTimer.tsx    # Time until departure
│   │   └── TerminalPicker.tsx    # Select departing terminal
│   │
│   ├── utils/
│   │   ├── time.ts               # Date/time formatting, delay calc
│   │   ├── predictions.ts        # Arrival time recommendations
│   │   └── constants.ts          # Terminal IDs, route IDs
│   │
│   └── store/
│       └── preferences.ts        # AsyncStorage for user settings
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── .env                          # API_ACCESS_CODE
```

---

## 5. Core TypeScript Types

```typescript
// src/api/types.ts

export interface VesselLocation {
  VesselID: number;
  VesselName: string;
  Mmsi: number;
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  ArrivingTerminalID: number;
  ArrivingTerminalName: string;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  AtDock: boolean;
  LeftDock: string | null;        // ISO timestamp or null if still at dock
  Eta: string | null;             // ISO timestamp
  EtaBasis: string;
  ScheduledDeparture: string | null;
  OpRouteAbbrev: string[];
  VesselPositionNum: number | null;
  SortSeq: number;
  ManagedBy: number;
  TimeStamp: string;
}

export interface ScheduledSailing {
  DepartingTerminalID: number;
  DepartingTerminalName: string;
  ArrivingTerminalID: number;
  ArrivingTerminalName: string;
  Annotations: string[];
  Times: SailingTime[];
}

export interface SailingTime {
  DepartingTime: string;          // ISO timestamp
  ArrivingTime: string | null;
  LoadingRule: string;
  VesselID: number;
  VesselName: string;
  VesselHandicapAccessible: boolean;
  Routes: string[];
  AnnotationIndexes: number[];
}

export interface TerminalCondition {
  TerminalID: number;
  TerminalName: string;
  TerminalAbbrev: string;
  DriveUpSpaceCount: number;      // Vehicle spots available (drive-up)
  ReservationSpaceCount: number;  // Vehicle spots available (reservation)
  MaxSpaceCount: number;          // Total capacity
  IsReservationEnabled: boolean;
  BulletinMessages: string[];
  LastUpdated: string;
}

export interface TerminalWaitTime {
  TerminalID: number;
  TerminalName: string;
  WaitTime: number;               // Minutes
  WaitTimeNotes: string;
  WaitTimeLastUpdated: string;
}

// Computed type for UI
export interface EnrichedDeparture {
  scheduled: Date;
  actual: Date | null;            // null if hasn't departed yet
  delayMinutes: number;
  vessel: {
    id: number;
    name: string;
  };
  from: {
    id: number;
    name: string;
    spaceAvailable: number;
    waitTimeMinutes: number;
  };
  to: {
    id: number;
    name: string;
  };
  status: 'scheduled' | 'boarding' | 'departed' | 'arriving';
  eta: Date | null;
}
```

---

## 6. Key Implementation Details

### Real-time Vessel Polling

The vessel location API updates every 5 seconds. Use TanStack Query with a refetch interval:

```typescript
// src/hooks/useVesselLocations.ts
import { useQuery } from '@tanstack/react-query';
import { fetchVesselLocations } from '../api/vessels';

export function useVesselLocations() {
  return useQuery({
    queryKey: ['vesselLocations'],
    queryFn: fetchVesselLocations,
    refetchInterval: 10_000,  // Poll every 10 seconds (reasonable balance)
    staleTime: 5_000,
  });
}
```

### Calculating Delay

```typescript
// src/utils/time.ts
export function calculateDelayMinutes(
  scheduledDeparture: string | null,
  actualDeparture: string | null
): number {
  if (!scheduledDeparture || !actualDeparture) return 0;

  const scheduled = new Date(scheduledDeparture);
  const actual = new Date(actualDeparture);

  return Math.round((actual.getTime() - scheduled.getTime()) / 60_000);
}
```

### Arrival Time Recommendation

```typescript
// src/utils/predictions.ts
export function recommendArrivalTime(
  departureTime: Date,
  waitTimeMinutes: number,
  spaceAvailable: number,
  isReservation: boolean
): Date {
  // Base: arrive 20 min before departure for reservations, 35 min for drive-up
  const baseLeadTime = isReservation ? 20 : 35;

  // Adjust based on current wait times
  const adjustedLeadTime = Math.max(baseLeadTime, waitTimeMinutes + 10);

  // If space is low, add buffer
  const spaceBuffer = spaceAvailable < 20 ? 15 : 0;

  const totalLeadTime = adjustedLeadTime + spaceBuffer;

  return new Date(departureTime.getTime() - totalLeadTime * 60_000);
}
```

### Filtering to Bainbridge-Seattle Route

```typescript
// src/hooks/useRouteVessels.ts
import { TERMINALS } from '../utils/constants';

export function useRouteVessels() {
  const { data: vessels } = useVesselLocations();

  return useMemo(() => {
    if (!vessels) return [];

    return vessels.filter(v =>
      (v.DepartingTerminalID === TERMINALS.SEATTLE &&
       v.ArrivingTerminalID === TERMINALS.BAINBRIDGE) ||
      (v.DepartingTerminalID === TERMINALS.BAINBRIDGE &&
       v.ArrivingTerminalID === TERMINALS.SEATTLE)
    );
  }, [vessels]);
}
```

---

## 7. Screen Designs

### Home Screen (index.tsx)

```
┌─────────────────────────────────────┐
│  🚢 Ferry Tracker                   │
├─────────────────────────────────────┤
│                                     │
│  [Seattle → Bainbridge]  [toggle]   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ NEXT DEPARTURE                  ││
│  │ 3:45 PM  ·  M/V Wenatchee       ││
│  │ ⏱ Departs in 23 min             ││
│  │ ✓ On time                       ││
│  │ 🚗 42 drive-up spots            ││
│  │                                 ││
│  │ Recommended arrival: 3:15 PM    ││
│  └─────────────────────────────────┘│
│                                     │
│  UPCOMING                           │
│  ┌─────────────────────────────────┐│
│  │ 4:30 PM  ·  M/V Tacoma          ││
│  │ 🚗 -- spots (not yet loading)   ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 5:20 PM  ·  M/V Wenatchee       ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Departure Card Component

Shows for each sailing:
- Scheduled time (large)
- Vessel name
- Countdown to departure
- Delay indicator (on time / X min late)
- Space availability (when loading)
- Recommended arrival time

---

## 8. Implementation Phases

### Phase 1: Project Setup & API Integration (Day 1)
- [ ] Initialize Expo project with TypeScript
- [ ] Set up environment variables for API key
- [ ] Create API client with axios
- [ ] Implement and test all API functions
- [ ] Define TypeScript types

### Phase 2: Core Hooks & State (Day 2)
- [ ] Set up TanStack Query provider
- [ ] Implement `useVesselLocations` with polling
- [ ] Implement `useScheduleToday`
- [ ] Implement `useTerminalConditions`
- [ ] Create combined `useNextDepartures` hook

### Phase 3: Basic UI (Day 3)
- [ ] Create home screen layout
- [ ] Build DepartureCard component
- [ ] Build terminal direction toggle
- [ ] Display next departure with countdown

### Phase 4: Enhanced Features (Day 4)
- [ ] Add delay calculation and display
- [ ] Add space availability display
- [ ] Implement arrival time recommendations
- [ ] Add vessel detail screen

### Phase 5: Polish & Preferences (Day 5)
- [ ] Add settings screen
- [ ] Persist default terminal preference
- [ ] Add pull-to-refresh
- [ ] Error handling and loading states
- [ ] App icon and splash screen

### Phase 6: Stretch Goals
- [ ] Push notifications for departure reminders
- [ ] Map view showing vessel positions
- [ ] Historical delay trends
- [ ] Widget for home screen

---

## 9. Getting Started Commands

```bash
# Create new Expo project
npx create-expo-app@latest ferry-tracker --template expo-template-blank-typescript

cd ferry-tracker

# Install dependencies
npx expo install @tanstack/react-query axios
npx expo install expo-router expo-constants expo-linking expo-status-bar
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-paper react-native-safe-area-context

# Create folder structure
mkdir -p src/{api,hooks,components,utils,store}

# Start development
npx expo start
```

---

## 10. Environment Setup

Create `.env` in project root:

```env
EXPO_PUBLIC_WSF_API_KEY=your_api_access_code_here
```

Access in code:

```typescript
const API_KEY = process.env.EXPO_PUBLIC_WSF_API_KEY;
```

---

## 11. API Client Starter Code

```typescript
// src/api/client.ts
import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_WSF_API_KEY;

export const scheduleApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/schedule/rest',
  params: { apiaccesscode: API_KEY },
});

export const vesselsApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/vessels/rest',
  params: { apiaccesscode: API_KEY },
});

export const terminalsApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/terminals/rest',
  params: { apiaccesscode: API_KEY },
});
```

```typescript
// src/api/vessels.ts
import { vesselsApi } from './client';
import type { VesselLocation } from './types';

export async function fetchVesselLocations(): Promise<VesselLocation[]> {
  const { data } = await vesselsApi.get<VesselLocation[]>('/vessellocations');
  return data;
}
```

---

## 12. Next Steps

1. **Get your API key** — Register at https://wsdot.wa.gov/traffic/api/
2. **Open this plan in VS Code** — Use it as reference alongside your code
3. **Start with Phase 1** — Get the API integration working first
4. **Test API responses** — Use the actual responses to refine the TypeScript types

---

## Resources

- [WSF Schedule API Docs](https://www.wsdot.wa.gov/ferries/api/schedule/documentation/)
- [WSF Vessels API Docs](https://www.wsdot.wa.gov/ferries/api/vessels/documentation/rest.html)
- [WSF Terminals API Docs](https://www.wsdot.wa.gov/ferries/api/terminals/documentation/rest.html)
- [Expo Documentation](https://docs.expo.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Existing npm package `wsf`](https://www.npmjs.com/package/wsf) — Consider using this instead of writing your own API client!
