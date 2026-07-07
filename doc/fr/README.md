![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Anglais : [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## Widgets vis-2 pour le distributeur automatique

Des **widgets vis-2** prêts à l'emploi pour l'adaptateur [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) — des cartes de tableau de bord à glisser-déposer pour un distributeur de nourriture pour poissons / bassin. **Aucun ID d'objet à rechercher et aucun HTML à écrire** : vous choisissez votre instance de distributeur et votre commutateur **par son nom convivial**, et les widgets lisent et contrôlent tout par eux-mêmes.

Ce document est un manuel complet. Si vous n'avez jamais utilisé ces widgets auparavant, lisez-le de haut en bas — le **Démarrage rapide** vous permet d'obtenir un tableau de bord fonctionnel en quelques minutes, le reste explique chaque widget et chaque option en détail.

---

## Table des matières

1. [Ce que vous obtenez](#1-ce-que-vous-obtenez)
2. [Prérequis](#2-prérequis)
3. [Installation](#3-installation)
4. [Démarrage rapide](#4-démarrage-rapide)
5. [Les widgets en détail](#5-les-widgets-en-détail)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
   - [5.6 AnimatedFeeder](#56-animatedfeeder)
6. [Configuration](#6-configuration)
7. [Quels points de données chaque widget utilise](#7-quels-points-de-données-chaque-widget-utilise)
8. [Dépannage et FAQ](#8-dépannage-et-faq)

---

## 1. Ce que vous obtenez

Six widgets qui forment ensemble un tableau de bord complet pour votre distributeur. Chacun est une carte autonome au design sombre, adapté aux tablettes, avec une couleur d'accentuation que vous pouvez modifier.

| Widget | Ce qu'il affiche / fait |
|--------|----------------------|
| **FeederStatus** | Graphique animé du distributeur (le ventilateur tourne pendant le nourrissage), un compte à rebours en direct de la durée en cours, le compte à rebours jusqu'au prochain nourrissage avec l'heure et le mode, le dernier nourrissage et son résultat, la fenêtre astronomique (lever/coucher du soleil) et — en cas de blocage — la raison. |
| **FeedControl** | Un bouton **Nourrir maintenant** avec confirmation en deux étapes, un curseur de portion (durée) et un interrupteur principal **suspendre le nourrissage**. |
| **Environment** | La température de l'eau (surface et profondeur), la stratification thermique Δ, une mesure d'oxygène (affichée uniquement si un capteur existe) et une barre de journée avec un repère « maintenant » en direct entre le lever et le coucher du soleil. |
| **DynamicFeeding** | Le modèle de température Q10 en un coup d'œil : température moyenne, facteur de taux, intervalle et portion, ainsi que le capteur (eau/air) qui le pilote. |
| **SeasonBanner** | Une seule ligne d'état à code couleur indiquant l'état actuellement le plus important (pause manuelle → pause programmée → pause hivernale → automatique actif). |
| **AnimatedFeeder** | Un grand graphique animé du distributeur (canvas) : des granulés de nourriture tombent et un anneau de compte à rebours se remplit pendant le nourrissage, sinon des symboles de pause (manuelle / programmée / hivernale). Touchez-le pour déclencher un nourrissage ponctuel. |

Les six widgets fonctionnent en **lecture et commande** : FeederStatus, Environment, DynamicFeeding et SeasonBanner se contentent d'*afficher* les données, tandis que FeedControl et AnimatedFeeder *écrivent* également (déclenche un nourrissage, bascule la pause). Rien n'est jamais écrit que vous n'ayez explicitement demandé.

---

## 2. Prérequis

- ioBroker **vis-2** (le vis moderne ; ce sont des widgets vis-2, pas des widgets vis-1 classiques).
- L'adaptateur **ioBroker.automatic-feeder**, installé et configuré avec au moins un commutateur :
  - **v1.4.0 ou plus récent** — requis, pour les horodatages numériques, le `blockReasonCode` et la commande `feedFor`.
  - **v1.5.0 ou plus récent** — recommandé, active en outre le **compte à rebours de durée** en direct dans FeederStatus
    (le point de données `status.feedingEndsTs`).
  - **v1.6.0 ou plus récent** — recommandé pour l'anneau de compte à rebours exact du widget **AnimatedFeeder**
    (le point de données `status.feedingDurationSec`).

Les widgets ne lisent et n'écrivent que les points de données `status.*` et `settings.*` propres au commutateur, de sorte que vous n'avez jamais à saisir un ID d'objet à la main.

---

## 3. Installation

1. Installez **ioBroker.vis-2-widgets-automatic-feeder** dans ioBroker — depuis la liste des adaptateurs de l'admin une fois
   qu'il est dans le dépôt, ou directement depuis GitHub / npm.
2. Ouvrez **vis-2**. Un nouvel ensemble de widgets **Distributeur automatique** apparaît dans la palette de widgets.
3. Faites glisser l'un de ses widgets sur une vue (voir le Démarrage rapide ci-dessous).

> **Après une mise à jour :** exécutez `iobroker upload vis-2-widgets-automatic-feeder`, puis redémarrez vis-2 (ou l'hôte entier)
> et effectuez un rechargement forcé (Ctrl+F5) dans le navigateur, afin que le moteur d'exécution prenne en compte le nouveau
> paquet de widgets. Voir [Dépannage](#8-dépannage-et-faq).

---

## 4. Démarrage rapide

1. Dans vis-2, ouvrez une vue et faites-y glisser le widget **FeederStatus**.
2. Dans le groupe **Attributs → Général** du widget, renseignez les deux champs obligatoires :
   - **Instance du distributeur** — choisissez votre instance `automatic-feeder` (généralement `0`).
   - **Commutateur** — choisissez votre distributeur dans la liste déroulante ; elle répertorie vos commutateurs configurés
     **par nom** (par ex. *KoiTeich Ponton*).
3. La carte affiche immédiatement des données en direct. Répétez l'opération pour les autres widgets — la sélection de
   l'instance et du commutateur fonctionne de la même manière pour tous.

C'est tout : aucun ID d'objet, aucune liaison, aucun script.

---

## 5. Les widgets en détail

Chaque widget partage les deux réglages **Général** (instance + commutateur, voir [Configuration](#6-configuration)). Les
options d'apparence propres à chaque widget sont indiquées avec chaque widget ci-dessous. Toutes les captures d'écran montrent
les widgets avec des données en direct provenant d'un véritable distributeur de bassin à koïs.

### 5.1 FeederStatus

![Widget FeederStatus](../../img/feederstatus.png)

La carte principale. De haut en bas, elle affiche :

- Une pastille d'état : **Prêt** (vert) ou **Bloqué** (ambre). « Bloqué » signifie que l'adaptateur n'est actuellement pas
  autorisé à nourrir (nuit, température trop basse, oxygène trop bas, une pause …).
- Un **graphique animé du distributeur**. Pendant qu'un nourrissage est en cours, la turbine/le ventilateur tourne et — avec
  l'adaptateur v1.5.0+ — un **compte à rebours de durée** (par ex. `5 s`) apparaît à côté et décompte jusqu'à la fin du
  nourrissage en cours.
- Le **prochain nourrissage** : un grand compte à rebours (par ex. *dans environ 27 min*), l'heure exacte et le mode
  (*intervalle dynamique* ou *programmation*).
- Le **dernier nourrissage** avec un repère ✓ (succès) ou ✗ (erreur) et le texte de **résultat** de l'adaptateur.
- La **fenêtre astronomique** (lever – coucher du soleil) utilisée pour la logique jour/nuit.
- En cas de blocage, une ligne supplémentaire de **raison** avec le motif du blocage en langage clair.

**Options d'apparence :** couleur d'accentuation · **position du minuteur de durée** (à gauche / à droite du graphique) ·
**animation** activée/désactivée · **sans fond de carte** (pour déposer le widget sur votre propre panneau).

### 5.2 FeedControl

![Widget FeedControl](../../img/feedcontrol.png)

La carte de commande :

- **Nourrir maintenant** — un bouton en deux étapes (le premier clic l'arme et affiche *Confirmer : N s ?*, le second clic
  déclenche exactement un nourrissage de la durée choisie ; il se désarme tout seul après quelques secondes si vous ne
  confirmez pas).
- **Portion (nourrissage manuel)** — un curseur qui règle la durée en secondes (1 … *durée max.*).
- **Suspendre le nourrissage** — un interrupteur principal qui suspend immédiatement **tout** nourrissage pour ce commutateur
  jusqu'à ce que vous le désactiviez (il correspond au `pauseNow` de l'adaptateur, qui prime sur tous les modes et toutes les
  pauses programmées).

**Options d'apparence :** couleur d'accentuation · **durée max.** (extrémité supérieure du curseur, par défaut 30 s) ·
**afficher l'interrupteur de pause** activé/désactivé · **sans fond de carte**.

> Le bouton écrit un nourrissage ponctuel via la commande `feedFor` de l'adaptateur — il ne **modifie pas** votre programmation
> et ne **redémarre pas** l'adaptateur.

### 5.3 Environment

![Widget Environment](../../img/environment.png)

La carte eau/environnement :

- Les températures **Eau surface** et **Eau profondeur** (la tuile profondeur reste sur `–` si vous n'avez pas configuré un
  second capteur plus profond).
- Une pastille de **stratification** indiquant la différence Δ entre les deux couches (passe à l'ambre lorsque les couches
  diffèrent de plus de 3 K).
- Une pastille d'**oxygène** en mg/l — affichée **uniquement** lorsqu'un capteur d'O₂ est configuré, et devenant rouge si la
  valeur descend sous le minimum configuré.
- Une **barre de journée** du lever au coucher du soleil avec un repère en direct pour l'heure actuelle.

**Options d'apparence :** couleur d'accentuation · **sans fond de carte**.

### 5.4 DynamicFeeding

![Widget DynamicFeeding](../../img/dynamicfeeding.png)

Affiche le **modèle de température Q10** que l'adaptateur utilise pour adapter le nourrissage à la température de l'eau :

- **Température Ø** — la température moyenne sur laquelle le modèle se base.
- **Taux (Q10)** — le facteur de taux résultant (× par rapport à la température de référence).
- **Intervalle** — l'intervalle de nourrissage résultant en minutes.
- **Portion** — la durée de nourrissage résultante en secondes.
- Une pastille de **source** dans l'en-tête indique si le modèle est piloté par le capteur **eau** ou **air**.

Si le nourrissage dynamique est désactivé pour ce commutateur, la carte affiche une brève indication à la place des tuiles.

**Options d'apparence :** couleur d'accentuation · **sans fond de carte**.

### 5.5 SeasonBanner

![Widget SeasonBanner](../../img/seasonbanner.png)

Une seule ligne d'état à code couleur — idéale pour le haut d'une vue. Elle affiche toujours l'état actuel le **plus
important**, dans cet ordre de priorité :

1. **Pause manuelle** (rouge) — l'interrupteur de pause principal est activé.
2. **Pause programmée** (ambre) — une fenêtre de pause configurée est active, avec son heure de fin.
3. **Pause hivernale** (bleu) — la fenêtre hivernale est active.
4. **Automatique actif** (vert) — rien ne bloque le nourrissage, la programmation s'exécute normalement.

Ce widget n'a **aucune** option d'apparence au-delà des deux réglages Général.

### 5.6 AnimatedFeeder

![Widget AnimatedFeeder pendant le nourrissage](../../img/animatedfeeder.png)

Un grand distributeur animé — la pièce maîtresse visuelle d'un tableau de bord de bassin. Il dessine le distributeur sur
un canvas et réagit en direct au commutateur :

- **Pendant le nourrissage :** des granulés de nourriture tombent de la sortie et un **anneau de compte à rebours**
  indiquant les secondes restantes remplit le récipient. L'anneau est exact lorsque l'adaptateur fournit
  `status.feedingDurationSec` (**v1.6.0+**) ; avec les adaptateurs plus anciens, la durée totale est déduite du moment où
  le nourrissage commence.
- **États de pause**, affichés sous la forme d'un symbole barré d'une croix rouge, dans le même ordre de priorité que le
  SeasonBanner : **pause manuelle** (main d'arrêt) → **pause programmée** (horloge) → **pause hivernale** (flocon de neige).
- **Au repos :** uniquement le distributeur, avec une indication facultative *« Touchez pour nourrir »*.

![AnimatedFeeder au repos et états de pause](../../img/animatedfeeder-states.png)

**Touchez pour nourrir :** touchez le widget une fois pour l'armer (*Confirmer : N s ?*), touchez à nouveau pour
déclencher un nourrissage ponctuel de la durée configurée (via `feedFor`). Le toucher est ignoré tant qu'une pause est
active, et peut être désactivé avec **Activer le toucher-pour-nourrir**.

**Options d'apparence :** couleur d'accentuation · une **image** personnalisée (laissez vide pour le graphique de
distributeur intégré ; une image personnalisée peut avoir un rapport d'aspect différent) · **durée de nourrissage** pour
l'action de toucher · **animation** activée/désactivée (les granulés qui tombent ; automatiquement réduite lorsque le
système préfère un mouvement réduit) · **sans fond de carte**.

**Options de géométrie :** la sortie des granulés (X/Y) et le compte à rebours (X/Y/taille) sont indiqués en **%** du
widget, afin que l'animation puisse être alignée lorsque vous utilisez votre propre image.

---

## 6. Configuration

Chaque widget dispose des deux mêmes réglages obligatoires dans le groupe **Attributs → Général** :

![Attributs du widget : instance et commutateur par nom](../../img/config-attributes.png)

- **Instance du distributeur** — choisissez votre instance `automatic-feeder` dans la liste déroulante (généralement `0`).
- **Commutateur** — choisissez le distributeur dans une liste déroulante qui répertorie vos commutateurs configurés **par leur
  nom convivial** (par ex. *KoiTeich Ponton*), et non par un identifiant interne. Les noms proviennent directement de la
  configuration propre à l'adaptateur.

Tant que les deux ne sont pas définis, le widget affiche une indication conviviale *« sélectionnez un distributeur /
commutateur »* à la place des données.

Les réglages d'apparence facultatifs se trouvent dans le groupe **Attributs → Style** et diffèrent selon le widget :

| Option | Widgets | Signification |
|--------|---------|---------|
| **Couleur d'accentuation** | tous sauf SeasonBanner | La couleur de mise en évidence de la carte (par défaut aqua de bassin `#33c1cf`). |
| **Position du minuteur de durée** | FeederStatus | Affiche le compte à rebours du nourrissage en cours à gauche ou à droite du graphique. |
| **Animation** | FeederStatus | Active/désactive l'animation du ventilateur qui tourne. |
| **Durée max.** | FeedControl | Extrémité supérieure du curseur de portion en secondes (par défaut 30). |
| **Afficher l'interrupteur de pause** | FeedControl | Affiche/masque l'interrupteur principal *Suspendre le nourrissage*. |
| **Sans fond de carte** | tous sauf SeasonBanner | Affiche le widget sans son fond de carte, par ex. pour le placer sur un panneau personnalisé. |

---

## 7. Quels points de données chaque widget utilise

Pour une transparence totale — les widgets s'abonnent au canal du commutateur
`automatic-feeder.<instance>.switches.<switch>.…` et n'utilisent que ces points de données relatifs :

| Widget | Lit | Écrit |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (nourrissage ponctuel), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |
| **AnimatedFeeder** | `status.feedingActive`, `status.feedingEndsTs`, `status.feedingDurationSec`, `status.winterActive`, `status.pauseManual`, `status.pauseActive` | `feedFor` (toucher-pour-nourrir) |

Consultez la [documentation d'ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) pour la
signification exacte de chaque point de données.

---

## 8. Dépannage et FAQ

**Un widget n'affiche que « sélectionnez un distributeur / commutateur ».**
Renseignez les deux champs **Général** (instance *et* commutateur). La liste déroulante des commutateurs est remplie à partir
de l'instance sélectionnée, alors choisissez d'abord l'instance.

**La liste déroulante des commutateurs est vide.**
L'instance `automatic-feeder` choisie n'a encore aucun commutateur configuré, ou le numéro d'instance est incorrect.
Configurez d'abord un commutateur dans l'adaptateur.

**Les valeurs affichent `–` ou `undefined`.**
Assurez-vous que l'adaptateur est en **v1.4.0 ou plus récent** (v1.5.0+ pour le compte à rebours de durée). Les versions plus
anciennes ne fournissent pas les horodatages numériques ni les points de données de commande sur lesquels les widgets
s'appuient. La tuile **eau profonde** reste sur `–` tant que vous n'avez pas configuré un second capteur plus profond ; la
pastille d'**oxygène** est masquée tant qu'aucun capteur d'O₂ n'est configuré — les deux cas sont normaux.

**Le compte à rebours de durée n'apparaît jamais.**
Il nécessite l'adaptateur **v1.5.0+** (`status.feedingEndsTs`) et n'est affiché *que pendant qu'un nourrissage est réellement
en cours*.

**Les widgets nouveaux/mis à jour n'apparaissent pas, ou seuls certains sont visibles.**
Il s'agit presque toujours d'un paquet de widgets obsolète dans le navigateur/moteur d'exécution. Exécutez
`iobroker upload vis-2-widgets-automatic-feeder`, redémarrez vis-2 (ou l'hôte) et rechargez le navigateur de force (Ctrl+F5).

**Cela remplace-t-il l'adaptateur ?**
Non. Ce ne sont que les widgets du tableau de bord. Toute la programmation, la logique de température et les notifications
résident dans l'adaptateur **ioBroker.automatic-feeder** ; les widgets n'en sont qu'une vue.
