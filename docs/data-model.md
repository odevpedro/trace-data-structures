# Trace — Modelo de dados

## Snapshot de progresso

### ProgressSnapshot (version 1)

| Campo | Tipo | Descrição |
|---|---|---|
| version | `1` | Versão do schema |
| lastLessonId | `string` | Última lição acessada |
| lessonSteps | `Record<string, number>` | Último passo por lição |
| lessonRepresentations | `Record<string, Representation>` | Última representação por lição |
| lessonInputs | `Record<string, Record<string, number>>` | Entradas manipuláveis por lição |
| startedLessonIds | `string[]` | Lições iniciadas |
| completedLessonIds | `string[]` | Lições concluídas (desafio correto) |
| challengeAttempts | `Record<string, ChallengeAttempt>` | Tentativas de desafio por lição |
| flashcards | `Record<string, FlashcardProgress>` | Agenda de revisão por flashcard |
| achievementIds | `string[]` | Conquistas desbloqueadas |
| theme | `"light" \| "dark"` | Tema |
| motionPreference | `"system" \| "reduced" \| "full"` | Preferência de movimento |
| speed | `number` | Velocidade (0.75, 1, 1.5) |

## Entidades de domínio

### LessonDefinition

| Campo | Tipo | Descrição |
|---|---|---|
| id | `string` | Identificador único |
| title | `string` | Título completo |
| shortTitle | `string` | Título curto para navegação |
| module | `Module` | Agrupamento pedagógico |
| icon | `string` | Ícone textual |
| difficulty | `"foundation" \| "intermediate" \| "advanced"` | Dificuldade |
| prerequisites | `string[]` | IDs de lições anteriores |
| objectives | `string[]` | Objetivos de aprendizagem |
| description | `string` | Descrição curta |
| example | `ExampleMeta` | Classificação do exemplo prático |
| representations | `Representation[]` | Modos disponíveis |
| explanation | `Explanation` | Camadas explicativas |
| challenge | `ChallengeDefinition` | Desafio de compreensão |
| controls | `LessonControl[]` | (opcional) Entradas manipuláveis |
| prediction | `PredictionDefinition` | (opcional) Previsão |
| trace | `TraceDefinition` | Trace estático |
| createTrace | `(inputs) => TraceDefinition` | (opcional) Gerador de trace dinâmico |
| comparisonId | `string` | (opcional) ID da comparação associada |
| limitation | `LimitationDrawer` | (opcional) Drawer de limitação |

### TraceDefinition

| Campo | Tipo | Descrição |
|---|---|---|
| id | `string` | Identificador único |
| scene | `SceneDefinition` | Estado inicial com nós e arestas |
| steps | `TraceStep[]` | Passos ordenados |
| code | `string[]` | (opcional) Linhas de código |

### SceneDefinition

| Campo | Tipo | Descrição |
|---|---|---|
| nodes | `SceneNodeDefinition[]` | Nós da cena |
| edges | `SceneEdgeDefinition[]` | Arestas entre nós |

### TraceStep

| Campo | Tipo | Descrição |
|---|---|---|
| id | `string` | Identificador único |
| eventLabel | `string` | Rótulo do evento (ex: SHIFT, INSERT) |
| events | `TraceEvent[]` | Eventos de domínio aplicados |
| captions | `Partial<Record<Representation, string>>` | Legendas por representação |
| description | `string` | Descrição textual |
| metrics | `TraceMetrics` | Operações, tocados, complexidade e contexto |
| codeLine | `number \| undefined` | Linha de código destacada |

### TraceEvent (união discriminada)

| Tipo | Propriedades principais |
|---|---|
| COMPARE | targets |
| MOVE | target, to |
| INSERT | target, position? |
| REMOVE | target |
| LINK | from, to, edgeId? |
| UNLINK | from, to, edgeId? |
| HIGHLIGHT | targets, emphasis |
| READ_MEMORY | address, target? |
| WRITE_MEMORY | address, value, target? |
| PUSH_STACK_FRAME | frameId |
| POP_STACK_FRAME | frameId |
| BRANCH | condition, result, target?, trueTarget?, falseTarget? |
| CALL_FUNCTION | functionName, target? |
| RETURN_VALUE | value, target? |
| SEND_REQUEST | from, to, target? |
| RECEIVE_RESPONSE | from, to, target? |
| PUBLISH_EVENT | channel, target? |
| CONSUME_EVENT | channel, target? |
| CACHE_HIT | key, target? |
| CACHE_MISS | key, target? |
| TIMEOUT | target |
| RETRY | target |
| FAIL_NODE | target |
| RECOVER_NODE | target |

### ComparisonDefinition

| Campo | Tipo | Descrição |
|---|---|---|
| id | `string` | Identificador único |
| title | `string` | Título da comparação |
| lessonIdA | `string` | ID da primeira lição |
| lessonIdB | `string` | ID da segunda lição |
| labelA | `string` | Rótulo da primeira lição |
| labelB | `string` | Rótulo da segunda lição |
| summaryA | `string` | Resumo da primeira |
| summaryB | `string` | Resumo da segunda |
| summaryResult | `"neutral" \| "good-left" \| "good-right"` | Destaque visual |

### LimitationDrawer

| Campo | Tipo | Descrição |
|---|---|---|
| title | `string` | Título do drawer |
| goodLabel | `string` | Rótulo da barra superior |
| goodValue | `string` | Valor da barra superior |
| goodWidth | `number` | Largura percentual da barra superior |
| badLabel | `string` | Rótulo da barra inferior |
| badValue | `string` | Valor da barra inferior |
| badWidth | `number` | Largura percentual da barra inferior |
| text | `string` | Nota explicativa |

## Representações

```
"abstract" | "practical" | "memory" | "code"
```

## Tipos de nó

```
"block" | "slot" | "pill" | "tag" | "decision" | "memory" | "service" | "message" | "linked"
```

## Ênfases de nó/aresta

```
"idle" | "active" | "visited" | "success" | "warning" | "muted"
```
