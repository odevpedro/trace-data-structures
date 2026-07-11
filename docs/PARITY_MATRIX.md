# Matriz de paridade

## Estado e regras

Checkpoint: 11 de julho de 2026 — atualizado após integração de 18 lições restantes do protótipo e 3 presets de comparação ao learning path.

Legenda:

- Sim: capacidade presente.
- Parcial: existe implementação útil, mas há diferenças ou gates pendentes.
- Não: ainda não existe na aplicação modular.
- Exato: o artefato preservado é idêntico no checkpoint.
- Nova: expansão que não existia no protótipo e não substitui uma feature original.
- Pendente manual: ainda precisa de comparação visual ou acessível humana.

Uma linha Parcial não é considerada migrada. Testes de uma parte não promovem automaticamente a feature inteira.

Evidência automatizada deste checkpoint:

- npm test: 6 arquivos e 16 testes passaram;
- npm run build passou e incluiu aplicação e protótipo;
- npm run test:e2e: 8 de 8 cenários passaram;
- persistência/reload/tema, teclado/reduced motion/conquista, flashcards/system design, axe, protótipo executável e viewport móvel sem overflow foram exercitados;
- os fluxos instrumentados não registraram erros de console;
- screenshots desktop de landing, player e protótipo mostraram linguagem visual coerente.

Continuam pendentes paridade pixel-perfect, regressão visual automatizada, auditoria manual completa de acessibilidade e equivalência detalhada de motion.

## 1. Integridade do protótipo

| Item | Original | Nova estrutura | Paridade | Evidência | Estado |
|---|---|---|---|---|---|
| HTML canônico | trace_complete_market_v2.html | Mantido na raiz | Exato | Arquivo não alterado pela migração | Preservado |
| HTML servido | Mesmo conteúdo | prototype/trace_complete_market_v2.html | Exato no checkpoint | SHA-256 igual: 7fe379a0d5e8876860beeee2fcdf0931c20e8efc0a26d1cb0ef699673b5fd7ac | Preservado |
| Acesso pela nova UI | Não aplicável | Links na landing e no rodapé | Sim | Teste App mantém link /prototype/trace_complete_market_v2.html | Testado em componente |
| Build independente | HTML standalone | Segunda entrada do Vite | Sim | Build aprovado com aplicação e protótipo | Verificado |

## 2. Capacidades transversais

| Feature | Original | Aplicação modular | Paridade visual | Paridade funcional | Testes/evidência | Estado |
|---|---|---|---|---|---|---|
| Identidade adulta/minimalista | Sim | Sim | Parcial | Sim | Screenshots desktop coerentes; pixel-perfect automatizado pendente | Em migração |
| Tokens claro/escuro | Sim | Sim | Parcial | Sim na vertical | Tema escuro e persistência após reload aprovados no E2E | Em migração |
| Landing pública | Demonstração/aprender no mesmo HTML | Landing separada | Parcial | Nova arquitetura | Teste de render e link | Evolução, não substituição |
| Catálogo de lições | 20 | 25 | Sim | Parcial | learningPath contém 25 IDs entre originais e expansões | Em migração |
| Player genérico | Scene genérica no HTML | LessonPlayer + TraceCanvas | Parcial | Sim para as 25 lições | Testes de player e reducer | Em migração |
| Timeline única | Sim | Sim | Parcial | Sim | Troca de modo preserva passo | Testado |
| Anterior/próximo/play/seek | Sim | Sim | Parcial | Sim | Componentes e jornadas E2E aprovados | Em migração |
| Controle de velocidade | Fixo em 1250 ms | 0,75×, 1× e 1,5× | Nova | Sim | Persistido; teste dedicado falta | Extensão |
| Abstrato/prático | Sim | Sim | Parcial | Sim na vertical | Teste troca modo sem perder passo | Em migração |
| Memória | Não como modo geral | Sim em cinco lições | Nova | Sim na vertical | Reducer e player cobertos parcialmente | Extensão |
| Código sincronizado | Não | Sim | Nova | Sim, somente leitura | Inspeção de implementação; teste dedicado falta | Extensão |
| Elementos persistentes entre passos | Sim | Sim em cenas visuais | Parcial | Sim | Teste reduceTrace preserva nós; keys estáveis | Testado parcialmente |
| Métricas | Operações, tocados e complexidade | Mesmas métricas + contexto | Parcial | Sim na vertical | Conteúdo inspecionado; teste dedicado falta | Em migração |
| Quiz por lição e modo | Sim em 20 lições | Um desafio por lição | Parcial | Parcial | ChallengePanel e conquista testados | Em migração |
| Drawer Ver limitação | Sim | Sim | Parcial | Sim | DrawerComponent com focus trap, escape e barras de comparação | Em migração |
| Comparações sincronizadas | Cinco presets | Cinco presets (insert-middle, array-queue, list-hash, bfs-dijkstra, bfs-dfs) | Parcial | Parcial | ComparePage com TraceCanvas duplo e timeline compartilhada | Em migração |
| Progresso de lições | Set em memória por visita/acerto | Início, passo, tentativa e conclusão persistidos | Nova visualmente | Superior para a vertical | Store, repository e reload E2E aprovados | Extensão parcial |
| Tema persistido | localStorage | IndexedDB/fallback no snapshot | Parcial | Sim | Persistência e reload/tema aprovados em E2E | Em migração |
| Reduced motion | Comic strip via media query | Preferência sistema/reduzido/completo + lista textual | Parcial | Sim na vertical | E2E aprovado; inspeção manual detalhada pendente | Em migração |
| Teclado | Setas, espaço, 1/2 e Escape no drawer | Setas, espaço e 1–4 no player | Parcial | Parcial sem drawer | Teste de componente e E2E aprovados | Em migração |
| aria-live | Sim | Sim | Não aplicável | Sim na vertical | Teste verifica descrição atualizada | Testado |
| Foco de dialog/drawer | Sim com restauração parcial | Drawer com focus trap | Parcial | Sim | Drawer prende foco, aceita Escape e restaura ao fechar | Em migração |
| Responsividade | Sim | Sim por CSS | Parcial | Sim no viewport exercitado | E2E móvel sem overflow; inspeção visual multi-device pendente | Em migração |
| Honestidade dos exemplos | Classificação em 20 lições | Tipo e nota em seis lições | Não aplicável | Sim na vertical | Definições inspecionadas | Implementado na vertical |

## 3. Lições do protótipo

| Lição original | Presente no original | Correspondente modular | Visual | Funcional | Testes | Estado |
|---|---|---|---|---|---|---|
| Array | Sim | array | Parcial | Parcial | Reducer, player, persistência e E2E aprovados | Em migração |
| Lista encadeada | Sim | linked-list | Parcial | Parcial | Reducer, player e cinco passos com relink de ponteiros | Em migração |
| Lista duplamente encadeada | Sim | doubly-linked-list | Parcial | Parcial | Cinco passos com quatro relinks e navegação bidirecional | Em migração |
| Pilha | Sim | stack | Parcial | Parcial | Seis passos push/pop com topo LIFO | Em migração |
| Fila | Sim | queue | Parcial | Parcial | Cinco passos enqueue/dequeue com front/rear | Em migração |
| Deque | Sim | deque | Parcial | Parcial | Cinco passos pushFront/pushBack/popFront | Em migração |
| Tabela hash | Sim | hash | Parcial | Parcial | Hash, rota, colisão e encadeamento em cinco passos | Em migração |
| Set | Sim | set | Parcial | Parcial | Cinco passos com rejeição de duplicata | Em migração |
| Árvore binária de busca | Sim | bst | Parcial | Parcial | Inserção por comparação em cinco passos | Em migração |
| Árvore balanceada | Sim | balanced | Parcial | Parcial | Rotação AVL em cinco passos com fator | Em migração |
| Heap / fila de prioridade | Sim | heap | Parcial | Parcial | Bubble-up em max-heap com oito passos | Em migração |
| Trie | Sim | trie | Parcial | Parcial | Inserção por prefixo com cinco passos | Em migração |
| Grafo | Sim | graph | Parcial | Parcial | BFS com expansão em camadas em cinco passos | Em migração |
| DFS | Sim | dfs | Parcial | Parcial | Seis passos com descida, backtrack e descoberta | Em migração |
| Dijkstra | Sim | dijkstra | Parcial | Parcial | Relaxamento com pesos em seis passos | Em migração |
| Union-Find | Sim | union-find | Parcial | Parcial | Find/union/compressão em cinco passos | Em migração |
| B+ Tree | Sim | btree | Parcial | Parcial | Split de página em cinco passos | Em migração |
| LRU Cache | Sim | lru | Parcial | Parcial | Hit/promote/evict em cinco passos | Em migração |
| Buffer circular | Sim | circular | Parcial | Parcial | Wrap-around com sobrescrita em cinco passos | Em migração |
| Bloom Filter | Sim | bloom | Parcial | Parcial | Falso positivo com múltiplos hashes em seis passos | Em migração |
| Bellman-Ford | Sim | bellman-ford | Parcial | Parcial | Relaxamento com detecção de ciclo negativo em seis passos | Em migração |

Por que todas as lições continuam Parcial:

- cenas e operações centrais foram portadas para as 18 novas lições;
- timeline, quatro representações, métricas, desafio e drawer funcionam na nova arquitetura;
- a linguagem visual foi considerada coerente na comparação manual desktop, mas não há aceite pixel-perfect, regressão automatizada ou paridade detalhada de motion;
- nenhuma lição foi comparada passo a passo com os quizzes e interações originais;
- as novas comparações e drawers ainda precisam de revisão visual contra o protótipo.

## 4. Comparações do protótipo

| Cenário | Original | Modular | Timeline sincronizada | Métricas | Testes | Estado |
|---|---|---|---|---|---|---|
| Inserção no meio: Array × Lista | Sim | insert-middle | Sim | Parcial | ComparePage com timeline compartilhada, duas cenas, métricas e cartões de resumo | Em migração |
| Remoção no início: Array × Fila | Sim | array-queue | Sim | Parcial | ComparePage com timeline compartilhada | Em migração |
| Busca por chave: Lista × Hash | Sim | list-hash | Sim | Parcial | ComparePage com timeline compartilhada | Em migração |
| Menos paradas × menor custo: Grafo/BFS × Dijkstra | Sim | bfs-dijkstra | Sim | Parcial | ComparePage com timeline compartilhada | Em migração |
| Estratégia de busca: BFS × DFS | Sim | bfs-dfs | Sim | Parcial | ComparePage com timeline compartilhada | Em migração |

## 5. Expansões da vertical

Estas linhas comprovam a primeira entrega, mas não contam como paridade das 19 lições originais ainda ausentes.

| Feature nova | Implementação | Conteúdo real | Persistência | Testes/evidência | Estado |
|---|---|---|---|---|---|
| Busca linear | linear-search | Cinco passos, quatro modos, métricas e desafio | Passo/modo/tentativa | Reducer, teclado e axe E2E aprovados | Implementada na slice |
| Condição if | condition-if | Entrada de idade, previsão, branch e retorno | Entrada/passo/modo/tentativa | Branch, input, conquista e E2E aprovados | Implementada na slice |
| Loop for | for-loop | Limite 1–5, condição, corpo, soma e retorno | Entrada/passo/modo/tentativa | Trace dinâmico inspecionado; teste dedicado falta | Implementada na slice |
| Memória | memory-reference | Call, frame, referência, heap, mutação e retorno | Passo/modo/tentativa | Eventos do reducer; teste E2E dedicado falta | Implementada na slice |
| System design curto | request-flow | Cliente, API, banco, payload, resposta e latência | Passo/modo/tentativa | E2E aprovado até 126 ms | Implementada na slice |
| Três flashcards | FlashcardsPanel | Conceito, complexidade e comparação | box, dueAt e reviews | Componente e scheduler passam | Implementada na slice |
| Conquista | first-trace | Desbloqueada por resposta correta | achievementIds | LessonPlayer e E2E aprovados | Implementada na slice |
| Lista encadeada | linked-list | Cinco passos, quatro nós linked, quatro arestas, relink de ponteiros e desafio | Passo/modo/tentativa | Reducer e player testados; E2E pendente | Implementada na slice |
| Comparação Array × Lista | insert-middle | Duas cenas sincronizadas, métricas e cartões de resumo | Passo compartilhado | ComparePage com timeline única | Implementada na slice |
| Drawer Ver limitação | Drawer | Barras de comparação, focus trap, Escape e restauração de foco | Estático por lição | DrawerComponent testado manualmente | Implementada na slice |
| Persistência local | ProgressRepository | Snapshot version 1 | IndexedDB + fallback localStorage | Teste de repository e hidratação passam | Implementada na slice |
| Lista duplamente encadeada | doubly-linked-list | Cinco passos com relink bidirecional, 4 arestas visíveis | Passo/modo/tentativa | Conteúdo definido em linear.ts | Migrada para o aggregator |
| Pilha | stack | Seis passos push/pop com topo LIFO | Passo/modo/tentativa | Conteúdo definido em linear.ts | Migrada para o aggregator |
| Fila | queue | Cinco passos enqueue/dequeue com front/rear | Passo/modo/tentativa | Conteúdo definido em linear.ts | Migrada para o aggregator |
| Deque | deque | Cinco passos pushFront/pushBack/popFront | Passo/modo/tentativa | Conteúdo definido em linear.ts | Migrada para o aggregator |
| Tabela hash | hash | Hash, rota, colisão e encadeamento em 5 passos | Passo/modo/tentativa | Conteúdo definido em indexed.ts | Migrada para o aggregator |
| Set | set | Rejeição de duplicata em 5 passos | Passo/modo/tentativa | Conteúdo definido em indexed.ts | Migrada para o aggregator |
| BST | bst | Inserção por comparação em 5 passos | Passo/modo/tentativa | Conteúdo definido em hierarchical.ts | Migrada para o aggregator |
| Árvore balanceada (AVL) | balanced | Rotação AVL em 5 passos com fator | Passo/modo/tentativa | Conteúdo definido em hierarchical.ts | Migrada para o aggregator |
| Heap | heap | Bubble-up em max-heap com 8 passos | Passo/modo/tentativa | Conteúdo definido em hierarchical.ts | Migrada para o aggregator |
| Trie | trie | Inserção por prefixo em 5 passos | Passo/modo/tentativa | Conteúdo definido em hierarchical.ts | Migrada para o aggregator |
| BFS / Grafo | graph | BFS com expansão em camadas em 5 passos | Passo/modo/tentativa | Conteúdo definido em graphs.ts | Migrada para o aggregator |
| DFS | dfs | Descida, backtrack e descoberta em 6 passos | Passo/modo/tentativa | Conteúdo definido em graphs.ts | Migrada para o aggregator |
| Dijkstra | dijkstra | Relaxamento com pesos em 6 passos | Passo/modo/tentativa | Conteúdo definido em graphs.ts | Migrada para o aggregator |
| Union-Find | union-find | Find/union/compressão em 5 passos | Passo/modo/tentativa | Conteúdo definido em graphs.ts | Migrada para o aggregator |
| B+ Tree | btree | Split de página em 5 passos | Passo/modo/tentativa | Conteúdo definido em systems.ts | Migrada para o aggregator |
| LRU Cache | lru | Hit/promote/evict em 5 passos | Passo/modo/tentativa | Conteúdo definido em systems.ts | Migrada para o aggregator |
| Buffer circular | circular | Wrap-around com sobrescrita em 5 passos | Passo/modo/tentativa | Conteúdo definido em systems.ts | Migrada para o aggregator |
| Bloom Filter | bloom | Falso positivo com múltiplos hashes em 6 passos | Passo/modo/tentativa | Conteúdo definido em systems.ts | Migrada para o aggregator |
| Comparação Array × Fila | array-queue | Remoção no início | Passo compartilhado | ComparePage com timeline única | Implementada na slice |
| Comparação Lista × Hash | list-hash | Busca por chave | Passo compartilhado | ComparePage com timeline única | Implementada na slice |
| Comparação BFS × Dijkstra | bfs-dijkstra | Menos paradas × menor custo | Passo compartilhado | ComparePage com timeline única | Implementada na slice |

## 6. Testes existentes e lacunas

| Camada | Cobertura presente | Resultado neste checkpoint | Lacuna |
|---|---|---|---|
| Unidade | reducer, branch, scheduleReview | Passou | Eventos restantes e traces dinâmicos |
| Storage | save/load IndexedDB | Passou | fallback, corrupção, quota e migração |
| Componentes | player, input, teclado, conquista, flashcards, App | Passou | play automático, velocidade, tema e reduced motion unitário |
| Build | aplicação e protótipo | Passou | Reexecutar a cada fatia |
| E2E | reload/tema, reduced motion, desafio, cards, system design, axe, protótipo e mobile | 8 de 8 passaram; console instrumentado sem erros | Ampliar junto ao catálogo |
| Visual | Comparação manual por screenshots desktop | Linguagem visual coerente | Pixel-perfect, temas/estados e regressão automatizada |
| Manual a11y | Nenhum relatório atual | Não verificado | Leitor de tela, zoom, contraste, touch e foco |

## 7. Próxima atualização obrigatória

Atualizar esta matriz quando qualquer uma destas ações ocorrer:

- uma lição original entrar na aplicação modular;
- um drawer ou comparador for migrado;
- uma diferença visual for aceita ou corrigida;
- um novo gate de teste for executado;
- um recurso original for removido, substituído ou alterado;
- o hash/artefato do protótipo mudar por decisão explícita.

Nenhuma linha original deve mudar para Migrada sem evidência visual, funcional, acessível e automatizada proporcional ao risco.
