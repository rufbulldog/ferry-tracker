/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "FerryWidgets",
  displayName: "Ferry Tracker",
  bundleIdentifier: ".widgets",
  // supplementalActivityFamilies (Apple Watch / CarPlay) needs iOS 18.
  deploymentTarget: "18.0",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
  colors: {
    $accent: "#F15911",
  },
};
