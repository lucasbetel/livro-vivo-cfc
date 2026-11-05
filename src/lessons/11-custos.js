// Lição 11 — Contabilidade de Custos. Demo: custeio por absorção × variável (produção × vendas).
const DADOS = { preco: 80, cv: 20, cf: 30000, dv: 5, df: 10000 };

// Apura o resultado do mês pelos dois métodos (sem estoque inicial).
function apurar(prod, vend) {
  const { preco, cv, cf, dv, df } = DADOS;
  const cfu = cf / prod;
  const custoAbs = cv + cfu;
  const receita = vend * preco;
  const ef = prod - vend;
  const abs = { cpv: vend * custoAbs, dv: vend * dv, df };
  abs.lb = receita - abs.cpv;
  abs.lucro = abs.lb - abs.dv - abs.df;
  abs.estoque = ef * custoAbs;
  const vari = { cvv: vend * cv, dv: vend * dv, cf, df };
  vari.mc = receita - vari.cvv - vari.dv;
  vari.lucro = vari.mc - vari.cf - vari.df;
  vari.estoque = ef * cv;
  return { cfu, custoAbs, receita, ef, abs, vari, dif: abs.lucro - vari.lucro };
}

function montarCusteio(el, kit) {
  const { h, fmt, INK, ui, pen } = kit;
  const estreito = (el.clientWidth || 640) < 520;
  const XMIN = 500, XMAX = 2000, YMIN = -20000, YMAX = 60000;
  let prod = 1500, vend = 1000, iniciado = false, dyn = [];

  const painel = h('div', { class: 'demo-painel', style: { display: 'none' } });
  const prev = ui.previsao({
    pergunta: 'A fábrica vende <b>1.000</b> unidades no mês, mas resolve produzir <b>1.500</b>. Qual método de custeio mostra o <b>maior lucro</b> nesse mês?',
    opcoes: ['Custeio por absorção', 'Custeio variável', 'Os dois mostram o mesmo lucro'],
    correta: 0,
    explicacao: 'No absorção, cada unidade produzida carrega um pedaço do custo fixo. As 500 unidades que sobram levam o seu pedaço para o <b>estoque</b> (Ativo), em vez de virar despesa no mês. No variável, o custo fixo inteiro vai para o resultado. Agora mexa nos controles abaixo e confira no gráfico.',
    aoResponder: () => iniciar(),
  });

  const dados = h('p', { class: 'demo-fato', html: `<b>Dados fixos:</b> preço ${fmt.brl(DADOS.preco)}/un. · custo variável ${fmt.brl(DADOS.cv)}/un. · custo fixo de produção ${fmt.brl(DADOS.cf)}/mês · despesa variável de venda ${fmt.brl(DADOS.dv)}/un. · despesas fixas ${fmt.brl(DADOS.df)}/mês · sem estoque inicial.` });
  let cVend = null;
  const cProd = ui.controle({
    rotulo: 'Produção do mês (un.)', min: XMIN, max: XMAX, passo: 100, valor: prod, formato: (v) => fmt.int(v),
    aoMudar: (v) => { prod = v; if (vend > prod) { vend = prod; cVend.definir(vend); } desenhar(); },
  });
  cVend = ui.controle({
    rotulo: 'Vendas do mês (un.)', min: XMIN, max: 1500, passo: 100, valor: vend, formato: (v) => fmt.int(v),
    aoMudar: (v) => { vend = v; if (vend > prod) { prod = vend; cProd.definir(prod); } desenhar(); },
  });
  const atalhos = ui.botoes(['Produção = vendas', 'Produz 500 a mais', 'Produção máxima'], (i) => {
    prod = i === 0 ? vend : i === 1 ? Math.min(XMAX, vend + 500) : XMAX;
    cProd.definir(prod);
    desenhar();
  });
  const caixaGraf = h('div', {});
  const legenda = h('p', { class: 'demo-fato', html: `<span style="color:${INK.azul}">● azul</span> = lucro pelo absorção · <span style="color:${INK.verde}">● verde</span> = lucro pelo variável · <span style="color:${INK.vermelho}">barra vermelha</span> = custo fixo que ficou no estoque (a diferença de lucro) · faixa cinza = produção menor que as vendas (só seria possível com estoque inicial).` });
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const tab = h('div', { class: 'tabela-rolagem', style: { overflowX: 'auto' } });
  painel.append(dados, cProd, cVend, atalhos, caixaGraf, legenda, msg, tab);
  el.append(prev, painel);

  const g = pen.grafico(caixaGraf, {
    largura: estreito ? 420 : 640, altura: estreito ? 340 : 380,
    xmin: XMIN, xmax: XMAX, ymin: YMIN, ymax: YMAX, marcasX: estreito ? 3 : 6, marcasY: 8,
    rotuloX: 'produção (un.)', fmtY: (v) => fmt.int(v / 1000),
  });
  const add = (no) => { dyn.push(no); return no; };
  const corLucro = (v) => `<b class="${v >= 0 ? 'ok' : 'nok'}">${fmt.brl(v)}</b>`;

  function iniciar() {
    if (iniciado) return;
    iniciado = true;
    painel.style.display = '';
    g.eixos();
    g.linha(g.sx(XMIN), g.sy(0), g.sx(XMAX), g.sy(0), { cor: INK.lapis, tracejado: true });
    g.texto(g.sx(XMIN) + 14, g.sy(YMAX) - 5, 'lucro (R$ mil)', { tamanho: 17, cor: INK.lapis });
    desenhar();
  }

  function desenhar() {
    if (!iniciado) return;
    dyn.forEach((n) => n.remove());
    dyn = [];
    const r = apurar(prod, vend);
    const yTop = g.sy(YMAX), yBase = g.sy(YMIN);
    // região impossível: produção menor que as vendas
    if (vend > XMIN) {
      const x0 = g.sx(XMIN), x1 = g.sx(vend);
      add(g.retangulo(x0, yTop, x1 - x0, yBase - yTop, { cor: INK.lapis, preenchimento: 'rgba(107,107,107,0.35)', espaco: 12, animar: false }));
      if (x1 - x0 > 120) {
        add(g.texto((x0 + x1) / 2, yTop + 26, 'produção < vendas', { tamanho: 16, ancora: 'middle', cor: INK.lapis, animar: false }));
        add(g.texto((x0 + x1) / 2, yTop + 46, '(sem estoque inicial)', { tamanho: 15, ancora: 'middle', cor: INK.lapis, animar: false }));
      }
    }
    // lucro pelo absorção em função da produção (vendas fixas)
    const pts = [];
    for (let p = vend; p <= XMAX; p += 50) pts.push([p, apurar(p, vend).abs.lucro]);
    if (pts.length < 2) pts.push([XMAX, apurar(XMAX, vend).abs.lucro]);
    add(g.serie(pts, { cor: INK.azul, espessura: 2.6, animar: false }));
    // lucro pelo variável: não depende da produção
    add(g.linha(g.sx(vend), g.sy(r.vari.lucro), g.sx(XMAX), g.sy(r.vari.lucro), { cor: INK.verde, espessura: 2.6, animar: false }));
    add(g.texto(g.sx(XMAX) - 4, g.sy(apurar(XMAX, vend).abs.lucro) - 10, 'absorção', { cor: INK.azul, tamanho: 18, ancora: 'end', animar: false }));
    add(g.texto(g.sx(XMAX) - 4, g.sy(r.vari.lucro) + 24, 'variável', { cor: INK.verde, tamanho: 18, ancora: 'end', animar: false }));
    // situação escolhida
    const xP = g.sx(prod), yAbs = g.sy(r.abs.lucro), yVar = g.sy(r.vari.lucro);
    add(g.linha(xP, yBase, xP, yTop, { cor: INK.lapis, tracejado: true, animar: false }));
    if (r.dif > 0.5) add(g.linha(xP, yVar, xP, yAbs, { cor: INK.vermelho, espessura: 3.2, animar: false }));
    add(g.circulo(xP, yAbs, 13, { cor: INK.azul, preenchimento: INK.azul, estilo: 'solid', animar: false }));
    add(g.circulo(xP, yVar, 13, { cor: INK.verde, preenchimento: INK.verde, estilo: 'solid', animar: false }));

    const aprox = Number.isInteger(Math.round(r.cfu * 1e6) / 1e4) ? '=' : '≈';
    msg.innerHTML = r.ef === 0
      ? `<p><b>Produção = vendas.</b> Nada sobrou no estoque, então o custo fixo inteiro (${fmt.brl(DADOS.cf)}) virou resultado nos dois métodos: <b>lucros iguais</b> (${fmt.brl(r.abs.lucro)}).</p>`
      : `<p>Sobraram <b>${fmt.int(r.ef)} un.</b> no estoque. No absorção, cada uma leva ${fmt.brl(r.cfu)} de custo fixo (${fmt.brl(DADOS.cf)} ÷ ${fmt.int(prod)}) para o Ativo: ${fmt.int(r.ef)} × ${fmt.brl(r.cfu)} ${aprox} <b>${fmt.brl(r.dif)}</b> a mais de lucro neste mês.</p>
<p>Repare: a linha verde <b>não se mexe</b> quando você muda só a produção — no variável o lucro depende das <b>vendas</b>. O custo fixo "guardado" no estoque vira CPV quando essas unidades forem vendidas; nesse mês futuro (produção &lt; vendas) o absorção mostrará lucro <b>menor</b> que o variável.</p>`;
    tab.innerHTML = '';
    tab.append(ui.tabela(['', 'Absorção', 'Variável'], [
      ['Receita de vendas', fmt.brl(r.receita), fmt.brl(r.receita)],
      ['(−) Custo dos produtos vendidos', `− ${fmt.brl(r.abs.cpv)}<br><small>${fmt.int(vend)} × ${fmt.brl(r.custoAbs)}</small>`, `− ${fmt.brl(r.vari.cvv)}<br><small>${fmt.int(vend)} × ${fmt.brl(DADOS.cv)}</small>`],
      ['(−) Despesas variáveis de venda', `− ${fmt.brl(r.abs.dv)}`, `− ${fmt.brl(r.vari.dv)}`],
      ['(=) Margem de contribuição', '—', fmt.brl(r.vari.mc)],
      ['(−) Custo fixo de produção', '<small>já dentro do CPV (só o das vendidas)</small>', `− ${fmt.brl(r.vari.cf)} <small>(inteiro)</small>`],
      ['(−) Despesas fixas', `− ${fmt.brl(r.abs.df)}`, `− ${fmt.brl(r.vari.df)}`],
      ['<b>(=) Lucro do mês</b>', corLucro(r.abs.lucro), corLucro(r.vari.lucro)],
      [`Estoque final (${fmt.int(r.ef)} un.)`, fmt.brl(r.abs.estoque), fmt.brl(r.vari.estoque)],
    ]));
  }

  return () => { dyn = []; };
}

export default {
  id: '11-custos',
  numero: 11,
  disciplina: 'Contabilidade de Custos',
  titulo: 'Contabilidade de custos',
  subtitulo: 'Da matéria-prima ao CPV, sem se perder na escadinha',
  incidencia: 'alta',
  tempo: 60,
  pergunta: 'Por que uma fábrica pode "lucrar mais" no papel só por produzir mais do que vende?',
  previsao: {
    pergunta: 'Uma fábrica produziu 1.000 unidades e vendeu 600 no mês. O aluguel da fábrica foi de R$ 10.000. Pelo custeio por absorção, quanto desse aluguel vai para o resultado do mês?',
    opcoes: ['Os R$ 10.000 inteiros', 'R$ 6.000 — os outros R$ 4.000 ficam no estoque', 'Nada: aluguel da fábrica é despesa administrativa e fica no Ativo'],
    correta: 1,
    explicacao: 'Aluguel da <b>fábrica</b> é custo de produção. No absorção ele é dividido entre as 1.000 unidades (R$ 10 cada). As 600 vendidas levam R$ 6.000 para o CPV; as 400 que sobraram guardam R$ 4.000 no <b>estoque</b> (Ativo). É por isso que produzir mais do que se vende "melhora" o lucro do mês no absorção.',
  },
  paginas: [
    {
      titulo: 'Gasto, custo, despesa, investimento e perda',
      html: `<p>A Contabilidade de Custos nasceu para responder a uma pergunta da indústria: <b>quanto custa o que eu fabrico?</b> Hoje ela tem três finalidades: <b>avaliar estoques</b> e apurar o resultado (uso fiscal e societário), <b>controlar</b> (comparar o real com o padrão ou o orçado) e <b>ajudar a decidir</b> (preço, mix de produtos, comprar ou fabricar).</p>
<p>A prova adora a terminologia. Grave a família:</p>
<table class="tabela"><thead><tr><th>Termo</th><th>O que é</th><th>Exemplo</th></tr></thead><tbody>
<tr><td><b>Gasto</b></td><td>Sacrifício financeiro para obter um bem ou serviço (é o "gênero")</td><td>compra de matéria-prima, de máquina, conta de luz</td></tr>
<tr><td><b>Investimento</b></td><td>Gasto ativado: fica no Ativo pela vida útil ou até ser consumido/vendido</td><td>matéria-prima no almoxarifado, máquina, estoque de produtos</td></tr>
<tr><td><b>Custo</b></td><td>Gasto com bens e serviços usados <mark>na produção</mark> de outros bens ou serviços</td><td>MP consumida, salário do operário, energia da fábrica, depreciação da máquina</td></tr>
<tr><td><b>Despesa</b></td><td>Bem ou serviço consumido, direta ou indiretamente, <mark>para obter receita</mark> (fora da fábrica)</td><td>comissão de vendedores, salário da diretoria administrativa geral, propaganda, frete de entrega</td></tr>
<tr><td><b>Perda</b></td><td>Bem ou serviço consumido de forma <mark>anormal e involuntária</mark></td><td>incêndio, inundação, greve, obsolescência inesperada</td></tr>
<tr><td><b>Desembolso</b></td><td>Pagamento (saída de caixa); pode vir antes, junto ou depois do gasto</td><td>pagamento da duplicata do fornecedor</td></tr>
</tbody></table>
<div class="exemplo"><b>Exemplo — a vida de 1 kg de aço:</b> comprado a prazo = <b>gasto</b> e <b>investimento</b> (estoque de MP); pago 30 dias depois = <b>desembolso</b>; requisitado pela fábrica = <b>custo</b> (vira produto em elaboração e depois produto acabado, ainda no Ativo); produto vendido = <b>despesa</b> (o custo vira CPV na DRE).</div>
<div class="caixa alerta"><b>Pegadinha:</b> perda <b>normal</b>, inerente ao processo (evaporação, aparas previsíveis), é <b>custo</b> do produto. Só a perda <b>anormal</b> vai direto para o resultado. E o salário da diretoria administrativa geral é <b>despesa</b>, mesmo que a sala fique dentro do prédio da fábrica.</div>
<aside class="nota">Princípios que a prova liga a custos: <b>competência</b> (o custo do produto só vira despesa, como CPV, quando a receita da venda é reconhecida), <b>custo histórico</b> como base de valor, <b>consistência</b> dos critérios e a regra da NBC TG 16 (Estoques): estoque pelo <b>menor valor entre custo e valor realizável líquido</b>.</aside>`,
    },
    {
      titulo: 'Classificação: fixo, variável, direto, indireto',
      html: `<p>A mesma conta pode ter duas classificações ao mesmo tempo, porque cada par olha para uma coisa diferente:</p>
<table class="tabela"><thead><tr><th>Par</th><th>Pergunta que você faz</th></tr></thead><tbody>
<tr><td><b>Fixo × variável</b></td><td>O <b>total</b> muda quando muda o <b>volume</b> produzido?</td></tr>
<tr><td><b>Direto × indireto</b></td><td>Dá para medir <b>objetivamente</b> quanto foi para cada <b>produto</b>, sem rateio?</td></tr>
<tr><td><b>Controlável × não controlável</b></td><td>O gestor daquele nível consegue <b>decidir</b> sobre esse gasto?</td></tr>
</tbody></table>
<p><b>Comportamento em relação ao volume</b> (dentro da capacidade instalada):</p>
<table class="tabela"><thead><tr><th></th><th>Total</th><th>Por unidade</th></tr></thead><tbody>
<tr><td>Custo <b>fixo</b> (aluguel da fábrica, depreciação linear)</td><td>constante</td><td><mark>diminui</mark> quando a produção aumenta</td></tr>
<tr><td>Custo <b>variável</b> (matéria-prima, embalagem)</td><td>aumenta com o volume</td><td>constante</td></tr>
</tbody></table>
<div class="exemplo"><b>Exemplo:</b> aluguel da fábrica de R$ 20.000. Produzindo 1.000 un. → R$ 20/un.; produzindo 2.000 un. → R$ 10/un. O total não mudou; o unitário caiu pela metade.</div>
<p>Há também os mistos: <b>semivariável</b> (parte fixa + parte variável, como a energia com demanda contratada) e <b>semifixo ou em degraus</b> (fixo por faixas de produção, como um supervisor a cada turno aberto).</p>
<div class="formula">Custo primário = MD + MOD</div>
<div class="formula">Custo de transformação (conversão) = MOD + CIF</div>
<div class="caixa alerta"><b>Pegadinhas:</b> (1) a MOD aparece nos <b>dois</b>: primário e transformação. (2) "Direto" não é sinônimo de "variável": a depreciação de uma máquina que só fabrica o produto A é <b>direta e fixa</b>. (3) O custo fixo é fixo no <b>total</b>; o fixo por unidade varia.</div>`,
    },
    {
      titulo: 'Os três elementos: MD, MOD e CIF',
      html: `<p>Todo custo de produção cai em um destes três baldes:</p>
<ul class="lista-check">
<li><b>MD — materiais diretos:</b> matéria-prima (o aço da cadeira), material secundário (parafusos, cola, quando medidos por produto) e material de embalagem.</li>
<li><b>MOD — mão de obra direta:</b> salários <b>e encargos</b> de quem trabalha diretamente no produto, pelo tempo <b>efetivamente</b> aplicado nele.</li>
<li><b>CIF — custos indiretos de fabricação:</b> o resto da fábrica — aluguel, depreciação, supervisão, manutenção, energia não medida por produto, materiais indiretos (lubrificante, lixa), mão de obra indireta.</li></ul>
<div class="formula">MD consumido = EI de MP + Compras líquidas − EF de MP</div>
<p><b>Compras líquidas</b> = preço da compra + frete e seguro pagos pelo comprador − impostos recuperáveis (ICMS, IPI, PIS/Cofins não cumulativos, quando recuperáveis) − devoluções e abatimentos.</p>
<p><b>Controle de estoques de materiais</b> (NBC TG 16): <b>PEPS</b> ou <b>custo médio ponderado</b> (móvel ou fixo); identificação específica para itens não intercambiáveis. O <span class="caneta-vermelha">UEPS não é permitido</span> pela norma nem pelo fisco.</p>
<div class="exemplo"><b>Exemplo — custo-hora da MOD:</b> operário com salário de R$ 3.000 + 70% de encargos = R$ 5.100 por mês, para 200 horas pagas. Custo-hora = 5.100 ÷ 200 = <b>R$ 25,50</b>. Ele trabalhou 150 h no produto A, 20 h no B e ficou 30 h parado (ociosidade normal).<br>MOD de A = 150 × 25,50 = <b>R$ 3.825</b> · MOD de B = 20 × 25,50 = <b>R$ 510</b> · tempo ocioso = 30 × 25,50 = R$ 765, que vai para <b>CIF</b> (mão de obra indireta).</div>
<div class="caixa alerta"><b>Pegadinha:</b> o salário do supervisor da fábrica e o tempo ocioso do operário são <b>mão de obra indireta</b> (CIF), não MOD. Salário de vendedor nem é custo: é <b>despesa</b>.</div>`,
    },
    {
      titulo: 'Rateio, departamentalização e centros de custos',
      html: `<p>CIF não dá para medir por produto, então é <b>rateado</b>: escolhe-se uma base que tenha relação de causa com o custo e divide-se proporcionalmente.</p>
<div class="formula">Taxa de rateio = CIF total ÷ total da base</div>
<p>Bases comuns: horas-máquina (custos ligados às máquinas), horas de MOD, valor ou quantidade de MD, área ocupada (aluguel), número de requisições (almoxarifado).</p>
<div class="exemplo"><b>Exemplo:</b> CIF de R$ 60.000 rateados por horas-máquina. O produto A usou 1.000 HM e o B, 2.000 HM. Taxa = 60.000 ÷ 3.000 = R$ 20/HM → A recebe <b>R$ 20.000</b> e B, <b>R$ 40.000</b>.</div>
<p><b>Departamentalização</b> divide a fábrica em departamentos para ratear melhor:</p>
<ul class="lista-check"><li><b>Departamentos de produção</b> (usinagem, montagem): o produto passa fisicamente por eles.</li>
<li><b>Departamentos de serviço ou auxiliares</b> (manutenção, almoxarifado, controle de qualidade): servem os outros departamentos; o produto não passa por eles.</li></ul>
<p>O caminho é sempre: CIF → departamentos → custos dos departamentos de <b>serviço</b> rateados aos de <b>produção</b> → cada departamento de produção rateia aos produtos pela <b>sua</b> base.</p>
<div class="exemplo"><b>Exemplo:</b> Manutenção (serviço) R$ 10.000; Usinagem R$ 30.000; Montagem R$ 20.000. A manutenção trabalhou 300 h para a Usinagem e 200 h para a Montagem → Usinagem recebe 6.000 (total 36.000) e Montagem 4.000 (total 24.000).<br>Usinagem rateia por HM: A 400 HM, B 800 HM → R$ 30/HM → A 12.000; B 24.000.<br>Montagem rateia por hora de MOD: A 300 h, B 300 h → R$ 40/h → A 12.000; B 12.000.<br><b>CIF de A = 24.000; CIF de B = 36.000</b> (total 60.000 ✔).</div>
<aside class="nota"><b>Centro de custos</b> é a menor unidade de acumulação dos custos indiretos. Normalmente cada departamento é um centro de custos, mas um departamento pode ter vários (uma máquina, uma linha).</aside>`,
    },
    {
      titulo: 'A escadinha: CPP e CPV',
      html: `<p>Os custos "andam" por três estoques até virarem despesa: <b>matéria-prima → produtos em elaboração → produtos acabados → CPV</b>. Cada degrau usa a mesma lógica do CMV: <mark>inicial + entradas − final</mark>.</p>
<div class="formula">MD = EI MP + Compras − EF MP</div>
<div class="formula">CPP = EIPE + (MD + MOD + CIF) − EFPE</div>
<div class="formula">CPV = EIPA + CPP − EFPA</div>
<table class="tabela"><thead><tr><th>Sigla</th><th>Significado</th></tr></thead><tbody>
<tr><td>CP (custo de produção do período)</td><td>MD + MOD + CIF aplicados no período</td></tr>
<tr><td>CPP (custo da produção acabada)</td><td>custo do que ficou pronto no período</td></tr>
<tr><td>EIPE / EFPE</td><td>estoque inicial / final de produtos em elaboração</td></tr>
<tr><td>EIPA / EFPA</td><td>estoque inicial / final de produtos acabados</td></tr>
</tbody></table>
<div class="exemplo"><b>Exemplo completo:</b> EI MP 10.000; compras 50.000; EF MP 15.000; MOD 30.000; CIF 25.000; EIPE 8.000; EFPE 12.000; EIPA 20.000; EFPA 18.000; receita líquida 150.000.<br>
MD = 10.000 + 50.000 − 15.000 = <b>45.000</b><br>
CP do período = 45.000 + 30.000 + 25.000 = <b>100.000</b><br>
CPP = 8.000 + 100.000 − 12.000 = <b>96.000</b><br>
CPV = 20.000 + 96.000 − 18.000 = <b>98.000</b><br>
Lucro bruto = 150.000 − 98.000 = <b>52.000</b></div>
<div class="caixa alerta"><b>Pegadinha:</b> a FGV coloca os três números (custo de produção do período, CPP e CPV) entre as alternativas. Leia o que foi pedido: "custo de produção do período" ≠ "custo da produção acabada" ≠ "custo dos produtos vendidos". Em prestadoras de serviço o equivalente é o <b>CSP</b> (custo dos serviços prestados), e os serviços em andamento fazem o papel dos produtos em elaboração.</div>`,
    },
    {
      titulo: 'Ordem × processo, equivalente de produção e custos conjuntos',
      html: `<table class="tabela"><thead><tr><th></th><th>Por ordem (encomenda)</th><th>Por processo (contínua)</th></tr></thead><tbody>
<tr><td>Produção</td><td>sob encomenda, itens diferentes (navios, móveis planejados, gráfica)</td><td>em série, padronizada (cimento, refrigerante, papel)</td></tr>
<tr><td>Acumulação</td><td>custos acumulados em cada <b>ordem</b> até ela terminar</td><td>custos acumulados por <b>departamento/processo</b> e por <b>período</b></td></tr>
<tr><td>No fim do mês</td><td>ordens não terminadas = produtos em elaboração</td><td>usa o <b>equivalente de produção</b> para dividir o custo entre acabados e em elaboração</td></tr>
</tbody></table>
<div class="formula">EP = acabadas + (em elaboração × % de acabamento)</div>
<div class="exemplo"><b>Exemplo:</b> iniciadas 1.000 un.; acabadas 800; as 200 restantes estão 50% prontas. Custo do período R$ 45.000, aplicado de forma uniforme.<br>EP = 800 + 200 × 50% = <b>900</b> → custo por unidade equivalente = 45.000 ÷ 900 = <b>R$ 50</b>.<br>Produtos acabados = 800 × 50 = <b>R$ 40.000</b> · em elaboração = 100 × 50 = <b>R$ 5.000</b>.<br>Se a MP entra <b>toda no início</b>, ela tem EP próprio (1.000 un., pois as 200 já receberam 100% da MP) e a conversão (MOD + CIF) usa o EP de 900.</div>
<p><b>Custos conjuntos</b> nascem quando um único processo gera vários produtos ao mesmo tempo (o boi gera carne, couro e osso; o petróleo gera gasolina, diesel e asfalto), até o <b>ponto de separação</b>.</p>
<ul class="lista-check">
<li><b>Coprodutos</b> (produtos principais): recebem os custos conjuntos — pelo <b>valor de mercado</b> (o mais usado), pelas <b>unidades físicas</b> (volume/peso) ou em partes iguais.</li>
<li><b>Subprodutos</b> (tratamento usual para valores imateriais): venda normal, mas de valor pequeno. Não recebem custo conjunto; seu valor líquido de realização é <b>deduzido</b> dos custos conjuntos (reduz o custo dos coprodutos).</li>
<li><b>Sucatas</b> (convenção didática adotada aqui): venda incerta e de valor irrisório. Não recebem custo nem entram no estoque; quando vendidas, geram <b>outras receitas</b>.</li></ul>
<div class="exemplo"><b>Exemplo:</b> custo conjunto R$ 60.000; subproduto com valor líquido de R$ 5.000. Custo a distribuir = 55.000. Coproduto A: 1.000 un. × R$ 40 = 40.000 de valor de mercado; B: 2.000 un. × R$ 30 = 60.000. Total 100.000.<br>A = 55.000 × 40% = <b>R$ 22.000</b>; B = 55.000 × 60% = <b>R$ 33.000</b>. Pelas unidades físicas seria A = 55.000 × 1/3 ≈ R$ 18.333 e B ≈ R$ 36.667.</div>`,
    },
    {
      titulo: 'Métodos de custeio: absorção, variável, ABC e RKW',
      html: `<p>Método de custeio responde: <b>quais custos entram no produto?</b></p>
<table class="tabela"><thead><tr><th>Método</th><th>O que vai para o produto</th><th>Uso</th></tr></thead><tbody>
<tr><td><b>Absorção</b></td><td>todos os custos de produção: MD, MOD e CIF fixos e variáveis. As despesas vão para o resultado.</td><td><mark>aceito pela legislação fiscal (IR) e societária</mark> (Lei 6.404/76, NBC TG 16): é o usado nos estoques das demonstrações</td></tr>
<tr><td><b>Variável (direto)</b></td><td>só os custos <b>variáveis</b>. Os custos fixos vão inteiros para o resultado do período.</td><td>gerencial: gera a margem de contribuição; <b>não aceito</b> para fins fiscais/societários</td></tr>
<tr><td><b>ABC (por atividades)</b></td><td>os recursos vão para as <b>atividades</b> (direcionadores de recursos) e das atividades para os produtos (direcionadores de atividades)</td><td>gerencial: reduz as distorções do rateio arbitrário dos indiretos; pode alcançar também despesas</td></tr>
<tr><td><b>RKW (pleno / integral)</b></td><td><b>todos</b> os custos <b>e despesas</b>, inclusive administrativas e de vendas, são rateados aos produtos</td><td>gerencial, para formar preço ("custo pleno + margem"); <b>não aceito</b> pelas normas</td></tr>
</tbody></table>
<p><b>Absorção × variável</b> — a diferença de lucro é o custo fixo de produção contido no estoque final menos o contido no inicial. A tabela e a fórmula simplificada pressupõem o mesmo CF unitário nos dois estoques (ou estoque inicial zero):</p>
<table class="tabela"><thead><tr><th>Situação</th><th>Lucro</th></tr></thead><tbody>
<tr><td>Produção = vendas (sem estoque inicial)</td><td>absorção = variável</td></tr>
<tr><td>Produção &gt; vendas (estoque aumenta)</td><td><b>absorção &gt; variável</b></td></tr>
<tr><td>Produção &lt; vendas (estoque diminui)</td><td><b>absorção &lt; variável</b></td></tr>
</tbody></table>
<div class="formula">Diferença de lucro = CF unitário × variação do estoque (un.)</div>
<div class="exemplo"><b>Exemplo:</b> preço R$ 80; custo variável R$ 20/un.; CF de produção R$ 30.000; despesa variável R$ 5/un.; despesas fixas R$ 10.000. Produção 1.500 un.; vendas 1.000 un.; sem estoque inicial.<br>
<b>Absorção:</b> CF/un. = 30.000 ÷ 1.500 = 20 → custo unitário = 40. Receita 80.000 − CPV 40.000 = LB 40.000 − desp. variáveis 5.000 − desp. fixas 10.000 = <b>lucro 25.000</b>.<br>
<b>Variável:</b> MC = 1.000 × (80 − 20 − 5) = 55.000 − CF 30.000 − DF 10.000 = <b>lucro 15.000</b>.<br>
Diferença = 500 un. em estoque × R$ 20 = <b>R$ 10.000</b> ✔</div>
<aside class="nota">Na prática, a NBC TG 16 manda alocar o custo fixo com base na <b>capacidade normal</b> de produção; o custo fixo não alocado (ociosidade) vai direto para o resultado. Nos exemplos e na demo, a produção de cada cenário é assumida próxima da capacidade normal, sem ociosidade anormal. Só nessa hipótese usamos CF dividido pela produção; a simplificação não autoriza capitalizar ociosidade anormal.</aside>`,
    },
    {
      titulo: 'Custo padrão e análise das variações',
      html: `<p>Para controlar, a empresa compara o que gastou com uma referência:</p>
<ul class="lista-check">
<li><b>Custo real (histórico):</b> o que efetivamente aconteceu.</li>
<li><b>Custo estimado:</b> previsão baseada na média do passado, ajustada pelas expectativas.</li>
<li><b>Custo projetado / orçado:</b> previsto para períodos futuros, nos planos e orçamentos.</li>
<li><b>Custo padrão:</b> o custo "que deveria ser", apurado tecnicamente. <b>Ideal</b> = condições perfeitas (praticamente inatingível); <b>corrente</b> = exigente, mas alcançável (o mais útil para controle).</li></ul>
<p>O padrão tem dois componentes: <b>padrões físicos</b> (kg de MP por unidade, horas de MOD por unidade) e <b>padrões financeiros</b> (preço por kg, taxa por hora).</p>
<div class="formula">Variação de preço = (PR − PP) × QR</div>
<div class="formula">Variação de quantidade = (QR − QP) × PP</div>
<p>Na MOD os nomes mudam: variação de <b>taxa</b> (preço da hora) e de <b>eficiência</b> (horas). Real maior que o padrão = <span class="caneta-vermelha">desfavorável (D)</span>; real menor = favorável (F).</p>
<div class="exemplo"><b>Exemplo:</b> padrão de 2 kg por unidade a R$ 5/kg (R$ 10/un.). Foram produzidas 1.000 un., usando 2.200 kg comprados a R$ 4,80/kg.<br>
Padrão da produção real: 2.000 kg × 5 = 10.000 · Real: 2.200 × 4,80 = 10.560 → variação total <b>560 D</b>.<br>
Preço: (4,80 − 5,00) × 2.200 = <b>440 F</b> · Quantidade: (2.200 − 2.000) × 5 = <b>1.000 D</b> · 1.000 D − 440 F = 560 D ✔</div>
<div class="caixa alerta"><b>Pegadinha:</b> algumas questões separam a <b>variação mista</b> = (PR − PP) × (QR − QP); aí a variação de preço "pura" usa QP: (PR − PP) × QP. No exemplo: preço pura 400 F + mista 40 F = os mesmos 440 F. E compare sempre com o padrão da <b>produção real</b>, não com o da produção orçada.</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: absorção × variável',
    instrucao: 'Dê seu palpite sobre qual método mostra o maior lucro. Depois mexa na produção e nas vendas e veja as duas curvas de lucro à caneta e a DRE de cada método.',
    montar: montarCusteio,
  },
  macetes: [
    'Gasto é o gênero: <b>custo</b> é gasto na fábrica, <b>despesa</b> é gasto para vender/administrar, <b>perda</b> é anormal e involuntária.',
    '<b>Primário</b> = MD + MOD · <b>transformação</b> = MOD + CIF. A MOD está nos dois!',
    'Fixo/variável olha o <b>volume</b>; direto/indireto olha o <b>produto</b>. Um custo pode ser direto e fixo.',
    'Escadinha: MD → CP → CPP → CPV. Em cada degrau: <b>+ inicial − final</b>.',
    'Com CF unitário constante nos estoques (ou sem estoque inicial): <b>produção > vendas → absorção > variável</b>. A diferença é o CF no estoque final menos o CF no inicial.',
    'Subproduto <b>abate</b> o custo conjunto; sucata <b>não recebe custo</b> e vira outra receita quando vendida.',
    'Custo padrão: real > padrão = <b>desfavorável</b>. Preço usa a quantidade real; quantidade usa o preço padrão.',
    'Fisco e Lei 6.404 aceitam o <b>absorção</b>. Variável, ABC e RKW são ferramentas gerenciais.',
  ],
  questoes: [
    {
      enunciado: 'Uma indústria registrou, no mês, os seguintes eventos: (I) consumo de matéria-prima na linha de produção; (II) comissão paga aos vendedores; (III) aquisição de uma máquina para a fábrica; (IV) matéria-prima destruída por uma inundação no almoxarifado. Esses eventos classificam-se, respectivamente, como:',
      alternativas: ['custo, custo, investimento e despesa.', 'custo, despesa, investimento e perda.', 'investimento, despesa, custo e perda.', 'custo, despesa, despesa e custo.'],
      correta: 1,
      comentario: '(I) MP consumida na produção = <b>custo</b>. (II) comissão de vendedores = gasto para obter receita = <b>despesa</b>. (III) máquina = gasto ativado = <b>investimento</b> (depois, a depreciação dela será custo). (IV) inundação = consumo anormal e involuntário = <b>perda</b>, vai direto para o resultado.',
    },
    {
      enunciado: 'Uma indústria apresentou: estoque inicial de matéria-prima R$ 12.000; compras de matéria-prima R$ 48.000; estoque final de matéria-prima R$ 10.000; mão de obra direta R$ 35.000; custos indiretos de fabricação R$ 25.000; estoque inicial de produtos em elaboração R$ 6.000; estoque final de produtos em elaboração R$ 9.000; estoque inicial de produtos acabados R$ 15.000; estoque final de produtos acabados R$ 20.000. O custo dos produtos vendidos foi de:',
      alternativas: ['R$ 107.000.', 'R$ 110.000.', 'R$ 112.000.', 'R$ 102.000.'],
      correta: 3,
      comentario: 'MD = 12.000 + 48.000 − 10.000 = 50.000.<br>Custo de produção do período = 50.000 + 35.000 + 25.000 = 110.000.<br>CPP = 6.000 + 110.000 − 9.000 = 107.000.<br>CPV = 15.000 + 107.000 − 20.000 = <b>R$ 102.000</b>.<br>Os distratores são o CPP (107.000), o custo de produção do período (110.000) e a troca dos estoques de acabados (20.000 + 107.000 − 15.000 = 112.000).',
    },
    {
      enunciado: 'Em determinado mês, uma indústria que produz em série iniciou a produção de 5.000 unidades e concluiu 4.000. As demais 1.000 unidades ficaram em elaboração, com 60% de acabamento. Não havia estoque inicial em elaboração, e os custos de produção do mês, de R$ 92.000, foram aplicados uniformemente ao longo do processo. O custo da produção acabada no mês foi de:',
      alternativas: ['R$ 80.000.', 'R$ 73.600.', 'R$ 92.000.', 'R$ 12.000.'],
      correta: 0,
      comentario: 'Equivalente de produção = 4.000 + 1.000 × 60% = 4.600 un.<br>Custo por unidade equivalente = 92.000 ÷ 4.600 = R$ 20.<br>Produção acabada = 4.000 × 20 = <b>R$ 80.000</b> (em elaboração: 600 × 20 = R$ 12.000).<br>R$ 73.600 seria o erro de dividir pelas 5.000 unidades iniciadas, como se todas estivessem prontas.',
    },
    {
      enunciado: 'Uma indústria produziu 10.000 unidades e vendeu 8.000 no período, sem estoques iniciais. Preço de venda R$ 50/un.; custos variáveis de produção R$ 20/un.; custos fixos de produção R$ 100.000; despesas variáveis de venda R$ 2/un.; despesas fixas R$ 30.000. O resultado do período pelo custeio por absorção e pelo custeio variável foi, respectivamente, de:',
      alternativas: ['R$ 94.000 e R$ 114.000.', 'R$ 130.000 e R$ 94.000.', 'R$ 114.000 e R$ 94.000.', 'R$ 114.000 e R$ 114.000.'],
      correta: 2,
      comentario: '<b>Absorção:</b> CF/un. = 100.000 ÷ 10.000 = 10 → custo unitário = 30. Receita 8.000 × 50 = 400.000 − CPV 8.000 × 30 = 240.000 = LB 160.000 − desp. variáveis 16.000 − desp. fixas 30.000 = <b>114.000</b>.<br><b>Variável:</b> MC = 8.000 × (50 − 20 − 2) = 224.000 − CF 100.000 − DF 30.000 = <b>94.000</b>.<br>Conferência: 2.000 un. em estoque × CF de R$ 10 = 20.000 de diferença. Produção > vendas → absorção maior.',
    },
    {
      enunciado: 'Um processo produtivo gerou custos conjuntos de R$ 120.000 até o ponto de separação, resultando em: coproduto A, 3.000 kg vendidos a R$ 40/kg; coproduto B, 2.000 kg vendidos a R$ 30/kg; e um subproduto cujo valor líquido de realização, de R$ 12.000, é deduzido dos custos conjuntos. Pelo critério do valor de mercado, o custo atribuído ao coproduto A é de:',
      alternativas: ['R$ 80.000.', 'R$ 72.000.', 'R$ 64.800.', 'R$ 36.000.'],
      correta: 1,
      comentario: 'Custo a distribuir = 120.000 − 12.000 (subproduto) = 108.000.<br>Valor de mercado: A = 3.000 × 40 = 120.000; B = 2.000 × 30 = 60.000; total 180.000.<br>A = 108.000 × 120/180 = <b>R$ 72.000</b> (B fica com 36.000).<br>80.000 esquece de abater o subproduto; 64.800 usa o critério de volume (3.000/5.000).',
    },
    {
      enunciado: 'No mês, uma indústria apurou: materiais diretos R$ 40.000; mão de obra direta R$ 25.000; custos indiretos de fabricação R$ 15.000. Os custos primários e os custos de transformação foram, respectivamente:',
      alternativas: ['R$ 65.000 e R$ 40.000.', 'R$ 40.000 e R$ 65.000.', 'R$ 65.000 e R$ 80.000.', 'R$ 55.000 e R$ 40.000.'],
      correta: 0,
      comentario: 'Custo primário = MD + MOD = 40.000 + 25.000 = <b>65.000</b>.<br>Custo de transformação = MOD + CIF = 25.000 + 15.000 = <b>40.000</b>.<br>Lembre: a MOD entra nos dois. 80.000 é o custo de produção total.',
    },
    {
      enunciado: 'O padrão de mão de obra direta de um produto é de 2 horas por unidade, à taxa de R$ 15,00 por hora. No mês foram produzidas 1.500 unidades, com 3.200 horas efetivamente trabalhadas, pagas à taxa de R$ 14,50 por hora. Considerando a variação de taxa calculada sobre as horas reais (sem segregar a variação mista), as variações de eficiência e de taxa da MOD foram:',
      alternativas: ['eficiência de R$ 3.000 favorável e taxa de R$ 1.600 desfavorável.', 'eficiência de R$ 1.600 desfavorável e taxa de R$ 3.000 favorável.', 'eficiência de R$ 2.900 desfavorável e taxa de R$ 1.600 favorável.', 'eficiência de R$ 3.000 desfavorável e taxa de R$ 1.600 favorável.'],
      correta: 3,
      comentario: 'Horas padrão para a produção real = 1.500 × 2 = 3.000 h.<br>Variação de eficiência = (3.200 − 3.000) × 15,00 = <b>3.000 desfavorável</b> (gastou mais horas do que devia).<br>Variação de taxa = (14,50 − 15,00) × 3.200 = <b>−1.600 → favorável</b> (pagou menos por hora).<br>Total: real 3.200 × 14,50 = 46.400 − padrão 45.000 = 1.400 D = 3.000 D − 1.600 F ✔. A alternativa com 2.900 mede a eficiência pela taxa real, o que está errado: eficiência usa a taxa <b>padrão</b>.',
    },
    {
      enunciado: 'Sobre os métodos de custeio, assinale a afirmativa correta.',
      alternativas: ['O custeio variável é aceito pela legislação do Imposto de Renda para a avaliação dos estoques.', 'No custeio por absorção, as despesas administrativas e de vendas são incorporadas ao custo dos produtos.', 'No custeio pleno (RKW), custos e despesas, inclusive administrativas e de vendas, são rateados aos produtos.', 'No custeio baseado em atividades (ABC), os custos indiretos são rateados exclusivamente com base nas horas de mão de obra direta.'],
      correta: 2,
      comentario: 'O <b>RKW</b> rateia tudo — custos e despesas — aos produtos (custo pleno). As outras estão erradas: o fisco e a Lei 6.404 exigem o <b>absorção</b>, não o variável; no absorção as despesas vão para o resultado, não para o produto; o ABC usa <b>direcionadores</b> de recursos e de atividades, justamente para fugir de uma base única de rateio.',
    },
    {
      enunciado: 'Os custos indiretos de fabricação de uma empresa, no total de R$ 90.000, são rateados aos produtos com base nas horas-máquina. O produto X consumiu 1.200 horas-máquina e o produto Y, 1.800. No período, X teve materiais diretos de R$ 30.000 e mão de obra direta de R$ 20.000, com produção de 1.000 unidades. O custo unitário de produção de X foi de:',
      alternativas: ['R$ 86,00.', 'R$ 95,00.', 'R$ 50,00.', 'R$ 104,00.'],
      correta: 0,
      comentario: 'Taxa = 90.000 ÷ (1.200 + 1.800) = R$ 30/HM.<br>CIF de X = 1.200 × 30 = 36.000.<br>Custo de X = 30.000 + 20.000 + 36.000 = 86.000 → 86.000 ÷ 1.000 = <b>R$ 86,00</b>.<br>95,00 divide o CIF em partes iguais; 104,00 usa as horas de Y; 50,00 esquece o CIF.',
    },
    {
      enunciado: 'Adote o tratamento usual dos subprodutos imateriais pelo valor líquido de realização e a convenção didática de sucatas de venda eventual e valor irrisório, sem custo atribuído, cuja receita é reconhecida na venda. É correto afirmar que:',
      alternativas: ['as sucatas recebem parcela dos custos conjuntos proporcional ao seu valor de venda.', 'o valor líquido de realização dos subprodutos é deduzido do custo dos produtos principais, enquanto as sucatas não recebem custo e sua venda é reconhecida como receita quando ocorre.', 'subprodutos e coprodutos recebem os custos conjuntos pelo mesmo critério de rateio.', 'a receita de venda das sucatas deve ser registrada como redução do custo dos produtos vendidos do período.'],
      correta: 1,
      comentario: '<b>Subprodutos</b>: não recebem custo conjunto; seu valor líquido de realização reduz o custo dos coprodutos. <b>Sucatas</b>: não recebem custo nem ficam no estoque; a venda, eventual, é reconhecida como outra receita quando acontece. Só os <b>coprodutos</b> recebem o rateio dos custos conjuntos.',
    },
  ],
  resumo: [
    'Gasto (gênero) → investimento (ativado), custo (fábrica), despesa (para vender/administrar), perda (anormal e involuntária). Desembolso = pagamento.',
    'Fixo × variável: comportamento do total em relação ao volume. O CF por unidade cai quando a produção sobe; o CV por unidade é constante.',
    'Direto: medido sem rateio. Indireto (CIF): precisa de rateio, de preferência por departamentos (serviço → produção → produtos).',
    'Custo primário = MD + MOD; custo de transformação = MOD + CIF.',
    'MD = EI MP + compras líquidas − EF MP; CPP = EIPE + MD + MOD + CIF − EFPE; CPV = EIPA + CPP − EFPA.',
    'Estoques de materiais: PEPS ou média ponderada; UEPS não é aceito (NBC TG 16 e fisco).',
    'Por processo usa equivalente de produção: acabadas + em elaboração × % de acabamento. Por ordem acumula custos em cada encomenda.',
    'Custo conjunto vai para os coprodutos (valor de mercado ou volume); subproduto abate o custo conjunto; sucata não recebe custo.',
    'Absorção é o aceito pelo fisco e pela Lei 6.404. Variável, ABC e RKW (pleno) são gerenciais.',
    'Com CF unitário constante nos estoques: produção > vendas → lucro absorção > variável; diferença = CF unitário × variação do estoque. Regra geral: CF no estoque final menos CF no inicial.',
    'Custo padrão: preço = (PR − PP) × QR; quantidade = (QR − QP) × PP; real acima do padrão = desfavorável.',
  ],
};
