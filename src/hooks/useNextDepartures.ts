import { useMemo } from 'react';
import { useTerminalSailingSpace } from './useTerminalConditions';
import { useVesselLocations } from './useVesselLocations';
import { ROUTES, Route } from '../utils/constants';
import { calculateDelayMinutes, getMinutesUntil, parseDate, addMinutes } from '../utils/time';
import type { VesselLocation } from '../api/types';

// Parse WSF date format: "/Date(1234567890000-0800)/"
function parseWsfDate(dateStr: string): Date {
  const match = dateStr.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return new Date(dateStr);
}

export interface DepartureInfo {
  vessel: VesselLocation | null;
  vesselName: string;
  vesselId: number;
  scheduledDeparture: Date;
  estimatedDeparture: Date | null;
  minutesUntilDeparture: number;
  delayMinutes: number;
  status: 'departed' | 'loading' | 'scheduled' | 'arriving' | 'returning';
  driveUpSpaces: number | null;
  maxSpaces: number;
  isCancelled: boolean;
  etaRaw: string | null; // Raw string for UI to parse
  actualDeparture: Date | null;
  vesselArrivalEta: Date | null;
  vesselAtOppositeTerminal: boolean; // Vessel is at the destination terminal, waiting to return
  vesselProgressPercent: number; // 0-100 for journey progress
}

const TURNAROUND_MINUTES = 15;

export function useNextDepartures(route: Route) {
  const { data: allVessels, isLoading: vesselsLoading, error: vesselsError } = useVesselLocations();
  const { data: terminals, isLoading: terminalsLoading, error: terminalsError } = useTerminalSailingSpace();

  const departures = useMemo(() => {
    if (!terminals) return [];

    const routeConfig = ROUTES[route];
    const departingTerminalId = routeConfig.from;
    const arrivingTerminalId = routeConfig.to;

    // Get departing terminal data
    const departingTerminal = terminals.find(t => t.TerminalID === departingTerminalId);
    if (!departingTerminal) return [];

    // Get departures to destination terminal
    const relevantDepartures = departingTerminal.DepartingSpaces.filter(dep =>
      dep.SpaceForArrivalTerminals.some(arr => arr.TerminalID === arrivingTerminalId)
    );

    return relevantDepartures.map(dep => {
      const scheduledDeparture = parseWsfDate(dep.Departure);
      const minutesUntilDeparture = getMinutesUntil(scheduledDeparture);

      // Find matching vessel from real-time data
      const vesselInfo = allVessels?.find(v => v.VesselID === dep.VesselID) || null;

      // Get space info for our destination
      const spaceInfo = dep.SpaceForArrivalTerminals.find(
        arr => arr.TerminalID === arrivingTerminalId
      );

      // Determine status from real-time vessel data
      let status: 'departed' | 'loading' | 'scheduled' | 'arriving' | 'returning' = 'scheduled';
      let delayMinutes = 0;
      let etaRaw: string | null = null;
      let actualDeparture: Date | null = null;
      let estimatedDeparture: Date | null = null;
      let vesselArrivalEta: Date | null = null;
      let vesselAtOppositeTerminal = false;
      let vesselProgressPercent = 0;

      if (vesselInfo) {
        // Check if vessel's current scheduled departure matches this sailing
        const vesselScheduledTime = vesselInfo.ScheduledDeparture
          ? parseWsfDate(vesselInfo.ScheduledDeparture).getTime()
          : null;
        const thisDepTime = scheduledDeparture.getTime();
        const isCurrentSailing = vesselScheduledTime &&
          Math.abs(vesselScheduledTime - thisDepTime) < 5 * 60 * 1000;

        if (vesselInfo.LeftDock && isCurrentSailing) {
          // Vessel has departed on this sailing
          status = 'departed';
          actualDeparture = parseDate(vesselInfo.LeftDock);
          delayMinutes = calculateDelayMinutes(
            vesselInfo.ScheduledDeparture,
            vesselInfo.LeftDock
          );
          etaRaw = vesselInfo.Eta; // Keep raw for UI to parse

          // Calculate progress for departed vessel
          if (vesselInfo.LeftDock && vesselInfo.Eta) {
            const leftDock = parseDate(vesselInfo.LeftDock);
            const eta = parseDate(vesselInfo.Eta);
            if (leftDock && eta) {
              const now = Date.now();
              const total = eta.getTime() - leftDock.getTime();
              const elapsed = now - leftDock.getTime();
              vesselProgressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
            }
          }
        } else if (vesselInfo.AtDock && vesselInfo.DepartingTerminalID === departingTerminalId && isCurrentSailing) {
          // Vessel is at dock loading for this sailing
          status = 'loading';
          vesselProgressPercent = 0;

          // Calculate delay if past scheduled time
          const now = new Date();
          if (now > scheduledDeparture) {
            // Calculate current delay in minutes
            delayMinutes = Math.round((now.getTime() - scheduledDeparture.getTime()) / 60000);
            // Estimate departure: at least 2 more minutes for loading, or scheduled + delay
            const minDepartureTime = addMinutes(now, 2);
            estimatedDeparture = minDepartureTime;
          }
        } else if (vesselInfo.ArrivingTerminalID === departingTerminalId && !vesselInfo.AtDock && vesselInfo.Eta) {
          // Vessel is en route TO this terminal (inbound)
          status = 'arriving';
          vesselArrivalEta = parseDate(vesselInfo.Eta);

          // Calculate progress for arriving vessel
          if (vesselInfo.LeftDock && vesselInfo.Eta) {
            const leftDock = parseDate(vesselInfo.LeftDock);
            const eta = parseDate(vesselInfo.Eta);
            if (leftDock && eta) {
              const now = Date.now();
              const total = eta.getTime() - leftDock.getTime();
              const elapsed = now - leftDock.getTime();
              vesselProgressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
            }
          }

          if (vesselArrivalEta) {
            const estDep = addMinutes(vesselArrivalEta, TURNAROUND_MINUTES);
            if (estDep > scheduledDeparture) {
              estimatedDeparture = estDep;
            }
          }
        } else if (vesselInfo.AtDock && vesselInfo.DepartingTerminalID === arrivingTerminalId) {
          // Vessel is at the OPPOSITE terminal (destination), waiting to return
          status = 'returning';
          vesselAtOppositeTerminal = true;
          vesselProgressPercent = 100; // At destination, about to come back

          // Estimate when it will arrive based on turnaround + crossing time
          // Typical crossing is ~35 min, use scheduled departure as guide
          const now = new Date();
          if (vesselInfo.ScheduledDeparture) {
            const vesselDepFromOpposite = parseWsfDate(vesselInfo.ScheduledDeparture);
            const crossingMinutes = 35; // Typical crossing time
            const arrivalAtOurTerminal = addMinutes(vesselDepFromOpposite, crossingMinutes);
            vesselArrivalEta = arrivalAtOurTerminal;

            const estDep = addMinutes(arrivalAtOurTerminal, TURNAROUND_MINUTES);
            if (estDep > scheduledDeparture) {
              estimatedDeparture = estDep;
            }
          }
        }
      }

      return {
        vessel: vesselInfo,
        vesselName: dep.VesselName,
        vesselId: dep.VesselID,
        scheduledDeparture,
        estimatedDeparture,
        minutesUntilDeparture,
        delayMinutes,
        status,
        driveUpSpaces: spaceInfo?.DriveUpSpaceCount ?? null,
        maxSpaces: dep.MaxSpaceCount,
        isCancelled: dep.IsCancelled,
        etaRaw,
        actualDeparture,
        vesselArrivalEta,
        vesselAtOppositeTerminal,
        vesselProgressPercent,
      } as DepartureInfo;
    })
    .filter(dep => dep.minutesUntilDeparture > -60 || dep.status === 'departed')
    .sort((a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime())
    // Post-process: Only the first non-departed sailing should show arriving/returning status
    // Future sailings should show "scheduled" even if using the same vessel
    .map((dep, index, arr) => {
      // Find the first non-departed sailing
      const firstUpcomingIndex = arr.findIndex(d => d.status !== 'departed');

      // If this is not the first upcoming sailing and has arriving/returning status,
      // change it to scheduled (since it's a future sailing, not the immediate one)
      if (index > firstUpcomingIndex && (dep.status === 'arriving' || dep.status === 'returning')) {
        return {
          ...dep,
          status: 'scheduled' as const,
          vesselArrivalEta: null,
          vesselProgressPercent: 0,
          vesselAtOppositeTerminal: false,
        };
      }
      return dep;
    });
  }, [allVessels, terminals, route]);

  return {
    data: departures,
    isLoading: vesselsLoading || terminalsLoading,
    error: vesselsError || terminalsError,
  };
}
