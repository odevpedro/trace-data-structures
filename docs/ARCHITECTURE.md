# Arquitetura do Trace

## Estado deste documento

Este documento descreve a arquitetura que existe no repositório em 11 de julho de 2026. Ele separa deliberadamente:

- o protótipo validado e preservado;
- a vertical slice já implementada;
- o destino arquitetural indicado pelo prompt mestre;
- capacidades ainda não migradas.

A aplicação modular não substitui o protótipo. Ela cresce ao redor dele segundo o Strangler Fig Pattern.

## 1. Invariantes

As decisões abaixo são restrições, não sugestões:

1. O protótipo HTML continua sendo a referência de identidade visual, motion e comportamento.
2. O arquivo original não pode ser apagado nem deixar de ser executável.
3. Uma feature só recebe status de migrada após paridade visual, funcional e de acessibilidade documentada e testada.
4. Todas as representações de uma lição observam o mesmo passo da mesma timeline.
5. Conceitos produzem eventos de domínio; componentes não codificam animações específicas de cada lição.
6. Conteúdo pedagógico não fica hardcoded nos componentes de interface.
7. Elementos visuais mantêm identidade estável entre passos sempre que possível.
8. O MVP é local-first e não introduz backend sem necessidade comprovada.

## 2. Topologia Strangler atual

| Superfície | Implementação | Estado |
|---|---|---|
| Protótipo canônico no workspace | trace_complete_market_v2.html | Preservado |
| Protótipo servido pela aplicação | prototype/trace_complete_market_v2.html | Cópia byte a byte do original no checkpoint atual |
| Landing modular | rota / | Implementada |
| Jornada modular | rota /app/learn | Implementada para seis lições |
| Player genérico | rota /app/lesson/:lessonId | Implementado |
| Revisão | rota /app/review | Implementada para três flashcards |
| Comparação modular | futura rota /app/compare | Não implementada |
| Demais áreas futuras | playground, mapa, progresso, configurações | Não implementadas |

O build Vite possui duas entradas: index.html para a aplicação React e prototype/trace_complete_market_v2.html para o protótipo. A landing e o rodapé oferecem acesso direto à versão preservada. A validação final confirmou que o build de produção gera e inclui as duas entradas.

O arquivo da raiz e sua cópia em prototype possuíam, neste checkpoint, o mesmo SHA-256:

7fe379a0d5e8876860beeee2fcdf0931c20e8efc0a26d1cb0ef699673b5fd7ac

Esse hash é uma evidência do checkpoint, não um mecanismo permanente de validação. Uma checagem automática de integridade ainda deve ser adicionada.

## 3. Stack implementada

| Responsabilidade | Tecnologia |
|---|---|
| Interface | React 19 e React DOM |
| Linguagem | TypeScript |
| Build e desenvolvimento | Vite |
| Rotas | React Router |
| Estado | Zustand |
| Persistência estruturada | IndexedDB |
| Fallback de persistência | localStorage |
| Testes unitários e de componentes | Vitest, Testing Library e jsdom |
| Testes de navegador | Playwright |
| Auditoria automática de acessibilidade | axe-core com Playwright |

Não existe backend, execução remota de código ou dependência de rede no fluxo principal.

## 4. Organização do código

| Área | Responsabilidade atual |
|---|---|
| src/app | Shell, roteamento e ponte de persistência |
| src/pages | Landing, jornada, lição, revisão e comparação |
| src/core/trace-engine | Tipos de domínio e redução determinística de traces |
| src/core/progress | Contrato versionado do snapshot local |
| src/core/spaced-repetition | Agendamento dos flashcards |
| src/content | Definições data-driven das sete lições, três cards e comparações |
| src/features/lesson-player | Player, canvas, previsão e desafio |
| src/features/timeline | Controles compartilhados de timeline e velocidade |
| src/features/flashcards | Sessão curta de revisão |
| src/features/progress | Apresentação da conquista Primeiro Trace |
| src/features/drawer | Drawer de limitação com focus trap |
| src/storage | Repositório IndexedDB e fallback resiliente |
| src/store | Estado global e ações de progresso/player |
| src/shared | Preferências e hooks compartilhados |
| e2e | Jornadas Playwright, console e axe |

Ainda não existem módulos separados para playground, mapa de conhecimento, execução de código, simulação avançada de system design ou migrações de storage.

## 5. Fluxo de dados de uma lição

1. src/content/lessons.ts fornece uma LessonDefinition.
2. Uma lição estática usa seu TraceDefinition; uma lição manipulável usa createTrace com entradas persistidas.
3. LessonPlayer abre a lição no store e recupera passo, representação, velocidade e entradas.
4. reduceTrace recria o estado computado da cena aplicando, em ordem, todos os eventos até o passo atual.
5. TraceCanvas renderiza essa mesma cena como abstração, aplicação prática ou memória.
6. A representação de código usa o mesmo passo para destacar codeLine; ela não mantém uma timeline paralela.
7. TimelineControls altera exclusivamente o stepIndex do player.
8. PersistenceBridge salva o ProgressSnapshot após mudanças.

Esse fluxo torna a timeline a fonte única da verdade. Trocar de representação não reinicia o passo.

## 6. Trace Engine

### Modelo

O núcleo implementado contém:

- SceneDefinition com nós e arestas estáveis;
- TraceDefinition com passos ordenados;
- TraceStep com eventos, descrições, captions por representação, métricas e linha de código;
- TraceEvent como união discriminada de eventos de estrutura, memória, controle de fluxo e sistemas;
- reduceTrace como reducer puro e determinístico.

Os eventos implementados incluem comparação, movimento, inserção, remoção, link/unlink, leitura e escrita de memória, stack frames, branch, chamada/retorno, requests/responses, cache, falha, retry e recuperação.

Nem todos os tipos já possuem uma lição que exercite sua semântica. Alguns eventos futuros atualmente resultam apenas em ênfase visual; isso é uma fundação extensível, não prova de que os respectivos módulos estejam prontos.

### Persistência visual

Os nós usam IDs de domínio como chaves React. Ao avançar passos dentro da mesma cena, os elementos permanecem montados e alteram transform, opacidade e ênfase. O reducer recompõe o estado lógico desde o início para obter determinismo, mas o React reconcilia os mesmos nós no DOM.

Ao trocar para a representação de código, o canvas é substituído pelo bloco de código. Logo, a persistência no DOM é garantida entre passos de uma representação visual, mas não entre canvas e código. Isso deve ser considerado em testes de motion e foco.

## 7. Conteúdo implementado

A vertical contém sete lições:

| ID | Módulo | Papel na vertical |
|---|---|---|---|
| array | Estrutura de dados | Inserção intermediária preservada do protótipo |
| linked-list | Estrutura de dados | Inserção local com relink de ponteiros |
| linear-search | Algoritmo | Busca, comparações e condição de parada |
| condition-if | Lógica e controle de fluxo | Entrada manipulável, previsão e branch |
| for-loop | Lógica e controle de fluxo | Loop configurável, condição e mutação |
| memory-reference | Memória | Stack frame, referência, heap e mutação |
| request-flow | System design | Cliente, API, banco, payload e latência simulada |

Array, busca linear, if, for e memória expõem abstrato, aplicação prática, memória e código. O fluxo de system design expõe abstrato, aplicação prática e código.

As definições incluem objetivos, pré-requisitos, dificuldade, classificação de honestidade do exemplo, explicações, custo contextualizado, alternativas e desafios. Os componentes recebem esses dados; não conhecem conteúdo específico.

Por ora, src/content/lessons.ts concentra todas as definições. Essa concentração facilita validar a primeira vertical, mas deve ser dividida por domínio antes de ampliar o catálogo.

## 8. Estado global e persistência

Zustand mantém:

- último lessonId;
- passo e representação por lição;
- entradas manipuláveis;
- lições iniciadas e concluídas;
- tentativas dos desafios;
- agenda e histórico dos flashcards;
- conquistas;
- tema;
- preferência de movimento;
- velocidade.

ProgressSnapshot possui version 1 e é salvo como um único registro no object store progress do banco trace-learning. O repositório tenta IndexedDB primeiro e usa localStorage como fallback.

Limitações atuais:

- não existe pipeline de migração entre versões de snapshot;
- a validação de dados persistidos verifica apenas version igual a 1;
- não há sincronização entre dispositivos;
- falhas de persistência caem silenciosamente para o fallback;
- não há política de quota, exportação ou exclusão de dados.

## 9. Motion e acessibilidade

Os tokens visuais do protótipo foram preservados em CSS: fundos off-white/escuro, superfícies, cinzas, cores semânticas, sombras e easing cubic-bezier(.16, 1, .3, 1).

Nós se movem com translate3d, escala e opacidade. Arestas têm identidade estável e transições próprias. Reduced motion pode seguir o sistema ou ser forçado pelo usuário; nesse modo, transições são reduzidas e uma lista textual estática de passos complementa a cena.

A base implementa:

- skip link;
- foco visível;
- navegação por teclado no player;
- labels nos controles;
- botões com aria-pressed;
- região aria-live polite para cada passo;
- descrição textual da cena;
- conteúdo visual decorativo oculto da árvore acessível;
- preferência de movimento persistida;
- temas claro e escuro.

axe automatizado não substitui testes manuais com teclado, leitores de tela, zoom, contraste e diferentes viewports.

## 10. Decisões registradas

| ID | Decisão | Motivo | Consequência |
|---|---|---|---|
| ADR-001 | Preservar e servir o HTML original | Continuidade e fallback verificável | Duas superfícies coexistem durante a migração |
| ADR-002 | React, TypeScript e Vite | Stack recomendada pelo prompt e tipagem do domínio | Exige build, roteamento e disciplina modular |
| ADR-003 | Reproduzir eventos até o passo atual | Estado determinístico e seek simples | Custo linear no número de eventos; otimização futura pode usar snapshots |
| ADR-004 | Uma timeline para todas as representações | Evita divergência pedagógica | Cada conteúdo precisa fornecer labels coerentes para o mesmo estado |
| ADR-005 | Zustand para player e progresso | Estado pequeno, observável e independente da UI | Regras de domínio não devem migrar para componentes |
| ADR-006 | IndexedDB com repositório abstrato | Persistência estruturada local-first | Backend futuro pode implementar o mesmo contrato |
| ADR-007 | Conteúdo em definições TypeScript | Validação de tipos e traces dinâmicos | O catálogo deve ser dividido para não virar um arquivo monolítico |
| ADR-008 | Sem backend no MVP | Não existe necessidade funcional atual | Sincronização e contas ficam fora do escopo |
| ADR-009 | Testes em camadas | Proteger reducer, UI, persistência, acessibilidade e jornadas | Gates precisam ser executados a cada slice |

## 11. Testes existentes

No checkpoint final desta documentação:

- npm test passou com 6 arquivos e 13 testes;
- npm run build passou e incluiu a aplicação e o protótipo;
- npm run test:e2e passou com 6 de 6 cenários;
- os fluxos E2E instrumentados não registraram erros de console nem page errors;
- screenshots desktop da landing, do player e do protótipo foram comparados manualmente e mostraram linguagem visual coerente.

Os 13 testes Vitest cobrem:

- reducer e persistência de elementos;
- branch verdadeiro;
- agendamento de revisão;
- IndexedDB;
- troca de representação sem perda de passo;
- teclado e descrição acessível;
- entrada manipulável;
- conquista;
- flashcards;
- acesso ao protótipo;
- recuperação de passo e representação.

Os seis cenários Playwright aprovados cobrem:

- persistência de passo, representação e tema após reload;
- teclado, reduced motion, desafio e conquista;
- flashcards e o fluxo de system design;
- axe na landing e no player;
- execução do protótipo preservado;
- viewport móvel sem overflow horizontal.

O resultado automático de axe se limita às superfícies exercitadas e não substitui validação manual de acessibilidade. A comparação por screenshots confirmou coerência de linguagem, não paridade pixel-perfect nem equivalência detalhada de motion. Ainda não existe regressão visual automatizada.

## 12. Limites arquiteturais atuais

- Somente uma das 20 lições do protótipo foi portada para o player novo.
- Comparações sincronizadas e drawers de limitação não foram migrados.
- A linguagem visual de Array foi comparada manualmente no player, mas a lição ainda não possui baseline pixel-perfect, regressão automatizada ou aceite detalhado de motion.
- O player não possui um painel separado de memória; memória é uma representação da mesma cena, coerente com a arquitetura, mas ainda pequena em escopo.
- Código é exibido e sincronizado, não executado em Web Worker.
- Flashcards agendam dueAt, mas a UI ainda percorre os três cards sem filtrar uma fila de vencidos.
- Há somente uma conquista, sem ciclo de exibição/dispensa ou catálogo de regras.
- O fluxo de system design é síncrono; fila, worker, retry, idempotência e DLQ permanecem pendentes.
- Não há comparação de performance, cobertura publicada ou regressão visual automatizada.
- BrowserRouter requer fallback para index.html na hospedagem de produção.
- O CSS e o catálogo de lições ainda são arquivos grandes e centralizados.

Esses limites são backlog explícito; não devem ser descritos como módulos concluídos.
