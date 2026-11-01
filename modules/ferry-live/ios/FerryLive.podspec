Pod::Spec.new do |s|
  s.name           = 'FerryLive'
  s.version        = '1.0.0'
  s.summary        = 'Starts and updates the Ferry Tracker Live Activity'
  s.description    = 'Local Expo module: best-sailing Live Activity (Lock Screen, Dynamic Island, CarPlay).'
  s.license        = 'UNLICENSED'
  s.author         = 'Ferry Tracker'
  s.homepage       = 'https://github.com/rufbulldog/ferry-app'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
