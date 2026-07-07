![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Engels: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## vis-2 widgets voor de Automatic Feeder

Kant-en-klare **vis-2 widgets** voor de [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder)-adapter
— dashboardkaarten voor een vis- / vijvervoederautomaat die je met slepen-en-neerzetten plaatst. Er zijn **geen
object-ID's op te zoeken en geen HTML te schrijven**: je kiest je voederautomaat-instantie en je switch **op de
vriendelijke naam**, en de widgets lezen en besturen alles zelf.

Dit document is een volledige handleiding. Als je deze widgets nog nooit hebt gebruikt, lees het dan van boven naar
beneden — met de **Snelstart** heb je in een paar minuten een werkend dashboard, de rest legt elk widget en elke optie
in detail uit.

---

## Inhoudsopgave

1. [Wat je krijgt](#1-wat-je-krijgt)
2. [Vereisten](#2-vereisten)
3. [Installatie](#3-installatie)
4. [Snelstart](#4-snelstart)
5. [De widgets in detail](#5-de-widgets-in-detail)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
   - [5.6 AnimatedFeeder](#56-animatedfeeder)
6. [Configuratie](#6-configuratie)
7. [Welke datapunten elk widget gebruikt](#7-welke-datapunten-elk-widget-gebruikt)
8. [Probleemoplossing & FAQ](#8-probleemoplossing--faq)

---

## 1. Wat je krijgt

Zes widgets die samen een compleet voederautomaat-dashboard vormen. Elk widget is een op zichzelf staande kaart met een
donker, tabletvriendelijk ontwerp en een accentkleur die je kunt aanpassen.

| Widget | Wat het toont / doet |
|--------|----------------------|
| **FeederStatus** | Geanimeerde voederautomaat-afbeelding (de ventilator draait tijdens het voeren), een live aftelling van de looptijd, het aftellen tot de volgende voedering met tijd en modus, de laatste voedering en het resultaat ervan, het astronomische venster (zonsopkomst/zonsondergang) en — indien geblokkeerd — de reden. |
| **FeedControl** | Een knop **Nu voeren** met een bevestiging in twee stappen, een schuifregelaar voor de portie (duur) en een hoofdschakelaar **voeren opschorten**. |
| **Environment** | Watertemperatuur (ondiep en diep), de thermische stratificatie Δ, een zuurstofmeting (alleen getoond als er een sensor aanwezig is) en een dagbalk met een live "nu"-markering tussen zonsopkomst en zonsondergang. |
| **DynamicFeeding** | Het Q10-temperatuurmodel in één oogopslag: gemiddelde temperatuur, snelheidsfactor, interval en portie, plus welke sensor (water/lucht) het aanstuurt. |
| **SeasonBanner** | Eén kleurgecodeerde statusregel met de op dit moment belangrijkste toestand (handmatige pauze → tijdgebonden pauze → winterpauze → automatisch actief). |
| **AnimatedFeeder** | Een grote geanimeerde voederautomaat-afbeelding (canvas): tijdens het voeren vallen er voederkorrels en vult zich een aftelring, anders pauzesymbolen (handmatig / tijdgebonden / winter). Tik erop om een eenmalige voedering te starten. |

Alle zes widgets zijn **lezen-en-besturen**: FeederStatus, Environment, DynamicFeeding en SeasonBanner *tonen* alleen
gegevens, terwijl FeedControl en AnimatedFeeder ook *schrijven* (start een voedering, schakelt de pauze). Er wordt nooit iets geschreven
waar je niet uitdrukkelijk om hebt gevraagd.

---

## 2. Vereisten

- ioBroker **vis-2** (de moderne vis; dit zijn vis-2 widgets, niet de klassieke vis-1).
- De **ioBroker.automatic-feeder**-adapter, geïnstalleerd en geconfigureerd met minstens één switch:
  - **v1.4.0 of nieuwer** — vereist, voor de numerieke tijdstempels, de `blockReasonCode` en het `feedFor`-commando.
  - **v1.5.0 of nieuwer** — aanbevolen, schakelt daarnaast de live **looptijd-aftelling** in FeederStatus in
    (het datapunt `status.feedingEndsTs`).
  - **v1.6.0 of nieuwer** — aanbevolen voor de exacte aftelring van het **AnimatedFeeder**-widget
    (het datapunt `status.feedingDurationSec`).

De widgets lezen en schrijven alleen de eigen `status.*`- en `settings.*`-datapunten van de switch, zodat je nooit met de
hand een object-ID hoeft in te voeren.

---

## 3. Installatie

1. Installeer **ioBroker.vis-2-widgets-automatic-feeder** in ioBroker — via de adapterlijst in admin zodra het in de
   repository staat, of rechtstreeks via GitHub / npm.
2. Open **vis-2**. Er verschijnt een nieuwe widgetset **Automatische voederautomaat** in het widgetpalet.
3. Sleep een van de widgets op een view (zie de Snelstart hieronder).

> **Na een update:** voer `iobroker upload vis-2-widgets-automatic-feeder` uit, herstart daarna vis-2 (of de hele host)
> en doe een harde vernieuwing (Ctrl+F5) in de browser, zodat de runner de nieuwe widgetbundel oppikt. Zie
> [Probleemoplossing](#8-probleemoplossing--faq).

---

## 4. Snelstart

1. Open in vis-2 een view en sleep het **FeederStatus**-widget erop.
2. Stel in de groep **Attributen → Algemeen** van het widget de twee vereiste velden in:
   - **Voederautomaat-instantie** — kies je `automatic-feeder`-instantie (meestal `0`).
   - **Switch** — kies je voederautomaat uit de keuzelijst; deze toont je geconfigureerde switches **op naam**
     (bijv. *KoiTeich Ponton*).
3. De kaart toont onmiddellijk live gegevens. Herhaal dit voor de andere widgets — de instantie-/switchkeuze werkt bij
   allemaal hetzelfde.

Dat is alles: geen object-ID's, geen bindingen, geen scripts.

---

## 5. De widgets in detail

Elk widget deelt de twee **Algemeen**-instellingen (instantie + switch, zie [Configuratie](#6-configuratie)). De
weergaveopties per widget staan hieronder bij elk widget vermeld. Alle schermafbeeldingen tonen de widgets met live
gegevens van een echte koivijver-voederautomaat.

### 5.1 FeederStatus

![FeederStatus-widget](../../img/feederstatus.png)

De hoofdkaart. Van boven naar beneden toont deze:

- Een statuslabel: **Klaar** (groen) of **Geblokkeerd** (amber). "Geblokkeerd" betekent dat de adapter op dit moment
  niet mag voeren (nacht, temperatuur te laag, zuurstof te laag, een pauze …).
- Een **geanimeerde voederautomaat-afbeelding**. Terwijl een voedering loopt, draait de rotor/ventilator en — met
  adapter v1.5.0+ — verschijnt er een **looptijd-aftelling** (bijv. `5 s`) ernaast die aftelt tot het einde van de
  huidige voedering.
- De **volgende voedering**: een grote aftelling (bijv. *over ongeveer 27 min*), de exacte tijd en de modus
  (*dynamisch interval* of *schema*).
- De **laatste voedering** met een ✓ (succes)- of ✗ (fout)-markering en de **resultaat**tekst van de adapter.
- Het **astro-venster** (zonsopkomst – zonsondergang) dat wordt gebruikt voor de dag/nacht-logica.
- Indien geblokkeerd, een extra **reden**regel met de leesbare blokkeerreden.

**Weergaveopties:** accentkleur · **positie van de looptijd-timer** (links / rechts van de afbeelding) ·
**animatie** aan/uit · **geen kaartachtergrond** (om het widget op je eigen paneel te plaatsen).

### 5.2 FeedControl

![FeedControl-widget](../../img/feedcontrol.png)

De besturingskaart:

- **Nu voeren** — een knop met twee stappen (de eerste klik activeert hem en toont *Bevestigen: N s?*, de tweede klik
  start precies één voedering van de gekozen duur; hij deactiveert zichzelf na een paar seconden als je niet bevestigt).
- **Portie (handmatig voeren)** — een schuifregelaar die de duur in seconden instelt (1 … *max. duur*).
- **Voeren opschorten** — een hoofdschakelaar die onmiddellijk **alle** voedering voor deze switch opschort totdat je hem
  weer uitzet (dit komt overeen met de `pauseNow` van de adapter, die elke modus en elke tijdgebonden pauze overschrijft).

**Weergaveopties:** accentkleur · **max. duur** (bovengrens van de schuifregelaar, standaard 30 s) ·
**pauzeschakelaar tonen** aan/uit · **geen kaartachtergrond**.

> De knop schrijft een eenmalige voedering via het `feedFor`-commando van de adapter — hij wijzigt **niet** je schema en
> herstart de adapter **niet**.

### 5.3 Environment

![Environment-widget](../../img/environment.png)

De water-/omgevingskaart:

- Temperaturen **Water ondiep** en **Water diep** (de tegel voor diep blijft op `–` staan als je geen tweede, diepere
  sensor hebt geconfigureerd).
- Een **stratificatie**label dat het verschil Δ tussen de twee lagen toont (wordt amberkleurig als de lagen meer dan 3 K
  verschillen).
- Een **zuurstof**label in mg/l — **alleen** getoond wanneer er een O₂-sensor is geconfigureerd, en wordt rood als de
  waarde onder het geconfigureerde minimum zakt.
- Een **dagbalk** van zonsopkomst tot zonsondergang met een live markering voor de huidige tijd.

**Weergaveopties:** accentkleur · **geen kaartachtergrond**.

### 5.4 DynamicFeeding

![DynamicFeeding-widget](../../img/dynamicfeeding.png)

Toont het **Q10-temperatuurmodel** dat de adapter gebruikt om het voeren aan te passen aan de watertemperatuur:

- **Ø temperatuur** — de gemiddelde temperatuur waarop het model is gebaseerd.
- **Snelheid (Q10)** — de resulterende snelheidsfactor (× ten opzichte van de referentietemperatuur).
- **Interval** — het resulterende voederinterval in minuten.
- **Portie** — de resulterende voederduur in seconden.
- Een **bron**label in de kop toont of het model wordt aangestuurd door de **water**- of de **lucht**sensor.

Als het dynamisch voeren voor deze switch is uitgeschakeld, toont de kaart een korte hint in plaats van de tegels.

**Weergaveopties:** accentkleur · **geen kaartachtergrond**.

### 5.5 SeasonBanner

![SeasonBanner-widget](../../img/seasonbanner.png)

Eén kleurgecodeerde statusregel — ideaal voor bovenaan een view. Deze toont altijd de op dit moment **belangrijkste**
toestand, in deze volgorde van prioriteit:

1. **Handmatige pauze** (rood) — de hoofdpauzeschakelaar staat aan.
2. **Tijdgebonden pauze** (amber) — een geconfigureerd pauzevenster is actief, met de eindtijd ervan.
3. **Winterpauze** (blauw) — het wintervenster is actief.
4. **Automatisch actief** (groen) — niets blokkeert het voeren, het schema loopt normaal.

Dit widget heeft **geen** weergaveopties naast de twee Algemeen-instellingen.

### 5.6 AnimatedFeeder

![AnimatedFeeder-widget tijdens het voeren](../../img/animatedfeeder.png)

Een grote, geanimeerde voederautomaat — het visuele middelpunt van een vijverdashboard. De voederautomaat wordt op een
canvas getekend en reageert live op de switch:

- **Tijdens het voeren:** er vallen voederkorrels uit de uitlaat en een **aftelring** met de resterende seconden vult
  de container. De ring is exact wanneer de adapter `status.feedingDurationSec` levert (**v1.6.0+**); bij oudere
  adapters wordt de totale duur afgeleid van het moment waarop de voedering start.
- **Pauzetoestanden**, getoond als een symbool met een rood kruis, in dezelfde prioriteit als de SeasonBanner:
  **handmatige pauze** (stophand) → **tijdgebonden pauze** (klok) → **winterpauze** (sneeuwvlok).
- **In rust:** alleen de voederautomaat, met een optionele hint *"Tik om te voeren"*.

![AnimatedFeeder in rust en pauzetoestanden](../../img/animatedfeeder-states.png)

**Tik om te voeren:** tik één keer op het widget om het te activeren (*Bevestigen: N s?*), tik nogmaals om een
eenmalige voedering van de ingestelde duur te starten (via `feedFor`). Tikken wordt genegeerd terwijl een pauze actief
is, en kan worden uitgeschakeld met **Tik-om-te-voeren inschakelen**.

**Weergaveopties:** accentkleur · een eigen **afbeelding** (laat leeg voor de ingebouwde voederautomaat-afbeelding; een
eigen afbeelding kan een andere beeldverhouding hebben) · **voederduur** voor de tik-actie · **animatie** aan/uit (de
vallende korrels; wordt automatisch verminderd wanneer het systeem de voorkeur geeft aan verminderde beweging) ·
**geen kaartachtergrond**.

**Geometrie-opties:** de korreluitlaat (X/Y) en de aftelling (X/Y/grootte) worden opgegeven in **%** van het widget,
zodat de animatie kan worden uitgelijnd wanneer je je eigen afbeelding gebruikt.

---

## 6. Configuratie

Elk widget heeft dezelfde twee vereiste instellingen in de groep **Attributen → Algemeen**:

![Widget-attributen: instantie en switch op naam](../../img/config-attributes.png)

- **Voederautomaat-instantie** — kies je `automatic-feeder`-instantie uit de keuzelijst (meestal `0`).
- **Switch** — kies de voederautomaat uit een keuzelijst die je geconfigureerde switches **op hun vriendelijke naam**
  toont (bijv. *KoiTeich Ponton*), niet op een intern id. De namen komen rechtstreeks uit de eigen configuratie van de
  adapter.

Zolang niet beide zijn ingesteld, toont een widget een vriendelijke hint *"selecteer een voederautomaat / switch"* in
plaats van gegevens.

De optionele weergave-instellingen bevinden zich in de groep **Attributen → Stijl** en verschillen per widget:

| Optie | Widgets | Betekenis |
|-------|---------|-----------|
| **Accentkleur** | alle behalve SeasonBanner | De accentkleur van de kaart (standaard vijver-aqua `#33c1cf`). |
| **Positie van de looptijd-timer** | FeederStatus | Toont de aftelling van de lopende voedering links of rechts van de afbeelding. |
| **Animatie** | FeederStatus | Zet de draaiende-ventilatoranimatie aan/uit. |
| **Max. duur** | FeedControl | Bovengrens van de portie-schuifregelaar in seconden (standaard 30). |
| **Pauzeschakelaar tonen** | FeedControl | Toont/verbergt de hoofdschakelaar *Voeren opschorten*. |
| **Geen kaartachtergrond** | alle behalve SeasonBanner | Toont het widget zonder de kaartachtergrond, bijv. om het op een eigen paneel te plaatsen. |

---

## 7. Welke datapunten elk widget gebruikt

Voor volledige transparantie — de widgets abonneren zich op het switch-kanaal
`automatic-feeder.<instance>.switches.<switch>.…` en gebruiken alleen deze relatieve datapunten:

| Widget | Leest | Schrijft |
|--------|-------|----------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (eenmalige voedering), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |
| **AnimatedFeeder** | `status.feedingActive`, `status.feedingEndsTs`, `status.feedingDurationSec`, `status.winterActive`, `status.pauseManual`, `status.pauseActive` | `feedFor` (tik-om-te-voeren) |

Zie de [documentatie van ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) voor de exacte
betekenis van elk datapunt.

---

## 8. Probleemoplossing & FAQ

**Een widget toont alleen "selecteer een voederautomaat / switch".**
Stel beide **Algemeen**-velden in (instantie *en* switch). De switch-keuzelijst wordt gevuld op basis van de
geselecteerde instantie, dus kies eerst de instantie.

**De switch-keuzelijst is leeg.**
De gekozen `automatic-feeder`-instantie heeft nog geen geconfigureerde switches, of het instantienummer is verkeerd.
Configureer eerst een switch in de adapter.

**Waarden tonen `–` of `undefined`.**
Zorg ervoor dat de adapter **v1.4.0 of nieuwer** is (v1.5.0+ voor de looptijd-aftelling). Oudere versies leveren niet de
numerieke tijdstempels en commando-datapunten waarop de widgets vertrouwen. De tegel **diep water** blijft `–` tenzij je
een tweede, diepere sensor hebt geconfigureerd; het **zuurstof**label is verborgen tenzij er een O₂-sensor is
geconfigureerd — beide zijn normaal.

**De looptijd-aftelling verschijnt nooit.**
Deze vereist adapter **v1.5.0+** (`status.feedingEndsTs`) en wordt alleen getoond *terwijl er daadwerkelijk een voedering
loopt*.

**Nieuwe/bijgewerkte widgets verschijnen niet, of slechts enkele zijn zichtbaar.**
Dit is bijna altijd een verouderde widgetbundel in de browser/runner. Voer
`iobroker upload vis-2-widgets-automatic-feeder` uit, herstart vis-2 (of de host) en vernieuw de browser hard (Ctrl+F5).

**Vervangt dit de adapter?**
Nee. Dit zijn alleen de dashboardwidgets. Alle planning, temperatuurlogica en meldingen zitten in de
**ioBroker.automatic-feeder**-adapter; de widgets zijn een venster daarop.
