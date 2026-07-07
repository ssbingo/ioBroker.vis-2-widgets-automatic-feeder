![Logo](../../admin/vis-2-widgets-automatic-feeder.svg)

# ioBroker.vis-2-widgets-automatic-feeder

> 🇬🇧 Inglês: [README](../../README.md)

---

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a>
</p>

---

## Widgets vis-2 para o Alimentador Automático

**Widgets vis-2** prontos a usar para o adaptador [ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) — cartões de painel do tipo arrastar e soltar para um alimentador de peixes / lago. **Não há IDs de objetos para procurar nem HTML para escrever**: você escolhe a sua instância do alimentador e o seu switch **pelo nome amigável**, e os widgets leem e controlam tudo sozinhos.

Este documento é um manual completo. Se nunca usou estes widgets antes, leia-o de cima a baixo — o **Início rápido** dá-lhe um painel funcional em poucos minutos, e o resto explica em detalhe cada widget e cada opção.

---

## Índice

1. [O que você recebe](#1-o-que-você-recebe)
2. [Requisitos](#2-requisitos)
3. [Instalação](#3-instalação)
4. [Início rápido](#4-início-rápido)
5. [Os widgets em detalhe](#5-os-widgets-em-detalhe)
   - [5.1 FeederStatus](#51-feederstatus)
   - [5.2 FeedControl](#52-feedcontrol)
   - [5.3 Environment](#53-environment)
   - [5.4 DynamicFeeding](#54-dynamicfeeding)
   - [5.5 SeasonBanner](#55-seasonbanner)
   - [5.6 AnimatedFeeder](#56-animatedfeeder)
6. [Configuração](#6-configuração)
7. [Quais pontos de dados cada widget usa](#7-quais-pontos-de-dados-cada-widget-usa)
8. [Resolução de problemas e FAQ](#8-resolução-de-problemas-e-faq)

---

## 1. O que você recebe

Seis widgets que, em conjunto, formam um painel completo do alimentador. Cada um é um cartão autónomo com um design escuro, adequado a tablets, e uma cor de destaque que você pode alterar.

| Widget | O que mostra / faz |
|--------|----------------------|
| **FeederStatus** | Gráfico animado do alimentador (a hélice gira enquanto alimenta), uma contagem decrescente do tempo de funcionamento em tempo real, a contagem decrescente até a próxima alimentação com hora e modo, a última alimentação e o seu resultado, a janela astronómica (nascer/pôr do sol) e — quando bloqueado — o motivo. |
| **FeedControl** | Um botão **Alimentar agora** com confirmação em dois passos, um controlo deslizante de porção (duração) e um interruptor principal para **suspender a alimentação**. |
| **Environment** | Temperatura da água (superfície e profundidade), a estratificação térmica Δ, uma leitura de oxigénio (mostrada apenas se existir um sensor) e uma barra do dia com um marcador "agora" em tempo real entre o nascer e o pôr do sol. |
| **DynamicFeeding** | O modelo de temperatura Q10 num relance: temperatura média, fator de taxa, intervalo e porção, além de qual sensor (água/ar) o controla. |
| **SeasonBanner** | Uma única linha de estado codificada por cores com o estado atualmente mais importante (pausa manual → pausa por horário → pausa de inverno → automático ativo). |
| **AnimatedFeeder** | Um grande gráfico animado do alimentador (canvas): grânulos de comida caem e um anel de contagem decrescente enche-se enquanto alimenta, símbolos de pausa (manual / por horário / inverno) caso contrário. Toque nele para disparar uma alimentação pontual. |

Todos os seis widgets são de **leitura e controlo**: FeederStatus, Environment, DynamicFeeding e SeasonBanner apenas *mostram* dados, enquanto o FeedControl e o AnimatedFeeder também *escrevem* (dispara uma alimentação, alterna a pausa). Nunca é escrito nada que você não tenha pedido explicitamente.

---

## 2. Requisitos

- ioBroker **vis-2** (o vis moderno; estes são widgets vis-2, não do clássico vis-1).
- O adaptador **ioBroker.automatic-feeder**, instalado e configurado com pelo menos um switch:
  - **v1.4.0 ou mais recente** — obrigatório, para os carimbos de data/hora numéricos, o `blockReasonCode` e o comando `feedFor`.
  - **v1.5.0 ou mais recente** — recomendado, ativa adicionalmente a **contagem decrescente do tempo de funcionamento** em tempo real no FeederStatus (o ponto de dados `status.feedingEndsTs`).
  - **v1.6.0 ou mais recente** — recomendado para o anel de contagem decrescente exato do widget **AnimatedFeeder** (o ponto de dados `status.feedingDurationSec`).

Os widgets leem e escrevem apenas os pontos de dados `status.*` e `settings.*` do próprio switch, por isso você nunca tem de introduzir um ID de objeto manualmente.

---

## 3. Instalação

1. Instale o **ioBroker.vis-2-widgets-automatic-feeder** no ioBroker — a partir da lista de adaptadores do admin, assim que estiver no repositório, ou diretamente do GitHub / npm.
2. Abra o **vis-2**. Um novo conjunto de widgets **Alimentador automático** aparece na paleta de widgets.
3. Arraste qualquer um dos seus widgets para uma vista (veja o Início rápido abaixo).

> **Após uma atualização:** execute `iobroker upload vis-2-widgets-automatic-feeder`, depois reinicie o vis-2 (ou todo o host) e faça uma atualização forçada (Ctrl+F5) no navegador, para que o executor carregue o novo pacote de widgets. Veja [Resolução de problemas](#8-resolução-de-problemas-e-faq).

---

## 4. Início rápido

1. No vis-2, abra uma vista e arraste o widget **FeederStatus** para ela.
2. No grupo **Atributos → Geral** do widget, defina os dois campos obrigatórios:
   - **Instância do alimentador** — escolha a sua instância `automatic-feeder` (normalmente `0`).
   - **Switch** — escolha o seu alimentador no menu suspenso; ele lista os seus switches configurados **pelo nome** (por exemplo, *KoiTeich Ponton*).
3. O cartão mostra imediatamente dados em tempo real. Repita para os outros widgets — a seleção de instância/switch funciona da mesma forma para todos eles.

É tudo: sem IDs de objetos, sem vinculações, sem scripts.

---

## 5. Os widgets em detalhe

Cada widget partilha as duas definições **Geral** (instância + switch, veja [Configuração](#6-configuração)). As opções de aparência específicas de cada widget estão listadas com cada widget abaixo. Todas as capturas de ecrã mostram os widgets com dados em tempo real de um verdadeiro alimentador de lago de carpas koi.

### 5.1 FeederStatus

![Widget FeederStatus](../../img/feederstatus.png)

O cartão principal. De cima para baixo, ele mostra:

- Um distintivo de estado: **Pronto** (verde) ou **Bloqueado** (âmbar). "Bloqueado" significa que o adaptador não está atualmente autorizado a alimentar (noite, temperatura demasiado baixa, oxigénio demasiado baixo, uma pausa …).
- Um **gráfico animado do alimentador**. Enquanto uma alimentação decorre, o impulsor/hélice gira e — com o adaptador v1.5.0+ — uma **contagem decrescente do tempo de funcionamento** (por exemplo, `5 s`) aparece ao lado dele e conta o tempo até ao fim da alimentação atual.
- A **próxima alimentação**: uma grande contagem decrescente (por exemplo, *em cerca de 27 min*), a hora exata e o modo (*intervalo dinâmico* ou *horário*).
- A **última alimentação** com um marcador ✓ (sucesso) ou ✗ (erro) e o texto do **resultado** do adaptador.
- A **janela astro** (nascer – pôr do sol) usada para a lógica de dia/noite.
- Quando bloqueado, uma linha extra de **motivo** com o motivo do bloqueio de forma legível.

**Opções de aparência:** cor de destaque · **posição do temporizador de funcionamento** (à esquerda / à direita do gráfico) · **animação** ligada/desligada · **sem fundo de cartão** (para colocar o widget no seu próprio painel).

### 5.2 FeedControl

![Widget FeedControl](../../img/feedcontrol.png)

O cartão de controlo:

- **Alimentar agora** — um botão de dois passos (o primeiro clique arma-o e mostra *Confirmar: N s?*, o segundo clique dispara exatamente uma alimentação da duração escolhida; ele desarma-se sozinho após alguns segundos se você não confirmar).
- **Porção (alimentação manual)** — um controlo deslizante que define a duração em segundos (1 … *duração máxima*).
- **Suspender alimentação** — um interruptor principal que suspende imediatamente **toda** a alimentação deste switch até que você o desligue novamente (isto corresponde ao `pauseNow` do adaptador, que anula todos os modos e todas as pausas por horário).

**Opções de aparência:** cor de destaque · **duração máx.** (limite superior do controlo deslizante, padrão 30 s) · **mostrar interruptor de pausa** ligado/desligado · **sem fundo de cartão**.

> O botão escreve uma alimentação pontual através do comando `feedFor` do adaptador — ele **não** altera o seu horário e **não** reinicia o adaptador.

### 5.3 Environment

![Widget Environment](../../img/environment.png)

O cartão de água/ambiente:

- Temperaturas da **Água à superfície** e da **Água em profundidade** (o bloco de profundidade permanece em `–` se você não tiver configurado um segundo sensor mais profundo).
- Um distintivo de **estratificação** que mostra a diferença Δ entre as duas camadas (fica âmbar quando as camadas diferem em mais de 3 K).
- Um distintivo de **oxigénio** em mg/l — mostrado **apenas** quando um sensor de O₂ está configurado, e ficando vermelho se o valor cair abaixo do mínimo configurado.
- Uma **barra do dia** do nascer ao pôr do sol com um marcador em tempo real para a hora atual.

**Opções de aparência:** cor de destaque · **sem fundo de cartão**.

### 5.4 DynamicFeeding

![Widget DynamicFeeding](../../img/dynamicfeeding.png)

Mostra o **modelo de temperatura Q10** que o adaptador usa para adaptar a alimentação à temperatura da água:

- **Ø temperatura** — a temperatura média em que o modelo se baseia.
- **Taxa (Q10)** — o fator de taxa resultante (× em relação à temperatura de referência).
- **Intervalo** — o intervalo de alimentação resultante em minutos.
- **Porção** — a duração de alimentação resultante em segundos.
- Um distintivo de **fonte** no cabeçalho mostra se o modelo é controlado pelo sensor de **água** ou de **ar**.

Se a alimentação dinâmica estiver desligada para este switch, o cartão mostra uma breve dica em vez dos blocos.

**Opções de aparência:** cor de destaque · **sem fundo de cartão**.

### 5.5 SeasonBanner

![Widget SeasonBanner](../../img/seasonbanner.png)

Uma única linha de estado codificada por cores — ideal para o topo de uma vista. Ela mostra sempre o estado atual **mais importante**, nesta ordem de prioridade:

1. **Pausa manual** (vermelho) — o interruptor de pausa principal está ligado.
2. **Pausa por horário** (âmbar) — uma janela de pausa configurada está ativa, com a sua hora de término.
3. **Pausa de inverno** (azul) — a janela de inverno está ativa.
4. **Automático ativo** (verde) — nada bloqueia a alimentação, o horário decorre normalmente.

Este widget **não** tem opções de aparência além das duas definições Geral.

### 5.6 AnimatedFeeder

![Widget AnimatedFeeder durante a alimentação](../../img/animatedfeeder.png)

Um grande alimentador animado — a peça visual central de um painel de lago. Ele desenha o alimentador num canvas e reage em tempo real ao switch:

- **Durante a alimentação:** grânulos de comida caem da saída e um **anel de contagem decrescente** com os segundos restantes enche o recipiente. O anel é exato quando o adaptador fornece `status.feedingDurationSec` (**v1.6.0+**); com adaptadores mais antigos, a duração total é derivada do momento em que a alimentação começa.
- **Estados de pausa**, mostrados como um símbolo com uma cruz vermelha, na mesma prioridade que o SeasonBanner: **pausa manual** (mão de parar) → **pausa por horário** (relógio) → **pausa de inverno** (floco de neve).
- **Inativo:** apenas o alimentador, com uma dica opcional *"Toque para alimentar"*.

![Estados inativo e de pausa do AnimatedFeeder](../../img/animatedfeeder-states.png)

**Toque para alimentar:** toque no widget uma vez para o armar (*Confirmar: N s?*), toque novamente para disparar uma alimentação pontual da duração configurada (através de `feedFor`). O toque é ignorado enquanto uma pausa está ativa e pode ser desativado com **Ativar toque para alimentar**.

**Opções de aparência:** cor de destaque · uma **imagem** personalizada (deixe vazio para o gráfico do alimentador integrado; uma imagem personalizada pode ter uma proporção diferente) · **duração da alimentação** para a ação de toque · **animação** ligada/desligada (os grânulos a cair; automaticamente reduzida quando o sistema prefere movimento reduzido) · **sem fundo de cartão**.

**Opções de geometria:** a saída dos grânulos (X/Y) e a contagem decrescente (X/Y/tamanho) são dadas em **%** do widget, para que a animação possa ser alinhada quando você usa a sua própria imagem.

---

## 6. Configuração

Cada widget tem as mesmas duas definições obrigatórias no grupo **Atributos → Geral**:

![Atributos do widget: instância e switch por nome](../../img/config-attributes.png)

- **Instância do alimentador** — escolha a sua instância `automatic-feeder` no menu suspenso (normalmente `0`).
- **Switch** — escolha o alimentador num menu suspenso que lista os seus switches configurados **pelo nome amigável** (por exemplo, *KoiTeich Ponton*), e não por um id interno. Os nomes vêm diretamente da própria configuração do adaptador.

Enquanto ambos não estiverem definidos, um widget mostra uma dica amigável *"selecione um alimentador / switch"* em vez de dados.

As definições de aparência opcionais encontram-se no grupo **Atributos → Estilo** e diferem por widget:

| Opção | Widgets | Significado |
|--------|---------|---------|
| **Cor de destaque** | todos exceto SeasonBanner | A cor de destaque do cartão (padrão aqua-lago `#33c1cf`). |
| **Posição do temporizador de funcionamento** | FeederStatus | Mostra a contagem decrescente da alimentação em curso à esquerda ou à direita do gráfico. |
| **Animação** | FeederStatus | Liga/desliga a animação da hélice a girar. |
| **Duração máx.** | FeedControl | Limite superior do controlo deslizante de porção em segundos (padrão 30). |
| **Mostrar interruptor de pausa** | FeedControl | Mostra/oculta o interruptor principal *Suspender alimentação*. |
| **Sem fundo de cartão** | todos exceto SeasonBanner | Renderiza o widget sem o fundo do seu cartão, por exemplo, para o colocar num painel personalizado. |

---

## 7. Quais pontos de dados cada widget usa

Para total transparência — os widgets subscrevem o canal do switch `automatic-feeder.<instance>.switches.<switch>.…` e usam apenas estes pontos de dados relativos:

| Widget | Lê | Escreve |
|--------|-------|--------|
| **FeederStatus** | `status.feedingActive`, `status.feedingEndsTs`, `status.nextFeeding(Ts)`, `status.lastFeeding`, `status.lastResult`, `status.blocked`, `status.blockReason(Code)`, `status.error`, `status.sunrise`, `status.sunset`, `settings.dynamicEnabled` | — |
| **FeedControl** | `status.pauseManual`, `status.feedingActive` | `feedFor` (alimentação pontual), `settings.pauseNow` |
| **Environment** | `status.waterTemperature`, `status.waterTemperatureDeep`, `status.waterStratification`, `status.oxygen`, `status.sunrise(Ts)`, `status.sunset(Ts)`, `settings.o2Min` | — |
| **DynamicFeeding** | `settings.dynamicEnabled`, `settings.dynamicSource`, `status.dynamicAvgTemperature`, `status.dynamicRate`, `status.dynamicIntervalMin`, `status.dynamicDurationSec` | — |
| **SeasonBanner** | `status.winterActive`, `status.pauseActive`, `status.pauseActiveUntil`, `status.pauseManual`, `settings.winterWindow` | — |
| **AnimatedFeeder** | `status.feedingActive`, `status.feedingEndsTs`, `status.feedingDurationSec`, `status.winterActive`, `status.pauseManual`, `status.pauseActive` | `feedFor` (toque para alimentar) |

Consulte a [documentação do ioBroker.automatic-feeder](https://github.com/ssbingo/ioBroker.automatic-feeder) para o significado exato de cada ponto de dados.

---

## 8. Resolução de problemas e FAQ

**Um widget mostra apenas "selecione um alimentador / switch".**
Defina ambos os campos **Geral** (instância *e* switch). O menu suspenso do switch é preenchido a partir da instância selecionada, por isso escolha primeiro a instância.

**O menu suspenso do switch está vazio.**
A instância `automatic-feeder` escolhida ainda não tem switches configurados, ou o número da instância está errado. Configure primeiro um switch no adaptador.

**Os valores mostram `–` ou `undefined`.**
Certifique-se de que o adaptador é **v1.4.0 ou mais recente** (v1.5.0+ para a contagem decrescente do tempo de funcionamento). Versões mais antigas não fornecem os carimbos de data/hora numéricos e os pontos de dados de comando de que os widgets dependem. O bloco de **água em profundidade** permanece `–` a menos que você tenha configurado um segundo sensor mais profundo; o distintivo de **oxigénio** fica oculto a menos que um sensor de O₂ esteja configurado — ambos são normais.

**A contagem decrescente do tempo de funcionamento nunca aparece.**
Ela precisa do adaptador **v1.5.0+** (`status.feedingEndsTs`) e só é mostrada *enquanto uma alimentação está realmente a decorrer*.

**Widgets novos/atualizados não aparecem, ou apenas alguns estão visíveis.**
Isto é quase sempre um pacote de widgets desatualizado no navegador/executor. Execute `iobroker upload vis-2-widgets-automatic-feeder`, reinicie o vis-2 (ou o host) e faça uma atualização forçada do navegador (Ctrl+F5).

**Isto substitui o adaptador?**
Não. Estes são apenas os widgets do painel. Toda a programação, lógica de temperatura e notificações vivem no adaptador **ioBroker.automatic-feeder**; os widgets são uma visualização sobre ele.
