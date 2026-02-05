# Ferry Tracker

A React Native app for tracking Washington State Ferries in real-time. Shows upcoming departures, vessel locations, drive-up space availability, departure recommendations, trend analytics, and personal transit timing.

## Features

### Recommend Tab
- **Large recommendation card** - prominent "leave by" time display (55% of screen)
- **Color-coded urgency** - green (plenty of time), orange (urgent), red (past due)
- **Vehicle toggle** - switch between bike and car for different travel times
- **Travel time calculations** - accounts for your commute time to the terminal
- **Buffer time** - adds appropriate buffer based on vehicle type
- **Capacity awareness** - shows ferry fill percentage at bottom of card

### Depart Tab
- **Visual capacity indicator** - tank-fill animation shows how full the ferry is
- **3-zone card layout** - vessel info at top, departure time center, capacity at bottom
- **Live vessel tracking** - animated ferry icon shows incoming vessel position
- **Drive-up space availability** - large number display shows spots remaining
- **Camera viewer** - flip card to see terminal webcam feeds
- **Estimated departure times** - predictions based on vessel arrival + turnaround time
- **Recently departed section** - scroll up to see ferries that just left
- **Auto-refresh** - vessel data updates every 5 seconds, terminal data every 10 seconds

### Trends Tab
- **Prominent stats card** - large display of average delay and capacity
- **My Transit Times** - personal commute averages from Timer recordings
  - Filtered by selected route and direction
  - Shows trip count and average duration
- **Departure accuracy chart** - visualize how often ferries run late or early
- **Capacity chart** - see how full ferries are at departure time
- **Server-side data collection** - Lambda captures departures every 2 minutes (no app needed)

### Timer Tab
- **Large timer card** - prominent display with state-based colors
  - Blue (idle), Red (running), Orange (paused)
- **Personal transit timing** - track your commute times
- **5 route options** with vehicle restrictions:
  - Home → Bainbridge Ferry (bike or car)
  - Seattle dock → Work (bike only)
  - Work → Seattle ferry (bike only)
  - Bainbridge dock → Home (bike only)
  - Home → Kingston ferry (car only)
- **Smart vehicle toggle** - only shows valid options per route
- **History view** - route-specific labels (e.g., "Home → BI Ferry")
- **Persistent storage** - times saved to backend database

## Supported Routes

| Route | Terminals |
|-------|-----------|
| Bainbridge | Seattle (Colman Dock) ↔ Bainbridge Island |
| Kingston | Edmonds ↔ Kingston |

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **TanStack Query** (React Query) for data fetching and caching
- **React Native Paper** for UI components
- **Expo Router** for tab navigation
- **react-native-gifted-charts** for trend visualizations
- **AWS CDK** for backend infrastructure (API Gateway, Lambda, DynamoDB)
- **EAS Build** for native iOS/Android builds

## Project Structure

```
ferry-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with providers
│   └── (tabs)/
│       ├── _layout.tsx           # Tab navigator config
│       ├── index.tsx             # Depart screen
│       ├── recommend.tsx         # Recommendation screen
│       ├── trends.tsx            # Trends/analytics screen
│       └── timer.tsx             # Transit timer screen
│
├── src/
│   ├── api/
│   │   ├── backend.ts            # Backend API client
│   │   ├── client.ts             # Axios instances for WSF APIs
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── vessels.ts            # Vessel locations API
│   │   └── terminals.ts          # Terminal sailing space API
│   │
│   ├── components/
│   │   ├── FerryCard.tsx         # Departure card with progress
│   │   └── RouteSelector.tsx     # Route/direction picker header
│   │
│   ├── context/
│   │   └── RouteContext.tsx      # Shared route state across tabs
│   │
│   ├── hooks/
│   │   ├── useVesselLocations.ts # Real-time vessel polling (5s)
│   │   ├── useTerminalConditions.ts # Terminal data polling (10s)
│   │   ├── useRouteVessels.ts    # Filter vessels by route
│   │   ├── useNextDepartures.ts  # Combined departure data
│   │   ├── useRecommendation.ts  # Leave-by time calculations
│   │   ├── useDailyTrends.ts     # Trend data management
│   │   ├── useTimer.ts           # Timer state management
│   │   └── useTransitRecords.ts  # Transit time CRUD
│   │
│   ├── types/
│   │   └── storage.ts            # Storage data types
│   │
│   └── utils/
│       ├── constants.ts          # Terminal IDs, route config
│       └── time.ts               # Date parsing and formatting
│
├── infra/                        # AWS CDK infrastructure
│   ├── lib/infra-stack.ts        # CDK stack definition
│   └── lambda/
│       ├── api/index.ts          # REST API handler
│       └── collector/index.ts    # Scheduled data collector
│
├── eas.json                      # EAS Build config
└── .env                          # API keys (not committed)
```

## WSF API Integration

The app uses Washington State Ferries APIs:

### Vessel Locations API
```
GET /ferries/api/vessels/rest/vessellocations
```
- Real-time vessel positions, updated every 5 seconds
- Contains: vessel name, location, ETA, departure time, at-dock status

### Terminal Sailing Space API
```
GET /ferries/api/terminals/rest/terminalsailingspace
```
- Scheduled departures with space availability
- Contains: departure times, vessel assignments, drive-up/reservation spots

### Terminal IDs
```typescript
SEATTLE: 7       // Colman Dock
BAINBRIDGE: 3    // Bainbridge Island
KINGSTON: 12     // Kingston
EDMONDS: 8       // Edmonds
```

## Status Logic

The app determines departure status by matching real-time vessel data to scheduled sailings:

| Status | Condition |
|--------|-----------|
| **Scheduled** | Future departure, vessel not yet at terminal |
| **Arriving** | Vessel en route TO the departure terminal |
| **Loading** | Vessel at dock, matches scheduled departure time |
| **Departed** | Vessel has left dock for this sailing |

### Estimated Departure
When a vessel is arriving late, the app calculates:
```
Estimated Departure = Vessel ETA + 15 min turnaround
```

## Travel Time Configuration

The Recommend tab uses these travel times:

| Route | Bike | Car |
|-------|------|-----|
| Home → Bainbridge Ferry | 7 min + 2 min buffer | 5 min + 10 min buffer |
| Seattle → Bainbridge | 10 min + 2 min buffer | N/A |
| Home → Kingston Ferry | N/A | 30 min + 20 min buffer |

## Running Locally

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator (Android Studio)

### Setup
```bash
cd ferry-app
npm install

# Create .env file with your WSF API key
echo "EXPO_PUBLIC_WSF_API_KEY=your_key_here" > .env
```

### Development
```bash
# Start Expo dev server
npx expo start

# Then press:
# i - Open iOS Simulator
# a - Open Android Emulator
# w - Open in web browser (has CORS issues)
```

### Web Note
The WSF API doesn't support CORS, so web browser testing won't work locally. Use iOS Simulator, Android Emulator, or Expo Go on a physical device.

## Building & Deployment

### Backend (AWS CDK)
The backend runs on AWS using Lambda, API Gateway, and DynamoDB.

```bash
# Deploy the backend
cd infra
npm install
npm run deploy
```

After deployment, copy the API URL from the output and add it to your `.env` file.

### Native (EAS Build)
```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --profile preview --platform ios

# Build for Android
eas build --profile preview --platform android
```

## Configuration

Get a free WSF API key at: https://wsdot.wa.gov/traffic/api/

Add to `.env`:
```
EXPO_PUBLIC_WSF_API_KEY=your-key-here
EXPO_PUBLIC_API_URL=https://your-api-id.execute-api.us-west-2.amazonaws.com/prod
```

## Future Enhancements

- [ ] Push notifications for departure reminders
- [ ] Map view with vessel positions
- [ ] Historical trend analysis (week/month views)
- [ ] Weather integration for commute recommendations
- [ ] Additional routes (Mukilteo-Clinton, Bremerton, etc.)

## License

MIT
