![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Inglés: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## Widgets vis-2 para el comedero automático

**Widgets vis-2** listos para usar para el adaptador [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder):
tarjetas de panel de arrastrar y soltar para un comedero de peces / estanque. **No hay que buscar ningún ID de objeto ni
escribir HTML**: eliges tu instancia del comedero y tu interruptor **por su nombre descriptivo**, y los widgets leen y
controlan todo por sí mismos.

Este documento es un manual completo. Si nunca has usado estos widgets, léelo de arriba abajo: el **Inicio rápido** te da
un panel funcional en un par de minutos, y el resto explica en detalle cada widget y cada opción.

---

## Tabla de contenidos

1. [Qué obtienes](#1-qué-obtienes)
2. [Requisitos](#2-requisitos)
3. [Instalación](#3-instalación)
4. [Inicio rápido](#4-inicio-rápido)
5. [Los widgets en detalle](#5-los-widgets-en-detalle)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
6. [Configuración](#6-configuración)
7. [Qué puntos de datos usa cada widget](#7-qué-puntos-de-datos-usa-cada-widget)
8. [Solución de problemas y preguntas frecuentes](#8-solución-de-problemas-y-preguntas-frecuentes)

---

## 1. Qué obtienes

Cinco widgets que juntos forman un panel completo del comedero. Cada uno es una tarjeta independiente con un diseño
oscuro, pensado para tabletas, y un color de acento que puedes cambiar.

| Widget | Qué muestra / hace |
|--------|--------------------|
| **FeederStatus** | Gráfico animado del comedero (el ventilador gira mientras alimenta), una cuenta atrás en vivo del tiempo de funcionamiento, la cuenta atrás hasta la próxima alimentación con hora y modo, la última alimentación y su resultado, la ventana astronómica (amanecer/atardecer) y —cuando está bloqueado— el motivo. |
| **FeedControl** | Un botón **Alimentar ahora** con confirmación en dos pasos, un control deslizante de porción (duración) y un interruptor maestro de **suspender la alimentación**. |
| **Environment** | Temperatura del agua (superficial y profunda), la estratificación térmica Δ, una lectura de oxígeno (solo se muestra si existe un sensor) y una barra del día con un marcador «ahora» en vivo entre el amanecer y el atardecer. |
| **DynamicFeeding** | El modelo de temperatura Q10 de un vistazo: temperatura media, factor de tasa, intervalo y porción, además de qué sensor (agua/aire) lo controla. |
| **SeasonBanner** | Una única línea de estado con código de color que muestra el estado más importante en cada momento (pausa manual → pausa por horario → pausa de invierno → automático activo). |

Los cinco widgets son de **lectura y control**: FeederStatus, Environment, DynamicFeeding y SeasonBanner solo *muestran*
datos, mientras que FeedControl además *escribe* (dispara una alimentación, activa o desactiva la pausa). Nunca se escribe
nada que no hayas solicitado explícitamente.

---

## 2. Requisitos

- ioBroker **vis-2** (el vis moderno; estos son widgets de vis-2, no del vis-1 clásico).
- El adaptador **ioBroker.automatic-feeder**, instalado y configurado con al menos un interruptor:
  - **v1.4.0 o posterior** — obligatorio, para las marcas de tiempo numéricas, el `blockReasonCode` y el comando `feedFor`.
  - **v1.5.0 o posterior** — recomendado, habilita además la **cuenta atrás del tiempo de funcionamiento** en vivo en
    FeederStatus (el punto de datos `status.feedingEndsTs`).

Los widgets solo leen y escriben los propios puntos de datos `status.*` y `settings.*` del interruptor, por lo que nunca
tienes que introducir un ID de objeto a mano.

---

## 3. Instalación

1. Instala **ioBroker.vis-2-widgets-automatic-feeder** en ioBroker: desde la lista de adaptadores del admin una vez que
   esté en el repositorio, o directamente desde GitHub / npm.
2. Abre **vis-2**. Aparece un nuevo conjunto de widgets **Comedero automático** en la paleta de widgets.
3. Arrastra cualquiera de sus widgets a una vista (consulta el Inicio rápido más abajo).

> **Después de una actualización:** ejecuta `iobroker upload vis-2-widgets-automatic-feeder`, luego reinicia vis-2 (o
> todo el host) y haz una recarga forzada (Ctrl+F5) en el navegador, para que el runner cargue el nuevo paquete de
> widgets. Consulta [Solución de problemas](#8-solución-de-problemas-y-preguntas-frecuentes).

---

## 4. Inicio rápido

1. En vis-2, abre una vista y arrastra el widget **FeederStatus** a ella.
2. En el grupo **Atributos → General** del widget, configura los dos campos obligatorios:
   - **Instancia del comedero** — elige tu instancia de `automatic-feeder` (normalmente `0`).
   - **Interruptor** — elige tu comedero en el menú desplegable; enumera tus interruptores configurados **por su nombre**
     (p. ej. *KoiTeich Ponton*).
3. La tarjeta muestra de inmediato datos en vivo. Repite el proceso con los demás widgets: la selección de
   instancia/interruptor funciona igual en todos.

Eso es todo: sin IDs de objeto, sin vinculaciones, sin scripts.

---

## 5. Los widgets en detalle

Todos los widgets comparten los dos ajustes **General** (instancia + interruptor, consulta [Configuración](#6-configuración)).
Las opciones de apariencia específicas de cada widget se enumeran junto a cada uno más abajo. Todas las capturas de
pantalla muestran los widgets con datos en vivo de un comedero real de estanque koi.

### 5.1 FeederStatus

![Widget FeederStatus](../../img/feederstatus.png)

La tarjeta principal. De arriba abajo muestra:

- Una etiqueta de estado: **Listo** (verde) o **Bloqueado** (ámbar). «Bloqueado» significa que el adaptador no tiene
  permitido alimentar en ese momento (noche, temperatura demasiado baja, oxígeno demasiado bajo, una pausa…).
- Un **gráfico animado del comedero**. Mientras se ejecuta una alimentación, la hélice/el ventilador gira y —con el
  adaptador v1.5.0+— aparece junto a él una **cuenta atrás del tiempo de funcionamiento** (p. ej. `5 s`) que cuenta hasta
  el final de la alimentación actual.
- La **próxima alimentación**: una cuenta atrás grande (p. ej. *en unos 27 min*), la hora exacta y el modo
  (*intervalo dinámico* u *horario*).
- La **última alimentación** con una marca ✓ (éxito) o ✗ (error) y el texto de **resultado** del adaptador.
- La **ventana astronómica** (amanecer – atardecer) que se usa para la lógica de día/noche.
- Cuando está bloqueado, una línea adicional de **motivo** con la razón del bloqueo en lenguaje legible.

**Opciones de apariencia:** color de acento · **posición del temporizador de funcionamiento** (izquierda / derecha del
gráfico) · **animación** activada/desactivada · **sin fondo de tarjeta** (para colocar el widget sobre tu propio panel).

### 5.2 FeedControl

![Widget FeedControl](../../img/feedcontrol.png)

La tarjeta de control:

- **Alimentar ahora** — un botón de dos pasos (el primer clic lo arma y muestra *¿Confirmar: N s?*, el segundo clic
  dispara exactamente una alimentación de la duración elegida; se desarma solo tras unos segundos si no confirmas).
- **Porción (alimentación manual)** — un control deslizante que fija la duración en segundos (1 … *duración máx.*).
- **Suspender la alimentación** — un interruptor maestro que suspende de inmediato **toda** la alimentación de este
  interruptor hasta que lo desactives de nuevo (se corresponde con el `pauseNow` del adaptador, que anula cualquier modo
  y cualquier pausa por horario).

**Opciones de apariencia:** color de acento · **duración máx.** (extremo superior del control deslizante, 30 s por
defecto) · **mostrar interruptor de pausa** activado/desactivado · **sin fondo de tarjeta**.

> El botón escribe una alimentación puntual mediante el comando `feedFor` del adaptador; **no** cambia tu horario y **no**
> reinicia el adaptador.

### 5.3 Environment

![Widget Environment](../../img/environment.png)

La tarjeta de agua/entorno:

- Temperaturas del **agua superficial** y del **agua profunda** (la casilla de profundidad permanece en `–` si no
  configuraste un segundo sensor más profundo).
- Una etiqueta de **estratificación** que muestra la diferencia Δ entre las dos capas (se vuelve ámbar cuando las capas
  difieren en más de 3 K).
- Una etiqueta de **oxígeno** en mg/l — se muestra **solo** cuando hay un sensor de O₂ configurado, y se vuelve roja si
  el valor cae por debajo del mínimo configurado.
- Una **barra del día** desde el amanecer hasta el atardecer con un marcador en vivo de la hora actual.

**Opciones de apariencia:** color de acento · **sin fondo de tarjeta**.

### 5.4 DynamicFeeding

![Widget DynamicFeeding](../../img/dynamicfeeding.png)

Muestra el **modelo de temperatura Q10** que el adaptador usa para adaptar la alimentación a la temperatura del agua:

- **Temperatura Ø** — la temperatura promediada en la que se basa el modelo.
- **Tasa (Q10)** — el factor de tasa resultante (× respecto a la temperatura de referencia).
- **Intervalo** — el intervalo de alimentación resultante en minutos.
- **Porción** — la duración de alimentación resultante en segundos.
- Una etiqueta de **fuente** en el encabezado indica si el modelo se controla mediante el sensor de **agua** o de **aire**.

Si la alimentación dinámica está desactivada para este interruptor, la tarjeta muestra una breve indicación en lugar de
las casillas.

**Opciones de apariencia:** color de acento · **sin fondo de tarjeta**.

### 5.5 SeasonBanner

![Widget SeasonBanner](../../img/seasonbanner.png)

Una única línea de estado con código de color, ideal para la parte superior de una vista. Siempre muestra el estado
actual **más importante**, en este orden de prioridad:

1. **Pausa manual** (rojo) — el interruptor maestro de pausa está activado.
2. **Pausa por horario** (ámbar) — hay una ventana de pausa configurada activa, con su hora de finalización.
3. **Pausa de invierno** (azul) — la ventana de invierno está activa.
4. **Automático activo** (verde) — nada bloquea la alimentación, el horario funciona con normalidad.

Este widget **no** tiene opciones de apariencia más allá de los dos ajustes General.

---

## 6. Configuración

Todos los widgets tienen los mismos dos ajustes obligatorios en el grupo **Atributos → General**:

![Atributos del widget: instancia e interruptor por nombre](../../img/config-attributes.png)

- **Instancia del comedero** — elige tu instancia de `automatic-feeder` en el menú desplegable (normalmente `0`).
- **Interruptor** — elige el comedero en un menú desplegable que enumera tus interruptores configurados **por su nombre
  descriptivo** (p. ej. *KoiTeich Ponton*), no por un id interno. Los nombres proceden directamente de la propia
  configuración del adaptador.

Hasta que ambos estén configurados, el widget muestra una indicación amistosa *«selecciona un comedero / interruptor»* en
lugar de datos.

Los ajustes de apariencia opcionales se encuentran en el grupo **Atributos → Estilo** y varían según el widget:

| Opción | Widgets | Significado |
|--------|---------|-------------|
| **Color de acento** | todos excepto SeasonBanner | El color de resalte de la tarjeta (por defecto aqua-estanque `#33c1cf`). |
| **Posición del temporizador de funcionamiento** | FeederStatus | Muestra la cuenta atrás de la alimentación en curso a la izquierda o a la derecha del gráfico. |
| **Animación** | FeederStatus | Activa o desactiva la animación del ventilador giratorio. |
| **Duración máx.** | FeedControl | Extremo superior del control deslizante de porción en segundos (30 por defecto). |
| **Mostrar interruptor de pausa** | FeedControl | Muestra u oculta el interruptor maestro de *Suspender la alimentación*. |
| **Sin fondo de tarjeta** | todos excepto SeasonBanner | Renderiza el widget sin el fondo de su tarjeta, p. ej. para colocarlo en un panel personalizado. |

---

## 7. Qué puntos de datos usa cada widget

Para total transparencia: los widgets se suscriben al canal del interruptor
`automatic-feeder.<instance>.switches.<switch>.…` y usan únicamente estos puntos de datos relativos:

| Widget | Lee | Escribe |
|--------|-----|---------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (alimentación puntual), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |

Consulta la [documentación de ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) para
conocer el significado exacto de cada punto de datos.

---

## 8. Solución de problemas y preguntas frecuentes

**Un widget solo muestra «selecciona un comedero / interruptor».**
Configura ambos campos **General** (instancia *e* interruptor). El menú desplegable del interruptor se rellena a partir de
la instancia seleccionada, así que elige primero la instancia.

**El menú desplegable del interruptor está vacío.**
La instancia de `automatic-feeder` elegida aún no tiene interruptores configurados, o el número de instancia es
incorrecto. Configura primero un interruptor en el adaptador.

**Los valores muestran `–` o `undefined`.**
Asegúrate de que el adaptador sea **v1.4.0 o posterior** (v1.5.0+ para la cuenta atrás del tiempo de funcionamiento). Las
versiones anteriores no proporcionan las marcas de tiempo numéricas ni los puntos de datos de comando en los que se basan
los widgets. La casilla del **agua profunda** permanece en `–` a menos que configures un segundo sensor más profundo; la
etiqueta de **oxígeno** se oculta a menos que haya un sensor de O₂ configurado; ambas cosas son normales.

**La cuenta atrás del tiempo de funcionamiento nunca aparece.**
Necesita el adaptador **v1.5.0+** (`status.feedingEndsTs`) y solo se muestra *mientras una alimentación se está
ejecutando realmente*.

**Los widgets nuevos o actualizados no aparecen, o solo se ven algunos.**
Casi siempre se debe a un paquete de widgets obsoleto en el navegador/runner. Ejecuta
`iobroker upload vis-2-widgets-automatic-feeder`, reinicia vis-2 (o el host) y haz una recarga forzada del navegador
(Ctrl+F5).

**¿Esto reemplaza al adaptador?**
No. Estos son solo los widgets del panel. Toda la programación, la lógica de temperatura y las notificaciones residen en
el adaptador **ioBroker.automatic-feeder**; los widgets son una vista sobre él.
