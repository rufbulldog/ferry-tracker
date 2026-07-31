import { useQuery } from '@tanstack/react-query';
import { fetchTerminalBulletins } from '../api/terminals';
import type { TerminalBulletin } from '../api/types';
import { ROUTES, Route } from '../utils/constants';

// Parse WSF date format: "/Date(1234567890000-0800)/"
function parseWsfDate(dateStr: string): Date {
  const match = dateStr.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return new Date(dateStr);
}

// Strip HTML tags and decode entities
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

// Route prefixes to strip from titles
const ROUTE_PREFIXES = [
  /^Sea\/BI\s*-\s*/i,
  /^Sea\/Brem\s*-\s*/i,
  /^Sea\/Brem\/BI\s*-\s*/i,
  /^Ana\/SJs?\s*-\s*/i,
  /^Edm\/King\s*-\s*/i,
  /^King\/Edm\s*-\s*/i,
  /^Muk\/Cli\s*-\s*/i,
  /^Fau\/Vas\s*-\s*/i,
  /^Fau\/South\s*-\s*/i,
  /^Pt\.?\s*Def\/Tal\s*-\s*/i,
  /^#\d+\s+/i, // Remove "#1" or "#2" vessel number prefixes
];

// Check if title matches route
function isRouteSpecific(title: string, route: Route): boolean {
  const titleLower = title.toLowerCase();

  if (route.includes('bainbridge') || route.includes('seattle')) {
    return titleLower.includes('sea/bi') || titleLower.includes('/bi') ||
           titleLower.includes('bainbridge') || titleLower.includes('seattle');
  }
  if (route.includes('kingston') || route.includes('edmonds')) {
    return titleLower.includes('king') || titleLower.includes('edm') ||
           titleLower.includes('kingston') || titleLower.includes('edmonds');
  }
  return false;
}

// Check if bulletin is a general/informational one (not route-specific)
function isGeneralBulletin(title: string): boolean {
  const generalKeywords = [
    'join', 'sign up', 'survey', 'opinion', 'feedback',
    'reservation', 'construction', 'schedule release',
    'reminder', 'update your'
  ];
  const titleLower = title.toLowerCase();
  return generalKeywords.some(kw => titleLower.includes(kw));
}

export interface ProcessedBulletin {
  title: string;
  text: string;
  lastUpdated: Date;
  isRecent: boolean; // Updated within last 2 hours
  isAlert: boolean; // Contains keywords like cancelled, delayed, issue
  isRouteSpecific: boolean; // Specifically about this route
  isGeneral: boolean; // General info, not urgent
}

export function useTerminalBulletins(route: Route) {
  const routeConfig = ROUTES[route];
  const terminalId = routeConfig.from;

  const { data, isLoading, error } = useQuery({
    queryKey: ['terminalBulletins', terminalId],
    queryFn: () => fetchTerminalBulletins(terminalId),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Recency cutoff for "new" bulletins. Read from the wall clock once per render
  // (the query refetches every minute, re-running this), so the purity rule is
  // opted out here rather than in the per-bulletin map below.
  // eslint-disable-next-line react-hooks/purity
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Filter and process bulletins relevant to this route
  const bulletins: ProcessedBulletin[] = (data?.Bulletins || [])
    .map((b: TerminalBulletin) => {
      const lastUpdated = parseWsfDate(b.BulletinLastUpdated);
      const plainText = stripHtml(b.BulletinText);

      // Check if it's an alert (contains concerning keywords)
      const alertKeywords = ['cancel', 'delay', 'issue', 'behind schedule', 'out of service', 'emergency', 'fire'];
      const titleLower = b.BulletinTitle.toLowerCase();
      const textLower = plainText.toLowerCase();
      const isAlert = alertKeywords.some(kw => titleLower.includes(kw) || textLower.includes(kw));

      // Check if route-specific or general
      const routeSpecific = isRouteSpecific(b.BulletinTitle, route);
      const general = isGeneralBulletin(b.BulletinTitle);

      // Strip route prefix from title
      let cleanTitle = b.BulletinTitle;
      for (const prefix of ROUTE_PREFIXES) {
        cleanTitle = cleanTitle.replace(prefix, '');
      }
      cleanTitle = cleanTitle.trim();

      return {
        title: cleanTitle,
        text: plainText,
        lastUpdated,
        isRecent: lastUpdated > twoHoursAgo,
        isAlert,
        isRouteSpecific: routeSpecific,
        isGeneral: general,
      };
    })
    // Filter: show route-specific alerts, or general info
    .filter((b: ProcessedBulletin) => {
      // Always show route-specific bulletins
      if (b.isRouteSpecific) return true;
      // Show general info bulletins
      if (b.isGeneral) return true;
      // Filter out alerts for other routes
      return false;
    })
    // Sort by: alerts first, then recency
    .sort((a: ProcessedBulletin, b: ProcessedBulletin) => {
      // Route-specific alerts first
      if (a.isAlert && a.isRouteSpecific && !(b.isAlert && b.isRouteSpecific)) return -1;
      if (b.isAlert && b.isRouteSpecific && !(a.isAlert && a.isRouteSpecific)) return 1;
      // Then other alerts
      if (a.isAlert && !b.isAlert) return -1;
      if (!a.isAlert && b.isAlert) return 1;
      // Then by recency
      return b.lastUpdated.getTime() - a.lastUpdated.getTime();
    });

  // Get the most important alert (route-specific and recent alerts first)
  const activeAlert = bulletins.find(b => b.isAlert && b.isRecent && b.isRouteSpecific) ||
                      bulletins.find(b => b.isAlert && b.isRecent) ||
                      null;

  return {
    bulletins,
    activeAlert,
    isLoading,
    error,
  };
}
