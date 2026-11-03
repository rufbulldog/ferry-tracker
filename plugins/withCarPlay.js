// Config plugin: CarPlay (Driving Task) scene for the "best sailing" screen.
//
// ON by default: Apple granted the managed CarPlay Driving Task entitlement
// (2026-11-02) and it's enabled on com.ferrytracker.app, so signed EAS builds
// carry it. Set FERRY_CARPLAY=0 at prebuild to build without it.
//
// Adds the scene manifest (phone + CarPlay roles; the delegates live in
// modules/ferry-live/ios/FerryCarPlay.swift) and the entitlement.
const { withInfoPlist, withEntitlementsPlist } = require("expo/config-plugins");

const ENTITLEMENT = "com.apple.developer.carplay-driving-task";

function withCarPlay(config) {
  if (process.env.FERRY_CARPLAY === "0") return config;

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Phone",
            UISceneDelegateClassName: "FerryPhoneSceneDelegate",
          },
        ],
        CPTemplateApplicationSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "CarPlay",
            UISceneDelegateClassName: "FerryCarPlaySceneDelegate",
          },
        ],
      },
    };
    return cfg;
  });

  return withEntitlementsPlist(config, (cfg) => {
    cfg.modResults[ENTITLEMENT] = true;
    return cfg;
  });
}

module.exports = withCarPlay;
