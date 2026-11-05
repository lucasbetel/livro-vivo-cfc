// Lição 14 — Controladoria. Demo: orçamento em cascata (Vendas → Produção → Compras de MP → Caixa).
const DESP_FIXAS = 20000; // despesas operacionais pagas no próprio mês
const MODCIF = 10; // MOD + CIF pagos no mês, por unidade produzida
const PADRAO = { v1: 1000, v2: 1500, v3: 2000, preco: 50, ei: 200, efPct: 20, mpKg: 2, mpPreco: 8, vista: 40, saldo0: 5000 };

// Orçamento de 3 meses. Premissas: vendas do mês 4 = mês 3; MP comprada e paga no mês do consumo;
// clientes a receber no início = parcela a prazo de um "mês 0" igual ao mês 1.
function calcularOrcamento(s) {
  const V = [s.v1, s.v2, s.v3];
  const prox = [s.v2, s.v3, s.v3];
  const EI = [], EF = [], P = [];
  let ei = s.ei;
  for (let i = 0; i < 3; i++) {
    const efDesejado = Math.round((prox[i] * s.efPct) / 100);
    const p = Math.max(0, V[i] + efDesejado - ei);
    EI.push(ei); P.push(p);
    const ef = ei + p - V[i];
    EF.push(ef); ei = ef;
  }
  const custoMP = s.mpKg * s.mpPreco;
  const comprasMP = P.map((p) => p * custoMP);
  const modcif = P.map((p) => p * MODCIF);
  const receita = V.map((v) => v * s.preco);
  const av = s.vista / 100;
  const recebe = receita.map((r, i) => r * av + (i === 0 ? receita[0] : receita[i - 1]) * (1 - av));
  const paga = P.map((_, i) => comprasMP[i] + modcif[i] + DESP_FIXAS);
  const saldoIni = [], saldoFim = [];
  let sd = s.saldo0;
  for (let i = 0; i < 3; i++) { saldoIni.push(sd); sd = sd + recebe[i] - paga[i]; saldoFim.push(sd); }
  return { V, EI, EF, P, custoMP, comprasMP, modcif, receita, recebe, paga, saldoIni, saldoFim };
}

function montarCascata(el, kit) {
  const { h, fmt, INK, ui, pen } = kit;
  const R = (v) => `${v < -0.5 ? '−' : ''}R$ ${fmt.int(Math.abs(v))}`;
  const U = (v) => `${fmt.int(v)} un.`;
  let s = { ...PADRAO };
  let ultimo = null, anterior = null, alterado = null, q = null, layout = '';

  const areaQuadro = h('div', {});
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const tabWrap = h('div', { style: { overflowX: 'auto' } });
  const areaCtl = h('div', { class: 'demo-painel', style: { display: 'none' } });
  const areaSim = h('div', { style: { display: 'none' } });

  const BLOCOS = [
    { chave: 'vendas', titulo: 'Vendas', sub: 'unidades previstas', campo: 'V', f: U },
    { chave: 'producao', titulo: 'Produção', sub: 'V + EF − EI', campo: 'P', f: U },
    { chave: 'mp', titulo: 'Compras de MP', sub: 'prod. × kg × R$/kg', campo: 'comprasMP', f: R },
    { chave: 'caixa', titulo: 'Saldo de caixa', sub: 'saldo + entra − sai', campo: 'saldoFim', f: R },
  ];
  const corValor = (b, i) => {
    const v = ultimo[b.campo][i];
    if (b.chave === 'caixa' && v < -0.5) return INK.vermelho;
    if (anterior && Math.abs(anterior[b.campo][i] - v) > 0.5) return INK.laranja;
    return INK.azul;
  };
  const seta = (b, i) => {
    if (!anterior) return '';
    const d = ultimo[b.campo][i] - anterior[b.campo][i];
    return Math.abs(d) > 0.5 ? (d > 0 ? ' ↑' : ' ↓') : '';
  };

  function desenhar(animar = false) {
    if (!ultimo) return;
    const largo = (el.clientWidth || 360) >= 560;
    const modo = largo ? 'h' : 'v';
    if (!q || layout !== modo) {
      if (q) q.svg.remove();
      layout = modo;
      q = largo ? pen.quadro(areaQuadro, { largura: 720, altura: 262 }) : pen.quadro(areaQuadro, { largura: 360, altura: 566 });
    } else q.limpar();
    const o = { animar };
    if (largo) {
      const w = 150, g = 30, y = 46, hh = 200;
      q.texto(15, 26, 'Mude uma premissa na ponta e veja escorrer até o caixa →', { tamanho: 18, cor: INK.lapis, animar });
      BLOCOS.forEach((b, k) => {
        const x = 15 + k * (w + g);
        if (alterado === b.chave) q.marca(x - 5, y - 5, w + 10, hh + 10);
        q.retangulo(x, y, w, hh, { cor: b.chave === 'caixa' ? INK.verde : INK.azul, ...o });
        q.texto(x + w / 2, y + 30, b.titulo, { tamanho: 19, ancora: 'middle', peso: 700, animar });
        q.texto(x + w / 2, y + 52, b.sub, { tamanho: 13, ancora: 'middle', cor: INK.lapis, fonte: 'texto', animar });
        for (let i = 0; i < 3; i++) {
          const yy = y + 95 + i * 38;
          q.texto(x + 10, yy, `M${i + 1}`, { tamanho: 16, cor: INK.lapis, animar });
          q.texto(x + w - 10, yy, b.f(ultimo[b.campo][i]) + seta(b, i), { tamanho: 18, ancora: 'end', cor: corValor(b, i), animar });
        }
        if (k < 3) q.seta(x + w + 3, y + hh / 2, x + w + g - 3, y + hh / 2, { cor: INK.vermelho, ponta: 8, ...o });
      });
    } else {
      const x = 12, w = 336, hh = 100, passo = 138, y0 = 40;
      q.texto(12, 24, 'Mude a ponta e veja chegar ao caixa ↓', { tamanho: 17, cor: INK.lapis, animar });
      BLOCOS.forEach((b, k) => {
        const y = y0 + k * passo;
        if (alterado === b.chave) q.marca(x - 5, y - 5, w + 10, hh + 10);
        q.retangulo(x, y, w, hh, { cor: b.chave === 'caixa' ? INK.verde : INK.azul, ...o });
        q.texto(x + 12, y + 28, b.titulo, { tamanho: 21, peso: 700, animar });
        q.texto(x + w - 12, y + 28, b.sub, { tamanho: 14, ancora: 'end', cor: INK.lapis, fonte: 'texto', animar });
        for (let i = 0; i < 3; i++) {
          const cx = x + (w * (2 * i + 1)) / 6;
          q.texto(cx, y + 56, `Mês ${i + 1}`, { tamanho: 15, ancora: 'middle', cor: INK.lapis, animar });
          q.texto(cx, y + 86, b.f(ultimo[b.campo][i]) + seta(b, i), { tamanho: 19, ancora: 'middle', cor: corValor(b, i), animar });
        }
        if (k < 3) q.seta(180, y + hh + 5, 180, y + passo - 5, { cor: INK.vermelho, ponta: 9, ...o });
      });
    }
  }

  function escreverResultado() {
    const r = ultimo;
    const menor = Math.min(...r.saldoFim);
    const mes = r.saldoFim.indexOf(menor) + 1;
    msg.innerHTML = `<p><b>Produção do mês 1</b> = vendas ${fmt.int(r.V[0])} + EF ${fmt.int(r.EF[0])} − EI ${fmt.int(r.EI[0])} = <b>${U(r.P[0])}</b></p>
<p><b>Compras de MP do mês 1</b> = ${U(r.P[0])} × ${fmt.num(s.mpKg, 1)} kg × R$ ${fmt.num(s.mpPreco, 2)} = <b>${R(r.comprasMP[0])}</b></p>
<p><b>Recebimentos do mês 2</b> = ${s.vista}% × ${R(r.receita[1])} (vendas do mês) + ${100 - s.vista}% × ${R(r.receita[0])} (vendas do mês 1) = <b>${R(r.recebe[1])}</b></p>` +
      (menor < -0.5
        ? `<p class="nok">✘ O caixa fica negativo no mês ${mes}: a empresa <b>precisa captar ${R(-menor)}</b> (empréstimo, aporte ou renegociação de prazos) para atravessar o trimestre.</p>`
        : `<p class="ok">✔ Caixa positivo nos três meses. Menor saldo: ${R(menor)} no mês ${mes}.</p>`);
    const neg = (v) => (v < -0.5 ? `<span class="nok"><b>${R(v)}</b></span>` : `<b>${R(v)}</b>`);
    tabWrap.innerHTML = '';
    tabWrap.append(ui.tabela(['Orçamento', 'Mês 1', 'Mês 2', 'Mês 3'], [
      ['Vendas (un.)', ...r.V.map(fmt.int)],
      ['Estoque final de produtos (un.)', ...r.EF.map(fmt.int)],
      ['Produção (un.)', ...r.P.map(fmt.int)],
      ['Saldo inicial de caixa', ...r.saldoIni.map(R)],
      ['(+) Recebimentos de clientes', ...r.recebe.map(R)],
      ['(−) Compras de MP', ...r.comprasMP.map(R)],
      ['(−) MOD + CIF', ...r.modcif.map(R)],
      ['(−) Despesas operacionais', ...[0, 1, 2].map(() => R(DESP_FIXAS))],
      ['<b>(=) Saldo final de caixa</b>', ...r.saldoFim.map(neg)],
    ]));
  }

  function atualizar(animar = false) {
    anterior = ultimo;
    ultimo = calcularOrcamento(s);
    desenhar(animar);
    escreverResultado();
  }

  // controles (aparecem depois dos palpites)
  const ctls = {};
  const ctl = (rotulo, chave, min, max, passo, formato, grupo) => {
    const c = ui.controle({ rotulo, min, max, passo, valor: s[chave], formato, aoMudar: (v) => { s[chave] = v; alterado = grupo; atualizar(); } });
    ctls[chave] = c;
    return c;
  };
  const restaurar = () => {
    s = { ...PADRAO };
    Object.entries(ctls).forEach(([k, c]) => c.definir(s[k]));
    alterado = null;
    atualizar();
  };
  areaCtl.append(
    h('p', { html: '<b>Agora é com você.</b> Mude uma premissa por vez e acompanhe a cascata: os valores que mudaram ficam em <span style="color:#d9822b"><b>laranja</b></span>, o bloco da premissa alterada ganha marca-texto e saldo negativo aparece em <span class="nok"><b>vermelho</b></span>.' }),
    h('p', { class: 'demo-fato' }, h('b', {}, 'Vendas')),
    ctl('Vendas do mês 1', 'v1', 500, 4000, 100, U, 'vendas'),
    ctl('Vendas do mês 2', 'v2', 500, 4000, 100, U, 'vendas'),
    ctl('Vendas do mês 3', 'v3', 500, 4000, 100, U, 'vendas'),
    ctl('Preço de venda', 'preco', 20, 100, 1, (v) => `R$ ${v}`, 'caixa'),
    h('p', { class: 'demo-fato' }, h('b', {}, 'Estoques e produção')),
    ctl('Estoque inicial de produtos', 'ei', 0, 800, 50, U, 'producao'),
    ctl('Estoque final desejado (% das vendas do mês seguinte)', 'efPct', 0, 50, 5, (v) => `${v}%`, 'producao'),
    h('p', { class: 'demo-fato' }, h('b', {}, 'Matéria-prima')),
    ctl('MP por unidade', 'mpKg', 1, 5, 0.5, (v) => `${fmt.num(v, 1)} kg`, 'mp'),
    ctl('Preço da MP', 'mpPreco', 2, 20, 1, (v) => `R$ ${v}/kg`, 'mp'),
    h('p', { class: 'demo-fato' }, h('b', {}, 'Caixa')),
    ctl('Recebido à vista (resto no mês seguinte)', 'vista', 0, 100, 10, (v) => `${v}% / ${100 - v}%`, 'caixa'),
    ctl('Saldo inicial de caixa', 'saldo0', 0, 50000, 1000, R, 'caixa'),
    h('div', { class: 'demo-linha' }, h('button', { type: 'button', class: 'btn-caneta', onclick: restaurar }, 'Voltar às premissas iniciais')),
  );

  const prev2 = ui.previsao({
    pergunta: '<b>Palpite 2:</b> as vendas previstas para o <b>mês 3</b> dobram (2.000 → 4.000 un.). O que acontece com o saldo de caixa do <b>mês 2</b>, antes de a venda extra acontecer?',
    opcoes: ['Cai, e pode até ficar negativo', 'Sobe, porque a empresa vai vender mais', 'Não muda: a venda extra só ocorre no mês 3'],
    correta: 0,
    explicacao: 'O estoque final do mês 2 é 20% das vendas do mês 3: sobe de 400 para 800 un. Para formar esse estoque, a produção do mês 2 sobe de 1.600 para 2.000 un., e os pagamentos do mês 2 crescem 400 × R$ 26 (MP R$ 16 + MOD/CIF R$ 10) = R$ 10.400. O saldo do mês 2 cai de R$ 4.800 para <b>−R$ 5.600</b>: a empresa precisa captar dinheiro <b>antes</b> de vender mais. A cascata acima já mostra a mudança em laranja. Use os controles abaixo para testar outras premissas.',
    aoResponder: () => { s.v3 = 4000; ctls.v3.definir(4000); alterado = 'vendas'; atualizar(); areaCtl.style.display = ''; },
  });

  const prev1 = ui.previsao({
    pergunta: '<b>Palpite 1:</b> a empresa prevê vender <b>1.000 un.</b> no mês 1, tem <b>200 un.</b> em estoque e quer terminar o mês com <b>300 un.</b> Quanto precisa produzir?',
    opcoes: ['900 un.', '1.000 un.', '1.100 un.', '1.300 un.'],
    correta: 2,
    explicacao: 'Produção = Vendas + EF desejado − EI = 1.000 + 300 − 200 = <b>1.100 un.</b> Vender 1.000 não basta: é preciso formar o estoque final desejado, descontando o que já existe. Veja abaixo como esse número puxa a compra de MP e o caixa.',
    aoResponder: () => { areaSim.style.display = ''; alterado = null; atualizar(true); },
  });

  areaSim.append(
    h('p', { html: '<b>Premissas do modelo:</b> MOD + CIF de R$ 10/un. e despesas operacionais de R$ 20.000/mês, pagas no próprio mês; MP comprada e paga no mês em que é consumida; estoque final desejado usa o percentual do controle (inicialmente 20%) das vendas do mês seguinte (vendas do mês 4 iguais às do mês 3); no início há a receber a parcela a prazo (100% menos o percentual à vista do controle; inicialmente 60%) das vendas de um mês anterior igual ao mês 1.' }),
    areaQuadro, msg, tabWrap,
    h('div', { class: 'demo-painel' }, prev2),
    areaCtl,
  );
  el.append(h('div', { class: 'demo-painel' }, prev1), areaSim);

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      const modo = (el.clientWidth || 360) >= 560 ? 'h' : 'v';
      if (ultimo && modo !== layout) desenhar(false);
    });
    ro.observe(el);
  }
  return () => { if (ro) ro.disconnect(); };
}

export default {
  id: '14-controladoria',
  numero: 14,
  disciplina: 'Controladoria',
  titulo: 'Controladoria, orçamento e desempenho',
  subtitulo: 'Do plano ao caixa, do caixa ao placar do gestor',
  incidencia: 'media',
  tempo: 45,
  pergunta: 'Se a empresa vai vender o dobro, por que o caixa pode ficar no vermelho?',
  previsao: {
    pergunta: 'Uma empresa vendia R$ 100.000 por mês. Em março, as vendas dobram para R$ 200.000. Ela recebe 40% à vista e 60% no mês seguinte, e paga à vista seus gastos, que equivalem a 60% das vendas do mês. O caixa gerado em março, comparado ao de fevereiro:',
    opcoes: ['Dobra: passa de +R$ 40 mil para +R$ 80 mil', 'Cai: passa de +R$ 40 mil para +R$ 20 mil', 'Fica igual: +R$ 40 mil'],
    correta: 1,
    explicacao: 'Fevereiro: recebe 40% × 100 mil + 60% × 100 mil (de janeiro) = 100 mil e paga 60 mil → sobra <b>40 mil</b>. Março: recebe 40% × 200 mil = 80 mil + 60% × 100 mil (de fevereiro) = 60 mil, total 140 mil; paga 60% × 200 mil = 120 mil → sobra só <b>20 mil</b>. Vendeu o dobro, mas os gastos saem antes de o dinheiro entrar. É para enxergar isso com antecedência que existe o <b>orçamento de caixa</b>.',
  },
  paginas: [
    {
      titulo: 'Controladoria, controller e compliance',
      html: `<p>A palavra <b>controladoria</b> aparece na prova com dois sentidos, e a FGV adora misturá-los:</p>
<table class="tabela"><thead><tr><th>Enfoque</th><th>O que é</th></tr></thead><tbody>
<tr><td><b>Ramo do conhecimento</b></td><td>Conjunto de princípios e métodos (da Contabilidade, Administração, Economia, Estatística...) que dá as bases para modelar o <b>sistema de informação</b> e o <b>modelo de gestão econômica</b> da empresa.</td></tr>
<tr><td><b>Órgão administrativo</b></td><td>Unidade da estrutura com missão, funções e responsabilidades próprias, dirigida pelo <b>controller</b>.</td></tr></tbody></table>
<div class="caixa"><b>Missão</b> (abordagem da Gestão Econômica, GECON, de Catelli): <mark>assegurar a otimização do resultado econômico da organização</mark>, garantindo sua continuidade (eficácia). O foco é o resultado <b>global</b>, não o de uma área isolada.</div>
<p><b>O controller</b> coordena o planejamento e o controle, mantém o sistema de informações gerenciais, cuida da contabilidade e dos controles internos, protege os ativos e faz a ponte com a auditoria. Em relação às decisões das <b>outras áreas</b>, atua como <b>staff (assessoria)</b>: informa, simula e recomenda, mas <b>quem decide é o gestor da área</b>. Sobre as próprias atribuições (sistema de informação, orçamento, contabilidade) tem autoridade de linha.</p>
<table class="tabela"><thead><tr><th>Contador tradicional</th><th>Controller</th></tr></thead><tbody>
<tr><td>registra o que já aconteceu (passado)</td><td>usa a informação para planejar e controlar (futuro)</td></tr>
<tr><td>foco em normas societárias e fiscais</td><td>foco em decisão, desempenho e resultado econômico</td></tr></tbody></table>
<p><b>Compliance</b> (do inglês <i>to comply</i>, cumprir) é estar e permanecer em <b>conformidade</b> com leis, regulamentos, normas internas e políticas, prevenindo, detectando e corrigindo desvios. Ganhou força com a <b>Lei 12.846/2013</b> (Lei Anticorrupção), que trata da responsabilização <b>objetiva</b>, administrativa e civil, da pessoa jurídica por atos contra a administração pública. A existência de mecanismos de integridade (código de conduta, canal de denúncias, auditoria) é considerada na aplicação das sanções (art. 7º, VIII): é o chamado <b>programa de integridade</b>.</p>
<div class="caixa alerta"><b>Pegadinha:</b> alternativa dizendo que o controller "toma as decisões operacionais no lugar dos gestores" ou "maximiza o resultado de cada departamento isoladamente" está <b>errada</b>. Ele apoia a decisão e busca o resultado global.</div>`,
    },
    {
      titulo: 'Ambiente, planejamento e processo decisório',
      html: `<p>A empresa é um <b>sistema aberto</b>: troca recursos e informações com o <b>ambiente externo</b> (clientes, fornecedores, concorrentes, governo, sociedade, tecnologia) e se organiza internamente em subsistemas: institucional (crenças e valores), de gestão, de informação, social, organizacional e físico-operacional.</p>
<table class="tabela"><thead><tr><th>Nível</th><th>Prazo</th><th>Quem faz</th><th>Conteúdo</th></tr></thead><tbody>
<tr><td><b>Estratégico</b></td><td>longo</td><td>alta direção</td><td>missão, visão, valores, objetivos da empresa como um todo; análise SWOT</td></tr>
<tr><td><b>Tático</b></td><td>médio</td><td>gerência intermediária</td><td>planos de cada área (marketing, produção, finanças)</td></tr>
<tr><td><b>Operacional</b></td><td>curto</td><td>supervisão / execução</td><td>metas, programas, rotinas e o <b>orçamento</b> detalhado</td></tr></tbody></table>
<p><b>SWOT:</b> forças e fraquezas são <b>internas</b>; oportunidades e ameaças são <b>externas</b>.</p>
<p><b>Processo de gestão</b> (ciclo): <mark>planejamento → execução → controle</mark>, com o controle realimentando o planejamento. <b>Mecanismos de planejamento:</b> plano estratégico, planos táticos, orçamento, programas e projetos, políticas e procedimentos, metas e indicadores, simulação de cenários.</p>
<p><b>Processo decisório</b> (etapas):</p>
<ol><li>identificar o problema ou a oportunidade;</li><li>levantar as alternativas;</li><li>avaliar (simular) as alternativas;</li><li>escolher;</li><li>implementar;</li><li>controlar e realimentar.</li></ol>
<div class="caixa"><b>Modelo de gestão</b> = conjunto de <b>crenças, valores e princípios</b> (dos donos e da alta direção) que define <b>como</b> a empresa será administrada: grau de autonomia e descentralização, estilo de liderança, papel dos gestores e critérios de avaliação de desempenho. Ele condiciona todos os outros subsistemas, inclusive o de informação.</div>
<div class="caixa alerta"><b>Pegadinha:</b> o orçamento é a expressão <b>quantitativa</b> (em unidades e em moeda) do plano de curto prazo. Ele não substitui o planejamento estratégico; deriva dele.</div>`,
    },
    {
      titulo: 'Orçamento empresarial: a cascata',
      html: `<p>O <b>orçamento</b> traduz os planos em números para um período (em geral, um ano dividido em meses). Serve para planejar, coordenar áreas, comunicar metas, motivar e, depois, <b>controlar</b> (comparar real × orçado).</p>
<p>A ordem é uma cascata: cada peça usa a anterior.</p>
<ol><li><b>Vendas</b> (ponto de partida: normalmente é o fator limitante)</li><li><b>Produção</b> (unidades)</li><li><b>Matéria-prima</b>: consumo e compras</li><li><b>Mão de obra direta</b></li><li><b>CIF</b></li><li><b>Custo dos produtos vendidos</b></li><li><b>Despesas operacionais</b> (vendas e administrativas)</li><li><b>Investimentos</b> (capital) e financiamentos</li><li><b>Caixa</b></li><li><b>DRE projetada</b> e <b>Balanço projetado</b></li></ol>
<div class="formula">Produção = Vendas + EF desejado − EI</div>
<div class="formula">Compras de MP = Consumo + EF de MP − EI de MP</div>
<div class="exemplo"><b>Exemplo:</b> a Cia. Delta prevê vender 5.000 un. em janeiro e 6.000 un. em fevereiro. Tem 1.000 un. em estoque e quer encerrar cada mês com 20% das vendas do mês seguinte. Cada unidade consome 2 kg de MP a R$ 3,00/kg; o estoque de MP é de 1.500 kg e deseja-se terminar janeiro com 2.000 kg.<br>
1) EF de produtos = 20% × 6.000 = <b>1.200 un.</b><br>
2) Produção = 5.000 + 1.200 − 1.000 = <b>5.200 un.</b><br>
3) Consumo de MP = 5.200 × 2 kg = <b>10.400 kg</b><br>
4) Compras de MP = 10.400 + 2.000 − 1.500 = 10.900 kg × R$ 3,00 = <b>R$ 32.700</b><br>
5) Se cada unidade usa 0,5 h de MOD a R$ 20/h: MOD = 5.200 × 0,5 × 20 = <b>R$ 52.000</b>.</div>
<div class="caixa alerta"><b>Pegadinhas:</b> (1) o orçamento de MP parte da <b>produção</b>, não das vendas; (2) <b>consumo</b> (o que vai para a fábrica) ≠ <b>compras</b> (o que entra no almoxarifado); (3) não troque os sinais: estoque final <b>soma</b>, estoque inicial <b>subtrai</b>.</div>
<aside class="nota">É a mesma lógica do CMV (EI + C − EF), só que resolvida "de trás para frente": você sabe quanto vai sair e quer descobrir quanto precisa entrar.</aside>`,
    },
    {
      titulo: 'Orçamento de caixa e demonstrações projetadas',
      html: `<p>O <b>orçamento de caixa</b> junta tudo o que entra e sai de dinheiro, mês a mês. Ele mostra quando sobra dinheiro (para aplicar ou amortizar dívidas) e quando falta (para captar).</p>
<div class="formula">Saldo final = Saldo inicial + Recebimentos − Pagamentos</div>
<div class="exemplo"><b>Exemplo:</b> vendas previstas de jan = R$ 100.000, fev = R$ 120.000, mar = R$ 90.000. Recebe 40% no mês e 60% no mês seguinte. Em 31/12 havia R$ 48.000 a receber (60% das vendas de dezembro).<br>
<table class="tabela"><thead><tr><th></th><th>Jan</th><th>Fev</th><th>Mar</th></tr></thead><tbody>
<tr><td>40% do mês</td><td>40.000</td><td>48.000</td><td>36.000</td></tr>
<tr><td>60% do mês anterior</td><td>48.000</td><td>60.000</td><td>72.000</td></tr>
<tr><td><b>Recebimentos</b></td><td><b>88.000</b></td><td><b>108.000</b></td><td><b>108.000</b></td></tr>
<tr><td>Saldo inicial</td><td>10.000</td><td>5.000</td><td>11.000</td></tr>
<tr><td>(−) Pagamentos</td><td>95.000</td><td>100.000</td><td>98.000</td></tr>
<tr><td>Saldo antes de financiamento</td><td>3.000</td><td>13.000</td><td>21.000</td></tr>
<tr><td>Captação (amortização)</td><td>+2.000</td><td>−2.000</td><td>—</td></tr>
<tr><td><b>Saldo final</b> (mínimo desejado: 5.000)</td><td><b>5.000</b></td><td><b>11.000</b></td><td><b>21.000</b></td></tr></tbody></table>
Em janeiro faltariam R$ 2.000 para o saldo mínimo: capta-se e devolve-se em fevereiro (sem juros, para simplificar). No balanço projetado de março, Clientes = 60% × 90.000 = <b>R$ 54.000</b>.</div>
<p>Com o caixa pronto, fecham-se as <b>demonstrações projetadas</b>: a <b>DRE projetada</b> (regime de <b>competência</b>: vendas do período, CPV, despesas, inclusive depreciação) e o <b>Balanço projetado</b> (caixa final, clientes a receber, estoques finais, imobilizado, fornecedores a pagar, empréstimos).</p>
<div class="caixa alerta"><b>Pegadinha:</b> <b>depreciação não entra no orçamento de caixa</b> (não é desembolso), mas entra na DRE projetada. E as vendas a prazo do mês anterior entram como recebimento do mês atual.</div>`,
    },
    {
      titulo: 'Tipos de orçamento e controle orçamentário',
      html: `<table class="tabela"><thead><tr><th>Tipo</th><th>Ideia central</th></tr></thead><tbody>
<tr><td><b>Estático</b> (fixo)</td><td>feito para um único nível de atividade; não muda se o volume mudar</td></tr>
<tr><td><b>Flexível</b></td><td>separa custos fixos e variáveis e é <b>ajustado ao volume realmente atingido</b></td></tr>
<tr><td><b>Base zero</b></td><td>cada atividade e cada gasto é <b>justificado do zero</b>, sem partir do ano anterior</td></tr>
<tr><td><b>Contínuo</b> (rolling)</td><td>ao terminar um mês, acrescenta-se outro no fim: horizonte sempre igual (ex.: 12 meses à frente)</td></tr>
<tr><td><b>Incremental</b> (de tendência)</td><td>parte do realizado anterior + ajustes; simples, mas perpetua ineficiências</td></tr>
<tr><td><b>Ajustado</b> (revisto)</td><td>o orçamento original é revisto no decorrer do período quando premissas relevantes mudam</td></tr>
<tr><td><b>Por atividades</b></td><td>orça as atividades e seus direcionadores (lógica do ABC)</td></tr>
<tr><td><b>Participativo</b></td><td>gestores ajudam a elaborar; gera comprometimento, mas pode criar <b>folga orçamentária</b></td></tr></tbody></table>
<p><b>Controle orçamentário</b> = comparar o realizado com o orçado, apurar as <b>variações</b> (favoráveis ou desfavoráveis), achar a causa e corrigir o rumo. Para não punir nem premiar injustamente, compara-se o real com o orçamento <b>flexível</b>:</p>
<div class="formula">Variação total = Variação de volume (flexível − estático) + Variação de eficiência/gastos (real − flexível)</div>
<div class="exemplo"><b>Exemplo:</b> orçado (estático) 10.000 un. a R$ 50, CV R$ 30/un., CF R$ 120.000 → lucro <b>R$ 80.000</b>. Real: 9.000 un. a R$ 50, CV total R$ 279.000, CF R$ 125.000 → lucro = 450.000 − 279.000 − 125.000 = <b>R$ 46.000</b>.<br>
Flexível para 9.000 un.: 450.000 − 270.000 − 120.000 = <b>R$ 60.000</b>.<br>
• Variação de volume: 60.000 − 80.000 = <b>R$ 20.000 D</b> (vendeu menos).<br>
• Variação real × flexível: 46.000 − 60.000 = <b>R$ 14.000 D</b> (CV 9.000 D + CF 5.000 D).<br>
• Total: 20.000 + 14.000 = <b>R$ 34.000 D</b> = 80.000 − 46.000. ✔</div>
<div class="caixa alerta"><b>Pegadinha:</b> se o volume caiu, o custo real fica abaixo do estático e <b>parece</b> economia. Só a comparação com o flexível mostra se houve eficiência. Variação de custo: real &gt; orçado = <b>desfavorável</b>; de receita: real &gt; orçado = <b>favorável</b>.</div>`,
    },
    {
      titulo: 'Centros de responsabilidade e indicadores',
      html: `<p>A <b>contabilidade por responsabilidade</b> divide a empresa em unidades e avalia cada gestor <b>apenas pelo que ele controla</b>: é o <mark>princípio da controlabilidade</mark>.</p>
<table class="tabela"><thead><tr><th>Centro de</th><th>O gestor controla</th><th>Avaliado por</th><th>Exemplo</th></tr></thead><tbody>
<tr><td><b>Custo</b></td><td>custos</td><td>custo real × orçado/padrão</td><td>fábrica, manutenção</td></tr>
<tr><td><b>Receita</b></td><td>receitas</td><td>receita, volume, preço</td><td>departamento de vendas</td></tr>
<tr><td><b>Lucro</b></td><td>receitas e custos</td><td>lucro, margem</td><td>filial, divisão, loja</td></tr>
<tr><td><b>Investimento</b></td><td>receitas, custos <b>e investimentos</b> (ativos)</td><td>ROI, RI, EVA</td><td>divisão autônoma, subsidiária</td></tr></tbody></table>
<p>Quando centros de lucro trocam produtos entre si, usa-se um <b>preço de transferência</b> (de mercado, baseado em custo ou negociado), assunto da lição de Gerencial.</p>
<p><b>Tipos de indicadores</b> que caem na prova:</p>
<ul class="lista-check"><li><b>Financeiros</b> (lucro, ROI, margem) × <b>não financeiros</b> (satisfação, prazo, qualidade, retrabalho).</li>
<li><b>De resultado</b> (de ocorrência, <i>lagging</i>: mostram o que já aconteceu) × <b>de tendência</b> (vetores de desempenho, <i>leading</i>: antecipam resultados).</li>
<li><b>Eficiência</b> (fazer bem, com menos recursos) × <b>eficácia</b> (atingir o objetivo) × <b>efetividade</b> (impacto real gerado).</li></ul>
<div class="caixa alerta"><b>Pegadinha:</b> avaliar o gerente de um <b>centro de custo</b> pelo lucro é injusto: ele não controla receita. E custo rateado da administração central costuma ser <b>não controlável</b> pelo gestor da divisão.</div>`,
    },
    {
      titulo: 'ROI, lucro residual e EVA',
      html: `<div class="formula">ROI = Lucro operacional ÷ Investimento</div>
<div class="formula">ROI = Margem × Giro = (Lucro ÷ Vendas) × (Vendas ÷ Investimento)</div>
<div class="exemplo"><b>Exemplo (Du Pont):</b> vendas R$ 2.500.000, lucro R$ 250.000, investimento R$ 1.000.000. Margem = 10%; giro = 2,5; ROI = 10% × 2,5 = <b>25%</b>.</div>
<div class="formula">RI (lucro residual) = Lucro − (Taxa mínima × Investimento)</div>
<div class="exemplo"><b>O caso clássico:</b> a divisão acima (ROI 25%) recebe um projeto que exige R$ 200.000 e gera lucro de R$ 40.000 (ROI do projeto = 20%). A empresa exige no mínimo 15%.<br>
• ROI da divisão com o projeto = 290.000 ÷ 1.200.000 = <b>24,17%</b> → caiu, e o gestor avaliado por ROI <b>rejeita</b>.<br>
• RI do projeto = 40.000 − 15% × 200.000 = <b>+R$ 10.000</b> → cria valor.<br>
• RI da divisão: antes 250.000 − 150.000 = 100.000; depois 290.000 − 180.000 = <b>110.000</b>.<br>
Conclusão: o ROI pode levar à <mark>rejeição de projetos bons</mark> (que rendem acima do custo de capital, mas abaixo do ROI atual). O RI corrige isso.</div>
<div class="formula">EVA = NOPAT − (WACC × Capital investido)</div>
<p><b>EVA</b> (valor econômico agregado) é o lucro residual "afinado": usa o lucro operacional <b>depois</b> dos tributos (NOPAT) e o custo médio ponderado de <b>todo</b> o capital (próprio e de terceiros).</p>
<div class="exemplo"><b>Exemplo:</b> lucro operacional antes do IR R$ 500.000; IR/CSLL 34% → NOPAT = 500.000 × 0,66 = R$ 330.000. Capital investido R$ 2.000.000, WACC 12% → custo do capital = R$ 240.000. EVA = 330.000 − 240.000 = <b>R$ 90.000</b> (criou valor).</div>
<div class="caixa alerta"><b>Pegadinha:</b> lucro contábil positivo <b>não</b> garante EVA positivo: a contabilidade não desconta o custo do capital próprio. EVA negativo = a empresa destruiu valor, mesmo com lucro.</div>`,
    },
    {
      titulo: 'Balanced Scorecard e sistemas de informações gerenciais',
      html: `<p>O <b>Balanced Scorecard</b> (Kaplan e Norton) traduz a estratégia em objetivos, indicadores, metas e iniciativas, equilibrando medidas financeiras e não financeiras em <b>4 perspectivas</b> ligadas por <b>causa e efeito</b>:</p>
<table class="tabela"><thead><tr><th>Perspectiva</th><th>Pergunta</th><th>Indicadores típicos</th></tr></thead><tbody>
<tr><td><b>Financeira</b></td><td>Como os acionistas nos veem?</td><td>ROI, EVA, crescimento da receita</td></tr>
<tr><td><b>Clientes</b></td><td>Como os clientes nos veem?</td><td>satisfação, retenção, participação de mercado</td></tr>
<tr><td><b>Processos internos</b></td><td>Em que precisamos ser excelentes?</td><td>tempo de ciclo, qualidade, retrabalho</td></tr>
<tr><td><b>Aprendizado e crescimento</b></td><td>Como continuar melhorando?</td><td>treinamento, satisfação e retenção de funcionários, sistemas de informação</td></tr></tbody></table>
<div class="formula">Aprendizado → Processos → Clientes → Financeira</div>
<p><b>Sistema de informações gerenciais (SIG):</b> conjunto de pessoas, dados, procedimentos e tecnologia que transforma dados em informação para <b>planejar, executar e controlar</b>. Peças que a prova cita:</p>
<ul class="lista-check"><li><b>Sistemas transacionais</b> (operacionais): registram as operações do dia a dia.</li>
<li><b>ERP</b> (sistema integrado de gestão): <b>base de dados única</b>; integra as áreas e evita redigitação e divergências.</li>
<li><b>Sistemas de apoio à decisão</b> (SAD) e <b>BI</b>: modelos, simulações "e se?" e painéis para decisões pouco estruturadas.</li>
<li><b>Sistema de suporte à controladoria</b>: orçamento, custos, contabilidade por responsabilidade, simulação e avaliação de desempenho, alimentados pela mesma base.</li></ul>
<p><b>Qualidade da informação:</b> relevante, confiável (representação fidedigna), tempestiva, comparável, compreensível, verificável e com <b>benefício maior que o custo</b> de produzi-la. <b>Governança da informação</b> define donos dos dados, acessos, segurança, integridade e conformidade (inclusive com a LGPD, Lei 13.709/2018).</p>
<div class="caixa"><b>Governança corporativa (IBGC):</b> os princípios clássicos (Código, 5ª ed., 2015) são <b>transparência, equidade, prestação de contas (accountability) e responsabilidade corporativa</b>. A 6ª edição (2023) passou a listar cinco: integridade, transparência, equidade, responsabilização (accountability) e sustentabilidade.</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: o orçamento em cascata',
    instrucao: 'Dê seus palpites, veja a cascata Vendas → Produção → Compras de MP → Caixa ser montada e depois mude as premissas: o que muda fica em laranja e o caixa negativo, em vermelho.',
    montar: montarCascata,
  },
  macetes: [
    'Controller <b>assessora</b> (staff) as outras áreas; quem decide é o gestor. A missão é o resultado <b>global</b>.',
    '<b>Produção = Vendas + EF − EI</b> · <b>Compras de MP = Consumo + EF − EI</b>. É o CMV "de trás para frente".',
    'Cascata: <b>Vendas → Produção → MP/MOD/CIF → CPV → Despesas → Caixa → DRE e Balanço projetados</b>.',
    'Depreciação <b>não</b> entra no orçamento de caixa; entra na DRE projetada.',
    'Base <b>zero</b> = justifica tudo do zero · <b>contínuo</b> = sempre 12 meses à frente · <b>flexível</b> = ajusta ao volume real.',
    'Centro de <b>investimento</b> = lucro + ativos → avaliado por ROI, RI e EVA.',
    'ROI = <b>margem × giro</b>; RI = Lucro − taxa mínima × investimento; RI &gt; 0 cria valor mesmo se o ROI cair.',
    'BSC de baixo para cima: <b>Aprendizado → Processos → Clientes → Financeira</b>.',
  ],
  questoes: [
    {
      enunciado: 'Em relação ao papel do controller na estrutura organizacional, é correto afirmar que ele:',
      alternativas: [
        'substitui os gestores das áreas na tomada de decisões operacionais, por deter a informação gerencial.',
        'atua exclusivamente na escrituração fiscal e societária da entidade.',
        'exerce, em regra, função de assessoria (staff) às demais áreas, fornecendo informações e coordenando o planejamento e o controle, enquanto os gestores permanecem responsáveis por suas decisões.',
        'tem como missão maximizar o resultado de cada departamento isoladamente, ainda que em prejuízo do resultado global.',
      ],
      correta: 2,
      comentario: 'O controller é, em regra, <b>staff</b> para as decisões das outras áreas: informa, simula e coordena o planejamento e o controle, mas a decisão continua com o gestor responsável. Sua atuação vai muito além da escrituração, e a missão da controladoria é otimizar o resultado <b>global</b>; maximizar áreas isoladas em prejuízo do todo é justamente o que ela deve evitar.',
    },
    {
      enunciado: 'A Cia. Alfa prevê vender 12.000 unidades no próximo trimestre. O estoque inicial de produtos acabados é de 1.800 unidades, e a política da empresa é encerrar cada trimestre com estoque equivalente a 20% das vendas previstas para o trimestre seguinte, estimadas em 15.000 unidades. A quantidade a ser produzida no trimestre é de:',
      alternativas: ['13.200 unidades.', '10.800 unidades.', '15.000 unidades.', '12.600 unidades.'],
      correta: 0,
      comentario: 'EF desejado = 20% × 15.000 = 3.000 un. (das vendas do trimestre <b>seguinte</b>).<br>Produção = Vendas + EF − EI = 12.000 + 3.000 − 1.800 = <b>13.200 un.</b><br>12.600 usa 20% das vendas do próprio trimestre; 10.800 troca os sinais; 15.000 ignora o estoque inicial.',
    },
    {
      enunciado: 'Para o próximo mês, a produção orçada é de 4.000 unidades, e cada unidade consome 3 kg de matéria-prima ao custo de R$ 5,00/kg. O estoque inicial de matéria-prima é de 2.500 kg e deseja-se um estoque final de 1.500 kg. O orçamento de compras de matéria-prima, em reais, é de:',
      alternativas: ['R$ 60.000,00.', 'R$ 65.000,00.', 'R$ 67.500,00.', 'R$ 55.000,00.'],
      correta: 3,
      comentario: 'Consumo = 4.000 × 3 kg = 12.000 kg.<br>Compras = Consumo + EF − EI = 12.000 + 1.500 − 2.500 = 11.000 kg.<br>Em reais: 11.000 × R$ 5,00 = <b>R$ 55.000</b>.<br>R$ 60.000 é o valor do consumo; R$ 65.000 inverte os estoques; R$ 67.500 esquece o estoque inicial.',
    },
    {
      enunciado: 'A Cia. Beta orçou vendas de R$ 150.000 em fevereiro, R$ 180.000 em março, R$ 200.000 em abril e R$ 250.000 em maio. Ela recebe 30% no mês da venda, 50% no mês seguinte e 20% dois meses após a venda. Os recebimentos orçados para maio somam:',
      alternativas: ['R$ 205.000,00.', 'R$ 211.000,00.', 'R$ 195.000,00.', 'R$ 250.000,00.'],
      correta: 1,
      comentario: 'Em maio entram:<br>• 30% das vendas de maio: 0,30 × 250.000 = 75.000<br>• 50% das vendas de abril: 0,50 × 200.000 = 100.000<br>• 20% das vendas de março: 0,20 × 180.000 = 36.000<br>Total = <b>R$ 211.000</b>. As vendas de fevereiro já foram totalmente recebidas até abril.',
    },
    {
      enunciado: 'O orçamento que exige que todas as atividades e gastos sejam justificados a partir do zero a cada novo ciclo, sem tomar como ponto de partida os valores do período anterior, é denominado orçamento:',
      alternativas: ['flexível.', 'contínuo.', 'base zero.', 'incremental.'],
      correta: 2,
      comentario: '<b>Base zero</b>: cada gasto precisa ser justificado do zero. O <b>incremental</b> faz o oposto (parte do anterior + ajustes); o <b>contínuo</b> acrescenta um novo período a cada período encerrado; o <b>flexível</b> se ajusta ao volume de atividade.',
    },
    {
      enunciado: 'Uma empresa orçou (orçamento estático) a produção de 8.000 unidades, com custo variável de R$ 12,00 por unidade e custos fixos de R$ 40.000. Foram efetivamente produzidas 7.000 unidades, com custo variável total real de R$ 87.500 e custos fixos reais de R$ 40.000. Comparando o custo total real com o orçamento flexível, a variação foi de:',
      alternativas: ['R$ 3.500,00 desfavorável.', 'R$ 8.500,00 favorável.', 'R$ 12.000,00 favorável.', 'R$ 3.500,00 favorável.'],
      correta: 0,
      comentario: 'Flexível (7.000 un.) = 7.000 × 12 + 40.000 = 84.000 + 40.000 = 124.000.<br>Real = 87.500 + 40.000 = 127.500.<br>Real − flexível = 3.500 a mais → <b>R$ 3.500 desfavorável</b>.<br>Os R$ 8.500 "favoráveis" vêm da comparação com o estático (136.000), que mistura o efeito da queda de volume (R$ 12.000) com a ineficiência.',
    },
    {
      enunciado: 'O gestor de uma unidade responde pelas receitas e pelos custos de sua divisão, mas não tem autonomia para decidir sobre os investimentos em ativos da unidade. Essa unidade caracteriza-se como centro de:',
      alternativas: ['custo.', 'investimento.', 'receita.', 'lucro.'],
      correta: 3,
      comentario: 'Controla receitas <b>e</b> custos → <b>centro de lucro</b>. Seria centro de investimento se também decidisse sobre os ativos (avaliado por ROI/RI/EVA); centro de custo controla só custos; centro de receita, só receitas.',
    },
    {
      enunciado: 'A Divisão X apresenta lucro operacional de R$ 300.000 sobre investimento de R$ 1.500.000. A empresa exige retorno mínimo de 12% sobre o capital investido. Foi proposto à divisão um projeto que requer investimento de R$ 500.000 e gera lucro operacional adicional de R$ 75.000. Considerando o ROI e o lucro residual (RI), é correto afirmar que o projeto:',
      alternativas: [
        'eleva o ROI da divisão e o lucro residual, que passa a R$ 135.000.',
        'reduz o ROI da divisão de 20% para 18,75%, mas aumenta o lucro residual em R$ 15.000, sendo vantajoso para a empresa.',
        'deve ser rejeitado, pois seu ROI de 15% é inferior ao ROI atual de 20% e ainda reduz o lucro residual da divisão.',
        'reduz o ROI da divisão para 18,75% e o lucro residual para R$ 105.000.',
      ],
      correta: 1,
      comentario: 'ROI atual = 300.000 ÷ 1.500.000 = 20%. ROI do projeto = 75.000 ÷ 500.000 = 15%.<br>ROI com o projeto = 375.000 ÷ 2.000.000 = <b>18,75%</b> (cai).<br>RI antes = 300.000 − 12% × 1.500.000 = 300.000 − 180.000 = 120.000.<br>RI depois = 375.000 − 12% × 2.000.000 = 375.000 − 240.000 = 135.000 → <b>+R$ 15.000</b>.<br>O projeto rende acima do mínimo (15% &gt; 12%): é bom para a empresa, embora derrube o ROI da divisão.',
    },
    {
      enunciado: 'No Balanced Scorecard, indicadores como satisfação e retenção de funcionários, horas de treinamento por empregado e disponibilidade dos sistemas de informação pertencem, tipicamente, à perspectiva:',
      alternativas: ['do aprendizado e crescimento.', 'dos clientes.', 'dos processos internos.', 'financeira.'],
      correta: 0,
      comentario: 'Pessoas, capacitação e sistemas de informação formam a base do BSC: a perspectiva de <b>aprendizado e crescimento</b>. Ela sustenta os processos internos, que geram valor para os clientes, que por sua vez produzem os resultados financeiros (cadeia de causa e efeito).',
    },
    {
      enunciado: 'Uma empresa obteve lucro operacional antes do IR de R$ 800.000, sujeito a alíquota conjunta de IR e CSLL de 34%. O capital investido (próprio e de terceiros) é de R$ 3.000.000 e o custo médio ponderado de capital (WACC) é de 14% ao ano. O EVA do período foi de:',
      alternativas: ['R$ 380.000,00.', 'R$ 528.000,00.', 'R$ 108.000,00.', 'R$ 71.280,00.'],
      correta: 2,
      comentario: 'NOPAT = 800.000 × (1 − 0,34) = 528.000.<br>Custo do capital = 14% × 3.000.000 = 420.000.<br>EVA = 528.000 − 420.000 = <b>R$ 108.000</b>.<br>R$ 380.000 esquece o IR; R$ 528.000 é só o NOPAT; R$ 71.280 aplica o IR duas vezes.',
    },
  ],
  resumo: [
    'Controladoria: ramo do conhecimento + órgão administrativo; missão: otimizar o resultado econômico global.',
    'Controller: staff para as decisões das outras áreas; informa, coordena planejamento e controle; não decide pelos gestores.',
    'Compliance = conformidade com leis, normas e políticas; Lei 12.846/2013: responsabilidade objetiva da PJ; programa de integridade pesa nas sanções.',
    'Planejamento estratégico (longo prazo, alta direção) → tático (médio, áreas) → operacional (curto, execução e orçamento).',
    'Modelo de gestão = crenças e valores que definem como a empresa é administrada.',
    'Cascata: vendas → produção → MP/MOD/CIF → CPV → despesas → caixa → DRE e balanço projetados.',
    'Produção = Vendas + EF − EI; Compras de MP = Consumo + EF − EI.',
    'Caixa: só entradas e saídas de dinheiro (depreciação fora); recebimentos seguem os prazos das vendas.',
    'Estático (um volume), flexível (ajusta ao real), base zero (justifica tudo), contínuo (horizonte rolante), incremental (anterior + ajuste).',
    'Variação total = volume (flexível − estático) + eficiência (real − flexível).',
    'Centros de custo, receita, lucro e investimento: avalie só o que o gestor controla. ROI = margem × giro; RI = lucro − taxa mínima × investimento; EVA = NOPAT − WACC × capital.',
    'BSC: financeira, clientes, processos internos, aprendizado e crescimento, ligadas por causa e efeito.',
  ],
};
