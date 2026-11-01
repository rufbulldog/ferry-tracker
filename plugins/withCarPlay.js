// Config plugin: CarPlay (Driving Task) scene for the "best sailing" screen.
//
// OFF unless FERRY_CARPLAY=1 is set at prebuild. The CarPlay entitlement is an
// Apple-managed capability: until Apple grants it to the account, any signed
// build that requests it fails provisioning — so EAS/TestFlight builds must not
// include it yet. Local simulator builds (unsigned) can, which is how the
// CarPlay screen is developed meanwhile:
//
//   FERRY_CARPLAY=1 npx expo prebuild -p ios --clean
//
// Adds the scene manifest (phone + CarPlay roles; the delegates live in
// modules/ferry-live/ios/FerryCarPlay.swift) and the entitlement.
const { withInfoPlist, withEntitlementsPlist } = require("expo/config-plugins");

const ENTITLEMENT = "com.apple.developer.carplay-driving-task";

function withCarPlay(config) {
  if (process.env.FERRY_CARPLAY !== "1") return config;

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
