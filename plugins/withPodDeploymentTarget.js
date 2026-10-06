// Config plugin: raise every CocoaPods target's IPHONEOS_DEPLOYMENT_TARGET to a floor.
//
// Xcode 27 rejects pod targets below iOS 15.0 as hard errors (e.g. ReachabilitySwift
// declares 12.0), which breaks `expo run:ios` locally. The app itself already targets
// 16.4+ (Expo SDK minimum), so lifting old pods to the floor changes nothing at runtime.
// Lives in a plugin so it survives `expo prebuild --clean` (ios/ is gitignored).
// Uses only the public `expo/config-plugins` entry point so it resolves in any repo layout.
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FLOOR = '15.1';
const BEGIN = '# @generated begin with-pod-deployment-target';
const END = '# @generated end with-pod-deployment-target';
const BLOCK = [
  BEGIN,
  '    installer.pods_project.targets.each do |target|',
  '      target.build_configurations.each do |bc|',
  `        if bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ${FLOOR}`,
  `          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${FLOOR}'`,
  '        end',
  '      end',
  '    end',
  END,
].join('\n');

function addFloor(podfile) {
  // Drop any previous copy so re-running prebuild is idempotent.
  const cleaned = podfile.replace(new RegExp(`\\n?${BEGIN}[\\s\\S]*?${END}`), '');
  const anchor = /post_install do \|installer\|\n/;
  if (!anchor.test(cleaned)) {
    throw new Error('withPodDeploymentTarget: no `post_install do |installer|` block in Podfile');
  }
  return cleaned.replace(anchor, (m) => `${m}${BLOCK}\n`);
}

module.exports = function withPodDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      fs.writeFileSync(podfile, addFloor(fs.readFileSync(podfile, 'utf8')));
      return cfg;
    },
  ]);
};
