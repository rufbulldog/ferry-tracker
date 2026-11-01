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

/// Lock Screen / banner, plus the compact `.small` family used by CarPlay and
/// the Apple Watch Smart Stack.
struct FerryActivityView: View {
  @Environment(\.activityFamily) private var family
  let state: FerryActivityAttributes.ContentState

  var body: some View {
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
            Text("Lands \(context.state.arrival.formatted(date: .omitted, time: .shortened))")
              .foregroundStyle(.secondary)
            Spacer()
            LeaveCountdown(state: context.state, font: .headline)
          }
        }
      } compactLeading: {
        Image(systemName: "ferry.fill").foregroundStyle(accent)
      } compactTrailing: {
        LeaveCountdown(state: context.state, font: .caption)
          .frame(maxWidth: 52)
      } minimal: {
        Image(systemName: "ferry.fill").foregroundStyle(accent)
      }
    }
    .supplementalActivityFamilies([.small])
  }
}
