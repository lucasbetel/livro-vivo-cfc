// Lição 05 — Mensuração, imobilizado, intangível e impairment (demo: depreciação + teste de impairment à caneta).

// Resíduos de ponto flutuante (ex.: -0,000001) viram zero para não aparecer "-R$ 0,00".
const limpa = (x) => (Math.abs(x) < 0.005 ? 0 : x);

// Cronograma de depreciação com teste de impairment no fim do ano `ano`.
function cronograma({ custo, vr, vida, metodo, ano, vjl, vu }) {
  const linhas = [];
  let vc = custo, base = custo, resid = vr, inicio = 0, acum = 0, info = null;
  for (let t = 1; t <= vida; t++) {
    const r = vida - inicio, depreciavel = Math.max(0, base - resid);
    const d = metodo === 'linear' ? depreciavel / r : (depreciavel * (r - (t - inicio) + 1)) / ((r * (r + 1)) / 2);
    vc -= d; acum += d;
    let perda = 0;
    if (t === ano) {
      const rec = Math.max(vjl, vu);
      info = { vcAntes: vc, rec, perda: Math.max(0, vc - rec), novaDep: 0 };
      if (vc - rec > 0.005) {
        perda = vc - rec; vc = rec; base = rec; resid = Math.min(vr, rec); inicio = t;
        const r2 = vida - t;
        if (r2 > 0) info.novaDep = metodo === 'linear' ? (base - resid) / r2 : ((base - resid) * r2) / ((r2 * (r2 + 1)) / 2);
      }
    }
    linhas.push({ ano: t, dep: d, acum, perda, vc: limpa(vc) });
  }
  if (info) info.vcAntes = limpa(info.vcAntes);
  return { linhas, info };
}

function montarDepreciacao(el, kit) {
  const { h, fmt, INK, pen, ui } = kit;
  const CUSTO = 100000;
  const st = { custo: CUSTO, vr: 10000, vida: 5, metodo: 'linear', ano: 2, vjl: 45000, vu: 50000 };
  const corpo = h('div', { style: { display: 'none' } });

  // 1) pergunta → palpite
  el.append(ui.previsao({
    pergunta: 'Máquina: custo R$ 100.000, valor residual R$ 10.000, vida útil de 5 anos, método linear. No fim do <b>ano 2</b>, o valor justo líquido de despesas de venda é R$ 45.000 e o valor em uso é R$ 50.000. Qual é a perda por redução ao valor recuperável?',
    opcoes: ['R$ 14.000', 'R$ 19.000', 'Nenhuma perda'],
    correta: 0,
    explicacao: 'Depreciação anual = (100.000 − 10.000) ÷ 5 = 18.000. Valor contábil no fim do ano 2 = 100.000 − 36.000 = <b>64.000</b>. Valor recuperável = o <b>MAIOR</b> entre 45.000 e 50.000 = 50.000. Perda = 64.000 − 50.000 = <b>14.000</b>. Quem usa o menor (45.000) chega a 19.000 — a pegadinha clássica. Agora mexa nos controles e veja o gráfico.',
    aoResponder: () => { corpo.style.display = ''; render(true); },
  }));

  // 2) controles
  const marcar = (grp, i) => [...grp.children].forEach((x, j) => {
    x.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    x.style.background = j === i ? INK.marca : '';
  });
  const metodos = ui.botoes(['Linear', 'Soma dos dígitos'], (i, b, g) => { st.metodo = i ? 'sdd' : 'linear'; marcar(g, i); render(); });
  marcar(metodos, 0);
  let ctlAno = null;
  const ctlVida = ui.controle({ rotulo: 'Vida útil', min: 3, max: 10, passo: 1, valor: st.vida, formato: (v) => `${v} anos`, aoMudar: (v) => {
    st.vida = v;
    ctlAno.querySelector('input').max = v;
    if (st.ano > v) { st.ano = v; ctlAno.definir(v); }
    render();
  } });
  const ctlVr = ui.controle({ rotulo: 'Valor residual', min: 0, max: 30000, passo: 1000, valor: st.vr, formato: (v) => fmt.brl(v), aoMudar: (v) => { st.vr = v; render(); } });
  ctlAno = ui.controle({ rotulo: 'Teste de impairment no fim do ano', min: 1, max: st.vida, passo: 1, valor: st.ano, formato: (v) => `${v}`, aoMudar: (v) => { st.ano = v; render(); } });
  const ctlVjl = ui.controle({ rotulo: 'Valor justo − despesas de venda', min: 0, max: 100000, passo: 1000, valor: st.vjl, formato: (v) => fmt.brl(v), aoMudar: (v) => { st.vjl = v; render(); } });
  const ctlVu = ui.controle({ rotulo: 'Valor em uso', min: 0, max: 100000, passo: 1000, valor: st.vu, formato: (v) => fmt.brl(v), aoMudar: (v) => { st.vu = v; render(); } });

  const graf = h('div', {});
  const res = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const tab = h('div', { style: { overflowX: 'auto' } });

  // 3) resultado: gráfico à caneta + tabela + explicação
  const render = (animar = false) => {
    const { linhas, info } = cronograma(st);
    graf.innerHTML = '';
    const g = pen.grafico(graf, {
      largura: 640, altura: 360, xmin: 0, xmax: st.vida, ymin: 0, ymax: 120000, marcasX: st.vida, marcasY: 6, margem: 64,
      rotuloX: 'anos', rotuloY: 'valor contábil (R$)', fmtY: (v) => (v ? `${fmt.int(v / 1000)} mil` : '0'),
    });
    g.eixos();
    const { sx, sy } = g;
    const an = animar ? {} : { animar: false };
    g.linha(sx(0), sy(st.vr), sx(st.vida), sy(st.vr), { cor: INK.lapis, tracejado: true, animar: false });
    g.texto(sx(0) + 10, sy(st.vr) - 7, `valor residual ${fmt.int(st.vr / 1000)} mil`, { tamanho: 16, cor: INK.lapis, fonte: 'texto', animar: false });
    // curva do valor contábil (azul antes do teste; verde depois de uma perda)
    let x0 = 0, y0 = CUSTO, depois = false;
    g.circulo(sx(0), sy(CUSTO), 8, { cor: INK.azul, preenchimento: INK.azul, estilo: 'solid', animar: false });
    linhas.forEach((l) => {
      const yAntes = l.vc + l.perda, cor = depois ? INK.verde : INK.azul;
      g.linha(sx(x0), sy(y0), sx(l.ano), sy(yAntes), { cor, espessura: 2.6, ...an });
      g.circulo(sx(l.ano), sy(yAntes), 8, { cor, preenchimento: cor, estilo: 'solid', animar: false });
      if (l.perda > 0) {
        g.seta(sx(l.ano), sy(yAntes), sx(l.ano), sy(l.vc), { cor: INK.vermelho, espessura: 2.8, ponta: 10, ...an });
        g.circulo(sx(l.ano), sy(l.vc), 9, { cor: INK.vermelho, preenchimento: INK.vermelho, estilo: 'solid', animar: false });
        depois = true;
      }
      x0 = l.ano; y0 = l.vc;
    });
    // marcas do valor justo líquido (VJL) e do valor em uso (VU) no ano do teste
    // rótulos à esquerda da marca (a linha verde segue à direita); à direita só se não houver espaço
    const xa = sx(st.ano), lado = xa - sx(0) > 175 ? -1 : 1;
    const yJ = sy(st.vjl), yU = sy(st.vu);
    let lyJ = yJ + 5, lyU = yU + 5;
    if (Math.abs(yJ - yU) < 16) { if (yJ <= yU) { lyJ -= 9; lyU += 9; } else { lyJ += 9; lyU -= 9; } }
    [[yJ, lyJ, `VJL ${fmt.int(st.vjl / 1000)} mil`, st.vjl > st.vu], [yU, lyU, `VU ${fmt.int(st.vu / 1000)} mil`, st.vu >= st.vjl]].forEach(([y, ly, t, maior]) => {
      const cor = maior ? INK.laranja : INK.lapis;
      g.linha(xa - 8, y, xa + 8, y, { cor, espessura: 2.2, animar: false });
      g.texto(xa + lado * 14, ly, t + (maior ? ' ← maior' : ''), { ancora: lado > 0 ? 'start' : 'end', tamanho: 15, cor, fonte: 'texto', peso: maior ? 700 : 400, animar: false });
    });
    g.texto(sx(st.vida), 26, '— antes do teste', { ancora: 'end', tamanho: 17, cor: INK.azul, animar: false });
    if (depois) g.texto(sx(st.vida), 46, '— depois da perda', { ancora: 'end', tamanho: 17, cor: INK.verde, animar: false });

    // explicação
    if (info.perda > 0.005) {
      res.innerHTML = `<p>Valor contábil no fim do ano ${st.ano}: <b>${fmt.brl(info.vcAntes)}</b>. Recuperável = maior entre ${fmt.brl(st.vjl)} (VJL) e ${fmt.brl(st.vu)} (valor em uso) = <b>${fmt.brl(info.rec)}</b>.</p>
<p class="nok">Perda por redução ao valor recuperável: <b>${fmt.brl(info.perda)}</b> (seta vermelha).</p>
<p class="lanc">D – Perda por Redução ao Valor Recuperável (resultado) · C – Perdas Estimadas por Redução ao Valor Recuperável (redutora do imobilizado) ${fmt.brl(info.perda)}</p>
<p>${st.ano < st.vida ? `Daí em diante, a depreciação é recalculada sobre o novo valor contábil (linha verde): ${st.metodo === 'linear' ? `${fmt.brl(info.novaDep)} por ano` : `${fmt.brl(info.novaDep)} no ano seguinte, decrescendo`}.` : 'Como o teste foi no último ano, não há depreciação posterior.'}</p>`;
    } else {
      res.innerHTML = `<p>Valor contábil no fim do ano ${st.ano}: <b>${fmt.brl(info.vcAntes)}</b>. Recuperável = maior entre VJL e valor em uso = <b>${fmt.brl(info.rec)}</b>, que não é menor que o valor contábil.</p>
<p class="ok">✔ Sem perda. Repare: o ativo <b>não</b> é aumentado acima do valor contábil — no Brasil não existe reavaliação espontânea de imobilizado.</p>`;
    }
    tab.innerHTML = '';
    tab.append(ui.tabela(['Ano', 'Depreciação', 'Dep. acumulada', 'Perda (impairment)', 'Valor contábil'], [
      ['0', '—', '—', '—', fmt.brl(st.custo)],
      ...linhas.map((l) => [String(l.ano), fmt.brl(l.dep), fmt.brl(l.acum), l.perda > 0 ? `<span class="caneta-vermelha">${fmt.brl(l.perda)}</span>` : '—', fmt.brl(l.vc)]),
    ]));
  };

  corpo.append(
    h('div', { class: 'demo-painel' },
      h('div', { class: 'demo-linha', style: { flexWrap: 'wrap', alignItems: 'center' } }, h('b', {}, 'Método:'), metodos),
      h('div', { class: 'demo-linha', style: { flexWrap: 'wrap' } }, ctlVida, ctlVr),
      h('div', { class: 'demo-linha', style: { flexWrap: 'wrap' } }, ctlAno, ctlVjl, ctlVu)),
    graf, res, tab);
  el.append(corpo);
}

export default {
  id: '05-ativos-mensuracao',
  numero: 5,
  disciplina: 'Contabilidade Geral',
  titulo: 'Mensuração, imobilizado, intangível e impairment',
  subtitulo: 'Quanto vale o que a empresa tem — e quanto isso perde com o tempo',
  incidencia: 'alta',
  tempo: 70,
  pergunta: 'Uma máquina pode aparecer no balanço por um valor MENOR que o custo menos a depreciação? E por um valor MAIOR?',
  previsao: {
    pergunta: 'Uma máquina custou R$ 100.000, tem vida útil de 10 anos e valor residual de R$ 10.000. Qual é a depreciação anual pelo método linear?',
    opcoes: ['R$ 10.000', 'R$ 9.000', 'R$ 11.000'],
    correta: 1,
    explicacao: 'Deprecia-se só o <b>valor depreciável</b>: custo − valor residual = 100.000 − 10.000 = 90.000. Dividido por 10 anos = <b>9.000</b> por ano. O valor residual é o que a empresa espera recuperar no fim: ele não é depreciado.',
  },
  paginas: [
    {
      titulo: 'Bases de mensuração: o cardápio',
      html: `<p>Mensurar é dar um valor em reais a um ativo ou passivo. A Estrutura Conceitual separa o <b>custo histórico</b> dos <b>valores atuais</b>, e o edital cobra todos os nomes abaixo:</p>
<table class="tabela"><thead><tr><th>Base</th><th>Ideia</th><th>Olhar</th></tr></thead><tbody>
<tr><td><b>Custo histórico</b></td><td>quanto foi pago (mais custos de transação); no passivo, quanto foi recebido</td><td>passado, entrada</td></tr>
<tr><td><b>Custo corrente</b></td><td>quanto se pagaria <b>hoje</b> para adquirir um ativo equivalente</td><td>presente, entrada</td></tr>
<tr><td><b>Valor realizável (de liquidação)</b></td><td>quanto se obteria hoje vendendo o ativo em venda ordenada; no passivo, quanto se pagaria, sem desconto, para liquidá-lo</td><td>presente, saída</td></tr>
<tr><td><b>Valor presente</b></td><td>fluxos de caixa futuros descontados a uma taxa</td><td>futuro trazido a hoje</td></tr>
<tr><td><b>Valor justo</b> (NBC TG 46)</td><td>preço que seria recebido pela venda de um ativo ou pago pela transferência de um passivo, em transação não forçada entre participantes do mercado, na data de mensuração</td><td>saída, visão do <b>mercado</b></td></tr>
<tr><td><b>Valor em uso</b></td><td>valor presente dos fluxos que a entidade espera obter com o uso contínuo do ativo e com sua alienação no fim da vida útil</td><td>visão da <b>própria entidade</b></td></tr>
<tr><td><b>Valor de cumprimento</b></td><td>valor presente do caixa que a entidade espera transferir para cumprir um passivo</td><td>visão da entidade (passivos)</td></tr>
<tr><td><b>Custo amortizado</b> (NBC TG 48)</td><td>valor inicial − amortizações de principal ± juros pela taxa efetiva − perdas de crédito</td><td>instrumentos financeiros</td></tr></tbody></table>
<div class="caixa"><b>Hierarquia do valor justo (NBC TG 46):</b> Nível 1 = preço cotado em mercado ativo para item idêntico; Nível 2 = outros dados observáveis, direta ou indiretamente; Nível 3 = dados não observáveis que reflitam as premissas dos participantes do mercado; dados próprios podem ser o ponto de partida, com os ajustes necessários.</div>
<aside class="nota">Valor justo é a visão do <b>mercado</b>; valor em uso é a visão da <b>empresa</b>. A FGV adora trocar as duas definições.</aside>`,
    },
    {
      titulo: 'Imobilizado: reconhecimento e custo',
      html: `<p><b>Ativo imobilizado</b> (NBC TG 27) é o item <b>tangível</b> mantido para uso na produção ou no fornecimento de bens e serviços, para aluguel a terceiros ou para fins administrativos, e que se espera usar por <b>mais de um período</b>. É reconhecido quando for provável que gere benefícios econômicos futuros e quando o custo puder ser mensurado com confiabilidade.</p>
<table class="tabela"><thead><tr><th>Entra no custo</th><th>NÃO entra no custo (é despesa ou outro ativo)</th></tr></thead><tbody>
<tr><td>preço de compra, impostos de importação e tributos <b>não recuperáveis</b>, menos descontos comerciais</td><td>tributos recuperáveis</td></tr>
<tr><td>frete, preparação do local, instalação e montagem</td><td>treinamento de pessoal</td></tr>
<tr><td>testes de funcionamento e honorários profissionais (engenheiros, arquitetos)</td><td>publicidade e custos de abertura de nova instalação</td></tr>
<tr><td>estimativa inicial dos custos de desmontagem, remoção e restauração do local</td><td>custos administrativos e perdas operacionais iniciais</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo:</b> máquina com preço de R$ 200.000; IPI não recuperável R$ 10.000; frete R$ 5.000; instalação R$ 8.000; treinamento dos operadores R$ 3.000.<br>Custo = 200.000 + 10.000 + 5.000 + 8.000 = <b>223.000</b>. O treinamento (3.000) vai para a despesa.</div>
<p><b>Depois do reconhecimento:</b> custo (−) depreciação acumulada (−) perdas por redução ao valor recuperável. A norma internacional admite o modelo de reavaliação, mas no Brasil a <b>reavaliação espontânea é vedada</b> desde a Lei 11.638/2007.</p>
<aside class="nota">Componentes relevantes com vidas úteis diferentes (ex.: motores e fuselagem de um avião) são depreciados separadamente.</aside>`,
    },
    {
      titulo: 'Depreciação: linear, soma dos dígitos e unidades produzidas',
      html: `<div class="formula">Valor depreciável = custo − valor residual</div>
<ul class="lista-check"><li>Começa quando o ativo está <b>disponível para uso</b> (no local e na condição de funcionar), mesmo que ainda não esteja sendo usado.</li>
<li>Não para quando o ativo fica ocioso (exceto no método das unidades produzidas, em que produção zero dá depreciação zero).</li>
<li>Vida útil, valor residual e método são revisados pelo menos no fim de cada exercício; mudanças são <b>mudança de estimativa</b> (efeito prospectivo).</li>
<li><b>Terrenos não são depreciados</b> (vida útil ilimitada); o edifício construído sobre eles, sim.</li></ul>
<table class="tabela"><thead><tr><th>Método</th><th>Cálculo</th></tr></thead><tbody>
<tr><td><b>Linear</b></td><td>(custo − residual) ÷ vida útil: a mesma quota todo ano</td></tr>
<tr><td><b>Soma dos dígitos</b> (decrescente)</td><td>(custo − residual) × anos restantes ÷ (1 + 2 + … + n)</td></tr>
<tr><td><b>Unidades produzidas</b></td><td>(custo − residual) × produção do período ÷ produção total estimada</td></tr></tbody></table>
<div class="exemplo"><b>Soma dos dígitos:</b> custo 110.000, residual 10.000, 4 anos → soma = 1 + 2 + 3 + 4 = 10; valor depreciável 100.000.<br>Ano 1: 4/10 = 40.000 · Ano 2: 3/10 = 30.000 · Ano 3: 2/10 = 20.000 · Ano 4: 1/10 = 10.000.</div>
<div class="exemplo"><b>Unidades produzidas:</b> máquina de 500.000, residual 50.000, capacidade estimada de 900.000 peças; no ano, produziu 120.000 → 450.000 × 120.000 ÷ 900.000 = <b>60.000</b>.</div>
<div class="exemplo"><b>Pro rata:</b> depreciação linear de 9.000 por ano, ativo disponível para uso em 1º de abril → no 1º ano, 9 meses: 9.000 × 9/12 = <b>6.750</b>.</div>
<p>Lançamento: D – Despesa de Depreciação (ou custo de produção, se for máquina da fábrica) / C – Depreciação Acumulada (redutora do imobilizado).</p>`,
    },
    {
      titulo: 'Baixa, amortização e exaustão',
      html: `<div class="formula">Valor contábil = custo − depreciação acumulada − perdas por impairment</div>
<div class="formula">Ganho (perda) na baixa = valor da venda − valor contábil</div>
<div class="exemplo"><b>Exemplo:</b> máquina com custo de R$ 80.000 e depreciação acumulada de R$ 50.000 (valor contábil 30.000), vendida à vista por R$ 36.000 → <b>ganho de 6.000</b>.<br>
D – Caixa 36.000<br>D – Depreciação Acumulada 50.000<br>C – Máquinas 80.000<br>C – Ganho na Alienação de Imobilizado 6.000</div>
<p>O ganho ou a perda vai para o resultado (outras receitas e despesas operacionais), e o ganho <b>não</b> é classificado como receita de vendas (NBC TG 27).</p>
<table class="tabela"><thead><tr><th>Redução</th><th>Aplica-se a</th><th>Exemplos</th></tr></thead><tbody>
<tr><td><b>Depreciação</b></td><td>bens tangíveis (imobilizado)</td><td>máquinas, veículos, edifícios</td></tr>
<tr><td><b>Amortização</b></td><td>intangíveis de vida útil definida e direitos de prazo limitado</td><td>software, patentes, licenças</td></tr>
<tr><td><b>Exaustão</b></td><td>recursos naturais exauríveis</td><td>jazidas minerais, poços de petróleo</td></tr></tbody></table>
<div class="exemplo"><b>Exaustão:</b> jazida adquirida por R$ 2.000.000, com reserva estimada de 400.000 toneladas; no ano extraíram-se 50.000 t → 50.000 ÷ 400.000 = 12,5% → exaustão de <b>250.000</b>.</div>
<aside class="nota">Pelas normas atuais, rebanhos e florestas são ativos biológicos (NBC TG 29), mensurados pelo valor justo menos despesas de venda.</aside>`,
    },
    {
      titulo: 'Intangível: marcas, softwares e P&D',
      html: `<p><b>Ativo intangível</b> (NBC TG 04) é um ativo não monetário <b>identificável</b> e <b>sem substância física</b>. Identificável = separável (pode ser vendido, licenciado, alugado) ou resultante de direitos contratuais ou legais.</p>
<table class="tabela"><thead><tr><th>Gasto</th><th>Tratamento</th></tr></thead><tbody>
<tr><td>Fase de <b>pesquisa</b></td><td><b>sempre despesa</b></td></tr>
<tr><td>Fase de <b>desenvolvimento</b></td><td>ativo <b>se</b> demonstrar todos os critérios: viabilidade técnica, intenção de concluir, capacidade de usar ou vender, forma de gerar benefícios futuros, recursos para concluir e mensuração confiável dos gastos</td></tr>
<tr><td>Não dá para separar pesquisa de desenvolvimento</td><td>tudo é tratado como pesquisa (despesa)</td></tr>
<tr><td>Marcas, listas de clientes e títulos de publicações <b>gerados internamente</b></td><td>despesa (não se reconhece ativo)</td></tr>
<tr><td>Goodwill gerado internamente</td><td>não se reconhece</td></tr>
<tr><td>Goodwill (ágio por expectativa de rentabilidade futura) adquirido em combinação de negócios</td><td>ativo, <b>não amortizado</b>, com teste de impairment anual</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo:</b> no ano, uma empresa gastou 300.000 em pesquisa, 100.000 em desenvolvimento antes de atender aos critérios e 250.000 em desenvolvimento depois de atendê-los.<br>Intangível = <b>250.000</b>. Despesa = 300.000 + 100.000 = <b>400.000</b> (gasto já lançado como despesa não volta para o ativo).</div>
<div class="caixa"><b>Vida útil definida:</b> amortiza (em geral, linear; valor residual presumido zero). <b>Vida útil indefinida:</b> <mark>não amortiza</mark>; faz teste de impairment anual e sempre que houver indício, e revisa a cada período se a vida continua indefinida. Indefinida não quer dizer infinita.</div>`,
    },
    {
      titulo: 'Redução ao valor recuperável (impairment)',
      html: `<p>NBC TG 01: nenhum ativo pode ficar no balanço por valor maior que o seu <b>valor recuperável</b>.</p>
<div class="formula">Valor recuperável = MAIOR entre (valor justo − despesas de venda) e valor em uso</div>
<p>A lógica: a empresa escolhe o melhor caminho, vender o ativo ou continuar usando. Só há perda se <b>os dois caminhos</b> renderem menos que o valor contábil.</p>
<div class="exemplo"><b>Exemplo:</b> custo 800.000; depreciação acumulada 300.000 → valor contábil <b>500.000</b>. Valor justo líquido de despesas de venda 420.000; valor em uso 460.000.<br>Recuperável = maior entre 420.000 e 460.000 = 460.000 → perda de <b>40.000</b>.<br>D – Perda por Redução ao Valor Recuperável (resultado) 40.000<br>C – Perdas Estimadas por Redução ao Valor Recuperável (redutora do ativo) 40.000<br>A partir daí, deprecia-se o novo valor contábil (460.000), descontado o valor residual, ao longo da vida útil remanescente.</div>
<ul class="lista-check"><li><b>Quando testar:</b> sempre que houver indício de desvalorização; e <b>todo ano, mesmo sem indício</b>, para intangível de vida útil indefinida, intangível ainda não disponível para uso e goodwill.</li>
<li><b>Reversão:</b> permitida se o recuperável voltar a subir, limitada ao valor contábil que existiria sem a perda (líquido da depreciação). <b>Goodwill: reversão proibida.</b></li>
<li>Se não der para estimar o recuperável de um ativo isolado, testa-se a <b>unidade geradora de caixa</b> a que ele pertence.</li></ul>
<div class="caixa alerta"><b>Pegadinha nº 1 do assunto:</b> usar o <b>menor</b> entre VJL e valor em uso. É o <b>maior</b>. (O "menor" é dos estoques: custo ou VRL.)</div>`,
    },
    {
      titulo: 'Ativo biológico, propriedade para investimento e mantido para venda',
      html: `<table class="tabela"><thead><tr><th>Item</th><th>O que é</th><th>Mensuração</th></tr></thead><tbody>
<tr><td><b>Ativo biológico</b> (NBC TG 29)</td><td>animal ou planta vivos (gado, lavoura em formação, floresta)</td><td><b>valor justo menos despesas de venda</b>, no reconhecimento e em cada balanço, com variações no <b>resultado</b>. Excepcionalmente, se no reconhecimento inicial não houver preço cotado e as estimativas alternativas de valor justo forem claramente não confiáveis: custo − depreciação − impairment. Assim que a mensuração confiável for possível, passa-se ao valor justo menos despesas de venda (itens 30–31)</td></tr>
<tr><td><b>Produto agrícola</b></td><td>o que se colhe (leite, café, laranja)</td><td>valor justo menos despesas de venda <b>no ponto da colheita</b>; depois vira estoque (NBC TG 16)</td></tr>
<tr><td><b>Planta portadora</b></td><td>planta usada só para produzir frutos (laranjeira, videira)</td><td>imobilizado (NBC TG 27); os frutos em formação continuam sendo ativo biológico</td></tr>
<tr><td><b>Propriedade para investimento</b> (NBC TG 28)</td><td>terreno ou edifício mantido para <b>aluguel</b> ou <b>valorização</b>, e não para uso próprio nem para venda no curso normal</td><td>custo na entrada; depois, método do <b>valor justo</b> (variação no resultado) ou do <b>custo</b></td></tr>
<tr><td><b>Ativo não circulante mantido para venda</b> (NBC TG 31)</td><td>ativo cujo valor será recuperado principalmente pela <b>venda</b>, disponível para venda imediata e com venda altamente provável em até 1 ano</td><td><b>menor</b> entre valor contábil e valor justo menos despesas de venda; <b>deixa de ser depreciado</b>; apresentado separadamente no balanço</td></tr></tbody></table>
<div class="exemplo"><b>Mantido para venda:</b> imóvel com valor contábil de 300.000; valor justo 280.000; despesas de venda 10.000 → 270.000 → perda de <b>30.000</b> no resultado e fim da depreciação.</div>
<p><b>Operação descontinuada</b> (NBC TG 31): componente da entidade que foi baixado ou está classificado como mantido para venda e que representa uma linha de negócio ou área geográfica importante e separada. Na DRE, seu resultado aparece em <b>valor único</b>, líquido de tributos, separado das operações continuadas.</p>`,
    },
    {
      titulo: 'Custo atribuído, atualização monetária e variação cambial',
      html: `<p><b>Custo atribuído</b> (<i>deemed cost</i> — ITG 10): na adoção inicial das normas internacionais (balanços de 2010), as empresas puderam ajustar, <b>uma única vez</b>, o imobilizado e as propriedades para investimento ao valor justo, que passou a ser o novo "custo". A contrapartida foi para <b>Ajustes de Avaliação Patrimonial</b> (PL), líquida dos tributos diferidos. Não é reavaliação, porque não se repete.</p>
<p><b>Atualização monetária:</b> a correção monetária de balanços foi extinta a partir de 1996 (Lei 9.249/95). Hoje se atualizam só direitos e obrigações <b>contratualmente indexados</b> (ex.: empréstimo corrigido pelo IPCA), gerando <b>variação monetária ativa</b> (receita financeira) ou <b>passiva</b> (despesa financeira).</p>
<p><b>Variação cambial</b> (NBC TG 02): a transação em moeda estrangeira é registrada pela taxa da data da transação. Em cada balanço:</p>
<ul class="lista-check"><li><b>itens monetários</b> (clientes, fornecedores e empréstimos em moeda estrangeira) → convertidos pela <b>taxa de fechamento</b>; a diferença vai para o <b>resultado</b>;</li>
<li><b>itens não monetários</b> mensurados ao custo (estoques, imobilizado) → ficam na <b>taxa histórica</b>.</li></ul>
<div class="exemplo"><b>Exemplo:</b> importação a prazo de US$ 10.000 com dólar a R$ 5,00 → Estoques e Fornecedores de 50.000. No balanço, dólar a R$ 5,40 → Fornecedores = 54.000.<br>D – Variação Cambial Passiva (despesa financeira) / C – Fornecedores 4.000. O estoque continua em 50.000.</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: depreciação e teste de impairment',
    instrucao: 'Faça seu palpite sobre a perda. Depois mude o método, a vida útil, o valor residual, o ano do teste e os valores justo e em uso. O gráfico à caneta mostra o valor contábil caindo e a seta vermelha da perda — que só aparece quando o MAIOR dos dois valores fica abaixo do valor contábil.',
    montar: montarDepreciacao,
  },
  macetes: [
    'Valor depreciável = custo <b>−</b> valor residual. Terreno não deprecia.',
    'Deprecia a partir de quando está <b>disponível para uso</b>, não de quando começa a ser usado.',
    'Soma dos dígitos: soma = n(n+1)/2; o 1º ano leva a maior fatia (n/soma).',
    'Impairment: recuperável = <b>MAIOR</b> entre VJL e valor em uso. Estoque: <b>menor</b> entre custo e VRL.',
    'Goodwill e intangível de vida indefinida: <b>não amortizam</b> e têm teste anual. Perda de goodwill não se reverte.',
    'Pesquisa = sempre despesa; desenvolvimento = ativo só com todos os critérios. Marca gerada internamente não vira ativo.',
    'Ativo biológico: valor justo − despesas de venda, com variação no <b>resultado</b>.',
    'Mantido para venda: <b>menor</b> entre valor contábil e VJ − despesas de venda; para de depreciar.',
  ],
  questoes: [
    {
      enunciado: 'Uma máquina foi adquirida e ficou disponível para uso em 1º/04/X1, por R$ 240.000. Valor residual estimado: R$ 24.000; vida útil: 10 anos; método linear. A despesa de depreciação de X1 é:',
      alternativas: ['R$ 21.600.', 'R$ 16.200.', 'R$ 18.000.', 'R$ 24.000.'],
      correta: 1,
      comentario: 'Depreciação anual = (240.000 − 24.000) ÷ 10 = 21.600. Em X1 a máquina ficou disponível por 9 meses (abril a dezembro): 21.600 × 9/12 = <b>16.200</b>. (18.000 ignora o valor residual.)',
    },
    {
      enunciado: 'Um veículo custou R$ 100.000, tem valor residual de R$ 10.000 e vida útil de 5 anos. Pelo método da soma dos dígitos dos anos (decrescente), a depreciação do <b>2º ano</b> é:',
      alternativas: ['R$ 30.000,00.', 'R$ 18.000,00.', 'R$ 26.666,67.', 'R$ 24.000,00.'],
      correta: 3,
      comentario: 'Soma dos dígitos = 1 + 2 + 3 + 4 + 5 = 15. Valor depreciável = 90.000. 2º ano = 4/15 × 90.000 = <b>24.000</b>. (30.000 é o 1º ano; 26.666,67 esquece o valor residual.)',
    },
    {
      enunciado: 'Um equipamento tem valor contábil de R$ 350.000. Seu valor justo líquido de despesas de venda é R$ 290.000 e seu valor em uso é R$ 320.000. Pela NBC TG 01, a perda por redução ao valor recuperável é:',
      alternativas: ['R$ 60.000.', 'zero, pois o valor em uso é positivo.', 'R$ 30.000.', 'R$ 90.000.'],
      correta: 2,
      comentario: 'Valor recuperável = <b>maior</b> entre 290.000 e 320.000 = 320.000. Perda = 350.000 − 320.000 = <b>30.000</b>. (60.000 usa o menor valor — erro clássico.)',
    },
    {
      enunciado: 'Um equipamento com custo de R$ 150.000 e depreciação acumulada de R$ 105.000 foi vendido à vista por R$ 38.000. O resultado na alienação foi:',
      alternativas: ['ganho de R$ 38.000.', 'perda de R$ 7.000.', 'ganho de R$ 7.000.', 'perda de R$ 112.000.'],
      correta: 1,
      comentario: 'Valor contábil = 150.000 − 105.000 = 45.000. Resultado = 38.000 − 45.000 = <b>perda de 7.000</b>. Lançamento: D – Caixa 38.000; D – Depreciação Acumulada 105.000; D – Perda na Alienação 7.000; C – Equipamentos 150.000.',
    },
    {
      enunciado: 'Na aquisição de uma máquina, uma indústria incorreu nos seguintes gastos: preço de R$ 300.000, com ICMS recuperável de R$ 36.000 incluído; frete R$ 12.000; instalação e montagem R$ 18.000; treinamento dos operadores R$ 9.000. O custo do imobilizado é:',
      alternativas: ['R$ 294.000.', 'R$ 303.000.', 'R$ 330.000.', 'R$ 339.000.'],
      correta: 0,
      comentario: 'Custo = 300.000 − 36.000 (recuperável não é custo) + 12.000 + 18.000 = <b>294.000</b>. O treinamento é despesa (NBC TG 27). O crédito de ICMS de imobilizado é aproveitado em 48 parcelas, mas continua sendo um ativo a recuperar, fora do custo.',
    },
    {
      enunciado: 'No exercício, uma empresa de tecnologia gastou: R$ 200.000 em pesquisa; R$ 150.000 na fase de desenvolvimento, já atendidos todos os critérios da NBC TG 04; R$ 30.000 em treinamento; e R$ 80.000 em publicidade de sua marca, gerada internamente. O valor a reconhecer no intangível é:',
      alternativas: ['R$ 350.000.', 'R$ 230.000.', 'R$ 460.000.', 'R$ 150.000.'],
      correta: 3,
      comentario: 'Só o desenvolvimento que atende a todos os critérios vira ativo: <b>150.000</b>. Pesquisa, treinamento e gastos com marca gerada internamente são despesa.',
    },
    {
      enunciado: 'Segundo a NBC TG 46, valor justo é:',
      alternativas: ['o valor presente dos fluxos de caixa que a entidade espera obter com o uso contínuo do ativo.', 'o montante que seria pago hoje para adquirir um ativo equivalente.', 'o preço que seria recebido pela venda de um ativo ou pago pela transferência de um passivo em transação não forçada entre participantes do mercado, na data de mensuração.', 'o valor pago na aquisição, acrescido dos custos de transação.'],
      correta: 2,
      comentario: 'Valor justo é um preço de <b>saída</b>, na visão do <b>mercado</b>. As outras alternativas definem valor em uso (A), custo corrente (B) e custo histórico (D).',
    },
    {
      enunciado: 'De acordo com a NBC TG 29, um rebanho bovino cujo valor justo pode ser mensurado de forma confiável deve ser mensurado:',
      alternativas: ['pelo valor justo menos as despesas de venda, com as variações reconhecidas no resultado do período.', 'pelo custo de aquisição menos a exaustão acumulada.', 'pelo valor justo, com as variações reconhecidas em ajustes de avaliação patrimonial.', 'pelo menor valor entre o custo e o valor realizável líquido.'],
      correta: 0,
      comentario: 'Ativo biológico: <b>valor justo menos despesas de venda</b>, no reconhecimento inicial e em cada balanço, e a variação vai para o <b>resultado</b> (não para o PL).',
    },
    {
      enunciado: 'Um imóvel de uso próprio foi classificado como mantido para venda (NBC TG 31). Seu valor contábil é R$ 500.000, o valor justo é R$ 480.000 e as despesas de venda estimadas são R$ 20.000. A entidade deve:',
      alternativas: ['manter o imóvel por R$ 500.000 e continuar a depreciá-lo.', 'reconhecer perda de R$ 20.000 e continuar a depreciá-lo.', 'mensurar o imóvel por R$ 480.000, com a diferença em ajustes de avaliação patrimonial.', 'mensurar o imóvel por R$ 460.000, reconhecendo perda de R$ 40.000 no resultado, e deixar de depreciá-lo.'],
      correta: 3,
      comentario: 'Mantido para venda = <b>menor</b> entre o valor contábil (500.000) e o valor justo menos despesas de venda (480.000 − 20.000 = 460.000). Perda de <b>40.000</b> no resultado, e o ativo <b>deixa de ser depreciado</b>.',
    },
    {
      enunciado: 'Uma empresa importou mercadorias a prazo por US$ 20.000, quando o dólar valia R$ 5,00. Na data do balanço, o dólar estava cotado a R$ 5,30 e as mercadorias continuavam em estoque. Pela NBC TG 02:',
      alternativas: ['estoque e fornecedor são ajustados para R$ 106.000, sem efeito no resultado.', 'o fornecedor é ajustado para R$ 106.000, com despesa de variação cambial de R$ 6.000, e o estoque é mantido em R$ 100.000.', 'nenhum ajuste é feito até a data do pagamento.', 'o fornecedor é ajustado para R$ 106.000, com contrapartida em ajustes de avaliação patrimonial.'],
      correta: 1,
      comentario: 'Fornecedor é item <b>monetário</b>: convertido pela taxa de fechamento (20.000 × 5,30 = 106.000), e a diferença de 6.000 é <b>variação cambial passiva</b> no resultado. O estoque é item não monetário ao custo: fica na taxa histórica (100.000).',
    },
  ],
  resumo: [
    'Bases: custo histórico, custo corrente, valor realizável, valor presente, valor justo (mercado, saída), valor em uso (entidade), valor de cumprimento (passivos), custo amortizado.',
    'Imobilizado: custo = preço + tributos não recuperáveis + gastos para colocar em funcionamento (+ desmontagem estimada); treinamento é despesa.',
    'Depreciação: (custo − residual) ÷ vida útil; começa quando o ativo está disponível para uso; terreno não deprecia.',
    'Soma dos dígitos: fração decrescente n/soma; unidades produzidas: proporcional à produção.',
    'Baixa: ganho ou perda = valor da venda − valor contábil, no resultado (não é receita de vendas).',
    'Depreciação (tangível), amortização (intangível de vida definida), exaustão (recursos naturais).',
    'Intangível: pesquisa = despesa; desenvolvimento = ativo se atender a todos os critérios; vida indefinida não amortiza.',
    'Impairment: recuperável = maior entre VJL e valor em uso; perda no resultado; goodwill não reverte.',
    'Ativo biológico: VJ − despesas de venda no resultado. Mantido para venda: menor entre contábil e VJ − despesas; sem depreciação.',
    'Variação cambial: itens monetários pela taxa de fechamento, diferença no resultado; não monetários ao custo ficam na taxa histórica.',
  ],
};
