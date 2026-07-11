# Trace — Visão de produto

Última atualização: 11 de julho de 2026

## Visão

Trace é uma plataforma educacional visual para tornar a execução de software observável. Conceitos que normalmente aparecem como definições, código estático ou diagramas isolados tornam-se estados temporais que a pessoa pode prever, percorrer, manipular, comparar e explicar.

O produto não é um catálogo de animações. Cada experiência deve conectar:

- o problema que motivou a solução;
- a representação usada pelo computador;
- a evolução da execução;
- as leituras e mutações de memória;
- as decisões tomadas pelo fluxo;
- o custo observado e seu contexto;
- a aplicação prática e seus limites;
- as alternativas e seus trade-offs.

## Promessa central

Ao concluir uma unidade, a pessoa deve conseguir responder:

1. O que o programa tentou resolver?
2. Qual estado existia antes da operação?
3. Qual evento causou a próxima mudança?
4. O que foi lido, movido, ligado, removido ou escrito?
5. Por que apenas aquele ramo foi executado?
6. Quanto a escolha custou para aquela entrada?
7. Em que cenário a solução é adequada?
8. Quando outra abordagem seria melhor?

Uma animação bonita sem essas respostas não cumpre a promessa do Trace.

## Público

O foco inicial é quem está aprendendo fundamentos de programação e já sente a lacuna entre “ler código” e “entender o que acontece”. A plataforma também deve servir a pessoas que:

- revisam estruturas de dados e algoritmos;
- precisam construir modelos mentais de memória;
- querem ligar Big O a operações concretas;
- começam a estudar system design;
- aprendem melhor manipulando e comparando estados.

O tom deve respeitar uma audiência adulta. Clareza não significa infantilização.

## Modelo pedagógico

A progressão preferencial é:

Observar → Prever → Manipular → Completar → Implementar → Comparar → Otimizar

### Observar

Percorrer uma timeline e identificar estado, evento, elementos tocados e resultado.

### Prever

Registrar uma hipótese antes de revelar o próximo estado.

### Manipular

Alterar entradas ou condições e gerar um novo trace coerente.

### Completar

Preencher lacunas, ordenar passos ou corrigir uma condição.

### Implementar

Escrever uma função curta e comparar sua execução com um trace de referência.

### Comparar

Executar duas soluções sobre o mesmo problema e a mesma entrada.

### Otimizar

Reconhecer o gargalo, propor uma alternativa e justificar o trade-off.

A vertical slice atual implementa principalmente Observar, Prever e Manipular, além de desafios de compreensão. Completar, Implementar, Comparar e Otimizar permanecem como evolução do produto.

## Unidade fundamental: uma timeline, várias representações

Cada lição deve ter uma única fonte temporal de verdade. O passo atual alimenta renderizações diferentes:

- abstrata: estruturas, relações e operações;
- prática: um cenário tangível e honestamente classificado;
- memória: endereços pedagógicos, valores, referências e frames;
- código: linha ou bloco responsável pelo evento.

Trocar a representação não deve reiniciar nem avançar a execução. A pessoa observa o mesmo acontecimento por outro ângulo.

O Trace Engine deve receber eventos de domínio e produzir estado. Renderizadores não devem inventar timelines paralelas.

## Conteúdo orientado a dados

Uma definição de lição deve declarar, fora dos componentes visuais:

- identidade, módulo, dificuldade e pré-requisitos;
- objetivos;
- cena inicial;
- trace e métricas;
- representações;
- explicações;
- exemplo prático e sua classificação;
- desafios;
- flashcards;
- gatilhos de domínio.

Isso permite reutilizar o mesmo player, testar conteúdo e expandir o catálogo sem criar uma página especial para cada conceito.

## Honestidade dos exemplos

Todo exemplo prático deve usar uma destas classificações:

- analogia visual;
- modelagem possível;
- modelagem natural;
- uso técnico comum.

A interface deve deixar claro quando endereços, latências, estruturas ou fluxos foram simplificados. O Trace não deve atribuir uma implementação específica a um produto conhecido sem fonte confiável.

Complexidade também precisa de contexto. Exibir apenas O(n) não basta; a lição deve informar entrada, caso observado, elementos tocados e hipótese que sustenta a análise.

## Escopo educacional

### Fundamentos e lógica

- valores e tipos;
- variáveis e expressões;
- booleanos e comparações;
- condições;
- loops;
- funções, parâmetros, retorno e escopo;
- estado, imutabilidade e decomposição.

### Controle de fluxo

- execução sequencial;
- if/else e switch;
- for, while e do while;
- break e continue;
- chamadas, retorno e exceções;
- fluxo assíncrono e event loop em etapa posterior.

### Memória

- bits, bytes e endereços;
- memória contígua;
- stack, heap e stack frames;
- valores e referências;
- cópia, compartilhamento e mutabilidade;
- alocação, desalocação e garbage collection;
- recursão e stack overflow;
- localidade e cache em nível introdutório.

### Estruturas de dados

- estruturas lineares e indexadas;
- árvores e tries;
- grafos e conectividade;
- estruturas compostas e de sistemas reais;
- estruturas avançadas em fases futuras.

### Algoritmos

- busca e ordenação;
- travessias e caminhos em grafos;
- padrões como dois ponteiros, sliding window, recursão, backtracking, divide and conquer, greedy e programação dinâmica introdutória.

### System design

- cliente, API e banco;
- cache, fila e worker;
- balanceamento, CDN, replicação e particionamento;
- retry, timeout, circuit breaker e idempotência;
- observabilidade, consistência, disponibilidade e escalabilidade.

## Experiências do produto

### Landing pública

Apresenta a proposta, demonstra a linguagem visual e mantém acesso ao protótipo original durante a migração.

### Jornada de aprendizagem

Organiza conceitos por dependência, mostra progresso e recomenda o próximo passo sem bloquear rigidamente.

### Player de lição

Combina timeline, representações, métricas, explicações, previsão, manipulação e desafio.

### Comparar

Sincroniza duas soluções para a mesma entrada e mostra operações, memória, latência, complexidade e trade-offs. Não declara vencedores universais.

### Playground

Permite configurar entradas e operações dentro de modelos controlados. Não deve tentar interpretar uma linguagem universal antes da validação do motor.

### Revisar

Usa flashcards derivados de lições, erros, código, comparação e complexidade. A agenda deve priorizar cards vencidos e conceitos frágeis.

### System design

Permite pausar requests, inspecionar payloads e simular falha, retry, duplicidade, idempotência e DLQ.

### Mapa de conhecimento

Mostra dependências e lacunas entre conceitos, orientando o estudo.

### Progresso e conquistas

Representa domínio real: previsões, desafios, revisões e explicações. Não recompensa cliques vazios.

## Princípios de experiência

### Continuidade

O produto existente é a referência de identidade e comportamento. A migração é incremental, e o protótipo permanece acessível até haver substituição equivalente.

### Causalidade visível

Movimento explica uma mutação. Nada deve teleportar ou animar apenas para decorar.

### Estado persistente

Elementos continuam reconhecíveis entre passos. Progresso, preferência e último contexto devem sobreviver ao retorno.

### Acessibilidade equivalente

Toda informação transmitida visualmente precisa de texto, foco, teclado e alternativa de movimento reduzido.

### Comparação justa

Soluções devem receber o mesmo problema, entrada e timeline. O produto explicita hipóteses e trade-offs.

### Gamificação discreta

Conquistas celebram domínio. Moedas, vidas, energia, loot boxes, roletas e mecanismos de cassino não pertencem ao Trace.

## Arquitetura de informação de destino

- /: landing;
- /app: dashboard;
- /app/learn: trilhas;
- /app/lesson/:lessonId: player genérico;
- /app/compare: comparações;
- /app/playground: laboratório;
- /app/review: revisão;
- /app/knowledge-map: mapa;
- /app/achievements: conquistas;
- /app/progress: progresso;
- /app/settings: preferências;
- /app/learn/system-design: trilha de arquitetura.

Esta lista é destino, não declaração de implementação atual. As rotas existentes estão registradas em CURRENT_STATE.md.

## Prova arquitetural atual

A primeira vertical conecta:

Array → busca linear → condição if → loop for → valor e referência → cliente/API/banco

Ela também inclui:

- três flashcards;
- uma conquista;
- estado persistido;
- tema e preferência de movimento;
- testes unitários, de componente e cenários E2E executados.

A fundação passou por testes unitários, build de produção e seis cenários E2E. O protótipo preservado também passou no Chrome headless, e a revisão manual por screenshots em 1440 px considerou a identidade coerente entre landing, player e original. Isso valida a vertical como prova arquitetural, não como produto completo nem como reprodução pixel-perfect.

## Próximos marcos de produto

### Paridade e robustez

- ampliar a revisão visual para temas, estados e breakpoints adicionais;
- criar regressão visual automatizada;
- validar leitores de tela, zoom, reflow e touch manualmente;
- migrar o módulo de comparação;
- consolidar a fila de flashcards por vencimento.

### Fundamentos de programação

- completar variáveis, expressões, condições, loops, funções e call stack;
- adicionar exercícios de completar e implementar;
- relacionar erro frequente a revisão.

### Algoritmos e memória

- busca binária;
- insertion sort, merge sort e quicksort;
- BFS, DFS e Dijkstra;
- stack, heap, frames, recursão e garbage collection introdutório.

### System design

- evoluir o fluxo atual para pedido assíncrono com fila e worker;
- simular indisponibilidade, retry, duplicidade, idempotência e DLQ;
- medir latência, throughput e disponibilidade simulados.

### Domínio adaptativo

- selecionar revisão por dueAt;
- estimar domínio por conceito;
- destacar conceitos frágeis;
- orientar pelo mapa de conhecimento.

## Critérios de sucesso

O Trace progride quando consegue demonstrar, com testes e pesquisa de uso, que a pessoa:

- prevê estados com mais precisão;
- explica causalidade e custo sem depender da animação;
- transfere o modelo mental para código;
- escolhe entre alternativas com justificativa;
- recupera conceitos na revisão;
- navega usando teclado e movimento reduzido sem perder conteúdo.

Métricas de uso, conclusão ou aprendizagem ainda não estão instrumentadas no workspace. Elas são critérios futuros, não resultados já obtidos.

## Não objetivos imediatos

- backend antes de existir necessidade real;
- editor universal de linguagens;
- execução de código não confiável no thread principal;
- migração total em uma única entrega;
- páginas vazias para aparentar escopo;
- substituição da identidade validada por outro design;
- gamificação baseada em pressão ou recompensa aleatória.
