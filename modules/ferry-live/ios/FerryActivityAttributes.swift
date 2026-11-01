import ActivityKit
import Foundation

// Live Activity payload for "best sailing from here".
// MUST stay identical to targets/widgets/FerryActivityAttributes.swift —
// ActivityKit matches the app's and the widget's copies by type name and shape.
@available(iOS 16.1, *)
struct FerryActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var routeLabel: String   // "Kingston → Edmonds"
    var terminal: String     // "Kingston"
    var departure: Date      // sailing the plan targets
    var leaveBy: Date        // latest time to start driving
    var arrival: Date        // lands on the far side
    var driveMinutes: Int
    var note: String?        // overflow warning or the alternative route
  }
}
