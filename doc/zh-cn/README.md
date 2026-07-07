![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 英文: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## 自动喂食器的 vis-2 控件

为 [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) 适配器打造的开箱即用 **vis-2 控件**——面向鱼缸 / 池塘喂食器的拖放式仪表盘卡片。**无需查找对象 ID，也无需编写任何 HTML**：您只需**按友好名称**选择您的喂食器实例和开关，控件便会自行读取并控制一切。

本文档是一份完整的手册。如果您以前从未使用过这些控件，请从头到尾阅读一遍——**快速上手**能让您在几分钟内搭建出一个可用的仪表盘，其余部分则会详细讲解每个控件和每个选项。

---

## 目录

1. [您将获得什么](#1-您将获得什么)
2. [系统要求](#2-系统要求)
3. [安装](#3-安装)
4. [快速上手](#4-快速上手)
5. [各控件详解](#5-各控件详解)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
   - [5.6 AnimatedFeeder](#56-animatedfeeder)
6. [配置](#6-配置)
7. [每个控件使用的数据点](#7-每个控件使用的数据点)
8. [故障排除与常见问题](#8-故障排除与常见问题)

---

## 1. 您将获得什么

六个控件，它们共同构成一个完整的喂食器仪表盘。每个控件都是一张独立的卡片，采用适合平板的深色设计，并带有可自定义的强调色。

| 控件 | 显示 / 功能 |
|--------|----------------------|
| **FeederStatus** | 动画喂食器图形（喂食时风扇会转动）、实时运行倒计时、下一次喂食的倒计时（含时间和模式）、上一次喂食及其结果、天文（日出/日落）时段，以及在被阻止时显示原因。 |
| **FeedControl** | 带两步确认的**立即喂食**按钮、份量（时长）滑块，以及一个总**暂停喂食**开关。 |
| **Environment** | 水温（浅层和深层）、热分层 Δ、氧气读数（仅在存在传感器时显示），以及一条在日出与日落之间带有实时“当前”标记的日间进度条。 |
| **DynamicFeeding** | 一目了然的 Q10 温度模型：平均温度、速率系数、间隔和份量，以及由哪个传感器（水温/气温）驱动。 |
| **SeasonBanner** | 一行按颜色编码的状态栏，显示当前最重要的状态（手动暂停 → 定时暂停 → 冬季暂停 → 自动运行）。 |
| **AnimatedFeeder** | 一个大型动画喂食器图形（canvas）：喂食时饲料颗粒落下，并有一个倒计时环逐渐填满；其余情况下显示暂停符号（手动 / 定时 / 冬季）。轻触即可触发一次性喂食。 |

这六个控件都是**读取与控制**型：FeederStatus、Environment、DynamicFeeding 和 SeasonBanner 只*显示*数据，而 FeedControl 和 AnimatedFeeder 还会*写入*（触发喂食、切换暂停）。凡是您未明确请求的内容，绝不会被写入。

---

## 2. 系统要求

- ioBroker **vis-2**（新版 vis；这些是 vis-2 控件，而非经典的 vis-1）。
- 已安装并至少配置了一个开关的 **ioBroker.automatic-feeder** 适配器：
  - **v1.4.0 或更高版本**——必需，用于数字时间戳、`blockReasonCode` 和 `feedFor` 命令。
  - **v1.5.0 或更高版本**——推荐，可额外启用 FeederStatus 中的实时**运行倒计时**（`status.feedingEndsTs` 数据点）。
  - **v1.6.0 或更高版本**——推荐，用于 **AnimatedFeeder** 控件的精确倒计时环（`status.feedingDurationSec` 数据点）。

控件只读取和写入开关自身的 `status.*` 和 `settings.*` 数据点，因此您永远无需手动输入对象 ID。

---

## 3. 安装

1. 在 ioBroker 中安装 **ioBroker.vis-2-widgets-automatic-feeder**——待其进入软件仓库后可从 admin 适配器列表安装，或直接从 GitHub / npm 安装。
2. 打开 **vis-2**。控件面板中会出现一个新的控件集 **自动喂食器**。
3. 将其中任意控件拖到视图上（参见下面的快速上手）。

> **更新之后：** 运行 `iobroker upload vis-2-widgets-automatic-feeder`，然后重启 vis-2（或整个主机），并在浏览器中执行强制刷新（Ctrl+F5），以便运行器加载新的控件包。参见[故障排除](#8-故障排除与常见问题)。

---

## 4. 快速上手

1. 在 vis-2 中打开一个视图，并将 **FeederStatus** 控件拖到上面。
2. 在控件的 **Attributes → General**（属性 → 常规）组中，设置两个必填字段：
   - **Feeder instance**（喂食器实例）——选择您的 `automatic-feeder` 实例（通常为 `0`）。
   - **Switch**（开关）——从下拉列表中选择您的喂食器；该列表**按名称**列出您已配置的开关（例如 *KoiTeich Ponton*）。
3. 卡片会立即显示实时数据。对其他控件重复上述操作——所有控件的实例/开关选择方式都相同。

就这么简单：没有对象 ID，没有绑定，也没有脚本。

---

## 5. 各控件详解

每个控件都共用两个 **General**（常规）设置（实例 + 开关，参见[配置](#6-配置)）。各控件专有的外观选项在下面随每个控件一同列出。所有截图展示的都是来自真实锦鲤池喂食器的实时数据。

### 5.1 FeederStatus

![FeederStatus 控件](../../img/feederstatus.png)

主卡片。从上到下依次显示：

- 一个状态标签：**Ready**（就绪，绿色）或 **Blocked**（已阻止，琥珀色）。“Blocked”表示适配器当前不允许喂食（夜间、温度过低、氧气过低、处于暂停等）。
- 一个**动画喂食器图形**。喂食进行时，叶轮/风扇会转动；在适配器 v1.5.0+ 下，旁边还会出现一个**运行倒计时**（例如 `5 s`），倒数至本次喂食结束。
- **下一次喂食**：一个大号倒计时（例如 *约 27 分钟后*）、确切时间，以及模式（*动态间隔* 或 *计划*）。
- **上一次喂食**，带有 ✓（成功）或 ✗（错误）标记以及适配器的**结果**文本。
- 用于昼/夜逻辑的**天文时段**（日出 – 日落）。
- 被阻止时，会额外显示一行**原因**，给出可读的阻止原因。

**外观选项：** 强调色 · **运行计时器位置**（图形的左侧 / 右侧）· **动画**开/关 · **无卡片背景**（以便将控件放到您自己的面板上）。

### 5.2 FeedControl

![FeedControl 控件](../../img/feedcontrol.png)

控制卡片：

- **立即喂食**——一个两步按钮（第一次点击将其激活并显示 *确认：N 秒？*，第二次点击将精确触发一次所选时长的喂食；若您不确认，几秒后它会自动取消激活）。
- **份量（手动喂食）**——一个设置时长（秒）的滑块（1 … *最大时长*）。
- **暂停喂食**——一个总开关，它会立即暂停此开关的**所有**喂食，直到您将其关闭为止（对应适配器的 `pauseNow`，它会覆盖所有模式和所有定时暂停）。

**外观选项：** 强调色 · **最大时长**（滑块的上限，默认 30 秒）· **显示暂停开关**开/关 · **无卡片背景**。

> 该按钮通过适配器的 `feedFor` 命令写入一次性喂食——它**不会**更改您的计划，也**不会**重启适配器。

### 5.3 Environment

![Environment 控件](../../img/environment.png)

水质/环境卡片：

- **浅层水温**和**深层水温**（如果您未配置第二个更深的传感器，深层磁贴将保持为 `–`）。
- 一个**分层**标签，显示两层之间的温差 Δ（当两层温差超过 3 K 时变为琥珀色）。
- 一个以 mg/l 为单位的**氧气**标签——**仅**在配置了 O₂ 传感器时显示，当数值低于所配置的最小值时会变为红色。
- 一条从日出到日落的**日间进度条**，带有指示当前时间的实时标记。

**外观选项：** 强调色 · **无卡片背景**。

### 5.4 DynamicFeeding

![DynamicFeeding 控件](../../img/dynamicfeeding.png)

显示适配器用于根据水温调整喂食的 **Q10 温度模型**：

- **Ø 温度**——模型所依据的平均温度。
- **速率 (Q10)**——由此得出的速率系数（相对于参考温度的倍数 ×）。
- **间隔**——由此得出的喂食间隔（分钟）。
- **份量**——由此得出的喂食时长（秒）。
- 标题栏中的**来源**标签显示模型由**水温**传感器还是**气温**传感器驱动。

如果此开关关闭了动态喂食，卡片会显示一条简短提示，而不显示这些磁贴。

**外观选项：** 强调色 · **无卡片背景**。

### 5.5 SeasonBanner

![SeasonBanner 控件](../../img/seasonbanner.png)

一行按颜色编码的状态栏——非常适合放在视图顶部。它始终按以下优先级显示当前**最重要**的状态：

1. **手动暂停**（红色）——总暂停开关已开启。
2. **定时暂停**（琥珀色）——已配置的暂停时段处于激活状态，并显示其结束时间。
3. **冬季暂停**（蓝色）——冬季时段处于激活状态。
4. **自动运行**（绿色）——没有任何因素阻止喂食，计划正常运行。

除了两个 General（常规）设置外，此控件**没有**其他外观选项。

### 5.6 AnimatedFeeder

![喂食中的 AnimatedFeeder 控件](../../img/animatedfeeder.png)

一个大型的动画喂食器——池塘仪表盘的视觉核心。它在 canvas 上绘制喂食器，并实时对开关做出反应：

- **喂食时：** 饲料颗粒从出料口落下，一个显示剩余秒数的**倒计时环**逐渐填满容器。当适配器提供 `status.feedingDurationSec`（**v1.6.0+**）时，该环是精确的；在较旧的适配器上，总时长则从喂食开始的时刻推算得出。
- **暂停状态**，以带红色叉号的符号显示，其优先级与 SeasonBanner 相同：**手动暂停**（停止手势）→ **定时暂停**（时钟）→ **冬季暂停**（雪花）。
- **空闲时：** 仅显示喂食器，并带有一个可选的 *“轻触喂食”* 提示。

![AnimatedFeeder 的空闲与暂停状态](../../img/animatedfeeder-states.png)

**轻触喂食：** 轻触控件一次将其激活（*确认：N 秒？*），再次轻触即可触发一次所配置时长的一次性喂食（通过 `feedFor`）。暂停激活期间轻触将被忽略，并且可通过 **Enable tap-to-feed** 将其关闭。

**外观选项：** 强调色 · 自定义**图片**（留空则使用内置的喂食器图形；自定义图片的宽高比可能不同）· 轻触操作的**喂食时长** · **动画**开/关（落下的饲料颗粒；当系统偏好减少动态效果时会自动减弱）· **无卡片背景**。

**几何选项：** 出料口（X/Y）与倒计时（X/Y/大小）均以控件的**百分比（%）**给出，因此在使用您自己的图片时可以对齐动画。

---

## 6. 配置

每个控件在 **Attributes → General**（属性 → 常规）组中都有相同的两个必填设置：

![控件属性：按名称选择实例和开关](../../img/config-attributes.png)

- **Feeder instance**（喂食器实例）——从下拉列表中选择您的 `automatic-feeder` 实例（通常为 `0`）。
- **Switch**（开关）——从下拉列表中选择喂食器，该列表**按友好名称**（例如 *KoiTeich Ponton*）而非内部 id 列出您已配置的开关。这些名称直接来自适配器自身的配置。

在两者都设置好之前，控件会显示一条友好的 *“请选择喂食器 / 开关”* 提示，而不显示数据。

可选的外观设置位于 **Attributes → Style**（属性 → 样式）组中，各控件各不相同：

| 选项 | 适用控件 | 含义 |
|--------|---------|---------|
| **强调色** | 除 SeasonBanner 外的所有控件 | 卡片的高亮颜色（默认池水青 `#33c1cf`）。 |
| **运行计时器位置** | FeederStatus | 将进行中喂食的倒计时显示在图形的左侧或右侧。 |
| **动画** | FeederStatus | 开启/关闭风扇旋转动画。 |
| **最大时长** | FeedControl | 份量滑块的上限（秒，默认 30）。 |
| **显示暂停开关** | FeedControl | 显示/隐藏总*暂停喂食*开关。 |
| **无卡片背景** | 除 SeasonBanner 外的所有控件 | 渲染控件时不带卡片背景，例如以便将其放到自定义面板上。 |

---

## 7. 每个控件使用的数据点

为了完全透明——控件订阅开关通道 `automatic-feeder.<instance>.switches.<switch>.…`，且仅使用以下相对数据点：

| 控件 | 读取 | 写入 |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`、`status.feedingEndsTs`、`status.nextFeeding(Ts)`、`status.lastFeeding`、`status.lastResult`、`status.blocked`、`status.blockReason(Code)`、`status.error`、`status.sunrise`、`status.sunset`、`settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`、`status.feedingActive` | `feedFor`（一次性喂食）、`settings.pauseNow` |
| **Environment** | `status.waterTemperature`、`status.waterTemperatureDeep`、`status.waterStratification`、`status.oxygen`、`status.sunrise(Ts)`、`status.sunset(Ts)`、`settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`、`settings.dynamicSource`、`status.dynamicAvgTemperature`、`status.dynamicRate`、`status.dynamicIntervalMin`、`status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`、`status.pauseActive`、`status.pauseActiveUntil`、`status.pauseManual`、`settings.winterWindow` | — |
| **AnimatedFeeder** | `status.feedingActive`、`status.feedingEndsTs`、`status.feedingDurationSec`、`status.winterActive`、`status.pauseManual`、`status.pauseActive` | `feedFor`（轻触喂食） |

有关每个数据点的确切含义，请参阅 [ioBroker.automatic-feeder 文档](https://github.com/ssbingo/ioBroker.automatic-feeder)。

---

## 8. 故障排除与常见问题

**某个控件只显示“请选择喂食器 / 开关”。**
请设置两个 **General**（常规）字段（实例*和*开关）。开关下拉列表是根据所选实例填充的，因此请先选择实例。

**开关下拉列表为空。**
所选的 `automatic-feeder` 实例尚未配置任何开关，或者实例编号有误。请先在适配器中配置一个开关。

**数值显示为 `–` 或 `undefined`。**
请确保适配器为 **v1.4.0 或更高版本**（运行倒计时需要 v1.5.0+）。旧版本不提供控件所依赖的数字时间戳和命令数据点。除非您配置了第二个更深的传感器，否则**深层水温**磁贴会保持为 `–`；除非配置了 O₂ 传感器，否则**氧气**标签会被隐藏——这两种情况都属正常。

**运行倒计时始终不出现。**
它需要适配器 **v1.5.0+**（`status.feedingEndsTs`），并且*仅在喂食实际进行时*才会显示。

**新的/更新后的控件不出现，或只有部分可见。**
这几乎总是浏览器/运行器中的控件包已过时所致。请运行 `iobroker upload vis-2-widgets-automatic-feeder`，重启 vis-2（或主机），并强制刷新浏览器（Ctrl+F5）。

**这会取代适配器吗？**
不会。这些只是仪表盘控件。所有的计划安排、温度逻辑和通知都在 **ioBroker.automatic-feeder** 适配器中；控件只是它的一个展示界面。
