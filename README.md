![Logo](admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

[![NPM version](https://img.shields.io/npm/v/iobroker.vis-2-widgets-automatic-feeder.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-automatic-feeder)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-automatic-feeder.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-automatic-feeder)
![Number of Installations](https://iobroker.live/badges/vis-2-widgets-automatic-feeder-installed.svg)
[![License](https://img.shields.io/npm/l/iobroker.vis-2-widgets-automatic-feeder.svg)](https://github.com/ssbingo/ioBroker.vis-2-widgets-automatic-feeder/blob/main/LICENSE)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

---

Ready-made **vis-2 widgets** for the [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder)
adapter — drag-and-drop cards for a fish/pond feeder dashboard. No object IDs, no HTML: you pick your feeder
and your switch **by name**, the widgets do the rest.

## Requirements

- ioBroker **vis-2**
- The **ioBroker.automatic-feeder** adapter, installed and configured:
  - **v1.4.0 or newer** for the numeric timestamps, `blockReasonCode` and the `feedFor` command,
  - **v1.5.0 or newer** additionally for the live **runtime countdown** in the FeederStatus widget (`status.feedingEndsTs`).

The widgets only read/write the switch's own `status.*` / `settings.*` data points — they never need a manual object ID.

## Installation

Install the adapter in ioBroker (from the admin adapter list once it is in the repository, or from GitHub), then
open **vis-2**. A new widget set **Automatic Feeder** appears; drag its widgets onto a view.

## The widgets

| Widget | What it shows |
|--------|---------------|
| **FeederStatus** | Animated feeder graphic with a fan that spins while feeding, a live runtime countdown, the countdown to the next feeding, last feeding / result, the astronomical window and the block reason. |
| **FeedControl** | A **Feed now** button with a two-step confirmation (writes a one-off feeding via `feedFor`), a duration slider, and a master-pause switch. |
| **Environment** | Water temperature (shallow / deep), the stratification Δ, an oxygen pill (hidden automatically if there is no sensor) and a day bar with a live "now" marker. |
| **DynamicFeeding** | The Q10 model tiles: average temperature, rate, interval and portion; shows a hint when dynamic feeding is off. |
| **SeasonBanner** | A single status line, prioritised: manual pause → time-based pause (with end) → winter pause → "automatic active". |

## Configuration

Every widget has just two required settings:

- **Feeder instance** – choose your `automatic-feeder` instance from the dropdown.
- **Switch** – choose the feeder from a dropdown that lists your configured switches **by their friendly name**
  (e.g. *KoiTeich Ponton*), not by an internal id.

Optional appearance settings per widget: **accent colour**, **runtime-timer position** (FeederStatus),
**animation on/off**, **maximum manual duration** (FeedControl), and **no card background** to place the widget on a
custom panel.

## Screenshots

_Screenshots will be added here._

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### 0.0.1 (2026-07-06)
* (ssbingo) Initial version with five widgets — FeederStatus, FeedControl, Environment, DynamicFeeding and SeasonBanner — for the ioBroker.automatic-feeder adapter, configurable by feeder instance and switch name

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
