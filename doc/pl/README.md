![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Angielski: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## Widgety vis-2 dla automatycznego karmnika

Gotowe do użycia **widgety vis-2** dla adaptera [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) — karty pulpitu typu przeciągnij i upuść dla karmnika do akwarium / stawu. **Nie musisz wyszukiwać żadnych identyfikatorów obiektów ani pisać kodu HTML**: wybierasz swoją instancję karmnika oraz swój przełącznik **po jego przyjaznej nazwie**, a widgety samodzielnie odczytują i sterują wszystkim.

Ten dokument to kompletny podręcznik. Jeśli nigdy wcześniej nie korzystałeś z tych widgetów, przeczytaj go od początku do końca — **Szybki start** zapewni Ci działający pulpit w kilka minut, a reszta szczegółowo objaśnia każdy widget i każdą opcję.

---

## Spis treści

1. [Co otrzymujesz](#1-co-otrzymujesz)
2. [Wymagania](#2-wymagania)
3. [Instalacja](#3-instalacja)
4. [Szybki start](#4-szybki-start)
5. [Widgety w szczegółach](#5-widgety-w-szczegółach)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
6. [Konfiguracja](#6-konfiguracja)
7. [Których punktów danych używa każdy widget](#7-których-punktów-danych-używa-każdy-widget)
8. [Rozwiązywanie problemów i FAQ](#8-rozwiązywanie-problemów-i-faq)

---

## 1. Co otrzymujesz

Pięć widgetów, które razem tworzą kompletny pulpit karmnika. Każdy z nich to samodzielna karta o ciemnym, dostosowanym do tabletów wyglądzie, z kolorem akcentu, który możesz zmienić.

| Widget | Co pokazuje / robi |
|--------|----------------------|
| **FeederStatus** | Animowana grafika karmnika (wentylator obraca się podczas karmienia), odliczanie czasu pracy na żywo, odliczanie do następnego karmienia z godziną i trybem, ostatnie karmienie wraz z jego wynikiem, okno astronomiczne (wschód/zachód słońca) oraz — gdy karmienie jest zablokowane — powód blokady. |
| **FeedControl** | Przycisk **Nakarm teraz** z dwustopniowym potwierdzeniem, suwak porcji (czasu trwania) oraz główny przełącznik **wstrzymania karmienia**. |
| **Environment** | Temperatura wody (przy powierzchni i w głębi), termiczna stratyfikacja Δ, odczyt tlenu (pokazywany tylko, jeśli istnieje czujnik) oraz pasek dnia z aktualnym znacznikiem „teraz” pomiędzy wschodem a zachodem słońca. |
| **DynamicFeeding** | Model temperaturowy Q10 w skrócie: średnia temperatura, współczynnik szybkości, interwał i porcja, a także informacja o tym, który czujnik (woda/powietrze) nim steruje. |
| **SeasonBanner** | Pojedynczy, oznaczony kolorem wiersz stanu z aktualnie najważniejszym stanem (pauza ręczna → pauza wg harmonogramu → pauza zimowa → automatyka aktywna). |

Wszystkie pięć widgetów działa w trybie **odczytu i sterowania**: FeederStatus, Environment, DynamicFeeding oraz SeasonBanner jedynie *wyświetlają* dane, natomiast FeedControl również *zapisuje* (wyzwala karmienie, przełącza pauzę). Nigdy nie jest zapisywane nic, o co wyraźnie nie poprosiłeś.

---

## 2. Wymagania

- ioBroker **vis-2** (nowoczesny vis; są to widgety vis-2, a nie klasycznego vis-1).
- Adapter **ioBroker.automatic-feeder**, zainstalowany i skonfigurowany z co najmniej jednym przełącznikiem:
  - **v1.4.0 lub nowszy** — wymagany, ze względu na numeryczne znaczniki czasu, `blockReasonCode` oraz polecenie `feedFor`.
  - **v1.5.0 lub nowszy** — zalecany, dodatkowo włącza w FeederStatus **odliczanie czasu pracy** na żywo (punkt danych `status.feedingEndsTs`).

Widgety odczytują i zapisują wyłącznie punkty danych `status.*` oraz `settings.*` samego przełącznika, więc nigdy nie musisz ręcznie wpisywać identyfikatora obiektu.

---

## 3. Instalacja

1. Zainstaluj **ioBroker.vis-2-widgets-automatic-feeder** w ioBroker — z listy adapterów w panelu admin, gdy tylko trafi do repozytorium, albo bezpośrednio z GitHub / npm.
2. Otwórz **vis-2**. W palecie widgetów pojawi się nowy zestaw widgetów **Automatyczny karmnik**.
3. Przeciągnij dowolny z jego widgetów na widok (zobacz Szybki start poniżej).

> **Po aktualizacji:** uruchom `iobroker upload vis-2-widgets-automatic-feeder`, następnie zrestartuj vis-2 (lub cały host) i wykonaj twarde odświeżenie (Ctrl+F5) w przeglądarce, aby program uruchamiający pobrał nowy pakiet widgetów. Zobacz [Rozwiązywanie problemów](#8-rozwiązywanie-problemów-i-faq).

---

## 4. Szybki start

1. W vis-2 otwórz widok i przeciągnij na niego widget **FeederStatus**.
2. W grupie **Atrybuty → Ogólne** widgetu ustaw dwa wymagane pola:
   - **Instancja karmnika** — wybierz swoją instancję `automatic-feeder` (zwykle `0`).
   - **Przełącznik** — wybierz swój karmnik z listy rozwijanej; wyświetla ona Twoje skonfigurowane przełączniki **po nazwie** (np. *KoiTeich Ponton*).
3. Karta natychmiast pokazuje dane na żywo. Powtórz to dla pozostałych widgetów — wybór instancji/przełącznika działa tak samo dla każdego z nich.

To wszystko: bez identyfikatorów obiektów, bez powiązań, bez skryptów.

---

## 5. Widgety w szczegółach

Każdy widget ma te same dwa ustawienia **Ogólne** (instancja + przełącznik, zobacz [Konfiguracja](#6-konfiguracja)). Opcje wyglądu specyficzne dla danego widgetu są wymienione przy każdym widgecie poniżej. Wszystkie zrzuty ekranu przedstawiają widgety z danymi na żywo z prawdziwego karmnika do stawu z karpiami koi.

### 5.1 FeederStatus

![Widget FeederStatus](../../img/feederstatus.png)

Karta główna. Od góry do dołu pokazuje:

- Znaczek stanu: **Gotowy** (zielony) lub **Zablokowany** (bursztynowy). „Zablokowany” oznacza, że adapter nie ma obecnie pozwolenia na karmienie (noc, zbyt niska temperatura, zbyt niski poziom tlenu, jakaś pauza…).
- **Animowaną grafikę karmnika**. Podczas trwania karmienia wirnik/wentylator się obraca i — w przypadku adaptera v1.5.0+ — obok niego pojawia się **odliczanie czasu pracy** (np. `5 s`), które odlicza czas do końca bieżącego karmienia.
- **Następne karmienie**: duże odliczanie (np. *za około 27 min*), dokładną godzinę oraz tryb (*interwał dynamiczny* lub *harmonogram*).
- **Ostatnie karmienie** ze znacznikiem ✓ (sukces) lub ✗ (błąd) oraz tekstem **wyniku** z adaptera.
- **Okno astro** (wschód – zachód słońca) używane w logice dnia/nocy.
- Gdy karmienie jest zablokowane, dodatkowy wiersz **powodu** z czytelnym opisem przyczyny blokady.

**Opcje wyglądu:** kolor akcentu · **pozycja licznika czasu pracy** (po lewej / po prawej stronie grafiki) · **animacja** wł./wył. · **bez tła karty** (aby umieścić widget na własnym panelu).

### 5.2 FeedControl

![Widget FeedControl](../../img/feedcontrol.png)

Karta sterowania:

- **Nakarm teraz** — przycisk dwustopniowy (pierwsze kliknięcie uzbraja go i pokazuje *Potwierdź: N s?*, drugie kliknięcie wyzwala dokładnie jedno karmienie o wybranym czasie trwania; przycisk rozbraja się samoczynnie po kilku sekundach, jeśli nie potwierdzisz).
- **Porcja (karmienie ręczne)** — suwak, który ustawia czas trwania w sekundach (1 … *maksymalny czas trwania*).
- **Wstrzymaj karmienie** — główny przełącznik, który natychmiast wstrzymuje **wszystkie** karmienia dla tego przełącznika, aż ponownie go wyłączysz (odpowiada to funkcji `pauseNow` adaptera, która ma pierwszeństwo przed każdym trybem i każdą pauzą wg harmonogramu).

**Opcje wyglądu:** kolor akcentu · **maks. czas trwania** (górna granica suwaka, domyślnie 30 s) · **pokaż przełącznik pauzy** wł./wył. · **bez tła karty**.

> Przycisk zapisuje jednorazowe karmienie za pomocą polecenia `feedFor` adaptera — **nie** zmienia Twojego harmonogramu i **nie** restartuje adaptera.

### 5.3 Environment

![Widget Environment](../../img/environment.png)

Karta wody/środowiska:

- Temperatury **Woda przy powierzchni** i **Woda w głębi** (kafelek głębi pozostaje na `–`, jeśli nie skonfigurowałeś drugiego, głębszego czujnika).
- Znaczek **stratyfikacji** pokazujący różnicę Δ między dwiema warstwami (zmienia kolor na bursztynowy, gdy warstwy różnią się o więcej niż 3 K).
- Znaczek **tlenu** w mg/l — pokazywany **tylko** wtedy, gdy skonfigurowano czujnik O₂, i zmieniający kolor na czerwony, jeśli wartość spadnie poniżej skonfigurowanego minimum.
- **Pasek dnia** od wschodu do zachodu słońca z aktualnym znacznikiem bieżącego czasu.

**Opcje wyglądu:** kolor akcentu · **bez tła karty**.

### 5.4 DynamicFeeding

![Widget DynamicFeeding](../../img/dynamicfeeding.png)

Pokazuje **model temperaturowy Q10**, którego adapter używa do dostosowywania karmienia do temperatury wody:

- **Ø temperatura** — uśredniona temperatura, na której opiera się model.
- **Szybkość (Q10)** — wynikowy współczynnik szybkości (× względem temperatury odniesienia).
- **Interwał** — wynikowy interwał karmienia w minutach.
- **Porcja** — wynikowy czas trwania karmienia w sekundach.
- Znaczek **źródła** w nagłówku pokazuje, czy modelem steruje czujnik **wody**, czy **powietrza**.

Jeśli karmienie dynamiczne jest wyłączone dla tego przełącznika, karta pokazuje krótką wskazówkę zamiast kafelków.

**Opcje wyglądu:** kolor akcentu · **bez tła karty**.

### 5.5 SeasonBanner

![Widget SeasonBanner](../../img/seasonbanner.png)

Pojedynczy, oznaczony kolorem wiersz stanu — idealny na górę widoku. Zawsze pokazuje **najważniejszy** aktualny stan, w następującej kolejności priorytetów:

1. **Pauza ręczna** (czerwony) — główny przełącznik pauzy jest włączony.
2. **Pauza wg harmonogramu** (bursztynowy) — skonfigurowane okno pauzy jest aktywne, wraz z godziną jego zakończenia.
3. **Pauza zimowa** (niebieski) — okno zimowe jest aktywne.
4. **Automatyka aktywna** (zielony) — nic nie blokuje karmienia, harmonogram działa normalnie.

Ten widget **nie** ma żadnych opcji wyglądu poza dwoma ustawieniami Ogólnymi.

---

## 6. Konfiguracja

Każdy widget ma te same dwa wymagane ustawienia w grupie **Atrybuty → Ogólne**:

![Atrybuty widgetu: instancja i przełącznik po nazwie](../../img/config-attributes.png)

- **Instancja karmnika** — wybierz swoją instancję `automatic-feeder` z listy rozwijanej (zwykle `0`).
- **Przełącznik** — wybierz karmnik z listy rozwijanej, która wyświetla Twoje skonfigurowane przełączniki **po ich przyjaznej nazwie** (np. *KoiTeich Ponton*), a nie po wewnętrznym identyfikatorze. Nazwy pochodzą wprost z konfiguracji samego adaptera.

Dopóki oba pola nie zostaną ustawione, widget pokazuje przyjazną wskazówkę *„wybierz karmnik / przełącznik”* zamiast danych.

Opcjonalne ustawienia wyglądu znajdują się w grupie **Atrybuty → Styl** i różnią się w zależności od widgetu:

| Opcja | Widgety | Znaczenie |
|--------|---------|---------|
| **Kolor akcentu** | wszystkie oprócz SeasonBanner | Kolor wyróżnienia karty (domyślnie akwamaryna stawowa `#33c1cf`). |
| **Pozycja licznika czasu pracy** | FeederStatus | Pokazuje odliczanie trwającego karmienia po lewej lub po prawej stronie grafiki. |
| **Animacja** | FeederStatus | Włącza/wyłącza animację obracającego się wentylatora. |
| **Maks. czas trwania** | FeedControl | Górna granica suwaka porcji w sekundach (domyślnie 30). |
| **Pokaż przełącznik pauzy** | FeedControl | Pokazuje/ukrywa główny przełącznik *Wstrzymaj karmienie*. |
| **Bez tła karty** | wszystkie oprócz SeasonBanner | Renderuje widget bez tła jego karty, np. aby umieścić go na własnym panelu. |

---

## 7. Których punktów danych używa każdy widget

Dla pełnej przejrzystości — widgety subskrybują kanał przełącznika `automatic-feeder.<instance>.switches.<switch>.…` i używają wyłącznie tych względnych punktów danych:

| Widget | Odczytuje | Zapisuje |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (karmienie jednorazowe), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |

Zobacz [dokumentację ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder), aby poznać dokładne znaczenie każdego punktu danych.

---

## 8. Rozwiązywanie problemów i FAQ

**Widget pokazuje tylko „wybierz karmnik / przełącznik”.**
Ustaw oba pola **Ogólne** (instancję *oraz* przełącznik). Lista rozwijana przełącznika jest wypełniana na podstawie wybranej instancji, więc najpierw wybierz instancję.

**Lista rozwijana przełącznika jest pusta.**
Wybrana instancja `automatic-feeder` nie ma jeszcze skonfigurowanych przełączników albo numer instancji jest nieprawidłowy. Najpierw skonfiguruj przełącznik w adapterze.

**Wartości pokazują `–` lub `undefined`.**
Upewnij się, że adapter jest w wersji **v1.4.0 lub nowszej** (v1.5.0+ dla odliczania czasu pracy). Starsze wersje nie dostarczają numerycznych znaczników czasu ani punktów danych poleceń, na których opierają się widgety. Kafelek **wody w głębi** pozostaje na `–`, chyba że skonfigurowałeś drugi, głębszy czujnik; znaczek **tlenu** jest ukryty, chyba że skonfigurowano czujnik O₂ — oba przypadki są normalne.

**Odliczanie czasu pracy nigdy się nie pojawia.**
Wymaga ono adaptera w wersji **v1.5.0+** (`status.feedingEndsTs`) i jest pokazywane wyłącznie *w trakcie faktycznie trwającego karmienia*.

**Nowe/zaktualizowane widgety nie pojawiają się lub widoczne są tylko niektóre.**
To prawie zawsze nieaktualny pakiet widgetów w przeglądarce/programie uruchamiającym. Uruchom `iobroker upload vis-2-widgets-automatic-feeder`, zrestartuj vis-2 (lub host) i wykonaj twarde odświeżenie przeglądarki (Ctrl+F5).

**Czy to zastępuje adapter?**
Nie. To są tylko widgety pulpitu. Całe planowanie, logika temperaturowa i powiadomienia znajdują się w adapterze **ioBroker.automatic-feeder**; widgety są jedynie widokiem na niego.
