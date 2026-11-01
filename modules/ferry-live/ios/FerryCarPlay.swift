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
}

/// What JS pushes for CarPlay: the best sailing, the sailing after it, and the
/// other route group's option. `hasLocation` distinguishes "no fix yet" from
/// "nothing reachable".
struct FerryCarPlaySnapshot: Codable {
  var hasLocation: Bool
  var best: FerryCarPlayRow?
  var followingDepartureMs: Double?
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

private func leaveText(_ row: FerryCarPlayRow) -> String {
  if row.driveMinutes == 0 { return "At terminal · lands \(timeString(row.arrivalMs))" }
  let leave = row.leaveByMs <= Date().timeIntervalSince1970 * 1000 ? "Leave now" : "Leave by \(timeString(row.leaveByMs))"
  return "\(leave) · ~\(row.driveMinutes) min drive · lands \(timeString(row.arrivalMs))"
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
    let template = CPListTemplate(title: "Ferry Tracker", sections: Self.sections())
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
    self.interfaceController = nil
  }

  private func refresh() {
    listTemplate?.updateSections(Self.sections())
  }

  private static func item(_ text: String, _ detail: String?, image: String = "ferry.fill") -> CPListItem {
    CPListItem(text: text, detailText: detail, image: UIImage(systemName: image))
  }

  static func sections() -> [CPListSection] {
    guard let snap = FerryCarPlayStore.snapshot, snap.hasLocation else {
      return [CPListSection(items: [item("Waiting for location…", "Open Ferry Tracker on your iPhone once", image: "location")])]
    }
    guard let best = snap.best else {
      return [CPListSection(items: [item("No reachable sailing", "Nothing you can make from here right now", image: "clock")])]
    }

    var bestItems = [item("\(best.routeLabel) · \(timeString(best.departureMs))", leaveText(best))]
    if let note = best.note, note.hasPrefix("Next boat") {
      bestItems.append(item(note, nil, image: "car.fill"))
    }
    if let following = snap.followingDepartureMs {
      bestItems.append(item("Missed it? Next: \(timeString(following))", nil, image: "arrow.clockwise"))
    }

    var sections = [CPListSection(items: bestItems, header: "Best from here", sectionIndexTitle: nil)]
    let alts = snap.alternatives.map { item("\($0.routeLabel) · \(timeString($0.departureMs))", leaveText($0)) }
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
