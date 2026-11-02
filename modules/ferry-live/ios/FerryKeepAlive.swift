import CoreLocation

/// Background location while a car Live Activity is on: iOS keeps the app
/// running as long as it's receiving location, so JS can keep refreshing WSF
/// drive-up spaces and updating the Live Activity on the Lock Screen and CarPlay.
/// Coarse accuracy and a distance filter keep the battery cost low.
final class FerryKeepAlive: NSObject, CLLocationManagerDelegate {
  static let shared = FerryKeepAlive()

  private var manager: CLLocationManager?

  func start() {
    DispatchQueue.main.async {
      guard self.manager == nil else { return }
      let m = CLLocationManager()
      m.delegate = self
      m.desiredAccuracy = kCLLocationAccuracyHundredMeters
      m.distanceFilter = 200
      m.activityType = .automotiveNavigation
      m.pausesLocationUpdatesAutomatically = false
      m.allowsBackgroundLocationUpdates = true
      m.showsBackgroundLocationIndicator = true
      m.startUpdatingLocation()
      self.manager = m
    }
  }

  func stop() {
    DispatchQueue.main.async {
      self.manager?.stopUpdatingLocation()
      self.manager = nil
    }
  }

  // Positions aren't used here — receiving them is what keeps the app awake.
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {}
  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {}
}
