// Lição 03 — Débito, crédito e o razonete (demo: razonetes à caneta + balancete que fecha).
const CONTAS = {
  caixa: { nome: 'Caixa', nat: 'D', grupo: 'Ativo' },
  clientes: { nome: 'Clientes', nat: 'D', grupo: 'Ativo' },
  merc: { nome: 'Mercadorias', nat: 'D', grupo: 'Ativo' },
  moveis: { nome: 'Móveis e Utensílios', nat: 'D', grupo: 'Ativo' },
  aluguel: { nome: 'Despesa de Aluguel', nat: 'D', grupo: 'Despesa' },
  forn: { nome: 'Fornecedores', nat: 'C', grupo: 'Passivo' },
  capital: { nome: 'Capital Social', nat: 'C', grupo: 'PL' },
  receita: { nome: 'Receita de Serviços', nat: 'C', grupo: 'Receita' },
};
const ORDEM = ['caixa', 'clientes', 'merc', 'moveis', 'aluguel', 'forn', 'capital', 'receita'];
const FATOS = [
  { txt: 'Os sócios integralizam o capital em dinheiro: R$ 50.000.', contas: ['capital', 'caixa'], d: 'caixa', c: 'capital', v: 50000,
    exp: 'Entrou dinheiro: Caixa (Ativo) aumenta → <b>débito</b>. O Capital Social (PL) nasce → <b>crédito</b>.' },
  { txt: 'Compra de mercadorias a prazo: R$ 20.000.', contas: ['merc', 'forn'], d: 'merc', c: 'forn', v: 20000,
    exp: 'O estoque (Ativo) aumenta → débito. Nasce a dívida com o fornecedor (Passivo) → crédito.' },
  { txt: 'Compra de móveis à vista: R$ 6.000.', contas: ['caixa', 'moveis'], d: 'moveis', c: 'caixa', v: 6000,
    exp: 'Móveis (Ativo) aumentam → débito. Saiu dinheiro: Caixa diminui → crédito.' },
  { txt: 'Serviço prestado a prazo: R$ 9.000.', contas: ['receita', 'clientes'], d: 'clientes', c: 'receita', v: 9000,
    exp: 'Nasce um direito a receber (Clientes, Ativo) → débito. A receita (aumenta o PL) → crédito. Pela competência, a receita existe quando o serviço é prestado, mesmo sem dinheiro.' },
  { txt: 'Pagamento do aluguel do mês: R$ 2.500.', contas: ['caixa', 'aluguel'], d: 'aluguel', c: 'caixa', v: 2500,
    exp: 'Despesa nasce a <b>débito</b> (ela reduz o PL). Saiu dinheiro → crédito no Caixa.' },
  { txt: 'Recebimento de parte do valor devido pelos clientes: R$ 4.000.', contas: ['clientes', 'caixa'], d: 'caixa', c: 'clientes', v: 4000,
    exp: 'Entrou dinheiro → débito no Caixa. O direito contra o cliente diminui → crédito em Clientes. Não é receita de novo: ela já foi reconhecida no fato 4.' },
  { txt: 'Pagamento de parte da dívida com fornecedores: R$ 8.000.', contas: ['forn', 'caixa'], d: 'forn', c: 'caixa', v: 8000,
    exp: 'A dívida (Passivo) diminui → <b>débito</b> em Fornecedores. Saiu dinheiro → crédito no Caixa.' },
];

function montarRazonete(el, kit) {
  const { h, fmt, INK, pen, ui } = kit;
  const lanc = {};
  const zerar = () => ORDEM.forEach((k) => { lanc[k] = { d: [], c: [] }; });
  zerar();
  const soma = (arr) => arr.reduce((s, x) => s + x.v, 0);

  // grade de razonetes (um quadro à caneta por conta; viewBox responsivo)
  const grade = h('div', { class: 'rz-grade', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(46%, 200px), 1fr))', gap: '6px', margin: '10px 0' } });
  const quadros = {};
  ORDEM.forEach((k, i) => {
    const cel = h('div', { class: 'rz-cel', style: { minWidth: 0 } });
    grade.append(cel);
    quadros[k] = pen.quadro(cel, { largura: 220, altura: 185, semente: 3 + i });
    quadros[k].svg.setAttribute('aria-label', `Razonete da conta ${CONTAS[k].nome}`);
  });

  const desenhar = (k, destaque = false) => {
    const q = quadros[k], c = CONTAS[k], L = lanc[k];
    const an = destaque ? {} : { animar: false };
    q.limpar();
    q.texto(110, 24, c.nome, { ancora: 'middle', tamanho: 22, cor: destaque ? INK.vermelho : INK.azul, peso: 600, animar: false });
    q.texto(110, 42, `${c.grupo} · natureza ${c.nat === 'D' ? 'devedora' : 'credora'}`, { ancora: 'middle', tamanho: 12, cor: INK.lapis, fonte: 'texto', animar: false });
    q.linha(12, 52, 208, 52, { cor: INK.azul, animar: false });
    q.linha(110, 52, 110, 148, { cor: INK.azul, animar: false });
    q.texto(20, 66, 'D', { tamanho: 13, cor: INK.lapis, fonte: 'texto', animar: false });
    q.texto(200, 66, 'C', { tamanho: 13, cor: INK.lapis, fonte: 'texto', ancora: 'end', animar: false });
    L.d.forEach((x, i) => q.texto(104, 88 + i * 21, `(${x.n}) ${fmt.int(x.v)}`, { ancora: 'end', tamanho: 20, cor: INK.azul, ...an }));
    L.c.forEach((x, i) => q.texto(116, 88 + i * 21, `(${x.n}) ${fmt.int(x.v)}`, { tamanho: 20, cor: INK.vermelho, ...an }));
    const sd = soma(L.d), sc = soma(L.c), s = sd - sc;
    if (L.d.length || L.c.length) {
      q.linha(20, 152, 200, 152, { cor: INK.lapis, ...an });
      if (s > 0) q.texto(10, 176, `saldo D ${fmt.int(s)}`, { tamanho: 20, cor: INK.verde, peso: 700, ...an });
      else if (s < 0) q.texto(210, 176, `saldo C ${fmt.int(-s)}`, { ancora: 'end', tamanho: 20, cor: INK.verde, peso: 700, ...an });
      else q.texto(110, 176, 'saldada (zero)', { ancora: 'middle', tamanho: 18, cor: INK.lapis, ...an });
    }
  };
  ORDEM.forEach((k) => desenhar(k));

  // balancete
  const bal = h('div', {});
  const atualizarBalancete = (final = false) => {
    let td = 0, tc = 0;
    const grupos = { Ativo: 0, Passivo: 0, PL: 0, Receita: 0, Despesa: 0 };
    const linhas = [];
    ORDEM.forEach((k) => {
      const L = lanc[k];
      if (!L.d.length && !L.c.length) return;
      const s = soma(L.d) - soma(L.c);
      if (s > 0) td += s; else tc -= s;
      grupos[CONTAS[k].grupo] += CONTAS[k].nat === 'D' ? s : -s;
      linhas.push([CONTAS[k].nome, s > 0 ? fmt.brl(s) : (s === 0 ? '—' : ''), s < 0 ? fmt.brl(-s) : (s === 0 ? '—' : '')]);
    });
    linhas.push(['<b>Totais</b>', `<b>${fmt.brl(td)}</b>`, `<b>${fmt.brl(tc)}</b>`]);
    bal.innerHTML = '';
    bal.append(h('p', { html: '<b>Balancete de verificação</b>' }), ui.tabela(['Conta', 'Saldo devedor', 'Saldo credor'], linhas));
    if (linhas.length > 1) {
      bal.append(h('p', { class: td === tc ? 'ok' : 'nok', html: td === tc ? `✔ Soma dos saldos devedores = soma dos saldos credores (${fmt.brl(td)}): o balancete <b>fecha</b>.` : '✘ O balancete não fecha.' }));
    }
    if (final) {
      bal.append(h('div', { class: 'caixa', html: `<b>A equação do balancete:</b><br>Ativo ${fmt.brl(grupos.Ativo)} + Despesas ${fmt.brl(grupos.Despesa)} = Passivo ${fmt.brl(grupos.Passivo)} + PL ${fmt.brl(grupos.PL)} + Receitas ${fmt.brl(grupos.Receita)}<br>${fmt.brl(grupos.Ativo + grupos.Despesa)} = ${fmt.brl(grupos.Passivo + grupos.PL + grupos.Receita)} ✔` }));
    }
  };

  // painel do fato atual: pergunta → palpite (D/C de cada conta) → lançar → resultado
  let n = 0, acertos = 0, ultimos = [];
  const fatoEl = h('p', { class: 'demo-fato' });
  const placar = h('span', { class: 'demo-placar' });
  const area = h('div', {});
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' }, 'Para cada fato, marque qual conta vai a débito e qual vai a crédito. Depois clique em "Lançar" e veja o T ser preenchido.');
  const marcar = (grp, i) => [...grp.children].forEach((x, j) => {
    x.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    x.style.background = j === i ? INK.marca : '';
  });

  const proximo = () => {
    area.innerHTML = '';
    ultimos.forEach((k) => desenhar(k));
    ultimos = [];
    if (n >= FATOS.length) {
      fatoEl.innerHTML = `<b>Fim!</b> Você acertou ${acertos} de ${FATOS.length} lançamentos. Repare no balancete: como todo lançamento tem débito = crédito, a soma dos saldos devedores sempre empata com a dos credores.`;
      placar.textContent = `acertos: ${acertos}/${FATOS.length}`;
      atualizarBalancete(true);
      area.append(h('button', { type: 'button', class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; zerar(); ORDEM.forEach((k) => desenhar(k)); atualizarBalancete(); msg.innerHTML = 'Recomeçamos. Marque débito ou crédito para cada conta.'; proximo(); } }, '↺ Recomeçar'));
      return;
    }
    const f = FATOS[n];
    fatoEl.innerHTML = `<b>Fato ${n + 1}/${FATOS.length}:</b> ${f.txt}`;
    placar.textContent = `acertos: ${acertos}`;
    const escolha = {}, grupos = {};
    const btnLancar = h('button', { type: 'button', class: 'btn-caneta primario', disabled: true }, 'Lançar ✍');
    f.contas.forEach((k) => {
      const g = ui.botoes(['Débito', 'Crédito'], (i, b, grp) => {
        if (btnLancar.dataset.feito) return;
        escolha[k] = i === 0 ? 'D' : 'C';
        marcar(grp, i);
        btnLancar.disabled = Object.keys(escolha).length < 2;
      });
      grupos[k] = g;
      area.append(h('div', { class: 'demo-linha', style: { alignItems: 'center', flexWrap: 'wrap' } }, h('span', { style: { minWidth: '11em' } }, h('b', {}, CONTAS[k].nome)), g));
    });
    btnLancar.addEventListener('click', () => {
      if (btnLancar.dataset.feito) return;
      const [a, b] = f.contas.map((k) => escolha[k]);
      if (a === b) {
        msg.innerHTML = `<p class="nok">✘ Pare! Partidas dobradas: todo lançamento precisa de pelo menos <b>um débito e um crédito</b> de mesmo valor. Você marcou as duas contas a ${a === 'D' ? 'débito' : 'crédito'}. Ajuste e lance de novo.</p>`;
        return;
      }
      btnLancar.dataset.feito = '1';
      btnLancar.disabled = true;
      const certo = escolha[f.d] === 'D';
      if (certo) acertos++;
      f.contas.forEach((k) => {
        const g = grupos[k], ok = k === f.d ? 0 : 1, esc = escolha[k] === 'D' ? 0 : 1;
        [...g.children].forEach((x) => { x.disabled = true; });
        g.children[ok].classList.add('certo');
        if (esc !== ok) g.children[esc].classList.add('errado');
      });
      lanc[f.d].d.push({ n: n + 1, v: f.v });
      lanc[f.c].c.push({ n: n + 1, v: f.v });
      desenhar(f.d, true); desenhar(f.c, true);
      ultimos = [f.d, f.c];
      msg.innerHTML = `<p class="${certo ? 'ok' : 'nok'}">${certo ? '✔ Isso!' : '✘ Invertido.'} ${f.exp}</p><p class="lanc">D – ${CONTAS[f.d].nome} ${fmt.brl(f.v)} · C – ${CONTAS[f.c].nome} ${fmt.brl(f.v)}</p>`;
      atualizarBalancete();
      n++;
      placar.textContent = `acertos: ${acertos}`;
      area.append(h('button', { type: 'button', class: 'btn-caneta primario', onclick: proximo }, n < FATOS.length ? 'Próximo fato →' : 'Ver o balancete final'));
    });
    area.append(h('div', { class: 'demo-linha' }, btnLancar));
  };

  el.append(h('div', { class: 'demo-painel' }, h('div', { class: 'demo-linha' }, fatoEl, placar), area, msg), grade, h('div', { class: 'demo-painel' }, bal));
  atualizarBalancete();
  proximo();
}

export default {
  id: '03-debito-credito',
  numero: 3,
  disciplina: 'Contabilidade Geral',
  titulo: 'Débito, crédito e o razonete',
  subtitulo: 'Partidas dobradas sem decoreba',
  incidencia: 'alta',
  tempo: 55,
  pergunta: 'Se "debitar" o Caixa significa que entrou dinheiro, por que o extrato do seu banco diz "débito" quando o dinheiro sai?',
  previsao: {
    pergunta: 'A empresa paga, à vista, R$ 2.000 de aluguel do mês. Qual é o lançamento?',
    opcoes: ['D – Caixa / C – Despesa de Aluguel', 'D – Despesa de Aluguel / C – Caixa', 'D – Aluguel a Pagar / C – Despesa de Aluguel'],
    correta: 1,
    explicacao: 'Saiu dinheiro: o Caixa (Ativo) diminui, e Ativo diminui a <b>crédito</b>. A despesa nasce a <b>débito</b>. Lançamento: D – Despesa de Aluguel / C – Caixa 2.000. Débito não é "coisa ruim": é só o lado esquerdo da conta.',
  },
  paginas: [
    {
      titulo: 'Conta: o nome de cada gaveta',
      html: `<p><b>Conta</b> é o nome técnico que reúne os fatos de um mesmo elemento do patrimônio ou do resultado: Caixa, Fornecedores, Capital Social, Receita de Vendas… Pense em cada conta como uma "gaveta" onde se guardam as entradas e as saídas daquele elemento.</p>
<table class="tabela"><thead><tr><th>Classificação</th><th>O que é</th><th>Exemplos</th></tr></thead><tbody>
<tr><td><b>Patrimoniais</b></td><td>bens, direitos, obrigações e PL; aparecem no Balanço e o saldo passa para o exercício seguinte</td><td>Caixa, Estoques, Fornecedores, Capital Social</td></tr>
<tr><td><b>De resultado</b></td><td>receitas e despesas; aparecem na DRE e são <mark>zeradas no encerramento do exercício</mark></td><td>Receita de Vendas, Despesa de Salários, CMV</td></tr>
<tr><td><b>Sintéticas</b></td><td>agrupam outras contas; <b>não</b> recebem lançamentos diretamente</td><td>Ativo Circulante, Disponível</td></tr>
<tr><td><b>Analíticas</b></td><td>último nível do plano; são as que <b>recebem os lançamentos</b></td><td>Caixa Geral, Banco Alfa c/ Movimento</td></tr>
<tr><td><b>Retificadoras</b></td><td>reduzem o saldo do grupo em que aparecem; têm natureza oposta à do grupo</td><td>Depreciação Acumulada, Perdas Estimadas em Créditos de Liquidação Duvidosa (PECLD), Ações em Tesouraria, Capital a Integralizar</td></tr>
</tbody></table>
<div class="caixa"><b>Teorias das contas:</b> <b>personalista</b> (contas como "pessoas": agentes consignatários, agentes correspondentes e proprietário), <b>materialista</b> (contas integrais e diferenciais) e <b>patrimonialista</b> — a adotada no Brasil, que divide as contas em <b>patrimoniais</b> e <b>de resultado</b>.</div>
<aside class="nota">Pegadinha: livros antigos tratam "Duplicatas Descontadas" como retificadora do Ativo. Pelas normas atuais (NBC TG 48), o desconto de duplicatas com direito de regresso é um <b>empréstimo</b>: a obrigação vai para o Passivo.</aside>`,
    },
    {
      titulo: 'Natureza dos saldos: quem aumenta a débito',
      html: `<p>Esqueça "débito = ruim" e "crédito = bom". Em Contabilidade, <b>débito é o lado esquerdo</b> da conta e <b>crédito é o lado direito</b>. O que muda é o efeito em cada grupo:</p>
<table class="tabela"><thead><tr><th>Grupo</th><th>Aumenta com</th><th>Diminui com</th><th>Natureza do saldo</th></tr></thead><tbody>
<tr><td>Ativo</td><td>Débito</td><td>Crédito</td><td>Devedora</td></tr>
<tr><td>Despesas (e custos)</td><td>Débito</td><td>Crédito</td><td>Devedora</td></tr>
<tr><td>Passivo</td><td>Crédito</td><td>Débito</td><td>Credora</td></tr>
<tr><td>Patrimônio Líquido</td><td>Crédito</td><td>Débito</td><td>Credora</td></tr>
<tr><td>Receitas</td><td>Crédito</td><td>Débito</td><td>Credora</td></tr></tbody></table>
<div class="formula">Ativo + Despesas = Passivo + PL + Receitas</div>
<p>As <b>retificadoras</b> têm natureza <b>contrária</b> ao grupo que reduzem: Depreciação Acumulada e PECLD (retificam o Ativo) são <b>credoras</b>; Ações em Tesouraria, Capital a Integralizar e Prejuízos Acumulados (reduzem o PL) são <b>devedoras</b>.</p>
<div class="exemplo"><b>Por que o banco "debita" quando você saca?</b> O dinheiro na sua conta é uma <b>dívida do banco com você</b> (Passivo do banco). Quando você saca, essa dívida diminui, e Passivo diminui a débito. O extrato é escrito do ponto de vista do banco, não do seu.</div>`,
    },
    {
      titulo: 'Partidas dobradas',
      html: `<p>O método das partidas dobradas, divulgado pelo frade <b>Luca Pacioli</b> em 1494, tem uma regra só:</p>
<div class="formula">Não há débito sem crédito correspondente</div>
<ul class="lista-check"><li>Todo lançamento tem <b>pelo menos um débito e um crédito</b>.</li>
<li>A <b>soma dos débitos é sempre igual à soma dos créditos</b>.</li>
<li>Por isso, a qualquer momento, a soma dos saldos devedores é igual à soma dos saldos credores.</li></ul>
<div class="exemplo"><b>Exemplo:</b> compra de mercadorias por R$ 10.000, sendo R$ 4.000 à vista e R$ 6.000 a prazo.<br>
D – Mercadorias ........ 10.000<br>C – Caixa ........ 4.000<br>C – Fornecedores ........ 6.000<br>Débitos (10.000) = Créditos (4.000 + 6.000) ✔</div>
<div class="caixa"><b>Atalho mental:</b> comece pela conta de que você tem certeza. Se <b>entrou dinheiro</b>, debite Caixa; se <b>saiu</b>, credite Caixa. A outra conta fica com o lado que sobrou. Despesa nasce a débito; receita nasce a crédito.</div>
<aside class="nota">Débito e crédito, sozinhos, não querem dizer aumento ou diminuição. Debitar o Ativo aumenta; debitar o Passivo diminui.</aside>`,
    },
    {
      titulo: 'Lançamento: elementos e as quatro fórmulas',
      html: `<p>Lançamento é o registro do fato no livro Diário. Pela doutrina clássica, seus elementos essenciais são: <b>local e data</b>, <b>conta debitada</b>, <b>conta creditada</b>, <b>histórico</b> e <b>valor</b>. A ITG 2000 exige, no mínimo: data, conta devedora, conta credora, histórico, valor e a identificação de todos os registros que compõem um mesmo lançamento.</p>
<table class="tabela"><thead><tr><th>Fórmula</th><th>Contas</th><th>Exemplo</th></tr></thead><tbody>
<tr><td><b>1ª</b></td><td>1 débito e 1 crédito</td><td>Compra de mercadorias à vista: D – Mercadorias / C – Caixa</td></tr>
<tr><td><b>2ª</b></td><td>1 débito e 2 ou mais créditos</td><td>Recebimento de duplicata com juros: D – Caixa / C – Duplicatas a Receber / C – Receita de Juros</td></tr>
<tr><td><b>3ª</b></td><td>2 ou mais débitos e 1 crédito</td><td>Pagamento de duplicata com juros: D – Fornecedores / D – Despesa de Juros / C – Caixa</td></tr>
<tr><td><b>4ª</b></td><td>2 ou mais débitos e 2 ou mais créditos</td><td>Compra de terreno e galpão, parte à vista e parte a prazo: D – Terrenos / D – Edificações / C – Caixa / C – Títulos a Pagar</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo (3ª fórmula):</b> pagamento de duplicata de R$ 4.000 com juros de R$ 400.<br>D – Fornecedores 4.000<br>D – Despesa de Juros 400<br>C – Caixa 4.400</div>
<div class="caixa alerta"><b>Pegadinha:</b> a FGV troca a 2ª e a 3ª fórmula. Grave pelo <b>débito</b>: a 2ª tem <b>um</b> débito (e vários créditos); a 3ª tem <b>vários</b> débitos (e um crédito).</div>
<p><b>Correção de erros</b> (ITG 2000): a retificação de lançamento é feita por <b>estorno</b> (lançamento inverso que anula o errado), <b>transferência</b> (passa o valor da conta errada para a certa) ou <b>complementação</b> (registro que aumenta ou reduz o valor lançado anteriormente).</p>`,
    },
    {
      titulo: 'O razonete (o famoso "T")',
      html: `<p>O <b>razonete</b> é a forma simplificada de uma conta do livro Razão: um "T" com o nome da conta em cima, <b>débitos à esquerda</b> e <b>créditos à direita</b>.</p>
<table class="tabela razonete"><thead><tr><th colspan="2">Caixa</th></tr></thead><tbody>
<tr><td>(1) 50.000</td><td>(2) 15.000</td></tr>
<tr><td>(3) 8.000</td><td>(4) 3.000</td></tr>
<tr><td><b>58.000</b></td><td><b>18.000</b></td></tr>
<tr><td><b>Saldo devedor 40.000</b></td><td></td></tr></tbody></table>
<ol><li>Integralização de capital em dinheiro: 50.000 (débito no Caixa)</li><li>Compra de veículo à vista: 15.000 (crédito no Caixa)</li><li>Serviço prestado e recebido à vista: 8.000 (débito no Caixa)</li><li>Pagamento de salários: 3.000 (crédito no Caixa)</li></ol>
<div class="formula">Saldo = lado maior − lado menor (e fica do lado maior)</div>
<p>Débitos maiores → saldo <b>devedor</b>. Créditos maiores → saldo <b>credor</b>. Iguais → conta <b>saldada</b> (zerada).</p>
<div class="caixa alerta"><b>Pegadinha:</b> Caixa nunca pode ter saldo credor (não existe dinheiro negativo na gaveta). Se aparecer, há erro de registro — o "estouro de caixa", que o fisco trata como indício de omissão de receitas.</div>`,
    },
    {
      titulo: 'Livros Diário e Razão e a escrituração',
      html: `<table class="tabela"><thead><tr><th></th><th>Diário</th><th>Razão</th></tr></thead><tbody>
<tr><td>Método</td><td><b>Cronológico</b> (dia a dia, na ordem em que os fatos acontecem)</td><td><b>Sistemático</b> (agrupa os lançamentos por conta)</td></tr>
<tr><td>Obrigatoriedade</td><td>Indispensável pelo Código Civil (art. 1.180)</td><td>Obrigatório pela legislação do IR para o lucro real (Lei 8.218/91, art. 14)</td></tr>
<tr><td>Autenticação</td><td>No Registro Público de Empresas (Junta Comercial)</td><td>Dispensado de registro ou autenticação</td></tr>
<tr><td>Substituição</td><td>Por fichas, na escrituração mecanizada ou eletrônica (hoje, a ECD do SPED)</td><td>Por fichas</td></tr></tbody></table>
<p><b>Requisitos da escrituração</b> (Código Civil, art. 1.183, e ITG 2000): em <b>idioma e moeda corrente nacionais</b>, em <b>forma contábil</b>, por <b>ordem cronológica</b> de dia, mês e ano, <b>sem</b> intervalos em branco, entrelinhas, borrões, rasuras, emendas ou transportes para as margens, e com base em <b>documentos</b> que comprovem os fatos. É permitido usar códigos de números ou abreviaturas que constem de livro próprio, regularmente autenticado.</p>
<div class="caixa"><b>Formalidades extrínsecas</b> (do livro): encadernação ou fichas numeradas, termos de abertura e de encerramento, autenticação.<br><b>Formalidades intrínsecas</b> (do conteúdo): idioma e moeda nacionais, forma contábil, ordem cronológica, ausência de rasuras e de espaços em branco.</div>
<aside class="nota">Se a alternativa disser que o Diário agrupa os fatos por conta, ela está descrevendo o Razão.</aside>`,
    },
    {
      titulo: 'Balancete de verificação e plano de contas',
      html: `<p>O <b>balancete de verificação</b> lista as contas com seus saldos devedores e credores numa data. Se as partidas dobradas foram respeitadas, ele <b>fecha</b>:</p>
<div class="formula">Σ saldos devedores = Σ saldos credores</div>
<table class="tabela"><thead><tr><th>O balancete DETECTA</th><th>O balancete NÃO detecta</th></tr></thead><tbody>
<tr><td>débito sem o crédito correspondente</td><td>omissão total de um lançamento</td></tr>
<tr><td>valores diferentes a débito e a crédito</td><td>lançamento em duplicidade</td></tr>
<tr><td>erro na soma ou no cálculo do saldo de uma conta</td><td>lançamento na conta errada (ex.: aluguel lançado em salários)</td></tr>
<tr><td>saldo transcrito no lado errado do balancete</td><td>inversão de débito e crédito no lançamento</td></tr></tbody></table>
<p><b>Plano de contas</b> é o conjunto estruturado de contas da entidade: o <b>elenco</b> (lista codificada), a <b>função e o funcionamento</b> de cada conta (quando debitar, quando creditar, natureza do saldo) e os <b>níveis</b> (grupo → subgrupo → contas sintéticas → contas analíticas).</p>
<div class="exemplo"><b>Exemplo de codificação:</b><br>1 Ativo (sintética)<br>1.1 Ativo Circulante (sintética)<br>1.1.1 Disponível (sintética)<br>1.1.1.01 Caixa Geral (analítica)<br>1.1.1.02 Banco Alfa c/ Movimento (analítica)</div>
<div class="caixa alerta"><b>Pegadinha:</b> balancete fechado prova só que débitos = créditos, não que a escrituração está certa. E o balancete não é uma das demonstrações exigidas pela Lei 6.404/76 (art. 176): é instrumento de controle e base para montar o Balanço e a DRE.</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: monte os razonetes e feche o balancete',
    instrucao: 'Para cada fato, marque qual conta vai a débito e qual vai a crédito (seu palpite) e clique em "Lançar". Veja o T de cada conta ser preenchido à caneta e o balancete fechar a cada passo.',
    montar: montarRazonete,
  },
  macetes: [
    'Débito = lado <b>esquerdo</b>; crédito = lado <b>direito</b>. Não pense em "bom" ou "ruim".',
    '<b>A</b>tivo e <b>D</b>espesa aumentam a <b>D</b>ébito. Passivo, PL e Receita aumentam a crédito.',
    'Comece pelo Caixa: <b>entrou</b> dinheiro → debita; <b>saiu</b> → credita. A contrapartida aparece sozinha.',
    'Retificadora tem natureza <b>contrária</b> ao grupo: Depreciação Acumulada é credora; Ações em Tesouraria é devedora.',
    'Fórmulas, conte os débitos: 2ª = <b>um</b> débito e vários créditos; 3ª = <b>vários</b> débitos e um crédito.',
    'Diário = <b>cronológico</b> (dia a dia). Razão = <b>sistemático</b> (conta a conta).',
    'Balancete fechado não prova que está tudo certo: omissão, duplicidade, conta errada e inversão passam despercebidas.',
    'Banco "debita" quando você saca porque, para ele, seu saldo é uma <b>dívida</b> (passivo).',
  ],
  questoes: [
    {
      enunciado: 'Assinale a alternativa que apresenta <b>apenas</b> contas de natureza credora:',
      alternativas: ['Fornecedores, Capital Social e Depreciação Acumulada.', 'Caixa, Fornecedores e Receita de Vendas.', 'Ações em Tesouraria, Capital Social e Salários a Pagar.', 'Despesa de Aluguel, Clientes e Reserva Legal.'],
      correta: 0,
      comentario: 'Fornecedores (Passivo) e Capital Social (PL) são credoras. Depreciação Acumulada é retificadora do Ativo, logo tem natureza <b>credora</b>. Nas outras há contas devedoras: Caixa e Clientes (Ativo), Ações em Tesouraria (retificadora do PL, devedora) e Despesa de Aluguel.',
    },
    {
      enunciado: 'O balancete de verificação de uma empresa, que está fechado, apresenta os seguintes saldos (em R$): Caixa 12.000; Clientes 18.000; Estoques 25.000; Imóveis 30.000; CMV 20.000; Despesas Administrativas 9.000; Fornecedores 24.000; Capital Social 40.000; Receita de Vendas 30.000; Empréstimos a Pagar: ?. O saldo de Empréstimos a Pagar é:',
      alternativas: ['R$ 11.000.', 'R$ 20.000.', 'R$ 29.000.', 'R$ 38.000.'],
      correta: 1,
      comentario: 'Saldos devedores (Ativo + despesas/custos): 12.000 + 18.000 + 25.000 + 30.000 + 20.000 + 9.000 = 114.000. Saldos credores conhecidos: 24.000 + 40.000 + 30.000 = 94.000. Para fechar: 114.000 − 94.000 = <b>20.000</b>. Quem esquece as despesas administrativas chega a 11.000.',
    },
    {
      enunciado: 'Mesmo com o balancete de verificação fechado (soma dos saldos devedores igual à soma dos saldos credores), pode permanecer <b>sem ser revelado</b> o seguinte erro:',
      alternativas: ['lançamento de um débito sem o crédito correspondente.', 'lançamento de R$ 1.500 a débito e de R$ 1.050 a crédito.', 'registro de uma despesa de aluguel na conta Despesa de Salários.', 'transcrição do saldo devedor do Caixa na coluna de saldos credores.'],
      correta: 2,
      comentario: 'Lançar na conta errada, com débito e crédito de mesmo valor, mantém a igualdade: o balancete fecha e o erro passa. As demais alternativas quebram a igualdade entre débitos e créditos e seriam detectadas.',
    },
    {
      enunciado: 'São contas retificadoras, <b>respectivamente</b>, do Ativo e do Patrimônio Líquido:',
      alternativas: ['Ações em Tesouraria e Depreciação Acumulada.', 'Perdas Estimadas em Créditos de Liquidação Duvidosa e Reserva Legal.', 'Capital a Integralizar e Amortização Acumulada.', 'Depreciação Acumulada e Ações em Tesouraria.'],
      correta: 3,
      comentario: 'Depreciação Acumulada reduz o Ativo; Ações em Tesouraria reduzem o PL. A alternativa A inverte a ordem; a C também (Capital a Integralizar é do PL e Amortização Acumulada é do Ativo); Reserva Legal não é retificadora.',
    },
    {
      enunciado: 'Segundo o Código Civil (art. 1.183) e a ITG 2000, a escrituração contábil deve ser feita:',
      alternativas: ['em qualquer idioma, desde que traduzida por tradutor juramentado ao final do exercício.', 'em moeda estrangeira, quando a entidade for controlada por empresa estrangeira.', 'em idioma e moeda corrente nacionais, em forma contábil, por ordem cronológica, sem intervalos em branco, entrelinhas, borrões, rasuras ou emendas.', 'em ordem alfabética das contas, admitidas rasuras desde que ressalvadas pelo contador.'],
      correta: 2,
      comentario: 'Esses são os requisitos (formalidades intrínsecas) da escrituração: idioma e moeda <b>nacionais</b>, forma contábil, ordem <b>cronológica</b> e ausência de espaços em branco, entrelinhas, borrões, rasuras e emendas.',
    },
    {
      enunciado: 'Acerca dos livros Diário e Razão, é correto afirmar que:',
      alternativas: ['o Razão registra os fatos em ordem cronológica e o Diário os agrupa por conta.', 'o Razão substitui o Diário nas empresas tributadas pelo lucro real.', 'ambos são facultativos para as sociedades empresárias, cabendo ao contador decidir.', 'o Diário registra os fatos em ordem cronológica e é indispensável pelo Código Civil; o Razão agrupa os lançamentos por conta.'],
      correta: 3,
      comentario: 'Diário = método <b>cronológico</b>, indispensável (CC, art. 1.180). Razão = método <b>sistemático</b>, conta a conta, exigido pela legislação do IR para o lucro real. Um não substitui o outro.',
    },
    {
      enunciado: 'No plano de contas de uma empresa, a conta "Disponível", que agrupa as contas Caixa Geral e Banco Alfa c/ Movimento, é classificada como:',
      alternativas: ['analítica, pois recebe lançamentos diretamente.', 'sintética, pois agrupa outras contas e não recebe lançamentos diretos.', 'de resultado, pois é zerada ao final do exercício.', 'retificadora, pois reduz o saldo do Ativo Circulante.'],
      correta: 1,
      comentario: 'Conta que <b>agrupa</b> outras é <b>sintética</b>. Os lançamentos vão para as analíticas (Caixa Geral, Banco Alfa), e o saldo do Disponível é a soma delas.',
    },
    {
      enunciado: 'O razonete da conta Caixa apresenta: saldo inicial de R$ 8.000; recebimento de clientes de R$ 15.000; pagamento a fornecedores de R$ 11.000; pagamento de salários de R$ 6.500; venda à vista de R$ 4.200. O saldo final da conta é:',
      alternativas: ['R$ 9.700, devedor.', 'R$ 9.700, credor.', 'R$ 17.500, credor.', 'R$ 27.200, devedor.'],
      correta: 0,
      comentario: 'Débitos: 8.000 + 15.000 + 4.200 = 27.200. Créditos: 11.000 + 6.500 = 17.500. Saldo = 27.200 − 17.500 = <b>9.700 devedor</b> (Caixa é Ativo; saldo credor seria "estouro de caixa").',
    },
    {
      enunciado: 'Em um balancete de verificação, a igualdade sempre verdadeira é:',
      alternativas: ['Ativo + Receitas = Passivo + PL + Despesas.', 'Ativo + Despesas = Passivo + PL + Receitas.', 'Ativo − Despesas = Passivo + Receitas.', 'Ativo = Passivo + PL + Despesas − Receitas.'],
      correta: 1,
      comentario: 'Contas de natureza devedora (Ativo e Despesas) de um lado; de natureza credora (Passivo, PL e Receitas) do outro. Como débitos = créditos: <b>A + D = P + PL + R</b>.',
    },
    {
      enunciado: 'A aquisição de um terreno por R$ 80.000 e de um galpão por R$ 120.000, com pagamento de R$ 50.000 à vista e o restante em notas promissórias, gera um lançamento de:',
      alternativas: ['1ª fórmula.', '2ª fórmula.', '3ª fórmula.', '4ª fórmula.'],
      correta: 3,
      comentario: 'D – Terrenos 80.000; D – Edificações 120.000; C – Caixa 50.000; C – Títulos a Pagar 150.000. Dois débitos e dois créditos = <b>4ª fórmula</b>. Conferência: 200.000 = 200.000.',
    },
  ],
  resumo: [
    'Débito = lado esquerdo; crédito = lado direito. Não há débito sem crédito (partidas dobradas).',
    'Ativo e Despesas: natureza devedora (aumentam a débito). Passivo, PL e Receitas: natureza credora.',
    'Retificadoras têm natureza contrária ao grupo: Depreciação Acumulada (credora), Ações em Tesouraria (devedora).',
    'Sintéticas agrupam; analíticas recebem lançamentos. Patrimoniais vão ao Balanço; de resultado, à DRE.',
    '1ª fórmula: 1D/1C · 2ª: 1D/vários C · 3ª: vários D/1C · 4ª: vários D/vários C.',
    'Retificação de lançamentos: estorno, transferência ou complementação (ITG 2000).',
    'Diário: cronológico, indispensável (CC, art. 1.180), autenticado. Razão: sistemático, por conta.',
    'Escrituração: idioma e moeda nacionais, forma contábil, ordem cronológica, sem rasuras nem espaços em branco.',
    'Balancete: Σ devedores = Σ credores; não detecta omissão, duplicidade, conta errada nem inversão.',
    'Equação do balancete: Ativo + Despesas = Passivo + PL + Receitas.',
  ],
};
