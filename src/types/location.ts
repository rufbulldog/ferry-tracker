// A named point on the map — a public ferry terminal or a personal home/work
// location. Shared by the persistence layer (src/store/personalLocations) and
// the routing/distance helpers (src/utils/locations); lives here as a leaf type
// so neither of those modules has to import the other just for the shape.
export interface KnownLocation {
  id: string;
  label: string;
  lat: number;
  lon: number;
}
