# Trace — Design system

Última auditoria: 11 de julho de 2026

## Status deste documento

Este documento registra o sistema visual observado no protótipo original e na vertical slice. Houve comparação visual manual por screenshots em viewport de 1440 px entre landing, player e protótipo. A revisão considerou a identidade coerente, mas não declara paridade pixel-perfect nem substitui regressão visual automatizada.

Fontes de evidência:

- trace_complete_market_v2.html;
- prototype/trace_complete_market_v2.html;
- src/styles.css;
- componentes em src/app, src/pages e src/features.

## Direção visual

O Trace usa uma estética adulta, editorial e funcional:

- fundo off-white no tema claro;
- preto quase absoluto no tema escuro;
- escala de cinzas dominante;
- cor semântica apenas para sucesso, atenção e erro;
- espaço negativo amplo;
- bordas discretas;
- sombras de baixa intensidade;
- tipografia limpa;
- componentes compactos;
- cenas técnicas sem aparência de jogo infantil.

A interface deve lembrar uma ferramenta de pensamento. A decoração nunca deve competir com a causalidade do trace.

## Princípios

### Hierarquia antes de cor

Tamanho, peso, espaçamento, borda e posição estabelecem prioridade. Cor é reservada para significado.

### Densidade controlada

A landing pode respirar; o player pode ser mais denso. Mesmo em áreas técnicas, controles precisam permanecer agrupados e legíveis.

### Uma família visual

Landing, lições, flashcards, system design e progresso devem parecer partes do mesmo produto.

### Honestidade visível

A classificação do exemplo e sua ressalva fazem parte do cabeçalho da lição, não de documentação escondida.

### Estados inequívocos

Ativo, visitado, sucesso, atenção, erro, desabilitado e selecionado precisam de mais de uma pista quando isso for necessário para acessibilidade.

## Tokens de cor

### Tema claro da vertical

| Token | Valor | Uso |
|---|---|---|
| --bg | #f7f7f5 | fundo da página |
| --surface | #ffffff | cards e controles |
| --soft | #f1f1ef | superfícies secundárias |
| --soft-2 | #e9e9e6 | trilhas e fundos terciários |
| --line | #deddd9 | divisores e bordas |
| --line-strong | #b7b6b1 | borda enfatizada |
| --text | #191919 | texto e seleção principal |
| --muted | #666560 | texto secundário |
| --faint | #696863 | metadados e texto discreto |
| --ok-bg | #edf5ee | fundo de sucesso |
| --ok | #28623a | texto/borda de sucesso |
| --warn-bg | #f6f0e5 | fundo de atenção |
| --warn | #75531c | texto/borda de atenção |
| --bad-bg | #f8ecec | fundo de erro |
| --bad | #8b3434 | texto/borda de erro |

### Tema escuro da vertical

| Token | Valor |
|---|---|
| --bg | #171717 |
| --surface | #202020 |
| --soft | #292929 |
| --soft-2 | #333331 |
| --line | #3b3b39 |
| --line-strong | #5a5a57 |
| --text | #f1f1ef |
| --muted | #b7b7b3 |
| --faint | #aaa9a5 |
| --ok-bg | #203428 |
| --ok | #a7dbb5 |
| --warn-bg | #3b3020 |
| --warn | #e2c78c |
| --bad-bg | #3a2424 |
| --bad | #efaaaa |

### Paridade com o protótipo

A maior parte da paleta foi preservada. As diferenças observadas são:

| Papel | Protótipo | Vertical |
|---|---|---|
| soft secundário | --soft2 | --soft-2 |
| linha forte | --line2 | --line-strong |
| faint claro | #91908b | #696863 |
| faint escuro | #888884 | #aaa9a5 |

As duas mudanças em faint são uma correção de contraste da vertical em relação ao protótipo. Após o ajuste, axe-core reportou zero violações na landing e no player auditados. A diferença é intencional para legibilidade, mas continua sendo uma divergência visual e impede tratar a interface como cópia pixel-perfect.

## Sombras

| Tema | Valor |
|---|---|
| Claro | 0 1px 2px rgb(15 15 15 / 4%), 0 12px 34px rgb(15 15 15 / 6%) |
| Escuro | 0 1px 2px rgb(0 0 0 / 30%), 0 15px 38px rgb(0 0 0 / 24%) |

Cards principais, flashcards e player usam --shadow. Estados ativos podem usar sombras locais mais fortes para comunicar elevação.

## Tipografia

### Família principal

Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI e sans-serif.

Inter não é carregada como asset ou webfont no projeto. O resultado depende da fonte disponível no sistema, com fallback para a pilha nativa. Testes visuais devem considerar essa variação.

### Família técnica

ui-monospace, SFMono-Regular, Menlo, Consolas e monospace são usados para:

- código;
- endereços e memória;
- mensagens/payloads;
- metadados técnicos.

### Padrões observados

- títulos usam tracking negativo e line-height compacto;
- eyebrow usa caixa alta, tracking aberto e 10 px;
- texto corrido usa a cor muted e line-height amplo;
- controles e chips usam 10–13 px;
- valores principais usam peso entre 650 e 760;
- o peso 720/760 é aceito pelo CSS, mas pode ser sintetizado quando a fonte ativa não oferece esse eixo.

Ainda não existem tokens formais de escala tipográfica. Os tamanhos estão distribuídos nas regras CSS.

## Espaçamento e layout

### Container

- largura máxima atual: --content de 1240 px;
- largura fluida: calc(100% - 36px);
- em telas pequenas: calc(100% - 18px).

O protótipo usava shell de até 1360 px. A redução para 1240 px é uma divergência de layout a validar.

### Grid

- cenas usam grid visual de 28 por 28 px;
- o canvas pedagógico usa base de 640 px;
- landing usa duas colunas em desktop;
- camadas explicativas e métricas usam grids que colapsam em mobile.

### Breakpoints

- 980 px: reorganiza topbar, landing, camadas e desafio;
- 720 px: layout mobile, controles empilhados e canvas horizontalmente rolável.

O protótipo tinha breakpoints adicionais em 1050, 850 e 720 px. A vertical passou no cenário E2E de 390 por 844 px sem overflow do documento, mas dispositivos reais, orientações adicionais, touch e zoom ainda precisam de validação.

### Espaçamento

Não há escala de spacing tokenizada. O CSS usa valores recorrentes de 5, 8, 10, 12, 14, 16, 18, 20, 26, 30, 34 e 46 px. Novos componentes devem reutilizar padrões existentes ou introduzir tokens antes de ampliar a variação.

## Forma e bordas

Padrões observados:

- controles pequenos: raio de 8–10 px;
- cards: 12–16 px;
- flashcards: 20 px;
- chips: raio de 999 px;
- nós padrão: 10 px;
- nós de decisão: 24 px;
- serviços: 15 px;
- borda padrão: 1 px com --line;
- borda enfatizada: 1 px com --line-strong ou --text.

Não existe ainda uma escala formal de radius.

## Componentes atuais

### App shell

- skip link;
- topbar sticky;
- marca Trace;
- navegação principal;
- contador de domínio;
- seletor de motion;
- alternância de tema;
- footer com acesso ao protótipo.

### Landing

- hero editorial;
- duas ações principais;
- prévia numerada da jornada;
- grade de princípios.

### Jornada

- cabeçalho de progresso;
- lista numerada;
- ícone, domínio, título, descrição e status;
- estados Novo, Em andamento e Concluído.

### Lesson Player

- cabeçalho com domínio, dificuldade e exemplo;
- laboratório de previsão;
- toggle de representação;
- chip de evento e motion;
- cena ou código;
- narração;
- timeline e velocidade;
- métricas;
- camadas explicativas;
- desafio;
- navegação entre lições.

### Revisão

- flashcard frente/verso;
- navegação entre três cards;
- avaliações Rever, Difícil e Aprendi;
- nota explicativa da agenda.

### Progresso

- contador de lições dominadas;
- conquista Primeiro Trace.

## Sistema visual das cenas

### Tipos de nó

| Tipo | Aparência |
|---|---|
| block | card retangular |
| slot | borda tracejada, fundo transparente e índice discreto |
| pill | forma totalmente arredondada |
| tag | superfície soft, sem sombra |
| decision | raio amplo para condição |
| memory | borda esquerda forte e fonte monoespaçada |
| service | card maior com raio de 15 px |
| message | pill tracejada e monoespaçada |

### Ênfases

| Estado | Tratamento |
|---|---|
| idle | superfície padrão |
| active | fundo text, texto bg, borda forte e sombra |
| visited | fundo soft e borda text |
| success | tokens ok |
| warning | tokens warn |
| muted | opacidade reduzida |

O tipo bad existe na paleta e é usado em respostas erradas; nós do trace usam warning para falhas no motor atual.

### Arestas

Arestas são spans posicionados com transform. Relações direcionadas recebem seta CSS. A ênfase ativa escurece a linha.

## Controles e interação

### Botões

- botão primário: contraste invertido com --text e --bg;
- botão secundário: superfície e borda;
- icon button: 36 por 36 px;
- estado hover altera fundo/borda;
- estado active reduz a escala;
- disabled reduz opacidade e usa cursor not-allowed.

### Seleção

Toggles usam aria-pressed e, visualmente, fundo --text com texto --bg.

### Foco

Todo elemento focável recebe outline de 2 px em --text com offset de 3 px. O skip link aparece ao receber foco.

### Feedback

- sucesso e erro de desafio combinam texto e estado visual;
- previsão usa role=status;
- passos são anunciados em aria-live;
- ícones puramente direcionais devem usar aria-hidden quando o rótulo já está no link.

## Tema

O tema é aplicado em data-theme no elemento html. A preferência light/dark vive no snapshot persistido.

Regras para novos componentes:

- nunca usar um valor claro fixo para fundo ou texto funcional;
- usar tokens semânticos;
- conferir estados hover, focus, disabled e selected nos dois temas;
- não presumir que box-shadow clara funciona no tema escuro.

## Conteúdo e tom

### Linguagem

- direta;
- tecnicamente precisa;
- curta o suficiente para acompanhar motion;
- sem exageros sobre tecnologia real;
- sem mascotes ou voz infantil;
- sem prometer que uma solução é universalmente superior.

### Classificação do exemplo

O label e a nota devem aparecer juntos. A classificação interna em inglês pode permanecer no modelo; o texto visível deve estar em português.

### Complexidade

Sempre apresentar:

- notação;
- caso ou entrada;
- número de operações ou elementos tocados quando disponível;
- ressalva da simulação.

## Acessibilidade

Implementações observadas:

- semântica de main, nav, article, section, figure e aside;
- skip link;
- foco visível;
- labels e nomes acessíveis;
- sr-only;
- aria-live;
- aria-pressed;
- alternativas textuais para reduced motion.

O cenário Playwright com axe-core foi executado na landing e no player de busca linear: zero violações após a correção de --faint. Os cenários E2E também validaram teclado e reduced motion. Axe não substitui ordem de foco manual, zoom, reflow nem leitores de tela reais, que permanecem pendentes.

## Responsividade

Em mobile:

- navegação primária é ocultada;
- a landing vira uma coluna;
- status e descrições secundárias da jornada são reduzidos;
- toolbar e timeline empilham;
- métricas e camadas usam uma coluna;
- canvas mantém 640 px e ganha rolagem horizontal.

Manter o canvas fixo evita deformação da cena. Em 390 por 844 px, o player permaneceu utilizável e o documento não apresentou overflow no E2E. A experiência ainda precisa ser verificada com touch, zoom, leitores de tela e outros tamanhos.

## Restrições de gamificação

Não usar:

- moedas;
- vidas;
- energia;
- baús;
- roletas;
- streaks punitivos;
- recompensas aleatórias;
- linguagem de cassino.

Conquistas devem descrever evidência de aprendizagem.

## Dívida atual

1. Espaçamento, radius e tipografia ainda não são tokens.
2. A largura de conteúdo diverge do protótipo e ainda não possui decisão de paridade registrada; --faint diverge por correção de contraste validada nas duas telas auditadas.
3. O resultado depende da fonte local porque Inter não é distribuída.
4. O canvas mobile passou sem overflow do documento em uma viewport, mas touch, zoom e múltiplos dispositivos não foram validados.
5. O aviso de conquista não pode ser dispensado.
6. Não há catálogo isolado de componentes nem regressão visual automatizada.
7. A revisão manual cobriu screenshots em 1440 px, sem aceite pixel-perfect e sem matriz completa de tema, estado e viewport.

## Checklist para novos componentes

- usa tokens nos dois temas;
- respeita a hierarquia editorial;
- tem foco visível e nome acessível;
- funciona por teclado;
- não depende apenas de cor;
- tem comportamento mobile;
- não introduz motion sem causalidade;
- inclui alternativa de movimento reduzido;
- classifica exemplos práticos;
- exibe custo com contexto;
- recebe teste de componente;
- recebe revisão visual contra as telas existentes.
