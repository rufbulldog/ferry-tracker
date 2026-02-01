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
  LeftDock: string | null;
  Eta: string | null;
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
  DepartingTime: string;
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
  DriveUpSpaceCount: number;
  ReservationSpaceCount: number;
  MaxSpaceCount: number;
  IsReservationEnabled: boolean;
  BulletinMessages: string[];
  LastUpdated: string;
}

export interface TerminalWaitTime {
  TerminalID: number;
  TerminalName: string;
  WaitTime: number;
  WaitTimeNotes: string;
  WaitTimeLastUpdated: string;
}

export interface EnrichedDeparture {
  scheduled: Date;
  actual: Date | null;
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
