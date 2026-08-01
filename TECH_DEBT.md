# Technical Debt & Future Improvements

Tracks remaining work for ferry-app. Completed items are removed — the history lives in commit messages.

## Medium Priority

- **Future-schedule planning view + predictive leave-by.** Let users browse the sailing schedule for future days (not just today) so they can plan a trip in advance. Combine this with the recorded historical data (delay + capacity trends by day-of-week/hour) to surface a *predictive* "leave by" time for a chosen future sailing — reusing the trimmed-mean transit + typical delay/capacity logic the live Leave card already uses (`src/hooks/useRecommendation.ts`, `src/utils/typicalConditions.ts`), but projected onto a selected date rather than the current departure.

## Low Priority

_(none yet)_
