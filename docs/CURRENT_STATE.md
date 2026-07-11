# Trace — Estado atual

Última auditoria: 11 de julho de 2026

Este documento descreve o que existe no workspace nesta data. Ele separa evidência de código, verificações executadas e comportamentos que ainda dependem de validação em navegador.

## Níveis de evidência

- Inspecionado: confirmado diretamente nos arquivos-fonte.
- Executado: confirmado por um comando nesta auditoria.
- Coberto: existe um teste automatizado para o comportamento, mas isso não implica que toda a suíte correspondente foi executada.
- Não verificado: a implementação existe ou foi planejada, mas o comportamento não foi confirmado nesta auditoria.

## Resumo executivo

O workspace contém duas gerações do Trace:

1. O protótipo original, preservado como um HTML autocontido.
2. Uma vertical slice incremental em React, TypeScript e Vite.

A vertical slice prova uma arquitetura comum para 25 lições, quatro representações, uma timeline, persistência local, três flashcards, uma conquista, um módulo de comparação sincronizada (4 presets) e um drawer de limitação. Todas as 20 lições do protótipo e 3 das 4 comparações foram migradas; o conteúdo restante (Bellman-Ford, comparação BFS×DFS, sistema com filas/retry) está no backlog.

O protótipo original continua presente em:

- trace_complete_market_v2.html
- prototype/trace_complete_market_v2.html

As duas cópias eram byte a byte idênticas no momento desta auditoria, conforme comparação com cmp.

## Estrutura relevante

### Aplicação modular

- index.html: entrada Vite.
- src/main.tsx: montagem React.
- src/app/App.tsx: shell, rotas, navegação, tema e preferência de movimento.
- src/app/PersistenceBridge.tsx: hidratação e salvamento do progresso.
- src/content/lessons.ts: conteúdo das 7 lições originais e geração de traces.
- src/content/index.ts: agregador que combina as 25 lições (7 originais + 18 novas).
- src/content/flashcards.ts: três flashcards.
- src/core/trace-engine/: tipos, eventos e redução cumulativa da timeline.
- src/core/spaced-repetition/: agenda de revisão.
- src/features/lesson-player/: player, canvas, previsão e desafio.
- src/features/timeline/: controles compartilhados.
- src/features/flashcards/: sessão de revisão.
- src/features/progress/: aviso de conquista.
- src/storage/: repositório de progresso.
- src/store/: estado global Zustand.
- src/styles.css: tokens, componentes, temas, responsividade e motion.
- e2e/trace.spec.ts: cenários Playwright e axe-core.

### Legado preservado

- trace_complete_market_v2.html: fonte original na raiz.
- prototype/trace_complete_market_v2.html: entrada preservada no build Vite.

### Toolchain

- package.json e package-lock.json.
- vite.config.ts com entradas para a aplicação e para o protótipo.
- tsconfig.app.json e tsconfig.node.json.
- playwright.config.ts.

## Estado do Git

A pasta .git está vazia neste ambiente. Comandos como git status e git log retornam “not a git repository”. Portanto:

- não foi possível identificar branch, commit-base ou alterações não commitadas;
- não há histórico disponível para atribuir mudanças;
- este documento descreve apenas o estado observado no filesystem.

## Stack atual

| Camada | Implementação observada |
|---|---|
| Interface | React 19 e React DOM |
| Linguagem | TypeScript |
| Build e desenvolvimento | Vite |
| Rotas | React Router |
| Estado | Zustand |
| Persistência | IndexedDB com fallback resiliente para localStorage |
| Testes unitários/componentes | Vitest, Testing Library e jsdom |
| E2E | Playwright |
| Acessibilidade automatizada | axe-core integrado aos testes Playwright |
| Estilos | CSS global orientado a custom properties |
| Backend | inexistente; não é necessário para esta vertical |

## Auditoria do protótipo original

### Forma

O protótipo é um único documento HTML de aproximadamente 214 KB, com:

- CSS inline;
- JavaScript vanilla inline;
- conteúdo em um objeto APP_DATA;
- nenhuma dependência externa;
- nenhuma imagem, folha de estilo ou script externo;
- cenas construídas com elementos DOM e linhas CSS.

Não há comando de build ou suíte de testes próprios do protótipo. Ele pode ser aberto diretamente ou servido como arquivo estático.

### Conteúdo observado

APP_DATA contém:

- 20 lições na ordem principal;
- 24 traces, incluindo variações usadas nas comparações;
- 4 cenários de comparação.

Lições presentes:

- Array;
- lista encadeada;
- lista duplamente encadeada;
- pilha;
- fila;
- deque;
- tabela hash;
- Set;
- árvore binária de busca;
- árvore balanceada;
- heap/fila de prioridade;
- trie;
- grafo;
- DFS;
- Dijkstra;
- Union-Find;
- B+ Tree;
- LRU Cache;
- buffer circular;
- Bloom Filter.

Comparações presentes:

- Array versus lista encadeada para inserção intermediária;
- Array versus fila para remoção inicial;
- lista versus hash para busca por chave;
- BFS versus Dijkstra para rotas.

### Interações observadas no código

- navegação entre Aprender e Comparar;
- alternância entre representação abstrata e prática;
- controles anterior, reproduzir, próximo e range da timeline;
- métricas de operações, elementos tocados e complexidade;
- quizzes por representação;
- drawer de limitação e trade-off;
- tema claro/escuro;
- atalhos de teclado;
- layout responsivo;
- aria-live para a lição;
- tratamento de prefers-reduced-motion com quadros estáticos no modo Aprender.

### Arquitetura interna

A classe Scene cria os nós e arestas uma vez e atualiza posição, opacidade, ênfase e rótulos. Os frames são declarativos, mas todo o conteúdo, renderizador, estado e UI vivem no mesmo HTML.

O estado da interface usa um objeto congelado e timers locais. O progresso visitado usa Set em memória.

### Persistência

Somente o tema é salvo, na chave trace-complete-theme do localStorage. Lição atual, passo, respostas, progresso e comparações não sobrevivem ao recarregamento.

### Verificações executadas sobre o protótipo

- A sintaxe do JavaScript inline foi analisada com vm.Script: passou.
- Os 72 atributos id eram únicos.
- As 72 referências do helper de busca por id apontavam para elementos existentes.
- As referências entre lições, traces e presets de comparação passaram por uma verificação estrutural.

### Validação final do protótipo

O protótipo preservado foi carregado com Chrome headless por meio do build de produção. O cenário E2E confirmou:

- renderização do título principal;
- avanço da timeline pelo botão Próximo passo;
- atualização para Passo 1 / 4;
- ausência de console.error e pageerror no cenário instrumentado.

Também houve comparação visual manual por screenshots em viewport de 1440 px entre protótipo, landing e player. A identidade foi considerada coerente em paleta, tipografia, densidade, bordas, grid e linguagem de cena. Essa revisão não constitui paridade pixel-perfect nem cobre todas as lições, temas, breakpoints, drawers e comparações do protótipo.

### Defeitos e limitações encontrados no protótipo

Estes itens já existiam no HTML legado. O smoke test básico não os promove a aprovados:

- em larguras de até 720 px, a navegação superior some; depois de entrar em Comparar pelo botão de uma lição não há controle visível para voltar a Aprender;
- o botão Comparar só mapeia Array, Lista, Fila e Hash. Nas outras 16 lições ele pode abrir o último cenário ou o padrão Array × Lista, sem relação com o conteúdo atual;
- BFS possui cinco frames e Dijkstra seis no preset de rotas. O renderer repete o último frame curto, portanto a comparação não representa eventos equivalentes em todos os passos;
- no estado final auditado do LRU, o texto indica `D → B → A`, mas a aresta `B → A` está oculta nos dados do frame;
- abaixo de 1050 px, a barra lateral direita é removida com `display: none`, eliminando problema, escolha, custo e conceito-chave sem alternativa móvel;
- o comparador não possui anúncio `aria-live` ou storyboard equivalente em reduced motion, e seus controles de timeline têm nomes acessíveis incompletos;
- o drawer restaura foco e aceita Escape, mas não prende foco nem torna o conteúdo de fundo inerte;
- `lessons` e `traces` duplicam integralmente as 20 definições no objeto embutido, aumentando tamanho e risco de divergência;
- a cena de comparação é criada enquanto sua view está oculta e pode receber escala negativa transitória antes de o `ResizeObserver` recalcular.

Esses defeitos estão registrados no backlog. Corrigi-los ou aceitá-los exige uma decisão explícita e nova evidência; a cópia canônica não foi modificada silenciosamente.

## Auditoria da vertical slice

### Rotas implementadas

| Rota | Estado observado |
|---|---|---|
| / | landing page |
| /app | redireciona para /app/learn |
| /app/learn | jornada com 25 lições |
| /app/lesson/:lessonId | player genérico |
| /app/compare/:comparisonId | comparação sincronizada entre duas lições |
| /app/review | três flashcards |
| demais rotas | redirecionam para a landing |
| /prototype/trace_complete_market_v2.html | protótipo preservado |

Não existem ainda rotas próprias para playground, mapa de conhecimento, progresso, configurações ou um módulo amplo de system design.

### Conteúdo entregue

| Lição | Domínio | Passos | Representações |
|---|---|---|---:|---:|
| Array | estrutura de dados | 5 | abstrata, prática, memória e código |
| Lista encadeada | estrutura de dados | 5 | abstrata, prática, memória e código |
| Busca linear | algoritmo | 5 | abstrata, prática, memória e código |
| Condição if | lógica/controle | 5, dinâmicos | abstrata, prática, memória e código |
| Loop for | controle de fluxo | 2n + 2, n 1–5 | abstrata, prática, memória e código |
| Valor e referência | memória | 5 | abstrata, prática, memória e código |
| Cliente, API e banco | system design | 6 | abstrata, prática e código |
| Lista duplamente encadeada | estrutura de dados | 5 | abstrata, prática, memória e código |
| Pilha | estrutura de dados | 6 | abstrata, prática, memória e código |
| Fila | estrutura de dados | 5 | abstrata, prática, memória e código |
| Deque | estrutura de dados | 5 | abstrata, prática, memória e código |
| Tabela hash | estrutura de dados | 5 | abstrata, prática, memória e código |
| Set | estrutura de dados | 5 | abstrata, prática, memória e código |
| BST | estrutura de dados | 5 | abstrata, prática, memória e código |
| Árvore balanceada (AVL) | estrutura de dados | 5 | abstrata, prática, memória e código |
| Heap | estrutura de dados | 8 | abstrata, prática, memória e código |
| Trie | estrutura de dados | 5 | abstrata, prática, memória e código |
| BFS / Grafo | algoritmo | 5 | abstrata, prática, memória e código |
| DFS | algoritmo | 6 | abstrata, prática, memória e código |
| Dijkstra | algoritmo | 6 | abstrata, prática, memória e código |
| Union-Find | algoritmo | 5 | abstrata, prática, memória e código |
| B+ Tree | estrutura de dados | 5 | abstrata, prática, memória e código |
| LRU Cache | estrutura de dados | 5 | abstrata, prática, memória e código |
| Buffer circular | estrutura de dados | 5 | abstrata, prática, memória e código |
| Bloom Filter | estrutura de dados | 6 | abstrata, prática, memória e código |

As lições são objetos LessonDefinition. Texto, exemplos, métricas, desafios, cenas e traces não ficam hardcoded nos componentes do player.

A previsão do loop foi corrigida para a expressão geral n × (n − 1) / 2, coerente com a soma dos inteiros de zero até n − 1 para qualquer limite permitido.

Cada lição informa:

- objetivos e pré-requisitos;
- classificação e nota do exemplo prático;
- problema, modelo mental, custo, quando usar e alternativa;
- métricas contextualizadas em cada passo;
- desafio de compreensão.

### Trace Engine

O motor atual:

- define eventos de domínio tipados;
- parte de uma SceneDefinition;
- reduz todos os eventos do passo zero até o passo solicitado;
- conserva mutações anteriores ao navegar na timeline;
- produz um ComputedScene independente do renderer;
- usa o mesmo stepIndex para as representações abstrata, prática, memória e código.

Eventos implementados incluem comparação, movimento, inserção, remoção, ligação, memória, branch, função, request/response, cache, retry, falha e recuperação. A presença do tipo e do case no reducer não significa que cada evento possua uma lição ou teste específico.

### Player e renderização

LessonPlayer compartilha:

- cabeçalho e honestidade do exemplo;
- entradas e previsão, quando aplicáveis;
- seletor de representação;
- TraceCanvas;
- timeline;
- velocidade;
- narração e complexidade;
- métricas;
- camadas explicativas;
- desafio;
- anúncio aria-live.

TraceCanvas usa DOM para cenas pequenas. Nós e arestas são identificados por chaves estáveis e recebem transform, opacity e estados semânticos. A visualização de código destaca a linha vinculada ao mesmo passo.

### Estado e persistência

O snapshot versão 1 armazena:

- última lição;
- último passo por lição;
- representação por lição;
- entradas manipuláveis;
- lições iniciadas e concluídas;
- tentativas dos desafios;
- agenda dos flashcards;
- conquistas;
- tema;
- preferência de movimento;
- velocidade.

IndexedDbProgressRepository usa o banco trace-learning, store progress e chave current. ResilientProgressRepository recorre ao localStorage na chave trace-progress-v1 quando IndexedDB falha.

PersistenceBridge hidrata antes de exibir o player e salva alterações com debounce de 120 ms.

### Revisão e conquista

Há três flashcards:

- custo de inserção em array;
- condição de parada da busca linear;
- referência versus mutação.

scheduleReview registra caixa, vencimento, última revisão e número de revisões. A interface ainda percorre os três cards em sequência; ela não filtra uma fila por dueAt. Portanto, existe agendamento persistido, mas não um fluxo completo de cards vencidos.

A conquista Primeiro Trace é desbloqueada no primeiro desafio respondido corretamente. O gatilho representa conclusão de compreensão, e não apenas avanço da timeline.

## Acessibilidade observada na vertical

Implementações encontradas:

- skip link;
- foco visível global;
- navegação e controles com nomes acessíveis;
- aria-pressed em toggles;
- aria-live por passo;
- descrição oculta da cena;
- atalhos ArrowLeft, ArrowRight, Espaço e teclas 1–4;
- preferência de movimento: sistema, reduzido ou completo;
- lista textual dos passos quando reduced motion está ativo;
- feedback de desafio e previsão com role=status.

AppShell aplica data-motion no elemento html. reduced desliga globalmente animações e transições não essenciais; full sobrepõe a media query do sistema. O autoplay conserva o intervalo de 1250 ms dividido pela velocidade nos modos completo e reduzido.

O cenário Playwright com axe-core foi executado na landing e no player de busca linear após a correção de contraste do token --faint. Axe reportou zero violações nessas duas telas auditadas. Esse resultado automatizado não substitui leitor de tela, zoom, reflow e revisão humana.

## Verificações executadas nesta auditoria

### Passaram

- npm test
  - 6 arquivos de teste;
  - 13 testes aprovados;
  - duração reportada pelo Vitest: 1,97 s.
- npx tsc -p tsconfig.app.json --pretty false
  - typecheck da aplicação aprovado.
- npx tsc -p tsconfig.node.json --pretty false com tsBuildInfoFile em /tmp
  - typecheck das configurações aprovado.
- cmp entre a cópia original e prototype/trace_complete_market_v2.html
  - arquivos idênticos.
- npm run build
  - TypeScript e Vite concluíram sem erro;
  - dist/index.html foi gerado;
  - dist/prototype/trace_complete_market_v2.html foi gerado;
  - assets CSS e JavaScript da aplicação foram emitidos em dist/assets.
- npm run test:e2e
  - 6 de 6 cenários Playwright aprovados;
  - console sem erros nos cenários instrumentados.
- Chrome headless
  - protótipo preservado carregou e respondeu ao avanço da timeline.
- comparação visual manual
  - screenshots em 1440 px de landing, player e protótipo apresentaram identidade coerente;
  - não foi atribuído aceite pixel-perfect.

### Cobertura automatizada executada

Os testes unitários e de componente cobrem:

- acumulação de eventos e persistência de elementos no reducer;
- branch verdadeiro;
- troca de representação sem perda de passo;
- teclado e anúncio do passo;
- alteração de entrada e reinício do trace;
- conquista por desafio correto;
- virada e agendamento de flashcard;
- round-trip do IndexedDB;
- intervalos de revisão;
- link para o protótipo;
- hidratação de passo e representação.

Os seis cenários E2E executados cobrem:

1. recarga preservando passo, representação e tema;
2. teclado, reduced motion, desafio e conquista;
3. flashcards e o fluxo de system design;
4. axe na landing e no player;
5. runtime do protótipo preservado;
6. player em viewport móvel sem overflow do documento.

### Validações ainda pendentes

- leitor de tela real;
- zoom e reflow em múltiplos níveis;
- navegação touch em dispositivos reais;
- regressão visual automatizada;
- comparação visual de todas as lições, temas, drawers e cenários;
- análise de bundle, FPS e performance.

## Matriz resumida de estado

| Capacidade | Protótipo | Vertical slice | Observação |
|---|---|---|---|
| Protótipo executável preservado | implementado | link e entrada Vite | build e runtime Chrome aprovados |
| Timeline | implementada | implementada | reducer cumulativo coberto por teste |
| Abstrato/prático | implementado | implementado | troca sem perder passo coberta |
| Memória/código | inexistente como modos genéricos | implementado em 5 das 6 lições | system design não oferece memória |
| Estruturas de dados | 20 lições amplas | 18 lições | 18 migradas; Bellman-Ford e BFS×DFS pendentes |
| Algoritmos | alguns traces | busca linear, BFS, DFS, Dijkstra, Union-Find | catálogo ampliado |
| Lógica e controle | inexistente | if e for | primeira fatia |
| System design | inexistente | fluxo síncrono cliente/API/banco + BTree, LRU, circular, Bloom | falhas, fila, retry e DLQ pendentes |
| Comparação sincronizada | implementada | 4 presets (insert-middle, array-queue, list-hash, bfs-dijkstra) | todos os presets do protótipo migrados |
| Flashcards | inexistente | 3 cards | fila por vencimento pendente |
| Conquista | progresso textual | Primeiro Trace | apenas um gatilho |
| Persistência de progresso | só tema | snapshot estruturado | passo, representação e tema persistidos após reload no E2E |
| Reduced motion | alternativa parcial | preferência global e passos estáticos | teclado e modo reduzido passaram no E2E |
| Testes | inexistentes | unitários, componentes e E2E | 13 unitários/componentes e 6 E2E aprovados |

## Limitações e riscos conhecidos

1. A revisão visual em 1440 px confirmou identidade coerente, mas não paridade pixel-perfect nem cobertura visual completa.
2. As 18 lições migradas e 3 novas comparações ainda não foram validadas visualmente contra o protótipo.
3. O cenário de system design é síncrono e não cobre fila, worker, falha, retry, idempotência ou DLQ.
4. A revisão calcula dueAt, mas a UI não seleciona cards por vencimento.
5. O aviso de conquista não possui ação de dispensar e permanece visível após desbloqueado.
6. Leitores de tela, zoom e reflow ainda não receberam validação manual.
7. Não existe regressão visual automatizada; mudanças de CSS ainda dependem de revisão humana.
8. Não há telemetria, migração de schema além da versão inicial nem backend.
9. O Git ausente impede uma linha de base confiável para revisão de mudanças.
10. As lições Bellman-Ford (pesos negativos) e comparação BFS×DFS não foram implementadas.

## Comandos disponíveis

- npm run dev: servidor Vite.
- npm run build: TypeScript por project references e build Vite.
- npm run preview: serve o build.
- npm test: Vitest em modo run.
- npm run test:watch: Vitest interativo.
- npm run test:e2e: Playwright.
- npm run check: testes unitários seguidos de build.

## Próximas validações necessárias

1. Executar testes manuais com leitores de tela.
2. Validar zoom, reflow, touch e ordem de foco em dispositivos reais.
3. Criar regressão visual automatizada por tema, viewport e estado.
4. Ampliar a comparação visual para lições, drawers e módulo Comparar do protótipo.
5. Medir bundle, FPS e custo de traces maiores.
6. Atualizar a matriz de paridade após cada migração.
