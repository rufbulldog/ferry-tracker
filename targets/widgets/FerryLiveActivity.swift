import ActivityKit
import SwiftUI
import WidgetKit

private let accent = Color(red: 0xF1 / 255, green: 0x59 / 255, blue: 0x11 / 255)

/// Counts down to leave-by on its own (no app updates needed); flips to
/// "Leave now" once it has passed or you're already at the terminal.
private struct LeaveCountdown: View {
  let state: FerryActivityAttributes.ContentState
  var font: Font = .title2
  var alignment: Alignment = .trailing

  var body: some View {
    if state.driveMinutes == 0 {
      Text("At terminal").font(font.weight(.semibold))
    } else if state.leaveBy > Date() {
      // Timer text claims all available width; keep it to its digits.
      Text(timerInterval: Date()...state.leaveBy, countsDown: true)
        .font(font.weight(.semibold))
        .monospacedDigit()
        .multilineTextAlignment(alignment == .leading ? .leading : .trailing)
        .frame(maxWidth: 90, alignment: alignment)
    } else {
      Text("Leave now").font(font.weight(.semibold)).foregroundStyle(accent)
    }
  }
}

/// Drive-up spaces left on the target boat, once you're on your way.
private struct SpotsCount: View {
  let state: FerryActivityAttributes.ContentState
  var font: Font = .title2

  var body: some View {
    if let spaces = state.spaces {
      Text("\(spaces)")
        .font(font.weight(.bold))
        .monospacedDigit()
        .foregroundStyle(spaces <= 10 ? accent : .primary)
        .contentTransition(.numericText(value: Double(spaces)))
    } else {
      Text("—").font(font.weight(.semibold)).foregroundStyle(.secondary)
    }
  }
}

/// "was 112" when the count has moved, or why there's no count.
private func spotsFootnote(_ state: FerryActivityAttributes.ContentState) -> String {
  guard let spaces = state.spaces else { return "No space data for this terminal" }
  if let start = state.startSpaces, start != spaces { return "was \(start) when you left" }
  return "drive-up spots left"
}

private func departsIn(_ state: FerryActivityAttributes.ContentState) -> some View {
  Group {
    if state.departure > Date() {
      // Timer text claims all available width; keep it to its digits.
      Text(timerInterval: Date()...state.departure, countsDown: true)
        .monospacedDigit()
        .frame(maxWidth: 60, alignment: .leading)
    } else {
      Text("Boarding")
    }
  }
}

/// Lock Screen / banner, plus the compact `.small` family used by CarPlay and
/// the Apple Watch Smart Stack.
struct FerryActivityView: View {
  @Environment(\.activityFamily) private var family
  let state: FerryActivityAttributes.ContentState

  var body: some View {
    if state.enRoute == true {
      enRouteBody
    } else {
      leaveBody
    }
  }

  @ViewBuilder private var enRouteBody: some View {
    switch family {
    case .small:
      VStack(alignment: .leading, spacing: 2) {
        HStack(spacing: 4) {
          Image(systemName: "car.fill").foregroundStyle(accent)
          Text("\(state.terminal) \(state.departure.formatted(date: .omitted, time: .shortened))")
            .font(.headline)
            .lineLimit(1)
        }
        HStack(alignment: .firstTextBaseline, spacing: 4) {
          SpotsCount(state: state, font: .title3)
          Text(state.spaces == nil ? "" : "spots").font(.caption).foregroundStyle(.secondary)
        }
        HStack(spacing: 3) {
          Text("Departs").font(.caption).foregroundStyle(.secondary)
          departsIn(state).font(.caption)
        }
      }
      .padding(8)
    default:
      HStack(alignment: .center, spacing: 12) {
        Image(systemName: "car.fill").font(.title2).foregroundStyle(accent)
        VStack(alignment: .leading, spacing: 2) {
          Text(state.routeLabel).font(.headline).lineLimit(1)
          Text([state.vesselName, state.departure.formatted(date: .omitted, time: .shortened)]
            .compactMap { $0 }.joined(separator: " · "))
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .lineLimit(1)
          HStack(spacing: 4) {
            Text("Departs in")
            departsIn(state)
          }
          .font(.caption)
          .foregroundStyle(.secondary)
          Text(spotsFootnote(state)).font(.caption).foregroundStyle(.secondary).lineLimit(1)
        }
        Spacer(minLength: 4)
        VStack(alignment: .trailing, spacing: 0) {
          Text("Spots left").font(.caption).foregroundStyle(.secondary)
          SpotsCount(state: state)
        }
      }
      .padding(16)
    }
  }

  @ViewBuilder private var leaveBody: some View {
    switch family {
    case .small:
      VStack(alignment: .leading, spacing: 2) {
        HStack(spacing: 4) {
          Image(systemName: "ferry.fill").foregroundStyle(accent)
          Text("\(state.terminal) \(state.departure.formatted(date: .omitted, time: .shortened))")
            .font(.headline)
            .lineLimit(1)
        }
        LeaveCountdown(state: state, font: .title3, alignment: .leading)
        Text("Lands \(state.arrival.formatted(date: .omitted, time: .shortened))")
          .font(.caption)
          .foregroundStyle(.secondary)
      }
      .padding(8)
    default:
      HStack(alignment: .center, spacing: 12) {
        Image(systemName: "ferry.fill").font(.title2).foregroundStyle(accent)
        VStack(alignment: .leading, spacing: 2) {
          Text(state.routeLabel).font(.headline).lineLimit(1)
          Text("Departs \(state.departure.formatted(date: .omitted, time: .shortened)) · lands \(state.arrival.formatted(date: .omitted, time: .shortened))")
            .font(.subheadline)
            .foregroundStyle(.secondary)
          if let note = state.note {
            Text(note).font(.caption).foregroundStyle(.secondary).lineLimit(1)
          }
        }
        Spacer(minLength: 4)
        VStack(alignment: .trailing, spacing: 0) {
          Text(state.driveMinutes == 0 ? " " : "Leave in").font(.caption).foregroundStyle(.secondary)
          LeaveCountdown(state: state)
        }
      }
      .padding(16)
    }
  }
}

struct FerryLiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: FerryActivityAttributes.self) { context in
      FerryActivityView(state: context.state)
        .activitySystemActionForegroundColor(accent)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Label(context.state.terminal, systemImage: "ferry.fill").font(.headline)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(context.state.departure, style: .time).font(.headline)
        }
        DynamicIslandExpandedRegion(.bottom) {
          HStack {
            if context.state.enRoute == true {
              Text(spotsFootnote(context.state)).foregroundStyle(.secondary)
              Spacer()
              SpotsCount(state: context.state, font: .headline)
            } else {
              Text("Lands \(context.state.arrival.formatted(date: .omitted, time: .shortened))")
                .foregroundStyle(.secondary)
              Spacer()
              LeaveCountdown(state: context.state, font: .headline)
            }
          }
        }
      } compactLeading: {
        Image(systemName: context.state.enRoute == true ? "car.fill" : "ferry.fill")
          .foregroundStyle(accent)
      } compactTrailing: {
        if context.state.enRoute == true {
          SpotsCount(state: context.state, font: .caption)
        } else {
          LeaveCountdown(state: context.state, font: .caption)
            .frame(maxWidth: 52)
        }
      } minimal: {
        Image(systemName: "ferry.fill").foregroundStyle(accent)
      }
    }
    .supplementalActivityFamilies([.small])
  }
}
