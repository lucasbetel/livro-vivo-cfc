# Padrão das lições — Livro Vivo CFC (Exame de Suficiência do CFC, Bacharel)

Livro interativo (Vite + Three.js + roughjs) para uma pessoa estudar sozinha para o
**Exame de Suficiência do CFC** (50 questões A–D, banca FGV, aprovação com 25 acertos).
O conteúdo segue o **Anexo II do edital 2/2026** (texto em `edital-conteudo.txt`).

Cada lição é UM arquivo `src/lessons/NN-slug.js` com `export default { ... }`.
O app já importa todos os arquivos listados em `src/lessons/index.js` — **não mude o nome
do arquivo nem o `id`** que já existe no stub.

## Formato

```js
export default {
  id: '03-debito-credito',            // = nome do arquivo sem .js (NÃO MUDAR)
  numero: 3,
  disciplina: 'Contabilidade Geral',  // exatamente uma das 13 disciplinas do edital (ver lista abaixo)
  titulo: 'Débito, crédito e o razonete',
  subtitulo: 'Partidas dobradas sem decoreba',
  incidencia: 'alta',                 // 'alta' | 'media' | 'baixa' (quanto cai na prova)
  tempo: 50,                          // minutos estimados de estudo
  pergunta: 'Pergunta-gancho, curiosa, que a lição responde.',
  previsao: {                         // palpite ANTES da teoria
    pergunta: '...',
    opcoes: ['...', '...', '...'],
    correta: 1,                        // índice (0-based)
    explicacao: '...',                 // HTML curto
  },
  paginas: [                          // teoria; cada item vira uma página do livro (4 a 8 páginas)
    { titulo: 'O que é débito', html: `<p>...</p>` },
  ],
  demo: {                             // experimento interativo (obrigatório)
    titulo: 'Experimento: monte o razonete',
    instrucao: 'Faça um palpite, aplique e observe.',
    montar(el, kit) { /* desenha dentro de el; pode devolver função de limpeza */ },
  },
  macetes: ['frase curta com <b>macete</b>', '...'],      // 4 a 8
  questoes: [                         // 6 a 10 questões, estilo FGV/CFC, 4 alternativas
    {
      enunciado: 'HTML do enunciado (pode ter <table class="tabela">)',
      alternativas: ['A', 'B', 'C', 'D'],                 // exatamente 4, sem a letra na frente
      correta: 2,                                          // índice 0-3 — varie a posição!
      comentario: 'HTML explicando o porquê, com a conta passo a passo quando houver.',
    },
  ],
  resumo: ['item do resumo de bolso', '...'],              // 6 a 12 itens
};
```

Disciplinas válidas (escreva exatamente assim): `Contabilidade Geral`, `Contabilidade de Custos`,
`Contabilidade Aplicada ao Setor Público`, `Contabilidade Gerencial`, `Controladoria`,
`Noções de Direito e Legislação Aplicada`, `Matemática Financeira e Estatística`,
`Teoria da Contabilidade`, `Legislação e Ética Profissional`,
`Princípios de Contabilidade e Normas Brasileiras de Contabilidade`, `Auditoria Contábil`,
`Perícia Contábil`, `Língua Portuguesa Aplicada`, mais `Estratégia` (só a lição 01).

## Classes de HTML disponíveis nas páginas (já estilizadas no caderno)

- `<mark>` → marca-texto amarelo · `<span class="caneta-vermelha">` → correção em vermelho
- `<div class="formula">CMV = EI + C − EF</div>` → fórmula destacada, fonte manuscrita
- `<div class="caixa">...</div>` → quadro desenhado · `<div class="caixa alerta">` → pegadinha da prova
- `<aside class="nota">...</aside>` → nota na margem (post-it)
- `<table class="tabela">` → tabela de caderno · `<table class="tabela razonete">` → razonete em T (2 colunas D | C)
- `<ul class="lista-check">` → lista com ✓ · `<ol>` normal
- `<div class="exemplo"><b>Exemplo:</b> ...</div>` → exemplo resolvido

Escreva em português do Brasil, linguagem de professor particular: clara, direta, com
exemplos numéricos. Explique **o que mais cai** e as **pegadinhas da FGV**. Nada de
conteúdo inventado: em caso de dúvida em lei/norma, prefira a regra geral consagrada e
cite a fonte (ex.: "Lei 6.404/76, art. 193", "NBC TG 25", "CPC art. 465"). Valores e
percentuais legais têm que estar certos.

## O kit (segundo argumento de `demo.montar(el, kit)`)

Não importe nada nos arquivos de lição — use o `kit`:

- `kit.h(tag, props, ...filhos)` → cria elemento (`{class, html, onclick, style}`)
- `kit.fmt.brl(v)`, `kit.fmt.num(v, casas)`, `kit.fmt.int(v)`, `kit.fmt.pct(v)`
- `kit.INK` → cores de caneta: `azul, vermelho, verde, lapis, laranja, roxo, marca`
- `kit.pen.quadro(el, {largura, altura})` → desenho à mão (SVG): `.linha(x1,y1,x2,y2,{cor})`,
  `.retangulo(x,y,w,h,{cor,preenchimento})`, `.circulo(x,y,d)`, `.seta(...)`,
  `.texto(x,y,'txt',{cor,tamanho,ancora:'middle'})`, `.curva([[x,y]...])`, `.marca(x,y,w,h)`, `.limpar()`
- `kit.pen.grafico(el, {xmin,xmax,ymin,ymax,rotuloX,rotuloY,fmtX,fmtY})` → `.eixos()`,
  `.serie(fn ou [[x,y]], {cor, reta:true})`, `.ponto(x,y,'rótulo')`, `.barra(x, largPx, y,{cor})`, `.limpar()`,
  escalas `.sx(v)`, `.sy(v)`. Para redesenhar: `.limpar()` e desenhe de novo.
- `kit.ui.controle({rotulo,min,max,passo,valor,formato,aoMudar})` → slider
- `kit.ui.campo({rotulo, valor, aoMudar})` → input numérico
- `kit.ui.botoes(['A','B'], (i, botao, grupo) => ...)` → grupo de botões
- `kit.ui.previsao({pergunta, opcoes, correta, explicacao})` → cartão de palpite
- `kit.ui.tabela(cabecalho, linhas)` → `<table class="tabela">`
- `kit.tres.palco3d(el, {altura, camera:[x,y,z], alvo:[x,y,z]})` → `{THREE, cena, camera, aoQuadro(fn(dt,t)), destruir}`
  (luz, sombra, arrastar para girar já prontos); `kit.tres.rotulo3d('texto', {cor, tamanho})` → sprite;
  `kit.tres.mat3d(0xcor)` → material de papel. `kit.THREE` = Three.js.
- `kit.reduzMovimento()` → true no modo leitura (desligue animações longas).

Classes úteis dentro da demo: `.demo-linha` (flex com gap), `.demo-painel` (cartão),
`.demo-resultado` (caixa de resultado), `.btn-caneta` (botão), `.ok` / `.nok` (verde/vermelho).

**Regra da demo:** sempre siga *pergunta → palpite → resultado*: o usuário faz um palpite
(ex.: `kit.ui.previsao` ou botões), depois manipula/aplica e vê o resultado desenhado.
Deve funcionar no celular (largura ~360px): use `el.clientWidth` ou viewBox responsivo.
Pelo menos uma lição de cada ajudante deve usar `kit.tres.palco3d` (cena 3D simples:
blocos, pilhas, balança, linha do tempo, etc.). Devolva uma função de limpeza quando
usar `palco3d` (`return () => p.destruir()`).

Exemplo completo e funcionando: `src/lessons/02-patrimonio.js`.

## Como verificar

`npm run build` tem que passar sem erro. Rode também `node scripts/validar.mjs` (confere
campos, 4 alternativas, `correta` válida etc.). Abra `npm run dev` e navegue pela lição
(`#/licao/<id>/0`) se possível.
