import ActivityKit
import ExpoModulesCore

struct FerryLiveState: Record {
  @Field var routeLabel: String = ""
  @Field var terminal: String = ""
  @Field var departureMs: Double = 0
  @Field var leaveByMs: Double = 0
  @Field var arrivalMs: Double = 0
  @Field var driveMinutes: Int = 0
  @Field var note: String? = nil

  var contentState: FerryActivityAttributes.ContentState {
    .init(
      routeLabel: routeLabel,
      terminal: terminal,
      departure: Date(timeIntervalSince1970: departureMs / 1000),
      leaveBy: Date(timeIntervalSince1970: leaveByMs / 1000),
      arrival: Date(timeIntervalSince1970: arrivalMs / 1000),
      driveMinutes: driveMinutes,
      note: note
    )
  }
}

/// JS bridge for the single "best sailing" Live Activity. One activity at a
/// time: `startOrUpdate` reuses a running one instead of stacking another.
public class FerryLiveModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FerryLive")

    Function("areActivitiesEnabled") { () -> Bool in
      ActivityAuthorizationInfo().areActivitiesEnabled
    }

    Function("isActive") { () -> Bool in
      !Activity<FerryActivityAttributes>.activities.isEmpty
    }

    AsyncFunction("startOrUpdate") { (input: FerryLiveState) in
      let state = input.contentState
      // Stale once the target boat leaves; the app re-plans and updates.
      let content = ActivityContent(state: state, staleDate: state.departure)
      if let current = Activity<FerryActivityAttributes>.activities.first {
        await current.update(content)
      } else {
        _ = try Activity.request(attributes: FerryActivityAttributes(), content: content, pushType: nil)
      }
    }

    // CarPlay screen data (JSON of FerryCarPlaySnapshot); see FerryCarPlay.swift.
    Function("setCarPlaySnapshot") { (json: String) in
      try FerryCarPlayStore.update(json: json)
    }

    AsyncFunction("end") {
      for activity in Activity<FerryActivityAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }
}
