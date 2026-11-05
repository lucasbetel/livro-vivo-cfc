// Lição 13 — Análise das demonstrações contábeis (Contabilidade Gerencial, edital item 4-C).
// Demo: calculadora de índices com balanço/DRE editáveis, gráfico à caneta e simulação de fatos.

const INICIAL = {
  disp: 20000, cli: 50000, est: 60000, rlp: 20000, perm: 150000,
  forn: 40000, sal: 10000, emp: 30000, pnc: 70000,
  rec: 600000, vendasPrazo: 600000, cmv: 360000, ll: 30000, compras: 360000,
};

const CAMPOS_BP = [
  ['disp', 'Disponível'], ['cli', 'Clientes'], ['est', 'Estoques'],
  ['rlp', 'Realizável LP'], ['perm', 'Ativo fixo*'],
  ['forn', 'Fornecedores'], ['sal', 'Salários/impostos'], ['emp', 'Empréstimos CP'],
  ['pnc', 'Passivo não circ.'],
];
const CAMPOS_DRE = [['rec', 'Receita líquida'], ['vendasPrazo', 'Vendas a prazo'], ['cmv', 'CMV'], ['ll', 'Lucro líquido'], ['compras', 'Compras a prazo']];

// Calcula todos os índices; denominador zero/negativo → null (mostra "—").
function calcular(v) {
  const AC = v.disp + v.cli + v.est;
  const AT = AC + v.rlp + v.perm;
  const PC = v.forn + v.sal + v.emp;
  const CT = PC + v.pnc;
  const PL = AT - CT;
  const d = (a, b) => (b > 0 ? a / b : null);
  const dias = (a, b) => (b > 0 ? (a / b) * 360 : null);
  const r = {
    AC, AT, PC, CT, PL,
    lc: d(AC, PC), ls: d(AC - v.est, PC), li: d(v.disp, PC), lg: d(AC + v.rlp, CT),
    pct: d(CT, PL), eg: d(CT, AT), ce: d(PC, CT), ipl: d(v.perm, PL), irnc: d(v.perm, PL + v.pnc),
    ml: d(v.ll, v.rec), giro: d(v.rec, AT), roa: d(v.ll, AT), roe: d(v.ll, PL), maf: d(AT, PL),
    pmre: dias(v.est, v.cmv), pmrv: dias(v.cli, v.vendasPrazo), pmpc: dias(v.forn, v.compras),
    ccl: AC - PC, ncg: v.cli + v.est - (v.forn + v.sal), st: v.disp - v.emp,
  };
  r.co = r.pmre != null && r.pmrv != null ? r.pmre + r.pmrv : null;
  r.cf = r.co != null && r.pmpc != null ? r.co - r.pmpc : null;
  return r;
}

function tipoFleuriet(r) {
  const s = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const k = `${s(r.ccl)}${s(r.ncg)}${s(r.st)}`;
  return ({
    '1-11': ['Tipo I — excelente', 'ok'], '111': ['Tipo II — sólida', 'ok'], '11-1': ['Tipo III — insatisfatória', 'nok'],
    '-11-1': ['Tipo IV — péssima', 'nok'], '-1-1-1': ['Tipo V — muito ruim', 'nok'], '-1-11': ['Tipo VI — alto risco', 'nok'],
  })[k] || ['estrutura limítrofe (algum saldo é zero)', ''];
}

function montarCalculadora(el, kit) {
  const { h, fmt, INK, ui, pen } = kit;
  let v = { ...INICIAL };
  let aba = 0;
  const inputs = {};

  const X = (x) => (x == null ? '—' : fmt.num(x, 2));
  const P = (x) => (x == null ? '—' : fmt.pct(x * 100, 1));
  const D = (x) => (x == null ? '—' : `${fmt.int(x)} dias`);
  const L = (cls, txt) => `<span class="${cls}">${txt}</span>`;

  // 1) Pergunta → palpite
  const prev = ui.previsao({
    pergunta: 'Na Cia. Aurora, AC = R$ 130.000 e PC = R$ 80.000 (liquidez corrente ≈ 1,63). Ela paga <b>R$ 10.000 a fornecedores com dinheiro do caixa</b>. O que acontece com a liquidez corrente?',
    opcoes: ['Sobe', 'Cai', 'Não muda: é fato permutativo'],
    correta: 0,
    explicacao: 'Fica 120.000 ÷ 70.000 ≈ 1,71. Com a LC <b>acima de 1</b>, tirar o mesmo valor de cima e de baixo faz a razão <b>subir</b>. Agora aplique o fato no botão <b>“Pagar fornecedor”</b> e veja a conta acontecer.',
    aoResponder: () => { botoesFatos.querySelectorAll('button').forEach((b) => { b.disabled = false; }); dica.textContent = 'Fatos liberados: aplique e compare antes × depois.'; },
  });

  // 2) Campos editáveis
  const grade = () => h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '2px 10px' } });
  const gradeBP = grade(), gradeDRE = grade();
  const fazCampo = ([k, rot], destino) => {
    const c = ui.campo({ rotulo: rot, valor: v[k], aoMudar: (x) => { v[k] = k === 'll' ? (Number(x) || 0) : Math.max(0, Number(x) || 0); atualizar(); } });
    inputs[k] = c.querySelector('input');
    Object.assign(c.style, { flex: '1 1 130px', minWidth: '0', maxWidth: '200px' });
    Object.assign(inputs[k].style, { width: '100%', boxSizing: 'border-box' });
    destino.append(c);
  };
  CAMPOS_BP.forEach((c) => fazCampo(c, gradeBP));
  CAMPOS_DRE.forEach((c) => fazCampo(c, gradeDRE));
  const sincronizar = () => Object.keys(inputs).forEach((k) => { inputs[k].value = v[k]; });

  const totais = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });

  // 3) Gráfico de barras à caneta (4 índices de liquidez + linha de referência 1,0)
  const caixaGraf = h('div', { style: { maxWidth: '520px', margin: '0 auto' } });
  const q = pen.quadro(caixaGraf, { largura: 420, altura: 270 });
  const desenhar = (r) => {
    q.limpar();
    const vals = [['Corrente', r.lc], ['Seca', r.ls], ['Imediata', r.li], ['Geral', r.lg]];
    const maior = Math.max(0, ...vals.map(([, x]) => x || 0));
    const ymax = Math.min(6, Math.max(2, Math.ceil(maior * 2) / 2 + 0.5));
    const E = 46, Dd = 410, T = 26, B = 222;
    const sy = (y) => B - (Math.min(Math.max(y, 0), ymax) / ymax) * (B - T);
    q.linha(E, B, Dd, B, { cor: INK.lapis, animar: false });
    q.linha(E, B, E, T - 10, { cor: INK.lapis, animar: false });
    const passo = ymax > 3 ? 1 : 0.5;
    for (let k = 0; k <= ymax + 1e-9; k += passo) {
      q.linha(E - 5, sy(k), E + 5, sy(k), { cor: INK.lapis, animar: false });
      q.texto(E - 9, sy(k) + 6, fmt.num(k, 1), { tamanho: 17, ancora: 'end', cor: INK.lapis, fonte: 'texto', animar: false });
    }
    const larg = (Dd - E) / vals.length;
    vals.forEach(([nome, x], i) => {
      const cx = E + larg * (i + 0.5), w = Math.min(60, larg * 0.55);
      const cor = x != null && x >= 1 ? INK.verde : INK.laranja;
      if (x != null && x > 0) q.retangulo(cx - w / 2, sy(x), w, B - sy(x), { cor, preenchimento: cor, animar: false });
      q.texto(cx, (x != null ? sy(x) : B) - 10, x == null ? '—' : `${fmt.num(x, 2)}${x > ymax ? '+' : ''}`, { tamanho: 22, ancora: 'middle', cor, animar: false });
      q.texto(cx, B + 30, nome, { tamanho: 21, ancora: 'middle', cor: INK.azul, animar: false });
    });
    q.linha(E, sy(1), Dd, sy(1), { cor: INK.vermelho, tracejado: true, espessura: 2, animar: false });
  };

  // 4) Tabela de índices por grupo
  const abas = ui.botoes(['Liquidez', 'Endividamento', 'Rentabilidade', 'Prazos', 'Capital de giro'], (i, b, g) => {
    aba = i; [...g.children].forEach((x) => x.classList.toggle('primario', x === b)); atualizar();
  });
  abas.children[0].classList.add('primario');
  const caixaTab = h('div', { class: 'tabela-rolagem' });
  const linhasDe = (r) => {
    const nome = (n, f) => `<b>${n}</b><br><small>${f}</small>`;
    if (aba === 0) return [
      [nome('Corrente', 'AC ÷ PC'), X(r.lc), r.lc == null ? '—' : r.lc > 1 ? L('ok', `R$ ${fmt.num(r.lc, 2)} de AC para cada R$ 1 de PC: folga.`) : r.lc === 1 ? 'O AC cobre exatamente o PC, sem folga.' : L('nok', 'O AC não cobre o PC.')],
      [nome('Seca', '(AC − Estoques) ÷ PC'), X(r.ls), r.ls == null ? '—' : r.ls >= 1 ? L('ok', 'Paga o PC sem precisar vender estoque.') : L('nok', 'Depende de vender estoques para pagar o PC.')],
      [nome('Imediata', 'Disponível ÷ PC'), X(r.li), r.li == null ? '—' : r.li >= 1 ? L('ok', 'O caixa cobre todo o PC (cuidado: pode ser dinheiro parado).') : `O caixa cobre ${fmt.pct(r.li * 100, 0)} do PC — ficar abaixo de 1 é comum.`],
      [nome('Geral', '(AC + RLP) ÷ (PC + PNC)'), X(r.lg), r.lg == null ? '—' : r.lg >= 1 ? L('ok', 'Bens e direitos realizáveis cobrem toda a dívida.') : L('nok', 'Sem o ativo fixo, não dá para pagar todas as dívidas.')],
    ];
    if (aba === 1) return [
      [nome('Part. capital de terceiros', 'CT ÷ PL'), P(r.pct), r.pct == null ? L('nok', 'PL nulo ou negativo: índice omitido. Passivo a descoberto somente se PL < 0.') : r.pct < 1 ? L('ok', 'Usa menos capital de terceiros que próprio.') : r.pct === 1 ? 'R$ 1 de terceiros para cada R$ 1 dos sócios: meio a meio.' : L('nok', `R$ ${fmt.num(r.pct, 2)} de terceiros para cada R$ 1 próprio.`)],
      [nome('Endividamento geral', 'CT ÷ Ativo total'), P(r.eg), r.eg == null ? '—' : r.eg < 0.5 ? L('ok', 'Menos da metade do ativo é financiada por terceiros.') : r.eg === 0.5 ? 'Metade do ativo é financiada por terceiros.' : L('nok', 'Mais da metade do ativo é financiada por terceiros.')],
      [nome('Composição do endividamento', 'PC ÷ CT'), P(r.ce), r.ce == null ? '—' : r.ce < 0.5 ? L('ok', 'Dívida concentrada no longo prazo.') : r.ce === 0.5 ? 'Metade da dívida vence no curto prazo.' : L('nok', 'A maior parte da dívida vence no curto prazo.')],
      [nome('Imobilização do PL', '(ANC − RLP) ÷ PL'), P(r.ipl), r.ipl == null ? L('nok', 'PL ≤ 0.') : r.ipl < 1 ? L('ok', 'O PL banca todo o ativo fixo e sobra para o giro.') : r.ipl === 1 ? 'O PL inteiro está no ativo fixo: nada sobra para o giro.' : L('nok', 'Parte do ativo fixo é financiada por terceiros.')],
      [nome('Imob. recursos não correntes', '(ANC − RLP) ÷ (PL + PNC)'), P(r.irnc), r.irnc == null ? '—' : r.irnc < 1 ? L('ok', 'Recursos de longo prazo cobrem o ativo fixo; o excedente cobre RLP e giro. Só há CCL positivo se também cobrir todo o RLP.') : r.irnc === 1 ? 'Recursos de longo prazo cobrem exatamente o ativo fixo.' : L('nok', 'Ativo fixo financiado com dívida de curto prazo!')],
    ];
    if (aba === 2) return [
      [nome('Margem líquida', 'LL ÷ Vendas líquidas'), P(r.ml), r.ml == null ? '—' : r.ml > 0 ? L('ok', `Cada R$ 100 vendidos deixam R$ ${fmt.num(r.ml * 100, 2)} de lucro.`) : r.ml === 0 ? 'Margem zero: resultado nulo.' : L('nok', 'Prejuízo: margem negativa.')],
      [nome('Giro do ativo', 'Vendas ÷ Ativo'), X(r.giro), r.giro == null ? '—' : `Cada R$ 1 de ativo gerou R$ ${fmt.num(r.giro, 2)} de vendas.`],
      [nome('ROA (retorno do ativo)', 'LL ÷ Ativo = margem × giro'), P(r.roa), r.roa == null ? '—' : r.roa > 0 ? L('ok', `${P(r.ml)} × ${X(r.giro)} = ${P(r.roa)}`) : r.roa === 0 ? 'Retorno zero.' : L('nok', 'Retorno negativo.')],
      [nome('ROE (retorno do PL)', 'LL ÷ PL = ROA × Ativo/PL'), P(r.roe), r.roe == null ? L('nok', 'PL ≤ 0: sem sentido.') : r.roe > 0 ? L('ok', `${P(r.roa)} × ${X(r.maf)} (Ativo/PL) = ${P(r.roe)}`) : r.roe === 0 ? 'Retorno zero.' : L('nok', 'O sócio está perdendo dinheiro.')],
    ];
    if (aba === 3) return [
      [nome('PMRE', 'Estoque ÷ CMV × 360'), D(r.pmre), 'Dias que o estoque fica parado. Quanto menor, melhor.'],
      [nome('PMRV', 'Clientes ÷ Vendas a prazo × 360'), D(r.pmrv), 'Dias para receber dos clientes. Quanto menor, melhor.'],
      [nome('PMPC', 'Fornecedores ÷ Compras a prazo × 360'), D(r.pmpc), 'Dias para pagar fornecedores. Quanto <b>maior</b>, melhor.'],
      [nome('Ciclo operacional', 'PMRE + PMRV'), D(r.co), 'Da compra da mercadoria ao recebimento da venda.'],
      [nome('Ciclo financeiro', 'CO − PMPC'), D(r.cf), r.cf == null ? '—' : r.cf > 0 ? L('nok', `A empresa precisa financiar ${fmt.int(r.cf)} dias da operação.`) : L('ok', 'Os fornecedores financiam todo o ciclo.')],
    ];
    const [tipo, cls] = tipoFleuriet(r);
    return [
      [nome('CCL', 'AC − PC'), fmt.brl(r.ccl), r.ccl >= 0 ? L('ok', 'Folga: recursos de longo prazo financiam parte do giro.') : L('nok', 'Dívidas de curto prazo maiores que o AC.')],
      [nome('NCG', 'ACO − PCO'), fmt.brl(r.ncg), r.ncg > 0 ? 'A operação (clientes + estoques − fornecedores − salários/impostos) consome recursos.' : 'A operação gera recursos (fornecedores financiam).'],
      [nome('Saldo de tesouraria', 'ACF − PCF = CCL − NCG'), fmt.brl(r.st), r.st >= 0 ? L('ok', 'Sobra de caixa sobre os empréstimos de curto prazo.') : L('nok', 'Depende de banco no curto prazo (risco de efeito tesoura).')],
      [nome('Modelo Fleuriet', 'sinais de CCL, NCG e T'), cls ? L(cls, tipo) : tipo, 'Combinação dos três sinais acima.'],
    ];
  };

  // 5) Simulação de fatos (antes → depois)
  const FATOS = [
    {
      rotulo: 'Pagar fornecedor (R$ 10.000, à vista)', pode: () => v.disp >= 10000 && v.forn >= 10000,
      falta: 'É preciso ter pelo menos R$ 10.000 em Disponível e em Fornecedores.',
      aplicar: () => { v.disp -= 10000; v.forn -= 10000; },
      explica: (a) => `AC e PC caíram R$ 10.000 cada. A LC estava ${a.lc > 1 ? 'acima de 1, por isso <b>subiu</b>' : a.lc < 1 ? 'abaixo de 1, por isso <b>caiu</b>' : 'igual a 1, por isso <b>não mudou</b>'}. O CCL não muda (AC − PC continua igual).`,
    },
    {
      rotulo: 'Comprar estoque a prazo (R$ 20.000)', pode: () => true, falta: '',
      aplicar: () => { v.est += 20000; v.forn += 20000; v.compras += 20000; },
      explica: (a) => `Estoque e Fornecedores subiram R$ 20.000. A LC estava ${a.lc > 1 ? 'acima de 1, por isso <b>caiu</b>' : a.lc < 1 ? 'abaixo de 1, por isso <b>subiu</b>' : 'igual a 1 e <b>não mudou</b>'}. A <b>seca cai se seu numerador for positivo; se for zero, permanece zero</b>: o estoque não entra no numerador, mas o PC aumentou.`,
    },
    {
      rotulo: 'Comprar estoque à vista (R$ 10.000)', pode: () => v.disp >= 10000, falta: 'É preciso ter pelo menos R$ 10.000 em Disponível.',
      aplicar: () => { v.disp -= 10000; v.est += 10000; },
      explica: () => 'Troca dentro do AC (caixa vira estoque): <b>LC e CCL não mudam</b>, mas <b>seca e imediata caem</b>.',
    },
    {
      rotulo: 'Tomar empréstimo de LP (R$ 30.000)', pode: () => true, falta: '',
      aplicar: () => { v.disp += 30000; v.pnc += 30000; },
      explica: () => 'Entra caixa (AC ↑) e a dívida vai para o PNC: o PC não muda, então <b>corrente, seca e imediata sobem</b> e o <b>CCL aumenta</b>. Na geral, numerador e denominador sobem igual e o índice se aproxima de 1.',
    },
  ];
  const dica = h('p', { class: 'demo-fato' }, 'Dê seu palpite acima para liberar os fatos.');
  const resFato = h('div', { 'aria-live': 'polite' });
  const botoesFatos = ui.botoes(FATOS.map((f) => f.rotulo), (i) => {
    const f = FATOS[i];
    if (!f.pode()) { resFato.innerHTML = `<div class="demo-resultado"><p class="nok">${f.falta}</p></div>`; return; }
    const a = calcular(v);
    f.aplicar(); sincronizar(); atualizar();
    const d = calcular(v);
    const seta = (x, y) => (x == null || y == null ? '—' : Math.abs(y - x) < 1e-9 ? '= igual' : y > x ? L('ok', '↑ subiu') : L('nok', '↓ caiu'));
    const linhas = [['Corrente', 'lc'], ['Seca', 'ls'], ['Imediata', 'li'], ['Geral', 'lg']].map(([n, k]) => [n, X(a[k]), X(d[k]), seta(a[k], d[k])]);
    linhas.push(['CCL', fmt.brl(a.ccl), fmt.brl(d.ccl), seta(a.ccl, d.ccl)]);
    resFato.innerHTML = '';
    resFato.append(h('div', { class: 'demo-resultado' },
      h('p', { html: `<b>${f.rotulo}:</b> ${a.PC === 0 || d.PC === 0 ? 'Com PC zero, corrente, seca e imediata ficam indefinidas (—); compare os valores válidos na tabela.' : f.explica(a)}` }),
      h('div', { class: 'tabela-rolagem' }, ui.tabela(['Índice', 'Antes', 'Depois', 'Efeito'], linhas))));
  });
  botoesFatos.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  const restaurar = h('button', { type: 'button', class: 'btn-caneta pequeno', onclick: () => { v = { ...INICIAL }; sincronizar(); resFato.innerHTML = ''; atualizar(); } }, '↺ Valores iniciais');

  function atualizar() {
    const r = calcular(v);
    totais.innerHTML = `Ativo total <b>${fmt.brl(r.AT)}</b> · Passivo (PC ${fmt.brl(r.PC)} + PNC ${fmt.brl(v.pnc)}) · <b>PL = A − P = ${fmt.brl(r.PL)}</b>`
      + (r.PL <= 0 ? '<br><span class="nok">PL nulo ou negativo: índice omitido. Passivo a descoberto somente se PL < 0. Índices sobre o PL ficam sem sentido (—).</span>' : '')
      + (r.PC <= 0 ? '<br><span class="nok">PC = 0: corrente, seca e imediata não podem ser calculadas (—).</span>' : '');
    desenhar(r);
    caixaTab.innerHTML = '';
    caixaTab.append(ui.tabela(['Índice', 'Valor', 'Leitura'], linhasDe(r)));
  }

  el.append(
    prev,
    h('div', { class: 'demo-painel' },
      h('p', { class: 'demo-fato', html: '<b>Balanço da Cia. Aurora</b> (R$) — edite à vontade; o PL é calculado (A − P).' }), gradeBP,
      h('p', { html: '<small>* Ativo fixo = investimentos + imobilizado + intangível (ANC − RLP).</small>' }),
      h('p', { class: 'demo-fato', html: '<b>DRE e operações do ano</b> (R$). Prazos: vendas e compras a prazo em campos próprios; saldos finais aproximam os médios e as bases monetárias são compatíveis. Ano de 360 dias.' }), gradeDRE, totais),
    h('div', { class: 'demo-painel' },
      h('p', { class: 'demo-fato', html: '<b>Liquidez em barras</b> — verde ≥ 1; laranja &lt; 1; linha vermelha tracejada = 1,0.' }), caixaGraf),
    h('div', { class: 'demo-painel' }, abas, caixaTab),
    h('div', { class: 'demo-painel' },
      h('div', { class: 'demo-linha' }, dica, restaurar), botoesFatos, resFato),
  );
  atualizar();
}

export default {
  id: '13-analise-demonstracoes',
  numero: 13,
  disciplina: 'Contabilidade Gerencial',
  titulo: 'Análise das demonstrações contábeis',
  subtitulo: 'O check-up da empresa em índices',
  incidencia: 'media',
  tempo: 50,
  pergunta: 'Uma empresa com R$ 2 de ativo circulante para cada R$ 1 de dívida de curto prazo pode ficar sem dinheiro para pagar o salário do mês?',
  previsao: {
    pergunta: 'A liquidez corrente de uma empresa é 2,0, mas quase todo o ativo circulante é estoque encalhado. Ela pode ficar sem caixa para pagar as contas do mês?',
    opcoes: ['Não: liquidez corrente 2,0 garante folga.', 'Sim: o índice alto pode estar “inflado” por estoque que não vira dinheiro rápido.', 'Só se o patrimônio líquido for negativo.'],
    correta: 1,
    explicacao: 'A liquidez corrente põe no mesmo saco caixa, clientes e estoques. Se o AC é quase todo estoque parado, a empresa pode ter índice bonito e caixa vazio. Por isso existem a <b>liquidez seca</b> (tira os estoques), a <b>imediata</b> (só o disponível) e os <b>prazos médios</b>: nenhum índice sozinho conta a história toda.',
  },
  paginas: [
    {
      titulo: 'Para que serve a análise de balanços',
      html: `<p>As demonstrações dizem <b>quanto</b> a empresa tem, deve e lucrou. A análise transforma esses valores em <mark>indicadores comparáveis</mark>: dá para comparar a empresa com ela mesma no tempo, com o setor e com metas.</p>
<table class="tabela"><thead><tr><th>Grupo</th><th>Pergunta que responde</th><th>Leitura</th></tr></thead><tbody>
<tr><td>Liquidez</td><td>Consegue pagar as dívidas?</td><td>quanto <b>maior</b>, melhor</td></tr>
<tr><td>Endividamento (estrutura)</td><td>Quem financia a empresa: sócios ou terceiros?</td><td>quanto <b>menor</b>, melhor</td></tr>
<tr><td>Rentabilidade</td><td>Quanto rende o dinheiro investido?</td><td>quanto <b>maior</b>, melhor</td></tr>
<tr><td>Prazos médios (atividade)</td><td>Quantos dias o dinheiro fica "preso"?</td><td>PMRE e PMRV: <b>menor</b>; PMPC: <b>maior</b></td></tr></tbody></table>
<div class="caixa"><b>Ferramentas da análise:</b><br>• <b>Análise vertical (AV):</b> quanto cada conta pesa no total, no mesmo ano.<br>• <b>Análise horizontal (AH):</b> como cada conta evoluiu de um ano para outro.<br>• <b>Índices (quocientes):</b> divisão de uma conta (ou grupo) por outra.</div>
<p>Antes de calcular, o analista <b>padroniza</b> o balanço: por exemplo, duplicatas descontadas são tratadas como empréstimo no passivo circulante, e não como redutora de clientes.</p>
<aside class="nota">A situação financeira é medida por <b>liquidez e endividamento</b>; a situação econômica, por <b>rentabilidade</b>.</aside>`,
    },
    {
      titulo: 'Análise vertical e horizontal',
      html: `<div class="formula">AV = conta ÷ base × 100</div>
<p>Base da AV: no Balanço, o <b>Ativo total</b> (ou Passivo + PL total); na DRE, a <b>Receita líquida</b>.</p>
<div class="formula">AH (número-índice) = valor do ano ÷ valor do ano-base × 100</div>
<p>O ano-base vale 100. Índice 125 = aumento de 25%; índice 87,5 = redução de 12,5%.</p>
<div class="exemplo"><b>Exemplo:</b><table class="tabela"><thead><tr><th>Conta</th><th>X1</th><th>AV</th><th>X2</th><th>AV</th><th>AH</th></tr></thead><tbody>
<tr><td>Caixa</td><td>20.000</td><td>10%</td><td>30.000</td><td>12%</td><td>150</td></tr>
<tr><td>Estoques</td><td>80.000</td><td>40%</td><td>70.000</td><td>28%</td><td>87,5</td></tr>
<tr><td>Imobilizado</td><td>100.000</td><td>50%</td><td>150.000</td><td>60%</td><td>150</td></tr>
<tr><td><b>Ativo total</b></td><td>200.000</td><td>100%</td><td>250.000</td><td>100%</td><td>125</td></tr></tbody></table>
Leitura: o caixa cresceu 50% (AH 150) e passou a pesar 12% do ativo (AV). O estoque caiu 12,5% (AH 87,5).</div>
<p><b>AH encadeada</b> compara sempre com o mesmo ano-base; <b>AH anual</b> compara com o ano anterior. Receita de 200, 250 e 300: encadeada = 100, 125, 150; anual = —, 125, 120. Cresceu 50% no período, mas só 20% no último ano.</p>
<div class="caixa alerta"><b>Pegadinha (base negativa ou zero):</b> prejuízo de R$ 20.000 em X1 e lucro de R$ 10.000 em X2. A conta 10.000 ÷ (−20.000) dá um índice negativo que sugere piora, mas houve melhora. Com base negativa ou zero, a AH em % <b>perde o sentido</b>: informe a variação em valor (+R$ 30.000).</div>`,
    },
    {
      titulo: 'Índices de liquidez',
      html: `<p>Vamos usar a <b>Cia. Aurora</b> nesta lição toda:</p>
<table class="tabela"><thead><tr><th>Ativo</th><th>R$</th><th>Passivo + PL</th><th>R$</th></tr></thead><tbody>
<tr><td>Disponível</td><td>20.000</td><td>Fornecedores</td><td>40.000</td></tr>
<tr><td>Clientes</td><td>50.000</td><td>Salários e impostos</td><td>10.000</td></tr>
<tr><td>Estoques</td><td>60.000</td><td>Empréstimos CP</td><td>30.000</td></tr>
<tr><td><b>AC</b></td><td><b>130.000</b></td><td><b>PC</b></td><td><b>80.000</b></td></tr>
<tr><td>Realizável a LP</td><td>20.000</td><td>PNC</td><td>70.000</td></tr>
<tr><td>Invest. + Imob. + Intang.</td><td>150.000</td><td>PL</td><td>150.000</td></tr>
<tr><td><b>Total</b></td><td><b>300.000</b></td><td><b>Total</b></td><td><b>300.000</b></td></tr></tbody></table>
<div class="formula">LC = AC ÷ PC</div>
<div class="formula">LS = (AC − Estoques) ÷ PC</div>
<div class="formula">LI = Disponível ÷ PC</div>
<div class="formula">LG = (AC + RLP) ÷ (PC + PNC)</div>
<div class="exemplo"><b>Exemplo (Aurora):</b> LC = 130.000 ÷ 80.000 ≈ <b>1,63</b> · LS = 70.000 ÷ 80.000 ≈ <b>0,88</b> · LI = 20.000 ÷ 80.000 = <b>0,25</b> · LG = 150.000 ÷ 150.000 = <b>1,00</b>.<br>Leitura: há R$ 1,63 de AC para cada R$ 1 de PC, mas sem vender estoque ela só cobre 88% do PC.</div>
<p>Todos os índices de liquidez são <b>quanto maior, melhor</b>. Liquidez alta demais, porém, pode indicar dinheiro parado, sem render.</p>
<div class="caixa alerta"><b>Pegadinhas:</b> a seca <b>exclui os estoques</b> (alguns autores excluem também as despesas antecipadas, que não viram dinheiro). A imediata usa só o <b>disponível</b> (caixa, bancos e equivalentes de caixa), e não os clientes. A geral é a única que olha o <b>longo prazo</b>.</div>`,
    },
    {
      titulo: 'Endividamento e estrutura de capital',
      html: `<p>Capital de terceiros: <b>CT = PC + PNC</b>. Capital próprio: <b>PL</b>. Aqui a leitura é <b>quanto menor, melhor</b>, porque menos dívida significa menos risco.</p>
<table class="tabela"><thead><tr><th>Índice</th><th>Fórmula</th><th>Aurora</th></tr></thead><tbody>
<tr><td>Participação de capital de terceiros (PCT)</td><td>CT ÷ PL</td><td>150 ÷ 150 = <b>100%</b></td></tr>
<tr><td>Endividamento geral</td><td>CT ÷ Ativo total</td><td>150 ÷ 300 = <b>50%</b></td></tr>
<tr><td>Composição do endividamento</td><td>PC ÷ CT</td><td>80 ÷ 150 ≈ <b>53,3%</b></td></tr>
<tr><td>Imobilização do PL</td><td>(ANC − RLP) ÷ PL</td><td>150 ÷ 150 = <b>100%</b></td></tr>
<tr><td>Imobilização dos recursos não correntes</td><td>(ANC − RLP) ÷ (PL + PNC)</td><td>150 ÷ 220 ≈ <b>68,2%</b></td></tr></tbody></table>
<p><b>ANC − RLP</b> = Investimentos + Imobilizado + Intangível (o "ativo fixo").</p>
<div class="exemplo"><b>Leitura (Aurora):</b> para cada R$ 1 dos sócios há R$ 1 de terceiros (PCT 100%). Mais da metade da dívida vence no curto prazo (53,3%). O PL inteiro está aplicado no ativo fixo (IPL 100%): não sobra capital próprio para o giro, que é bancado por terceiros.</div>
<div class="caixa alerta"><b>Pegadinhas:</b> PCT usa o <b>PL</b> no denominador; endividamento geral usa o <b>Ativo total</b>. A composição do endividamento é <b>quanto menor, melhor</b> (dívida no longo prazo dá fôlego). Imobilização do PL acima de 100% significa que o ativo fixo é financiado em parte por terceiros.</div>`,
    },
    {
      titulo: 'Rentabilidade e o modelo Du Pont',
      html: `<div class="formula">Margem líquida = LL ÷ Vendas líquidas</div>
<div class="formula">Giro do ativo = Vendas líquidas ÷ Ativo</div>
<div class="formula">ROA = LL ÷ Ativo  ·  ROE = LL ÷ PL</div>
<p>Todos: <b>quanto maior, melhor</b>. Na prova, use ativo e PL <b>médios</b> se a questão der os saldos inicial e final; senão, use o saldo dado.</p>
<div class="formula">ROA = Margem × Giro</div>
<div class="formula">ROE = Margem × Giro × (Ativo ÷ PL)</div>
<div class="exemplo"><b>Exemplo (Aurora):</b> receita líquida 600.000; lucro líquido 30.000.<br>Margem = 30.000 ÷ 600.000 = 5% · Giro = 600.000 ÷ 300.000 = 2,0<br>ROA = 5% × 2 = <b>10%</b> (= 30.000 ÷ 300.000)<br>Multiplicador = 300.000 ÷ 150.000 = 2 → ROE = 10% × 2 = <b>20%</b> (= 30.000 ÷ 150.000).</div>
<p>O Du Pont mostra <b>de onde vem</b> o retorno: margem (ganha muito por venda), giro (vende muito com pouco ativo) ou alavancagem (usa capital de terceiros).</p>
<p><b>Grau de alavancagem financeira:</b> GAF = ROE ÷ ROA, com o ROA calculado pelo lucro <b>antes</b> das despesas financeiras. GAF &gt; 1: a dívida rende mais do que custa e "alavanca" o sócio.</p>
<div class="exemplo"><b>Exemplo (sem IR):</b> ativo 1.000; PL 600; dívida 400 a 10% (juros 40). Lucro operacional 150 → ROA = 15%. Lucro líquido = 150 − 40 = 110 → ROE = 110 ÷ 600 ≈ 18,3%. GAF ≈ 18,3 ÷ 15 ≈ <b>1,22</b>: a dívida custa 10% e o ativo rende 15%, então a dívida é favorável.</div>
<aside class="nota">Se a questão calcular ROA e ROE com o mesmo lucro líquido, ROE ÷ ROA vira simplesmente Ativo ÷ PL, o multiplicador do Du Pont.</aside>`,
    },
    {
      titulo: 'Prazos médios e ciclos',
      html: `<p>Prazos em <b>dias</b>, com o ano comercial de <mark>360 dias</mark>, salvo se a questão disser outra coisa. Use saldos médios quando houver inicial e final.</p>
<div class="formula">PMRE = Estoque médio ÷ CMV × 360</div>
<div class="formula">PMRV = Clientes médio ÷ Vendas (a prazo) × 360</div>
<div class="formula">PMPC = Fornecedores médio ÷ Compras (a prazo) × 360</div>
<p>PMRE e PMRV: <b>quanto menor, melhor</b>. PMPC: <b>quanto maior, melhor</b>, porque o fornecedor financia a empresa por mais tempo.</p>
<div class="formula">Ciclo operacional = PMRE + PMRV</div>
<div class="formula">Ciclo financeiro (de caixa) = CO − PMPC</div>
<div class="exemplo"><b>Exemplo (Aurora):</b> CMV 360.000; vendas a prazo 600.000; compras 360.000.<br>PMRE = 60.000 ÷ 360.000 × 360 = <b>60 dias</b><br>PMRV = 50.000 ÷ 600.000 × 360 = <b>30 dias</b><br>PMPC = 40.000 ÷ 360.000 × 360 = <b>40 dias</b><br>CO = 60 + 30 = <b>90 dias</b>; CF = 90 − 40 = <b>50 dias</b>. Durante 50 dias, a operação precisa ser financiada com recursos da própria empresa ou de bancos.</div>
<div class="caixa alerta"><b>Pegadinhas:</b> o PMRE usa o <b>CMV</b>, não as vendas. Se a questão não der as compras, calcule: <b>Compras totais = CMV + EF − EI</b>; para o PMPC, separe as compras a prazo. Giro de estoque = CMV ÷ Estoque médio, e PMRE = 360 ÷ giro. Se o período for mensal, use 30 dias.</div>`,
    },
    {
      titulo: 'Capital de giro: CCL, NCG e tesouraria',
      html: `<div class="formula">CCL = AC − PC</div>
<p>O CCL (capital circulante líquido) positivo indica que recursos de longo prazo (PL + PNC) financiam parte do ativo circulante. Na Aurora: 130.000 − 80.000 = <b>50.000</b>.</p>
<p>No <b>modelo Fleuriet</b> (modelo dinâmico), o circulante é separado em duas partes:</p>
<table class="tabela"><thead><tr><th></th><th>Operacional (cíclico)</th><th>Financeiro (errático)</th></tr></thead><tbody>
<tr><td>Ativo</td><td>ACO: clientes, estoques</td><td>ACF: caixa, aplicações</td></tr>
<tr><td>Passivo</td><td>PCO: fornecedores, salários, impostos</td><td>PCF: empréstimos de CP, duplicatas descontadas, dividendos a pagar</td></tr></tbody></table>
<div class="formula">NCG = ACO − PCO</div>
<div class="formula">Saldo de Tesouraria = ACF − PCF = CCL − NCG</div>
<div class="exemplo"><b>Exemplo (Aurora):</b> NCG = (50.000 + 60.000) − (40.000 + 10.000) = <b>60.000</b>. T = 20.000 − 30.000 = <b>−10.000</b>. Confere: CCL − NCG = 50.000 − 60.000 = −10.000 ✔.<br>A operação pede 60.000 e o CCL cobre só 50.000: os 10.000 restantes vêm de banco no curto prazo.</div>
<table class="tabela"><thead><tr><th>Tipo</th><th>CCL</th><th>NCG</th><th>T</th></tr></thead><tbody>
<tr><td>I — excelente</td><td>+</td><td>−</td><td>+</td></tr>
<tr><td>II — sólida</td><td>+</td><td>+</td><td>+</td></tr>
<tr><td>III — insatisfatória (Aurora)</td><td>+</td><td>+</td><td>−</td></tr>
<tr><td>IV — péssima</td><td>−</td><td>+</td><td>−</td></tr></tbody></table>
<div class="caixa alerta"><b>Efeito tesoura:</b> quando a NCG cresce mais rápido que o CCL, o saldo de tesouraria fica cada vez mais negativo. A empresa vende mais, mas passa a depender cada vez mais de empréstimos de curto prazo.</div>`,
    },
    {
      titulo: 'Pegadinhas: como os fatos mexem na liquidez',
      html: `<p>A FGV adora perguntar o que acontece com o índice depois de um fato. Somar <b>o mesmo valor positivo</b> ao numerador e ao denominador aproxima a razão de <mark>1</mark>; subtrair afasta de 1, desde que o denominador continue positivo. Se a razão já é 1, permanece 1.</p>
<table class="tabela"><thead><tr><th>Fato</th><th>AC e PC</th><th>LC &gt; 1</th><th>LC &lt; 1</th></tr></thead><tbody>
<tr><td>Pagar dívida de curto prazo com caixa</td><td>AC ↓ e PC ↓</td><td><b>sobe</b></td><td>cai</td></tr>
<tr><td>Comprar estoque a prazo</td><td>AC ↑ e PC ↑</td><td><b>cai</b></td><td>sobe</td></tr>
<tr><td>Comprar estoque à vista</td><td>troca dentro do AC</td><td>não muda</td><td>não muda</td></tr>
<tr><td>Receber de cliente</td><td>troca dentro do AC</td><td>não muda</td><td>não muda</td></tr>
<tr><td>Empréstimo de longo prazo (entra caixa)</td><td>só AC ↑</td><td>sobe</td><td>sobe</td></tr>
<tr><td>Comprar imobilizado à vista</td><td>só AC ↓</td><td>cai</td><td>cai</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo:</b> LC = 150 ÷ 100 = 1,5. Paga 50 de fornecedores → 100 ÷ 50 = <b>2,0</b> (subiu).<br>LC = 80 ÷ 100 = 0,8. Paga 40 de fornecedores → 40 ÷ 60 ≈ <b>0,67</b> (caiu).</div>
<div class="caixa alerta">Na <b>compra de estoque a prazo</b>, a liquidez <b>seca cai se seu numerador for positivo; se for zero, permanece zero</b>, porque o estoque não entra no numerador e o PC aumenta. Na <b>compra de estoque à vista</b>, a corrente não muda, mas a seca e a imediata caem. Pagar dívida não altera o CCL (AC e PC caem igual).</div>
<aside class="nota">Se LC = 1, somar ou tirar o mesmo valor em cima e embaixo <b>não muda</b> o índice.</aside>`,
    },
  ],
  demo: {
    titulo: 'Experimento: calculadora de índices',
    instrucao: 'Primeiro faça o palpite. Depois edite o balanço e a DRE da Cia. Aurora, troque de grupo de índices e aplique fatos para comparar antes × depois.',
    montar: montarCalculadora,
  },
  macetes: [
    'Liquidez: <b>quanto maior, melhor</b>. A seca tira os <b>estoques</b>; a imediata usa só o <b>disponível</b>; a geral inclui o <b>longo prazo</b>.',
    'LC &gt; 1 e paga dívida de curto prazo com caixa → a LC <b>sobe</b>. LC &lt; 1 → <b>cai</b>. LC = 1 → não muda.',
    'Endividamento: <b>quanto menor, melhor</b>. CT = PC + PNC; PCT = CT ÷ <b>PL</b>; endividamento geral = CT ÷ <b>Ativo</b>; composição = PC ÷ CT.',
    'Imobilização do PL acima de <b>100%</b> → o sócio não banca sozinho o ativo fixo; entra capital de terceiros.',
    'Du Pont: <b>ROA = margem × giro</b>; <b>ROE = ROA × Ativo ÷ PL</b>.',
    'Prazos com <b>360 dias</b>. PMRE usa <b>CMV</b>; PMRV usa <b>vendas a prazo</b>; PMPC usa <b>compras a prazo</b>. CMV + EF − EI fornece compras totais: separe a parcela a prazo.',
    'CO = PMRE + PMRV; CF = CO − PMPC. Só o <b>PMPC</b> é "quanto maior, melhor".',
    '<b>CCL = NCG + Tesouraria</b>. Tesouraria negativa e piorando = <b>efeito tesoura</b>.',
  ],
  questoes: [
    {
      enunciado: 'A Cia. Beta apresentou no ativo circulante: Disponível R$ 15.000; Clientes R$ 45.000; Estoques R$ 60.000. O passivo circulante era composto por Fornecedores R$ 50.000 e Salários a pagar R$ 30.000. O índice de liquidez seca da companhia é:',
      alternativas: ['1,50.', '0,75.', '0,19.', '0,56.'],
      correta: 1,
      comentario: 'AC = 15.000 + 45.000 + 60.000 = 120.000; PC = 50.000 + 30.000 = 80.000.<br>LS = (AC − Estoques) ÷ PC = (120.000 − 60.000) ÷ 80.000 = <b>0,75</b>.<br>1,50 é a liquidez corrente (120 ÷ 80); 0,19 é a imediata (15 ÷ 80); 0,56 usa só os clientes (45 ÷ 80).',
    },
    {
      enunciado: 'Uma empresa possui ativo circulante de R$ 300.000 e passivo circulante de R$ 200.000. Se ela pagar, à vista, R$ 50.000 a fornecedores, o índice de liquidez corrente passará a ser de, aproximadamente:',
      alternativas: ['1,50, pois a operação é permutativa e não altera o índice.', '1,25.', '1,67.', '2,00.'],
      correta: 2,
      comentario: 'Antes: 300.000 ÷ 200.000 = 1,50. Depois: AC = 300.000 − 50.000 = 250.000; PC = 200.000 − 50.000 = 150.000.<br>LC = 250.000 ÷ 150.000 ≈ <b>1,67</b>. Com LC acima de 1, subtrair o mesmo valor de cima e de baixo aumenta o índice.<br>1,25 reduz só o AC; 2,00 reduz só o PC. Ser permutativo não impede o índice de mudar.',
    },
    {
      enunciado: 'Uma entidade apresenta Ativo total de R$ 500.000, Passivo Circulante de R$ 120.000, Passivo Não Circulante de R$ 80.000 e Patrimônio Líquido de R$ 300.000. Os índices de participação de capital de terceiros (CT/PL) e de composição do endividamento (PC/CT) são, respectivamente:',
      alternativas: ['40,0% e 60,0%.', '66,7% e 24,0%.', '150,0% e 60,0%.', '66,7% e 60,0%.'],
      correta: 3,
      comentario: 'CT = 120.000 + 80.000 = 200.000.<br>PCT = CT ÷ PL = 200.000 ÷ 300.000 ≈ <b>66,7%</b>.<br>Composição = PC ÷ CT = 120.000 ÷ 200.000 = <b>60,0%</b>.<br>40% é o endividamento geral (CT ÷ Ativo); 24% divide o PC pelo Ativo; 150% inverte a fórmula (PL ÷ CT).',
    },
    {
      enunciado: 'Uma companhia tem Patrimônio Líquido de R$ 400.000 e Ativo Não Circulante de R$ 520.000, assim composto: Realizável a Longo Prazo R$ 40.000; Investimentos R$ 80.000; Imobilizado R$ 350.000; Intangível R$ 50.000. O índice de imobilização do patrimônio líquido e sua interpretação são:',
      alternativas: ['130,0%, indicando que todo o ativo não circulante foi financiado com capital próprio.', '120,0%, indicando que parte dos investimentos, do imobilizado e do intangível foi financiada com capital de terceiros.', '87,5%, indicando sobra de capital próprio para financiar o ativo circulante.', '120,0%, indicando que sobra capital próprio para financiar o capital de giro.'],
      correta: 1,
      comentario: 'IPL = (ANC − RLP) ÷ PL = (520.000 − 40.000) ÷ 400.000 = 480.000 ÷ 400.000 = <b>120%</b>.<br>Como passa de 100%, o PL não basta para o ativo fixo: a diferença (R$ 80.000) é financiada por terceiros, e não sobra capital próprio para o giro.<br>130% esquece de tirar o RLP; 87,5% usa só o imobilizado.',
    },
    {
      enunciado: 'Uma empresa apresentou margem líquida de 8% e giro do ativo de 1,5. Sabendo que 60% do ativo é financiado por capital próprio, o retorno sobre o patrimônio líquido (ROE), pelo modelo Du Pont, é de:',
      alternativas: ['12,0%.', '7,2%.', '18,0%.', '20,0%.'],
      correta: 3,
      comentario: 'ROA = margem × giro = 8% × 1,5 = 12%.<br>Multiplicador = Ativo ÷ PL = 1 ÷ 0,6 ≈ 1,667.<br>ROE = 12% × 1,667 = <b>20%</b> (ou 12% ÷ 0,6).<br>12% é o ROA; 7,2% multiplica por 0,6 em vez de dividir; 18% multiplica 12% pelo giro de novo.',
    },
    {
      enunciado: 'Considere, para um ano comercial de 360 dias: CMV R$ 720.000; estoque médio R$ 120.000; vendas a prazo R$ 900.000; saldo médio de clientes R$ 150.000; compras a prazo R$ 600.000; saldo médio de fornecedores R$ 50.000. O ciclo financeiro da empresa é de:',
      alternativas: ['120 dias.', '90 dias.', '150 dias.', '60 dias.'],
      correta: 1,
      comentario: 'PMRE = 120.000 ÷ 720.000 × 360 = 60 dias.<br>PMRV = 150.000 ÷ 900.000 × 360 = 60 dias.<br>PMPC = 50.000 ÷ 600.000 × 360 = 30 dias.<br>CO = 60 + 60 = 120 dias; CF = 120 − 30 = <b>90 dias</b>.<br>120 é o ciclo operacional; 150 soma o PMPC em vez de subtrair; 60 é só o PMRE.',
    },
    {
      enunciado: 'A receita líquida de uma empresa passou de R$ 400.000 em X1 para R$ 500.000 em X2, e o lucro líquido passou de R$ 40.000 para R$ 45.000. Com base nas análises horizontal e vertical, é correto afirmar que:',
      alternativas: ['a receita cresceu 25% e a análise vertical mostra que o lucro passou de 10% para 9% da receita.', 'o lucro cresceu 25%, acompanhando a receita, e a margem líquida manteve-se em 10%.', 'a receita cresceu 20% e o lucro cresceu 12,5%.', 'a análise horizontal indica que o lucro representa 9% da receita em X2.'],
      correta: 0,
      comentario: 'AH da receita = 500.000 ÷ 400.000 × 100 = 125 → <b>+25%</b>. AH do lucro = 45.000 ÷ 40.000 × 100 = 112,5 → +12,5%.<br>AV: X1 = 40.000 ÷ 400.000 = <b>10%</b>; X2 = 45.000 ÷ 500.000 = <b>9%</b>.<br>A alternativa dos 20% calcula a variação sobre a base errada (100.000 ÷ 500.000). "Quanto o lucro representa da receita" é análise <b>vertical</b>, não horizontal.',
    },
    {
      enunciado: 'Uma empresa apresenta: Caixa R$ 30.000; Aplicações financeiras de curto prazo R$ 20.000; Clientes R$ 90.000; Estoques R$ 110.000; Fornecedores R$ 70.000; Salários e encargos a pagar R$ 20.000; Empréstimos bancários de curto prazo R$ 80.000. Pelo modelo Fleuriet, a necessidade de capital de giro (NCG) e o saldo de tesouraria são, respectivamente:',
      alternativas: ['R$ 80.000 e R$ 50.000.', 'R$ 110.000 e R$ 30.000.', 'R$ 110.000 e −R$ 30.000.', 'R$ 200.000 e −R$ 30.000.'],
      correta: 2,
      comentario: 'ACO = 90.000 + 110.000 = 200.000; PCO = 70.000 + 20.000 = 90.000 → NCG = <b>110.000</b>.<br>ACF = 30.000 + 20.000 = 50.000; PCF = 80.000 → T = 50.000 − 80.000 = <b>−30.000</b>.<br>Prova real: CCL = 250.000 − 170.000 = 80.000 = NCG + T = 110.000 − 30.000 ✔.<br>80.000 é o CCL e 50.000 é só o ACF; 200.000 é o ACO sem tirar o PCO.',
    },
    {
      enunciado: 'Dados: Ativo Circulante R$ 180.000; Realizável a Longo Prazo R$ 60.000; Imobilizado R$ 260.000; Passivo Circulante R$ 120.000; Passivo Não Circulante R$ 80.000; Patrimônio Líquido R$ 300.000. O índice de liquidez geral é:',
      alternativas: ['1,20.', '1,50.', '2,00.', '0,83.'],
      correta: 0,
      comentario: 'LG = (AC + RLP) ÷ (PC + PNC) = (180.000 + 60.000) ÷ (120.000 + 80.000) = 240.000 ÷ 200.000 = <b>1,20</b>.<br>1,50 é a liquidez corrente (180 ÷ 120); 2,00 divide 240 só pelo PC; 0,83 inverte a fórmula (200 ÷ 240).',
    },
    {
      enunciado: 'Uma empresa tem índice de liquidez corrente igual a 0,80 e ativo circulante, excluídos os estoques, positivo. Se ela adquirir mercadorias para revenda a prazo, com vencimento em 60 dias, os índices de liquidez corrente e de liquidez seca, respectivamente:',
      alternativas: ['aumenta e diminui.', 'diminui e diminui.', 'não se altera e diminui.', 'aumenta e não se altera.'],
      correta: 0,
      comentario: 'AC e PC sobem o mesmo valor. Com LC <b>abaixo de 1</b>, a razão se aproxima de 1 e <b>aumenta</b>. Ex.: AC 80, PC 100 (LC 0,80); compra 20 → 100 ÷ 120 ≈ 0,83.<br>Na seca, o estoque não entra no numerador e o PC aumenta, então ela <b>diminui</b>. Ex.: estoque inicial 30 → LS de 50 ÷ 100 = 0,50 para 50 ÷ 120 ≈ 0,42.',
    },
  ],
  resumo: [
    'AV = conta ÷ base × 100 (base: Ativo total no Balanço; Receita líquida na DRE). AH = valor do ano ÷ valor do ano-base × 100.',
    'Com base negativa ou zero, a AH em % perde o sentido: informe a variação em valor.',
    'Liquidez (quanto maior, melhor): LC = AC ÷ PC; LS = (AC − Estoques) ÷ PC; LI = Disponível ÷ PC; LG = (AC + RLP) ÷ (PC + PNC).',
    'Pagar dívida de curto prazo com caixa: LC sobe se > 1, cai se < 1, não muda se = 1. Compra de estoque a prazo faz o contrário, e a seca cai se seu numerador for positivo; se for zero, permanece zero.',
    'Endividamento (quanto menor, melhor): CT = PC + PNC; PCT = CT ÷ PL; endividamento geral = CT ÷ Ativo; composição = PC ÷ CT.',
    'Imobilização do PL = (Investimentos + Imobilizado + Intangível) ÷ PL; acima de 100%, terceiros financiam parte do ativo fixo.',
    'Margem = LL ÷ Vendas líquidas; Giro = Vendas ÷ Ativo; ROA = LL ÷ Ativo; ROE = LL ÷ PL.',
    'Du Pont: ROA = margem × giro; ROE = margem × giro × (Ativo ÷ PL). GAF = ROE ÷ ROA operacional (antes das despesas financeiras, com base tributária comparável); com retornos positivos, > 1 indica dívida favorável.',
    'PMRE = Estoque ÷ CMV × 360; PMRV = Clientes ÷ Vendas a prazo × 360; PMPC = Fornecedores ÷ Compras a prazo × 360.',
    'Ciclo operacional = PMRE + PMRV; ciclo financeiro = CO − PMPC.',
    'CCL = AC − PC = NCG + Tesouraria; NCG = ACO − PCO; T = ACF − PCF. T negativa e piorando = efeito tesoura.',
  ],
};
