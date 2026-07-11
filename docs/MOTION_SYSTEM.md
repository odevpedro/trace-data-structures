# Trace — Motion system

Última auditoria: 11 de julho de 2026

## Status deste documento

Este documento registra o comportamento encontrado no CSS, no Trace Engine e no LessonPlayer. Houve execução E2E do modo reduzido e comparação visual manual por screenshots em 1440 px. Não existe, porém, regressão visual automatizada nem inspeção frame a frame de interpolação, duração e trajetória.

## Propósito

Motion no Trace explica causalidade:

estado anterior → operação → elementos afetados → custo → mutação → novo estado

Uma transição só deve existir quando ajuda a responder:

- o que se moveu;
- o que permaneceu;
- o que apareceu ou desapareceu;
- qual relação foi criada ou removida;
- qual passo causou a mudança.

Motion decorativo, teleporte e reconstrução integral da cena contradizem o produto.

## Princípios

### Persistência espacial

Um elemento conserva identidade e posição reconhecível entre passos sempre que o domínio permitir.

### Uma timeline

Representações observam o mesmo stepIndex. Trocar entre abstrato, prática, memória e código não cria outro relógio.

### Causalidade antes de espetáculo

A animação deve destacar a operação e assentar no novo estado. Efeitos sem conteúdo são evitados.

### Transform e opacidade

Movimento de cena usa principalmente translate3d, scale e opacity. Isso preserva continuidade e favorece composição eficiente.

### Alternativa equivalente

Movimento reduzido mantém timeline, narração, estado e conteúdo. Não deve apagar a informação que a animação explicava.

## Easing principal

O protótipo e a vertical usam:

--ease: cubic-bezier(.16, 1, .3, 1)

É uma curva de desaceleração forte: mudança rápida no início e assentamento suave. Ela é a referência atual para movimentos de cena, flashcards e conquista.

Não existem tokens separados para entrada, saída, spring, overshoot ou microinteração.

## Durações observadas

### Vertical slice

| Elemento | Propriedade | Duração |
|---|---|---:|
| navegação e controles | background, color, border, transform | 200 ms |
| transição local de card/lista | background | 250 ms |
| nó do trace | transform | 720 ms |
| nó do trace | opacity | 400 ms |
| nó do trace | background, color, border e shadow | 300 ms |
| aresta | transform e width | 720 ms |
| aresta | opacity | 350 ms |
| aresta | background | 300 ms |
| flashcard | transform | 550 ms |
| flashcard | background | 300 ms |
| conquista | keyframe de entrada | 700 ms |

### Protótipo original

| Elemento | Duração observada |
|---|---:|
| controles | 200 ms |
| progresso | 550 ms |
| nós | 720 ms para geometria, 400 ms para opacidade, 300 ms para cor |
| arestas | 720 ms para geometria, 380 ms para opacidade |
| troca de narração | 420 ms |
| drawer | 500 ms |
| backdrop | 280 ms |
| barras de comparação | 1100 ms |
| pulse | 1050 ms em loop |
| shake de erro | 250 ms |

A vertical preserva a duração central de 720 ms e o easing. Narração animada, drawer, comparação, pulse e shake do protótipo ainda não têm equivalentes gerais na nova arquitetura.

## Ritmo da timeline

O autoplay do LessonPlayer usa:

- intervalo base de 1250 ms por passo;
- velocidades selecionáveis de 0,75×, 1× e 1,5×;
- intervalo calculado como 1250 dividido pela velocidade.

Reduced motion mantém o mesmo intervalo de 1250 ms dividido pela velocidade. Ele remove a transição visual, mas não acelera a progressão pedagógica nem reduz o tempo de leitura.

## Modelo de estado e continuidade

### Redução cumulativa

reduceTrace:

1. cria a cena inicial;
2. aplica cada evento desde o primeiro passo;
3. termina no passo solicitado;
4. devolve todos os nós e arestas, inclusive os invisíveis.

Isso evita depender da direção de navegação. Ir do passo 4 para o passo 1 recalcula o estado correto em vez de tentar desfazer animações imperativamente.

### Identidade DOM

TraceCanvas renderiza nós e arestas com key igual ao id de domínio. Durante a navegação no mesmo trace:

- elementos existentes permanecem associados à mesma chave;
- posição muda por transform;
- visibilidade muda por opacity e scale;
- ênfase muda por atributos de estado;
- arestas mudam por transform, width e opacity.

O renderer de código usa uma lista de linhas e destaca a linha do passo. Ele compartilha timeline e descrição, mas não reutiliza os nós visuais da cena.

### Troca de representação

Mudar representação altera rótulos e, no caso de código, o renderer. O passo é conservado no store e há teste de componente para esse contrato.

### Entrada manipulável

As lições de if e for geram um TraceDefinition a partir da entrada. Alterar a entrada:

- salva o valor;
- reinicia a timeline no passo zero;
- gera estados e captions coerentes com a nova entrada.

A previsão do loop usa a fórmula n × (n − 1) / 2, coerente com o acumulador gerado para qualquer limite aceito pela interface.

## Eventos e intenção visual

| Evento | Intenção visual atual |
|---|---|
| COMPARE | enfatizar alvos comparados |
| MOVE | deslocar nó até uma posição |
| INSERT | revelar e opcionalmente posicionar |
| REMOVE | ocultar e marcar atenção |
| LINK | revelar aresta |
| UNLINK | ocultar aresta |
| HIGHLIGHT | aplicar ênfase semântica |
| READ_MEMORY | ativar endereço/nó lido |
| WRITE_MEMORY | atualizar valor e ativar nó |
| PUSH_STACK_FRAME | revelar frame |
| POP_STACK_FRAME | ocultar frame |
| BRANCH | destacar decisão e ramo escolhido |
| CALL_FUNCTION | ativar alvo da chamada |
| RETURN_VALUE | revelar resultado em sucesso |
| SEND_REQUEST | mover mensagem até destino |
| RECEIVE_RESPONSE | mover resposta e marcar destino |
| CACHE_HIT/MISS | enfatizar alvo |
| TIMEOUT/FAIL_NODE | marcar atenção |
| RETRY | reativar alvo |
| RECOVER_NODE | marcar sucesso |

Alguns eventos existem apenas no tipo e no reducer. Sem uma lição e teste, sua coreografia deve ser considerada preliminar.

## Estados de ênfase

- idle: estado neutro;
- active: operação atual, com inversão de contraste e elevação;
- visited: elemento já tocado, com superfície soft;
- success: resultado confirmado;
- warning: falha, remoção ou atenção;
- muted: ramo não executado ou elemento secundário.

Novas ênfases devem manter significado consistente entre estrutura de dados, memória e system design.

## Coreografias atuais

### Movimento de nó

- transformação de origem para destino em 720 ms;
- curva --ease;
- mudança semântica em paralelo, normalmente 300 ms;
- elemento permanece no DOM.

### Aparição e remoção

- visibilidade altera opacity;
- scale usa 0,86 quando invisível e 1 quando visível;
- transição de opacidade dura 400 ms;
- remoção lógica não exclui o nó do mapa da cena.

### Aresta

- posição é calculada entre os centros dos nós;
- width representa distância;
- rotate representa direção;
- opacity revela ou oculta;
- seta CSS indica direção.

### Mensagem de system design

SEND_REQUEST e RECEIVE_RESPONSE posicionam o nó de mensagem abaixo do destino. O fluxo atual comunica passagem entre cliente, API e banco, mas não possui curva de trajetória, latência proporcional à duração ou animação separada de ida e volta.

### Flashcard

A revelação altera conteúdo imediatamente e aplica uma pequena rotação de 2 graus com deslocamento vertical de 4 px em 550 ms. Não há flip tridimensional completo entre duas faces.

### Conquista

Entra com opacity, translateY de 18 px e scale de 0,96 para 1 em 700 ms. O aviso não tem saída nem ação de dispensar.

## Movimento reduzido

### Fontes de preferência

O store aceita:

- system;
- reduced;
- full.

useReducedMotion observa prefers-reduced-motion quando a escolha é system. reduced força true no hook; full força false no hook.

AppShell espelha a preferência no atributo data-motion do elemento html. Isso permite que a escolha explícita controle CSS global, e não apenas os componentes que recebem reducedMotion como propriedade.

### Comportamento da aplicação

Quando o hook retorna true:

- html recebe data-motion igual a reduced;
- animações e transições globais caem para 0,01 ms;
- iterações de animação são limitadas a uma;
- scroll suave é desativado;
- TraceCanvas recebe data-reduced-motion;
- transições de nós e arestas caem para 0,01 ms;
- flashcards recebem data-reduced-motion e transição de 0,01 ms;
- o player mostra uma lista estática com todos os passos;
- a timeline e a narração permanecem;
- autoplay continua com o mesmo intervalo.

Quando o sistema operacional anuncia redução:

- a media query global reduz animações e transições para 0,01 ms, exceto quando html possui data-motion igual a full;
- scroll suave é desativado;
- iterações de animação são limitadas a uma.

### Lacunas conhecidas

1. Não há controle de pausar uma interpolação intermediária; a pausa atua entre passos.
2. O cenário E2E confirma reduced explícito, teclado e lista estática, mas não substitui avaliação com pessoas sensíveis a movimento.
3. A opção full sobrepõe a media query por CSS inspecionado; ainda não há um cenário automatizado dedicado a essa combinação.
4. Leitores de tela, zoom e reflow permanecem sem validação manual.
5. Não há regressão visual automatizada para detectar mudanças de easing, duração, posição ou assentamento.

## Acessibilidade relacionada a motion

O conteúdo principal não depende exclusivamente da cena:

- aria-live anuncia lição, passo e descrição;
- figcaption oculto descreve o passo;
- narração permanece visível;
- lista estática aparece em reduced motion;
- controles são operáveis por teclado;
- representação de código destaca a linha correspondente.

Ainda é necessário validar:

- frequência dos anúncios durante autoplay;
- leitura do range e contagem em leitores de tela;
- foco durante navegação de rota;
- compreensão da cena sem acesso visual;
- experiência com zoom e scroll do canvas mobile.

## Contrato para autoria de um trace

Antes de adicionar uma cena, documentar:

- estado inicial;
- identidade de cada nó;
- eventos por passo;
- estado final;
- elementos que permanecem;
- conexões criadas ou removidas;
- duração esperada;
- representação textual;
- métricas e contexto;
- comportamento em reduced motion.

Cada passo deve:

- ter id estável;
- usar evento de domínio, não instrução visual arbitrária;
- possuir descrição completa;
- possuir caption para cada representação oferecida;
- informar métricas;
- apontar a linha de código quando houver código.

## Regras para implementação

- não remover e recriar toda a cena ao avançar;
- não usar top/left animados quando transform resolve;
- não esconder causalidade com cross-fades simultâneos;
- não adicionar loops decorativos;
- não codificar outra timeline dentro do renderer;
- não sincronizar representações por timers independentes;
- não alterar duração central sem teste de paridade;
- manter a operação legível em 0,75×, 1× e 1,5×;
- testar navegação para frente, para trás e por scrub;
- testar mudança de representação em passos intermediários;
- testar tema claro, escuro e movimento reduzido.

## Performance

Aspectos favoráveis observados:

- cenas pequenas em DOM;
- transform e opacity;
- reducer puro e determinístico;
- memoização do estado computado por trace e stepIndex;
- sem canvas pesado ou dependência de animação externa.

Pontos a medir:

- custo de reduzir desde o passo zero em traces longos;
- renders causados pelo store;
- FPS em dispositivos modestos;
- custo de will-change permanente;
- tamanho do bundle;
- cenas com muitos nós/arestas;
- efeito de autoplay e aria-live.

Nenhuma medição de bundle ou FPS foi executada nesta auditoria.

## Testes existentes

Testes unitários e de componente confirmam:

- acumulação de movimento e ênfase no reducer;
- permanência de nós entre passos;
- seleção de ramo;
- conservação do passo ao trocar representação;
- avanço por teclado;
- reinício ao alterar entrada.

O cenário E2E de teclado e reduced motion foi executado e aprovado. Ele confirmou a preferência explícita, o rótulo Quadros estáticos, a lista textual, avanço por teclado e conquista. A suíte completa passou com 6 de 6 cenários.

A comparação manual por screenshots em 1440 px considerou a identidade coerente entre landing, player e protótipo, sem aceite pixel-perfect. Não existem testes visuais automatizados de interpolação, duração, easing, trajetória ou paridade.

## Próximas ações

1. Validar frequência dos anúncios e operação do autoplay com leitores de tela.
2. Testar zoom, reflow e reduced motion em dispositivos reais.
3. Capturar os cinco estados da lição Array no protótipo e na vertical.
4. Comparar posição, duração, easing, opacidade e assentamento.
5. Criar regressão visual automatizada para passos-chave, temas e viewports.
6. Adicionar cenário automatizado para full sobre sistema operacional reduzido.
7. Definir tokens formais para fast, standard, scene e emphasis.
8. Projetar motion do módulo de comparação sem introduzir timelines paralelas.
