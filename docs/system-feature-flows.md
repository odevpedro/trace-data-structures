# Trace — Fluxos de funcionalidades

## Player de lição

O LessonPlayer é o componente central que orquestra a experiência de uma lição.

```
LessonDefinition → LessonPlayer → TraceCanvas (4 representações)
                                → TimelineControls
                                → PredictionPanel
                                → ChallengePanel
                                → Drawer (se limitation presente)
                                → Link para ComparePage (se comparisonId presente)
```

### Fluxo de dados

1. `hydrated` verifica se o progresso foi carregado
2. `openLesson` inicializa o player no store
3. `traceForLesson` obtém o TraceDefinition (estático ou gerado)
4. `reduceTrace` computa a cena para o stepIndex atual
5. `TraceCanvas` renderiza nós e arestas com base no ComputedScene
6. Usuário navega por timeline, troca representação, responde desafio
7. `PersistenceBridge` salva o snapshot com debounce de 120ms

### Autoplay

- Intervalo base: 1250ms / velocidade
- Velocidades: 0.75x, 1x, 1.5x
- Pausa ao final da timeline
- Funciona em reduced motion (sem animação visual)

## Comparação sincronizada

A ComparePage permite visualizar duas lições lado a lado com timeline compartilhada.

```
/comparison/:comparisonId → ComparePage
                           → TraceCanvas (lição A)
                           → TraceCanvas (lição B)
                           → TimelineControls (compartilhado)
                           → Cartões de resumo
```

### Fluxo

1. `comparisonById` carrega a definição da comparação
2. `traceForLesson` obtém os traces de ambas as lições
3. Ambas as cenas usam o mesmo `stepIndex`
4. `TimelineControls` controla ambas simultaneamente
5. `maxStep = min(stepsA.length, stepsB.length) - 1`
6. Cartões de resumo destacam a estrutura mais adequada

## Drawer "Ver limitação"

O Drawer exibe barras de comparação entre a estrutura atual e uma alternativa.

### Comportamento

- Botão "Ver limitação" no cabeçalho da lição
- Painel desliza da direita com `transform: translateX`
- Focus trap: Tab循环 entre elementos focáveis
- Escape fecha o drawer
- Backdrop escuro clicável fecha o drawer
- Foco restaurado ao botão de abertura quando fechado
- Dados estáticos definidos na LessonDefinition.limitation

### Estados

- `data-open="false"`: panel fora da tela, backdrop invisível
- `data-open="true"`: panel visível, backdrop com opacidade

## Fluxo de revisão (Flashcards)

A seção de revisão exibe três flashcards em sequência.

```
/app/review → ReviewPage → FlashcardsPanel
                            → scheduleReview (agendamento)
```

### Agendamento

`scheduleReview` implementa spaced repetition com:
- box 0 (again): 0 dias, box 2 (hard): 1 dia, box 3 (good): 3 dias
- `dueAt` calculado como ISO string
- UI ainda não filtra cards por vencimento

## Persistência

```
PersistenceBridge → IndexedDbProgressRepository (primário)
                 → localStorage via ResilientProgressRepository (fallback)
```

- Snapshot versionado (version 1)
- Salvamento com debounce de 120ms
- Hidratação completa antes de renderizar o player
- Fallback silencioso em caso de falha do IndexedDB

## Traces de algoritmos em grafo

As lições de grafo (BFS, DFS, Dijkstra, Union-Find) seguem o mesmo modelo do LessonPlayer.

```
graphLessons (src/content/graphs.ts) → LessonDefinition[]
                                      → bfsTrace / dfsTrace / dijkstraTrace / unionFindTrace
```

### BFS

- Nós do grafo são blocos com rótulos abstrato e prático
- Fila representada como nó `tag` abaixo dos blocos
- Arestas direcionadas entre nós mostram conexões
- Passos: START → EXPAND (camadas) → FOUND → DONE
- Código destacado a cada iteração da fila

### DFS

- Mesmo layout de blocos para nós do grafo
- Pilha representada como nó `tag`
- Arestas direcionadas para navegação em árvore
- Passos: START → DESCEND → BACKTRACK → NEXT_BRANCH → FOUND
- Backtracking volta ao nó anterior antes de seguir novo ramo

### Dijkstra

- Blocos exibem distância atual (ex: `A·0`, `B·∞`)
- Pesos nas arestas como nós `tag` com valor numérico
- Fila de prioridade representada como nó `tag`
- Passos: START → RELAX → SELECT_MIN → RELAX → DONE
- Relaxamento atualiza distâncias e destaca arestas percorridas

### Union-Find

- Blocos representam elementos; `tag` mostra raiz atual
- Aresta invisível `bc` conecta os dois conjuntos após union
- Consulta `connected(A,D)?` como nó `tag` inferior
- Passos: START → FIND → UNION → COMPRESS → DONE
- Compressão de caminho encurta árvore para consultas futuras

## Conquistas

- "Primeiro Trace" é desbloqueado ao acertar o primeiro desafio
- `AchievementNotice` exibe o aviso no topo da página
- Aviso não possui ação de dispensar
- Gatilho no `answerChallenge` quando `completedLessonIds.length === 1`
