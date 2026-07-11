# TRACE — PROMPT MESTRE DE CONTINUIDADE E EXPANSÃO

## Contexto

Você está dando continuidade ao **Trace**, uma plataforma educacional visual e interativa para ensinar programação, lógica, estruturas de dados, algoritmos, memória, controle de fluxo e system design por meio de motion design, manipulação visual, exemplos cotidianos, comparações e explicações do funcionamento interno da computação.

O projeto já possui um protótipo HTML funcional e visualmente validado. Ele contém lições animadas, estruturas de dados, timelines, alternância entre representação abstrata e aplicação prática, comparações sincronizadas, métricas, quizzes, modo claro/escuro, suporte inicial a movimento reduzido e uma identidade visual consolidada.

O objetivo deste trabalho é **evoluir o produto existente**, não criar outro projeto com o mesmo nome.

---

# 1. Regra principal: continuidade, não reescrita

O protótipo HTML atual deve ser tratado como fonte de verdade para:

- identidade visual;
- layout;
- espaçamento;
- tipografia;
- hierarquia;
- temas claro e escuro;
- comportamento das timelines;
- transições;
- easing;
- motion design;
- persistência dos elementos entre passos;
- alternância entre modos;
- comparações sincronizadas;
- drawers;
- métricas;
- quizzes;
- reduced motion;
- linguagem visual geral.

## Proibições

Não realizar uma reescrita total ou uma substituição greenfield.

Não apagar o protótipo atual.

Não iniciar uma nova aplicação ignorando os comportamentos já validados.

Não substituir as animações existentes por transições genéricas.

Não remover uma funcionalidade antes que sua substituta:

- esteja implementada;
- esteja testada;
- mantenha paridade visual;
- mantenha paridade funcional;
- preserve o motion design;
- preserve acessibilidade;
- tenha sido comparada com o comportamento original.

## Estratégia obrigatória

Adotar uma migração incremental inspirada no **Strangler Fig Pattern**.

Durante a transição, o projeto poderá conter:

```text
/
├── prototype/
│   └── versão HTML original preservada
│
├── src/
│   └── aplicação modular em evolução
│
└── docs/
    └── documentação de migração, arquitetura e paridade
```

O protótipo original deve permanecer executável enquanto a nova estrutura cresce ao redor dele.

---

# 2. Primeira obrigação: auditar o projeto atual

Antes de alterar qualquer arquivo:

1. inspecione toda a estrutura do repositório;
2. localize o HTML atual e todos os seus assets;
3. execute o projeto;
4. teste as interações;
5. verifique erros de compilação, runtime e console;
6. identifique:
   - stack atual;
   - arquivos de protótipo;
   - estilos;
   - design tokens implícitos;
   - animações;
   - estruturas de dados existentes;
   - comparações;
   - conteúdos hardcoded;
   - estado global;
   - persistência;
   - testes;
   - acessibilidade;
   - limitações técnicas;
7. registre o que está:
   - implementado;
   - parcialmente implementado;
   - apenas prototipado;
   - planejado;
   - quebrado;
   - inexistente.

Criar obrigatoriamente:

```text
docs/CURRENT_STATE.md
docs/PRODUCT_VISION.md
docs/ARCHITECTURE.md
docs/BACKLOG.md
docs/MIGRATION_PLAN.md
docs/PARITY_MATRIX.md
docs/DESIGN_SYSTEM.md
docs/MOTION_SYSTEM.md
```

---

# 3. Matriz de paridade

Nenhuma funcionalidade existente deve ser considerada migrada até possuir paridade documentada.

Exemplo:

```text
| Feature                    | Original | Nova versão | Paridade visual | Paridade funcional | Testada |
|---------------------------|----------|-------------|------------------|--------------------|---------|
| Timeline                  | Sim      | Sim         | Sim              | Sim                | Sim     |
| Abstrato/prático          | Sim      | Sim         | Sim              | Sim                | Sim     |
| Lista encadeada           | Sim      | Parcial     | Não              | Parcial            | Não     |
| Comparação lado a lado    | Sim      | Não         | —                | —                  | Não     |
```

Atualize `docs/PARITY_MATRIX.md` após cada etapa relevante.

---

# 4. Visão do produto

O Trace não é apenas um catálogo de animações.

Ele deve ensinar o usuário a compreender:

1. qual problema está sendo resolvido;
2. como o computador representa esse problema;
3. como a execução evolui ao longo do tempo;
4. quais partes da memória são alteradas;
5. quais decisões o programa toma;
6. qual estrutura ou algoritmo foi escolhido;
7. quanto essa escolha custa;
8. como isso aparece em software real;
9. quais alternativas existiam;
10. quando a solução deixa de funcionar bem.

A proposta central é transformar conceitos abstratos em estados temporais, manipuláveis, comparáveis e observáveis.

A progressão pedagógica deve seguir, quando aplicável:

```text
Observar
→ Prever
→ Manipular
→ Completar
→ Implementar
→ Comparar
→ Otimizar
```

---

# 5. Escopo da plataforma

O Trace deve evoluir para ensinar:

- lógica de programação;
- fundamentos de programação;
- controle de fluxo;
- memória e execução;
- estruturas de dados;
- algoritmos;
- padrões algorítmicos;
- system design;
- resolução de problemas;
- comparação de soluções;
- flashcards;
- revisão espaçada;
- mapa de conhecimento;
- gamificação e conquistas;
- progresso e domínio.

---

# 6. Estrutura futura da aplicação

Hoje o projeto pode parecer uma landing page com demonstrações.

Quando crescer, deve existir uma separação clara entre apresentação pública e plataforma educacional.

```text
/
├── Landing page pública
│   ├── proposta do Trace
│   ├── demonstração interativa
│   ├── módulos
│   ├── trilhas
│   └── chamada para começar
│
└── /app
    ├── dashboard
    ├── aprender
    ├── comparar
    ├── playground
    ├── revisar
    ├── system design
    ├── mapa de conhecimento
    ├── conquistas
    ├── progresso
    └── configurações
```

Rotas sugeridas:

```text
/                               Landing page

/app                            Dashboard
/app/learn                      Trilhas
/app/learn/logic                Lógica
/app/learn/programming          Programação
/app/learn/memory               Memória
/app/learn/data-structures      Estruturas de dados
/app/learn/algorithms           Algoritmos
/app/learn/system-design        System design

/app/lesson/:lessonId           Tela genérica de lição
/app/compare                    Comparações
/app/playground                 Laboratório
/app/review                     Flashcards
/app/knowledge-map              Mapa de conhecimento
/app/achievements               Conquistas
/app/progress                   Progresso
/app/settings                   Preferências
```

A landing page atual não deve ser eliminada.

---

# 7. Arquitetura técnica recomendada

Caso o repositório ainda seja apenas um conjunto de HTMLs, migrar progressivamente para:

- React;
- TypeScript;
- Vite;
- Zustand ou XState;
- SVG e DOM para cenas interativas;
- IndexedDB;
- Web Workers;
- JSON, TypeScript ou MDX para conteúdo;
- Vitest;
- Testing Library;
- Playwright;
- axe-core.

Não introduzir backend no MVP sem necessidade.

Organização sugerida:

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers.tsx
│   └── layouts/
│       ├── MarketingLayout.tsx
│       └── LearningAppLayout.tsx
│
├── pages/
│   ├── LandingPage/
│   ├── DashboardPage/
│   ├── LearningPathsPage/
│   ├── LessonPage/
│   ├── ComparePage/
│   ├── PlaygroundPage/
│   ├── ReviewPage/
│   ├── SystemDesignPage/
│   ├── KnowledgeMapPage/
│   ├── ProgressPage/
│   └── SettingsPage/
│
├── core/
│   ├── trace-engine/
│   ├── timeline/
│   ├── lesson-engine/
│   ├── assessment/
│   ├── progress/
│   ├── achievements/
│   └── spaced-repetition/
│
├── features/
│   ├── lesson-player/
│   ├── timeline/
│   ├── comparisons/
│   ├── playground/
│   ├── flashcards/
│   ├── memory-visualizer/
│   ├── code-execution/
│   ├── system-design-simulator/
│   └── knowledge-map/
│
├── renderers/
│   ├── data-structure-renderer/
│   ├── algorithm-renderer/
│   ├── memory-renderer/
│   ├── control-flow-renderer/
│   └── system-design-renderer/
│
├── content/
│   ├── logic/
│   ├── programming/
│   ├── memory/
│   ├── data-structures/
│   ├── algorithms/
│   ├── system-design/
│   ├── flashcards/
│   └── achievements/
│
├── shared/
│   ├── components/
│   ├── motion/
│   ├── accessibility/
│   ├── hooks/
│   ├── utilities/
│   └── types/
│
├── storage/
│   ├── indexed-db/
│   ├── repositories/
│   └── migrations/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── accessibility/
    └── e2e/
```

Não é necessário criar toda essa estrutura de uma vez. Ela representa o destino arquitetural.

---

# 8. LessonPlayer genérico

Todas as lições devem usar um player reutilizável.

```text
LessonPlayer
├── LessonHeader
├── RepresentationToggle
│   ├── Abstrato
│   ├── Prático
│   ├── Memória
│   └── Código
├── TraceCanvas
├── TimelineControls
├── MetricsPanel
├── ExplanationLayers
├── ChallengePanel
├── FlashcardPreview
└── LessonCompletion
```

Array, busca binária, controle de fluxo e memória não devem possuir páginas inteiramente independentes.

Todos devem compartilhar:

- timeline;
- estado;
- controles;
- acessibilidade;
- motion;
- métricas;
- persistência;
- sistema de desafios.

---

# 9. Trace Engine

O núcleo do produto deve ser um mecanismo genérico de traces.

Um conceito não deve produzir diretamente uma animação. Ele deve produzir eventos de domínio.

```ts
type TraceEvent =
  | { type: "COMPARE"; targets: string[] }
  | { type: "MOVE"; target: string; from: Position; to: Position }
  | { type: "INSERT"; target: string; position: Position }
  | { type: "REMOVE"; target: string }
  | { type: "LINK"; from: string; to: string }
  | { type: "UNLINK"; from: string; to: string }
  | { type: "READ_MEMORY"; address: string }
  | { type: "WRITE_MEMORY"; address: string; value: unknown }
  | { type: "PUSH_STACK_FRAME"; frameId: string }
  | { type: "POP_STACK_FRAME"; frameId: string }
  | { type: "BRANCH"; condition: string; result: boolean }
  | { type: "CALL_FUNCTION"; functionName: string }
  | { type: "RETURN_VALUE"; value: unknown }
  | { type: "SEND_REQUEST"; from: string; to: string }
  | { type: "RECEIVE_RESPONSE"; from: string; to: string }
  | { type: "PUBLISH_EVENT"; channel: string }
  | { type: "CONSUME_EVENT"; channel: string }
  | { type: "CACHE_HIT"; key: string }
  | { type: "CACHE_MISS"; key: string }
  | { type: "TIMEOUT"; target: string }
  | { type: "RETRY"; target: string }
  | { type: "FAIL_NODE"; target: string }
  | { type: "RECOVER_NODE"; target: string };
```

A timeline deve ser a fonte única da verdade.

```ts
interface TraceState {
  lessonId: string;
  stepIndex: number;
  status: "idle" | "playing" | "paused" | "completed";
  representation: "abstract" | "practical" | "memory" | "code";
  speed: number;
}
```

As visualizações abstrata, prática, de memória e de código devem ser renderizações diferentes do mesmo estado.

Não criar timelines independentes para o mesmo conteúdo.

---

# 10. Conteúdo orientado a dados

As lições não devem ficar hardcoded em componentes.

```ts
interface LessonDefinition {
  id: string;
  title: string;
  module: string;
  difficulty: "foundation" | "intermediate" | "advanced";
  prerequisites: string[];
  objectives: string[];

  practicalExampleKind:
    | "visual-analogy"
    | "possible-modeling"
    | "natural-modeling"
    | "common-technical-use";

  representations: {
    abstract?: SceneDefinition;
    practical?: SceneDefinition;
    memory?: SceneDefinition;
    code?: CodeDefinition;
  };

  trace: TraceDefinition;
  explanation: LessonExplanation;
  challenges: ChallengeDefinition[];
  flashcards: FlashcardDefinition[];
  achievements?: AchievementTrigger[];
}
```

Cada lição deve responder:

- qual problema existe;
- qual é o modelo mental;
- como funciona;
- qual é o custo;
- quando usar;
- quando não usar;
- qual alternativa existe;
- como aparece na prática;
- quais erros são comuns;
- qual conceito precisa ser revisado.

---

# 11. Honestidade dos exemplos práticos

Exemplos cotidianos devem ser tangíveis, mas tecnicamente honestos.

Cada exemplo deve ser classificado como:

- analogia visual;
- modelagem possível;
- modelagem natural;
- uso técnico comum.

Nunca afirmar que Instagram, WhatsApp, Spotify, Uber ou Google utilizam exatamente uma estrutura específica sem fonte técnica confiável.

Usar frases como:

> Esse comportamento pode ser modelado como...

> Essa estrutura é frequentemente usada em sistemas desse tipo...

> A analogia ajuda a visualizar...

Exemplos adequados:

| Estrutura | Exemplo |
|---|---|
| Array | Pixels de uma imagem, casas de um tabuleiro |
| Lista encadeada | Sequência dinâmica de etapas |
| Lista dupla | Histórico voltar/avançar |
| Pilha | Desfazer ações, pilha de chamadas |
| Fila | Impressões, mensagens aguardando envio |
| Deque | Tarefas normais e prioritárias |
| Hash table | Contatos por número, cache por URL |
| Set | IDs únicos de visualização |
| Heap | Próxima tarefa mais urgente |
| Trie | Autocomplete |
| Grafo | Seguidores, mapas, dependências |
| Union-Find | Verificar conectividade |
| LRU | Imagens recentes em cache |
| B-Tree/B+ Tree | Índices de banco de dados |
| Buffer circular | Áudio e vídeo em streaming |
| Bloom Filter | Evitar consultas caras desnecessárias |

---

# 12. Design system

A identidade visual já foi validada e deve permanecer consistente.

Manter:

- estética adulta e minimalista;
- inspiração em ferramentas como Notion;
- fundo off-white;
- preto quase absoluto;
- escala de cinzas;
- uso mínimo de cor;
- muito espaço negativo;
- bordas discretas;
- sombras suaves;
- tipografia limpa;
- hierarquia visual clara;
- interface sem aparência infantil.

A gamificação não deve usar:

- moedas;
- vidas;
- energia;
- baús;
- roletas;
- recompensas aleatórias;
- elementos de cassino.

---

# 13. Motion system

Os elementos devem permanecer no DOM entre os estados sempre que possível.

Priorizar:

- `transform: translate3d`;
- escala;
- opacidade;
- desenho progressivo de conexões;
- movimentação espacial contínua;
- antecipação;
- aceleração;
- desaceleração;
- pequeno overshoot;
- assentamento.

Evitar:

- apagar e recriar toda a cena;
- teleportar elementos;
- transições instantâneas;
- animações decorativas;
- movimentos que escondam causalidade.

A animação deve mostrar:

```text
estado anterior
→ operação
→ elementos afetados
→ custo
→ mutação
→ novo estado
```

Antes de migrar uma cena, documentar:

- estado inicial;
- estado final;
- duração;
- easing;
- atraso;
- overshoot;
- assentamento;
- conexões;
- elementos que permanecem no DOM.

---

# 14. Acessibilidade

Toda feature visual deve possuir equivalente acessível.

Implementar:

- navegação por teclado;
- foco visível;
- gerenciamento de foco;
- `aria-live="polite"`;
- descrição textual do passo;
- labels adequados;
- contraste;
- semântica HTML;
- leitores de tela;
- `prefers-reduced-motion`.

Quando o movimento reduzido estiver ativo:

- usar cross-fade ou quadros estáticos;
- preservar os passos;
- preservar a timeline;
- preservar o conteúdo;
- não depender de movimento para transmitir informação.

---

# 15. Módulo de lógica

Criar uma trilha inicial cobrindo:

- valores;
- tipos;
- variáveis;
- operadores;
- expressões;
- lógica booleana;
- comparações;
- tabelas verdade;
- condições;
- repetição;
- funções;
- parâmetros;
- retorno;
- escopo;
- imutabilidade;
- estado;
- decomposição de problemas.

Exemplo visual:

```text
idade >= 18
    ↓
comparação
    ↓
true
    ↓
ramo permitido
```

O usuário deve poder:

- alterar valores;
- prever resultados;
- visualizar avaliação;
- montar condições;
- detectar redundâncias;
- identificar loops infinitos.

---

# 16. Controle de fluxo

Criar visualizações para:

- execução sequencial;
- `if`;
- `else`;
- `switch`;
- `for`;
- `while`;
- `do while`;
- `break`;
- `continue`;
- chamadas;
- retorno;
- exceções;
- fluxo assíncrono;
- event loop futuramente.

Representar um cursor de execução sincronizado com:

- linha de código;
- variáveis;
- condição;
- bloco escolhido;
- memória;
- saída.

---

# 17. Módulo de memória

Criar um módulo chamado provisoriamente:

> Por baixo dos panos

Ensinar:

- bits e bytes;
- endereços;
- memória contígua;
- stack;
- heap;
- stack frames;
- parâmetros;
- variáveis locais;
- referências;
- valores;
- mutabilidade;
- cópia por valor;
- compartilhamento de referências;
- alocação;
- desalocação;
- garbage collection;
- vazamentos;
- recursão;
- stack overflow;
- localidade espacial e temporal;
- cache de CPU de forma introdutória.

As visualizações devem ser simulações pedagógicas, não representações literais do hardware.

Exemplo:

```text
Código
Pessoa pessoa = new Pessoa();

Call stack
pessoa → 0xA104

Heap
0xA104 → Pessoa { nome: "Ana" }
```

---

# 18. Estruturas de dados

## Fundamentos

- Array;
- lista encadeada;
- lista duplamente encadeada;
- pilha;
- fila;
- deque;
- hash table;
- set.

## Hierárquicas

- árvore binária de busca;
- AVL;
- Red-Black Tree;
- heap;
- trie;
- B-Tree;
- B+ Tree.

## Grafos e conectividade

- grafo;
- Union-Find;
- adjacency list;
- adjacency matrix.

## Sistemas reais

- LRU Cache;
- buffer circular;
- Bloom Filter;
- Skip List;
- índice invertido;
- bitmap/BitSet.

## Avançadas futuras

- Segment Tree;
- Fenwick Tree;
- KD-Tree;
- R-Tree;
- consistent hashing.

Corrigir animações conceitualmente incompletas. Por exemplo, a inserção em max-heap deve continuar realizando `bubble-up` até restaurar a propriedade do heap.

---

# 19. Algoritmos

## Busca

- busca linear;
- busca binária;
- busca em hash;
- busca em árvore.

## Ordenação

- bubble sort;
- selection sort;
- insertion sort;
- merge sort;
- quicksort;
- heap sort.

Mostrar:

- comparações;
- trocas;
- leituras;
- escritas;
- memória auxiliar;
- estabilidade;
- melhor caso;
- caso médio;
- pior caso.

## Grafos

- BFS;
- DFS;
- Dijkstra;
- ordenação topológica;
- detecção de ciclos;
- componentes conectados;
- Kruskal;
- Prim posteriormente.

## Padrões algorítmicos

- dois ponteiros;
- sliding window;
- contagem com hash;
- recursão;
- backtracking;
- divide and conquer;
- greedy;
- programação dinâmica introdutória.

---

# 20. Ensino de programação

Adicionar um ambiente de código progressivo.

Fases:

1. código somente leitura;
2. completar lacunas;
3. ordenar linhas;
4. corrigir condições;
5. implementar funções curtas;
6. executar e observar;
7. comparar com solução de referência.

Para o MVP:

- usar pseudocódigo;
- usar JavaScript/TypeScript executável;
- executar em Web Worker;
- aplicar timeout;
- evitar loops infinitos;
- capturar logs;
- não bloquear a interface.

Permitir leitura equivalente em Java, sem bloquear o MVP tentando executar Java no navegador.

---

# 21. Flashcards

Criar um módulo de reforço inspirado no antigo Tinycards, sem copiar sua identidade.

Características:

- frente e verso;
- animação discreta;
- sessões curtas;
- revisão espaçada;
- dificuldade adaptativa;
- cards gerados das lições;
- cards de erro pessoal;
- cards de comparação;
- cards de código;
- cards de complexidade.

Exemplo:

```text
Frente:
Qual estrutura remove o item mais antigo primeiro?

Verso:
Fila — FIFO
```

O visual deve continuar pertencendo ao Trace.

---

# 22. System design

Criar um módulo visual e animado cobrindo:

- cliente e servidor;
- HTTP;
- API;
- banco de dados;
- cache;
- fila;
- worker;
- load balancer;
- CDN;
- replicação;
- particionamento;
- sharding;
- rate limiting;
- retry;
- timeout;
- circuit breaker;
- idempotência;
- observabilidade;
- consistência;
- disponibilidade;
- escalabilidade vertical e horizontal.

Exemplo:

```text
Usuário envia pedido
→ API valida
→ banco persiste
→ evento entra na fila
→ worker consome
→ notificação é enviada
```

Permitir:

- pausar;
- avançar;
- ver requests;
- ver payloads;
- simular falhas;
- ativar cache;
- adicionar réplica;
- comparar arquiteturas;
- observar latência, throughput e disponibilidade.

Primeiro cenário recomendado:

> Processamento assíncrono de pedidos e notificações.

Componentes:

- cliente;
- API;
- banco;
- fila;
- worker;
- serviço de notificação.

Simulações:

- fluxo normal;
- serviço indisponível;
- retry;
- duplicidade;
- idempotência;
- DLQ.

---

# 23. Comparações

Manter o módulo de comparação como recurso complementar.

Exemplos:

- Array × lista;
- Array × fila;
- lista × hash;
- busca linear × busca binária;
- BST × árvore balanceada;
- lista × heap;
- BFS × DFS;
- BFS × Dijkstra;
- cache ausente × cache presente;
- síncrono × assíncrono;
- banco único × réplica.

Mostrar:

- operações;
- elementos tocados;
- memória;
- latência simulada;
- complexidade;
- trade-offs.

Nunca declarar uma solução universalmente melhor.

---

# 24. Playground

Planejar um laboratório configurável.

O usuário deve poder escolher:

- conceito;
- entrada;
- quantidade;
- operação;
- velocidade;
- visualização;
- linguagem;
- cenário prático.

Exemplo:

```text
Estrutura: Fila
Valores: mensagem-01, mensagem-02, mensagem-03
Operação: enqueue
Novo valor: mensagem-04
```

Começar com operações controladas.

Não tentar criar uma linguagem universal antes de validar o motor.

---

# 25. Gamificação

A gamificação deve ser discreta e ligada ao domínio real.

Adicionar:

- progresso por trilha;
- domínio por conceito;
- conquistas;
- mapa de conhecimento;
- pré-requisitos;
- desafios concluídos;
- consistência de estudo;
- precisão;
- revisão necessária;
- conceitos frágeis;
- conceitos dominados.

Exemplos:

- Primeiro Trace;
- Sem perder a referência;
- Pensamento logarítmico;
- Por baixo dos panos;
- Caçador de gargalos;
- Estruturas compostas;
- Conectado.

Conquistas devem representar aprendizado, não cliques.

---

# 26. Mapa de conhecimento

Criar um grafo de dependências.

```text
Variáveis
  ↓
Expressões
  ↓
Condições
  ↓
Loops
  ↓
Funções
  ↓
Recursão

Array
  ↓
Busca linear
  ↓
Busca binária
  ↓
Divide and conquer

Lista dupla + Hash table
  ↓
LRU Cache

Fila
  ↓
BFS
  ↓
Caminhos em grafos
```

O mapa deve orientar, não bloquear rigidamente.

---

# 27. Persistência

No MVP, armazenar localmente:

- lições iniciadas;
- lições concluídas;
- último passo;
- respostas;
- tentativas;
- erros frequentes;
- domínio estimado;
- flashcards pendentes;
- conquistas;
- preferências;
- tema;
- velocidade;
- reduced motion.

Usar IndexedDB para dados estruturados.

Criar uma camada de storage abstrata para backend futuro.

---

# 28. Testes

## Unitários

- geração de traces;
- mudança de passo;
- avaliação;
- progresso;
- revisão espaçada;
- conquistas.

## Componentes

- timeline;
- toggles;
- controles;
- flashcards;
- drawers;
- dialogs;
- cenas.

## Integração

- lição completa;
- troca de representação;
- comparação sincronizada;
- persistência;
- recuperação de progresso.

## E2E

- navegar pela trilha;
- concluir desafio;
- revisar flashcards;
- desbloquear conquista;
- usar teclado;
- usar reduced motion;
- trocar tema;
- abrir system design.

## Acessibilidade

- axe-core;
- foco;
- teclado;
- `aria-live`;
- labels;
- contraste;
- reduced motion.

---

# 29. Performance

Metas:

- evitar renders desnecessários;
- manter animações em `transform` e `opacity`;
- usar SVG/DOM para cenas pequenas;
- considerar canvas apenas para grafos grandes;
- virtualizar listas longas;
- lazy loading;
- dividir bundles;
- conteúdo sob demanda;
- Web Workers;
- medir bundle, FPS e tempo de geração de trace.

---

# 30. Roadmap

## Fase 0 — Auditoria

- analisar;
- executar;
- documentar;
- corrigir erros;
- criar matriz de paridade.

## Fase 1 — Fundação técnica

- extrair design tokens;
- extrair motion tokens;
- criar shell;
- criar router;
- criar Trace Engine;
- criar timeline global;
- criar storage;
- criar testes básicos.

## Fase 2 — Primeira migração vertical

Migrar uma lição completa preservando paridade:

- visual;
- motion;
- timeline;
- abstrato/prático;
- quiz;
- métricas;
- acessibilidade;
- persistência.

## Fase 3 — Consolidar estruturas

- migrar lições existentes;
- corrigir inconsistências;
- adicionar Union-Find;
- adicionar LRU Cache;
- adicionar B+ Tree.

## Fase 4 — Primeira trilha de programação

```text
Variáveis
→ expressão booleana
→ if/else
→ loop
→ função
→ call stack
```

## Fase 5 — Algoritmos

- busca linear;
- busca binária;
- insertion sort;
- merge sort;
- quicksort;
- BFS;
- DFS;
- Dijkstra.

## Fase 6 — Memória

- stack;
- heap;
- referências;
- stack frames;
- recursão;
- garbage collection introdutório.

## Fase 7 — Flashcards

- revisão espaçada;
- cards automáticos;
- cards baseados em erros;
- domínio por conceito.

## Fase 8 — System design

- cenário de pedidos e notificações;
- falhas;
- retry;
- idempotência;
- DLQ.

## Fase 9 — Gamificação e mapa

- conquistas;
- trilhas;
- dependências;
- progresso;
- recomendações.

---

# 31. Primeira entrega solicitada

Após a auditoria, implementar uma vertical slice funcional que prove a nova arquitetura.

Ela deve conter:

1. uma lição de estrutura de dados já existente;
2. uma lição de algoritmo;
3. uma lição de lógica;
4. uma visualização de memória;
5. uma interação de controle de fluxo;
6. três flashcards;
7. uma animação curta de system design;
8. uma conquista;
9. persistência local;
10. testes.

Vertical sugerida:

```text
Array
→ busca linear
→ condição if
→ loop for
→ variável na memória
→ flashcards
→ requisição cliente/API/banco
```

Não criar somente placeholders.

A entrega deve demonstrar que todos os módulos compartilham:

- identidade visual;
- Trace Engine;
- timeline;
- motion;
- estado;
- conteúdo orientado a dados;
- acessibilidade;
- persistência.

---

# 32. Critérios de aceite

A entrega só pode ser considerada concluída quando:

- [ ] o projeto compila;
- [ ] não há erros relevantes no console;
- [ ] o protótipo original continua acessível;
- [ ] a migração foi incremental;
- [ ] a matriz de paridade foi atualizada;
- [ ] as animações não estão travadas;
- [ ] elementos persistem entre passos;
- [ ] a timeline é fonte única da verdade;
- [ ] alternar representações não perde o passo;
- [ ] reduced motion funciona;
- [ ] teclado funciona;
- [ ] leitores de tela recebem atualizações;
- [ ] conteúdo não está hardcoded em componentes;
- [ ] exemplos possuem classificação de honestidade;
- [ ] complexidades informam contexto;
- [ ] testes passam;
- [ ] progresso é persistido;
- [ ] a estética permanece uniforme;
- [ ] a arquitetura está documentada;
- [ ] nenhuma funcionalidade existente foi removida sem substituta equivalente.

---

# 33. Forma de trabalho

Durante a execução:

1. apresente o estado encontrado;
2. proponha um plano incremental;
3. implemente em pequenas fatias;
4. teste após cada etapa;
5. compare com o protótipo original;
6. atualize a matriz de paridade;
7. informe arquivos alterados;
8. registre decisões;
9. informe limitações;
10. não esconda erros;
11. não declare algo pronto sem verificar;
12. não substitua implementação por documentação.

Evitar commits que:

- removam todo o HTML;
- criem dezenas de páginas vazias;
- substituam todos os estilos;
- alterem arquitetura, design e conteúdo ao mesmo tempo;
- deixem o projeto sem uma versão funcional.

Após cada etapa:

1. compilar;
2. executar testes;
3. verificar console;
4. comparar visualmente;
5. atualizar documentação;
6. registrar pendências.

---

# 34. Objetivo final

O objetivo não é criar apenas uma demonstração bonita.

O objetivo é evoluir o Trace existente para uma plataforma tecnicamente sustentável que ensine programação, lógica, algoritmos, estruturas de dados, memória e arquitetura de sistemas mostrando, passo a passo, como tudo funciona por baixo dos panos.

O produto atual deve continuar reconhecível durante toda a evolução.

A prioridade é preservar o que já foi validado e expandir sua capacidade pedagógica sem destruir sua identidade.
