# Plano de migração incremental

## 1. Objetivo

Evoluir o Trace sem interromper nem descaracterizar o protótipo validado. A migração segue o Strangler Fig Pattern: novas rotas e módulos assumem responsabilidades em fatias verticais, enquanto o HTML original permanece executável e serve de referência de paridade.

Este plano não autoriza:

- apagar o HTML;
- substituir todas as cenas de uma vez;
- declarar o catálogo migrado porque o shell novo existe;
- trocar motion específico por transições genéricas;
- remover quiz, drawer ou comparação antes de existir substituto equivalente;
- preencher o roadmap com páginas vazias.

## 2. Baseline protegida

O baseline contém:

- trace_complete_market_v2.html na raiz;
- prototype/trace_complete_market_v2.html servido pelo build;
- 20 lições animadas;
- quatro comparações sincronizadas;
- abstrato e aplicação prática;
- timeline, métricas, quizzes e drawers;
- temas, teclado, aria-live e reduced motion inicial.

A versão modular vive em index.html e src. As duas superfícies são entradas independentes do Vite.

Regra de rollback: se uma fatia modular falhar um gate, o link e o arquivo do protótipo permanecem disponíveis. Rollback não exige reconstruir o HTML porque ele nunca é removido.

## 3. Checkpoint atual

A primeira vertical funcional foi implementada:

Array → busca linear → condição if → loop for → referência na memória → três flashcards → cliente/API/banco

Ela também inclui:

- LessonPlayer compartilhado;
- Trace Engine;
- timeline única;
- abstrato, aplicação prática, memória e código quando aplicável;
- entradas e previsões;
- desafios;
- conquista Primeiro Trace;
- IndexedDB com fallback localStorage;
- tema, velocidade e preferência de movimento;
- testes unitários, de componentes e E2E aprovados.

Esse checkpoint prova a arquitetura. Ele não significa que as fases posteriores do roadmap ou a paridade do protótipo estejam concluídas.

## 4. Situação por fase do prompt mestre

| Fase | Estado real | Observação |
|---|---|---|
| 0 — Auditoria | Concluída para o baseline atual | Deve ser repetida e registrada a cada fatia |
| 1 — Fundação técnica | Parcial avançada | Tokens, shell, router, engine, timeline, storage e testes básicos existem; comparação e hardening faltam |
| 2 — Primeira migração vertical | Implementada, paridade parcial | Array foi portada, mas drawer e comparação associados ainda faltam |
| 3 — Consolidar estruturas | Não iniciada na aplicação nova | As demais 19 lições continuam somente no protótipo |
| 4 — Trilha de programação | Parcial | if e for existem; restante da trilha falta |
| 5 — Algoritmos | Parcial | busca linear existe; demais algoritmos faltam |
| 6 — Memória | Parcial | uma lição de frame/referência/heap existe |
| 7 — Flashcards | Parcial | três cards e agenda existem; revisão adaptativa completa falta |
| 8 — System design | Parcial | fluxo síncrono existe; cenário assíncrono e falhas faltam |
| 9 — Gamificação e mapa | Inicial | uma conquista existe; mapa e domínio por conceito faltam |

## 5. Unidade mínima de migração

Uma unidade migrável não é somente uma cena. Para uma lição existente, a fatia deve incluir:

1. definição de conteúdo e classificação honesta do exemplo;
2. eventos do Trace Engine;
3. timeline e seek;
4. representações originais, mantendo o passo;
5. motion documentado;
6. métricas e contexto de complexidade;
7. explicações em camadas;
8. desafio equivalente ao quiz original;
9. drawer ou comparação relacionada, quando existir;
10. persistência de passo, representação e tentativa;
11. teclado, aria-live e reduced motion;
12. testes unitários, de componente, integração e E2E proporcionais;
13. comparação visual e funcional com o HTML;
14. atualização de PARITY_MATRIX.md.

Até os itens aplicáveis estarem aprovados, o status é Em migração.

## 6. Sequência recomendada

### Etapa A — Fechar a entrega corrente

Validações concluídas:

1. build de produção aprovado com app e protótipo;
2. 6 de 6 cenários Playwright aprovados;
3. console e page errors sem ocorrências nos fluxos instrumentados;
4. persistência/reload/tema, teclado/reduced motion/conquista, flashcards/system design e axe exercitados;
5. protótipo preservado executado por E2E;
6. viewport móvel exercitado sem overflow horizontal;
7. screenshots desktop de landing, player e protótipo comparados manualmente, com linguagem visual coerente.

Validações ainda abertas:

1. teste manual com leitor de tela, zoom, contraste e diferentes dispositivos;
2. baseline pixel-perfect e regressão visual automatizada;
3. comparação detalhada de timing, trajetória e assentamento do motion;
4. estados de drawer e comparação, que ainda não existem na aplicação modular.

Saída atual: vertical verificada nos gates automatizados e coerente visualmente no recorte manual, sem declarar paridade completa.

### Etapa B — Fechar a migração de Array

1. Capturar o comportamento original de Array, seu quiz, drawer e entrada no comparador.
2. Registrar duração, easing, posições, elementos persistentes e reduced motion.
3. Corrigir diferenças da nova cena.
4. Migrar Lista encadeada para formar o par da comparação.
5. Criar o comparador genérico com timeline compartilhada.
6. Migrar Inserção no meio: Array × Lista.
7. Migrar o drawer Ver limitação com gestão completa de foco.
8. Executar regressão visual e funcional.

Saída: primeira feature original realmente elegível a Migrada.

### Etapa C — Lineares e indexadas

Migrar em pequenas fatias:

1. lista dupla;
2. pilha;
3. fila;
4. comparação de remoção Array × Fila;
5. deque;
6. tabela hash;
7. set;
8. comparação Lista × Hash.

Cada item passa pelo checklist da unidade mínima. Não criar todas as páginas antes de terminar a primeira.

### Etapa D — Hierárquicas, grafos e sistemas reais

Ordem sugerida:

1. BST e árvore balanceada;
2. heap, preservando bubble-up completo;
3. trie;
4. grafo, DFS e Dijkstra;
5. comparação de rotas;
6. Union-Find;
7. B+ Tree;
8. LRU Cache;
9. buffer circular;
10. Bloom Filter.

Saída: catálogo original com paridade documentada. O protótipo continua preservado como referência histórica mesmo após essa saída.

### Etapa E — Expandir a plataforma

Somente após a fundação demonstrar consistência:

- completar a trilha de lógica e programação;
- ampliar memória;
- adicionar algoritmos e padrões;
- executar código em Web Worker;
- construir revisão baseada em cards vencidos e erros;
- adicionar cenário assíncrono de system design;
- criar playground controlado;
- criar mapa de conhecimento e progresso.

Essa etapa expande o produto; não deve bloquear a restauração da paridade existente.

## 7. Gate por fatia

### Antes de implementar

- localizar a feature no protótipo;
- executar todos os seus estados;
- capturar tema claro e escuro;
- listar nós, arestas e estados persistentes;
- anotar timings, easing, overshoot e assentamento;
- documentar teclado, live region e reduced motion;
- identificar conteúdos e trade-offs;
- marcar a linha como Planejada na matriz.

### Durante

- adicionar ou reutilizar eventos de domínio;
- manter conteúdo fora dos componentes;
- não criar uma timeline por representação;
- manter IDs de nós estáveis;
- escrever testes junto com a fatia;
- executar Vitest após cada mudança relevante.

### Depois

- npm run test;
- npm run build;
- npm run test:e2e;
- verificar console;
- comparar visualmente;
- testar teclado e reduced motion;
- atualizar PARITY_MATRIX.md;
- registrar diferenças aceitas e pendências;
- somente então considerar Migrada.

## 8. Estratégia de testes

| Camada | O que protege |
|---|---|
| Unidade | Eventos, reducer, geração dinâmica, progresso, revisão e conquistas |
| Componente | Timeline, toggle, canvas, desafio, flashcard e controles |
| Integração | Lição completa, troca de representação e persistência |
| E2E | Reload, teclado, reduced motion, conquista, revisão e system design |
| Acessibilidade | axe, foco, leitor de tela, labels, contraste e zoom |
| Visual | Geometria, temas, motion e responsividade contra o baseline |

Estado no checkpoint final:

- 13 testes Vitest passaram em 6 arquivos;
- build de produção passou e incluiu app e protótipo;
- 6 de 6 cenários Playwright passaram;
- persistência/reload/tema, teclado/reduced motion/conquista, flashcards/system design, axe, protótipo executável e viewport móvel foram cobertos;
- os testes instrumentados não observaram erros de console;
- screenshots desktop confirmaram coerência visual entre landing, player e protótipo.

Ainda não existem regressão visual automatizada, aceite pixel-perfect, auditoria manual completa de acessibilidade ou paridade detalhada de motion.

## 9. Migração de dados

ProgressSnapshot começa em version 1. Antes de mudar campos persistidos:

1. criar uma função de migração N para N+1;
2. testar snapshot vazio, válido, antigo e corrompido;
3. manter IDs de lição e flashcard estáveis ou mapear renomes;
4. preservar tentativas, conclusão, agenda e preferências;
5. manter fallback seguro;
6. documentar a mudança.

Não alterar silenciosamente o significado de completedLessonIds ou lessonSteps.

## 10. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Nova UI divergir do protótipo | Baseline visual e revisão por feature |
| Catálogo grande acoplar tudo | Separar conteúdo por domínio antes do próximo lote |
| Timeline divergir entre modos | stepIndex único e testes de troca de representação |
| Eventos longos ficarem lentos | Medir e introduzir checkpoints sem mudar semântica |
| IndexedDB perder compatibilidade | Migrações versionadas e testes |
| Reduced motion perder informação | Lista textual de passos e testes manuais |
| E2E passar sem paridade visual | Gate visual separado |
| Expansão esconder dívida de migração | Backlog distingue paridade de funcionalidades novas |
| Rotas diretas falharem em produção | Configurar fallback de hosting antes do deploy |

## 11. Condição de encerramento da migração

A migração do catálogo original termina somente quando:

- as 20 lições possuem paridade aprovada;
- os quatro comparadores estão migrados;
- quizzes/desafios, drawers, métricas e progresso têm substitutos equivalentes;
- temas, teclado, aria-live e reduced motion foram verificados;
- testes e build passam;
- não existem erros relevantes no console;
- a matriz não contém linha original marcada como parcial ou ausente.

Encerrar a migração não exige apagar o protótipo. Preservá-lo como artefato histórico é compatível com a estratégia e reduz risco.
