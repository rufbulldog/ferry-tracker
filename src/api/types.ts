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

export interface SpaceForArrivalTerminal {
  TerminalID: number;
  TerminalName: string;
  VesselID: number;
  VesselName: string;
  DisplayReservableSpace: boolean;
  ReservableSpaceCount: number | null;
  DisplayDriveUpSpace: boolean;
  DriveUpSpaceCount: number | null;
  MaxSpaceCount: number;
  ArrivalTerminalIDs: number[];
}

export interface DepartingSpace {
  Departure: string; // "/Date(1234567890000-0800)/"
  IsCancelled: boolean;
  VesselID: number;
  VesselName: string;
  MaxSpaceCount: number;
  SpaceForArrivalTerminals: SpaceForArrivalTerminal[];
}

export interface TerminalSailingSpace {
  TerminalID: number;
  TerminalSubjectID: number;
  RegionID: number;
  TerminalName: string;
  TerminalAbbrev: string;
  SortSeq: number;
  DepartingSpaces: DepartingSpace[];
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

export interface WaitTime {
  RouteID: number | null;
  RouteName: string | null;
  // Free-text vehicle wait note (often empty). "/Date(...)/" for last updated.
  WaitTimeNotes: string | null;
  WaitTimeLastUpdated: string | null;
  WaitTimeIVRNotes: string | null;
}

export interface TerminalWaitTimes {
  TerminalID: number;
  TerminalSubjectID: number;
  RegionID: number;
  TerminalName: string;
  TerminalAbbrev: string;
  SortSeq: number;
  WaitTimes: WaitTime[];
}

export interface TerminalBulletin {
  BulletinTitle: string;
  BulletinText: string;
  BulletinSortSeq: number;
  BulletinLastUpdated: string; // "/Date(1234567890000-0800)/"
  BulletinLastUpdatedSortable: string;
}

export interface TerminalBulletins {
  TerminalID: number;
  TerminalSubjectID: number;
  RegionID: number;
  TerminalName: string;
  TerminalAbbrev: string;
  SortSeq: number;
  Bulletins: TerminalBulletin[];
}
