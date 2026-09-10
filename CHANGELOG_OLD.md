# Older changelog

Changelog entries that were moved out of [README.md](README.md) (it keeps the latest 10) are
collected here.

### 0.2.0 (2026-07-07)
* (ssbingo) New sixth widget **AnimatedFeeder**: a large animated feeder (canvas) with falling pellets, a countdown ring and pause symbols (manual / time-based / winter); tap it to trigger a one-off feeding. The exact countdown ring uses the adapter's new `status.feedingDurationSec` (**automatic-feeder v1.6.0+**)
* (ssbingo) New stylized adapter and widget-set icon (feeder on a light grey tile)

### 0.1.0 (2026-07-07)
* (ssbingo) Fixed the adapter icon not showing in the ioBroker Developer Portal — `extIcon` and `readme` now point to the real repository instead of the template placeholder

### 0.0.5 (2026-07-06)
* (ssbingo) Internal: the package test now uses the standard `@iobroker/testing` test suite (`tests.packageFiles`) so the ioBroker adapter checker can verify it

### 0.0.4 (2026-07-06)
* (ssbingo) Internal/CI: adopted the ioBroker standard workflow actions (`ioBroker/testing-action-check`, `ioBroker/testing-action-deploy`) — still token-less npm trusted publishing (OIDC) with provenance — and the standard Dependabot auto-merge workflow

### 0.0.3 (2026-07-06)
* (ssbingo) Full user manual with screenshots of every widget, plus translations in all 11 languages (`doc/<lang>/README.md`)
* (ssbingo) Repository and CI hardening: added a `check-and-lint` job, committed the root `package-lock.json`, replaced the broken Dependabot auto-merge with the GitHub-native flow, moved Dependabot to a distributed cron schedule and added `.vscode` JSON-schema settings; first release published with provenance via the npm Trusted Publisher pipeline

### 0.0.2 (2026-07-06)
* (ssbingo) All five widgets now register correctly; widget preview uses the feeder icon instead of the template demo image; the adapter installs straight from GitHub (removed the puppeteer-based demo test)

### 0.0.1 (2026-07-06)
* (ssbingo) Initial version with five widgets — FeederStatus, FeedControl, Environment, DynamicFeeding and SeasonBanner — for the ioBroker.automatic-feeder adapter, configurable by feeder instance and switch name
