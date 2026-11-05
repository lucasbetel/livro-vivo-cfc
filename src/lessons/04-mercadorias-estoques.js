// Lição 04 — Operações com mercadorias e estoques (demo 3D: pilhas de lotes PEPS × média ponderada móvel).

// Simula a ficha de estoque nos dois métodos. Cada unidade é um "bloco" com id e custo.
function simular(p2, p3, fmt) {
  const ops = [
    { tipo: 'ent', q: 10, p: 10, nome: 'Estoque inicial' },
    { tipo: 'ent', q: 20, p: p2, nome: '1ª compra' },
    { tipo: 'sai', q: 15, nome: '1ª venda' },
    { tipo: 'ent', q: 10, p: p3, nome: '2ª compra' },
    { tipo: 'sai', q: 12, nome: '2ª venda' },
  ];
  const n2 = (v) => fmt.num(v, 2);
  const peps = { est: [], cmv: [], cmvV: 0, estV: 0, ficha: [] };
  const med = { est: [], cmv: [], cmvV: 0, estV: 0, ficha: [] };
  const copia = (m) => ({ est: m.est.map((u) => ({ ...u })), cmv: m.cmv.map((u) => ({ ...u })), cmvV: m.cmvV, estV: m.estV, ficha: m.ficha.slice() });
  const passos = [];
  ops.forEach((op, i) => {
    let media = 0, saiP = '', saiM = '';
    if (op.tipo === 'ent') {
      for (let j = 0; j < op.q; j++) {
        peps.est.push({ id: `${i}-${j}`, c: op.p });
        med.est.push({ id: `${i}-${j}`, c: op.p });
      }
      peps.estV += op.q * op.p;
      med.estV += op.q * op.p;
      media = med.estV / med.est.length;
      med.est.forEach((u) => { u.c = media; });
      const ent = `${op.q} × ${n2(op.p)} = ${n2(op.q * op.p)}`;
      peps.ficha.push([op.nome, ent, '—', `${peps.est.length} un · ${n2(peps.estV)}`]);
      med.ficha.push([op.nome, ent, '—', `${med.est.length} un · ${n2(med.estV)} <small>(média ${n2(media)})</small>`]);
    } else {
      // PEPS: saem primeiro as unidades mais antigas (base da pilha)
      const sai = peps.est.splice(0, op.q);
      const vP = sai.reduce((s, u) => s + u.c, 0);
      const grupos = [];
      sai.forEach((u) => {
        const g = grupos[grupos.length - 1];
        if (g && Math.abs(g.c - u.c) < 1e-9) g.q++; else grupos.push({ c: u.c, q: 1 });
      });
      peps.cmv.push(...sai); peps.cmvV += vP; peps.estV -= vP;
      saiP = `${grupos.map((g) => `${g.q} × ${n2(g.c)}`).join(' + ')} = ${n2(vP)}`;
      peps.ficha.push([op.nome, '—', saiP, `${peps.est.length} un · ${n2(peps.estV)}`]);
      // Média móvel: saem pelo custo médio do momento
      media = med.estV / med.est.length;
      const saiMed = med.est.splice(med.est.length - op.q, op.q);
      saiMed.forEach((u) => { u.c = media; });
      const vM = op.q * media;
      med.cmv.push(...saiMed); med.cmvV += vM; med.estV -= vM;
      saiM = `${op.q} × ${n2(media)} = ${n2(vM)}`;
      med.ficha.push([op.nome, '—', saiM, `${med.est.length} un · ${n2(med.estV)}`]);
    }
    passos.push({ op, media, saiP, saiM, peps: copia(peps), med: copia(med) });
  });
  return { passos, total: 100 + 20 * p2 + 10 * p3 };
}

function montarEstoque(el, kit) {
  const { h, fmt, THREE, tres, ui, pen, INK } = kit;
  const st = { p2: 13, p3: 16, k: 0 };
  let sim = simular(st.p2, st.p3, fmt);

  // 1) pergunta → palpite
  const painel = h('div', { class: 'demo-painel', style: { display: 'none' } });
  el.append(ui.previsao({
    pergunta: 'Preços subindo: estoque inicial a R$ 10, depois compras a R$ 13 e a R$ 16. Depois das duas vendas, qual método terá o <b>MAIOR CMV</b>?',
    opcoes: ['PEPS', 'Média ponderada móvel', 'Dá empate'],
    correta: 1,
    explicacao: 'No PEPS saem primeiro os lotes <b>antigos e baratos</b>: o CMV fica menor e o estoque final fica com os lotes caros. Na média, cada saída já carrega um pouco dos preços novos: CMV maior. Agora avance as operações e veja as pilhas.',
    aoResponder: () => { painel.style.display = ''; comentar(); },
  }));

  // 2) palco 3D: duas pilhas por método (estoque e CMV)
  const p = tres.palco3d(el, { altura: 400, camera: [0, 3.6, 11], alvo: [0, 2.3, 0] });
  const grupo = new THREE.Group();
  p.cena.add(grupo);
  const H = 0.12, LARG = 1.25, Y0 = 0.08 + H / 2;
  const X = { peps: { est: -3.3, cmv: -1.5 }, med: { est: 1.5, cmv: 3.3 } };
  const madeira = tres.mat3d(0x9c6b3f);
  [X.peps.est, X.peps.cmv, X.med.est, X.med.cmv].forEach((x) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(LARG + 0.3, 0.08, LARG + 0.3), madeira);
    b.position.set(x, 0.04, 0); b.receiveShadow = true; grupo.add(b);
  });
  const divisor = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 2.4), tres.mat3d(0xb8b0a0));
  divisor.position.set(0, 0.35, 0); grupo.add(divisor);
  const geo = new THREE.BoxGeometry(LARG, H * 0.84, LARG);
  const malhas = { peps: {}, med: {} };
  const getMalha = (m, id) => {
    let mesh = malhas[m][id];
    if (!mesh) {
      mesh = new THREE.Mesh(geo, tres.mat3d(0xffffff));
      mesh.castShadow = true; mesh.visible = false;
      mesh.userData = { alvo: new THREE.Vector3(), cor: new THREE.Color() };
      grupo.add(mesh); malhas[m][id] = mesh;
    }
    return mesh;
  };
  const BARATO = new THREE.Color(0x2f6fb5), CARO = new THREE.Color(0xd0453a);
  let pmin = 10, pmax = 16;
  const corDe = (c, alvo) => {
    const t = pmax > pmin ? (c - pmin) / (pmax - pmin) : 0.5;
    return alvo.copy(BARATO).lerp(CARO, Math.max(0, Math.min(1, t)));
  };
  const sprites = [];
  const rot = (txt, x, y, cor, escala = 0.62) => {
    const sp = tres.rotulo3d(txt, { cor, tamanho: 56, escala });
    sp.position.set(x, y, 0); grupo.add(sp); sprites.push(sp);
  };
  const valorEst = (s) => s.estV;
  const rotulos = () => {
    sprites.splice(0).forEach((sp) => { grupo.remove(sp); sp.material.map.dispose(); sp.material.dispose(); });
    const snap = sim.passos[st.k];
    rot('PEPS', (X.peps.est + X.peps.cmv) / 2, 5.2, '#1f3a68', 0.85);
    rot('MÉDIA MÓVEL', (X.med.est + X.med.cmv) / 2, 5.2, '#b8641a', 0.85);
    ['peps', 'med'].forEach((m) => {
      rot(`estoque\n${fmt.brl(valorEst(snap[m]))}`, X[m].est, 4.25, '#2b2b2b');
      rot(`CMV\n${fmt.brl(snap[m].cmvV)}`, X[m].cmv, 4.25, '#7a2418');
    });
  };
  // escala o conjunto para caber na largura visível da câmera (celular em pé x tela larga)
  const MEIA_LARGURA = 4.15, ALVO = new THREE.Vector3(0, 2.3, 0);
  p.aoQuadro(() => {
    const cam = p.camera;
    const dist = cam.position.distanceTo(ALVO);
    const visivel = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist * cam.aspect;
    const s = Math.min(1, Math.max(0.45, (0.94 * visivel) / MEIA_LARGURA));
    grupo.scale.setScalar(s);
    grupo.position.y = (1 - s) * 1.6;
    Object.values(malhas).forEach((mm) => Object.values(mm).forEach((mesh) => {
      if (!mesh.visible) return;
      const a = mesh.userData.alvo, dx = Math.abs(a.x - mesh.position.x);
      // sai pela frente da pilha (como gaveta) e depois desliza até o destino
      mesh.position.x += (a.x - mesh.position.x) * 0.1;
      mesh.position.y += (a.y + Math.min(0.6, dx * 0.4) - mesh.position.y) * 0.12;
      mesh.position.z += (a.z + Math.min(1.7, dx * 1.3) - mesh.position.z) * 0.14;
      mesh.material.color.lerp(mesh.userData.cor, 0.08);
    }));
  });

  // 3) ficha de estoque e gráfico à caneta
  const fichas = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' } });
  const graf = h('div', {});
  const desenharGrafico = (animar) => {
    graf.innerHTML = '';
    const snap = sim.passos[st.k];
    const ymax = Math.max(100, Math.ceil((sim.total * 1.3) / 100) * 100); // folga no topo para a legenda
    const g = pen.grafico(graf, { largura: 640, altura: 290, xmin: 0, xmax: 4, ymin: 0, ymax, marcasX: 1, marcasY: 4, margem: 60, fmtX: () => '', fmtY: (v) => fmt.int(v) });
    g.eixos();
    const an = animar ? {} : { animar: false };
    [[0.75, snap.peps.cmvV, INK.azul], [1.45, snap.med.cmvV, INK.laranja], [2.55, snap.peps.estV, INK.azul], [3.25, snap.med.estV, INK.laranja]].forEach(([x, v, cor]) => {
      if (v > 0.005) g.barra(x, 56, v, { cor, ...an });
      g.texto(g.sx(x), g.sy(v) - 9, fmt.num(v, 2), { ancora: 'middle', tamanho: 21, cor, fonte: 'texto', peso: 700, ...an });
    });
    g.texto(g.sx(1.1), g.sy(0) + 30, 'CMV acumulado', { ancora: 'middle', tamanho: 25, cor: INK.lapis, animar: false });
    g.texto(g.sx(2.9), g.sy(0) + 30, 'Estoque atual', { ancora: 'middle', tamanho: 25, cor: INK.lapis, animar: false });
    g.texto(g.sx(4), 30, '■ PEPS', { ancora: 'end', tamanho: 24, cor: INK.azul, animar: false });
    g.texto(g.sx(4), 58, '■ Média móvel', { ancora: 'end', tamanho: 24, cor: INK.laranja, animar: false });
  };
  const tabelas = () => {
    fichas.innerHTML = '';
    const snap = sim.passos[st.k];
    [['peps', 'Ficha de estoque — PEPS'], ['med', 'Ficha de estoque — média ponderada móvel']].forEach(([m, t]) => {
      fichas.append(h('div', { style: { minWidth: 0, overflowX: 'auto' } }, h('p', { html: `<b>${t}</b>` }), ui.tabela(['Operação', 'Entrada', 'Saída (custo)', 'Saldo'], snap[m].ficha)));
    });
  };

  const aplicar = (animarGrafico = true) => {
    const snap = sim.passos[st.k];
    pmin = Math.min(10, st.p2, st.p3); pmax = Math.max(10, st.p2, st.p3);
    const instantaneo = kit.reduzMovimento();
    ['peps', 'med'].forEach((m) => {
      const vistos = new Set();
      const posicionar = (lista, x) => lista.forEach((u, i) => {
        const mesh = getMalha(m, u.id);
        vistos.add(u.id);
        mesh.userData.alvo.set(x, Y0 + i * H, 0);
        corDe(u.c, mesh.userData.cor);
        if (!mesh.visible) { // lote novo cai do alto
          mesh.visible = true;
          mesh.position.set(x, Y0 + i * H + 2.4, 0);
          mesh.material.color.copy(mesh.userData.cor);
        }
        if (instantaneo) { mesh.position.copy(mesh.userData.alvo); mesh.material.color.copy(mesh.userData.cor); }
      });
      posicionar(snap[m].est, X[m].est);
      posicionar(snap[m].cmv, X[m].cmv);
      Object.entries(malhas[m]).forEach(([id, mesh]) => { if (!vistos.has(id)) mesh.visible = false; });
    });
    rotulos(); tabelas(); desenharGrafico(animarGrafico);
  };

  // 4) controles + comentário de cada passo
  const opEl = h('p', { class: 'demo-fato' });
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const b = (v) => fmt.brl(v);
  const comentar = () => {
    const snap = sim.passos[st.k], op = snap.op;
    opEl.innerHTML = `<b>Passo ${st.k + 1}/${sim.passos.length}:</b> ${op.nome}${op.tipo === 'ent' ? ` — ${op.q} un a ${b(op.p)}` : ` — ${op.q} un`}`;
    const textos = [
      'As duas pilhas começam iguais: 10 unidades a R$ 10,00. A cor indica o custo unitário: <b>azul = barato</b>, <b>vermelho = caro</b>.',
      `O lote novo cai em cima do antigo. No <b>PEPS</b> cada lote mantém o seu custo (duas cores). Na <b>média</b>, tudo vira uma cor só: custo médio = (100 + ${fmt.num(20 * st.p2, 2)}) ÷ 30 = <b>${b(snap.media)}</b>.`,
      `Venda de 15 un. <b>PEPS</b>: saem primeiro as unidades mais antigas, de baixo da pilha → ${snap.saiP}. <b>Média</b>: saem 15 un ao custo médio → ${snap.saiM}.`,
      `Nova compra. A média é recalculada: (saldo ${fmt.num(sim.passos[2].med.estV, 2)} + compra ${fmt.num(10 * st.p3, 2)}) ÷ 25 = <b>${b(snap.media)}</b>. No PEPS, o lote novo só espera a vez dele.`,
      `Venda de 12 un. <b>PEPS</b>: ${snap.saiP}. <b>Média</b>: ${snap.saiM}.<br><b>CMV total:</b> PEPS ${b(snap.peps.cmvV)} × Média ${b(snap.med.cmvV)}. <b>Estoque final:</b> PEPS ${b(snap.peps.estV)} × Média ${b(snap.med.estV)}. Nos dois, CMV + EF = ${b(sim.total)} (tudo o que estava disponível).<br>${snap.peps.cmvV < snap.med.cmvV - 0.005 ? 'Preços subindo → PEPS dá o <b>menor CMV</b> e o <b>maior lucro</b>.' : snap.peps.cmvV > snap.med.cmvV + 0.005 ? 'Preços caindo → agora o PEPS dá o <b>maior CMV</b> e o menor lucro: tudo se inverte!' : 'Com esses preços os dois métodos empatam.'} Arraste os preços das compras (por exemplo, para menos de R$ 10) e veja o efeito.`,
    ];
    msg.innerHTML = `<p>${textos[st.k]}</p>`;
    btnProx.disabled = st.k >= sim.passos.length - 1;
  };
  const btnProx = h('button', { type: 'button', class: 'btn-caneta primario', onclick: () => { if (st.k < sim.passos.length - 1) { st.k++; aplicar(); comentar(); } } }, 'Próxima operação ▶');
  const btnRec = h('button', { type: 'button', class: 'btn-caneta', onclick: () => { st.k = 0; aplicar(); comentar(); } }, '↺ Recomeçar');
  const recalcular = () => { sim = simular(st.p2, st.p3, fmt); aplicar(false); comentar(); };
  const ctl2 = ui.controle({ rotulo: 'Preço da 1ª compra', min: 6, max: 20, passo: 0.5, valor: st.p2, formato: (v) => fmt.brl(v), aoMudar: (v) => { st.p2 = v; recalcular(); } });
  const ctl3 = ui.controle({ rotulo: 'Preço da 2ª compra', min: 6, max: 20, passo: 0.5, valor: st.p3, formato: (v) => fmt.brl(v), aoMudar: (v) => { st.p3 = v; recalcular(); } });
  painel.append(opEl, h('div', { class: 'demo-linha', style: { flexWrap: 'wrap' } }, btnProx, btnRec), msg, h('div', { class: 'demo-linha', style: { flexWrap: 'wrap' } }, ctl2, ctl3));
  el.append(painel, graf, fichas);
  aplicar();
  comentar();
  return () => p.destruir();
}

export default {
  id: '04-mercadorias-estoques',
  numero: 4,
  disciplina: 'Contabilidade Geral',
  titulo: 'Operações com mercadorias e estoques',
  subtitulo: 'CMV, tributos recuperáveis e a fila do estoque',
  incidencia: 'alta',
  tempo: 65,
  pergunta: 'Você comprou o mesmo produto por R$ 10, R$ 13 e R$ 16 e vendeu uma unidade. Quanto custou a unidade vendida? (Spoiler: depende do método — e a norma proíbe uma das respostas.)',
  previsao: {
    pergunta: 'Em época de preços subindo, qual método de avaliação de estoques dá o <b>MAIOR lucro bruto</b>?',
    opcoes: ['PEPS (primeiro que entra, primeiro que sai)', 'Média ponderada móvel', 'Os dois dão o mesmo lucro'],
    correta: 0,
    explicacao: 'Com preços em alta, o PEPS manda para o CMV os lotes <b>mais antigos e baratos</b>. CMV menor → lucro bruto maior, e o estoque final fica avaliado pelos preços mais recentes. A média fica no meio do caminho. O UEPS daria o menor lucro — e é <b>proibido</b> pela NBC TG 16.',
  },
  paginas: [
    {
      titulo: 'RCM, CMV e lucro bruto',
      html: `<p>A empresa comercial compra mercadorias para revender. O ganho "da revenda" chama-se <b>Resultado com Mercadorias (RCM)</b>, ou <b>lucro bruto</b>:</p>
<div class="formula">RCM = Receita Líquida de Vendas − CMV</div>
<div class="formula">CMV = EI + C − EF</div>
<p>EI = estoque inicial · C = compras líquidas · EF = estoque final (inventário). Pense numa caixa d'água: o que tinha (EI) + o que entrou (C) − o que sobrou (EF) = o que saiu vendido (CMV).</p>
<table class="tabela"><thead><tr><th>DRE (parte de cima)</th><th>R$</th></tr></thead><tbody>
<tr><td>Receita Bruta de Vendas</td><td>92.000</td></tr>
<tr><td>(−) Devoluções e abatimentos sobre vendas</td><td>(4.000)</td></tr>
<tr><td>(−) Descontos incondicionais concedidos</td><td>(1.000)</td></tr>
<tr><td>(−) Tributos sobre vendas (ICMS, PIS, COFINS)</td><td>(17.000)</td></tr>
<tr><td><b>= Receita Líquida</b></td><td><b>70.000</b></td></tr>
<tr><td>(−) CMV = 10.000 + 50.000 − 15.000</td><td>(45.000)</td></tr>
<tr><td><b>= Lucro Bruto (RCM)</b></td><td><b>25.000</b></td></tr></tbody></table>
<div class="exemplo"><b>Exemplo resolvido:</b> EI R$ 10.000; compras líquidas R$ 50.000; EF R$ 15.000 → CMV = 10.000 + 50.000 − 15.000 = <b>45.000</b>. Com receita líquida de 70.000, o RCM é <b>25.000</b>.</div>
<aside class="nota">Na indústria o raciocínio é o mesmo, com o nome CPV (custo dos produtos vendidos); em serviços, CSP.</aside>`,
    },
    {
      titulo: 'Compras: o que entra no custo do estoque',
      html: `<p>Pela NBC TG 16 (Estoques), o custo de aquisição inclui o <b>preço de compra</b>, os <b>impostos de importação e demais tributos não recuperáveis</b> e os gastos com <b>transporte, seguro e manuseio</b> diretamente atribuíveis à compra. Ele é reduzido por <b>descontos comerciais (incondicionais)</b>, <b>abatimentos</b> e pelos <b>tributos recuperáveis</b>.</p>
<div class="formula">Compras líquidas = compras brutas + fretes e seguros na compra − devoluções − abatimentos − descontos incondicionais − tributos recuperáveis</div>
<table class="tabela"><thead><tr><th>Gasto</th><th>Tratamento</th></tr></thead><tbody>
<tr><td>Frete e seguro <b>sobre compras</b>, pagos pelo comprador</td><td>Custo do estoque</td></tr>
<tr><td>Frete <b>sobre vendas</b> (entrega ao cliente)</td><td>Despesa de vendas</td></tr>
<tr><td>Armazenagem depois da compra (salvo se necessária ao processo)</td><td>Despesa</td></tr>
<tr><td>IPI pago por empresa <b>comercial</b> (não contribuinte do IPI)</td><td>Custo (não recuperável)</td></tr>
<tr><td>ICMS, PIS e COFINS com direito a crédito</td><td>Ativo "a recuperar" — fora do custo</td></tr></tbody></table>
<div class="caixa alerta"><b>Pegadinha:</b> frete na <b>compra</b> é custo; frete na <b>venda</b> é despesa. A FGV coloca os dois no mesmo enunciado para ver se você soma tudo.</div>`,
    },
    {
      titulo: 'Tributos recuperáveis: imposto não é custo',
      html: `<p>No regime <b>não cumulativo</b>, o tributo pago na compra vira crédito para abater do tributo devido na venda. Por isso ele <b>sai do custo</b> e vai para uma conta de Ativo "a recuperar".</p>
<table class="tabela"><thead><tr><th>Tributo</th><th>Alíquota</th><th>Crédito na compra?</th></tr></thead><tbody>
<tr><td>ICMS</td><td>definida por cada estado (nas questões, costuma ser 17% ou 18%)</td><td>Quando a operação e o adquirente dão direito ao crédito</td></tr>
<tr><td>PIS não cumulativo (lucro real)</td><td>1,65%</td><td>Nas aquisições com direito a crédito, observadas as regras legais</td></tr>
<tr><td>COFINS não cumulativa (lucro real)</td><td>7,6%</td><td>Nas aquisições com direito a crédito, observadas as regras legais</td></tr>
<tr><td>PIS e COFINS cumulativos (lucro presumido)</td><td>0,65% e 3%</td><td><b>Não</b> → entram no custo</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo didático:</b> compra de mercadorias por R$ 10.000 (valor da nota), com ICMS 18%, PIS 1,65% e COFINS 7,6%, todos recuperáveis e, por hipótese expressa deste exercício, calculados sobre o valor integral da nota; frete de R$ 500 sem crédito.<br>
ICMS = 1.800 · PIS = 165 · COFINS = 760 → tributos recuperáveis = 2.725<br>
Custo do estoque = 10.000 − 2.725 + 500 = <b>7.775</b><br><br>
D – Mercadorias 7.275<br>D – ICMS a Recuperar 1.800<br>D – PIS a Recuperar 165<br>D – COFINS a Recuperar 760<br>C – Fornecedores 10.000<br>e o frete: D – Mercadorias 500 / C – Caixa 500</div>
<p>Na venda, o tributo é <b>dedução da receita bruta</b>: D – ICMS sobre Vendas / C – ICMS a Recolher. No fim do mês, compensa-se: ICMS a recolher − ICMS a recuperar = valor a pagar.</p>
<aside class="nota">Calcule os créditos sobre a base que o enunciado mandar. Na vida real, desde a Lei 14.592/2023 o ICMS é excluído da base dos créditos de PIS/COFINS. A reforma tributária (EC 132/2023) substituirá PIS/COFINS pela CBS e ICMS/ISS pelo IBS, com transição a partir de 2026 — a lógica "a recuperar × a recolher" continua a mesma.</aside>`,
    },
    {
      titulo: 'Devoluções, abatimentos e descontos',
      html: `<table class="tabela"><thead><tr><th>Fato</th><th>Na compra (comprador)</th><th>Na venda (vendedor)</th></tr></thead><tbody>
<tr><td><b>Devolução</b></td><td>reduz as compras e estorna os créditos de tributos</td><td>dedução da receita bruta; estorna os tributos sobre a venda</td></tr>
<tr><td><b>Abatimento</b> (redução de preço por avaria, sem devolver)</td><td>reduz o custo das compras</td><td>dedução da receita bruta</td></tr>
<tr><td><b>Desconto incondicional</b> (comercial, destacado na nota)</td><td>reduz o custo das compras</td><td>dedução da receita bruta</td></tr>
<tr><td><b>Desconto condicional</b> (financeiro, por pagar antes do vencimento)</td><td><mark>receita financeira</mark></td><td><mark>despesa financeira</mark></td></tr></tbody></table>
<div class="exemplo"><b>Exemplo (devolução de venda):</b> venda a prazo de R$ 20.000, com ICMS de 18% (3.600); o cliente devolve 1/4 da mercadoria.<br>
D – Devolução de Vendas (dedução da receita) / C – Clientes 5.000<br>
D – ICMS a Recolher / C – ICMS sobre Vendas 900 (estorno do imposto)<br>
No inventário permanente, a mercadoria volta ao estoque pelo custo: D – Mercadorias / C – CMV.</div>
<div class="caixa alerta"><b>Pegadinha:</b> o desconto <b>condicional</b> não mexe no lucro bruto — ele fica no resultado financeiro. Só o <b>incondicional</b> reduz o custo (na compra) ou a receita (na venda).</div>`,
    },
    {
      titulo: 'Inventário periódico × permanente',
      html: `<table class="tabela"><thead><tr><th></th><th>Periódico</th><th>Permanente</th></tr></thead><tbody>
<tr><td>Controle</td><td>só a contagem física no fim do período</td><td>ficha de estoque atualizada a cada entrada e saída</td></tr>
<tr><td>CMV</td><td>apurado no fim: <b>EI + C − EF</b></td><td>registrado a cada venda: D – CMV / C – Mercadorias</td></tr>
<tr><td>Saldo do estoque durante o mês</td><td>desconhecido até a contagem</td><td>conhecido a qualquer momento</td></tr>
<tr><td>Quebras e furtos</td><td>ficam "escondidos" dentro do CMV</td><td>aparecem na diferença entre a ficha e a contagem</td></tr></tbody></table>
<div class="exemplo"><b>Exemplo (inventário permanente):</b> venda à vista de mercadorias por R$ 6.000, que custaram R$ 3.500.<br>
D – Caixa / C – Receita de Vendas 6.000<br>D – CMV / C – Mercadorias 3.500<br>São <b>dois</b> lançamentos: um da receita e outro do custo. Lucro bruto da operação: 2.500.</div>
<aside class="nota">Mesmo no inventário permanente, a empresa faz contagem física no fim do exercício para conferir a ficha.</aside>`,
    },
    {
      titulo: 'PEPS, média ponderada móvel e o UEPS proibido',
      html: `<p>Pela NBC TG 16, o custo dos estoques intercambiáveis é atribuído pelo <b>PEPS</b> (primeiro que entra, primeiro que sai) ou pelo <b>custo médio ponderado</b>, calculado por período ou a cada entrada (média <b>móvel</b>). Itens não intercambiáveis (obras de arte, imóveis, projetos sob encomenda) usam a <b>identificação específica</b>. O <mark>UEPS não é permitido</mark> (nem pela norma, nem pela legislação do IR).</p>
<p>Dados: EI 10 un a R$ 10; compra de 20 un a R$ 13; venda de 15 un; compra de 10 un a R$ 16; venda de 12 un.</p>
<table class="tabela"><thead><tr><th></th><th>PEPS</th><th>Média ponderada móvel</th></tr></thead><tbody>
<tr><td>1ª venda (15 un)</td><td>10 × 10 + 5 × 13 = 165</td><td>média (100 + 260) ÷ 30 = 12,00 → 15 × 12 = 180</td></tr>
<tr><td>2ª venda (12 un)</td><td>12 × 13 = 156</td><td>média (180 + 160) ÷ 25 = 13,60 → 12 × 13,60 = 163,20</td></tr>
<tr><td><b>CMV</b></td><td><b>321,00</b></td><td><b>343,20</b></td></tr>
<tr><td><b>Estoque final</b></td><td>3 × 13 + 10 × 16 = <b>199,00</b></td><td>13 × 13,60 = <b>176,80</b></td></tr></tbody></table>
<p>Conferência: disponível = 100 + 260 + 160 = 520 = CMV + EF nos dois métodos.</p>
<div class="caixa">Preços <b>subindo</b>: PEPS → menor CMV, maior lucro, maior estoque final. Média → valores intermediários. Preços <b>caindo</b>: tudo se inverte.</div>`,
    },
    {
      titulo: 'Valor realizável líquido: custo ou VRL, dos dois o menor',
      html: `<p>O estoque não pode ficar no balanço por mais do que se espera conseguir com ele (NBC TG 16):</p>
<div class="formula">Estoque = menor entre CUSTO e VRL</div>
<div class="formula">VRL = preço de venda estimado − custos para concluir − despesas para vender</div>
<div class="exemplo"><b>Exemplo:</b> custo R$ 50.000; preço de venda estimado R$ 52.000; comissões e fretes de venda estimados R$ 6.000.<br>VRL = 52.000 − 6.000 = 46.000, menor que o custo de 50.000 → ajuste de <b>4.000</b>.<br>D – Perda estimada para redução ao VRL (resultado) 4.000<br>C – Estimativa de perdas em estoques (redutora do estoque) 4.000<br>No balanço: Estoques 50.000 (−) 4.000 = 46.000.</div>
<p>Se o VRL voltar a subir, a perda é <b>revertida</b>, limitada ao valor da perda original: o estoque nunca passa do custo.</p>
<div class="caixa alerta"><b>Não confunda:</b> estoque → <b>menor</b> entre custo e VRL. Imobilizado e intangível (impairment, NBC TG 01) → o valor recuperável é o <b>maior</b> entre o valor justo líquido de despesas de venda e o valor em uso.</div>`,
    },
    {
      titulo: 'Adiantamentos de clientes e despesas antecipadas',
      html: `<p><b>Adiantamento de clientes:</b> o cliente paga antes de receber a mercadoria. Ainda não há receita, porque a obrigação de entregar não foi cumprida (NBC TG 47). Há uma <b>obrigação</b>:</p>
<div class="exemplo">Recebimento antecipado de R$ 30.000: D – Caixa / C – Adiantamento de Clientes (Passivo) 30.000.<br>Na entrega: D – Adiantamento de Clientes / C – Receita de Vendas 30.000 (e D – CMV / C – Mercadorias, pelo custo).</div>
<p>O espelho é o <b>adiantamento a fornecedores</b>: quem paga antes tem um <b>direito</b> (Ativo).</p>
<p><b>Despesas antecipadas</b> (despesas de períodos seguintes pagas adiantado): seguros, assinaturas, aluguéis. Ficam no Ativo e viram despesa <b>mês a mês</b>, pela competência.</p>
<div class="exemplo"><b>Exemplo:</b> em 1º/10/X1, pagamento à vista de seguro anual de R$ 12.000.<br>1º/10: D – Seguros a Apropriar (Ativo) / C – Caixa 12.000.<br>31/12/X1 (3 meses decorridos): D – Despesa de Seguros / C – Seguros a Apropriar 3.000.<br>Saldo no Ativo: 9.000, todo no Circulante (será apropriado em até 12 meses).</div>
<aside class="nota">Regime de competência: a receita entra quando é ganha e a despesa quando é incorrida — não importa quando o dinheiro entra ou sai.</aside>`,
    },
  ],
  demo: {
    titulo: 'Experimento: PEPS × média nas pilhas de estoque 3D',
    instrucao: 'Dê seu palpite, depois avance operação por operação. Cada bloco é uma unidade; a cor mostra o custo (azul barato, vermelho caro). No PEPS os blocos de baixo saem primeiro; na média tudo se mistura numa cor só. Arraste a cena para girar e mude os preços das compras.',
    montar: montarEstoque,
  },
  macetes: [
    '<b>CMV = EI + C − EF</b>: o que tinha + o que entrou − o que sobrou.',
    'Frete na <b>compra</b> = custo do estoque; frete na <b>venda</b> = despesa de vendas.',
    'Tributo <b>recuperável</b> não é custo: vai para "a recuperar" (Ativo). PIS/COFINS cumulativos e IPI pago pelo comércio entram no custo.',
    'Desconto <b>incondicional</b> (na nota) mexe no custo ou na receita; <b>condicional</b> (pagamento antecipado) é resultado financeiro.',
    'Preços subindo: <b>PEPS</b> → menor CMV, maior lucro, maior estoque final. A média fica no meio.',
    '<b>UEPS é proibido</b> (NBC TG 16 e legislação do IR).',
    'Estoque: <b>menor</b> entre custo e VRL. Impairment de imobilizado: compara com o <b>maior</b> entre VJL e valor em uso.',
    'Dinheiro recebido antes da entrega = <b>passivo</b> (adiantamento de clientes), não receita.',
  ],
  questoes: [
    {
      enunciado: 'Dados de uma empresa comercial: estoque inicial R$ 30.000; compras brutas R$ 120.000; fretes sobre compras R$ 5.000; devoluções de compras R$ 10.000; estoque final R$ 40.000. O Custo das Mercadorias Vendidas é:',
      alternativas: ['R$ 100.000.', 'R$ 105.000.', 'R$ 115.000.', 'R$ 95.000.'],
      correta: 1,
      comentario: 'Compras líquidas = 120.000 + 5.000 (frete na compra é custo) − 10.000 (devoluções) = 115.000. CMV = EI + C − EF = 30.000 + 115.000 − 40.000 = <b>105.000</b>.',
    },
    {
      enunciado: 'Uma empresa comercial tributada pelo lucro real (regime não cumulativo) comprou mercadorias por R$ 50.000, com ICMS de 18%, PIS de 1,65% e COFINS de 7,6%, todos recuperáveis e calculados sobre o valor da nota. Pagou ainda frete de R$ 2.000 na compra, sem direito a crédito. O custo de aquisição registrado no estoque é:',
      alternativas: ['R$ 52.000.', 'R$ 41.000.', 'R$ 38.375.', 'R$ 36.375.'],
      correta: 2,
      comentario: 'Tributos recuperáveis: ICMS 9.000 + PIS 825 + COFINS 3.800 = 13.625. Custo = 50.000 − 13.625 + 2.000 = <b>38.375</b>. 41.000 esquece PIS/COFINS e o frete; 36.375 esquece o frete.',
    },
    {
      enunciado: 'Dados: receita bruta de vendas R$ 200.000; devoluções de vendas R$ 10.000; ICMS sobre vendas R$ 34.200; PIS e COFINS sobre vendas R$ 17.575; CMV R$ 90.000; fretes na entrega aos clientes R$ 6.000; descontos condicionais concedidos R$ 3.000. O lucro bruto é:',
      alternativas: ['R$ 39.225.', 'R$ 42.225.', 'R$ 45.225.', 'R$ 48.225.'],
      correta: 3,
      comentario: 'Receita líquida = 200.000 − 10.000 − 34.200 − 17.575 = 138.225. Lucro bruto = 138.225 − 90.000 = <b>48.225</b>. Frete na venda é despesa de vendas e desconto condicional é despesa financeira: os dois ficam <b>abaixo</b> do lucro bruto.',
    },
    {
      enunciado: 'A ficha de estoque mostra: estoque inicial de 100 unidades a R$ 20; compra de 200 unidades a R$ 23; venda de 220 unidades. Pelo PEPS, o CMV e o estoque final são, respectivamente:',
      alternativas: ['R$ 4.760 e R$ 1.840.', 'R$ 4.840 e R$ 1.760.', 'R$ 5.000 e R$ 1.600.', 'R$ 4.400 e R$ 2.200.'],
      correta: 0,
      comentario: 'PEPS: saem primeiro as 100 un a 20 (2.000) e depois 120 un a 23 (2.760) → CMV = <b>4.760</b>. Sobram 80 un a 23 = <b>1.840</b>. (4.840/1.760 é a média: 6.600 ÷ 300 = 22; 5.000/1.600 seria o UEPS, proibido.)',
    },
    {
      enunciado: 'Ficha de estoque: saldo inicial de 50 unidades a R$ 8,00; compra de 150 unidades a R$ 10,00; venda de 120 unidades; compra de 70 unidades a R$ 11,00. Pela média ponderada móvel, o estoque final é:',
      alternativas: ['R$ 1.570,00.', 'R$ 1.140,00.', 'R$ 1.530,00.', 'R$ 1.500,00.'],
      correta: 2,
      comentario: 'Após a 1ª compra: 200 un e R$ 1.900 → média 9,50. Venda: 120 × 9,50 = 1.140; saldo 80 un e R$ 760. 2ª compra: 760 + 770 = 1.530 para 150 un (média 10,20). Estoque final = <b>1.530,00</b>. (1.570 seria o PEPS: 80 × 10 + 770.)',
    },
    {
      enunciado: 'Sobre os critérios de atribuição de custo aos estoques na NBC TG 16, é correto afirmar que:',
      alternativas: ['o UEPS é permitido quando os preços estão em alta, por refletir melhor o custo corrente.', 'admitem-se o PEPS e o custo médio ponderado para itens intercambiáveis; o UEPS não é permitido.', 'a entidade deve usar obrigatoriamente o PEPS para todos os estoques.', 'o custo médio só pode ser calculado uma vez por exercício, no inventário final.'],
      correta: 1,
      comentario: 'A norma admite <b>PEPS</b> e <b>custo médio ponderado</b> (por período ou a cada entrada, a média móvel), além da identificação específica para itens não intercambiáveis. O <b>UEPS é proibido</b>.',
    },
    {
      enunciado: 'Uma empresa tem em estoque mercadorias com custo de R$ 80.000. O preço de venda estimado é de R$ 90.000 e as despesas estimadas para vender somam R$ 15.000. Segundo a NBC TG 16, o estoque deve ser apresentado por:',
      alternativas: ['R$ 80.000.', 'R$ 90.000.', 'R$ 65.000.', 'R$ 75.000.'],
      correta: 3,
      comentario: 'VRL = 90.000 − 15.000 = 75.000. Estoque = <b>menor</b> entre custo (80.000) e VRL (75.000) = <b>75.000</b>, com perda estimada de 5.000 no resultado.',
    },
    {
      enunciado: 'Na compra de mercadorias, a empresa obteve desconto comercial de R$ 1.000 destacado na nota fiscal e, ao pagar a duplicata antes do vencimento, desconto de R$ 400. Esses descontos são contabilizados, respectivamente, como:',
      alternativas: ['redução do custo de aquisição e receita financeira.', 'receita financeira e redução do custo de aquisição.', 'ambos como redução do custo de aquisição.', 'ambos como receita financeira.'],
      correta: 0,
      comentario: 'Desconto <b>incondicional</b> (comercial, na nota) reduz o custo da compra. Desconto <b>condicional</b> (obtido por pagar antes) é <b>receita financeira</b>.',
    },
    {
      enunciado: 'Em 20/12/X1, uma empresa recebeu R$ 30.000 de um cliente como adiantamento por mercadorias que serão entregues em fevereiro de X2. Em 31/12/X1, o registro correto é:',
      alternativas: ['receita de vendas de R$ 30.000 no resultado de X1.', 'passivo (adiantamento de clientes) de R$ 30.000.', 'ativo (adiantamento a fornecedores) de R$ 30.000.', 'redução da conta Clientes em R$ 30.000.'],
      correta: 1,
      comentario: 'A obrigação de entregar ainda não foi cumprida: não há receita (NBC TG 47). O dinheiro recebido gera uma obrigação: D – Caixa / C – <b>Adiantamento de Clientes</b> (Passivo). A receita será reconhecida na entrega, em X2.',
    },
    {
      enunciado: 'Em 1º/09/X1, uma empresa pagou à vista o seguro anual de suas instalações, de R$ 24.000, com vigência de 1º/09/X1 a 31/08/X2. Em 31/12/X1, o saldo de Seguros a Apropriar e a despesa de seguros de X1 são, respectivamente:',
      alternativas: ['R$ 8.000 e R$ 16.000.', 'R$ 24.000 e zero.', 'R$ 16.000 e R$ 8.000.', 'zero e R$ 24.000.'],
      correta: 2,
      comentario: 'Custo mensal = 24.000 ÷ 12 = 2.000. De setembro a dezembro passaram 4 meses → despesa de X1 = <b>8.000</b>. Saldo no Ativo (despesa antecipada) = 24.000 − 8.000 = <b>16.000</b>.',
    },
  ],
  resumo: [
    'RCM (lucro bruto) = receita líquida − CMV; CMV = EI + compras líquidas − EF.',
    'Custo de aquisição: preço + tributos não recuperáveis + frete/seguro na compra − descontos incondicionais − abatimentos.',
    'Tributos recuperáveis (ICMS; PIS 1,65% e COFINS 7,6% no não cumulativo) vão para "a recuperar", fora do custo.',
    'Frete na venda e desconto condicional concedido são despesas (de venda e financeira), abaixo do lucro bruto.',
    'Devoluções, abatimentos e descontos incondicionais de vendas são deduções da receita bruta.',
    'Inventário periódico: CMV no fim (EI + C − EF). Permanente: D – CMV / C – Mercadorias a cada venda.',
    'NBC TG 16: PEPS ou custo médio ponderado; UEPS proibido. Preços subindo: PEPS = menor CMV e maior lucro.',
    'Estoque: menor entre custo e VRL (preço estimado − custos para concluir − despesas de venda); a perda pode ser revertida.',
    'Adiantamento de clientes é passivo até a entrega; despesas antecipadas são ativo apropriado mês a mês.',
  ],
};
