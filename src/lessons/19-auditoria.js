// Lição 19 — Auditoria contábil. Demo: matriz 3D da opinião do auditor (NBC TA 705).
const OPINIOES = ['Sem modificação (limpa)', 'Com ressalva', 'Adversa', 'Abstenção de opinião'];

// cel: 0 = distorção/não generalizada · 1 = distorção/generalizada
//      2 = sem evidência/não generalizada · 3 = sem evidência/generalizada · 4 = fora da matriz (não modificada)
const CASOS = [
  {
    txt: 'A empresa deixou de reconhecer provisão para um processo trabalhista com saída de recursos provável, de R$ 900 mil. A materialidade é de R$ 300 mil. O efeito se limita à provisão e à despesa, não representa parcela substancial das demonstrações e não afeta divulgações fundamentais. A administração se recusa a ajustar.',
    resp: 1, cel: 0,
    exp: 'Natureza: <b>distorção</b> (a norma manda reconhecer a provisão). Extensão: relevante (R$ 900 mil > R$ 300 mil), mas <b>restrita</b> à provisão e à despesa → não generalizada. Opinião <b>com ressalva</b>: “exceto pelos efeitos do assunto descrito…”.',
  },
  {
    txt: 'O auditor encontrou uma despesa de R$ 6 mil lançada em duplicidade. A materialidade é de R$ 250 mil e não há outras distorções nem fatores qualitativos que tornem o erro relevante. A administração preferiu não corrigir.',
    resp: 0, cel: 4,
    exp: 'R$ 6 mil está muito abaixo da materialidade e não há outras distorções que, somadas, a ultrapassem. Distorção <b>não relevante</b> não modifica a opinião → <b>opinião não modificada</b>. O auditor acumula a distorção, salvo se claramente trivial, comunica à administração e solicita a correção (NBC TA 450). Materialidade também depende da natureza e das circunstâncias, não só do valor.',
  },
  {
    txt: 'O grupo deixou de consolidar uma controlada que responde pela maior parte das receitas e dos ativos, contrariando a norma contábil. O efeito atinge praticamente todas as linhas das demonstrações consolidadas.',
    resp: 2, cel: 1,
    exp: 'Natureza: <b>distorção</b> (não consolidar contraria a norma). Extensão: atinge quase todas as linhas → <b>generalizada</b>. Resultado: <b>opinião adversa</b> — as demonstrações não estão adequadamente apresentadas.',
  },
  {
    txt: 'O auditor foi contratado depois do encerramento do exercício e não acompanhou a contagem física dos estoques. Os procedimentos alternativos falharam. Os estoques são relevantes, mas os possíveis efeitos não representam parcela substancial das demonstrações nem afetam divulgações fundamentais: são não generalizados.',
    resp: 1, cel: 2,
    exp: 'Natureza: <b>impossibilidade de obter evidência</b> (limitação no alcance). Extensão: relevante, mas restrita a estoques e CMV → não generalizada. Opinião <b>com ressalva</b>: “exceto pelos <i>possíveis</i> efeitos…”.',
  },
  {
    txt: 'A empresa é ré em um processo excepcional, de desfecho incerto, que está adequadamente divulgado em nota explicativa. O auditor considera o assunto fundamental para o entendimento do leitor; ele não exige modificação da opinião e não foi determinado como PAA.',
    resp: 0, cel: 4,
    exp: 'Não há distorção nem limitação: o assunto está <b>adequadamente divulgado</b>. Opinião <b>não modificada</b>, com parágrafo de <b>ênfase</b> (NBC TA 706). Ênfase não é ressalva.',
  },
  {
    txt: 'O investimento em uma coligada no exterior representa mais de 90% do ativo total da investidora. O auditor não conseguiu acesso às informações contábeis, à administração nem aos auditores da coligada.',
    resp: 3, cel: 3,
    exp: 'Natureza: <b>impossibilidade de obter evidência</b>. Extensão: o investimento é quase todo o ativo total → possíveis efeitos <b>generalizados</b>. Resultado: <b>abstenção de opinião</b> — o auditor declara que não expressa opinião.',
  },
  {
    txt: 'Há incerteza relevante sobre a continuidade operacional (dívidas vencendo sem refinanciamento garantido), mas o uso do pressuposto de continuidade é apropriado e a administração divulgou tudo adequadamente.',
    resp: 0, cel: 4,
    exp: 'Pressuposto apropriado + incerteza bem divulgada → opinião <b>não modificada</b> e seção própria “Incerteza relevante relacionada com a continuidade operacional” (NBC TA 570). Não é ressalva e não é parágrafo de ênfase.',
  },
  {
    txt: 'A empresa entrou em liquidação e vai encerrar as atividades, mas elaborou as demonstrações no pressuposto de continuidade operacional.',
    resp: 2, cel: 1,
    exp: 'Usar o pressuposto de continuidade quando ele é <b>inapropriado</b> contamina toda a base de mensuração → distorção <b>generalizada</b>: <b>opinião adversa</b> (NBC TA 570).',
  },
  {
    txt: 'A administração se recusa a fornecer as representações formais sobre sua responsabilidade pela elaboração das demonstrações e por ter dado ao auditor acesso a todas as informações.',
    resp: 3, cel: 3,
    exp: 'Sem essas representações formais, a NBC TA 580 manda o auditor <b>abster-se de emitir opinião</b>: a falta abala a base de toda a auditoria (efeito generalizado).',
  },
];

function montarMatriz(el, kit) {
  const { h, THREE, tres, ui } = kit;
  const reduz = kit.reduzMovimento();
  const p = tres.palco3d(el, { altura: 360, camera: [-0.45, 5.0, 5.8], alvo: [-0.45, 0.3, -0.3] });
  const { cena } = p;
  const PAPEL = 0xe6dcc4;
  const CEL = [
    { nome: 'RESSALVA', x: -1.1, z: -0.85, cor: 0xd9822b },
    { nome: 'ADVERSA', x: 1.1, z: -0.85, cor: 0xc0392b },
    { nome: 'RESSALVA', x: -1.1, z: 1.05, cor: 0xd9822b },
    { nome: 'ABSTENÇÃO', x: 1.1, z: 1.05, cor: 0x6a3d9a },
    { nome: 'SEM MODIFICAÇÃO', x: 0, z: -2.95, cor: 0x2e7d4f, larg: 4.1, prof: 0.75 },
  ];
  const blocos = CEL.map((c) => {
    const mat = tres.mat3d(c.cor);
    const m = new THREE.Mesh(new THREE.BoxGeometry(c.larg || 1.9, 1, c.prof || 1.6), mat);
    m.castShadow = true; m.receiveShadow = true;
    m.position.set(c.x, 0.25, c.z);
    cena.add(m);
    const sp = tres.rotulo3d(c.nome, { cor: '#222222', tamanho: 54, escala: 0.5 });
    sp.position.set(c.x, 1, c.z);
    cena.add(sp);
    const base = c.larg ? 0.15 : 0.5;
    return { ...c, m, mat, sp, base, alt: base, alvo: base, aceso: false };
  });
  const cab = (txt, x, z, cor) => {
    const s = tres.rotulo3d(txt, { cor, tamanho: 52, escala: 0.5 });
    s.position.set(x, 0.35, z);
    cena.add(s);
  };
  cab('relevante, NÃO\ngeneralizado', -1.1, 2.5, '#1f3a68');
  cab('relevante E\ngeneralizado', 1.1, 2.5, '#1f3a68');
  cab('distorção', -2.85, -0.85, '#c0392b');
  cab('sem\nevidência', -2.85, 1.05, '#6a3d9a');

  p.aoQuadro((dt, t) => {
    blocos.forEach((b) => {
      b.alt += (b.alvo - b.alt) * (reduz ? 1 : Math.min(1, dt * 6));
      const a = Math.max(0.02, b.alt);
      b.m.scale.y = a;
      b.m.position.y = a / 2;
      b.sp.position.y = a + (b.larg ? 0.85 : 0.4);
      b.mat.emissiveIntensity = b.aceso ? (reduz ? 0.45 : 0.35 + 0.2 * Math.sin(t * 4)) : 0;
    });
  });

  // cel: índice 0-4 acende a célula; null volta ao estado neutro (matriz toda colorida)
  const acender = (cel) => {
    blocos.forEach((b, i) => {
      const on = i === cel;
      b.aceso = on;
      b.sp.visible = !b.larg || cel == null || on; // rótulo da plataforma some quando outra célula acende
      b.mat.emissive.setHex(on ? b.cor : 0x000000);
      if (cel == null) { b.mat.color.setHex(b.cor); b.alvo = b.base; }
      else { b.mat.color.setHex(on ? b.cor : PAPEL); b.alvo = on ? (b.larg ? 0.9 : 1.7) : (b.larg ? 0.08 : 0.25); }
    });
  };

  const tabEl = h('div', {});
  const desenharTabela = (cel) => {
    const td = (i, txt) => h('td', { style: cel === i ? { background: 'rgba(255, 221, 0, 0.55)', fontWeight: '700' } : null }, txt);
    tabEl.innerHTML = '';
    tabEl.append(
      h('table', { class: 'tabela' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Natureza do problema'), h('th', {}, 'Relevante, NÃO generalizado'), h('th', {}, 'Relevante E generalizado'))),
        h('tbody', {},
          h('tr', {}, h('th', {}, 'Distorção relevante'), td(0, 'Com ressalva'), td(1, 'Adversa')),
          h('tr', {}, h('th', {}, 'Sem evidência apropriada e suficiente'), td(2, 'Com ressalva'), td(3, 'Abstenção de opinião')))),
      h('p', {
        class: cel === 4 ? 'ok' : null,
        html: '<b>Fora da matriz:</b> ausência de distorção relevante e evidência suficiente (com divulgação adequada dos assuntos relevantes) → opinião <b>não modificada</b>, com ênfase ou seção de continuidade quando couber.',
      }));
  };

  let n = 0, acertos = 0;
  const casoEl = h('p', { class: 'demo-fato' });
  const placar = h('span', { class: 'demo-placar' });
  const area = h('div', {});
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const proximo = () => {
    area.innerHTML = '';
    acender(null); desenharTabela(null);
    if (n >= CASOS.length) {
      casoEl.innerHTML = `<b>Fim!</b> Você acertou ${acertos} de ${CASOS.length}. Primeiro pergunte <b>qual é o problema</b> (distorção ou falta de evidência); depois, <b>qual o tamanho</b> (relevante só ali ou generalizado).`;
      msg.textContent = 'A matriz voltou ao normal: laranja = ressalva, vermelho = adversa, roxo = abstenção, verde = sem modificação.';
      area.append(h('button', { class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; proximo(); } }, 'Recomeçar'));
      return;
    }
    const c = CASOS[n];
    casoEl.innerHTML = `<b>Caso ${n + 1}/${CASOS.length}:</b> ${c.txt}`;
    placar.textContent = `acertos: ${acertos}`;
    msg.textContent = 'Seu palpite: que opinião o auditor deve emitir? Depois veja a célula da matriz se acender.';
    area.append(ui.botoes(OPINIOES, (i, b, g) => {
      if (g.dataset.ok) return;
      g.dataset.ok = '1';
      [...g.children].forEach((x, j) => { x.disabled = true; if (j === c.resp) x.classList.add('certo'); });
      if (i === c.resp) acertos++; else b.classList.add('errado');
      placar.textContent = `acertos: ${acertos}`;
      acender(c.cel); desenharTabela(c.cel);
      msg.innerHTML = `<p class="${i === c.resp ? 'ok' : 'nok'}">${i === c.resp ? '✔ Isso!' : '✘ Não foi essa.'} ${c.exp}</p>`;
      n++;
      area.append(h('button', { class: 'btn-caneta primario', onclick: proximo }, n < CASOS.length ? 'Próximo caso →' : 'Ver resultado'));
    }, { classe: 'efeitos' }));
  };
  el.append(h('div', { class: 'demo-painel' }, h('div', { class: 'demo-linha' }, casoEl, placar), area, msg, tabEl));
  proximo();
  return () => p.destruir();
}

export default {
  id: '19-auditoria',
  numero: 19,
  disciplina: 'Auditoria Contábil',
  titulo: 'Auditoria contábil',
  subtitulo: 'Do risco à opinião: a matriz que decide o relatório',
  incidencia: 'media',
  tempo: 60,
  pergunta: 'Se o auditor assinou um relatório “limpo”, isso garante que a empresa não tem nenhuma fraude?',
  previsao: {
    pergunta: 'O auditor achou uma distorção relevante na conta de estoques, com efeitos não generalizados, e a administração se recusou a corrigir. O resto das demonstrações está correto. Que opinião ele emite?',
    opcoes: ['Opinião adversa', 'Opinião com ressalva', 'Abstenção de opinião'],
    correta: 1,
    explicacao: 'O problema é uma <b>distorção</b> (não falta de evidência) e foi avaliada como relevante, mas <b>não generalizada</b>. Estar restrita a uma conta, sozinho, não basta: ela ainda poderia representar parcela substancial das demonstrações. Isso dá <b>opinião com ressalva</b> (“exceto pelos efeitos…”). Adversa seria se a distorção fosse generalizada; abstenção é para quando o auditor <i>não consegue</i> obter evidência.',
  },
  paginas: [
    {
      titulo: 'Auditoria, auditoria interna e controle interno',
      html: `<p>Auditoria contábil é o exame sistemático, feito com técnicas próprias, das demonstrações, registros e controles de uma entidade. Pela NBC TA 200, o objetivo da auditoria é <mark>aumentar o grau de confiança</mark> dos usuários nas demonstrações contábeis. O auditor faz isso emitindo uma <b>opinião</b>.</p>
<table class="tabela"><thead><tr><th></th><th>Auditoria interna</th><th>Auditoria externa (independente)</th></tr></thead><tbody>
<tr><td>Quem faz</td><td>empregado da entidade (ou serviço terceirizado)</td><td>auditor independente contratado, sem vínculo</td></tr>
<tr><td>Foco</td><td>processos, controles internos e riscos</td><td>opinião sobre as demonstrações contábeis</td></tr>
<tr><td>Para quem</td><td>administração</td><td>acionistas, investidores, credores, mercado</td></tr>
<tr><td>Independência</td><td>relativa: independe das áreas que audita, mas responde à administração</td><td>total em relação à entidade</td></tr>
<tr><td>Frequência</td><td>contínua</td><td>periódica (em regra, anual)</td></tr></tbody></table>
<div class="caixa"><b>NBC TI 01 — Auditoria interna:</b> exames, análises, avaliações, levantamentos e comprovações, metodologicamente estruturados, para avaliar a integridade, adequação, eficácia, eficiência e economicidade dos processos, dos sistemas de informação e de controles internos e do gerenciamento de riscos, com vistas a <b>assistir à administração</b> no cumprimento de seus objetivos. Indícios de fraude devem ser informados à administração <b>por escrito e de forma reservada</b>.</div>
<p><b>Controle interno</b> é o processo planejado, implementado e mantido pela governança, pela administração e por outros empregados para dar <b>segurança razoável</b> quanto à confiabilidade dos relatórios financeiros, à efetividade e eficiência das operações e ao cumprimento de leis e regulamentos. Componentes: ambiente de controle, avaliação de riscos da entidade, monitoramento, sistema de informação e comunicação e atividades de controle.</p>
<ul class="lista-check"><li><b>Segregação de funções</b>: quem autoriza não registra nem guarda o ativo.</li><li>Limites de alçada, conciliações, rodízio de funções, controle físico.</li><li>Limitações: <b>conluio</b>, burla dos controles pela administração, erro humano e custo-benefício.</li></ul>
<div class="caixa alerta"><b>Pegadinha:</b> o auditor externo pode <i>usar</i> o trabalho da auditoria interna (NBC TA 610), mas a responsabilidade pela opinião continua sendo <b>só dele</b>. Deficiências significativas de controle são comunicadas <b>por escrito</b> aos responsáveis pela governança (NBC TA 265).</div>`,
    },
    {
      titulo: 'Asseguração: razoável × limitada, atestação × direto',
      html: `<p>A <b>Estrutura Conceitual para Trabalhos de Asseguração</b> define o trabalho em que o auditor obtém evidência para expressar uma conclusão que aumenta a confiança dos usuários sobre um objeto. Elementos:</p>
<ol><li>relação de <b>três partes</b>: auditor, parte responsável e usuários previstos;</li><li>objeto apropriado;</li><li>critérios adequados (relevantes, completos, confiáveis, neutros e compreensíveis);</li><li>evidência apropriada e suficiente;</li><li>relatório de asseguração escrito.</li></ol>
<table class="tabela"><thead><tr><th></th><th>Asseguração razoável</th><th>Asseguração limitada</th></tr></thead><tbody>
<tr><td>Risco do trabalho</td><td>reduzido a nível aceitavelmente <b>baixo</b></td><td>maior que no razoável, mas aceitável</td></tr>
<tr><td>Forma da conclusão</td><td><b>positiva</b>: “as demonstrações apresentam adequadamente…”</td><td><b>negativa</b>: “nada chegou ao nosso conhecimento que nos leve a acreditar que…”</td></tr>
<tr><td>Exemplo</td><td>auditoria de demonstrações (NBC TAs)</td><td>revisão de informações intermediárias (NBC TR)</td></tr></tbody></table>
<div class="caixa"><b>Atestação:</b> outra parte (em geral a administração) mede ou avalia o objeto, e o auditor conclui sobre essa informação.<br><b>Trabalho direto:</b> o próprio auditor mede ou avalia o objeto e apresenta o resultado no relatório.</div>
<p><b>Não são asseguração:</b> procedimentos previamente acordados e compilação de informações. Neles não há conclusão que aumente a confiança, e o relatório não pode dar a entender que houve asseguração.</p>
<aside class="nota"><b>NBC TAS 5000</b> (convergida à norma internacional do IAASB para sustentabilidade): requisitos para asseguração de informações de sustentabilidade, como relatórios pela NBC TDS 01/02, relato integrado e correlatos. Abrange asseguração <b>limitada ou razoável</b> em trabalhos de <b>atestação</b> (não trabalhos diretos), com ceticismo, julgamento, materialidade, risco e evidência. O item 15 prevê aplicação a períodos iniciados em, ou após, <b>1º/1/2027</b>, ou informações em data específica a partir daí, permitida aplicação antecipada. Informações exigidas nas demonstrações contábeis continuam sob as NBCs TA (item 12).</aside>`,
    },
    {
      titulo: 'Objetivos do auditor, ceticismo, julgamento e fraude',
      html: `<p>Pela <b>NBC TA 200</b>, o auditor deve obter <mark>segurança razoável</mark> de que as demonstrações, <b>como um todo</b>, estão livres de distorção relevante, causada por <b>fraude ou erro</b>. Assim ele pode opinar se elas foram elaboradas, em todos os aspectos relevantes, de acordo com a estrutura de relatório financeiro aplicável. Depois, ele apresenta o relatório e se comunica como exigem as normas.</p>
<p>Segurança razoável é <b>alta, mas não absoluta</b>. Há limitações inerentes: estimativas, testes por amostragem, fraudes com conluio, prazo e custo. Elaborar as demonstrações é <b>responsabilidade da administração</b>.</p>
<table class="tabela"><thead><tr><th>Ceticismo profissional</th><th>Julgamento profissional</th></tr></thead><tbody>
<tr><td>postura: mente <b>questionadora</b>, alerta a sinais de distorção e avaliação <b>crítica</b> da evidência</td><td>aplicação de treinamento, conhecimento e experiência para tomar <b>decisões informadas</b> (materialidade, risco, procedimentos)</td></tr></tbody></table>
<p>Requisitos éticos: Código de Ética e NBC PG 100, além da <b>independência</b> (NBC PA 400).</p>
<p><b>Fraude × erro (NBC TA 240).</b> A diferença está na <mark>intenção</mark>: a fraude é ato <b>intencional</b> para obter vantagem injusta ou ilegal, e o erro não é intencional. Para o auditor importam duas fraudes: <b>informações contábeis fraudulentas</b> e <b>apropriação indébita de ativos</b>.</p>
<ul class="lista-check"><li>A responsabilidade <b>primária</b> por prevenir e detectar fraude é da <b>administração e da governança</b>.</li><li>Triângulo da fraude: <b>incentivo/pressão</b>, <b>oportunidade</b> e <b>racionalização</b>.</li><li>Presume-se risco de fraude no <b>reconhecimento de receita</b> (presunção refutável). O risco de a administração burlar controles existe em <b>todas</b> as entidades.</li><li>Fraude é mais difícil de detectar que erro, e fraude da administração é mais difícil que a de empregados.</li></ul>
<div class="caixa alerta"><b>Pegadinha:</b> “a auditoria garante a inexistência de fraudes” está <b>errado</b>. O auditor busca segurança razoável sobre distorções <b>relevantes</b>. Se não puder continuar o trabalho por causa de fraude, ele avalia renunciar e as comunicações devidas.</div>`,
    },
    {
      titulo: 'Risco de auditoria, materialidade e planejamento',
      html: `<div class="formula">Risco de auditoria = RI × RC × RD</div>
<p>Risco de auditoria é o risco de o auditor emitir opinião <b>inadequada</b> quando as demonstrações têm distorção relevante. O <b>risco de distorção relevante</b> (RI × RC) é da entidade: <b>risco inerente</b> (suscetibilidade da afirmação a distorção, antes dos controles) e <b>risco de controle</b> (o controle interno não prevenir nem detectar a distorção). O <b>risco de detecção</b> (RD) é o único que o auditor controla, pela natureza, época e extensão dos procedimentos.</p>
<div class="exemplo"><b>Exemplo:</b> RI = 80% e RC = 50% → risco de distorção relevante = 40%. Para um risco de auditoria de 4%: RD = 4% ÷ 40% = <b>10%</b>. Quanto <b>maior</b> o risco de distorção, <b>menor</b> o RD aceitável e <b>mais</b> testes substantivos.</div>
<p><b>Materialidade (NBC TA 320).</b> Fixa-se a materialidade para as demonstrações <b>como um todo</b> e a <b>materialidade para execução</b>, um valor <mark>menor</mark>, para reduzir a nível baixo a chance de que distorções não corrigidas e não detectadas, somadas, passem da materialidade. A norma dá exemplos de referência, como 5% do lucro antes dos impostos das operações continuadas, ou 1% da receita ou da despesa total em entidade sem fins lucrativos. São exemplos, não regra. A materialidade é <b>revisada</b> quando surge informação nova.</p>
<p><b>Planejamento (NBC TA 300)</b> é processo <b>contínuo e iterativo</b>, e não uma fase isolada. Gera a <b>estratégia global</b> (alcance, época e direção) e o <b>plano de auditoria</b> (natureza, época e extensão dos procedimentos). Atividades preliminares: aceitação do cliente, independência e acordo dos termos do trabalho (carta de contratação, NBC TA 210). Na auditoria inicial, há contato com o auditor antecessor e exame dos saldos iniciais (NBC TA 510).</p>
<p><b>Entendimento da entidade (NBC TA 315):</b> por indagações, procedimentos analíticos, observação e inspeção, o auditor entende a entidade, o ambiente, a estrutura de relatório e o controle interno. Ele avalia os riscos no nível das demonstrações e no nível das afirmações. A resposta (NBC TA 330) vem por <b>testes de controle</b> e <b>procedimentos substantivos</b>, que são obrigatórios para toda classe relevante de transações, saldo e divulgação.</p>`,
    },
    {
      titulo: 'Evidência: analíticos, amostragem e confirmações',
      html: `<p>A evidência precisa ser <b>suficiente</b> (quantidade) e <b>apropriada</b> (qualidade: relevância e confiabilidade). Procedimentos: <b>inspeção, observação, confirmação externa, recálculo, reexecução, procedimentos analíticos e indagação</b>. Indagação, sozinha, não basta.</p>
<p>As comparações de confiabilidade abaixo são <b>generalizações sujeitas a exceções</b>, conforme a fonte, os controles e as circunstâncias (NBC TA 500).</p>
<ul class="lista-check"><li>Externa e independente tende a ser mais confiável que interna.</li><li>Obtida diretamente pelo auditor vale mais que obtida por inferência.</li><li>Documento vale mais que declaração oral, e original vale mais que cópia.</li></ul>
<p><b>Procedimentos analíticos (NBC TA 520):</b> avaliação das informações por meio de relações <b>plausíveis</b> entre dados financeiros e não financeiros. São <mark>obrigatórios na avaliação de riscos e perto do fim</mark> da auditoria (conclusão geral), e <b>opcionais</b> como procedimento substantivo.</p>
<div class="exemplo"><b>Exemplo:</b> 20 salas × R$ 3.000 × 12 meses = expectativa de R$ 720.000 de aluguel. Registrado: R$ 650.000. A diferença passa do limite aceitável e é investigada.</div>
<p><b>Amostragem (NBC TA 530):</b> aplicar procedimentos a <b>menos de 100%</b> dos itens, de modo que todas as unidades tenham chance de seleção. Na estatística há seleção aleatória e uso da teoria das probabilidades.</p>
<table class="tabela"><thead><tr><th>Risco de amostragem</th><th>Efeito</th></tr></thead><tbody>
<tr><td>Concluir que o controle é melhor do que é, ou que não há distorção relevante quando há</td><td>afeta a <b>eficácia</b>: pode levar a opinião inadequada</td></tr>
<tr><td>Concluir que o controle é pior do que é, ou que há distorção quando não há</td><td>afeta a <b>eficiência</b>: gera trabalho extra</td></tr></tbody></table>
<p>O <b>risco não resultante da amostragem</b> vem de outras causas, como procedimento inadequado ou evidência mal interpretada. Seleção: aleatória, sistemática, por unidade monetária ou ao acaso. A seleção em bloco <b>geralmente não é apropriada</b> para amostragem de auditoria, pois itens contíguos podem não representar a população (NBC TA 530, Apêndice 4).</p>
<p><b>Confirmação externa (NBC TA 505):</b> na <b>positiva</b>, quem confirma responde sempre. Na <b>negativa</b>, só responde se <b>discordar</b>; ela é menos persuasiva e só pode ser o único procedimento substantivo se, cumulativamente, houver risco baixo, evidência da eficácia dos controles relevantes, muitos saldos pequenos e homogêneos, taxa muito baixa de exceções esperadas e nenhuma razão para crer que os destinatários ignorarão a solicitação (item 15). Se a administração não deixar enviar o pedido, o auditor avalia os motivos, faz procedimentos alternativos e, se a recusa não for razoável, comunica à governança e avalia o efeito na opinião.</p>`,
    },
    {
      titulo: 'Fechamento: eventos subsequentes, continuidade e representações',
      html: `<p><b>Eventos subsequentes (NBC TA 560).</b> Entre a data das demonstrações e a data do relatório, o auditor deve <b>buscar ativamente</b> evidência de que todos os eventos que exigem ajuste ou divulgação foram tratados. Depois da data do relatório, ele <b>não tem obrigação</b> de procurar, mas, se souber de um fato, deve agir: discutir com a administração e avaliar se é preciso alterar as demonstrações.</p>
<p><b>Continuidade operacional (NBC TA 570).</b> Na redação aplicável aos períodos anteriores a 2027, o auditor solicita extensão da avaliação se ela cobrir menos de 12 meses a partir da data das demonstrações. A NBC TA 570 (R1), publicada em setembro/2026 e aplicável a períodos iniciados em ou após <b>1º/1/2027</b>, passa a exigir essa extensão até pelo menos 12 meses da <b>aprovação</b> das demonstrações (itens 8 e 21). Observe a versão e o período pedidos na prova.</p>
<table class="tabela"><thead><tr><th>Situação</th><th>Relatório</th></tr></thead><tbody>
<tr><td>Pressuposto apropriado + incerteza relevante <b>bem divulgada</b></td><td>opinião <b>não modificada</b> + seção “Incerteza relevante relacionada com a continuidade operacional”</td></tr>
<tr><td>Incerteza relevante <b>não divulgada</b> adequadamente</td><td>ressalva ou adversa</td></tr>
<tr><td>Pressuposto de continuidade <b>inapropriado</b>, mas usado</td><td><b>adversa</b></td></tr></tbody></table>
<p><b>Representações formais (NBC TA 580):</b> declaração escrita da administração, com data <b>tão próxima quanto possível, mas não posterior</b> à data do relatório. Ela não substitui outras evidências. Se a administração não fornecer as representações sobre suas responsabilidades, ou se elas não forem confiáveis, o auditor se <b>abstém</b> de opinar.</p>
<p><b>Documentação (NBC TA 230):</b> os papéis de trabalho permitem que um auditor experiente, sem envolvimento anterior, entenda o que foi feito. O arquivo final é montado em prazo curto, normalmente até <b>60 dias</b> após a data do relatório. Depois disso, nada é apagado antes do fim do prazo de guarda, que em geral é de pelo menos 5 anos.</p>
<aside class="nota">A data do relatório não pode ser anterior à data em que o auditor obteve evidência suficiente e apropriada.</aside>`,
    },
    {
      titulo: 'O relatório e a matriz da opinião modificada',
      html: `<p><b>NBC TA 700 — opinião não modificada</b> (“limpa”): as demonstrações foram elaboradas, em todos os aspectos relevantes, de acordo com a estrutura aplicável. Estrutura do relatório: título (“Relatório do auditor independente”), destinatário, seção <b>Opinião</b> (vem primeiro), <b>Base para opinião</b> (com declaração de independência), continuidade (se houver), principais assuntos de auditoria (se aplicável), outras informações, responsabilidades da administração e da governança, responsabilidades do auditor, local, data e assinatura.</p>
<p><b>NBC TA 705 — opinião modificada.</b> Para escolher, faça duas perguntas:</p>
<table class="tabela"><thead><tr><th>Natureza do problema</th><th>Relevante, mas NÃO generalizado</th><th>Relevante E generalizado</th></tr></thead><tbody>
<tr><td>Demonstrações com <b>distorção relevante</b></td><td><mark>Com ressalva</mark></td><td><b>Adversa</b></td></tr>
<tr><td><b>Impossibilidade</b> de obter evidência apropriada e suficiente</td><td><mark>Com ressalva</mark></td><td><b>Abstenção de opinião</b></td></tr></tbody></table>
<p><b>Generalizado</b> é o efeito que não fica restrito a elementos, contas ou itens específicos. Também é generalizado o efeito que, mesmo restrito, representa parte substancial das demonstrações, ou que atinge divulgações fundamentais para o entendimento.</p>
<div class="caixa">Redação: ressalva por distorção diz “exceto pelos <b>efeitos</b>…”. Ressalva por limitação diz “exceto pelos <b>possíveis efeitos</b>…”. Adversa diz que as demonstrações <b>não</b> apresentam adequadamente. Na abstenção, o auditor diz que <b>não expressa</b> opinião. A seção “Base para…” acompanha cada tipo.</div>
<div class="caixa alerta"><b>Pegadinhas:</b> (1) na matriz, abstenção decorre da <b>falta de evidência</b>; distorção identificada generalizada leva à adversa. Excepcionalmente, o item 10 prevê abstenção por interação de diversas incertezas, mesmo com evidência suficiente sobre cada uma. (2) Se a administração impuser limitação e os possíveis efeitos forem generalizados, o auditor renuncia ao trabalho, quando possível, ou se abstém. (3) Em opinião adversa ou abstenção sobre o conjunto, não se dá opinião limpa sobre uma demonstração isolada.</div>`,
    },
    {
      titulo: 'Ênfase, outros assuntos e principais assuntos de auditoria',
      html: `<table class="tabela"><thead><tr><th></th><th>Ênfase (NBC TA 706)</th><th>Outros assuntos (NBC TA 706)</th><th>PAA (NBC TA 701)</th></tr></thead><tbody>
<tr><td>Assunto</td><td><b>apresentado ou divulgado</b> nas demonstrações</td><td><b>não</b> apresentado nem divulgado nas demonstrações</td><td>assuntos de <b>maior importância</b> na auditoria do período</td></tr>
<tr><td>Por quê</td><td>é fundamental para o usuário entender as demonstrações</td><td>ajuda a entender a auditoria, as responsabilidades do auditor ou o relatório</td><td>exigiram atenção significativa do auditor</td></tr>
<tr><td>Modifica a opinião?</td><td><b>Não</b></td><td><b>Não</b></td><td><b>Não</b></td></tr>
<tr><td>Exemplos</td><td>litígio excepcional de desfecho incerto; grande catástrofe; adoção antecipada de norma com efeito generalizado</td><td>período anterior auditado por outro auditor; restrição de uso do relatório</td><td>áreas de risco significativo, estimativas com alta incerteza, transações significativas</td></tr></tbody></table>
<p><b>Ênfase</b> só cabe se o assunto não exigir opinião modificada e não for PAA. Ela fica em seção própria com “Ênfase” no título e diz que a opinião não está modificada nesse ponto.</p>
<p><b>PAA</b> são escolhidos entre os assuntos <b>comunicados aos responsáveis pela governança</b>. São obrigatórios na auditoria de <b>entidades listadas</b> e quando a lei ou o regulamento exigir, ou o auditor decidir incluí-los. Cada PAA explica <b>por que</b> o assunto foi considerado e <b>como</b> foi tratado na auditoria.</p>
<div class="caixa alerta"><b>Pegadinhas:</b> PAA <b>não substitui</b> opinião modificada. O assunto que gera ressalva ou adversa vai para a “Base para opinião…”, e não para a seção de PAA. Na <b>abstenção</b>, o relatório não traz a seção de PAA, salvo exigência legal. A incerteza relevante de continuidade é <b>PAA por natureza</b> (TA 701, item 15), mas é relatada em seção própria, não descrita na seção PAA nem em ênfase. Quando houver seção PAA, ela remete à seção específica.</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: a matriz 3D da opinião do auditor',
    instrucao: 'Leia cada caso e dê seu palpite sobre a opinião. A célula correspondente da matriz (natureza × extensão) sobe e acende; “sem modificação” fica na plataforma verde ao fundo. Arraste a cena para girar.',
    montar: montarMatriz,
  },
  macetes: [
    '<b>Duas perguntas da TA 705:</b> qual é o problema (distorção ou falta de evidência)? E qual o tamanho (só ali ou generalizado)?',
    'Coluna “não generalizado” é sempre <b>ressalva</b>. Na coluna “generalizado”, distorção dá <b>adversa</b> e falta de evidência dá <b>abstenção</b>.',
    '<b>Adversa</b> = “afirmo que está errado”. <b>Abstenção</b> = “não consigo afirmar nada”.',
    'Ênfase = assunto <b>divulgado</b> nas DCs. Outros assuntos = <b>não</b> divulgado. Nenhum dos dois modifica a opinião.',
    'Risco de auditoria = RI × RC × RD. O auditor só controla o <b>RD</b>, que anda ao contrário do risco de distorção relevante.',
    'Razoável dá conclusão <b>positiva</b> (auditoria). Limitada dá conclusão <b>negativa</b>: “nada chegou ao nosso conhecimento”.',
    'Confirmação <b>positiva</b>: responde sempre. <b>Negativa</b>: só responde se discordar.',
    'Fraude × erro = <b>intenção</b>. Prevenir fraude cabe à <b>administração e à governança</b>, não ao auditor.',
  ],
  questoes: [
    {
      enunciado: 'Na auditoria das demonstrações consolidadas da Cia. Alfa, o auditor concluiu que uma controlada relevante deixou de ser consolidada, em desacordo com a norma contábil, e que o efeito dessa distorção é relevante e generalizado. De acordo com a NBC TA 705, o auditor deve emitir',
      alternativas: ['opinião com ressalva.', 'abstenção de opinião.', 'opinião adversa.', 'opinião não modificada com parágrafo de ênfase.'],
      correta: 2,
      comentario: 'É <b>distorção</b> identificada (não falta de evidência) e o efeito é <b>generalizado</b>, logo a opinião é <b>adversa</b>. Neste caso, não cabe abstenção: há evidência de distorção generalizada. A TA 705 também prevê a hipótese excepcional de interação de diversas incertezas (item 10). A ressalva seria para efeito não generalizado. Ênfase não serve para distorção.',
    },
    {
      enunciado: 'O auditor foi contratado após a data do inventário e não conseguiu obter evidência apropriada e suficiente sobre os estoques, pois os procedimentos alternativos não foram eficazes. Concluiu que os possíveis efeitos são relevantes, mas não generalizados. A opinião adequada é',
      alternativas: ['com ressalva, por limitação de alcance (“exceto pelos possíveis efeitos”).', 'adversa, porque os estoques não são confiáveis.', 'abstenção de opinião, porque houve limitação de alcance.', 'não modificada, com parágrafo de outros assuntos.'],
      correta: 0,
      comentario: 'Falta de evidência + efeito relevante <b>não generalizado</b> = <b>ressalva</b>, com a redação “exceto pelos <i>possíveis</i> efeitos”. A abstenção exigiria efeitos possíveis <b>generalizados</b>. A adversa supõe distorção já identificada.',
    },
    {
      enunciado: 'Em relação ao risco de auditoria, assinale a afirmativa correta.',
      alternativas: [
        'O risco inerente e o risco de controle são definidos pelo auditor, que pode reduzi-los a zero com mais testes.',
        'Quanto maior o risco de distorção relevante avaliado, maior deve ser o risco de detecção aceito pelo auditor.',
        'O risco de auditoria é eliminado quando o auditor examina 100% das transações.',
        'O risco de detecção é o componente que o auditor controla, por meio da natureza, da época e da extensão dos procedimentos.',
      ],
      correta: 3,
      comentario: 'RI e RC existem na entidade, <b>independentemente</b> da auditoria. O auditor ajusta o <b>risco de detecção</b>, que tem relação <b>inversa</b> com o risco de distorção relevante. Por causa das limitações inerentes, o risco de auditoria nunca é zero.',
    },
    {
      enunciado: 'Segundo a NBC TA 706, o parágrafo de ênfase',
      alternativas: [
        'substitui a opinião com ressalva quando a distorção não é generalizada.',
        'refere-se a assunto apropriadamente apresentado ou divulgado nas demonstrações contábeis que, no julgamento do auditor, é fundamental para o entendimento dos usuários, e não modifica a opinião.',
        'trata de assunto não apresentado nem divulgado nas demonstrações, relevante para o entendimento da auditoria.',
        'é obrigatório sempre que o relatório contiver principais assuntos de auditoria.',
      ],
      correta: 1,
      comentario: 'Ênfase = assunto <b>divulgado</b> e fundamental, sem modificar a opinião. A alternativa C descreve o parágrafo de <b>outros assuntos</b>. Ênfase não substitui ressalva e não é exigida por haver PAA. Aliás, um assunto que já é PAA não vira ênfase.',
    },
    {
      enunciado: 'Na confirmação externa do tipo negativa (NBC TA 505), a parte que confirma',
      alternativas: [
        'responde em qualquer caso, informando o saldo que consta em seus registros.',
        'responde apenas se concordar com a informação apresentada.',
        'responde diretamente ao auditor somente se discordar das informações fornecidas na solicitação.',
        'é escolhida pela administração da entidade auditada e responde a ela.',
      ],
      correta: 2,
      comentario: 'Na <b>negativa</b>, só se responde em caso de <b>discordância</b>, por isso ela é menos persuasiva. A resposta em qualquer caso é a confirmação <b>positiva</b>. A confirmação é sempre controlada pelo auditor, e a resposta vai direto para ele.',
    },
    {
      enunciado: 'De acordo com as normas de auditoria, a aplicação de procedimentos analíticos é obrigatória',
      alternativas: [
        'na avaliação de riscos e próximo ao fim da auditoria, para auxiliar a formar a conclusão geral.',
        'somente como procedimento substantivo, em substituição aos testes de detalhes.',
        'apenas em auditorias de entidades listadas em bolsa.',
        'em nenhuma etapa, pois são sempre opcionais.',
      ],
      correta: 0,
      comentario: 'NBC TA 315: os analíticos são procedimentos de <b>avaliação de risco</b>. NBC TA 520: são obrigatórios <b>perto do término</b>, para a conclusão geral. Como procedimento <b>substantivo</b>, são opcionais e usados conforme o julgamento do auditor.',
    },
    {
      enunciado: 'Em um trabalho de asseguração limitada, a conclusão do auditor independente é expressa',
      alternativas: [
        'na forma positiva, afirmando que a informação está adequadamente apresentada em todos os aspectos relevantes.',
        'obrigatoriamente com ressalva, dada a limitação do trabalho.',
        'sem conclusão alguma, pois se trata de procedimentos previamente acordados.',
        'na forma negativa, indicando que nada chegou ao seu conhecimento que o leve a acreditar que a informação contenha distorção relevante.',
      ],
      correta: 3,
      comentario: 'Asseguração <b>limitada</b> → conclusão na forma <b>negativa</b>. A forma positiva é da asseguração <b>razoável</b> (auditoria). Procedimentos previamente acordados nem são trabalho de asseguração. “Limitada” não quer dizer “com ressalva”.',
    },
    {
      enunciado: 'Conforme a NBC TA 240, o fator que distingue a fraude do erro é',
      alternativas: [
        'o valor envolvido na distorção.',
        'a intenção: a fraude decorre de ação intencional; o erro, de ação não intencional.',
        'o cargo de quem praticou o ato.',
        'o fato de a distorção ter sido descoberta pelo auditor ou pela administração.',
      ],
      correta: 1,
      comentario: 'O que separa fraude de erro é a <b>intencionalidade</b>, não o valor nem o cargo. Lembre também que a responsabilidade primária por prevenir e detectar fraude é da <b>administração e da governança</b>.',
    },
    {
      enunciado: 'O auditor concluiu que o uso do pressuposto de continuidade operacional é apropriado, mas que existe incerteza relevante, adequadamente divulgada em nota explicativa. Conforme a NBC TA 570, o relatório deve conter',
      alternativas: [
        'opinião adversa, pois a entidade pode não continuar operando.',
        'abstenção de opinião, porque o futuro da entidade é incerto.',
        'opinião não modificada e seção separada intitulada “Incerteza relevante relacionada com a continuidade operacional”.',
        'opinião com ressalva, em razão da incerteza.',
      ],
      correta: 2,
      comentario: 'Com divulgação adequada, a opinião fica <b>não modificada</b> e o relatório ganha uma <b>seção própria</b> sobre a incerteza de continuidade. Seria ressalva ou adversa se a divulgação fosse inadequada. Seria adversa se o pressuposto fosse inapropriado.',
    },
    {
      enunciado: 'Sobre a materialidade na auditoria (NBC TA 320), é correto afirmar:',
      alternativas: [
        'A materialidade é um percentual fixo de 5% do lucro líquido, definido em lei.',
        'A materialidade para execução da auditoria é fixada em valor inferior à materialidade para as demonstrações como um todo, para reduzir a um nível baixo a probabilidade de que distorções não corrigidas e não detectadas, em conjunto, excedam a materialidade.',
        'Uma vez definida no planejamento, a materialidade não pode ser revisada.',
        'Distorções abaixo da materialidade nunca precisam ser acumuladas pelo auditor.',
      ],
      correta: 1,
      comentario: 'A materialidade depende do <b>julgamento</b> do auditor: 5% do lucro antes dos impostos é só um exemplo da norma. Ela é <b>revisada</b> quando surgem informações novas. O auditor acumula todas as distorções, exceto as <b>claramente triviais</b> (NBC TA 450), porque somadas elas podem se tornar relevantes.',
    },
  ],
  resumo: [
    'Objetivo da auditoria: aumentar a confiança dos usuários nas demonstrações, por meio da opinião do auditor.',
    'Interna (NBC TI 01): assiste a administração e avalia processos, controles e riscos. Externa: independente, opina sobre as DCs.',
    'Segurança razoável é alta, mas não absoluta. A elaboração das DCs é responsabilidade da administração.',
    'Asseguração razoável = conclusão positiva. Limitada = conclusão negativa. Atestação: outro mede o objeto. Direto: o auditor mede.',
    'Fraude × erro = intenção. Prevenir fraude cabe à administração e à governança.',
    'RA = RI × RC × RD. O auditor controla só o RD, que é inverso ao risco de distorção relevante.',
    'Materialidade para execução < materialidade global. Os percentuais são exemplos, não regra.',
    'Analíticos: obrigatórios na avaliação de riscos e no fim. Confirmação negativa: só responde se discordar.',
    'Continuidade com incerteza bem divulgada: opinião limpa + seção própria. Pressuposto inapropriado: adversa.',
    'Matriz TA 705: distorção → ressalva/adversa. Sem evidência → ressalva/abstenção (generalizado = coluna da direita).',
    'Ênfase (divulgado), outros assuntos (não divulgado) e PAA (maior importância): nenhum modifica a opinião.',
    'Sem representações formais sobre as responsabilidades da administração → abstenção (NBC TA 580).',
  ],
};
