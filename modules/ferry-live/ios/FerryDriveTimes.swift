import CoreLocation
import MapKit

/// Road drive times from Apple Maps (MKDirections ETA, with current traffic)
/// for "Best from here": you → each terminal, far terminal → home, and the
/// drive-around. Replaces the straight-line estimate when available.
enum FerryDriveTimes {
  /// Seconds for each destination, in order; -1 where MapKit has no answer
  /// (no route, offline, throttled) so JS falls back to its estimate.
  static func eta(fromLat: Double, fromLon: Double, destinations: [[Double]]) async -> [Double] {
    await withTaskGroup(of: (Int, Double).self) { group in
      for (index, dest) in destinations.enumerated() where dest.count == 2 {
        let toLat = dest[0], toLon = dest[1]
        group.addTask {
          (index, await single(fromLat: fromLat, fromLon: fromLon, toLat: toLat, toLon: toLon))
        }
      }
      var out = [Double](repeating: -1, count: destinations.count)
      for await (index, seconds) in group { out[index] = seconds }
      return out
    }
  }

  private static func single(fromLat: Double, fromLon: Double, toLat: Double, toLon: Double) async -> Double {
    let request = MKDirections.Request()
    request.source = mapItem(fromLat, fromLon)
    request.destination = mapItem(toLat, toLon)
    request.transportType = .automobile
    request.departureDate = Date()
    do {
      return try await MKDirections(request: request).calculateETA().expectedTravelTime
    } catch {
      return -1
    }
  }

  private static func mapItem(_ lat: Double, _ lon: Double) -> MKMapItem {
    MKMapItem(placemark: MKPlacemark(coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lon)))
  }
}
