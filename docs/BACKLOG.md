# Backlog do Trace

## Como ler

Prioridades:

- P0: necessário para fechar a entrega e impedir regressões.
- P1: próxima migração de paridade do protótipo.
- P2: consolidação da fundação e expansão pedagógica.
- P3: produto posterior ao MVP.

Estados:

- Concluído: implementado e coberto pelo gate indicado.
- Parcial: existe uma fatia útil, mas o aceite do prompt não está completo.
- Pendente: ainda não implementado.

Concluir uma tarefa não autoriza remover a implementação original. A matriz de paridade é o gate de migração.

## 1. Baseline entregue

| ID | Estado | Entrega | Evidência |
|---|---|---|---|
| BASE-001 | Concluído | Protótipo preservado em prototype/trace_complete_market_v2.html | Hash igual, link na aplicação e execução aprovada em E2E |
| BASE-002 | Concluído | Shell React/TypeScript/Vite com landing e /app | Build multi-entry aprovado com app e protótipo |
| ENG-001 | Concluído | Trace Engine data-driven e reducer determinístico | Testes de reduceTrace |
| PLY-001 | Concluído | LessonPlayer com timeline única e quatro representações | Testes de passo e representação |
| VSL-001 | Concluído | Seis lições da vertical | Array, busca linear, if, for, memória e request flow |
| REV-001 | Concluído | Três flashcards e agendamento local | Testes de painel e scheduleReview |
| ACH-001 | Concluído | Conquista Primeiro Trace por domínio | Teste do desafio correto |
| STO-001 | Concluído | Snapshot em IndexedDB com fallback localStorage | Teste com fake-indexeddb |
| A11Y-001 | Parcial — automático concluído | Teclado, aria-live, reduced motion, skip link e axe | Unit/component e 6 E2E passam, inclusive axe na landing/player; validação manual permanece pendente |
| QA-001 | Concluído | Suíte automatizada inicial | 13 testes Vitest e 6 E2E passam; console instrumentado sem erros |

## 2. P0 — Fechar a primeira entrega

| ID | Estado | Trabalho | Critério de aceite |
|---|---|---|---|
| QA-002 | Concluído | Executar npm run build | TypeScript e Vite passaram; aplicação e protótipo foram gerados |
| QA-003 | Concluído | Executar npm run test:e2e após o build | 6 de 6 cenários passaram; testes instrumentados sem erros de console |
| QA-004 | Parcial | Comparação visual responsiva da vertical | Screenshots desktop de landing/player/protótipo são coerentes e E2E móvel não encontrou overflow; temas, pixel-perfect e motion detalhado ainda precisam de baseline |
| QA-005 | Pendente | Teste manual de acessibilidade | Teclado completo, zoom, foco, leitor de tela e contraste registrados |
| DOC-001 | Parcial | Manter os oito documentos obrigatórios sincronizados | Estado, visão, arquitetura, backlog, migração, paridade, design e motion refletem o mesmo checkpoint |
| PAR-001 | Parcial | Criar baseline visual do protótipo | Comparação manual desktop existe; automatização, temas, drawer e comparações ainda faltam |
| PAR-002 | Pendente | Formalizar aceite da lição Array | Visual, timeline, motion, quiz/desafio, métricas, acessibilidade e persistência comparados com o original |
| INT-001 | Pendente | Automatizar integridade do protótipo | Teste falha se a cópia preservada for removida ou alterada sem decisão registrada |
| VIS-001 | Parcial | Corrigir composição visual do canvas | Pulse e nós linked foram corrigidos; revisão visual manual continua incremental com novos baselines |
| VIS-002 | Parcial | Eliminar clipping responsivo de cena e código | Canvas e código escalam melhor em compare/mobile; ainda faltam mais estados e dispositivos reais |
| NAV-001 | Parcial | Restaurar navegação em mobile | Há navegação móvel mínima; fluxo completo e cobertura manual ainda pendem |
| A11Y-003 | Parcial | Hardening de drawer e regiões roláveis | Drawer desmonta, restaura foco e trava scroll; auditoria manual ainda pendente |
| STO-004 | Concluído | Normalizar snapshots antigos version 1 | Campos ausentes recebem fallback e a hidratação não quebra ao faltar dismissedAchievementIds |
| REV-004 | Concluído | Estabilizar cursor da fila de revisão | Revisar card intermediário não quebra a sessão quando a fila vencida encolhe |

## 3. P1 — Recuperar paridade do protótipo

### Próxima fatia recomendada

| ID | Estado | Trabalho | Critério de aceite |
|---|---|---|---|---|
| LES-002 | Concluído | Migrar Lista encadeada | Nós e arestas persistentes, inserção local, abstrato/prático, memória/código, desafio e testes |
| CMP-001 | Concluído | Criar engine de comparação sincronizada | Duas cenas recebem o mesmo passo, play/pause/seek e modo; comprimentos diferentes são tratados |
| CMP-002 | Concluído | Migrar Array × Lista: inserção no meio | Operações, tocados, custos e trade-offs equivalentes ao preset original |
| WIF-001 | Concluído | Migrar drawer Ver limitação | Foco preso, Escape, restauração de foco, reduced motion e conteúdo data-driven |
| PAR-003 | Parcial | Fechar paridade conjunta Array/Lista | Funcionalidades da dupla estão na nova arquitetura; revisão visual contra protótipo pendente |

Essa ordem exercita arestas do Trace Engine e restaura a comparação diretamente ligada à única lição já portada.

### Catálogo original ainda não migrado

| Lote | Lições | Estado |
|---|---|---|---|
| Lineares | lista dupla, pilha, fila, deque | Pendente (lista encadeada concluída) |
| Indexadas | tabela hash, set | Pendente |
| Hierárquicas | BST, árvore balanceada, heap, trie | Pendente |
| Grafos | grafo, DFS, Dijkstra, Union-Find | Pendente |
| Sistemas reais | B+ Tree, LRU Cache, buffer circular, Bloom Filter | Pendente |

Para Heap, o bubble-up completo do protótipo é comportamento obrigatório. Para todos os lotes, o original permanece disponível até cada linha da matriz ficar aprovada.

### Comparações originais ainda não migradas

| ID | Cenário | Estado |
|---|---|---|
| CMP-003 | Array × Fila: remoção no início | Pendente |
| CMP-004 | Lista × Hash: busca por chave | Pendente |
| CMP-005 | BFS/Grafo × Dijkstra: menos paradas × menor custo | Pendente |
| CMP-007 | Concluído | Corrigir sincronização e cobertura das comparações | ComparePage agora usa traces dedicados por cenário com alinhamento semântico e coverage E2E |

Inserção no meio Array × Lista (CMP-001/002) — Concluído.

### Defeitos auditados no legado

| ID | Prioridade | Estado | Trabalho | Critério de aceite |
|---|---|---|---|---|
| LEG-001 | P0 | Pendente | Restaurar saída da tela Comparar em viewport móvel | A pessoa volta a Aprender por controle visível e teclado em ≤720 px |
| LEG-002 | P0 | Pendente | Impedir comparação sem relação com a lição atual | As 20 lições abrem um preset pertinente ou explicam que não existe comparação |
| LEG-003 | P1 | Pendente | Alinhar a semântica temporal de BFS × Dijkstra | Cada passo representa evento comparável; nenhum lado repete frame final por falta de dados |
| LEG-004 | P1 | Pendente | Corrigir a ligação final do LRU | Cena e texto exibem a mesma ordem `D → B → A` |
| LEG-005 | P1 | Pendente | Preservar as camadas explicativas abaixo de 1050 px | Problema, escolha, custo e conceito continuam disponíveis em tablet/mobile |
| LEG-006 | P1 | Pendente | Completar acessibilidade do comparador e drawer | Nomes, live region, reduced motion, focus trap e fundo inerte passam por teste |

Qualquer correção direta no HTML preservado precisa atualizar hash, documentação e baseline de forma explícita. Alternativamente, o defeito pode ser eliminado pela migração com paridade comprovada antes da retirada do caminho legado.

## 4. P2 — Consolidar a fundação

| ID | Estado | Trabalho | Critério de aceite |
|---|---|---|---|
| CNT-001 | Pendente | Dividir lessons.ts por domínio | Um índice agrega arquivos menores sem mudar IDs nem traces |
| CNT-002 | Pendente | Validar conteúdo em runtime/build | IDs, referências, arestas, captions e passos inválidos falham cedo |
| ENG-002 | Pendente | Adicionar snapshots/checkpoints no reducer | Seek continua determinístico com traces longos e custo medido |
| ENG-003 | Pendente | Cobrir todos os TraceEvent | Cada evento possui semântica, teste e ao menos um cenário real |
| STO-002 | Pendente | Criar migrações de schema | Snapshot versionado migra sem perder progresso |
| STO-003 | Pendente | Expor exportar, importar e limpar dados | Usuário controla seus dados locais |
| REV-002 | Parcial | Filtrar cards vencidos | A sessão respeita dueAt e o cursor já é estável; ainda faltam empty state mais rico, persistência de fila e cobertura adicional |
| REV-003 | Pendente | Gerar cards de erro pessoal | Tentativas incorretas alimentam revisão sem duplicação |
| ACH-002 | Pendente | Catálogo de conquistas | Regras são data-driven, testáveis e ligadas a domínio |
| ACH-003 | Parcial | Ciclo do aviso de conquista | Aviso aceita dispensa e não prende mais foco/scroll; catálogo e regras adicionais ainda faltam |
| QA-006 | Concluído | Regressão visual automatizada | Baselines Playwright de landing, drawer, comparação, progresso e backend mobile adicionados |
| QA-007 | Pendente | Métricas de performance | Bundle, geração do trace e fluidez têm orçamento e medição |
| A11Y-002 | Parcial | Suíte manual recorrente | Axe cobre landing, player, compare e progresso; revisão manual por screenshots foi feita, mas leitor de tela real e touch ainda faltam |
| DEP-001 | Pendente | Configurar fallback de rotas na hospedagem | Abrir diretamente /app/lesson/:id funciona em produção |

## 5. P2 — Expandir a vertical pedagógica

| ID | Estado | Trabalho | Critério de aceite |
|---|---|---|---|
| LOG-001 | Parcial | Trilha de lógica | if e for existem; valores, tipos, operadores, expressões, funções e escopo faltam |
| FLOW-001 | Parcial | Controle de fluxo | if/for existem; else detalhado, switch, while, break, continue, exceções e async faltam |
| MEM-001 | Parcial | Por baixo dos panos | Referência/frame/heap existem; bits, alocação, GC, recursão, localidade e cache faltam |
| ALG-001 | Parcial | Algoritmos | Busca linear existe; busca binária, sorts, BFS, DFS e Dijkstra modulares faltam |
| ALG-002 | Concluído | Fechar Bellman-Ford | Distâncias agora atualizam no canvas e a checagem final de ciclo negativo foi implementada |
| CODE-001 | Pendente | Exercícios progressivos de código | Completar, ordenar e corrigir código com feedback |
| CODE-002 | Pendente | Executor JS/TS em Web Worker | Timeout, logs e loops infinitos não bloqueiam a UI |
| SYS-001 | Parcial | System design | Além do fluxo síncrono, a trilha agora inclui backend request, auth e backend assíncrono |
| SYS-002 | Concluído | Cenário assíncrono de pedidos | Backend async agora permite trocar entre retry bem-sucedido, request duplicado e falha final com DLQ, com cobertura automatizada |
| BCK-001 | Concluído | Parte ilustrativa de backend inspirada no roadmap backend | A trilha agora inclui lições atômicas para router, validação, service layer, autenticação, autorização, fila, worker, idempotência, retry e DLQ, além das visões gerais |
| BCK-002 | Pendente | Cobrir os clusters restantes do roadmap backend | Cada tema ainda não representado por trace próprio — por exemplo cache, balanceamento, rate limiting, paginação, busca, realtime e observabilidade — deve virar lição dedicada |
| BCK-003 | Parcial | Aprofundamento conceitual da trilha backend | A camada declarativa agora combina `pipeline`, `tree`, `queue` e `graph`: cliente-servidor e cache usam packet flow, `btree` usa árvore real, `backend-dlq` usa mensagem persistente com retry loop e `dijkstra` valida um renderer semântico de grafo ponderado; falta expandir para auth, protocolos, memória e demais tópicos do roadmap |
| PLAY-001 | Pendente | Playground controlado | Conceito, entrada, operação, velocidade e representação configuráveis sem linguagem universal |

## 6. P3 — Plataforma ampliada

| ID | Estado | Trabalho |
|---|---|---|
| MAP-001 | Pendente | Mapa de conhecimento com pré-requisitos orientativos |
| PROG-001 | Pendente | Dashboard de domínio, conceitos frágeis e revisão necessária |
| PATH-001 | Pendente | Trilhas completas de programação, memória, estruturas, algoritmos e system design |
| CMP-006 | Pendente | Novas comparações de algoritmos e arquitetura |
| GAME-001 | Pendente | Conquistas e consistência de estudo sem mecânicas de cassino |
| REC-001 | Pendente | Recomendações locais baseadas em domínio e erros |
| SYNC-001 | Pendente | Avaliar backend apenas após necessidade de conta/sincronização ser validada |

## 7. Dívidas e limitações conhecidas

- Array e Lista Encadeada possuem comparação e drawer na nova arquitetura, mas ainda sem revisão visual pixel-perfect contra o protótipo.
- A UI de revisão já filtra vencidos e não quebra com remoção de card, mas ainda não tem fila persistida por sessão nem revisão adaptativa.
- O snapshot antigo version 1 agora é normalizado, mas ainda não existe migração formal para futuras versões.
- O aviso de conquista pode ser dispensado, porém o catálogo de conquistas continua mínimo.
- O sistema de código é somente leitura.
- O system design já cobre fila, worker, retry, idempotência e DLQ em trace, com cenários alternativos manipuláveis; ainda falta um playground mais livre para composições arbitrárias.
- Há regressão visual automatizada, porém ainda não existe aceite pixel-perfect contra todo o protótipo.
- A revisão visual manual agora cobre baselines-chave de landing, comparação, progresso e backend mobile; ainda não cobre todos os estados, temas e viewports.
- A expansão de catálogo não pode transformar lessons.ts em um arquivo único ainda maior.
