import CarPlay
import UIKit

/// One row of the CarPlay screen (same fields as the Live Activity state).
struct FerryCarPlayRow: Codable {
  var routeLabel: String
  var terminal: String
  var departureMs: Double
  var leaveByMs: Double
  var arrivalMs: Double
  var driveMinutes: Int
  var note: String?
  /// Drive-up spaces left (nil: route has no WSF space data, e.g. Seattle).
  var spaces: Int?
  var vesselName: String?
}

/// What JS pushes for CarPlay: the best sailing, the sailing after it, and the
/// other route group's option. `hasLocation` distinguishes "no fix yet" from
/// "nothing reachable".
struct FerryCarPlaySnapshot: Codable {
  var hasLocation: Bool
  var best: FerryCarPlayRow?
  var followingDepartureMs: Double?
  var followingSpaces: Int?
  var alternatives: [FerryCarPlayRow]
}

/// Latest snapshot, persisted so a CarPlay connect shows the last plan before
/// JS has re-computed one. Lives in the app process (CarPlay scenes do too).
enum FerryCarPlayStore {
  static let didChange = Notification.Name("FerryCarPlayStoreDidChange")
  private static let key = "ferry.carplay.snapshot"

  static var snapshot: FerryCarPlaySnapshot? {
    guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
    return try? JSONDecoder().decode(FerryCarPlaySnapshot.self, from: data)
  }

  static func update(json: String) throws {
    let data = Data(json.utf8)
    _ = try JSONDecoder().decode(FerryCarPlaySnapshot.self, from: data) // validate
    UserDefaults.standard.set(data, forKey: key)
    DispatchQueue.main.async {
      NotificationCenter.default.post(name: didChange, object: nil)
    }
  }
}

private func timeString(_ ms: Double) -> String {
  let f = DateFormatter()
  f.timeStyle = .short
  f.dateStyle = .none
  return f.string(from: Date(timeIntervalSince1970: ms / 1000))
}

private func spotsText(_ spaces: Int?) -> String? {
  spaces.map { $0 == 1 ? "1 spot" : "\($0) spots" }
}

private func leaveText(_ row: FerryCarPlayRow) -> String {
  let leave =
    row.driveMinutes == 0
    ? "At terminal"
    : row.leaveByMs <= Date().timeIntervalSince1970 * 1000
      ? "Leave now · ~\(row.driveMinutes) min drive"
      : "Leave by \(timeString(row.leaveByMs)) · ~\(row.driveMinutes) min drive"
  // Spots first: the list truncates the end of the line on narrow head units.
  return [spotsText(row.spaces), leave].compactMap { $0 }.joined(separator: " · ")
}

/// Which row a detail screen is showing, so it can re-render on new data.
private enum FerryCarPlayPick: Equatable {
  case best
  case following
  case alternative(Int)
}

/// CarPlay UI (Driving Task category): a single list template.
@objc(FerryCarPlaySceneDelegate)
class FerryCarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
  private var interfaceController: CPInterfaceController?
  private var listTemplate: CPListTemplate?
  private var observer: NSObjectProtocol?
  // "Leave by" flips to "Leave now" on the clock, not only on new data.
  private var timer: Timer?

  func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didConnect interfaceController: CPInterfaceController
  ) {
    self.interfaceController = interfaceController
    let template = CPListTemplate(title: "Ferry Tracker", sections: sections())
    listTemplate = template
    interfaceController.setRootTemplate(template, animated: false, completion: nil)

    observer = NotificationCenter.default.addObserver(
      forName: FerryCarPlayStore.didChange, object: nil, queue: .main
    ) { [weak self] _ in self?.refresh() }
    timer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in self?.refresh() }
  }

  func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didDisconnect interfaceController: CPInterfaceController
  ) {
    if let observer { NotificationCenter.default.removeObserver(observer) }
    timer?.invalidate()
    observer = nil
    timer = nil
    listTemplate = nil
    detailTemplate = nil
    detailPick = nil
    self.interfaceController = nil
  }

  private func refresh() {
    listTemplate?.updateSections(sections())
    if let detail = detailTemplate, let pick = detailPick {
      // Spots count up while you drive; keep an open detail screen current.
      if let fresh = Self.detailItems(pick) {
        detail.title = fresh.title
        detail.items = fresh.items
      }
    }
  }

  private static func item(_ text: String, _ detail: String?, image: String = "ferry.fill") -> CPListItem {
    CPListItem(text: text, detailText: detail, image: UIImage(systemName: image))
  }

  /// A row that opens its detail screen. The handler must call `completion`,
  /// or CarPlay spins on the row forever.
  private func tappable(_ text: String, _ detail: String?, image: String = "ferry.fill", pick: FerryCarPlayPick) -> CPListItem {
    let row = Self.item(text, detail, image: image)
    row.handler = { [weak self] _, completion in
      self?.showDetail(pick)
      completion()
    }
    return row
  }

  private var detailTemplate: CPInformationTemplate?
  private var detailPick: FerryCarPlayPick?

  private func showDetail(_ pick: FerryCarPlayPick) {
    guard let interfaceController, let content = Self.detailItems(pick) else { return }
    let template = CPInformationTemplate(
      title: content.title, layout: .twoColumn, items: content.items, actions: [])
    detailTemplate = template
    detailPick = pick
    interfaceController.pushTemplate(template, animated: true) { _, _ in }
  }

  private static func detailItems(_ pick: FerryCarPlayPick) -> (title: String, items: [CPInformationItem])? {
    guard let snap = FerryCarPlayStore.snapshot, let best = snap.best else { return nil }
    let row: FerryCarPlayRow
    switch pick {
    case .best:
      row = best
    case .alternative(let i):
      guard snap.alternatives.indices.contains(i) else { return nil }
      row = snap.alternatives[i]
    case .following:
      guard let following = snap.followingDepartureMs else { return nil }
      return (
        "\(best.routeLabel) · \(timeString(following))",
        [
          CPInformationItem(title: "Spots open", detail: spotsText(snap.followingSpaces) ?? "No live data"),
          CPInformationItem(title: "Departs", detail: "\(timeString(following)) from \(best.terminal)"),
          CPInformationItem(title: "Instead of", detail: timeString(best.departureMs)),
        ]
      )
    }

    let now = Date().timeIntervalSince1970 * 1000
    var items = [
      CPInformationItem(title: "Spots open", detail: spotsText(row.spaces) ?? "No live data"),
      CPInformationItem(
        title: "Leave by",
        detail: row.driveMinutes == 0
          ? "You're at the terminal"
          : row.leaveByMs <= now ? "Now · ~\(row.driveMinutes) min drive" : "\(timeString(row.leaveByMs)) · ~\(row.driveMinutes) min drive"),
      CPInformationItem(title: "Departs", detail: "\(timeString(row.departureMs)) from \(row.terminal)"),
      CPInformationItem(title: "Lands", detail: timeString(row.arrivalMs)),
    ]
    if let vessel = row.vesselName, !vessel.isEmpty {
      items.append(CPInformationItem(title: "Boat", detail: vessel))
    }
    if let note = row.note, note.hasPrefix("Next boat") {
      items.append(CPInformationItem(title: "Heads up", detail: note))
    }
    return ("\(row.routeLabel) · \(timeString(row.departureMs))", items)
  }

  func sections() -> [CPListSection] {
    guard let snap = FerryCarPlayStore.snapshot, snap.hasLocation else {
      return [CPListSection(items: [Self.item("Waiting for location…", "Open Ferry Tracker on your iPhone once", image: "location")])]
    }
    guard let best = snap.best else {
      return [CPListSection(items: [Self.item("No reachable sailing", "Nothing you can make from here right now", image: "clock")])]
    }

    var bestItems = [tappable("\(best.routeLabel) · \(timeString(best.departureMs))", leaveText(best), pick: .best)]
    if let note = best.note, note.hasPrefix("Next boat") {
      bestItems.append(Self.item(note, nil, image: "car.fill"))
    }
    if let following = snap.followingDepartureMs {
      bestItems.append(tappable(
        "Missed it? Next: \(timeString(following))", spotsText(snap.followingSpaces),
        image: "arrow.clockwise", pick: .following))
    }

    var sections = [CPListSection(items: bestItems, header: "Best from here", sectionIndexTitle: nil)]
    let alts = snap.alternatives.enumerated().map { i, alt in
      tappable("\(alt.routeLabel) · \(timeString(alt.departureMs))", leaveText(alt), pick: .alternative(i))
    }
    if !alts.isEmpty {
      sections.append(CPListSection(items: alts, header: "Other route", sectionIndexTitle: nil))
    }
    return sections
  }
}

/// Phone scene. The AppDelegate still starts React Native at launch (so JS runs
/// even when CarPlay alone launches the app); this just moves that window onto
/// the phone scene and forwards links the scene receives.
@objc(FerryPhoneSceneDelegate)
class FerryPhoneSceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
      let appWindow = UIApplication.shared.delegate?.window ?? nil,
      // There's one React window; a second phone scene (iPad) can't take it.
      appWindow.windowScene == nil || appWindow.windowScene === windowScene else { return }
    appWindow.windowScene = windowScene
    appWindow.makeKeyAndVisible()
    window = appWindow
    open(connectionOptions.urlContexts)
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    open(URLContexts)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = UIApplication.shared.delegate?.application?(UIApplication.shared, continue: userActivity) { _ in }
  }

  private func open(_ contexts: Set<UIOpenURLContext>) {
    for context in contexts {
      _ = UIApplication.shared.delegate?.application?(UIApplication.shared, open: context.url, options: [:])
    }
  }
}
