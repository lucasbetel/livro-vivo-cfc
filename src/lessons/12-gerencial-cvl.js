// Lição 12 — Contabilidade Gerencial: custos para decisão (MC, PE, MS, GAO, markup,
// decisões diferenciais, preço de transferência e variações do custo padrão).
// Demo: gráfico CVL à caneta + pilhas 3D (receita × custo total) com sliders.

function montarCVL(el, kit) {
  const { h, fmt, INK, ui, pen, tres, THREE } = kit;
  const reduz = kit.reduzMovimento();
  const QMAX = 5000;
  const INI = { pv: 100, cv: 60, cf: 80000, q: 3000 };
  const NIVEIS = [250000, 500000, 750000, 1000000];
  let s = { ...INI };

  const brl0 = (v) => fmt.brl(v).replace(/,00$/, '');
  const mil = (v) => (v === 0 ? '0' : v >= 1e6 ? `${fmt.num(v / 1e6, 1)} mi` : `${fmt.int(v / 1000)} mil`);
  const un = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? fmt.int(v) : `≈ ${fmt.num(v, 1)}`);
  const calc = () => {
    const mc = s.pv - s.cv;
    const imc = s.pv > 0 ? mc / s.pv : 0;
    const pe = mc > 0 ? s.cf / mc : Infinity;
    const rec = s.pv * s.q, cvt = s.cv * s.q, ct = s.cf + cvt;
    return { mc, imc, pe, rec, cvt, ct, lucro: rec - ct, mcTot: mc * s.q };
  };

  /* ---------- 1) pergunta → palpite ---------- */
  const dica = h('p', { class: 'demo-dica' }, 'Responda o palpite acima para liberar o teste.');
  const msgTeste = h('div', { 'aria-live': 'polite' });
  const btnTeste = h('button', { type: 'button', class: 'btn-caneta primario', disabled: true }, 'Testar: dobrar o custo fixo');
  const btnVolta = h('button', { type: 'button', class: 'btn-caneta' }, 'Voltar ao cenário inicial');
  const prev = ui.previsao({
    pergunta: 'Hoje: preço R$ 100, custo variável R$ 60 por unidade e custo fixo R$ 80.000 → ponto de equilíbrio de 2.000 unidades. <b>Se o custo fixo dobrar</b> (R$ 160.000), o ponto de equilíbrio em unidades…',
    opcoes: ['dobra: vai a 4.000 unidades', 'aumenta, mas menos que o dobro', 'não muda: só o lucro diminui'],
    correta: 0,
    explicacao: 'PE = CF ÷ MCu. A margem por unidade (R$ 40) não mudou, então o PE acompanha o CF na mesma proporção: 160.000 ÷ 40 = <b>4.000 un.</b> Clique em "Testar" e veja o ponto vermelho andar no gráfico.',
    aoResponder: () => { btnTeste.disabled = false; dica.textContent = 'Agora teste o palpite e depois brinque com os controles.'; },
  });

  /* ---------- 2) controles ---------- */
  const ctl = {};
  const mk = (k, rotulo, min, max, passo, formato) => {
    ctl[k] = ui.controle({ rotulo, min, max, passo, valor: s[k], formato, aoMudar: (v) => { s[k] = v; msgTeste.innerHTML = ''; atualizar(); } });
    return ctl[k];
  };
  const controles = h('div', { class: 'demo-painel' },
    mk('pv', 'Preço de venda (un.)', 20, 200, 5, brl0),
    mk('cv', 'Custo variável (un.)', 5, 150, 5, brl0),
    mk('cf', 'Custo fixo total', 10000, 200000, 10000, brl0),
    mk('q', 'Quantidade vendida', 0, QMAX, 100, (v) => `${fmt.int(v)} un.`),
    h('p', { class: 'demo-dica', html: '<b>Desafio:</b> com CV de R$ 60 e CF de R$ 80.000, que preço leva o PE a 1.000 unidades? (Dica: a MCu precisa ser R$ 80.)' }));
  const aplicar = (novo, texto) => {
    s = { ...novo };
    Object.keys(ctl).forEach((k) => ctl[k].definir(s[k]));
    atualizar();
    msgTeste.innerHTML = texto;
  };
  btnTeste.addEventListener('click', () => aplicar({ ...INI, cf: INI.cf * 2 },
    '<p class="ok">Viu? Com CF de R$ 160.000 o PE foi de <b>2.000</b> para <b>4.000 un.</b> A MCu (R$ 40) não mudou, então o PE dobrou junto com o CF. Vendendo as mesmas 3.000 un., agora há <b>prejuízo de R$ 40.000</b> (MC 120.000 − CF 160.000).</p>'));
  btnVolta.addEventListener('click', () => aplicar(INI, '<p>Cenário inicial: PE de 2.000 un., lucro de R$ 40.000 com 3.000 un. vendidas.</p>'));

  /* ---------- 3) gráfico CVL à caneta ---------- */
  const caixaG = h('div', { class: 'cvl-grafico' });
  let g = null, gMax = 0, dyn = [];
  const desenharGrafico = (c) => {
    const topo = Math.max(s.pv * QMAX, s.cf + s.cv * QMAX);
    const ymax = NIVEIS.find((n) => n >= topo) || NIVEIS[NIVEIS.length - 1];
    if (!g || ymax !== gMax) { // escala nova: refaz tudo (raro, 4 níveis)
      caixaG.innerHTML = ''; dyn = []; gMax = ymax;
      const estreito = (el.clientWidth || 640) < 520; // celular: viewBox menor = textos maiores na tela
      g = pen.grafico(caixaG, { largura: estreito ? 440 : 640, altura: 400, margem: 76, xmin: 0, xmax: QMAX, ymin: 0, ymax, marcasX: 5, marcasY: 5, rotuloX: 'quantidade (un.)', rotuloY: 'R$', fmtX: (v) => fmt.int(v), fmtY: mil });
      g.eixos();
    }
    dyn.forEach((n) => n.remove()); dyn = [];
    const A = { animar: false };
    const put = (n) => { dyn.push(n); return n; };
    const fundo = (n) => { g.svg.insertBefore(n, g.svg.firstChild); dyn.push(n); return n; };
    const R = (x) => s.pv * x, CT = (x) => s.cf + s.cv * x;
    const { sx, sy } = g;
    const temPE = c.mc > 0 && c.pe <= QMAX;
    // zonas de prejuízo (antes do PE) e de lucro (depois do PE)
    const xPrej = c.mc > 0 ? Math.min(c.pe, QMAX) : QMAX;
    if (xPrej > 0) fundo(g.poligono([[sx(0), sy(CT(0))], [sx(xPrej), sy(CT(xPrej))], [sx(xPrej), sy(R(xPrej))], [sx(0), sy(R(0))]], { cor: 'transparent', preenchimento: 'rgba(192,57,43,0.30)', espaco: 9, ...A }));
    if (temPE && c.pe < QMAX) fundo(g.poligono([[sx(c.pe), sy(R(c.pe))], [sx(QMAX), sy(R(QMAX))], [sx(QMAX), sy(CT(QMAX))]], { cor: 'transparent', preenchimento: 'rgba(46,125,79,0.30)', espaco: 9, ...A }));
    // retas
    put(g.serie([[0, s.cf], [QMAX, s.cf]], { cor: INK.lapis, reta: true, tracejado: true, ...A }));
    put(g.serie([[0, 0], [QMAX, R(QMAX)]], { cor: INK.azul, reta: true, espessura: 2.6, ...A }));
    put(g.serie([[0, s.cf], [QMAX, CT(QMAX)]], { cor: INK.vermelho, reta: true, espessura: 2.6, ...A }));
    // rótulos das retas, sem encavalar
    const lim = (y) => Math.max(40, Math.min(sy(0) - 10, y));
    const yR = sy(R(QMAX)), yC = sy(CT(QMAX)), xF = sx(QMAX) - 4;
    const recAcima = yR <= yC;
    put(g.texto(xF, lim(recAcima ? yR - 8 : yR + 24), 'receita', { cor: INK.azul, tamanho: 20, ancora: 'end', ...A }));
    put(g.texto(xF, lim(recAcima ? yC + 24 : yC - 8), 'custo total', { cor: INK.vermelho, tamanho: 20, ancora: 'end', ...A }));
    put(g.texto(sx(0) + 8, lim(sy(s.cf) - 8), 'custo fixo', { cor: INK.lapis, tamanho: 17, ...A }));
    // ponto de equilíbrio
    if (temPE) {
      const xp = sx(c.pe), yp = sy(R(c.pe));
      put(g.linha(xp, yp, xp, sy(0), { cor: INK.lapis, tracejado: true, ...A }));
      put(g.circulo(xp, yp, 14, { cor: INK.vermelho, preenchimento: INK.vermelho, estilo: 'solid', ...A }));
      const dir = c.pe > QMAX * 0.6; // rótulo junto ao pé da linha do PE, longe do rótulo de lucro
      put(g.texto(dir ? xp - 8 : xp + 8, sy(0) - 34, `PE ${un(c.pe)} un.`, { cor: INK.vermelho, tamanho: 19, ancora: dir ? 'end' : 'start', peso: 700, ...A }));
    } else {
      const txt = c.mc > 0 ? `PE = ${un(c.pe)} un. (fora do gráfico)` : 'sem PE: margem de contribuição ≤ 0';
      put(g.texto(sx(QMAX * 0.5), sy(gMax * 0.92), txt, { cor: INK.vermelho, tamanho: 19, ancora: 'middle', peso: 700, ...A }));
    }
    // quantidade escolhida: lucro ou prejuízo
    const xq = sx(s.q), yr = sy(R(s.q)), yc = sy(CT(s.q));
    put(g.linha(xq, sy(0), xq, Math.min(yr, yc), { cor: INK.laranja, tracejado: true, ...A }));
    const corRes = c.lucro >= 0 ? INK.verde : INK.vermelho;
    if (Math.abs(yr - yc) > 1) put(g.linha(xq, yr, xq, yc, { cor: corRes, espessura: 5, ...A }));
    const esq = s.q > QMAX * 0.55;
    const txtRes = c.lucro > 0 ? `lucro ${brl0(c.lucro)}` : c.lucro < 0 ? `prejuízo ${brl0(-c.lucro)}` : 'lucro zero (no PE)';
    put(g.texto(esq ? xq - 10 : xq + 10, lim((yr + yc) / 2 + 6), txtRes, { cor: corRes, tamanho: 19, ancora: esq ? 'end' : 'start', peso: 700, ...A }));
    put(g.texto(xq, sy(0) - 8, `q = ${fmt.int(s.q)}`, { cor: INK.laranja, tamanho: 16, ancora: 'middle', ...A }));
  };

  /* ---------- 4) resultado (números) ---------- */
  const resultado = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const escreverResultado = (c) => {
    const peTxt = c.mc > 0 ? `${un(c.pe)} un. = ${brl0(c.pe * s.pv)} de receita` : '<span class="nok">não existe com CF positivo: MC ≤ 0 (MC zero não cobre fixos; MC negativa aumenta o prejuízo)</span>';
    let msTxt = '—', gaoTxt = '—';
    if (c.mc > 0 && s.q === 0) msTxt = 'sem vendas';
    else if (c.mc > 0) {
      const msUn = s.q - c.pe;
      msTxt = msUn >= 0
        ? `${un(msUn)} un. = ${brl0(msUn * s.pv)} = ${fmt.pct((msUn / s.q) * 100)} das vendas`
        : `<span class="nok">negativa: faltam ${un(-msUn)} un. para chegar ao PE</span>`;
      gaoTxt = c.lucro > 0
        ? `<b>${fmt.num(c.mcTot / c.lucro, 2)}</b> (MC ${brl0(c.mcTot)} ÷ lucro ${brl0(c.lucro)} = 1 ÷ MS%)`
        : c.lucro === 0 ? 'indefinido: exatamente no PE' : `${fmt.num(c.mcTot / c.lucro, 2)}: há prejuízo; não interpretar como amplificação de lucro positivo`;
    }
    const cls = c.lucro >= 0 ? 'ok' : 'nok';
    const nome = c.lucro > 0 ? `lucro ${brl0(c.lucro)}` : c.lucro < 0 ? `prejuízo ${brl0(-c.lucro)}` : 'lucro zero';
    resultado.innerHTML = `<p>Vendendo <b>${fmt.int(s.q)} un.</b>: receita ${brl0(c.rec)} − custo total ${brl0(c.ct)} = <b class="${cls}">${nome}</b></p>`;
    resultado.append(ui.tabela(['Indicador', 'Valor'], [
      ['MC unitária', `${brl0(c.mc)} (índice de MC ${fmt.pct(c.imc * 100)})`],
      ['Ponto de equilíbrio contábil', peTxt],
      ['Margem de segurança', msTxt],
      ['GAO', gaoTxt],
    ]));
  };

  /* ---------- 5) visão 3D: receita × custo total ---------- */
  const caixa3d = h('div', { class: 'cvl-3d' });
  const legenda = h('p', { class: 'demo-dica', html: '<b>Visão 3D</b> na quantidade escolhida: <span style="color:#2f5ea8">■</span> receita · <span style="color:#8f8f8f">■</span> custo fixo · <span style="color:#c0392b">■</span> custo variável · <span style="color:#2e7d4f">■</span> lucro (o que sobra) · <span style="color:#d9822b">■</span> prejuízo (o que falta). Arraste para girar.' });

  el.append(prev,
    h('div', { class: 'demo-painel' }, dica, h('div', { class: 'demo-linha' }, btnTeste, btnVolta), msgTeste),
    controles, caixaG, resultado, legenda, caixa3d);

  const p = tres.palco3d(caixa3d, { altura: 330, camera: [0, 3.2, 10], alvo: [0, 2.4, 0] });
  const { cena } = p;
  const Y0 = 0.16, H = 4.2, XR = -1.2, XC = 1.2;
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.4, Y0, 2.4), tres.mat3d(0xe9dcc0));
  base.position.y = Y0 / 2; base.receiveShadow = true; cena.add(base);
  const bloco = (cor, x, extra) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 1.4), tres.mat3d(cor, extra));
    m.castShadow = true; m.scale.y = 0.001; m.position.x = x; cena.add(m); return m;
  };
  const bRec = bloco(0x2f5ea8, XR);
  const bPrej = bloco(0xd9822b, XR, { transparent: true, opacity: 0.45 });
  const bCF = bloco(0x8f8f8f, XC);
  const bCV = bloco(0xc0392b, XC);
  const bLucro = bloco(0x2e7d4f, XC, { transparent: true, opacity: 0.55 });
  const sprites = { r: null, c: null, x: null };
  const trocarRotulo = (chave, txt, cor) => {
    const velho = sprites[chave];
    if (velho) { cena.remove(velho); velho.material.map.dispose(); velho.material.dispose(); }
    const sp = tres.rotulo3d(txt, { cor, tamanho: 48, escala: 0.75 });
    cena.add(sp); sprites[chave] = sp;
  };
  let alvo3 = { rec: 0, cf: 0, cvt: 0, K: H / 500000 };
  const m3 = { ...alvo3 };
  let sujo = true, tRot = -1;
  p.aoQuadro((dt, t) => {
    const k = reduz ? 1 : 0.12;
    Object.keys(m3).forEach((key) => { m3[key] += (alvo3[key] - m3[key]) * k; });
    if (sujo && t - tRot > 0.12) { // recria rótulos no máximo ~8x por segundo
      sujo = false; tRot = t;
      const c = calc();
      trocarRotulo('r', `Receita\n${brl0(c.rec)}`, '#1f3a68');
      trocarRotulo('c', `Custo total\n${brl0(c.ct)}`, '#7a2418');
      trocarRotulo('x', c.lucro > 0 ? `LUCRO ${brl0(c.lucro)}` : c.lucro < 0 ? `PREJUÍZO ${brl0(-c.lucro)}` : 'EQUILÍBRIO: lucro zero', c.lucro >= 0 ? '#2e7d4f' : '#c0392b');
    }
    const e = 0.001;
    const hR = m3.rec * m3.K, hF = m3.cf * m3.K, hV = m3.cvt * m3.K;
    const dif = hR - hF - hV, hL = Math.max(0, dif), hP = Math.max(0, -dif);
    bRec.scale.y = Math.max(e, hR); bRec.position.y = Y0 + hR / 2;
    bPrej.scale.y = Math.max(e, hP); bPrej.position.y = Y0 + hR + hP / 2;
    bCF.scale.y = Math.max(e, hF); bCF.position.y = Y0 + hF / 2;
    bCV.scale.y = Math.max(e, hV); bCV.position.y = Y0 + hF + hV / 2;
    bLucro.scale.y = Math.max(e, hL); bLucro.position.y = Y0 + hF + hV + hL / 2;
    const topo = Y0 + Math.max(hR, hF + hV);
    if (sprites.r) sprites.r.position.set(XR, topo + 0.55, 0);
    if (sprites.c) sprites.c.position.set(XC, topo + 0.55, 0);
    if (sprites.x) sprites.x.position.set(0, topo + 1.4, 0);
  });

  function atualizar() {
    const c = calc();
    desenharGrafico(c);
    escreverResultado(c);
    alvo3 = { rec: c.rec, cf: s.cf, cvt: c.cvt, K: H / gMax };
    sujo = true;
  }
  atualizar();
  return () => p.destruir();
}

export default {
  id: '12-gerencial-cvl',
  numero: 12,
  disciplina: 'Contabilidade Gerencial',
  titulo: 'Custos para decisão: margem e ponto de equilíbrio',
  subtitulo: 'Quanto cada venda paga da conta — e quando a conta fecha',
  incidencia: 'alta',
  tempo: 55,
  pergunta: 'Por que vender abaixo do "custo" às vezes aumenta o lucro — e quantas unidades é preciso vender para não ter prejuízo?',
  previsao: {
    pergunta: 'Uma fábrica com capacidade ociosa produz um item com custo total de R$ 50 por unidade (R$ 30 variáveis + R$ 20 de fixos rateados). Um cliente novo oferece R$ 40 por unidade num pedido extra, sem afetar as vendas normais. Aceitar o pedido…',
    opcoes: ['reduz o lucro em R$ 10 por unidade', 'aumenta o lucro em R$ 10 por unidade', 'não altera o lucro'],
    correta: 1,
    explicacao: 'Os R$ 20 de fixos já existem e não mudam com o pedido extra. Cada unidade nova traz R$ 40 e custa só os R$ 30 variáveis: <b>margem de contribuição de R$ 10</b>, que vai direto para o lucro. Decisão gerencial olha o que <b>muda</b>, não o custo "cheio".',
  },
  paginas: [
    {
      titulo: 'Custos × volume e a margem de contribuição',
      html: `<p>Antes de decidir qualquer coisa, separe os gastos pelo <b>comportamento diante do volume</b>:</p>
<table class="tabela"><thead><tr><th>Produção</th><th>CF total</th><th>CF por un.</th><th>CV por un.</th><th>CV total</th></tr></thead><tbody>
<tr><td>1.000 un.</td><td>R$ 20.000</td><td>R$ 20,00</td><td>R$ 8,00</td><td>R$ 8.000</td></tr>
<tr><td>2.000 un.</td><td>R$ 20.000</td><td>R$ 10,00</td><td>R$ 8,00</td><td>R$ 16.000</td></tr>
<tr><td>4.000 un.</td><td>R$ 20.000</td><td>R$ 5,00</td><td>R$ 8,00</td><td>R$ 32.000</td></tr></tbody></table>
<div class="caixa alerta"><b>Pegadinha clássica:</b> o custo fixo é fixo no <b>total</b>, mas o <b>unitário cai</b> quando a produção sobe. O variável é o contrário: o <b>total varia</b> e o unitário é constante. Tudo isso vale dentro da <b>faixa relevante</b> (a capacidade instalada atual).</div>
<p>Há ainda os <b>semivariáveis</b> (parte fixa + parte variável, como a energia com demanda contratada) e os <b>semifixos</b>, ou em degraus (fixos até certo volume, depois saltam, como um supervisor a mais para cada turno extra).</p>
<p>A <mark>margem de contribuição (MC)</mark> é quanto cada unidade vendida deixa para pagar os fixos e gerar lucro:</p>
<div class="formula">MCu = Preço − custos variáveis − despesas variáveis</div>
<div class="formula">MC total = MCu × quantidade · Índice de MC = MCu ÷ Preço</div>
<div class="exemplo"><b>Exemplo:</b> preço R$ 50; custo variável R$ 22; comissão de 10% (R$ 5). MCu = 50 − 22 − 5 = <b>R$ 23</b>; índice = 23 ÷ 50 = <b>46%</b>. Vendendo 1.000 un. com fixos de R$ 15.000: 23.000 − 15.000 = <b>lucro de R$ 8.000</b>.</div>
<aside class="nota">Comissões, tributos sobre a venda e frete de entrega são <b>despesas variáveis</b>: entram na MC mesmo não sendo custo de produção.</aside>`,
    },
    {
      titulo: 'Fator limitante e custos fixos identificados',
      html: `<p>Sem restrição de capacidade, quanto maior a MCu, melhor o produto. Mas quando algo falta (horas-máquina, matéria-prima, espaço), o critério muda:</p>
<div class="formula">MC por fator = MCu ÷ consumo do fator por unidade</div>
<table class="tabela"><thead><tr><th>Produto</th><th>MCu</th><th>Horas/un.</th><th>MC por hora</th><th>Demanda</th></tr></thead><tbody>
<tr><td>A</td><td>R$ 30</td><td>3 h</td><td>R$ 10</td><td>200 un.</td></tr>
<tr><td>B</td><td>R$ 24</td><td>2 h</td><td>R$ 12</td><td>250 un.</td></tr>
<tr><td>C</td><td>R$ 15</td><td>1 h</td><td><mark>R$ 15</mark></td><td>400 un.</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo (1.200 horas disponíveis):</b> ordem C → B → A. C: 400 un. × 1 h = 400 h. B: 250 × 2 = 500 h (acumulado 900 h). Sobram 300 h ÷ 3 = 100 un. de A. MC total = 400 × 15 + 250 × 24 + 100 × 30 = <b>R$ 15.000</b>. Repare: A tem a <i>maior</i> MCu e ficou por último.</div>
<p><b>MC e custos fixos identificados.</b> Alguns fixos pertencem a um produto ou a uma linha (supervisor exclusivo, máquina dedicada, propaganda específica). Descontando esses fixos da MC, chega-se à <mark>margem direta</mark> (ou segunda margem de contribuição):</p>
<div class="formula">Margem direta = MC total − custos fixos identificados</div>
<div class="exemplo"><b>Exemplo:</b> supondo que os fixos próprios sejam evitáveis ao eliminar a linha, Z tem MC de R$ 40.000 e fixos próprios de R$ 25.000 → margem direta de R$ 15.000. Depois do rateio de R$ 20.000 de fixos comuns, Z mostra prejuízo de R$ 5.000. Eliminar Z? <span class="caneta-vermelha">Não!</span> Os R$ 20.000 comuns continuam existindo e a empresa perderia os R$ 15.000 com que Z contribui: o lucro total <b>cairia R$ 15.000</b>.</div>
<div class="caixa alerta">A FGV adora o produto "deficitário depois do rateio". Decida pela <b>margem direta</b>: se ela for positiva, a linha ajuda a pagar os fixos comuns.</div>`,
    },
    {
      titulo: 'Ponto de equilíbrio contábil, econômico e financeiro',
      html: `<p>O ponto de equilíbrio (PE) é a quantidade em que a MC total paga exatamente os custos e as despesas fixos. Nesse ponto, o lucro é zero.</p>
<div class="formula">PE contábil (un.) = CF ÷ MCu · PE (R$) = CF ÷ índice de MC</div>
<div class="formula">PE econômico = (CF + lucro desejado ou custo de oportunidade) ÷ MCu</div>
<div class="formula">PE financeiro = (CF − depreciação e outros não desembolsáveis + amortizações do principal de dívidas não incluídas nos custos, pagas no período) ÷ MCu</div>
<div class="exemplo"><b>Exemplo:</b> preço R$ 100; CV R$ 60 → MCu R$ 40 (índice 40%). CF de R$ 80.000, dos quais R$ 20.000 são depreciação. Os sócios exigem R$ 12.000 de remuneração do capital próprio.<br>
• PE contábil = 80.000 ÷ 40 = <b>2.000 un.</b> (= 80.000 ÷ 0,40 = R$ 200.000)<br>
• PE econômico = (80.000 + 12.000) ÷ 40 = <b>2.300 un.</b><br>
• PE financeiro = (80.000 − 20.000) ÷ 40 = <b>1.500 un.</b></div>
<p>Se o lucro desejado vier <b>líquido de IR</b>, primeiro converta para antes do IR: lucro antes do IR = lucro líquido ÷ (1 − alíquota). Ex.: R$ 9.000 líquidos com IR de 25% → 9.000 ÷ 0,75 = R$ 12.000 → os mesmos 2.300 un.</p>
<div class="caixa alerta"><b>Pegadinhas:</b> (1) no PE financeiro, a depreciação <b>sai</b>, pois não é desembolso, e a amortização de empréstimo do período <b>entra</b>, se a questão citar; (2) lucro após o IR nunca se soma direto ao CF; (3) com vários produtos, use a MC <b>média ponderada pelo mix</b>.</div>
<aside class="nota">Mix: 60% de A (MCu 30) e 40% de B (MCu 20) → MC média = 0,6 × 30 + 0,4 × 20 = 26. CF de 52.000 → PE de 2.000 un.: 1.200 de A + 800 de B.</aside>`,
    },
    {
      titulo: 'Margem de segurança e alavancagem operacional',
      html: `<p><b>Margem de segurança (MS)</b>: quanto as vendas podem cair antes de a empresa entrar no prejuízo.</p>
<div class="formula">MS = vendas atuais − vendas no PE · MS% = MS ÷ vendas atuais</div>
<p><b>Grau de alavancagem operacional (GAO)</b>: quantas vezes o lucro varia, em %, para cada 1% de variação nas vendas. Quem cria a alavanca são os <b>custos fixos</b>.</p>
<div class="formula">GAO = MC total ÷ Lucro operacional = %Δ lucro ÷ %Δ vendas = 1 ÷ MS%</div>
<div class="exemplo"><b>Exemplo</b> (MCu 40, CF 80.000, PE 2.000 un.), vendendo 3.000 un.:<br>
• MS = 3.000 − 2.000 = 1.000 un. = R$ 100.000 = <b>33,3%</b><br>
• MC total = 120.000; lucro = 120.000 − 80.000 = 40.000 → GAO = 120.000 ÷ 40.000 = <b>3</b> (= 1 ÷ 0,333)<br>
• Vendas +10% (3.300 un.) → lucro +30%: MC 132.000 − 80.000 = <b>52.000</b> ✓</div>
<table class="tabela"><thead><tr><th>MS%</th><th>50%</th><th>25%</th><th>20%</th><th>10%</th></tr></thead><tbody><tr><td><b>GAO</b></td><td>2</td><td>4</td><td>5</td><td>10</td></tr></tbody></table>
<div class="caixa alerta"><b>Pegadinha:</b> o GAO não é constante. Ele é calculado a partir do volume de partida e, quanto mais perto do PE, maior fica (no PE ele "explode"). Empresa com muito custo fixo tem GAO alto: ganha mais na alta e sofre mais na queda.</div>`,
    },
    {
      titulo: 'Formação do preço de venda: o markup',
      html: `<p>Na formação do preço a partir do custo, os percentuais que incidem <b>sobre o preço</b> (tributos sobre vendas, comissões, despesas em % da receita e lucro desejado) entram no <mark>markup</mark>:</p>
<div class="formula">Markup divisor = 1 − (%tributos + %despesas + %lucro)</div>
<div class="formula">Preço = Custo ÷ markup divisor = Custo × markup multiplicador</div>
<div class="exemplo"><b>Exemplo:</b> custo unitário de R$ 60; tributos de 20%, comissão de 5%, despesas administrativas de 10% e lucro de 15%, todos sobre o preço. Soma = 50% → divisor 0,50 → <b>preço R$ 120</b> (multiplicador = 1 ÷ 0,5 = 2,0).<br>
Prova real: 50% de 120 = 60 para tributos, comissão, despesas e lucro; 120 − 60 = 60 = custo ✓. O lucro é 15% × 120 = R$ 18.</div>
<div class="caixa alerta"><b>Erro que a banca põe nas alternativas:</b> 60 × 1,50 = R$ 90. Esse preço não fecha: 50% de 90 = 45 e sobrariam só 45 para cobrir um custo de 60. Percentual sobre o preço se resolve <b>dividindo</b>.</div>
<p>Outras bases de preço: <b>custo pleno + margem</b> (cobre tudo, inclusive as despesas), <b>custo variável + margem</b> (decisões de curto prazo, pedido especial) e <b>preço de mercado</b>, do qual se tira o <b>custo-meta</b> (target costing): custo máximo = preço aceito pelo mercado − margem desejada.</p>
<aside class="nota">ICMS, PIS e Cofins calculados "por dentro" também entram no divisor, porque são percentuais do preço.</aside>`,
    },
    {
      titulo: 'Decisões: comprar ou fabricar, oportunidade, perdidos e imputados',
      html: `<p>Numa decisão só importam os <mark>custos e receitas diferenciais</mark>: os futuros, que mudam de uma alternativa para outra.</p>
<table class="tabela"><thead><tr><th>Conceito</th><th>O que é</th><th>Entra na decisão?</th></tr></thead><tbody>
<tr><td><b>Custo perdido (sunk)</b></td><td>já incorrido e irrecuperável: o valor pago pela máquina antiga</td><td>Não</td></tr>
<tr><td><b>Custo de oportunidade</b></td><td>benefício da melhor alternativa abandonada: o aluguel que se deixa de receber</td><td>Sim, mesmo sem registro contábil</td></tr>
<tr><td><b>Custo imputado</b></td><td>atribuído sem desembolso, só para fins gerenciais: aluguel do imóvel próprio, remuneração do capital próprio</td><td>Sim, na análise gerencial</td></tr>
<tr><td><b>Custo evitável</b></td><td>desaparece se a atividade for eliminada</td><td>Sim</td></tr>
<tr><td><b>Fixo comum rateado</b></td><td>continua existindo qualquer que seja a escolha</td><td>Não</td></tr></tbody></table>
<div class="exemplo"><b>Comprar ou fabricar:</b> 10.000 componentes por ano. Fabricar: MD 12 + MOD 8 + CIF variável 5 + CIF fixo rateado 10 (que continua mesmo se a empresa comprar). Fornecedor: R$ 30.<br>
• Custo relevante de fabricar = 12 + 8 + 5 = R$ 25 → 250.000, contra 300.000 de compra → <b>fabricar</b> economiza R$ 50.000.<br>
• Mas, se a área liberada pudesse ser alugada por R$ 60.000/ano, fabricar "custa" 250.000 + 60.000 = 310.000 → <b>comprar</b> passa a ser melhor em R$ 10.000.</div>
<div class="exemplo"><b>Pedido especial</b> (com capacidade ociosa e sem afetar o preço normal): custo total de R$ 50 (30 variáveis + 20 fixos rateados) e oferta de R$ 40. Aceite: cada unidade traz MC de 40 − 30 = <b>R$ 10</b> e os fixos não mudam.</div>
<div class="caixa alerta">Fique de olho no custo fixo que <b>não some</b> (irrelevante), no aluguel ou na receita que se perde (custo de oportunidade, relevante) e na capacidade ociosa: sem ela, o pedido especial desloca vendas normais e a MC perdida vira custo da decisão.</div>`,
    },
    {
      titulo: 'ABC gerencial, rentabilidade e preço de transferência',
      html: `<p><b>ABC na gestão (ABM).</b> O custeio baseado em atividades rastreia os custos indiretos pelas <b>atividades</b> que os consomem, usando <b>direcionadores</b> de recursos e de atividades. Na gestão, ele revela produtos e clientes que parecem lucrativos mas consomem muitas atividades caras, e aponta as atividades que não agregam valor.</p>
<div class="exemplo"><b>Exemplo:</b> a preparação de máquinas (setup) custa R$ 40.000 para 80 setups → R$ 500 por setup. Produto Luxo: 1.000 un. e 60 setups → 30.000 ÷ 1.000 = <b>R$ 30/un.</b> Produto Básico: 9.000 un. e 20 setups → 10.000 ÷ 9.000 ≈ <b>R$ 1,11/un.</b> Rateando pelo volume (40.000 ÷ 10.000 un.), os dois receberiam R$ 4/un.: o Luxo estava <span class="caneta-vermelha">subcusteado</span>.</div>
<p><b>Rentabilidade de produtos, clientes e canais.</b> Compare a MC (e a margem direta) de cada objeto, não o lucro depois de rateios arbitrários. Com os <b>custos de distribuição</b> (frete, comissões, armazenagem, embalagem de transporte, cobrança), a lógica é a mesma: atribua a cada canal, região ou cliente o que ele realmente consome e descubra quem dá retorno.</p>
<p><b>Preço de transferência</b> é o valor pelo qual uma divisão "vende" para outra da mesma empresa. Ele serve para avaliar o desempenho de cada centro de lucro:</p>
<table class="tabela"><thead><tr><th>Base</th><th>Comentário</th></tr></thead><tbody>
<tr><td>Preço de mercado</td><td>a melhor referência quando existe mercado competitivo para o item</td></tr>
<tr><td>Custo (total, variável ou padrão)</td><td>simples; prefira o <b>padrão</b>, para não repassar as ineficiências da vendedora</td></tr>
<tr><td>Custo + margem</td><td>garante lucro à vendedora quando não há mercado</td></tr>
<tr><td>Negociado</td><td>acordado entre os gestores, dentro de uma faixa</td></tr></tbody></table>
<div class="formula">Mínimo da vendedora = custo variável + MC que ela deixa de ganhar · Máximo da compradora = preço de mercado</div>
<aside class="nota">Aqui se trata do preço de transferência <b>gerencial</b>. O preço de transferência fiscal, das operações com partes ligadas no exterior, é outro assunto.</aside>`,
    },
    {
      titulo: 'Custos para controle: variações do custo padrão',
      html: `<p>O <b>custo padrão</b> é a meta de custo por unidade: padrões <b>físicos</b> (kg, horas) × padrões <b>financeiros</b> (R$/kg, R$/h). No controle, o real é comparado com o padrão <mark>ajustado à produção real</mark>.</p>
<div class="formula">Variação total = Real − Padrão (para a produção real)</div>
<div class="formula">Preço = (P real − P padrão) × Q real · Quantidade = (Q real − Q padrão) × P padrão</div>
<p>Para custos, <b>real maior que o padrão = desfavorável (D)</b>; real menor = favorável (F).</p>
<div class="exemplo"><b>Matéria-prima.</b> Padrão: 2 kg × R$ 5,00 = R$ 10/un. Produção real de 1.000 un. → padrão de 2.000 kg = R$ 10.000. Real: 2.100 kg × R$ 5,40 = R$ 11.340.<br>
• Total = 11.340 − 10.000 = <b>1.340 D</b><br>
• Preço = (5,40 − 5,00) × 2.100 = <b>840 D</b> · Quantidade = (2.100 − 2.000) × 5,00 = <b>500 D</b> (840 + 500 = 1.340 ✓)</div>
<p>Em três partes: preço pura (0,40 × 2.000 = 800), quantidade pura (500) e <b>mista</b> = (P real − P padrão) × (Q real − Q padrão) = 0,40 × 100 = 40. Quando a questão pede só duas variações, a mista fica dentro da variação de preço.</p>
<div class="exemplo"><b>Mão de obra direta.</b> Padrão: 0,5 h × R$ 20/h. Produção de 1.000 un. → 500 h = R$ 10.000. Real: 540 h × R$ 19 = R$ 10.260.<br>
• Taxa = (19 − 20) × 540 = <b>540 F</b> · Eficiência = (540 − 500) × 20 = <b>800 D</b> · Total = <b>260 D</b></div>
<div class="caixa alerta"><b>Pegadinhas:</b> (1) o padrão vem da produção <b>real</b>, não da orçada; (2) uma variação de preço favorável pode esconder material pior, que gera variação de quantidade desfavorável; (3) o sinal segue o efeito no lucro: custo acima do padrão é desfavorável.</div>
<aside class="nota">Nos CIF, a análise costuma separar as variações de volume, de eficiência e de custo (orçamento). No Exame, MD e MOD são as mais cobradas.</aside>`,
    },
  ],
  demo: {
    titulo: 'Experimento: o gráfico CVL ao vivo',
    instrucao: 'Primeiro dê seu palpite. Depois teste e mexa nos controles: o gráfico à caneta e as pilhas 3D (receita × custo total) mostram na hora o ponto de equilíbrio, a margem de segurança e o GAO. Arraste a cena 3D para girar.',
    montar: montarCVL,
  },
  macetes: [
    'MC = preço − <b>todos</b> os variáveis (custos + despesas, inclusive comissão e tributos sobre a venda).',
    'PE <b>C</b>ontábil = CF ÷ MCu · <b>E</b>conômico = (CF + lucro desejado) ÷ MCu · <b>F</b>inanceiro = (CF − depreciação) ÷ MCu.',
    'Lucro líquido desejado com IR? Divida por <b>(1 − alíquota)</b> antes de somar ao CF.',
    'Tem restrição? Ordene pela <b>MC por unidade do fator limitante</b>, não pela MCu nem pelo índice de MC.',
    '<b>GAO = MC ÷ Lucro = 1 ÷ MS%</b>. Perto do PE, o GAO dispara.',
    'Markup: percentual sobre o preço se resolve <b>dividindo</b>: preço = custo ÷ (1 − soma dos %).',
    'Na decisão só entra o que <b>muda</b>: custo perdido e fixo comum ficam fora; custo de oportunidade entra.',
    'Variação de padrão: real > padrão = <b>desfavorável</b>. Preço × Q <b>real</b>; quantidade × P <b>padrão</b>.',
  ],
  questoes: [
    {
      enunciado: 'A Cia. Alfa vende um único produto por R$ 80,00 a unidade. O custo variável unitário é de R$ 36,00 e a empresa paga comissão de 5% sobre o preço de venda. Os custos e despesas fixos somam R$ 105.000,00 por mês. O ponto de equilíbrio contábil mensal, em unidades, é de, aproximadamente:',
      alternativas: ['2.386 unidades.', '2.625 unidades.', '2.917 unidades.', '1.313 unidades.'],
      correta: 1,
      comentario: 'Comissão = 5% × 80 = R$ 4 (despesa variável, entra na MC). MCu = 80 − 36 − 4 = <b>R$ 40</b>. PE = 105.000 ÷ 40 = <b>2.625 unidades</b>. Quem esquece a comissão faz 105.000 ÷ 44 ≈ 2.386; dividir pelo CV (2.917) ou pelo preço (1.313) não tem sentido.',
    },
    {
      enunciado: 'Uma indústria vende seu produto por R$ 150,00 e tem custo variável unitário de R$ 90,00. Os custos fixos anuais são de R$ 240.000,00. Os sócios desejam um lucro líquido de R$ 36.000,00 após o Imposto de Renda e a Contribuição Social, cuja alíquota conjunta é de 25% sobre o lucro. A quantidade anual que deve ser vendida é de:',
      alternativas: ['4.000 unidades.', '4.600 unidades.', '4.750 unidades.', '4.800 unidades.'],
      correta: 3,
      comentario: 'MCu = 150 − 90 = 60. Lucro antes do IR = 36.000 ÷ (1 − 0,25) = 48.000. Q = (240.000 + 48.000) ÷ 60 = <b>4.800 unidades</b>. Erros comuns: somar o lucro líquido direto (276.000 ÷ 60 = 4.600) ou fazer 36.000 × 1,25 = 45.000 (285.000 ÷ 60 = 4.750). 4.000 é só o PE contábil.',
    },
    {
      enunciado: 'Uma empresa tem custos e despesas fixos de R$ 180.000,00 por mês, dos quais R$ 30.000,00 referem-se à depreciação. O preço de venda unitário é de R$ 60,00 e o custo variável unitário é de R$ 35,00. Não há amortização de dívidas no período. O ponto de equilíbrio financeiro mensal é de:',
      alternativas: ['6.000 unidades.', '7.200 unidades.', '8.400 unidades.', '2.500 unidades.'],
      correta: 0,
      comentario: 'A depreciação não sai do caixa. PEF = (180.000 − 30.000) ÷ (60 − 35) = 150.000 ÷ 25 = <b>6.000 unidades</b>. O PE contábil seria 180.000 ÷ 25 = 7.200; somar a depreciação (210.000 ÷ 25 = 8.400) é o erro inverso.',
    },
    {
      enunciado: 'A Cia. Beta vende 5.000 unidades por mês a R$ 40,00 cada. O custo variável unitário é de R$ 24,00 e os custos fixos mensais são de R$ 60.000,00. A margem de segurança percentual e o grau de alavancagem operacional (GAO) são, respectivamente:',
      alternativas: ['75% e 1,33.', '33,3% e 3,0.', '25% e 4,0.', '20% e 5,0.'],
      correta: 2,
      comentario: 'MCu = 40 − 24 = 16. PE = 60.000 ÷ 16 = 3.750 un. MS = 5.000 − 3.750 = 1.250 un. → 1.250 ÷ 5.000 = <b>25%</b>. MC total = 5.000 × 16 = 80.000; lucro = 80.000 − 60.000 = 20.000; GAO = 80.000 ÷ 20.000 = <b>4,0</b> (confere: 1 ÷ 0,25 = 4). 75% é o PE sobre as vendas; 33,3% divide a MS pelo PE em vez de pelas vendas.',
    },
    {
      enunciado: 'Uma empresa apresentou os seguintes dados mensais por linha de produto (os custos fixos comuns, de R$ 200.000,00, foram rateados proporcionalmente à receita):<table class="tabela"><thead><tr><th>Linha</th><th>Receita</th><th>Custos variáveis</th><th>Fixos identificados</th><th>Fixos comuns rateados</th></tr></thead><tbody><tr><td>A</td><td>300.000</td><td>180.000</td><td>50.000</td><td>60.000</td></tr><tr><td>B</td><td>200.000</td><td>120.000</td><td>45.000</td><td>40.000</td></tr><tr><td>C</td><td>500.000</td><td>310.000</td><td>90.000</td><td>100.000</td></tr></tbody></table>A diretoria cogita eliminar a linha B, que apresenta prejuízo após o rateio. Se B for eliminada, seus custos fixos identificados desaparecem e os custos fixos comuns permanecem. Nesse caso, o resultado mensal da empresa:',
      alternativas: ['aumenta R$ 5.000,00, passando a lucro de R$ 10.000,00.', 'diminui R$ 35.000,00, passando a prejuízo de R$ 30.000,00.', 'diminui R$ 80.000,00, passando a prejuízo de R$ 75.000,00.', 'não se altera, pois os custos fixos comuns são redistribuídos entre A e C.'],
      correta: 1,
      comentario: 'Margem direta = receita − variáveis − fixos identificados: A = 70.000; <b>B = 200.000 − 120.000 − 45.000 = 35.000</b>; C = 100.000. Lucro atual = 70.000 + 35.000 + 100.000 − 200.000 = 5.000. Sem B: 70.000 + 100.000 − 200.000 = <b>−30.000</b>. O resultado cai os R$ 35.000 da margem direta de B. Os R$ 80.000 seriam a MC de B, mas os fixos identificados de B também somem.',
    },
    {
      enunciado: 'Uma fábrica produz três produtos e dispõe de apenas 3.000 horas-máquina por mês. Os custos fixos não se alteram com o mix produzido.<table class="tabela"><thead><tr><th>Produto</th><th>Preço</th><th>Custo variável unit.</th><th>Horas-máquina/un.</th><th>Demanda máx.</th></tr></thead><tbody><tr><td>X</td><td>R$ 100</td><td>R$ 64</td><td>4 h</td><td>600 un.</td></tr><tr><td>Y</td><td>R$ 80</td><td>R$ 50</td><td>2 h</td><td>500 un.</td></tr><tr><td>Z</td><td>R$ 60</td><td>R$ 36</td><td>3 h</td><td>800 un.</td></tr></tbody></table>Para maximizar o resultado, a quantidade do produto X a ser produzida no mês é de:',
      alternativas: ['600 unidades.', '150 unidades.', '0 (zero) unidade.', '500 unidades.'],
      correta: 3,
      comentario: 'MCu: X = 36, Y = 30, Z = 24. MC por hora: X = 36 ÷ 4 = 9; <b>Y = 30 ÷ 2 = 15</b>; Z = 24 ÷ 3 = 8. Ordem: Y, X, Z. Y: 500 × 2 = 1.000 h; sobram 2.000 h ÷ 4 = <b>500 un. de X</b> (Z fica de fora). MC total = 15.000 + 18.000 = 33.000. Priorizar pela MCu (X primeiro: 600 un.) daria 30.600; priorizar pelo índice de MC (Z, 40%) zeraria X e daria 28.200.',
    },
    {
      enunciado: 'Uma indústria utiliza 8.000 unidades por ano de um componente que ela mesma fabrica, com os seguintes custos unitários: material direto R$ 14,00; mão de obra direta R$ 9,00; custos indiretos variáveis R$ 5,00; custos indiretos fixos rateados R$ 12,00, dos quais 75% continuarão existindo mesmo que a empresa deixe de fabricar o componente. Um fornecedor oferece o componente por R$ 33,00 a unidade e, se a empresa comprar, a área liberada poderá ser alugada por R$ 24.000,00 por ano. A decisão mais vantajosa e seu efeito anual são:',
      alternativas: ['comprar, com economia de R$ 8.000,00.', 'fabricar, com economia de R$ 16.000,00.', 'comprar, com economia de R$ 80.000,00.', 'fabricar, com economia de R$ 40.000,00.'],
      correta: 0,
      comentario: 'Custo evitável de fabricar = 14 + 9 + 5 + 25% × 12 (= 3) = R$ 31/un. → 8.000 × 31 = 248.000. Fabricar também implica abrir mão do aluguel (custo de oportunidade): 248.000 + 24.000 = 272.000. Comprar = 8.000 × 33 = 264.000. <b>Comprar economiza R$ 8.000</b>. Esquecer o aluguel leva a "fabricar, economia de 16.000"; usar o custo cheio de R$ 40 leva aos 80.000.',
    },
    {
      enunciado: 'Sobre os conceitos de custos para tomada de decisão, assinale a alternativa correta.',
      alternativas: ['O valor pago há dois anos por uma máquina hoje obsoleta deve ser considerado na decisão de substituí-la, pois é um custo histórico relevante.', 'O custo de oportunidade é registrado pela contabilidade financeira no momento em que a alternativa é rejeitada.', 'O aluguel atribuído ao imóvel próprio ocupado pela fábrica, calculado apenas para fins gerenciais e sem desembolso, é exemplo de custo imputado.', 'O preço de transferência baseado no custo real é o mais indicado para avaliar a divisão vendedora, pois repassa suas ineficiências à divisão compradora.'],
      correta: 2,
      comentario: 'Custo imputado é atribuído sem desembolso, só para análise gerencial (aluguel do imóvel próprio, remuneração do capital próprio): a afirmação sobre o aluguel do imóvel próprio está <b>correta</b>. O valor pago pela máquina é <b>custo perdido</b> (sunk), irrelevante para a decisão. O custo de oportunidade não é registrado pela contabilidade financeira. Transferir a custo real repassa ineficiências, que é justamente o defeito; se a base for o custo, prefere-se o <b>custo padrão</b>.',
    },
    {
      enunciado: 'O custo unitário de um produto é de R$ 84,00. A empresa trabalha com tributos sobre vendas de 18%, comissão de 4%, despesas administrativas de 8% e margem de lucro desejada de 10%, todos calculados sobre o preço de venda. O preço de venda unitário é de:',
      alternativas: ['R$ 117,60.', 'R$ 210,00.', 'R$ 120,00.', 'R$ 140,00.'],
      correta: 3,
      comentario: 'Soma dos percentuais = 18 + 4 + 8 + 10 = 40%. Markup divisor = 1 − 0,40 = 0,60. Preço = 84 ÷ 0,60 = <b>R$ 140,00</b>. Prova real: 40% × 140 = 56; 140 − 56 = 84 ✓. Os erros: 84 × 1,40 = 117,60 (somou % ao custo); 84 ÷ 0,40 = 210 (dividiu pela soma); 84 ÷ 0,70 = 120 (esqueceu o lucro).',
    },
    {
      enunciado: 'O padrão de matéria-prima de um produto é de 3 kg por unidade, a R$ 8,00 o kg. No mês, foram produzidas 2.000 unidades, com consumo real de 6.300 kg ao custo de R$ 7,60 o kg. Calculando a variação de preço sobre a quantidade real, as variações de preço e de quantidade (eficiência) são, respectivamente:',
      alternativas: ['R$ 2.520,00 favorável e R$ 2.400,00 desfavorável.', 'R$ 2.520,00 desfavorável e R$ 2.400,00 favorável.', 'R$ 2.400,00 favorável e R$ 2.280,00 desfavorável.', 'R$ 120,00 favorável e zero.'],
      correta: 0,
      comentario: 'Padrão para a produção real: 2.000 × 3 = 6.000 kg × 8 = 48.000. Real: 6.300 × 7,60 = 47.880. Preço = (7,60 − 8,00) × 6.300 = −2.520 → <b>R$ 2.520 favorável</b> (pagou menos). Quantidade = (6.300 − 6.000) × 8,00 = <b>R$ 2.400 desfavorável</b> (usou mais). Total = 120 F ✓. Usar a quantidade padrão no preço e o preço real na quantidade leva a 2.400/2.280.',
    },
  ],
  resumo: [
    'CF: total constante, unitário cai com o volume. CV: total varia, unitário constante (dentro da faixa relevante).',
    'MCu = preço − custos e despesas variáveis; índice de MC = MCu ÷ preço; lucro = MC total − fixos.',
    'Com fator limitante, priorize a maior MC por unidade do recurso escasso.',
    'Margem direta = MC − fixos identificados. Não elimine linha com margem direta positiva por causa do rateio.',
    'PE contábil = CF ÷ MCu; econômico soma o lucro desejado (antes do IR); financeiro tira a depreciação.',
    'MS% = (vendas − PE) ÷ vendas; GAO = MC ÷ lucro = 1 ÷ MS% = %Δ lucro ÷ %Δ vendas.',
    'Markup: preço = custo ÷ [1 − (%tributos + %despesas + %lucro)].',
    'Decisão: só custos/receitas diferenciais. Sunk e fixo comum fora; oportunidade e evitáveis dentro.',
    'Pedido especial com capacidade ociosa: aceite se o preço superar o custo variável.',
    'Preço de transferência: mercado, custo (preferir padrão), custo + margem ou negociado.',
    'Variações: preço × Q real; quantidade × P padrão; padrão ajustado à produção real; real > padrão = D.',
  ],
};
