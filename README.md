![Logo](admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

[![NPM version](https://img.shields.io/npm/v/iobroker.vis-2-widgets-automatic-feeder.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-automatic-feeder)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-automatic-feeder.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-automatic-feeder)
![Number of Installations](https://iobroker.live/badges/vis-2-widgets-automatic-feeder-installed.svg)
[![License](https://img.shields.io/npm/l/iobroker.vis-2-widgets-automatic-feeder.svg)](https://github.com/ssbingo/ioBroker.vis-2-widgets-automatic-feeder/blob/main/LICENSE)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## vis-2 widgets for the Automatic Feeder

Ready-made **vis-2 widgets** for the [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder)
adapter — drag-and-drop dashboard cards for a fish / pond feeder. There are **no object IDs to look up and no HTML to
write**: you pick your feeder instance and your switch **by its friendly name**, and the widgets read and control
everything on their own.

This document is a complete manual. If you have never used these widgets before, read it from top to bottom — the
**Quick start** gets you a working dashboard in a couple of minutes, the rest explains every widget and every option
in detail.

> 🇩🇪 Deutsche Anleitung: [doc/de/README.md](doc/de/README.md) · other languages: see
> [Documentation](#documentation) at the bottom.

---

## Table of contents

1. [What you get](#1-what-you-get)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Quick start](#4-quick-start)
5. [The widgets in detail](#5-the-widgets-in-detail)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
   - [5.6 AnimatedFeeder](#56-animatedfeeder)
6. [Configuration](#6-configuration)
7. [Which data points each widget uses](#7-which-data-points-each-widget-uses)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)

---

## 1. What you get

Six widgets that together form a complete feeder dashboard. Each one is a self-contained card with a dark,
tablet-friendly design and an accent colour you can change.

| Widget | What it shows / does |
|--------|----------------------|
| **FeederStatus** | Animated feeder graphic (the fan spins while feeding), a live runtime countdown, the countdown to the next feeding with time and mode, the last feeding and its result, the astronomical (sunrise/sunset) window and — when blocked — the reason. |
| **FeedControl** | A **Feed now** button with a two-step confirmation, a portion (duration) slider and a master **suspend feeding** switch. |
| **Environment** | Water temperature (shallow and deep), the thermal stratification Δ, an oxygen reading (shown only if a sensor exists) and a day bar with a live "now" marker between sunrise and sunset. |
| **DynamicFeeding** | The Q10 temperature model at a glance: average temperature, rate factor, interval and portion, plus which sensor (water/air) drives it. |
| **SeasonBanner** | A single, colour-coded status line with the currently most important state (manual pause → time-based pause → winter pause → automatic active). |
| **AnimatedFeeder** | A large animated feeder graphic (canvas): food pellets fall and a countdown ring fills while feeding, pause symbols (manual / time-based / winter) otherwise. Tap it to trigger a one-off feeding. |

All six widgets are **read-and-control**: FeederStatus, Environment, DynamicFeeding and SeasonBanner only *display*
data, while FeedControl and AnimatedFeeder also *write* (trigger a feeding, toggle the pause). Nothing is ever written that you did
not explicitly ask for.

---

## 2. Requirements

- ioBroker **vis-2** (the modern vis; these are vis-2 widgets, not classic vis-1).
- The **ioBroker.automatic-feeder** adapter, installed and configured with at least one switch:
  - **v1.4.0 or newer** — required, for the numeric timestamps, the `blockReasonCode` and the `feedFor` command.
  - **v1.5.0 or newer** — recommended, additionally enables the live **runtime countdown** in FeederStatus
    (the `status.feedingEndsTs` data point).
  - **v1.6.0 or newer** — recommended for the exact countdown ring of the **AnimatedFeeder** widget
    (the `status.feedingDurationSec` data point).

The widgets only read and write the switch's own `status.*` and `settings.*` data points, so you never have to enter
an object ID by hand.

---

## 3. Installation

1. Install **ioBroker.vis-2-widgets-automatic-feeder** in ioBroker — from the admin adapter list once it is in the
   repository, or directly from GitHub / npm.
2. Open **vis-2**. A new widget set **Automatic Feeder** appears in the widget palette.
3. Drag any of its widgets onto a view (see the Quick start below).

> **After an update:** run `iobroker upload vis-2-widgets-automatic-feeder`, then restart vis-2 (or the whole host)
> and do a hard refresh (Ctrl+F5) in the browser, so the runner picks up the new widget bundle. See
> [Troubleshooting](#8-troubleshooting--faq).

---

## 4. Quick start

1. In vis-2, open a view and drag the **FeederStatus** widget onto it.
2. In the widget's **Attributes → General** group, set the two required fields:
   - **Feeder instance** — pick your `automatic-feeder` instance (usually `0`).
   - **Switch** — pick your feeder from the dropdown; it lists your configured switches **by name**
     (e.g. *KoiTeich Ponton*).
3. The card immediately shows live data. Repeat for the other widgets — the instance/switch selection works the same
   for all of them.

That is all: no object IDs, no bindings, no scripts.

---

## 5. The widgets in detail

Every widget shares the two **General** settings (instance + switch, see [Configuration](#6-configuration)). The
per-widget appearance options are listed with each widget below. All screenshots show the widgets with live data from
a real koi-pond feeder.

### 5.1 FeederStatus

![FeederStatus widget](img/feederstatus.png)

The main card. From top to bottom it shows:

- A status pill: **Ready** (green) or **Blocked** (amber). "Blocked" means the adapter is currently not allowed to
  feed (night, temperature too low, oxygen too low, a pause …).
- An **animated feeder graphic**. While a feeding runs, the impeller/fan spins and — with adapter v1.5.0+ — a
  **runtime countdown** (e.g. `5 s`) appears next to it and counts down to the end of the current feeding.
- The **next feeding**: a large countdown (e.g. *in about 27 min*), the exact time, and the mode
  (*dynamic interval* or *schedule*).
- The **last feeding** with a ✓ (success) or ✗ (error) marker and the adapter's **result** text.
- The **astro window** (sunrise – sunset) used for the day/night logic.
- When blocked, an extra **reason** line with the human-readable block reason.

**Appearance options:** accent colour · **runtime-timer position** (left / right of the graphic) ·
**animation** on/off · **no card background** (to drop the widget onto your own panel).

### 5.2 FeedControl

![FeedControl widget](img/feedcontrol.png)

The control card:

- **Feed now** — a two-step button (first click arms it and shows *Confirm: N s?*, the second click triggers exactly
  one feeding of the chosen duration; it disarms itself after a few seconds if you do not confirm).
- **Portion (manual feeding)** — a slider that sets the duration in seconds (1 … *max duration*).
- **Suspend feeding** — a master switch that immediately suspends **all** feeding for this switch until you turn it
  back off (this maps to the adapter's `pauseNow`, which overrides every mode and every time-based pause).

**Appearance options:** accent colour · **max. duration** (upper end of the slider, default 30 s) ·
**show pause switch** on/off · **no card background**.

> The button writes a one-off feeding via the adapter's `feedFor` command — it does **not** change your schedule and
> does **not** restart the adapter.

### 5.3 Environment

![Environment widget](img/environment.png)

The water/environment card:

- **Water shallow** and **Water deep** temperatures (the deep tile stays at `–` if you did not configure a second,
  deeper sensor).
- A **stratification** pill showing the difference Δ between the two layers (turns amber when the layers differ by
  more than 3 K).
- An **oxygen** pill in mg/l — shown **only** when an O₂ sensor is configured, and turning red if the value falls
  below the configured minimum.
- A **day bar** from sunrise to sunset with a live marker for the current time.

**Appearance options:** accent colour · **no card background**.

### 5.4 DynamicFeeding

![DynamicFeeding widget](img/dynamicfeeding.png)

Shows the **Q10 temperature model** the adapter uses to adapt feeding to the water temperature:

- **Ø temperature** — the averaged temperature the model is based on.
- **Rate (Q10)** — the resulting rate factor (× relative to the reference temperature).
- **Interval** — the resulting feeding interval in minutes.
- **Portion** — the resulting feeding duration in seconds.
- A **source** pill in the header shows whether the model is driven by the **water** or the **air** sensor.

If dynamic feeding is switched off for this switch, the card shows a short hint instead of the tiles.

**Appearance options:** accent colour · **no card background**.

### 5.5 SeasonBanner

![SeasonBanner widget](img/seasonbanner.png)

A single, colour-coded status line — ideal for the top of a view. It always shows the **most important** current
state, in this order of priority:

1. **Manual pause** (red) — the master pause switch is on.
2. **Time-based pause** (amber) — a configured pause window is active, with its end time.
3. **Winter pause** (blue) — the winter window is active.
4. **Automatic active** (green) — nothing blocks feeding, the schedule runs normally.

This widget has **no** appearance options beyond the two General settings.

### 5.6 AnimatedFeeder

![AnimatedFeeder widget while feeding](img/animatedfeeder.png)

A large, animated feeder — the visual centrepiece of a pond dashboard. It draws the feeder on a canvas and reacts
live to the switch:

- **While feeding:** food pellets fall from the outlet and a **countdown ring** with the remaining seconds fills the
  container. The ring is exact when the adapter provides `status.feedingDurationSec` (**v1.6.0+**); with older
  adapters the total duration is derived from the moment the feeding starts.
- **Pause states**, shown as a symbol with a red cross, in the same priority as the SeasonBanner:
  **manual pause** (stop hand) → **time-based pause** (clock) → **winter pause** (snowflake).
- **Idle:** just the feeder, with an optional *"Tap to feed"* hint.

![AnimatedFeeder idle and pause states](img/animatedfeeder-states.png)

**Tap to feed:** tap the widget once to arm it (*Confirm: N s?*), tap again to trigger a one-off feeding of the
configured duration (via `feedFor`). Tapping is ignored while a pause is active, and can be turned off with
**Enable tap-to-feed**.

**Appearance options:** accent colour · a custom **image** (leave empty for the built-in feeder graphic; a custom
image may have a different aspect ratio) · **feed duration** for the tap action · **animation** on/off (the falling
pellets; automatically reduced when the system prefers reduced motion) · **no card background**.

**Geometry options:** the pellet outlet (X/Y) and the countdown (X/Y/size) are given in **%** of the widget, so the
animation can be aligned when you use your own image.

---

## 6. Configuration

Every widget has the same two required settings in the **Attributes → General** group:

![Widget attributes: instance and switch by name](img/config-attributes.png)

- **Feeder instance** — choose your `automatic-feeder` instance from the dropdown (usually `0`).
- **Switch** — choose the feeder from a dropdown that lists your configured switches **by their friendly name**
  (e.g. *KoiTeich Ponton*), not by an internal id. The names come straight from the adapter's own configuration.

Until both are set, a widget shows a friendly *"select a feeder / switch"* hint instead of data.

The optional appearance settings live in the **Attributes → Style** group and differ per widget:

| Option | Widgets | Meaning |
|--------|---------|---------|
| **Accent colour** | all except SeasonBanner | The highlight colour of the card (default pond-aqua `#33c1cf`). |
| **Runtime-timer position** | FeederStatus | Show the running-feeding countdown left or right of the graphic. |
| **Animation** | FeederStatus | Turn the spinning-fan animation on/off. |
| **Max. duration** | FeedControl | Upper end of the portion slider in seconds (default 30). |
| **Show pause switch** | FeedControl | Show/hide the master *Suspend feeding* switch. |
| **No card background** | all except SeasonBanner | Render the widget without its card background, e.g. to place it on a custom panel. |

---

## 7. Which data points each widget uses

For full transparency — the widgets subscribe to the switch channel
`automatic-feeder.<instance>.switches.<switch>.…` and use only these relative data points:

| Widget | Reads | Writes |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (one-off feeding), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |
| **AnimatedFeeder** | `status.feedingActive`, `status.feedingEndsTs`, `status.feedingDurationSec`, `status.winterActive`, `status.pauseManual`, `status.pauseActive` | `feedFor` (tap-to-feed) |

See the [ioBroker.automatic-feeder documentation](https://github.com/ssbingo/ioBroker.automatic-feeder) for the exact
meaning of each data point.

---

## 8. Troubleshooting & FAQ

**A widget only shows "select a feeder / switch".**
Set both **General** fields (instance *and* switch). The switch dropdown is filled from the selected instance, so pick
the instance first.

**The switch dropdown is empty.**
The chosen `automatic-feeder` instance has no configured switches yet, or the instance number is wrong. Configure a
switch in the adapter first.

**Values show `–` or `undefined`.**
Make sure the adapter is **v1.4.0 or newer** (v1.5.0+ for the runtime countdown). Older versions do not provide the
numeric timestamps and command data points the widgets rely on. The **deep water** tile stays `–` unless you
configured a second, deeper sensor; the **oxygen** pill is hidden unless an O₂ sensor is configured — both are normal.

**The runtime countdown never appears.**
It needs adapter **v1.5.0+** (`status.feedingEndsTs`) and is only shown *while a feeding is actually running*.

**New/updated widgets don't appear, or only some are visible.**
This is almost always a stale widget bundle in the browser/runner. Run
`iobroker upload vis-2-widgets-automatic-feeder`, restart vis-2 (or the host), and hard-refresh the browser (Ctrl+F5).

**Does this replace the adapter?**
No. These are only the dashboard widgets. All scheduling, temperature logic and notifications live in the
**ioBroker.automatic-feeder** adapter; the widgets are a view onto it.

---

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
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

---

[Older changelogs can be found there](CHANGELOG_OLD.md)

## Documentation

- 🇩🇪 [Deutsche Dokumentation](doc/de/README.md)
- 🇷🇺 [Документация на русском](doc/ru/README.md)
- 🇳🇱 [Nederlandse documentatie](doc/nl/README.md)
- 🇫🇷 [Documentation française](doc/fr/README.md)
- 🇮🇹 [Documentazione italiana](doc/it/README.md)
- 🇪🇸 [Documentación en español](doc/es/README.md)
- 🇵🇱 [Dokumentacja polska](doc/pl/README.md)
- 🇵🇹 [Documentação portuguesa](doc/pt/README.md)
- 🇺🇦 [Документація українською](doc/uk/README.md)
- 🇨🇳 [简体中文文档](doc/zh-cn/README.md)

## License

MIT License

Copyright (c) 2026 ssbingo <silvio.sternitzke@googlemail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
