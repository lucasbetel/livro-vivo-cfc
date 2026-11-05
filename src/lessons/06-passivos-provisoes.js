// Lição 06 — Passivos, provisões, folha e tributos (demo: árvore de decisão da NBC TG 25 + custo da folha).
const NOS = {
  A: { x: 320, y: 40, w: 250, t: 'Obrigação presente?' },
  B: { x: 170, y: 140, w: 190, t: 'Saída provável?' },
  D: { x: 505, y: 140, w: 230, t: 'Obrigação possível?' },
  C: { x: 110, y: 245, w: 196, t: 'Estimativa confiável?' },
  E: { x: 370, y: 245, w: 170, t: 'Saída remota?' },
  P: { x: 100, y: 365, w: 160, t: 'PROVISÃO', fim: 0 },
  N: { x: 330, y: 365, w: 160, t: 'SÓ NOTA', fim: 1 },
  X: { x: 550, y: 365, w: 140, t: 'NADA', fim: 2 },
};
const ARESTAS = {
  AB: ['sim', [260, 63, 195, 117]],
  AD: ['não', [380, 63, 470, 117]],
  BC: ['sim', [140, 163, 120, 222]],
  BE: ['não', [215, 163, 335, 222]],
  DE: ['sim', [460, 163, 400, 222]],
  DX: ['não', [575, 163, 565, 342]],
  CP: ['sim', [90, 268, 95, 342]],
  CN: ['não', [160, 268, 295, 342]],
  EN: ['não', [350, 268, 335, 342]],
  EX: ['sim', [420, 268, 530, 342]],
};
const SAIDAS = ['Reconhecer provisão', 'Só nota explicativa', 'Nada (nem nota)'];
const CASOS = [
  { txt: 'Reclamação trabalhista: o advogado avalia a perda como <b>provável</b> e estima R$ 80.000.', r: 0, cam: ['AB', 'BC', 'CP'], fim: 'P',
    exp: 'Há obrigação presente decorrente de evento passado (o contrato de trabalho), a saída é provável e o valor é estimável → <b>provisão</b>.',
    lanc: 'D – Despesa com Provisões Trabalhistas / C – Provisão para Riscos Trabalhistas (Passivo) 80.000' },
  { txt: 'Ação de indenização movida por um cliente: perda avaliada como <b>possível</b>, valor estimado de R$ 200.000.', r: 1, cam: ['AD', 'DE', 'EN'], fim: 'N',
    exp: 'Não está claro que exista obrigação presente: há uma obrigação <b>possível</b>, e a saída não é remota → <b>passivo contingente</b>: só nota explicativa, sem lançamento.',
    lanc: 'Sem lançamento. Nota explicativa: natureza da ação e estimativa de R$ 200.000.' },
  { txt: 'Processo cível em que os advogados consideram <b>remota</b> a chance de perda.', r: 2, cam: ['AD', 'DE', 'EX'], fim: 'X',
    exp: 'Saída de recursos remota → nada a reconhecer e <b>nada a divulgar</b>.',
    lanc: 'Sem lançamento e sem nota.' },
  { txt: 'A empresa dá garantia de 1 ano nos produtos vendidos; a experiência mostra que parte deles sempre volta para reparo.', r: 0, cam: ['AB', 'BC', 'CP'], fim: 'P',
    exp: 'O evento passado é a venda com garantia (obrigação contratual). Para o conjunto de produtos, a saída é provável e estimável pela experiência → <b>provisão para garantias</b>, pelo valor esperado.',
    lanc: 'D – Despesa com Garantias / C – Provisão para Garantias (Passivo)' },
  { txt: 'A diretoria planeja gastar R$ 50.000 na revisão geral da frota no ano que vem.', r: 2, cam: ['AD', 'DX'], fim: 'X',
    exp: 'Não existe obrigação presente: a empresa pode evitar o gasto (vender a frota, por exemplo). Gastos futuros de manutenção <b>não</b> são provisionados.',
    lanc: 'Sem lançamento: a despesa será reconhecida quando a revisão for feita.' },
  { txt: 'Lei ambiental já aprovada obriga a recuperar a área degradada pela mineração já realizada; custo estimado de R$ 300.000.', r: 0, cam: ['AB', 'BC', 'CP'], fim: 'P',
    exp: 'Obrigação <b>legal</b> decorrente de evento passado (o dano já ocorreu), saída provável e valor estimável → <b>provisão</b>.',
    lanc: 'D – Despesa (ou custo do ativo, se for custo de restauração ligado ao imobilizado) / C – Provisão para Recuperação Ambiental 300.000' },
  { txt: 'A empresa projeta prejuízo operacional de R$ 120.000 para o próximo exercício.', r: 2, cam: ['AD', 'DX'], fim: 'X',
    exp: 'Perdas operacionais futuras <b>não</b> geram provisão: não há obrigação presente (NBC TG 25). A expectativa pode, porém, ser indício de impairment dos ativos.',
    lanc: 'Sem lançamento.' },
  { txt: 'A empresa processa um concorrente; os advogados consideram o êxito <b>provável</b>, mas não praticamente certo.', r: 1, cam: [], fim: 'N',
    exp: 'É um <b>ativo contingente</b> (não passa por esta árvore, que é de passivos). Entrada provável → <b>só nota explicativa</b>. Só se reconhece o ativo quando a entrada for <b>praticamente certa</b>.',
    lanc: 'Sem lançamento. Divulgação do ativo contingente em nota.' },
];

function montarProvisoes(el, kit) {
  const { h, fmt, INK, pen, ui } = kit;

  // ---------- Parte 1: árvore de decisão ----------
  const quadroEl = h('div', { style: { margin: '8px 0' } });
  const q = pen.quadro(quadroEl, { largura: 640, altura: 400, semente: 11 });
  q.svg.setAttribute('aria-label', 'Árvore de decisão da NBC TG 25: obrigação presente, saída provável, estimativa confiável');
  const FUNDO = ['rgba(46,125,79,0.16)', 'rgba(217,130,43,0.18)', 'rgba(107,107,107,0.14)'];
  const COR_FIM = [INK.verde, INK.laranja, INK.lapis];
  Object.values(ARESTAS).forEach(([rot, [x1, y1, x2, y2]]) => {
    q.linha(x1, y1, x2, y2, { cor: INK.lapis });
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    q.texto(mx + (x2 < x1 ? -10 : 10), my + 4, rot, { ancora: x2 < x1 ? 'end' : 'start', tamanho: 17, cor: INK.lapis });
  });
  Object.values(NOS).forEach((n) => {
    const fim = n.fim != null;
    q.retangulo(n.x - n.w / 2, n.y - 23, n.w, 46, fim
      ? { cor: COR_FIM[n.fim], preenchimento: FUNDO[n.fim], estilo: 'solid' }
      : { cor: INK.azul });
    q.texto(n.x, n.y + 7, n.t, { ancora: 'middle', tamanho: fim ? 22 : 20, cor: fim ? COR_FIM[n.fim] : INK.azul, peso: fim ? 700 : 400 });
  });
  let destaques = [];
  const limparDestaque = () => { destaques.forEach((no) => q.remover(no)); destaques = []; };
  const destacar = (c) => {
    limparDestaque();
    c.cam.forEach((id) => {
      const [x1, y1, x2, y2] = ARESTAS[id][1];
      destaques.push(q.linha(x1, y1, x2, y2, { cor: INK.vermelho, espessura: 4 }));
    });
    const f = NOS[c.fim];
    destaques.push(q.retangulo(f.x - f.w / 2 - 7, f.y - 30, f.w + 14, 60, { cor: INK.vermelho, espessura: 3 }));
  };

  let n = 0, acertos = 0;
  const casoEl = h('p', { class: 'demo-fato' });
  const placar = h('span', { class: 'demo-placar' });
  const area = h('div', {});
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' }, 'Leia o caso e escolha o tratamento contábil. A árvore mostra, em vermelho, o caminho da NBC TG 25.');
  const proximo = () => {
    area.innerHTML = '';
    limparDestaque();
    if (n >= CASOS.length) {
      casoEl.innerHTML = `<b>Fim!</b> Você acertou ${acertos} de ${CASOS.length} casos.`;
      placar.textContent = `acertos: ${acertos}/${CASOS.length}`;
      msg.innerHTML = '<p>Resumo: provável + estimável → <b>provisão</b>; possível → <b>só nota</b>; remota → <b>nada</b>. Gasto futuro evitável e prejuízo futuro não são obrigação presente.</p>';
      area.append(h('button', { type: 'button', class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; proximo(); } }, '↺ Recomeçar'));
      return;
    }
    const c = CASOS[n];
    casoEl.innerHTML = `<b>Caso ${n + 1}/${CASOS.length}:</b> ${c.txt}`;
    placar.textContent = `acertos: ${acertos}`;
    area.append(ui.botoes(SAIDAS, (i, b, g) => {
      if (g.dataset.ok) return;
      g.dataset.ok = '1';
      [...g.children].forEach((x, j) => { x.disabled = true; if (j === c.r) x.classList.add('certo'); });
      if (i === c.r) acertos++; else b.classList.add('errado');
      placar.textContent = `acertos: ${acertos}`;
      destacar(c);
      msg.innerHTML = `<p class="${i === c.r ? 'ok' : 'nok'}">${i === c.r ? '✔ Isso!' : '✘ Não.'} ${c.exp}</p><p class="lanc">${c.lanc}</p>`;
      n++;
      area.append(h('button', { type: 'button', class: 'btn-caneta primario', onclick: proximo }, n < CASOS.length ? 'Próximo caso →' : 'Ver resultado'));
    }, { classe: 'efeitos' }));
  };

  // ---------- Parte 2: quanto custa um empregado ----------
  const corpoF = h('div', { style: { display: 'none' } });
  const tabF = h('div', { style: { overflowX: 'auto' } });
  const lancF = h('div', { class: 'demo-resultado' });
  const ctlSal = kit.ui.controle({ rotulo: 'Salário bruto mensal', min: 1500, max: 15000, passo: 100, valor: 3000, formato: (v) => fmt.brl(v), aoMudar: () => calc() });
  const calc = () => {
    const s = ctlSal.valor();
    const fer = s / 12, terco = fer / 3, dec = s / 12;
    const rem = s + fer + terco + dec;
    const inss = rem * 0.2, fgts = rem * 0.08, total = rem + inss + fgts;
    tabF.innerHTML = '';
    tabF.append(ui.tabela(['Item', 'Base de cálculo', 'R$ por mês'], [
      ['Salário bruto', '—', fmt.brl(s)],
      ['Provisão de férias', 'salário ÷ 12', fmt.brl(fer)],
      ['Adicional de 1/3 de férias', 'férias do mês ÷ 3', fmt.brl(terco)],
      ['Provisão de 13º salário', 'salário ÷ 12', fmt.brl(dec)],
      ['<b>Remuneração do mês</b>', '', `<b>${fmt.brl(rem)}</b>`],
      ['INSS patronal', '20% da remuneração', fmt.brl(inss)],
      ['FGTS', '8% da remuneração', fmt.brl(fgts)],
      ['<b>Custo mensal para a empresa</b>', `<b>${fmt.pct((total / s - 1) * 100)} acima do salário</b>`, `<b>${fmt.brl(total)}</b>`],
    ]));
    lancF.innerHTML = `<p><b>Lançamentos do mês (competência):</b></p><p class="lanc">D – Despesa de Salários / C – Salários a Pagar ${fmt.brl(s)}<br>D – Despesa de Férias / C – Férias a Pagar ${fmt.brl(fer + terco)}<br>D – Despesa de 13º Salário / C – 13º Salário a Pagar ${fmt.brl(dec)}<br>D – Despesa de INSS / C – INSS a Recolher ${fmt.brl(inss)}<br>D – Despesa de FGTS / C – FGTS a Recolher ${fmt.brl(fgts)}</p><p><small>Simplificação: empresa do regime geral, sem RAT nem contribuições a terceiros (que aumentariam o custo). O INSS e o IRRF descontados do empregado são <b>retenções</b>: reduzem o líquido a pagar a ele, mas não são despesa da empresa.</small></p>`;
  };
  const prevFolha = ui.previsao({
    pergunta: 'Salário de R$ 3.000. Somando INSS patronal (20%), FGTS (8%) e as provisões mensais de férias + 1/3 e de 13º (com os encargos sobre elas), quanto a empresa gasta por mês com esse empregado?',
    opcoes: ['Cerca de R$ 3.240', 'Cerca de R$ 3.840', 'Cerca de R$ 4.590'],
    correta: 2,
    explicacao: 'Remuneração do mês = 3.000 + 250 (férias) + 83,33 (1/3) + 250 (13º) = 3.583,33. Encargos de 28% (20% + 8%) sobre isso = 1.003,33. Total ≈ <b>R$ 4.586,67</b>. Quem só soma 28% sobre o salário (3.840) esquece férias e 13º; 3.240 é só o FGTS.',
    aoResponder: () => { corpoF.style.display = ''; calc(); },
  });
  corpoF.append(ctlSal, tabF, lancF);

  el.append(
    h('div', { class: 'demo-painel' },
      h('p', { html: '<b>Parte 1 — Provisão, nota ou nada?</b>' }),
      h('div', { class: 'demo-linha' }, casoEl, placar), area, msg),
    quadroEl,
    h('div', { class: 'demo-painel' }, h('p', { html: '<b>Parte 2 — Quanto custa um empregado por mês?</b>' }), prevFolha, corpoF));
  proximo();
}

export default {
  id: '06-passivos-provisoes',
  numero: 6,
  disciplina: 'Contabilidade Geral',
  titulo: 'Passivos, provisões, folha e tributos',
  subtitulo: 'Provável, possível ou remota? E quanto custa um empregado?',
  incidencia: 'alta',
  tempo: 65,
  pergunta: 'A empresa foi processada e o advogado diz que a perda é "possível". Ela deve lançar uma provisão no balanço?',
  previsao: {
    pergunta: 'Um processo trabalhista tem perda considerada <b>provável</b>, com valor estimado de forma confiável em R$ 80.000. O que a NBC TG 25 manda fazer?',
    opcoes: ['Só divulgar em nota explicativa', 'Reconhecer provisão de R$ 80.000 no passivo', 'Não fazer nada até a sentença'],
    correta: 1,
    explicacao: 'Obrigação presente + saída <b>provável</b> + estimativa confiável = <b>provisão</b>: D – Despesa / C – Provisão para Riscos Trabalhistas 80.000 (com nota explicativa). Se a perda fosse só <b>possível</b>, seria passivo contingente: apenas nota. Se fosse <b>remota</b>, nada.',
  },
  paginas: [
    {
      titulo: 'Passivo: fornecedores, fisco e outras obrigações',
      html: `<p><b>Passivo</b> é uma obrigação presente da entidade de transferir um recurso econômico como resultado de eventos passados (Estrutura Conceitual). Pela Lei 6.404/76 (art. 180), vai para o <b>Passivo Circulante</b> o que vence no exercício seguinte, e para o <b>Não Circulante</b> o que vence depois. Na prática: <b>até 12 meses</b> da data do balanço = circulante (ou o ciclo operacional, se for maior).</p>
<table class="tabela"><thead><tr><th>Conta</th><th>Nasce quando</th><th>Lançamento típico</th></tr></thead><tbody>
<tr><td>Fornecedores</td><td>compra a prazo</td><td>D – Estoques / C – Fornecedores</td></tr>
<tr><td>Salários a Pagar</td><td>termina o mês trabalhado (competência)</td><td>D – Despesa de Salários / C – Salários a Pagar</td></tr>
<tr><td>Impostos a Recolher</td><td>venda tributada ou retenção na fonte</td><td>D – ICMS sobre Vendas / C – ICMS a Recolher</td></tr>
<tr><td>Adiantamento de Clientes</td><td>recebimento antes da entrega</td><td>D – Caixa / C – Adiantamento de Clientes</td></tr>
<tr><td>Dividendos a Pagar</td><td>destinação do lucro</td><td>D – Lucros Acumulados / C – Dividendos a Pagar</td></tr></tbody></table>
<div class="exemplo"><b>Pagamento antecipado a fornecedor:</b> duplicata de R$ 10.000 paga antes do vencimento com 2% de desconto.<br>D – Fornecedores 10.000<br>C – Caixa 9.800<br>C – Descontos Obtidos (receita financeira) 200</div>
<aside class="nota">Obrigações de longo prazo são ajustadas a valor presente; as de curto prazo, quando o efeito for relevante (Lei 6.404/76, art. 184, III; NBC TG 12).</aside>`,
    },
    {
      titulo: 'Empréstimos, encargos a apropriar e custo amortizado',
      html: `<p>Num empréstimo com juros <b>prefixados</b>, registra-se a dívida total e os juros ainda não incorridos ficam numa conta <b>redutora</b> do passivo: Encargos Financeiros a Transcorrer (ou a Apropriar). Os juros viram despesa <b>com o passar do tempo</b> (competência), e não no pagamento.</p>
<div class="exemplo"><b>Exemplo:</b> em 1º/10/X1, empréstimo de R$ 100.000 para pagar R$ 112.000 em 1º/10/X2.<br>
D – Caixa 100.000<br>D – Encargos Financeiros a Transcorrer (redutora) 12.000<br>C – Empréstimos a Pagar 112.000<br>
Em 31/12/X1, apropriando 3 meses de forma linear (12.000 × 3/12): D – Despesa Financeira / C – Encargos a Transcorrer 3.000.<br>
Passivo líquido em 31/12/X1 = 112.000 − 9.000 = <b>103.000</b> (100.000 recebidos + 3.000 de juros incorridos).</div>
<p>A norma (NBC TG 48) manda usar o <b>custo amortizado</b>, com juros pela <b>taxa efetiva</b> (juros compostos):</p>
<div class="formula">Saldo final = saldo inicial + saldo × taxa efetiva − pagamentos</div>
<div class="exemplo"><b>Exemplo (taxa efetiva de 2% ao mês):</b> R$ 200.000 por 3 meses, pagamento único.<br>Mês 1: 200.000 × 2% = 4.000 → 204.000<br>Mês 2: 204.000 × 2% = 4.080 → 208.080<br>Mês 3: 208.080 × 2% = 4.161,60 → 212.241,60 (valor pago no vencimento)</div>
<div class="caixa"><b>Custos de transação</b> de empréstimos ao custo amortizado (NBC TG 48) — custos incrementais diretamente atribuíveis à captação, como certas tarifas e comissões — <b>reduzem</b> o valor inicial do passivo e vão para o resultado junto com os juros, pela taxa efetiva. Captou 500.000 e pagou 10.000 de custos → passivo inicial líquido de 490.000. A antiga NBC TG 08 foi revogada pela Resolução CFC 1.741/2024; o tratamento permanece nas normas vigentes.</div>
<aside class="nota">Use apropriação linear quando essa hipótese for expressa no enunciado. A expressão "pro rata" sozinha indica proporcionalidade ao tempo e não substitui a taxa efetiva exigida pela norma.</aside>`,
    },
    {
      titulo: 'Provisão × passivo contingente × ativo contingente',
      html: `<p><b>Provisão</b> (NBC TG 25) é um passivo de <b>prazo ou valor incertos</b>. Só é reconhecida quando há, <b>ao mesmo tempo</b>:</p>
<ol><li>uma <b>obrigação presente</b> (legal ou não formalizada) resultante de <b>evento passado</b>;</li><li>saída de recursos <b>provável</b> (mais provável que sim do que não);</li><li><b>estimativa confiável</b> do valor.</li></ol>
<table class="tabela"><thead><tr><th>Saída de recursos</th><th>Tratamento</th><th>Entrada de recursos</th><th>Tratamento</th></tr></thead><tbody>
<tr><td>Provável e estimável</td><td><mark>Provisão</mark> no passivo + nota</td><td>Praticamente certa</td><td>Não é mais contingente: <mark>reconhece o ativo</mark></td></tr>
<tr><td>Possível</td><td>Passivo contingente: <b>só nota</b></td><td>Provável</td><td>Ativo contingente: <b>só nota</b></td></tr>
<tr><td>Remota</td><td>Nada (nem nota)</td><td>Possível ou remota</td><td>Nada</td></tr></tbody></table>
<div class="caixa alerta"><b>Pegadinhas:</b><br>• Passivo contingente <b>não</b> é reconhecido no balanço — só divulgado.<br>• Ativo contingente provável: só nota. O ativo só é reconhecido quando a entrada é <b>praticamente certa</b> (a assimetria é proposital: prudência).<br>• "Provisão" para devedores duvidosos e "provisão" para depreciação <b>não</b> são provisões da NBC TG 25: são retificadoras do ativo (perdas estimadas).</div>
<p>Obrigação <b>não formalizada</b>: nasce de práticas passadas ou de políticas divulgadas que criam expectativa válida em terceiros — por exemplo, a empresa que publicamente sempre limpa terrenos contaminados, mesmo sem lei obrigando.</p>`,
    },
    {
      titulo: 'Como medir uma provisão',
      html: `<p>A provisão é mensurada pela <b>melhor estimativa</b> do valor necessário para liquidar a obrigação na data do balanço.</p>
<ul class="lista-check"><li><b>Muitos itens</b> (ex.: garantias): usa-se o <b>valor esperado</b> — cada resultado ponderado pela sua probabilidade.</li>
<li><b>Obrigação única</b> (ex.: um processo): o resultado individual <b>mais provável</b> costuma ser a melhor estimativa.</li>
<li>Se o efeito do tempo for relevante: <b>valor presente</b>.</li>
<li>Reembolso esperado (ex.: seguro): ativo separado, reconhecido só quando <b>praticamente certo</b> e limitado ao valor da provisão.</li>
<li>A provisão é revisada a cada balanço e só pode ser usada para os gastos para os quais foi criada.</li></ul>
<div class="exemplo"><b>Exemplo (garantias):</b> se todos os produtos vendidos tivessem defeitos pequenos, o reparo custaria R$ 1.000.000; se todos tivessem defeitos graves, R$ 4.000.000. A experiência indica 75% sem defeito, 20% com defeitos pequenos e 5% com defeitos graves.<br>Valor esperado = 75% × 0 + 20% × 1.000.000 + 5% × 4.000.000 = <b>400.000</b>.<br>D – Despesa com Garantias / C – Provisão para Garantias 400.000</div>
<div class="caixa"><b>NÃO se provisionam:</b> perdas operacionais futuras; gastos futuros que a empresa pode evitar (manutenção, treinamento); efeitos de lei ainda não aprovada (salvo se a aprovação for praticamente certa). <b>Provisionam-se:</b> contratos onerosos e reestruturações com plano formal já anunciado.</div>`,
    },
    {
      titulo: 'Folha de pagamento: salários, INSS e FGTS',
      html: `<p>A folha tem duas partes: o que é <b>descontado do empregado</b> (retenção — não é despesa da empresa) e o que é <b>encargo da empresa</b> (despesa).</p>
<table class="tabela"><thead><tr><th>Item</th><th>Quem suporta</th><th>Regra geral</th></tr></thead><tbody>
<tr><td>INSS do empregado</td><td>empregado (retido)</td><td>alíquotas progressivas de 7,5% a 14%, até o teto</td></tr>
<tr><td>IRRF</td><td>empregado (retido)</td><td>tabela progressiva vigente</td></tr>
<tr><td>INSS patronal</td><td><b>empresa</b></td><td>20% sobre a folha (Lei 8.212/91, art. 22), mais RAT (1% a 3%) e contribuições a terceiros</td></tr>
<tr><td>FGTS</td><td><b>empresa</b></td><td><b>8%</b> da remuneração (Lei 8.036/90, art. 15) — <b>não</b> é descontado do empregado</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo:</b> salários brutos de R$ 10.000; INSS retido R$ 900; IRRF retido R$ 300; INSS patronal 20%; FGTS 8%.<br>
1) D – Despesa de Salários / C – Salários a Pagar 10.000<br>
2) D – Salários a Pagar 1.200 / C – INSS a Recolher 900 / C – IRRF a Recolher 300<br>
3) D – Despesa de INSS (encargos sociais) / C – INSS a Recolher 2.000<br>
4) D – Despesa de FGTS / C – FGTS a Recolher 800<br>
Líquido a pagar aos empregados = 10.000 − 1.200 = <b>8.800</b>. Despesa total do mês = 10.000 + 2.000 + 800 = <b>12.800</b>.</div>
<div class="caixa alerta"><b>Pegadinha:</b> as retenções (INSS do empregado, IRRF) <b>não aumentam</b> a despesa — só mudam a quem a empresa paga. A despesa de salários é o valor <b>bruto</b>.</div>
<aside class="nota">Empresas do Simples Nacional e setores com regras especiais de contribuição seguem regimes próprios; na prova, use os percentuais do enunciado.</aside>`,
    },
    {
      titulo: 'Férias e 13º salário',
      html: `<p>Por competência, a cada mês trabalhado o empregado adquire 1/12 de férias, com o adicional de <b>1/3</b> (CF, art. 7º, XVII), e 1/12 de 13º salário (Lei 4.090/62). A despesa é reconhecida <b>mês a mês</b>, mesmo que o pagamento ocorra depois.</p>
<div class="formula">Férias do mês = salário ÷ 12 × 4/3</div>
<div class="formula">13º do mês = salário ÷ 12</div>
<div class="exemplo"><b>Exemplo:</b> salário de R$ 3.000.<br>Férias: 3.000 ÷ 12 = 250 + 1/3 (83,33) = <b>333,33</b> por mês<br>13º: 3.000 ÷ 12 = <b>250,00</b> por mês<br>Os encargos sobre esses valores também são reconhecidos: INSS 20% e FGTS 8% sobre 583,33 = 116,67 e 46,67.<br>
D – Despesa de Férias / C – Férias a Pagar 333,33<br>D – Despesa de 13º Salário / C – 13º Salário a Pagar 250,00</div>
<p>O 13º é pago em duas parcelas: a primeira até 30 de novembro e a segunda até 20 de dezembro (Lei 4.749/65). No pagamento, baixa-se o passivo: D – 13º Salário a Pagar / C – Caixa.</p>
<aside class="nota">Apesar do nome "provisão de férias", a NBC TG 25 trata férias a pagar como passivo de <b>apropriação por competência</b> (benefício de curto prazo a empregados, NBC TG 33): a incerteza é bem menor que a de uma provisão.</aside>`,
    },
    {
      titulo: 'Tributos sobre o lucro: correntes e diferidos',
      html: `<p>No lucro real, IRPJ = <b>15%</b> + adicional de <b>10%</b> sobre a parcela que exceder R$ 20.000 por mês (R$ 240.000 no ano) (Lei 9.249/95, art. 3º); CSLL = <b>9%</b> (regra geral). As questões costumam usar a alíquota combinada de <b>34%</b>.</p>
<div class="formula">Lucro real = lucro antes do IR/CS + adições − exclusões (LALUR)</div>
<table class="tabela"><thead><tr><th>Diferença</th><th>Exemplos</th><th>Efeito</th></tr></thead><tbody>
<tr><td><b>Permanente</b></td><td>multas punitivas, brindes e outras despesas indedutíveis</td><td>só aumenta o tributo corrente; <b>não</b> gera diferido</td></tr>
<tr><td><b>Temporária dedutível</b></td><td>provisão para contingências, perdas estimadas com clientes, impairment (dedutíveis só quando realizados)</td><td><b>ativo fiscal diferido</b> (paga agora, recupera depois)</td></tr>
<tr><td><b>Temporária tributável</b></td><td>ganho de valor justo ainda não tributado, depreciação fiscal acelerada</td><td><b>passivo fiscal diferido</b> (tributo que será pago no futuro)</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo (alíquota didática de 34% e lucro tributável futuro provável):</b> lucro antes do IR/CS de 500.000; adição de provisão para contingências de 100.000 (temporária); adição de multa indedutível de 20.000 (permanente).<br>
Lucro real = 620.000 → tributo corrente = 34% × 620.000 = <b>210.800</b><br>
Ativo fiscal diferido = 34% × 100.000 = <b>34.000</b><br>
D – Despesa de IR/CS Corrente / C – IR/CS a Recolher 210.800<br>
D – Ativo Fiscal Diferido / C – IR/CS Diferido (resultado, reduz a despesa) 34.000<br>
Despesa total na DRE = 210.800 − 34.000 = <b>176.800</b> = 34% × (500.000 + 20.000).</div>
<aside class="nota">NBC TG 32: o ativo fiscal diferido só é reconhecido se for provável haver lucro tributável futuro para aproveitá-lo.</aside>`,
    },
    {
      titulo: 'Tributos na compra e na venda',
      html: `<table class="tabela"><thead><tr><th>Momento</th><th>Lançamentos</th></tr></thead><tbody>
<tr><td>Compra (não cumulativo)</td><td>D – Estoques (valor líquido) · D – ICMS, PIS e COFINS a Recuperar · C – Fornecedores</td></tr>
<tr><td>Venda</td><td>D – Clientes / C – Receita Bruta · D – ICMS, PIS e COFINS sobre Vendas (deduções) / C – ICMS, PIS e COFINS a Recolher</td></tr>
<tr><td>Apuração do mês</td><td>D – ICMS a Recolher / C – ICMS a Recuperar (compensação); o saldo é pago: D – ICMS a Recolher / C – Caixa</td></tr>
<tr><td>IPI da indústria (cobrado "por fora")</td><td>D – Clientes (preço + IPI) / C – Receita de Vendas (preço) / C – IPI a Recolher. O IPI destacado não integra a receita bruta (Lei 12.973/2014).</td></tr>
<tr><td>Serviços tomados com retenção</td><td>D – Despesa de Serviços (bruto) / C – Fornecedores (líquido) / C – Tributos Retidos a Recolher</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo de apuração do ICMS (18%):</b> compras de R$ 50.000 (crédito de 9.000) e vendas de R$ 90.000 (débito de 16.200).<br>ICMS a recolher = 16.200 − 9.000 = <b>7.200</b>.<br>D – ICMS a Recolher / C – ICMS a Recuperar 9.000 (compensação)<br>D – ICMS a Recolher / C – Caixa 7.200 (pagamento)</div>
<div class="caixa">Se o crédito do mês for maior que o débito, o saldo de ICMS a Recuperar fica no Ativo para os meses seguintes.</div>
<aside class="nota">A reforma tributária (EC 132/2023 e LC 214/2025) cria a CBS e o IBS, também não cumulativos e cobrados "por fora", em transição a partir de 2026. A lógica contábil a recuperar × a recolher continua a mesma.</aside>`,
    },
  ],
  demo: {
    titulo: 'Experimento: a árvore das provisões e o custo da folha',
    instrucao: 'Parte 1: para cada caso, dê seu palpite (provisão, só nota ou nada) e veja o caminho da NBC TG 25 desenhado em vermelho. Parte 2: chute quanto custa um empregado por mês e depois mexa no salário para ver a conta montada.',
    montar: montarProvisoes,
  },
  macetes: [
    'Provisão exige <b>obrigação presente + saída provável + estimativa confiável</b>. Faltou um, não reconhece.',
    'Provável → <b>provisão</b> · Possível → <b>só nota</b> · Remota → <b>nada</b>.',
    'Ativo contingente: provável → só nota; <b>praticamente certo</b> → reconhece o ativo.',
    'FGTS (<b>8%</b>) e INSS patronal (20%) são despesa da empresa; INSS do empregado (7,5% a 14%) e IRRF são <b>retenções</b>.',
    'Férias do mês = salário ÷ 12 × <b>4/3</b>; 13º do mês = salário ÷ 12.',
    'Juros de empréstimo viram despesa com o <b>tempo</b> (encargos a transcorrer), não no pagamento.',
    'Diferença temporária <b>dedutível</b> → ativo diferido; <b>tributável</b> → passivo diferido; <b>permanente</b> → nada de diferido.',
    '"Provisão" para devedores duvidosos ou para depreciação não é provisão da NBC TG 25: é retificadora do ativo.',
  ],
  questoes: [
    {
      enunciado: 'Uma ação judicial movida contra a empresa tem probabilidade de perda avaliada como <b>possível</b>. De acordo com a NBC TG 25, a entidade deve:',
      alternativas: ['reconhecer provisão pelo valor estimado.', 'divulgar o passivo contingente em nota explicativa, sem reconhecer provisão.', 'não reconhecer nem divulgar, por se tratar de evento incerto.', 'reconhecer provisão pela metade do valor estimado.'],
      correta: 1,
      comentario: 'Perda <b>possível</b> = passivo contingente: não se reconhece no balanço, apenas se divulga em nota explicativa. Provisão só com perda <b>provável</b>; nada a divulgar só se for <b>remota</b>.',
    },
    {
      enunciado: 'Uma entidade move ação contra um fornecedor, e os assessores jurídicos consideram que a entrada de benefícios econômicos é provável, mas não praticamente certa. Pela NBC TG 25, a entidade deve:',
      alternativas: ['reconhecer um ativo e uma receita pelo valor esperado.', 'reconhecer uma provisão retificadora do ativo.', 'divulgar o ativo contingente em nota explicativa, sem reconhecê-lo no balanço.', 'não reconhecer nem divulgar, por prudência.'],
      correta: 2,
      comentario: 'Ativo contingente com entrada <b>provável</b>: só divulgação. O ativo só é reconhecido quando a entrada for <b>praticamente certa</b> — aí deixa de ser contingente.',
    },
    {
      enunciado: 'A folha de pagamento de março apresenta: salários brutos de R$ 50.000; INSS retido dos empregados de R$ 4.500; IRRF retido de R$ 2.000; INSS patronal de 20%; FGTS de 8%. A despesa total com pessoal reconhecida no mês (salários e encargos da empresa) é:',
      alternativas: ['R$ 64.000.', 'R$ 57.500.', 'R$ 70.500.', 'R$ 43.500.'],
      correta: 0,
      comentario: 'Despesa = salário bruto 50.000 + INSS patronal 10.000 (20%) + FGTS 4.000 (8%) = <b>64.000</b>. As retenções (4.500 + 2.000) não são despesa: reduzem o líquido a pagar aos empregados (43.500).',
    },
    {
      enunciado: 'Um empregado recebe salário mensal de R$ 2.400. O valor mensal a ser reconhecido como despesa de férias, incluindo o adicional constitucional, é:',
      alternativas: ['R$ 200,00.', 'R$ 800,00.', 'R$ 3.200,00.', 'R$ 266,67.'],
      correta: 3,
      comentario: '1/12 do salário = 200,00; adicional de 1/3 = 66,67. Total mensal = <b>266,67</b> (= 2.400 ÷ 12 × 4/3). 3.200 é o valor das férias anuais com o terço.',
    },
    {
      enunciado: 'Em 1º/10/X1, uma empresa obteve empréstimo de R$ 300.000, a ser quitado em 1º/10/X2 em parcela única de R$ 336.000. Considerando a apropriação linear dos encargos, o saldo líquido do empréstimo no balanço de 31/12/X1 é:',
      alternativas: ['R$ 300.000.', 'R$ 309.000.', 'R$ 327.000.', 'R$ 336.000.'],
      correta: 1,
      comentario: 'Encargos totais = 36.000; apropriados de outubro a dezembro = 36.000 × 3/12 = 9.000. Encargos a transcorrer = 27.000. Saldo líquido = 336.000 − 27.000 = <b>309.000</b> (passivo circulante, vence em até 12 meses).',
    },
    {
      enunciado: 'Uma empresa captou empréstimo de R$ 500.000 e pagou R$ 10.000 de custos de transação (tarifas e comissões). Considerando a mensuração ao custo amortizado pela NBC TG 48, no reconhecimento inicial:',
      alternativas: ['o passivo é registrado por R$ 500.000 e os custos de transação são despesa imediata.', 'os custos de transação são ativados no intangível e amortizados em 5 anos.', 'o passivo é registrado pelo valor líquido de R$ 490.000, e os custos de transação são apropriados ao resultado pelo método da taxa efetiva de juros.', 'o passivo é registrado por R$ 510.000.'],
      correta: 2,
      comentario: 'Custos de transação <b>reduzem</b> o valor inicial do passivo (490.000) e são apropriados ao resultado ao longo do prazo, junto com os juros, pela <b>taxa efetiva</b>.',
    },
    {
      enunciado: 'Uma empresa apurou lucro antes do IR e da CSLL de R$ 400.000. Houve adição de R$ 50.000 referente a provisão para contingências, dedutível apenas quando paga (diferença temporária). É provável haver lucro tributável futuro suficiente para utilizar essa diferença. Com alíquota combinada de 34%, o ativo fiscal diferido e o IR/CS corrente são, respectivamente:',
      alternativas: ['R$ 17.000 e R$ 153.000.', 'R$ 17.000 e R$ 136.000.', 'R$ 153.000 e R$ 17.000.', 'zero e R$ 153.000.'],
      correta: 0,
      comentario: 'Lucro real = 400.000 + 50.000 = 450.000 → corrente = 34% × 450.000 = <b>153.000</b>. Como há lucro tributável futuro provável, a diferença temporária dedutível gera ativo diferido = 34% × 50.000 = <b>17.000</b>. Despesa total na DRE = 153.000 − 17.000 = 136.000.',
    },
    {
      enunciado: 'Segundo a NBC TG 25, é exemplo de provisão:',
      alternativas: ['perdas estimadas em créditos de liquidação duvidosa.', 'depreciação acumulada de máquinas.', 'garantias de produtos vendidos, estimadas com base na experiência passada.', 'prejuízos operacionais esperados para o próximo exercício.'],
      correta: 2,
      comentario: 'Garantias: obrigação presente (venda já feita), saída provável e estimável → <b>provisão</b>. PECLD e depreciação acumulada são retificadoras do ativo; prejuízos operacionais futuros não podem ser provisionados.',
    },
    {
      enunciado: 'Uma empresa vende produtos com garantia de 1 ano. Se todos os produtos vendidos apresentassem defeitos leves, o custo de reparo seria de R$ 100.000; se todos apresentassem defeitos graves, de R$ 400.000. A experiência indica que 80% não apresentarão defeito, 15% terão defeitos leves e 5% defeitos graves. A provisão para garantias é:',
      alternativas: ['R$ 500.000.', 'R$ 100.000.', 'R$ 20.000.', 'R$ 35.000.'],
      correta: 3,
      comentario: 'Valor esperado = 80% × 0 + 15% × 100.000 + 5% × 400.000 = 15.000 + 20.000 = <b>35.000</b>.',
    },
    {
      enunciado: 'Uma empresa comercial, contribuinte do ICMS, comprou mercadorias por R$ 40.000, com ICMS de 18% incluso no preço, e vendeu todas por R$ 70.000, também com ICMS de 18%. O ICMS a recolher no período e o CMV são, respectivamente:',
      alternativas: ['R$ 12.600 e R$ 40.000.', 'R$ 5.400 e R$ 32.800.', 'R$ 5.400 e R$ 40.000.', 'R$ 7.200 e R$ 32.800.'],
      correta: 1,
      comentario: 'Crédito na compra = 18% × 40.000 = 7.200 → custo do estoque = 32.800 (= CMV, pois tudo foi vendido). Débito na venda = 18% × 70.000 = 12.600. ICMS a recolher = 12.600 − 7.200 = <b>5.400</b>.',
    },
  ],
  resumo: [
    'Passivo: obrigação presente de evento passado; circulante = vence em até 12 meses.',
    'Desconto obtido por pagar antes = receita financeira; juros por atraso = despesa financeira.',
    'Empréstimo prefixado: juros futuros em "encargos a transcorrer" (redutora), apropriados pelo tempo; norma: custo amortizado pela taxa efetiva.',
    'Custos incrementais da captação ao custo amortizado (NBC TG 48) reduzem o passivo inicial e são apropriados pela taxa efetiva; a NBC TG 08 foi revogada.',
    'Provisão = obrigação presente + provável + estimável. Possível → passivo contingente (só nota). Remota → nada.',
    'Ativo contingente: provável → só nota; praticamente certo → reconhece o ativo.',
    'Provisão mede-se pela melhor estimativa: valor esperado (muitos itens) ou resultado mais provável (item único).',
    'Folha: INSS patronal 20% + RAT + terceiros e FGTS 8% são despesa; INSS do empregado e IRRF são retenções.',
    'Férias do mês = salário ÷ 12 × 4/3; 13º do mês = salário ÷ 12 (+ encargos).',
    'IRPJ 15% + 10% acima de R$ 240 mil/ano; CSLL 9%. Temporária dedutível → ativo diferido; tributável → passivo diferido.',
    'Tributos não cumulativos: a recuperar na compra, a recolher na venda; compensa e paga o saldo.',
  ],
};
