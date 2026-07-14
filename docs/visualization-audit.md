# Auditoria de Visualizações — Trace

## 1. Stack e estrutura

| Item | Escolha |
|---|---|
| Framework | React 19 |
| Linguagem | TypeScript 7 |
| Bundler | Vite 8 |
| Roteamento | react-router-dom 7 |
| Gerenciamento de estado | Zustand 5 |
| Animação | CSS transitions/animations nativas (nenhuma lib externa) |
| UI | Custom CSS com variáveis (design tokens em `src/styles.css`) |
| Ícones | Unicode/texto (nenhuma lib) |
| Testes unitários | Vitest 4 + Testing Library 16 + fake-indexeddb |
| Testes E2E | Playwright 1.61 + axe-core |
| Persistência | IndexedDB (`trace-learning`) com fallback localStorage |

### Pastas relevantes

```
src/
├── app/                  # App shell, roteamento, PersistenceBridge
├── content/              # Definições de todas as 36 lições + cenas Flow Scene
│   ├── lessons.ts        # 7 lições base
│   ├── linear.ts         # 4 lições (lista dupla, pilha, fila, deque)
│   ├── indexed.ts        # 2 lições (hash, set)
│   ├── hierarchical.ts   # 4 lições (BST, AVL, heap, trie)
│   ├── graphs.ts         # 5 lições (BFS, DFS, Dijkstra, Union-Find, Bellman-Ford)
│   ├── systems.ts        # 4 lições (B+ Tree, LRU, buffer circular, Bloom Filter)
│   ├── backend.ts        # 10 lições de system design
│   ├── comparisons.ts    # 6 comparações
│   ├── flow scenes      # Cenas declarativas para Flow Scene
│   └── index.ts          # Agrega todas as lições em learningPath
├── core/
│   ├── trace-engine/     # Motor de execução legado (TraceDefinition → ComputedScene)
│   └── flow-scene/       # Motor de cenas semânticas (FlowSceneDefinition → FlowSceneSnapshot)
├── features/
│   ├── flow-scene/       # FlowScenePlayer, canvas, primitives (FlowNode, FlowConnection, TravelingPacket)
│   │   └── renderers/    # 4 renderers: Pipeline, Tree, Queue, WeightedGraph
│   ├── lesson-player/    # LessonPlayer, TraceCanvas, ChallengePanel, PredictionPanel
│   ├── timeline/         # TimelineControls (play/pause/next/prev/replay/speed)
│   └── drawer/           # Drawer de limitação
├── pages/                # Landing, LearningPath, Lesson, Compare, Review, Progress
├── store/                # Zustand store
├── storage/              # IndexedDB repository
└── tests/                # Setup de testes
```

## 2. Todas as lições

### Módulo: Estruturas de dados (20)

| Lição | Rota | Arquivo | Categoria | Renderer atual | Tipo de visualização | Estado |
|---|---|---|---|---|---|---|
| Array: inserção no meio | `/app/lesson/array` | `lessons.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós/blocos + slots | Completo |
| Lista encadeada: insira entre nós | `/app/lesson/linked-list` | `lessons.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós linked | Completo |
| Lista duplamente encadeada | `/app/lesson/doubly-linked-list` | `linear.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós linked | Completo |
| Pilha: push e pop | `/app/lesson/stack` | `linear.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com slots + blocks | Completo |
| Fila: enqueue e dequeue | `/app/lesson/queue` | `linear.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com rail + blocks | Completo |
| Deque: insira nas duas extremidades | `/app/lesson/deque` | `linear.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com rail + blocks | Completo |
| Tabela hash: colisão com encadeamento | `/app/lesson/hash` | `indexed.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com buckets + blocks | Completo |
| Set: rejeição de duplicatas | `/app/lesson/set` | `indexed.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com container + blocks | Completo |
| Árvore binária de busca (BST) | `/app/lesson/bst` | `hierarchical.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós tree | Completo |
| Árvore balanceada: rotação AVL | `/app/lesson/balanced` | `hierarchical.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós tree | Completo |
| Heap: inserção com subida | `/app/lesson/heap` | `hierarchical.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós tree | Completo |
| Trie: insira por prefixo | `/app/lesson/trie` | `hierarchical.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós circle | Completo |
| Grafo: BFS | `/app/lesson/graph` | `graphs.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com blocks + tags | Completo |
| Union-Find | `/app/lesson/union-find` | `graphs.ts` | algorithm | TraceCanvas (legado) | Cena hardcoded com blocks + tags | Completo |
| B+ Tree: split de página | `/app/lesson/btree` | `systems.ts` | data-structure | FlowScene (TreeSceneRenderer) | Cena declarativa tree com split+promote | Completo |
| LRU Cache | `/app/lesson/lru` | `systems.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com nós linked + tags | Completo |
| Buffer circular | `/app/lesson/circular` | `systems.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com container + slots | Completo |
| Bloom Filter | `/app/lesson/bloom` | `systems.ts` | data-structure | TraceCanvas (legado) | Cena hardcoded com slots + blocks + tags | Completo |

### Módulo: Algoritmos (6)

| Lição | Rota | Arquivo | Categoria | Renderer atual | Tipo de visualização | Estado |
|---|---|---|---|---|---|---|
| Busca linear | `/app/lesson/linear-search` | `lessons.ts` | algorithm | FlowScene (PipelineSceneRenderer) + TraceCanvas fallback | Cena declarativa pipeline com nós de itens + TravelingPacket | Completo |
| DFS: explore profundamente | `/app/lesson/dfs` | `graphs.ts` | algorithm | TraceCanvas (legado) | Cena hardcoded com blocks + tags | Completo |
| Dijkstra: menor custo | `/app/lesson/dijkstra` | `graphs.ts` | algorithm | FlowScene (WeightedGraphSceneRenderer) + TraceCanvas | Cena declarativa graph com priority queue | Completo |
| Bellman-Ford: pesos negativos | `/app/lesson/bellman-ford` | `graphs.ts` | algorithm | TraceCanvas (legado) | Cena hardcoded com blocks + tags | Completo |

### Módulo: Lógica e fluxo (2)

| Lição | Rota | Arquivo | Categoria | Renderer atual | Tipo de visualização | Estado |
|---|---|---|---|---|---|---|
| Condição if | `/app/lesson/condition-if` | `lessons.ts` | logic | FlowScene (PipelineSceneRenderer) | Cena declarativa pipeline com branch e packet | Completo |
| Loop for | `/app/lesson/for-loop` | `lessons.ts` | logic | FlowScene (PipelineSceneRenderer) | Cena declarativa pipeline com ciclo | Completo |

### Módulo: Memória (1)

| Lição | Rota | Arquivo | Categoria | Renderer atual | Tipo de visualização | Estado |
|---|---|---|---|---|---|---|
| Valor e referência | `/app/lesson/memory-reference` | `lessons.ts` | memory | TraceCanvas (legado) | Cena hardcoded com nós memory + tags | Completo |

### Módulo: System design (9)

| Lição | Rota | Arquivo | Categoria | Renderer atual | Tipo de visualização | Estado |
|---|---|---|---|---|---|---|
| Fluxo cliente/API/banco | `/app/lesson/request-flow` | `lessons.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: roteamento HTTP | `/app/lesson/backend-router` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: validação e DTO | `/app/lesson/backend-validation` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: service layer | `/app/lesson/backend-service-layer` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: autenticação | `/app/lesson/backend-authentication` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: autorização | `/app/lesson/backend-authorization` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: fila | `/app/lesson/backend-queue` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: worker | `/app/lesson/backend-worker` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: idempotência | `/app/lesson/backend-idempotency` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: retry | `/app/lesson/backend-retry` | `backend.ts` | system-design | TraceCanvas (legado) | Cena hardcoded com nós service | Completo |
| Backend: DLQ | `/app/lesson/backend-dlq` | `backend.ts` | system-design | FlowScene (QueueSceneRenderer) + TraceCanvas | Cena declarativa queue com mensagens + DLQ | Completo |

### Comparações (6)

| Comparação | Rota | Renderer atual |
|---|---|---|
| Array × Lista (inserção no meio) | `/app/compare/insert-middle` | TraceCanvas |
| Array × Fila (remoção no início) | `/app/compare/array-queue` | TraceCanvas |
| Lista × Hash (busca por chave) | `/app/compare/list-hash` | TraceCanvas |
| BFS × Dijkstra (rotas) | `/app/compare/bfs-dijkstra` | TraceCanvas |
| BFS × DFS (travessia) | `/app/compare/bfs-dfs` | TraceCanvas |
| Dijkstra × Bellman-Ford (pesos negativos) | `/app/compare/dijkstra-bellman` | TraceCanvas |

## 3. Renderers existentes

### 3.1 TraceCanvas (legado)

- **Arquivo**: `src/features/lesson-player/TraceCanvas.tsx`
- **Lições que utiliza**: 28 de 36 lições (todas as que não têm FlowScene explícito)
- **Genérico ou especializado**: Genérico — renderiza qualquer `TraceDefinition` com nós/arestas
- **Primitives**: `trace-node` (com data-kind: block, slot, pill, tag, decision, memory, service, message, linked, tree, circle, container, bucket, rail), `trace-edge` (com data-directed, data-emphasis)
- **Posicionamento**: Coordenadas absolutas (x, y) hardcoded nas definições das lições
- **Responsividade**: Escala proporcional via `--scene-scale` com SCENE_WIDTH=640, SCENE_HEIGHT=360
- **Animações**: CSS transitions via atributo `data-emphasis` e `data-reduced-motion`
- **Conceitos**: Balão overlay posicionado junto ao nó alvo (suporte a top/right/bottom/left)
- **Limitações**:
  - Coordenadas hardcoded (não adaptável a diferentes layouts)
  - Sem suporte a metáfora visual semântica (tudo vira "nó" genérico)
  - Sem animação de pacotes viajando entre nós
  - Escala responsiva apenas reduz proporcionalmente, não reorganiza
  - Lógica do algoritmo misturada com dados visuais nos arquivos de conteúdo

### 3.2 PipelineSceneRenderer

- **Arquivo**: `src/features/flow-scene/renderers/PipelineSceneRenderer.tsx`
- **Lições que utiliza**: condition-if, for-loop, linear-search, client-server baseline, cache hit/miss
- **Genérico ou especializado**: Genérico — renderiza qualquer cena pipeline com grid layout
- **Primitives**: `FlowNode`, `FlowConnection`, `TravelingPacket` (SVG + HTML)
- **Posicionamento**: Grid-based (column/row) com suporte a desktop e mobile
- **Responsividade**: Calcula cellWidth/cellHeight a partir do grid e do tamanho real do container
- **Animações**: TravelingPacket anima pacote via CSS entre nós; estados dos nós via data attributes
- **Conceitos**: Balão de foco posicionado dinamicamente ao lado do nó focal
- **Limitações**:
  - Layout linear (horizontal desktop, vertical mobile) — não suporta grafos ou árvores
  - Nós com tamanho fixo (não adaptável a labels longas)
  - Sem suporte a pesos nas conexões

### 3.3 TreeSceneRenderer

- **Arquivo**: `src/features/flow-scene/renderers/TreeSceneRenderer.tsx`
- **Lições que utiliza**: btree (B+ Tree split)
- **Genérico ou especializado**: Especializado — B+ Tree com páginas, chaves, token, comparação
- **Primitives**: `tree-page`, `tree-edge`, `tree-sibling-edge`, `tree-key-token`, `tree-comparison` (tudo inline no renderer)
- **Posicionamento**: Proporcional (0-1) com suporte desktop/mobile
- **Responsividade**: Calcula pageFrame a partir de coordenadas relativas
- **Limitações**:
  - Específico para B+ Tree (não reutilizável para BST, heap, trie)
  - Sem animação de token viajando (só aparece/desaparece)
  - Sem suporte a subárvores colapsáveis ou scroll
  - Posições das páginas precisam ser calculadas manualmente nas definições de cena

### 3.4 QueueSceneRenderer

- **Arquivo**: `src/features/flow-scene/renderers/QueueSceneRenderer.tsx`
- **Lições que utiliza**: backend-dlq
- **Genérico ou especializado**: Especializado — fila de mensagens com nós queue/worker/processor/retry/dlq
- **Primitives**: `queue-node`, `queue-path` (SVG), `queue-message-token` (tudo inline)
- **Posicionamento**: Proporcional (0-1) com suporte desktop/mobile
- **Responsividade**: Calcula nodeFrame a partir de coordenadas relativas
- **Animações**: Estados dos paths via data-state (idle/active/transmitting/error/success)
- **Limitações**:
  - Específico para mensageria (não reutilizável para outros tipos de fila)
  - Mensagens sobrepostas podem colidir visualmente
  - Sem animação de mensagem viajando
  - Tamanhos de node fixos por kind

### 3.5 WeightedGraphSceneRenderer

- **Arquivo**: `src/features/flow-scene/renderers/WeightedGraphSceneRenderer.tsx`
- **Lições que utiliza**: dijkstra
- **Genérico ou especializado**: Semiespecializado — grafos ponderados com priority queue
- **Primitives**: `graph-node`, `graph-edge` (SVG), `graph-priority-queue`, `graph-candidate-panel`, `graph-shortest-path-card` (tudo inline)
- **Posicionamento**: Proporcional (0-1) com suporte desktop/mobile
- **Responsividade**: Calcula nodeFrame a partir de coordenadas relativas
- **Animações**: Estados dos nós (unvisited/frontier/current/visited/path) e arestas (idle/inspecting/relaxed/rejected/shortest-path) via data attributes
- **Limitações**:
  - Arestas sempre retas (sem curvas para múltiplas arestas entre mesmos nós)
  - Labels de peso com fundo retangular fixo (não escala)
  - Priority queue como painel HTML posicionado absolutamente
  - Sem suporte a grafos direcionados com laços
  - Sem suporte a subgrafos

## 4. ScenePlayer e reprodução

### Arquitetura atual

O player está no componente `LessonPlayer` (`src/features/lesson-player/LessonPlayer.tsx`). O estado de reprodução é gerenciado pelo Zustand store (`useTraceStore`).

**Play**: `setStatus("playing")` → useEffect detecta `player.status === "playing"` → `window.setTimeout` com `1250 / speed` ms → chama `setStep(next, maxStep)`.

**Pause**: `setStatus("paused")` → o effect retorna `() => window.clearTimeout(timer)`, interrompendo o ciclo.

**Next** (→): `changeStep(Math.min(maxStep, stepIndex + 1))` que chama `setStatus("paused")` + `setStep(next, maxStep)`.

**Previous** (←): `changeStep(Math.max(0, stepIndex - 1))` mesmo padrão, pausa + setStep.

**Replay** (↺): `replay()` → `setStep(0, maxStep)` + `setStatus("idle")`.

**Velocidade**: Multiplica o intervalo base (1250ms) por `1/speed`. Opções: 0.75×, 1×, 1.5×.

**Etapa atual**: Armazenada em `player.stepIndex` no store. O `stepIndex` é usado para:
- Calcular o snapshot do FlowScene via `reduceFlowScene(scene, stepIndex)`
- Calcular o snapshot do Trace via `reduceTrace(trace, stepIndex)`
- Controlar o `TimelineControls` (range slider + botões)

**Timers**: Um único `setTimeout` no effect do `LessonPlayer`. A limpeza é feita via `return () => window.clearTimeout(timer)`.

**O que é reutilizável**:
- `TimelineControls` é completamente genérico (recebe props)
- `reduceFlowScene` e `reduceTrace` são funções puras sem side effects
- O padrão de play/pause/next/prev/replay no LessonPlayer é reutilizável

**O que está acoplado**:
- A lógica de autoplay (setTimeout) está dentro do `LessonPlayer` específico
- `stepIndex` é compartilhado entre Trace e FlowScene, assumindo sync 1:1
- Não há suporte a cenas com número diferente de passos entre trace e flow scene
- A velocidade é controlada por um único multiplicador linear

## 5. Modelo de cenas

### Trace Engine (legado)

**Arquivos**: `src/core/trace-engine/types.ts`, `src/core/trace-engine/reduceTrace.ts`

| Tipo | Arquivo | Descrição |
|---|---|---|
| `LessonDefinition` | `core/trace-engine/types.ts` | Lição completa com trace, flowScene, challenge, explicação |
| `TraceDefinition` | `core/trace-engine/types.ts` | Cena com nós, arestas, steps, código |
| `TraceStep` | `core/trace-engine/types.ts` | Um passo com eventos, captions, descrição, métricas, conceito |
| `TraceEvent` | `core/trace-engine/types.ts` | 16 tipos de evento: COMPARE, MOVE, INSERT, REMOVE, LINK, UNLINK, HIGHLIGHT, READ_MEMORY, WRITE_MEMORY, PUSH_STACK_FRAME, POP_STACK_FRAME, BRANCH, CALL_FUNCTION, RETURN_VALUE, SEND_REQUEST, RECEIVE_RESPONSE, PUBLISH_EVENT, CONSUME_EVENT, CACHE_HIT, CACHE_MISS, TIMEOUT, RETRY, FAIL_NODE, RECOVER_NODE |
| `ComputedScene` | `core/trace-engine/types.ts` | Snapshot final com nós e arestas com estado |
| `SceneNodeDefinition` | `core/trace-engine/types.ts` | Nó com kind (block, slot, pill, tag, decision, memory, service, message, linked, tree, circle, container, bucket, rail), position (x,y absoluto), labels por representação |
| `Representation` | `core/trace-engine/types.ts` | "abstract" \| "practical" \| "memory" \| "code" |

### Flow Scene

**Arquivos**: `src/core/flow-scene/types.ts`, `src/core/flow-scene/reduceFlowScene.ts`

| Tipo | Descrição |
|---|---|
| `FlowSceneDefinition` | Union de `PipelineSceneDefinition`, `TreeSceneDefinition`, `QueueSceneDefinition`, `GraphSceneDefinition` |
| `FlowSceneStep` | Um passo com id, título, caption, conceito (FlowSceneConcept), focusNodeId, ações |
| `FlowSceneAction` | 50+ tipos de ação declarativa: reset-*, set-*, send-packet, move-*, split-page, promote-key, relayout-tree, spawn-message, etc. |
| `FlowSceneSnapshot` | Snapshot completo com nós, conexões, packet, tree, queue, graph |
| `PipelineSceneDefinition` | Cena pipeline com layouts (columns/rows), nós (FlowSceneNodeDefinition), conexões (FlowSceneConnectionDefinition) |
| `TreeSceneDefinition` | Cena tree com páginas (TreePageDefinition), arestas, token |
| `QueueSceneDefinition` | Cena queue com nós (QueueSceneNodeDefinition), paths, mensagens |
| `GraphSceneDefinition` | Cena graph com nós (GraphSceneNodeDefinition), arestas com peso, priority queue |
| `FlowNodeRole` | client, browser, server, api, database, cache, queue, worker, load-balancer, auth, input, decision, outcome, result |
| `SceneKind` | pipeline, tree, queue, memory, graph, state-machine, distribution, transformation |

### Ações declarativas existentes (FlowSceneAction)

**Pipeline**: reset-node-states, reset-connection-states, set-node-state, set-connection-state, clear-packets, send-packet

**Tree**: reset-tree-state, set-tree-page-state, set-tree-edge-state, set-tree-edge-visibility, set-tree-sibling-state, set-tree-sibling-visibility, set-tree-token-state, move-tree-token, compare-keys, insert-key, split-page, promote-key, relayout-tree, clear-tree-comparison

**Queue**: reset-queue-state, set-queue-node-state, set-queue-path-state, spawn-message, move-message, set-message-status, increment-attempt, route-to-dlq, clear-messages

**Graph**: reset-graph-state, set-graph-source, set-graph-target, set-graph-node-state, set-current-graph-node, inspect-graph-edge, clear-graph-inspection, calculate-graph-candidate, clear-graph-candidate, relax-graph-edge, reject-graph-relaxation, mark-graph-visited, enqueue-graph-node, dequeue-graph-min, update-graph-priority-queue, set-graph-predecessor, set-graph-distance, reconstruct-graph-path

## 6. Classificação visual

| Lição | Metáfora atual | Representa corretamente? | Família recomendada | Renderer recomendado |
|---|---|---|---|---|
| Array | Blocos + slots contíguos | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Lista encadeada | Nós linked + setas | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Lista dupla | Nós linked + setas bidirecionais | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Pilha | Slots + blocos empilhados | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Fila | Rail + blocos + front/rear | Sim, mas genérico | fila | QueueSceneRenderer (adaptado) |
| Deque | Rail + blocos + left/right | Sim, mas genérico | fila | QueueSceneRenderer (adaptado) |
| Tabela hash | Buckets + blocos + setas | Sim, mas genérico | banco de dados | Custom (hash renderer) |
| Set | Container + blocos | Sim, mas genérico | banco de dados | PipelineSceneRenderer |
| BST | Nós tree + setas | Sim | árvore | TreeSceneRenderer (adaptado) |
| AVL | Nós tree + setas + fator | Sim | árvore | TreeSceneRenderer (adaptado) |
| Heap | Nós tree + setas | Sim | árvore | TreeSceneRenderer (adaptado) |
| Trie | Nós circle + setas | Sim | árvore | TreeSceneRenderer (adaptado) |
| BFS | Blocks + setas direcionadas | Sim, mas genérico | grafo genérico | WeightedGraphSceneRenderer |
| DFS | Blocks + setas direcionadas | Sim, mas genérico | grafo genérico | WeightedGraphSceneRenderer |
| Union-Find | Blocks + setas + tags | Sim, mas genérico | grafo genérico | WeightedGraphSceneRenderer |
| B+ Tree | Páginas + arestas + token | Sim | árvore | TreeSceneRenderer |
| LRU Cache | Nós linked + tags | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Buffer circular | Container + slots + ponteiro | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Bloom Filter | Slots + tags bits | Sim, mas genérico | banco de dados | PipelineSceneRenderer |
| Busca linear | Pipeline com Target + itens + resultado | Sim | pipeline | PipelineSceneRenderer |
| Condição if | Pipeline com input, decisão, ramos, resultado | Sim | pipeline | PipelineSceneRenderer |
| Loop for | Pipeline com start, decisão, corpo, incremento, resultado | Sim | pipeline | PipelineSceneRenderer |
| Memória | Nós memory + tags + stack frame | Sim, mas genérico | memória | PipelineSceneRenderer |
| Dijkstra | Grafo ponderado com priority queue | Sim | grafo ponderado | WeightedGraphSceneRenderer |
| Bellman-Ford | Blocks + tags + arestas com peso | Sim, mas genérico | grafo ponderado | WeightedGraphSceneRenderer |
| Fluxo cliente/API/banco | Nós service + mensagens | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Backend router/validation/service | Nós service + mensagens | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Backend auth/authz | Nós service + middleware + mensagens | Sim, mas genérico | pipeline | PipelineSceneRenderer |
| Backend queue/worker | Nós service + fila + DLQ | Sim | mensageria | QueueSceneRenderer (adaptado) |
| Backend idempotency/retry | Nós service + mensagens | Sim, mas genérico | mensageria | QueueSceneRenderer (adaptado) |
| Backend DLQ | Nós queue + mensagens + DLQ | Sim | mensageria | QueueSceneRenderer |

## 7. Problemas encontrados

### Críticos

| Problema | Ocorrência | Impacto |
|---|---|---|
| **Coordenadas hardcoded** | Todas as 28 lições do TraceCanvas | Quebra em layouts diferentes; responsividade só escala, não reorganiza |
| **Lógica do algoritmo dentro do JSX** | Arquivos de conteúdo (ex.: `createLinearSearchTrace` em `lessons.ts`) | Dificulta teste, reuso e migração para FlowScene |
| **28/36 lições usam TraceCanvas legado** | Todo o módulo system-design (exceto DLQ), a maioria das estruturas de dados | Visualizações genéricas sem metáfora semântica |

### Altos

| Problema | Ocorrência | Impacto |
|---|---|---|
| **Renderers especializados subutilizados** | TreeSceneRenderer só para B+ Tree; QueueSceneRenderer só para DLQ | Potencial não realizado; poderiam servir BST, heap, trie, fila, deque |
| **Sem animação de pacote no Tree/Queue/Graph renderers** | TravelingPacket só existe no PipelineSceneRenderer | Transições entre nós não são animadas |
| **Duplicação de componentes de cena** | QueueSceneRenderer e TreeSceneRenderer reinventam lógica de posicionamento, paths SVG etc. | Manutenção duplicada |
| **Sem testes nos renderers** | Nenhum teste unitário para PipelineSceneRenderer, TreeSceneRenderer, QueueSceneRenderer, WeightedGraphSceneRenderer | Regressões visuais não detectadas |

### Médios

| Problema | Ocorrência | Impacto |
|---|---|---|
| **Falta de reduced motion nos renderers FlowScene** | TravelingPacket respeita, mas Tree/Queue/Graph não têm fallback | Acessibilidade incompleta |
| **Timers no LessonPlayer acoplados** | Lógica de setTimeout dentro do componente React | Dificulta testar autoplay |
| **Cenas semânticas sem fallback** | Lições sem `flowScene` ou `createFlowScene` usam `createGeneratedFlowScene` que produz pipeline genérico | Perde oportunidade de metáfora específica |
| **Sem snapshot/restore de cena** | Ao trocar representação, o stepIndex é preservado mas o estado visual recomeça | Experiência quebrada |

### Baixos

| Problema | Ocorrência | Impacto |
|---|---|---|
| **Nós com label longa cortada** | `PipelineSceneRenderer` com nodeWidth fixo | Menor, mas afeta lições de system design |
| **Priority queue no graph renderer sem responsividade mobile** | Posicionamento absoluto do painel | Quebra em viewports pequenas |
| **Falta de aria-live nos FlowScenePlayer** | Apenas o `LessonPlayer` tem `aria-live` | Leitores de tela perdem atualizações nos renderers |

## 8. Matriz final

| Lição | Renderer atual | Família recomendada | Renderer recomendado | Qualidade visual | Responsividade | Testes | Prioridade |
|---|---|---|---|---|---|---|---|
| Array | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Lista encadeada | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Lista dupla | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Pilha | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Fila | TraceCanvas | fila | QueueSceneRenderer (adaptado) | Média (genérica) | Parcial (escala) | Não | P1 |
| Deque | TraceCanvas | fila | QueueSceneRenderer (adaptado) | Média (genérica) | Parcial (escala) | Não | P1 |
| Tabela hash | TraceCanvas | banco de dados | Custom (hash renderer) | Média (genérica) | Parcial (escala) | Não | P1 |
| Set | TraceCanvas | banco de dados | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| BST | TraceCanvas | árvore | TreeSceneRenderer (adaptado) | Média (genérica) | Parcial (escala) | Não | P1 |
| AVL | TraceCanvas | árvore | TreeSceneRenderer (adaptado) | Média (genérica) | Parcial (escala) | Não | P1 |
| Heap | TraceCanvas | árvore | TreeSceneRenderer (adaptado) | Média (genérica) | Parcial (escala) | Não | P1 |
| Trie | TraceCanvas | árvore | TreeSceneRenderer (adaptado) | Média (genérica) | Parcial (escala) | Não | P1 |
| BFS | TraceCanvas | grafo genérico | WeightedGraphSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| DFS | TraceCanvas | grafo genérico | WeightedGraphSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Union-Find | TraceCanvas | grafo genérico | WeightedGraphSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| B+ Tree | TreeSceneRenderer | árvore | TreeSceneRenderer | Boa | Sim | Não | P2 |
| LRU Cache | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Buffer circular | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Bloom Filter | TraceCanvas | banco de dados | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Busca linear | PipelineSceneRenderer | pipeline | PipelineSceneRenderer | Boa | Sim | Não | P2 |
| Condição if | PipelineSceneRenderer | pipeline | PipelineSceneRenderer | Boa | Sim | Não | P2 |
| Loop for | PipelineSceneRenderer | pipeline | PipelineSceneRenderer | Boa | Sim | Não | P2 |
| Memória | TraceCanvas | memória | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Dijkstra | WeightedGraphSceneRenderer | grafo ponderado | WeightedGraphSceneRenderer | Boa | Sim | Não | P2 |
| Bellman-Ford | TraceCanvas | grafo ponderado | WeightedGraphSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Fluxo cliente/API/banco | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Backend router | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Backend validation | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Backend service | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Backend authn | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Backend authz | TraceCanvas | pipeline | PipelineSceneRenderer | Média (genérica) | Parcial (escala) | Não | P1 |
| Backend queue | TraceCanvas (cena) + PipelineSceneRenderer (FlowScene) | mensageria | QueueSceneRenderer (adaptado) | Média (genérica) | Parcial | Não | P2 |
| Backend worker | TraceCanvas (cena) + PipelineSceneRenderer (FlowScene) | mensageria | QueueSceneRenderer (adaptado) | Média (genérica) | Parcial | Não | P2 |
| Backend idempotency | TraceCanvas (cena) + PipelineSceneRenderer (FlowScene) | mensageria | QueueSceneRenderer (adaptado) | Média (genérica) | Parcial | Não | P2 |
| Backend retry | TraceCanvas (cena) + PipelineSceneRenderer (FlowScene) | mensageria | QueueSceneRenderer (adaptado) | Média (genérica) | Parcial | Não | P2 |
| Backend DLQ | QueueSceneRenderer | mensageria | QueueSceneRenderer | Boa | Sim | Não | P2 |

### Prioridades

- **P0** — nenhuma
- **P1** — 24 lições (todas no TraceCanvas legado com coordenadas hardcoded)
- **P2** — 12 lições (já migradas para FlowScene, mas sem testes e com limitações)
- **P3** — nenhuma
- **P4** — nenhuma

## 9. Arquivos necessários para a próxima etapa

### Essenciais

| Arquivo | Motivo |
|---|---|
| `package.json` | Dependências e scripts |
| `vite.config.ts` | Configuração de build |
| `tsconfig.json` / `tsconfig.app.json` | TypeScript config |
| `src/app/App.tsx` | Rotas e navegação |
| `src/features/lesson-player/LessonPlayer.tsx` | Player principal com TimelineControls |
| `src/features/timeline/TimelineControls.tsx` | Controles de reprodução reutilizáveis |
| `src/features/flow-scene/FlowScenePlayer.tsx` | Player de cena semântica |
| `src/features/flow-scene/FlowSceneCanvas.tsx` | Canvas que roteia para renderers |
| `src/features/flow-scene/renderers/PipelineSceneRenderer.tsx` | Renderer pipeline genérico |
| `src/features/flow-scene/renderers/TreeSceneRenderer.tsx` | Renderer tree |
| `src/features/flow-scene/renderers/QueueSceneRenderer.tsx` | Renderer queue |
| `src/features/flow-scene/renderers/WeightedGraphSceneRenderer.tsx` | Renderer graph |
| `src/features/flow-scene/FlowNode.tsx` | Primitiva de nó |
| `src/features/flow-scene/FlowConnection.tsx` | Primitiva de conexão SVG |
| `src/features/flow-scene/TravelingPacket.tsx` | Primitiva de pacote animado |
| `src/features/flow-scene/FlowConceptPanel.tsx` | Painel conceitual |
| `src/core/flow-scene/types.ts` | Tipos do Flow Scene (541 linhas) |
| `src/core/flow-scene/reduceFlowScene.ts` | Redutor determinístico (882 linhas) |
| `src/core/trace-engine/types.ts` | Tipos do Trace engine (249 linhas) |
| `src/core/trace-engine/reduceTrace.ts` | Redutor do Trace legado |
| `src/content/*.ts` | Definições de todas as 36 lições (incluindo traces e flow scenes) |
| `src/styles.css` | Design tokens e estilos globais |
| `src/store/useTraceStore.ts` | Estado global (Zustand) |
| `src/shared/hooks/useReducedMotion.ts` | Hook de preferência de movimento |

### Testes

| Arquivo | Motivo |
|---|---|
| `src/core/flow-scene/reduceFlowScene.test.ts` | Testes do redutor Flow Scene |
| `src/core/trace-engine/reduceTrace.test.ts` | Testes do redutor Trace |
| `src/features/lesson-player/LessonPlayer.test.tsx` | Testes do player |

### Infraestrutura

| Arquivo | Motivo |
|---|---|
| `src/tests/setup.ts` | Setup de testes (jsdom, fake-indexeddb) |
| `prototype/trace_complete_market_v2.html` | Protótipo canônico preservado |
| `playwright.config.ts` | Config E2E |
| `e2e/` | Testes E2E existentes |
| `docs/DESIGN_SYSTEM.md` | Design tokens e sistema visual |
| `docs/MOTION_SYSTEM.md` | Sistema de animação |
| `docs/CURRENT_STATE.md` | Estado atual do projeto |
