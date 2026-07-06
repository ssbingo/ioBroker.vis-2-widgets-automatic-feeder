![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Inglese: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## Widget vis-2 per l'Automatic Feeder

**Widget vis-2** pronti all'uso per l'adattatore [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder)
— schede da dashboard con trascinamento (drag-and-drop) per un alimentatore per pesci / laghetto. **Non ci sono ID di
oggetti da cercare né HTML da scrivere**: scegli la tua istanza dell'alimentatore e il tuo switch **tramite il suo nome
descrittivo**, e i widget leggono e controllano tutto da soli.

Questo documento è un manuale completo. Se non hai mai usato questi widget, leggilo dall'inizio alla fine: l'**Avvio
rapido** ti fa avere una dashboard funzionante in un paio di minuti, il resto spiega nel dettaglio ogni widget e ogni
opzione.

---

## Indice

1. [Cosa ottieni](#1-cosa-ottieni)
2. [Requisiti](#2-requisiti)
3. [Installazione](#3-installazione)
4. [Avvio rapido](#4-avvio-rapido)
5. [I widget nel dettaglio](#5-i-widget-nel-dettaglio)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
6. [Configurazione](#6-configurazione)
7. [Quali data point utilizza ciascun widget](#7-quali-data-point-utilizza-ciascun-widget)
8. [Risoluzione dei problemi e FAQ](#8-risoluzione-dei-problemi-e-faq)

---

## 1. Cosa ottieni

Cinque widget che insieme formano una dashboard completa per l'alimentatore. Ognuno è una scheda autonoma con un design
scuro, adatto ai tablet, e un colore d'accento che puoi modificare.

| Widget | Cosa mostra / fa |
|--------|------------------|
| **FeederStatus** | Grafica animata dell'alimentatore (la ventola gira durante l'erogazione), un conto alla rovescia della durata in tempo reale, il conto alla rovescia fino alla prossima erogazione con orario e modalità, l'ultima erogazione e il suo esito, la finestra astronomica (alba/tramonto) e — quando è bloccato — il motivo. |
| **FeedControl** | Un pulsante **Alimenta ora** con conferma in due passaggi, un cursore per la porzione (durata) e un interruttore principale **sospendi l'alimentazione**. |
| **Environment** | Temperatura dell'acqua (superficie e profondità), la stratificazione termica Δ, una lettura dell'ossigeno (mostrata solo se esiste un sensore) e una barra del giorno con un indicatore "adesso" in tempo reale tra alba e tramonto. |
| **DynamicFeeding** | Il modello di temperatura Q10 a colpo d'occhio: temperatura media, fattore di velocità, intervallo e porzione, oltre a quale sensore (acqua/aria) lo determina. |
| **SeasonBanner** | Un'unica riga di stato con codice colore che mostra lo stato attualmente più importante (pausa manuale → pausa temporizzata → pausa invernale → automatico attivo). |

Tutti e cinque i widget sono **di lettura e controllo**: FeederStatus, Environment, DynamicFeeding e SeasonBanner si
limitano a *mostrare* i dati, mentre FeedControl *scrive* anche (avvia un'erogazione, commuta la pausa). Non viene mai
scritto nulla che tu non abbia esplicitamente richiesto.

---

## 2. Requisiti

- ioBroker **vis-2** (il vis moderno; questi sono widget vis-2, non vis-1 classico).
- L'adattatore **ioBroker.automatic-feeder**, installato e configurato con almeno uno switch:
  - **v1.4.0 o successiva** — obbligatoria, per i timestamp numerici, il `blockReasonCode` e il comando `feedFor`.
  - **v1.5.0 o successiva** — consigliata, abilita inoltre il **conto alla rovescia della durata** in tempo reale in
    FeederStatus (il data point `status.feedingEndsTs`).

I widget leggono e scrivono solo i data point `status.*` e `settings.*` propri dello switch, quindi non devi mai
inserire manualmente un ID di oggetto.

---

## 3. Installazione

1. Installa **ioBroker.vis-2-widgets-automatic-feeder** in ioBroker — dall'elenco degli adattatori dell'admin, una
   volta presente nel repository, oppure direttamente da GitHub / npm.
2. Apri **vis-2**. Un nuovo set di widget **Alimentatore automatico** compare nella palette dei widget.
3. Trascina uno qualsiasi dei suoi widget su una vista (vedi l'Avvio rapido qui sotto).

> **Dopo un aggiornamento:** esegui `iobroker upload vis-2-widgets-automatic-feeder`, quindi riavvia vis-2 (o l'intero
> host) ed effettua un aggiornamento forzato (Ctrl+F5) nel browser, in modo che il runner carichi il nuovo bundle dei
> widget. Vedi [Risoluzione dei problemi](#8-risoluzione-dei-problemi-e-faq).

---

## 4. Avvio rapido

1. In vis-2, apri una vista e trascinaci sopra il widget **FeederStatus**.
2. Nel gruppo **Attributi → Generale** del widget, imposta i due campi obbligatori:
   - **Istanza dell'alimentatore** — scegli la tua istanza `automatic-feeder` (di solito `0`).
   - **Switch** — scegli il tuo alimentatore dal menu a discesa; elenca gli switch configurati **per nome**
     (ad es. *KoiTeich Ponton*).
3. La scheda mostra immediatamente i dati in tempo reale. Ripeti per gli altri widget: la selezione di istanza/switch
   funziona allo stesso modo per tutti.

Tutto qui: nessun ID di oggetto, nessun binding, nessuno script.

---

## 5. I widget nel dettaglio

Ogni widget condivide le due impostazioni **Generale** (istanza + switch, vedi [Configurazione](#6-configurazione)). Le
opzioni di aspetto specifiche di ogni widget sono elencate insieme a ciascun widget qui sotto. Tutti gli screenshot
mostrano i widget con dati in tempo reale provenienti da un vero alimentatore per laghetto di koi.

### 5.1 FeederStatus

![Widget FeederStatus](../../img/feederstatus.png)

La scheda principale. Dall'alto verso il basso mostra:

- Un indicatore di stato: **Pronto** (verde) o **Bloccato** (ambra). "Bloccato" significa che all'adattatore al
  momento non è consentito erogare cibo (notte, temperatura troppo bassa, ossigeno troppo basso, una pausa …).
- Una **grafica animata dell'alimentatore**. Durante un'erogazione, la girante/ventola gira e — con l'adattatore
  v1.5.0+ — accanto compare un **conto alla rovescia della durata** (ad es. `5 s`) che conta alla rovescia fino alla
  fine dell'erogazione in corso.
- La **prossima erogazione**: un grande conto alla rovescia (ad es. *tra circa 27 min*), l'orario esatto e la modalità
  (*intervallo dinamico* o *pianificazione*).
- L'**ultima erogazione** con un contrassegno ✓ (riuscita) o ✗ (errore) e il testo del **risultato** dell'adattatore.
- La **finestra astronomica** (alba – tramonto) usata per la logica giorno/notte.
- Quando è bloccato, una riga aggiuntiva con il **motivo** del blocco in forma leggibile.

**Opzioni di aspetto:** colore d'accento · **posizione del timer della durata** (a sinistra / a destra della grafica) ·
**animazione** on/off · **nessuno sfondo della scheda** (per collocare il widget su un tuo pannello personalizzato).

### 5.2 FeedControl

![Widget FeedControl](../../img/feedcontrol.png)

La scheda di controllo:

- **Alimenta ora** — un pulsante in due passaggi (il primo clic lo arma e mostra *Confermare: N s?*, il secondo clic
  avvia esattamente un'erogazione della durata scelta; si disarma da solo dopo qualche secondo se non confermi).
- **Porzione (alimentazione manuale)** — un cursore che imposta la durata in secondi (1 … *durata massima*).
- **Sospendi l'alimentazione** — un interruttore principale che sospende immediatamente **tutte** le erogazioni per
  questo switch finché non lo disattivi di nuovo (corrisponde al `pauseNow` dell'adattatore, che ha la precedenza su
  ogni modalità e su ogni pausa temporizzata).

**Opzioni di aspetto:** colore d'accento · **durata massima** (estremo superiore del cursore, predefinito 30 s) ·
**mostra interruttore di pausa** on/off · **nessuno sfondo della scheda**.

> Il pulsante scrive un'erogazione una tantum tramite il comando `feedFor` dell'adattatore — **non** modifica la tua
> pianificazione e **non** riavvia l'adattatore.

### 5.3 Environment

![Widget Environment](../../img/environment.png)

La scheda acqua/ambiente:

- Temperature dell'acqua in **superficie** e in **profondità** (il riquadro della profondità resta su `–` se non hai
  configurato un secondo sensore più profondo).
- Un indicatore di **stratificazione** che mostra la differenza Δ tra i due strati (diventa ambra quando gli strati
  differiscono di oltre 3 K).
- Un indicatore dell'**ossigeno** in mg/l — mostrato **solo** quando è configurato un sensore di O₂, e diventa rosso
  se il valore scende al di sotto del minimo configurato.
- Una **barra del giorno** dall'alba al tramonto con un indicatore in tempo reale dell'ora corrente.

**Opzioni di aspetto:** colore d'accento · **nessuno sfondo della scheda**.

### 5.4 DynamicFeeding

![Widget DynamicFeeding](../../img/dynamicfeeding.png)

Mostra il **modello di temperatura Q10** che l'adattatore usa per adattare l'alimentazione alla temperatura dell'acqua:

- **Temperatura Ø** — la temperatura media su cui si basa il modello.
- **Velocità (Q10)** — il fattore di velocità risultante (× rispetto alla temperatura di riferimento).
- **Intervallo** — l'intervallo di erogazione risultante in minuti.
- **Porzione** — la durata di erogazione risultante in secondi.
- Un indicatore della **sorgente** nell'intestazione mostra se il modello è determinato dal sensore dell'**acqua** o
  dell'**aria**.

Se l'alimentazione dinamica è disattivata per questo switch, la scheda mostra una breve nota al posto dei riquadri.

**Opzioni di aspetto:** colore d'accento · **nessuno sfondo della scheda**.

### 5.5 SeasonBanner

![Widget SeasonBanner](../../img/seasonbanner.png)

Un'unica riga di stato con codice colore — ideale per la parte alta di una vista. Mostra sempre lo stato attuale **più
importante**, in questo ordine di priorità:

1. **Pausa manuale** (rosso) — l'interruttore principale di pausa è attivo.
2. **Pausa temporizzata** (ambra) — è attiva una finestra di pausa configurata, con il suo orario di fine.
3. **Pausa invernale** (blu) — è attiva la finestra invernale.
4. **Automatico attivo** (verde) — nulla blocca l'alimentazione, la pianificazione procede normalmente.

Questo widget **non** ha opzioni di aspetto oltre alle due impostazioni Generale.

---

## 6. Configurazione

Ogni widget ha le stesse due impostazioni obbligatorie nel gruppo **Attributi → Generale**:

![Attributi del widget: istanza e switch per nome](../../img/config-attributes.png)

- **Istanza dell'alimentatore** — scegli la tua istanza `automatic-feeder` dal menu a discesa (di solito `0`).
- **Switch** — scegli l'alimentatore da un menu a discesa che elenca gli switch configurati **tramite il loro nome
  descrittivo** (ad es. *KoiTeich Ponton*), non tramite un id interno. I nomi provengono direttamente dalla
  configurazione dell'adattatore.

Finché entrambi non sono impostati, il widget mostra una cortese indicazione *"seleziona un alimentatore / switch"* al
posto dei dati.

Le impostazioni di aspetto opzionali si trovano nel gruppo **Attributi → Stile** e variano da widget a widget:

| Opzione | Widget | Significato |
|---------|--------|-------------|
| **Colore d'accento** | tutti tranne SeasonBanner | Il colore di evidenziazione della scheda (predefinito azzurro-laghetto `#33c1cf`). |
| **Posizione del timer della durata** | FeederStatus | Mostra il conto alla rovescia dell'erogazione in corso a sinistra o a destra della grafica. |
| **Animazione** | FeederStatus | Attiva/disattiva l'animazione della ventola rotante. |
| **Durata massima** | FeedControl | Estremo superiore del cursore della porzione in secondi (predefinito 30). |
| **Mostra interruttore di pausa** | FeedControl | Mostra/nasconde l'interruttore principale *Sospendi l'alimentazione*. |
| **Nessuno sfondo della scheda** | tutti tranne SeasonBanner | Renderizza il widget senza lo sfondo della scheda, ad es. per collocarlo su un pannello personalizzato. |

---

## 7. Quali data point utilizza ciascun widget

Per la massima trasparenza — i widget si sottoscrivono al canale dello switch
`automatic-feeder.<instance>.switches.<switch>.…` e usano solo questi data point relativi:

| Widget | Legge | Scrive |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (erogazione una tantum), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |

Consulta la [documentazione di ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) per il
significato esatto di ciascun data point.

---

## 8. Risoluzione dei problemi e FAQ

**Un widget mostra solo "seleziona un alimentatore / switch".**
Imposta entrambi i campi **Generale** (istanza *e* switch). Il menu a discesa dello switch viene popolato in base
all'istanza selezionata, quindi scegli prima l'istanza.

**Il menu a discesa dello switch è vuoto.**
L'istanza `automatic-feeder` scelta non ha ancora switch configurati, oppure il numero dell'istanza è errato. Configura
prima uno switch nell'adattatore.

**I valori mostrano `–` o `undefined`.**
Assicurati che l'adattatore sia in versione **v1.4.0 o successiva** (v1.5.0+ per il conto alla rovescia della durata).
Le versioni più vecchie non forniscono i timestamp numerici e i data point dei comandi su cui i widget si basano. Il
riquadro dell'**acqua profonda** resta su `–` a meno che tu non abbia configurato un secondo sensore più profondo;
l'indicatore dell'**ossigeno** è nascosto se non è configurato un sensore di O₂ — entrambi i comportamenti sono normali.

**Il conto alla rovescia della durata non compare mai.**
Richiede l'adattatore **v1.5.0+** (`status.feedingEndsTs`) e viene mostrato solo *mentre un'erogazione è effettivamente
in corso*.

**I widget nuovi/aggiornati non compaiono, oppure ne sono visibili solo alcuni.**
È quasi sempre un bundle dei widget non aggiornato nel browser/runner. Esegui
`iobroker upload vis-2-widgets-automatic-feeder`, riavvia vis-2 (o l'host) ed effettua un aggiornamento forzato del
browser (Ctrl+F5).

**Questo sostituisce l'adattatore?**
No. Questi sono solo i widget per la dashboard. Tutta la pianificazione, la logica della temperatura e le notifiche
risiedono nell'adattatore **ioBroker.automatic-feeder**; i widget ne sono una rappresentazione.
