![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Englisch: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## vis-2 Widgets für den Futterautomaten

Fertige **vis-2 Widgets** für den Adapter [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) — Dashboard-Karten zum Ziehen und Ablegen für einen Fisch- bzw. Teich-Futterautomaten. Du musst **keine Objekt-IDs heraussuchen und kein HTML schreiben**: Du wählst deine Futterautomat-Instanz und deinen Schalter **über den sprechenden Namen** aus, und die Widgets lesen und steuern alles von selbst.

Dieses Dokument ist ein vollständiges Handbuch. Wenn du diese Widgets noch nie benutzt hast, lies es von oben nach unten — der **Schnellstart** bringt dir in wenigen Minuten ein funktionierendes Dashboard, der Rest erklärt jedes Widget und jede Option im Detail.

---

## Inhaltsverzeichnis

1. [Was du bekommst](#1-was-du-bekommst)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Installation](#3-installation)
4. [Schnellstart](#4-schnellstart)
5. [Die Widgets im Detail](#5-die-widgets-im-detail)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
   - [5.6 AnimatedFeeder](#56-animatedfeeder)
6. [Konfiguration](#6-konfiguration)
7. [Welche Datenpunkte jedes Widget nutzt](#7-welche-datenpunkte-jedes-widget-nutzt)
8. [Fehlerbehebung & FAQ](#8-fehlerbehebung--faq)

---

## 1. Was du bekommst

Sechs Widgets, die zusammen ein vollständiges Futterautomat-Dashboard bilden. Jedes ist eine eigenständige Karte mit dunklem, tablet-freundlichem Design und einer Akzentfarbe, die du ändern kannst.

| Widget | Was es anzeigt / tut |
|--------|----------------------|
| **FeederStatus** | Animierte Futterautomat-Grafik (der Lüfter dreht sich während der Fütterung), ein Live-Countdown der Laufzeit, der Countdown bis zur nächsten Fütterung mit Uhrzeit und Modus, die letzte Fütterung und ihr Ergebnis, das astronomische Zeitfenster (Sonnenauf-/-untergang) und — wenn blockiert — der Grund. |
| **FeedControl** | Ein Button **Jetzt füttern** mit zweistufiger Bestätigung, ein Portions-Regler (Dauer) und ein Hauptschalter **Fütterung aussetzen**. |
| **Environment** | Wassertemperatur (flach und tief), die thermische Schichtung Δ, ein Sauerstoffwert (nur angezeigt, wenn ein Sensor vorhanden ist) und ein Tagesbalken mit einer Live-Markierung „Jetzt" zwischen Sonnenauf- und Sonnenuntergang. |
| **DynamicFeeding** | Das Q10-Temperaturmodell auf einen Blick: Durchschnittstemperatur, Ratenfaktor, Intervall und Portion sowie welcher Sensor (Wasser/Luft) es steuert. |
| **SeasonBanner** | Eine einzelne, farbcodierte Statuszeile mit dem aktuell wichtigsten Zustand (manuelle Pause → zeitbasierte Pause → Winterpause → Automatik aktiv). |
| **AnimatedFeeder** | Eine große animierte Futterautomat-Grafik (Canvas): Während der Fütterung fallen Futterpellets und ein Countdown-Ring füllt sich, ansonsten werden Pause-Symbole (manuell / zeitbasiert / Winter) angezeigt. Tippe darauf, um eine einmalige Fütterung auszulösen. |

Alle sechs Widgets sind **Lesen-und-Steuern**: FeederStatus, Environment, DynamicFeeding und SeasonBanner *zeigen* nur Daten an, während FeedControl und AnimatedFeeder auch *schreiben* (löst eine Fütterung aus, schaltet die Pause um). Es wird niemals etwas geschrieben, worum du nicht ausdrücklich gebeten hast.

---

## 2. Voraussetzungen

- ioBroker **vis-2** (das moderne vis; dies sind vis-2-Widgets, nicht das klassische vis-1).
- Der Adapter **ioBroker.automatic-feeder**, installiert und mit mindestens einem Schalter konfiguriert:
  - **v1.4.0 oder neuer** — erforderlich, für die numerischen Zeitstempel, den `blockReasonCode` und den Befehl `feedFor`.
  - **v1.5.0 oder neuer** — empfohlen, aktiviert zusätzlich den Live-**Laufzeit-Countdown** in FeederStatus (den Datenpunkt `status.feedingEndsTs`).
  - **v1.6.0 oder neuer** — empfohlen für den exakten Countdown-Ring des Widgets **AnimatedFeeder** (den Datenpunkt `status.feedingDurationSec`).

Die Widgets lesen und schreiben nur die `status.*`- und `settings.*`-Datenpunkte des jeweiligen Schalters, sodass du niemals eine Objekt-ID von Hand eingeben musst.

---

## 3. Installation

1. Installiere **ioBroker.vis-2-widgets-automatic-feeder** in ioBroker — aus der Admin-Adapterliste, sobald der Adapter im Repository ist, oder direkt von GitHub / npm.
2. Öffne **vis-2**. In der Widget-Palette erscheint ein neuer Widget-Satz **Automatischer Futterautomat**.
3. Ziehe eines seiner Widgets auf eine View (siehe Schnellstart unten).

> **Nach einem Update:** Führe `iobroker upload vis-2-widgets-automatic-feeder` aus, starte dann vis-2 (oder den ganzen Host) neu und lade die Seite im Browser hart neu (Strg+F5), damit der Runner das neue Widget-Bundle übernimmt. Siehe [Fehlerbehebung](#8-fehlerbehebung--faq).

---

## 4. Schnellstart

1. Öffne in vis-2 eine View und ziehe das Widget **FeederStatus** darauf.
2. Setze in der Attributgruppe **Attribute → Allgemein** des Widgets die beiden Pflichtfelder:
   - **Futterautomat-Instanz** — wähle deine `automatic-feeder`-Instanz (meist `0`).
   - **Schalter** — wähle deinen Futterautomaten aus dem Dropdown; es listet deine konfigurierten Schalter **nach Namen** auf (z. B. *KoiTeich Ponton*).
3. Die Karte zeigt sofort Live-Daten. Wiederhole dies für die anderen Widgets — die Auswahl von Instanz/Schalter funktioniert bei allen gleich.

Das ist alles: keine Objekt-IDs, keine Bindungen, keine Skripte.

---

## 5. Die Widgets im Detail

Jedes Widget teilt sich die beiden **Allgemein**-Einstellungen (Instanz + Schalter, siehe [Konfiguration](#6-konfiguration)). Die widget-spezifischen Darstellungsoptionen sind bei jedem Widget unten aufgeführt. Alle Screenshots zeigen die Widgets mit Live-Daten von einem echten Koiteich-Futterautomaten.

### 5.1 FeederStatus

![FeederStatus-Widget](../../img/feederstatus.png)

Die Hauptkarte. Von oben nach unten zeigt sie:

- Ein Status-Label: **Betriebsbereit** (grün) oder **Blockiert** (bernsteinfarben). „Blockiert" bedeutet, dass der Adapter aktuell nicht füttern darf (Nacht, Temperatur zu niedrig, Sauerstoff zu niedrig, eine Pause …).
- Eine **animierte Futterautomat-Grafik**. Während einer Fütterung dreht sich der Impeller/Lüfter und — mit Adapter v1.5.0+ — erscheint daneben ein **Laufzeit-Countdown** (z. B. `5 s`), der bis zum Ende der aktuellen Fütterung herunterzählt.
- Die **nächste Fütterung**: ein großer Countdown (z. B. *in ca. 27 min*), die genaue Uhrzeit und der Modus (*dynamisches Intervall* oder *Zeitplan*).
- Die **letzte Fütterung** mit einer Markierung ✓ (Erfolg) oder ✗ (Fehler) und dem **Ergebnis**-Text des Adapters.
- Das **Astro-Fenster** (Sonnenaufgang – Sonnenuntergang), das für die Tag-/Nacht-Logik genutzt wird.
- Bei Blockade eine zusätzliche **Grund**-Zeile mit dem lesbaren Blockierungsgrund.

**Darstellungsoptionen:** Akzentfarbe · **Position des Laufzeit-Timers** (links / rechts von der Grafik) · **Animation** ein/aus · **Ohne Kartenhintergrund** (um das Widget auf deinem eigenen Panel abzulegen).

### 5.2 FeedControl

![FeedControl-Widget](../../img/feedcontrol.png)

Die Bedienkarte:

- **Jetzt füttern** — ein zweistufiger Button (der erste Klick schärft ihn und zeigt *Bestätigen: N s?*, der zweite Klick löst genau eine Fütterung mit der gewählten Dauer aus; er entschärft sich nach ein paar Sekunden von selbst, wenn du nicht bestätigst).
- **Portion (Handfütterung)** — ein Regler, der die Dauer in Sekunden einstellt (1 … *max. Dauer*).
- **Fütterung aussetzen** — ein Hauptschalter, der sofort **alle** Fütterungen dieses Schalters aussetzt, bis du ihn wieder ausschaltest (dies entspricht dem `pauseNow` des Adapters, das jeden Modus und jede zeitbasierte Pause übersteuert).

**Darstellungsoptionen:** Akzentfarbe · **Max. Dauer** (oberes Ende des Reglers, Standard 30 s) · **Pause-Schalter anzeigen** ein/aus · **Ohne Kartenhintergrund**.

> Der Button schreibt eine einmalige Fütterung über den Befehl `feedFor` des Adapters — er ändert **nicht** deinen Zeitplan und startet den Adapter **nicht** neu.

### 5.3 Environment

![Environment-Widget](../../img/environment.png)

Die Wasser-/Umgebungskarte:

- Temperaturen **Wasser flach** und **Wasser tief** (die Kachel „tief" bleibt auf `–`, wenn du keinen zweiten, tieferen Sensor konfiguriert hast).
- Ein **Schichtungs**-Label, das die Differenz Δ zwischen den beiden Schichten zeigt (wird bernsteinfarben, wenn sich die Schichten um mehr als 3 K unterscheiden).
- Ein **Sauerstoff**-Label in mg/l — **nur** angezeigt, wenn ein O₂-Sensor konfiguriert ist, und rot, wenn der Wert unter das konfigurierte Minimum fällt.
- Ein **Tagesbalken** von Sonnenaufgang bis Sonnenuntergang mit einer Live-Markierung für die aktuelle Uhrzeit.

**Darstellungsoptionen:** Akzentfarbe · **Ohne Kartenhintergrund**.

### 5.4 DynamicFeeding

![DynamicFeeding-Widget](../../img/dynamicfeeding.png)

Zeigt das **Q10-Temperaturmodell**, mit dem der Adapter die Fütterung an die Wassertemperatur anpasst:

- **Ø-Temperatur** — die gemittelte Temperatur, auf der das Modell basiert.
- **Rate (Q10)** — der resultierende Ratenfaktor (× relativ zur Referenztemperatur).
- **Intervall** — das resultierende Fütterungsintervall in Minuten.
- **Portion** — die resultierende Fütterungsdauer in Sekunden.
- Ein **Quelle**-Label im Kopfbereich zeigt, ob das Modell vom **Wasser**- oder vom **Luft**-Sensor gesteuert wird.

Ist die dynamische Fütterung für diesen Schalter ausgeschaltet, zeigt die Karte statt der Kacheln einen kurzen Hinweis.

**Darstellungsoptionen:** Akzentfarbe · **Ohne Kartenhintergrund**.

### 5.5 SeasonBanner

![SeasonBanner-Widget](../../img/seasonbanner.png)

Eine einzelne, farbcodierte Statuszeile — ideal für den oberen Rand einer View. Sie zeigt immer den **wichtigsten** aktuellen Zustand, in dieser Prioritätsreihenfolge:

1. **Manuelle Pause** (rot) — der Haupt-Pause-Schalter ist an.
2. **Zeitbasierte Pause** (bernsteinfarben) — ein konfiguriertes Pausenfenster ist aktiv, mit seiner Endzeit.
3. **Winterpause** (blau) — das Winterfenster ist aktiv.
4. **Automatik aktiv** (grün) — nichts blockiert die Fütterung, der Zeitplan läuft normal.

Dieses Widget hat **keine** Darstellungsoptionen außer den beiden Allgemein-Einstellungen.

### 5.6 AnimatedFeeder

![AnimatedFeeder-Widget während der Fütterung](../../img/animatedfeeder.png)

Ein großer, animierter Futterautomat — das visuelle Herzstück eines Teich-Dashboards. Er zeichnet den Futterautomaten auf einem Canvas und reagiert live auf den Schalter:

- **Während der Fütterung:** Futterpellets fallen aus dem Auslass und ein **Countdown-Ring** mit den verbleibenden Sekunden füllt den Behälter. Der Ring ist exakt, wenn der Adapter `status.feedingDurationSec` liefert (**v1.6.0+**); bei älteren Adaptern wird die Gesamtdauer aus dem Startzeitpunkt der Fütterung abgeleitet.
- **Pause-Zustände**, dargestellt als Symbol mit einem roten Kreuz, in derselben Priorität wie beim SeasonBanner: **manuelle Pause** (Stopp-Hand) → **zeitbasierte Pause** (Uhr) → **Winterpause** (Schneeflocke).
- **Untätig:** nur der Futterautomat, mit einem optionalen Hinweis *„Zum Füttern tippen"*.

![AnimatedFeeder im Ruhe- und Pausenzustand](../../img/animatedfeeder-states.png)

**Zum Füttern tippen:** Tippe einmal auf das Widget, um es zu schärfen (*Bestätigen: N s?*), tippe erneut, um eine einmalige Fütterung mit der konfigurierten Dauer auszulösen (über `feedFor`). Das Tippen wird ignoriert, solange eine Pause aktiv ist, und kann mit **Zum-Füttern-Tippen aktivieren** abgeschaltet werden.

**Darstellungsoptionen:** Akzentfarbe · ein eigenes **Bild** (leer lassen für die eingebaute Futterautomat-Grafik; ein eigenes Bild kann ein anderes Seitenverhältnis haben) · **Fütterungsdauer** für die Tipp-Aktion · **Animation** ein/aus (die fallenden Pellets; automatisch reduziert, wenn das System reduzierte Bewegung bevorzugt) · **Ohne Kartenhintergrund**.

**Geometrie-Optionen:** Der Pellet-Auslass (X/Y) und der Countdown (X/Y/Größe) werden in **%** des Widgets angegeben, sodass die Animation ausgerichtet werden kann, wenn du dein eigenes Bild verwendest.

---

## 6. Konfiguration

Jedes Widget hat dieselben beiden Pflichteinstellungen in der Gruppe **Attribute → Allgemein**:

![Widget-Attribute: Instanz und Schalter nach Namen](../../img/config-attributes.png)

- **Futterautomat-Instanz** — wähle deine `automatic-feeder`-Instanz aus dem Dropdown (meist `0`).
- **Schalter** — wähle den Futterautomaten aus einem Dropdown, das deine konfigurierten Schalter **nach ihrem sprechenden Namen** auflistet (z. B. *KoiTeich Ponton*), nicht nach einer internen ID. Die Namen stammen direkt aus der Konfiguration des Adapters.

Solange nicht beide gesetzt sind, zeigt ein Widget statt Daten einen freundlichen Hinweis *„Futterautomaten / Schalter auswählen"*.

Die optionalen Darstellungseinstellungen befinden sich in der Gruppe **Attribute → Darstellung** und unterscheiden sich je Widget:

| Option | Widgets | Bedeutung |
|--------|---------|---------|
| **Akzentfarbe** | alle außer SeasonBanner | Die Hervorhebungsfarbe der Karte (Standard Teich-Aqua `#33c1cf`). |
| **Position des Laufzeit-Timers** | FeederStatus | Zeigt den Countdown der laufenden Fütterung links oder rechts von der Grafik. |
| **Animation** | FeederStatus | Schaltet die Animation des sich drehenden Lüfters ein/aus. |
| **Max. Dauer** | FeedControl | Oberes Ende des Portions-Reglers in Sekunden (Standard 30). |
| **Pause-Schalter anzeigen** | FeedControl | Blendet den Hauptschalter *Fütterung aussetzen* ein/aus. |
| **Ohne Kartenhintergrund** | alle außer SeasonBanner | Rendert das Widget ohne seinen Kartenhintergrund, z. B. um es auf einem eigenen Panel zu platzieren. |

---

## 7. Welche Datenpunkte jedes Widget nutzt

Zur vollständigen Transparenz — die Widgets abonnieren den Schalter-Kanal `automatic-feeder.<instance>.switches.<switch>.…` und verwenden nur diese relativen Datenpunkte:

| Widget | Liest | Schreibt |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (einmalige Fütterung), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |
| **AnimatedFeeder** | `status.feedingActive`, `status.feedingEndsTs`, `status.feedingDurationSec`, `status.winterActive`, `status.pauseManual`, `status.pauseActive` | `feedFor` (Zum-Füttern-Tippen) |

Die genaue Bedeutung jedes Datenpunkts findest du in der [Dokumentation von ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder).

---

## 8. Fehlerbehebung & FAQ

**Ein Widget zeigt nur „Futterautomaten / Schalter auswählen".**
Setze beide **Allgemein**-Felder (Instanz *und* Schalter). Das Schalter-Dropdown wird aus der gewählten Instanz befüllt, wähle also zuerst die Instanz.

**Das Schalter-Dropdown ist leer.**
Die gewählte `automatic-feeder`-Instanz hat noch keine konfigurierten Schalter, oder die Instanznummer ist falsch. Konfiguriere zuerst einen Schalter im Adapter.

**Werte zeigen `–` oder `undefined`.**
Stelle sicher, dass der Adapter **v1.4.0 oder neuer** ist (v1.5.0+ für den Laufzeit-Countdown). Ältere Versionen liefern die numerischen Zeitstempel und Befehls-Datenpunkte nicht, auf die sich die Widgets stützen. Die Kachel **Wasser tief** bleibt `–`, sofern du keinen zweiten, tieferen Sensor konfiguriert hast; das **Sauerstoff**-Label ist ausgeblendet, sofern kein O₂-Sensor konfiguriert ist — beides ist normal.

**Der Laufzeit-Countdown erscheint nie.**
Er benötigt Adapter **v1.5.0+** (`status.feedingEndsTs`) und wird nur angezeigt, *während tatsächlich eine Fütterung läuft*.

**Neue/aktualisierte Widgets erscheinen nicht, oder nur einige sind sichtbar.**
Das ist fast immer ein veraltetes Widget-Bundle im Browser/Runner. Führe `iobroker upload vis-2-widgets-automatic-feeder` aus, starte vis-2 (oder den Host) neu und lade den Browser hart neu (Strg+F5).

**Ersetzt das den Adapter?**
Nein. Dies sind nur die Dashboard-Widgets. Die gesamte Zeitplanung, Temperaturlogik und die Benachrichtigungen liegen im Adapter **ioBroker.automatic-feeder**; die Widgets sind nur eine Ansicht darauf.
