# Prompt de Refatoração — Plataforma de Visualizações Trace

## Diagnóstico

O projeto possui **40 lições** distribuídas em 5 módulos:

| Módulo | Quantidade |
|---|---|
| Estrutura de dados | 16 |
| Algoritmo | 6 |
| Lógica e fluxo | 2 |
| Memória | 1 |
| System design | 15 |

**Situação atual dos renderers:**

- 4 renderers semânticos implementados: Pipeline, Tree, Queue, WeightedGraph
- 6 lições usam renderers semânticos: B+ Tree (Tree), Dijkstra (WeightedGraph), DLQ (Queue), Busca linear (Pipeline), If (Pipeline), Loop (Pipeline)
- **34 lições restantes** usam TraceCanvas legado com coordenadas absolutas e lógica de algoritmo no JSX
- Nenhum renderer tem testes unitários
- Nenhum renderer tem `MotionToken` animado exceto Pipeline (via `TravelingPacket`)
- UseReducedMotion já existe em `src/shared/hooks/useReducedMotion.ts` — não recriar

---

## 1. Arquitetura-alvo

### Separação fundamental: `SceneFamily` vs `RendererKind`

`SceneFamily` define o **motor estrutural** (como os elementos se relacionam no espaço). `RendererKind` define a **metáfora visual específica** (como o conceito é apresentado).

```typescript
type SceneFamily =
  | "pipeline"
  | "tree"
  | "queue"
  | "memory"
  | "graph"
  | "state-machine"
  | "distribution"
  | "transformation";

type RendererKind =
  | "array"
  | "linked-structure"
  | "stack"
  | "queue"
  | "messaging"
  | "binary-tree"
  | "b-plus-tree"
  | "trie"
  | "heap"
  | "graph-traversal"
  | "shortest-path"
  | "disjoint-set"
  | "hash-table"
  | "set"
  | "circular-buffer"
  | "memory"
  | "bloom-filter"
  | "cache"
  | "pipeline"
  | "middleware-chain"
  | "comparison";
```

### Registry por RendererKind

O registry mapeia `RendererKind` → componente, não `SceneFamily`:

```typescript
const rendererRegistry: Record<RendererKind, React.ComponentType<SceneRendererProps>> = {
  array: ArraySceneRenderer,
  "linked-structure": LinkedStructureSceneRenderer,
  stack: StackSceneRenderer,
  queue: QueueSceneRenderer,
  messaging: MessagingSceneRenderer,
  "binary-tree": BinaryTreeSceneRenderer,
  "b-plus-tree": BPlusTreeSceneRenderer,
  trie: TrieSceneRenderer,
  heap: HeapSceneRenderer,
  "graph-traversal": GraphTraversalSceneRenderer,
  "shortest-path": ShortestPathSceneRenderer,
  "disjoint-set": DisjointSetSceneRenderer,
  "hash-table": HashTableSceneRenderer,
  set: SetSceneRenderer,
  "circular-buffer": CircularBufferSceneRenderer,
  memory: MemorySceneRenderer,
  "bloom-filter": BloomFilterSceneRenderer,
  cache: CacheSceneRenderer,
  pipeline: PipelineSceneRenderer,
  "middleware-chain": MiddlewareChainSceneRenderer,
  comparison: ComparisonSceneRenderer,
};
```

Cada lição declara seu `rendererKind` no `LessonDefinition`:

```typescript
interface LessonDefinition {
  // ... campos existentes
  rendererKind?: RendererKind; // novo
}
```

O `FlowScenePlayer` usa `rendererKind` da lição para selecionar o renderer, e a família define apenas a estrutura de dados da cena.

---

## 2. MotionToken — primitiva base de animação

Não usar `TravelingPacket` como peça única. Criar uma hierarquia:

```typescript
// Primitiva base — todos os tokens animados herdam
interface MotionTokenProps {
  id: string;
  from: Position;
  to: Position;
  progress: number; // 0–1
  label?: string;
  reducedMotion: boolean;
  variant: TokenVariant;
}

type TokenVariant =
  | "data-packet"       // Pipeline: pacote trafegando entre estágios
  | "key-token"         // Árvore: chave subindo/descendo
  | "message-token"     // Fila: mensagem entrando/saindo
  | "traversal-token"   // Grafo: visita percorrendo aresta
  | "memory-ref-token"  // Memória: seta de frame para heap
  | "state-event-token" // State machine: evento transitando
  | "hash-token"        // Hash: chave sendo roteada para bucket
  | "bloom-token"       // Bloom: bits sendo marcados
  | "pointer-token";    // Genérico: ponteiro (front, rear, top)
```

Cada variante tem cor, formato e comportamento distintos. Nada de packet genérico para todas as cenas.

Onde implementar: `src/features/flow-scene/primitives/MotionToken.tsx` com subcomponentes em `src/features/flow-scene/primitives/tokens/`.

---

## 3. Renderers por família

### 3.1 Pipeline family (engine: pipeline)

| RendererKind | Lições | Metáfora |
|---|---|---|
| `array` | array | Cards em sequência indexada, deslocamento à direita |
| `linked-structure` | linked-list, doubly-linked-list | Cards com setas direcionais, relink |
| `stack` | stack | Cards empilhados verticalmente, LIFO |
| `pipeline` | linear-search, condition-if, loop-for, request-flow, backend-request, backend-cache | Pipeline genérico com estágios e progressão |
| `middleware-chain` | backend-router, backend-validation, backend-service-layer | Cadeia de middleware com request fluindo por camadas |
| `cache` | lru | Lista dupla + hash, destaque do LRU |

### 3.2 Queue family (engine: queue)

| RendererKind | Lições | Metáfora |
|---|---|---|
| `queue` | queue, deque | Trilho com front/rear, FIFO |
| `messaging` | backend-queue, backend-worker, backend-idempotency, backend-retry, backend-dlq, backend-async | Regiões enqueue/worker/dlq com mensagens |

### 3.3 Tree family (engine: tree)

| RendererKind | Lições | Metáfora |
|---|---|---|
| `binary-tree` | bst, balanced (AVL) | Nós com 2 filhos, layout recursivo, rotação |
| `b-plus-tree` | btree | Páginas com múltiplas chaves, split |
| `trie` | trie | Nós-filho por caractere, prefixo compartilhado |
| `heap` | heap | Árvore completa, bubble-up visual |

### 3.4 Graph family (engine: graph)

| RendererKind | Lições | Metáfora |
|---|---|---|
| `graph-traversal` | bfs, dfs | Grafo com destaque de visitação por camada/profundidade |
| `shortest-path` | dijkstra, bellman-ford | Grafo ponderado com relaxamento de arestas |
| `disjoint-set` | union-find | Árvores de representantes com merge |

### 3.5 Distribution family (engine: distribution) — nova

| RendererKind | Lições | Metáfora |
|---|---|---|
| `hash-table` | hash | Buckets com encadeamento, roteamento por hash |
| `set` | set | Conjunto com rejeição visual de duplicata |

### 3.6 Memory family (engine: memory) — nova

| RendererKind | Lições | Metáfora |
|---|---|---|
| `memory` | memory-reference | Stack frame + heap com setas de referência, mutação |

### 3.7 Transformation family (engine: transformation) — nova

| RendererKind | Lições | Metáfora |
|---|---|---|
| `circular-buffer` | circular-buffer | Anel com ponteiros read/write, wrap-around, ocupação |
| `bloom-filter` | bloom-filter | Bit array com k hashes, probabilidade |

### 3.8 State-machine family (engine: state-machine) — nova

Reservada para conceitos futuros como Circuit Breaker, lifecycle de conexão, estados de autenticação e transações. **Não** usar para router/validation/service-layer (esses são `middleware-chain` na família pipeline).

### 3.9 Comparações

| RendererKind | Lições |
|---|---|
| `comparison` | Todas as 6 (insert-middle, array-queue, list-hash, bfs-dijkstra, bfs-dfs) |

Renderiza dois players lado a lado com labeling.

---

## 4. Modelos faltantes — definir para 4 famílias novas

### 4.1 Distribution (`HashTableSceneDefinition`)

```typescript
interface DistributionSceneDefinition extends BaseFlowSceneDefinition {
  family: "distribution";
  buckets: BucketNode[];
  keys: KeyToken[];
  routing: RoutingArrow[];
}

interface BucketNode {
  id: string;
  label: string;
  items: string[]; // key IDs no bucket
  highlight?: "idle" | "active" | "warning";
}

interface RoutingArrow {
  from: string; // key id
  to: string;   // bucket id
  visible: boolean;
}
```

### 4.2 Memory (`MemorySceneDefinition`)

```typescript
interface MemorySceneDefinition extends BaseFlowSceneDefinition {
  family: "memory";
  frames: StackFrame[];
  heap: HeapObject[];
  references: ReferenceArrow[];
}

interface StackFrame {
  id: string;
  label: string;
  variables: StackVariable[];
}

interface StackVariable {
  name: string;
  value: string;
  pointsTo?: string; // heap object id
}

interface HeapObject {
  id: string;
  type: "object" | "array" | "primitive";
  fields: Record<string, string>;
  address: string;
}
```

### 4.3 State-machine (`StateMachineSceneDefinition`)

```typescript
interface StateMachineSceneDefinition extends BaseFlowSceneDefinition {
  family: "state-machine";
  states: StateNode[];
  transitions: StateTransition[];
  currentState: string;
}

interface StateNode {
  id: string;
  label: string;
  kind: "initial" | "normal" | "final" | "error";
}

interface StateTransition {
  id: string;
  from: string;
  to: string;
  event: string;
  guard?: string;
}
```

### 4.4 Transformation (`TransformationSceneDefinition`)

```typescript
interface TransformationSceneDefinition extends BaseFlowSceneDefinition {
  family: "transformation";
  input: DataItem[];
  output: DataItem[];
  transform: TransformStep[];
  bits?: BitArray;
}

interface BitArray {
  size: number;
  bits: number[]; // índices marcados
  hashFunctions: string[];
}
```

### 4.5 Actions declarativas para as novas famílias

Cada família precisa de ações de cena correspondentes:

```typescript
// Distribution
| { type: "HASH_KEY"; keyId: string; bucketId: string }
| { type: "CHAIN_KEY"; keyId: string; bucketId: string }
| { type: "REJECT_KEY"; keyId: string }

// Memory
| { type: "PUSH_FRAME"; frameId: string }
| { type: "POP_FRAME" }
| { type: "ALLOCATE"; objectId: string }
| { type: "POINT_TO"; variable: string; objectId: string }
| { type: "MUTATE"; objectId: string; field: string; value: string }

// Transformation
| { type: "MARK_BIT"; bitIndex: number }
| { type: "SET_INPUT"; items: DataItem[] }
| { type: "SET_OUTPUT"; items: DataItem[] }

// StateMachine
| { type: "TRANSITION"; from: string; to: string; event: string }
| { type: "GUARD_CHECK"; transition: string; result: boolean }
```

### 4.6 Reducers para as novas famílias

Criar `src/core/flow-scene/reducers/` com um reducer por família:

```
reducers/
  reducePipelineScene.ts
  reduceTreeScene.ts
  reduceQueueScene.ts
  reduceGraphScene.ts
  reduceDistributionScene.ts    # novo
  reduceMemoryScene.ts          # novo
  reduceTransformationScene.ts  # novo
  reduceStateMachineScene.ts    # novo
```

Cada reducer exporta `reduce<Family>Scene(snapshot, action) → snapshot`.

---

## 5. Correções de conteúdo

### 5.1 Mapeamento final lição → rendererKind

| Lição | Module | RendererKind | Status |
|---|---|---|---|
| Array | data-structure | `array` | P1 |
| Linked list | data-structure | `linked-structure` | P1 |
| Doubly linked list | data-structure | `linked-structure` | P1 |
| Stack | data-structure | `stack` | P1 |
| Queue | data-structure | `queue` | P1 |
| Deque | data-structure | `queue` | P1 |
| Hash table | data-structure | `hash-table` | P1 |
| Set | data-structure | `set` | P1 |
| BST | data-structure | `binary-tree` | P1 |
| AVL | data-structure | `binary-tree` | P1 |
| Heap | data-structure | `heap` | P1 |
| Trie | data-structure | `trie` | P1 |
| B+ Tree | data-structure | `b-plus-tree` | P2 |
| LRU Cache | data-structure | `cache` | P1 |
| Circular buffer | data-structure | `circular-buffer` | P1 |
| Bloom Filter | data-structure | `bloom-filter` | P1 |
| Linear search | algorithm | `pipeline` | P2 |
| BFS | algorithm | `graph-traversal` | P1 |
| DFS | algorithm | `graph-traversal` | P1 |
| Dijkstra | algorithm | `shortest-path` | P2 |
| Union-Find | algorithm | `disjoint-set` | P1 |
| Bellman-Ford | algorithm | `shortest-path` | P1 |
| If condition | logic | `pipeline` | P2 |
| Loop for | logic | `pipeline` | P2 |
| Memory | memory | `memory` | P1 |
| Request flow | system-design | `pipeline` | P1 |
| Backend router | system-design | `middleware-chain` | P1 |
| Backend validation | system-design | `middleware-chain` | P1 |
| Backend service | system-design | `middleware-chain` | P1 |
| Backend authn | system-design | `middleware-chain` | P1 |
| Backend authz | system-design | `middleware-chain` | P1 |
| Backend queue | system-design | `messaging` | P1 |
| Backend worker | system-design | `messaging` | P1 |
| Backend idempotency | system-design | `messaging` | P1 |
| Backend retry | system-design | `messaging` | P1 |
| Backend DLQ | system-design | `messaging` | P2 |
| Backend request | system-design | `pipeline` | P1 |
| Backend cache | system-design | `pipeline` | P1 |
| Backend auth | system-design | `middleware-chain` | P1 |
| Backend async | system-design | `messaging` | P1 |

Total: 40 lições. P1 = 34 (migrar), P2 = 6 (refinar).

---

## 6. Desacoplamento do LessonPlayer

### 6.1 Timers acoplados

Extrair `setTimeout` do `LessonPlayer.tsx` para um hook:

```typescript
function useAutoplay(
  stepCount: number,
  speed: number,
  onNext: () => void,
) {
  // timer isolado, testável sem React
}
```

### 6.2 TimelineControls

Já separado. Verificar se aceita apenas props puras (sem acesso ao store diretamente).

---

## 7. Acessibilidade

### 7.1 Reduced motion

Usar `useReducedMotion` já existente em `src/shared/hooks/useReducedMotion.ts`. Aplicar em:
- `MotionToken` base
- Transições CSS nos renderers
- Animações de highlight

### 7.2 ARIA live

**Manter uma única região `aria-live="polite"` no `FlowScenePlayer`.** Não adicionar em cada renderer. O player anuncia o passo atual; o foco do usuário não deve ser movido.

```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {currentStepDescription}
</div>
```

### 7.3 Foco

Não forçar foco a cada mudança de passo. Preservar a posição do usuário. A região `aria-live` já notifica leitores de tela.

---

## 8. Testes

### 8.1 Testes de renderer

Criar `src/features/flow-scene/renderers/*.test.tsx`:
- Snapshot básico
- Mudança de step
- Nós/arestas renderizados
- Classe de highlight
- Reduced motion class

### 8.2 Testes de layout

Testar funções de posicionamento sem DOM.

### 8.3 Testes de accessibility

Usar `jest-axe` ou `@testing-library/jest-dom` para verificar `aria-live`.

---

## 9. Prioriade de implementação

### Fase 1 — Base estrutural

1. Definir tipos para 4 novas famílias (distribution, memory, transformation, state-machine)
2. Criar reducers para as novas famílias
3. Criar `MotionToken` com variantes
4. Separar registry: `SceneFamily` + `RendererKind`
5. Extrair `useAutoplay` hook

### Fase 2 — Novos renderers (8)

6. `MiddlewareChainSceneRenderer` (pipeline family)
7. `StackSceneRenderer` (pipeline family)
8. `ArraySceneRenderer` (pipeline family)
9. `HashTableSceneRenderer` (distribution family)
10. `SetSceneRenderer` (distribution family)
11. `MemorySceneRenderer` (memory family)
12. `CircularBufferSceneRenderer` (transformation family)
13. `BloomFilterSceneRenderer` (transformation family)

### Fase 3 — Evolução de renderers existentes (7)

14. `BinaryTreeSceneRenderer` (evolui Tree)
15. `BPlusTreeSceneRenderer` (evolui Tree)
16. `TrieSceneRenderer` (evolui Tree)
17. `HeapSceneRenderer` (evolui Tree)
18. `GraphTraversalSceneRenderer` (evolui WeightedGraph)
19. `ShortestPathSceneRenderer` (evolui WeightedGraph)
20. `DisjointSetSceneRenderer` (evolui WeightedGraph)
21. `MessagingSceneRenderer` (evolui Queue)
22. `ComparisonSceneRenderer` (híbrido)

### Fase 4 — Migração de conteúdo (34 lições P1)

Para cada lição:
1. Identificar `RendererKind` correto
2. Escrever `createFlowScene` ou `flowScene` declarativo
3. Adicionar ao LessonDefinition
4. Verificar visualmente
5. Escrever teste

### Fase 5 — Refinamento (6 lições P2)

B+ Tree, Dijkstra, DLQ, Busca linear, If, Loop:
- Adicionar `MotionToken` onde couber
- Adicionar testes
- Revisar responsividade

### Fase 6 — Testes finais

- Testes para todos os 23 renderers
- Testes de layout
- Testes axe-core no player
- Verificação E2E

---

## 10. Não escopo

- Não alterar o protótipo canônico
- Não remover traces legados (manter fallback)
- Não adicionar dependências externas
- Não mudar roteamento, store, persistência
- `useReducedMotion` já existe — não recriar

---

## 11. Verificação

- [ ] `npm run check` sem erros
- [ ] `npm run test:e2e` passando
- [ ] `npm run dev` sem warnings
- [ ] Cada lição renderiza com metáfora visual correta
- [ ] MotionToken com variante correta em cada família
- [ ] `prefers-reduced-motion` desliga animações
- [ ] Única região `aria-live` no player anuncia passos
- [ ] Foco do usuário não é movido automaticamente
- [ ] Comparações lado a lado funcionam
- [ ] Play/Pause/Next/Prev/Replay/Speed funcionam
- [ ] Layout responsivo reorganiza em viewport < 640px
- [ ] `docs/PARITY_MATRIX.md` atualizado
