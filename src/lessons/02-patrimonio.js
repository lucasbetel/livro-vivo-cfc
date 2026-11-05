// Lição-modelo: estrutura completa + demo 3D (balança patrimonial).
const FATOS = [
  { txt: 'Os sócios integralizam o capital: R$ 50.000 em dinheiro.', dA: 50000, dP: 0, dPL: 0, dCap: 50000, efeito: 1,
    lanc: 'D – Caixa 50.000 · C – Capital Social 50.000',
    exp: 'Entra dinheiro (Ativo ↑) e nasce o Capital Social (PL ↑). Atenção: aporte de sócio aumenta o PL, mas <b>não é receita</b>.' },
  { txt: 'Compra de mercadorias a prazo: R$ 20.000.', dA: 20000, dP: 20000, dPL: 0, efeito: 0,
    lanc: 'D – Mercadorias 20.000 · C – Fornecedores 20.000',
    exp: 'Entra estoque (Ativo ↑) e surge a dívida com o fornecedor (Passivo ↑). O PL não muda: <b>fato permutativo</b>.' },
  { txt: 'Compra de um veículo à vista: R$ 15.000.', dA: 0, dP: 0, dPL: 0, troca: 15000, efeito: 2,
    lanc: 'D – Veículos 15.000 · C – Caixa 15.000',
    exp: 'Sai dinheiro e entra veículo: troca <b>dentro do Ativo</b>. Total do Ativo igual, PL igual: <b>permutativo</b>.' },
  { txt: 'Prestação de serviço recebida à vista: R$ 8.000.', dA: 8000, dP: 0, dPL: 8000, efeito: 1,
    lanc: 'D – Caixa 8.000 · C – Receita de Serviços 8.000',
    exp: 'Receita aumenta o resultado e, portanto, o PL. Entra caixa (Ativo ↑): <b>modificativo aumentativo</b>.' },
  { txt: 'Pagamento de parte da dívida com fornecedor: R$ 5.000.', dA: -5000, dP: -5000, dPL: 0, efeito: 3,
    lanc: 'D – Fornecedores 5.000 · C – Caixa 5.000',
    exp: 'Sai caixa (Ativo ↓) e a dívida diminui (Passivo ↓). Sem receita nem despesa: <b>permutativo</b>.' },
  { txt: 'Reconhecimento e pagamento de salários do mês, ainda não registrados: R$ 3.000.', dA: -3000, dP: 0, dPL: -3000, efeito: 4,
    lanc: 'D – Despesa de Salários 3.000 · C – Caixa 3.000',
    exp: 'Despesa reduz o resultado e o PL; sai caixa: <b>modificativo diminutivo</b>.' },
  { txt: 'Pagamento de duplicata de R$ 4.000 com juros de R$ 400.', dA: -4400, dP: -4000, dPL: -400, efeito: 5,
    lanc: 'D – Fornecedores 4.000 · D – Despesa de Juros 400 · C – Caixa 4.400',
    exp: 'Parte é troca (quita dívida) e parte é despesa (juros): <b>fato misto diminutivo</b>.' },
];
const EFEITOS = ['Ativo ↑ e Passivo ↑', 'Ativo ↑ e PL ↑', 'Troca dentro do Ativo', 'Ativo ↓ e Passivo ↓', 'Ativo ↓ e PL ↓', 'Ativo ↓, Passivo ↓ e PL ↓'];

function montarBalanca(el, kit) {
  const { h, fmt, THREE, tres, ui } = kit;
  const p = tres.palco3d(el, { altura: 380, camera: [0, 4.2, 11], alvo: [0, 2.6, 0] });
  const { cena } = p;
  const madeira = tres.mat3d(0x9c6b3f), metal = tres.mat3d(0x8f8f8f, { metalness: 0.5, roughness: 0.4 });
  // base e coluna
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 32), madeira); base.position.y = 0.15; base.castShadow = true; cena.add(base);
  const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4.2, 16), madeira); coluna.position.y = 2.25; coluna.castShadow = true; cena.add(coluna);
  const PIVO = 4.35, MEIO = 3.2, FIO = 1.9;
  const travessa = new THREE.Mesh(new THREE.BoxGeometry(MEIO * 2 + 0.3, 0.14, 0.2), madeira); travessa.position.y = PIVO; travessa.castShadow = true; cena.add(travessa);
  const prato = () => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.05, 0.12, 40), metal); m.castShadow = true; m.receiveShadow = true; g.add(m); cena.add(g); return g; };
  const pratoE = prato(), pratoD = prato();
  const fioGeo = (n) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Array(n * 6).fill(0), 3)); return g; };
  const fios = new THREE.LineSegments(fioGeo(6), new THREE.LineBasicMaterial({ color: 0x555555 })); cena.add(fios);
  // pilhas
  const K = 1 / 42000;
  const pilha = (cor) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), tres.mat3d(cor)); m.castShadow = true; m.scale.set(0.9, 0.001, 0.9); return m; };
  const pA = pilha(0x2f5ea8), pP = pilha(0xc0392b), pPL = pilha(0x2e7d4f);
  pratoE.add(pA); pratoD.add(pP); pratoD.add(pPL);
  const rotE = { sp: null }, rotD = { sp: null };
  const setRot = (alvo, grupo, txt, cor) => {
    if (alvo.sp) { grupo.remove(alvo.sp); alvo.sp.material.map.dispose(); alvo.sp.material.dispose(); }
    alvo.sp = tres.rotulo3d(txt, { cor, tamanho: 56, escala: 0.75 }); alvo.sp.position.set(0, -0.75, 1.3); grupo.add(alvo.sp);
  };
  let estado = { A: 0, P: 0, PL: 0 }, mostra = { A: 0, P: 0, PL: 0 }, ang = 0;
  const desenharRotulos = () => {
    setRot(rotE, pratoE, `ATIVO\n${fmt.brl(estado.A)}`, '#1f3a68');
    setRot(rotD, pratoD, `PASSIVO ${fmt.brl(estado.P)}\nPL ${fmt.brl(estado.PL)}`, '#7a2418');
  };
  desenharRotulos();
  p.aoQuadro(() => {
    ['A', 'P', 'PL'].forEach((k) => { mostra[k] += (estado[k] - mostra[k]) * 0.08; });
    const alvoAng = Math.max(-0.28, Math.min(0.28, (mostra.A - mostra.P - mostra.PL) * K * 0.25));
    ang += (alvoAng - ang) * 0.1;
    travessa.rotation.z = ang;
    const ex = Math.cos(ang) * MEIO, ey = Math.sin(ang) * MEIO;
    pratoE.position.set(-ex, PIVO - ey - FIO, 0); pratoD.position.set(ex, PIVO + ey - FIO, 0);
    const hA = Math.max(0.001, mostra.A * K), hP = Math.max(0.001, mostra.P * K), hPL = Math.max(0.001, Math.abs(mostra.PL) * K);
    pA.scale.y = hA; pA.position.y = 0.06 + hA / 2;
    pP.scale.y = hP; pP.position.y = 0.06 + hP / 2;
    pPL.scale.y = hPL; pPL.position.y = 0.06 + hP + hPL / 2;
    const pos = fios.geometry.attributes.position;
    const ends = [[-ex, PIVO - ey], [ex, PIVO + ey]];
    let i = 0;
    ends.forEach(([x, y], s) => { [-0.9, 0.9, 0].forEach((dx, j) => { const dz = j === 2 ? -0.9 : 0.5; pos.setXYZ(i++, x, y, 0); pos.setXYZ(i++, x + (j === 2 ? 0 : dx), y - FIO, dz); }); void s; });
    pos.needsUpdate = true;
  });

  // painel 2D de controle
  let n = 0, acertos = 0;
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' }, 'Escolha o efeito do 1º fato. A balança mostra Ativo (azul) × Passivo (vermelho) + PL (verde).');
  const fatoEl = h('p', { class: 'demo-fato' });
  const placar = h('span', { class: 'demo-placar' });
  const area = h('div', {});
  const tab = h('div', {});
  const atualizarTab = () => {
    tab.innerHTML = '';
    tab.append(ui.tabela(['Ativo', 'Passivo', 'Patrimônio Líquido', 'Equação'], [[fmt.brl(estado.A), fmt.brl(estado.P), fmt.brl(estado.PL), `${fmt.brl(estado.A)} = ${fmt.brl(estado.P + estado.PL)} ✔`]]));
  };
  const proximo = () => {
    area.innerHTML = '';
    if (n >= FATOS.length) {
      fatoEl.innerHTML = `<b>Fim!</b> Você acertou ${acertos} de ${FATOS.length}. Repare: depois de cada fato a balança <b>sempre</b> volta ao equilíbrio — é a equação A = P + PL.`;
      area.append(h('button', { class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; estado = { A: 0, P: 0, PL: 0 }; desenharRotulos(); atualizarTab(); proximo(); } }, 'Recomeçar'));
      return;
    }
    const f = FATOS[n];
    fatoEl.innerHTML = `<b>Fato ${n + 1}/${FATOS.length}:</b> ${f.txt}`;
    placar.textContent = `acertos: ${acertos}`;
    area.append(ui.botoes(EFEITOS, (i, b, g) => {
      if (g.dataset.ok) return; g.dataset.ok = 1;
      [...g.children].forEach((x, j) => { x.disabled = true; if (j === f.efeito) x.classList.add('certo'); });
      if (i === f.efeito) acertos++; else b.classList.add('errado');
      msg.innerHTML = `<p class="${i === f.efeito ? 'ok' : 'nok'}">${i === f.efeito ? '✔ Isso!' : '✘ Quase.'} ${f.exp}</p><p class="lanc">${f.lanc}</p>`;
      // fase 1: um lado mexe (a balança pende)…
      estado.A += f.dA;
      desenharRotulos();
      setTimeout(() => { // fase 2: …a contrapartida reequilibra
        estado.P += f.dP; estado.PL += f.dPL + (f.dCap || 0);
        desenharRotulos(); atualizarTab();
      }, kit.reduzMovimento() ? 0 : 900);
      n++;
      area.append(h('button', { class: 'btn-caneta primario', onclick: proximo }, n < FATOS.length ? 'Próximo fato →' : 'Ver resultado'));
    }, { classe: 'efeitos' }));
  };
  el.append(h('div', { class: 'demo-painel' }, h('div', { class: 'demo-linha' }, fatoEl, placar), area, msg, tab));
  atualizarTab(); proximo();
  return () => p.destruir();
}

export default {
  id: '02-patrimonio',
  numero: 2,
  disciplina: 'Contabilidade Geral',
  titulo: 'Patrimônio e a equação fundamental',
  subtitulo: 'A balança que nunca fica torta',
  incidencia: 'alta',
  tempo: 40,
  pergunta: 'Se uma empresa paga R$ 10.000 em dívidas, ela ficou mais pobre?',
  previsao: {
    pergunta: 'A empresa usa R$ 10.000 do caixa para quitar um empréstimo. O que acontece com o Patrimônio Líquido?',
    opcoes: ['Diminui R$ 10.000', 'Não muda', 'Aumenta R$ 10.000'],
    correta: 1,
    explicacao: 'O Ativo cai R$ 10.000 (sai caixa) e o Passivo cai R$ 10.000 (some a dívida). Como PL = Ativo − Passivo, a diferença continua a mesma. Ela não ficou mais pobre: só trocou dinheiro por "menos dívida". Isso é um <b>fato permutativo</b>.',
  },
  paginas: [
    {
      titulo: 'Para que serve a Contabilidade',
      html: `<p>A Contabilidade é a ciência social que estuda o <mark>patrimônio</mark> das entidades. Ela registra, mede e informa as mudanças nesse patrimônio.</p>
<div class="caixa"><b>Objeto:</b> o patrimônio.<br><b>Objetivo/finalidade:</b> fornecer informação útil para quem decide: investidores, credores, governo e gestores.<br><b>Campo de aplicação:</b> as entidades (aziendas), com ou sem fins lucrativos.</div>
<p>Na prova, "objeto" e "objetivo" aparecem trocados nas alternativas. Objeto = <b>o quê</b> se estuda (patrimônio). Objetivo = <b>para quê</b> (informar).</p>
<aside class="nota">Pegadinha: Contabilidade é <b>ciência social</b>, não ciência exata, mesmo usando números.</aside>`,
    },
    {
      titulo: 'Bens, direitos e obrigações',
      html: `<p>Patrimônio é o conjunto de <b>bens, direitos e obrigações</b> de uma entidade, avaliado em moeda.</p>
<table class="tabela"><thead><tr><th>Elemento</th><th>Exemplos</th><th>Onde fica</th></tr></thead><tbody>
<tr><td>Bens</td><td>caixa, mercadorias, veículos, imóveis, marcas</td><td>Ativo</td></tr>
<tr><td>Direitos</td><td>clientes (duplicatas a receber), aplicações, adiantamentos a fornecedores</td><td>Ativo</td></tr>
<tr><td>Obrigações</td><td>fornecedores, salários a pagar, impostos a recolher, empréstimos</td><td>Passivo</td></tr></tbody></table>
<div class="formula">Ativo = Bens + Direitos</div>
<div class="formula">PL = Ativo − Passivo</div>
<p>O <b>Patrimônio Líquido</b> (situação líquida) é a parte que realmente "pertence" aos sócios: capital social, reservas, ajustes de avaliação patrimonial, ações em tesouraria e lucros/prejuízos acumulados.</p>`,
    },
    {
      titulo: 'A equação fundamental',
      html: `<div class="formula">ATIVO = PASSIVO + PATRIMÔNIO LÍQUIDO</div>
<p>Leia assim: tudo o que a empresa <b>aplicou</b> (Ativo) veio de alguma <b>origem</b>, seja de terceiros (Passivo) ou dos sócios e dos lucros (PL).</p>
<table class="tabela"><thead><tr><th>Lado esquerdo</th><th>Lado direito</th></tr></thead><tbody>
<tr><td>Ativo = <b>aplicação</b> de recursos</td><td>Passivo + PL = <b>origem</b> de recursos</td></tr>
<tr><td>Capital aplicado</td><td>Passivo = capital de terceiros · PL = capital próprio</td></tr></tbody></table>
<div class="caixa">Nomes de capital que caem na prova:<br>• <b>Capital próprio</b> = PL<br>• <b>Capital de terceiros</b> = Passivo exigível<br>• <b>Capital total à disposição</b> = Passivo + PL (= Ativo total)<br>• <b>Capital social / nominal</b> = valor do capital subscrito pelos sócios (conta do PL); a parcela ainda não entregue fica em Capital a Integralizar, redutora do PL</div>`,
    },
    {
      titulo: 'Situações líquidas patrimoniais',
      html: `<p>Comparando Ativo (A) e Passivo (P):</p>
<table class="tabela"><thead><tr><th>Situação</th><th>Resultado</th><th>Nome</th></tr></thead><tbody>
<tr><td>A > P</td><td>PL positivo</td><td>Situação líquida positiva (superavitária)</td></tr>
<tr><td>A = P</td><td>PL = 0</td><td>Situação líquida nula</td></tr>
<tr><td>A < P</td><td>PL negativo</td><td><mark>Passivo a descoberto</mark> (situação deficitária)</td></tr>
<tr><td>P = 0</td><td>A = PL</td><td>Inexistência de dívidas (situação ótima)</td></tr></tbody></table>
<div class="caixa alerta"><b>Pegadinha:</b> "passivo a descoberto" não quer dizer que a empresa tem passivo. Quer dizer que o Passivo é <b>maior</b> que o Ativo, ou seja, o PL é negativo.</div>
<div class="exemplo"><b>Exemplo:</b> Ativo 80.000; Passivo 95.000 → PL = −15.000 → passivo a descoberto de R$ 15.000.</div>`,
    },
    {
      titulo: 'Fatos contábeis: permutativos, modificativos e mistos',
      html: `<p>Fato contábil é todo acontecimento que muda o patrimônio. O que importa é saber <b>se mexe no PL</b>.</p>
<table class="tabela"><thead><tr><th>Tipo</th><th>Mexe no PL?</th><th>Exemplo</th></tr></thead><tbody>
<tr><td><b>Permutativo</b> (qualitativo)</td><td>Não</td><td>compra à vista, pagamento de dívida sem juros, compra a prazo</td></tr>
<tr><td><b>Modificativo aumentativo</b></td><td>Aumenta</td><td>receita de serviço, juros recebidos</td></tr>
<tr><td><b>Modificativo diminutivo</b></td><td>Diminui</td><td>reconhecimento de despesa de salário ou aluguel</td></tr>
<tr><td><b>Misto aumentativo</b></td><td>Aumenta (com troca)</td><td>recebimento de cliente <i>com juros</i>; venda de mercadoria com lucro</td></tr>
<tr><td><b>Misto diminutivo</b></td><td>Diminui (com troca)</td><td>pagamento de fornecedor <i>com juros</i>; recebimento de cliente com desconto concedido</td></tr></tbody></table>
<aside class="nota">Receita ↑ PL · Despesa ↓ PL. Quitar salário já reconhecido é permutativo; reconhecer a despesa reduz o PL. Nos exemplos de juros e descontos, considere seu reconhecimento no próprio ato, sem apropriação anterior.</aside>`,
    },
    {
      titulo: 'Lucro, prejuízo e variações do capital',
      html: `<p><b>Resultado</b> = Receitas − Despesas. Se for positivo, é <b>lucro</b> e aumenta o PL; se for negativo, é <b>prejuízo</b> e diminui o PL.</p>
<p>O PL também muda sem passar pelo resultado:</p>
<ul class="lista-check"><li><b>Aumento de capital com recursos novos</b> (dinheiro, bens): A ↑ e PL ↑.</li>
<li><b>Aumento de capital com reservas ou lucros</b>: só troca contas <i>dentro</i> do PL. O total do PL <mark>não muda</mark>.</li>
<li><b>Distribuição de dividendos</b>: PL ↓ e Passivo ↑ (dividendos a pagar).</li></ul>
<div class="caixa"><b>Estática patrimonial</b> é a foto do patrimônio num momento (o Balanço). <b>Dinâmica patrimonial</b> é o filme: as variações provocadas por receitas e despesas (a DRE).</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: a balança patrimonial 3D',
    instrucao: 'Para cada fato, dê seu palpite sobre o efeito no patrimônio. Veja a balança pender quando o primeiro lado muda e reequilibrar com a contrapartida. Arraste a cena para girar.',
    montar: montarBalanca,
  },
  macetes: [
    '<b>A = P + PL</b> sempre. Se a conta não fechar, você classificou algo errado.',
    'Nas operações de resultado, receita/despesa indica fato modificativo ou misto. Permutativo não altera o PL total. Aportes e distribuições aos sócios também alteram o PL, mas não são receitas/despesas.',
    '<b>Passivo a descoberto</b> = PL negativo (A < P).',
    'Capital <b>próprio</b> = PL · capital de <b>terceiros</b> = Passivo · capital <b>à disposição</b> = A.',
    'Aumento de capital <b>com reservas</b> não altera o PL total.',
    'Ativo = <b>aplicações</b>; Passivo + PL = <b>origens</b>.',
  ],
  questoes: [
    {
      enunciado: 'Uma empresa apresentava: Caixa R$ 10.000; Estoques R$ 25.000; Clientes R$ 5.000; Imóveis R$ 40.000; Fornecedores R$ 15.000; Empréstimos de longo prazo R$ 20.000. O Patrimônio Líquido é de:',
      alternativas: ['R$ 80.000', 'R$ 35.000', 'R$ 45.000', 'R$ 115.000'],
      correta: 2,
      comentario: 'Ativo = 10.000 + 25.000 + 5.000 + 40.000 = 80.000. Passivo = 15.000 + 20.000 = 35.000. PL = 80.000 − 35.000 = <b>45.000</b>.',
    },
    {
      enunciado: 'O pagamento de uma duplicata a fornecedor com juros por atraso reconhecidos como despesa nesse ato representa um fato:',
      alternativas: ['permutativo.', 'modificativo aumentativo.', 'misto aumentativo.', 'misto diminutivo.'],
      correta: 3,
      comentario: 'A quitação da dívida é permutativa (A ↓ e P ↓). Os juros são despesa e reduzem o PL. Juntos formam um fato <b>misto diminutivo</b>.',
    },
    {
      enunciado: 'Quando o Ativo de uma entidade é menor que o seu Passivo exigível, diz-se que a entidade apresenta:',
      alternativas: ['passivo a descoberto.', 'situação líquida nula.', 'inexistência de capital de terceiros.', 'situação líquida superavitária.'],
      correta: 0,
      comentario: 'A < P → PL negativo → <b>passivo a descoberto</b>.',
    },
    {
      enunciado: 'A aquisição de um veículo a prazo, sem juros, provoca no patrimônio:',
      alternativas: ['aumento do Ativo e do Patrimônio Líquido.', 'aumento do Ativo e do Passivo, sem alterar o Patrimônio Líquido.', 'diminuição do Ativo e aumento do Passivo.', 'apenas permuta entre contas do Ativo.'],
      correta: 1,
      comentario: 'Entra o veículo (Ativo ↑) e nasce a dívida (Passivo ↑). O PL não muda: é um fato permutativo.',
    },
    {
      enunciado: 'Uma sociedade aumentou seu Capital Social mediante incorporação de Reservas de Lucros no valor de R$ 30.000. Em relação ao Patrimônio Líquido total, é correto afirmar que:',
      alternativas: ['aumentou R$ 30.000.', 'diminuiu R$ 30.000.', 'não se alterou.', 'aumentou R$ 60.000.'],
      correta: 2,
      comentario: 'Debita-se Reservas e credita-se Capital Social: as duas contas são do PL. É uma troca interna, e o <b>total do PL não se altera</b>.',
    },
    {
      enunciado: 'O recebimento de uma duplicata de cliente, com juros pelo atraso reconhecidos como receita nesse ato, é classificado como fato:',
      alternativas: ['misto aumentativo.', 'permutativo.', 'modificativo diminutivo.', 'misto diminutivo.'],
      correta: 0,
      comentario: 'Receber a duplicata é uma troca (Caixa ↑, Clientes ↓). Os juros recebidos são receita (PL ↑). O fato é <b>misto aumentativo</b>.',
    },
    {
      enunciado: 'Uma entidade possui Ativo total de R$ 200.000 e Patrimônio Líquido de R$ 120.000. O capital de terceiros e o capital total à disposição são, respectivamente:',
      alternativas: ['R$ 120.000 e R$ 200.000.', 'R$ 80.000 e R$ 120.000.', 'R$ 200.000 e R$ 80.000.', 'R$ 80.000 e R$ 200.000.'],
      correta: 3,
      comentario: 'Capital de terceiros = Passivo = 200.000 − 120.000 = <b>80.000</b>. Capital total à disposição = Passivo + PL = Ativo = <b>200.000</b>.',
    },
  ],
  resumo: [
    'Objeto da Contabilidade: o patrimônio. Objetivo: fornecer informação útil para decisão.',
    'Patrimônio = bens + direitos (Ativo) e obrigações (Passivo).',
    'Equação fundamental: A = P + PL. Ativo = aplicações; Passivo + PL = origens.',
    'PL negativo (A < P) = passivo a descoberto.',
    'Permutativo não altera o PL; modificativo altera; misto = troca + receita/despesa.',
    'Receita aumenta o PL; despesa diminui. Pagar ou receber, sozinho, não altera.',
    'Aumento de capital com reservas não altera o PL total; com recursos novos, aumenta.',
    'Capital próprio = PL; capital de terceiros = Passivo; capital à disposição = Ativo.',
  ],
};
