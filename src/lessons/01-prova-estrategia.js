// Lição 01 — a prova e a estratégia para os 25 acertos.
const GRUPOS = [
  ['Contab. Geral', 14], ['Custos', 4], ['Setor Público', 4], ['Gerencial/Análise', 4], ['Controladoria', 2],
  ['Direito', 4], ['Mat. Fin./Estat.', 3], ['Teoria + NBC', 4], ['Ética/Legislação', 3], ['Auditoria', 3], ['Perícia', 3], ['Português', 2],
];

function montar(el, kit) {
  const { h, ui, pen, INK, fmt } = kit;
  const pct = GRUPOS.map(() => 25);
  el.append(ui.previsao({
    pergunta: 'Neste cenário hipotético, você espera acertar 60% de 14 questões de Contabilidade Geral e chuta as outras 36 (25% de chance por chute). A média esperada chega a 25?',
    opcoes: ['Fica acima de 25', 'Fica em 25', 'Fica abaixo de 25'],
    correta: 2,
    explicacao: '60% de 14 dá 8,4 acertos, e o chute rende em média 36 × 25% = 9. O total esperado é 17,4, abaixo de 25; o resultado efetivo pode variar. Contabilidade Geral é a base, mas sozinha não aprova: é preciso pontuar também nas disciplinas "baratas" (ética, perícia, português, NBCs).',
  }));
  const graf = h('div', {});
  const total = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const desenhar = () => {
    graf.innerHTML = '';
    const g = pen.grafico(graf, { largura: 700, altura: 360, xmin: -0.5, xmax: GRUPOS.length - 0.5, ymin: 0, ymax: 14, marcasX: 0, marcasY: 7, rotuloY: 'acertos esperados' });
    g.eixos();
    let soma = 0;
    GRUPOS.forEach(([nome, n], i) => {
      const ac = (n * pct[i]) / 100; soma += ac;
      g.retangulo(g.sx(i) - 16, g.sy(n), 32, g.sy(0) - g.sy(n), { cor: INK.lapis, tracejado: true, animar: false });
      if (ac > 0) g.barra(i, 32, ac, { cor: pct[i] >= 50 ? INK.verde : INK.laranja, animar: false });
      g.texto(g.sx(i), g.sy(0) + 18, nome.split(' ')[0], { tamanho: 13, ancora: 'middle', fonte: 'texto', cor: INK.lapis, animar: false });
    });
    const ok = soma >= 25;
    total.innerHTML = `<b>Total esperado: ${fmt.num(soma, 1)} acertos</b> de 50 → <span class="${ok ? 'ok' : 'nok'}">${ok ? 'média atinge a meta ✓' : `faltam ${fmt.num(25 - soma, 1)}`}</span>`;
  };
  const ctrls = h('div', {}, GRUPOS.map(([nome, n], i) => ui.controle({ rotulo: `${nome} (${n} q.)`, min: 0, max: 100, passo: 5, valor: pct[i], formato: (v) => `${v}%`, aoMudar: (v) => { pct[i] = v; desenhar(); } })));
  el.append(h('div', { class: 'demo-painel' }, h('p', {}, 'Agora ajuste quanto você espera acertar em cada bloco. As caixas tracejadas mostram uma distribuição aproximada e hipotética de 50 questões, não uma quantidade oficial por disciplina, e as barras mostram seus acertos esperados. Essa média não garante aprovação nem reprovação.'), graf, total, ctrls));
  desenhar();
}

export default {
  id: '01-prova-estrategia',
  numero: 1,
  disciplina: 'Estratégia',
  titulo: 'Como passar no Exame de Suficiência',
  subtitulo: 'Conheça o adversário antes de estudar',
  incidencia: 'alta',
  tempo: 20,
  pergunta: 'Para passar, precisa saber tudo? Não: precisa de 25 acertos. A pergunta é onde buscá-los.',
  previsao: {
    pergunta: 'Na prova, o que acontece se você marcar uma alternativa errada?',
    opcoes: ['Perde meio ponto', 'Uma errada anula uma certa', 'Nada: só não ganha o ponto'],
    correta: 2,
    explicacao: 'Cada questão vale 1 ponto e não há desconto por erro. Por isso, <b>nunca deixe questão em branco</b>: se não souber, elimine alternativas e marque a mais provável.',
  },
  paginas: [
    {
      titulo: 'Raio-x da prova',
      html: `<ul class="lista-check">
<li><b>50 questões</b> objetivas, cada uma com <b>4 alternativas (A, B, C, D)</b> e uma única correta.</li>
<li>Cada questão vale 1 ponto. A aprovação exige <mark>25 acertos (50%)</mark>.</li>
<li>Banca: <b>FGV</b>. Duração: <b>4 horas</b> (na edição 2/2026, das 10h às 14h, horário de Brasília).</li>
<li>É permitida <b>calculadora que não permita armazenar texto</b>. Consulte os modelos recomendados no item 7.18.11.1; outros modelos dependem de análise da FGV/CFC (7.18.11.2).</li>
<li>Vale a legislação e as normas <b>vigentes até 90 dias antes da prova</b>. Mudanças mais recentes são desconsideradas.</li>
<li>Uma única etapa: não há prova discursiva nem segunda fase.</li></ul>
<div class="caixa">A exigência do Exame vem do <b>Decreto-Lei 9.295/1946</b> (art. 12), com a redação dada pela <b>Lei 12.249/2010</b>. Para o novo registro como contador, exige-se também bacharelado e registro no CRC, ressalvadas as situações legalmente protegidas.</div>
<aside class="nota">Datas mudam a cada edição: confira o edital no site do CFC e da FGV.</aside>`,
    },
    {
      titulo: 'As 13 disciplinas do edital',
      html: `<table class="tabela"><thead><tr><th>Bloco</th><th>Disciplinas</th><th>Lições</th></tr></thead><tbody>
<tr><td><b>Coração</b></td><td>Contabilidade Geral</td><td>2 a 9</td></tr>
<tr><td><b>Custos e gestão</b></td><td>Custos, Gerencial, Controladoria</td><td>11 a 14</td></tr>
<tr><td><b>Setor público</b></td><td>Contabilidade Aplicada ao Setor Público</td><td>15 e 16</td></tr>
<tr><td><b>Teoria e normas</b></td><td>Teoria da Contabilidade, Princípios e NBCs</td><td>10</td></tr>
<tr><td><b>Profissão</b></td><td>Auditoria, Perícia, Legislação e Ética</td><td>19 a 21</td></tr>
<tr><td><b>Apoio</b></td><td>Mat. Financeira e Estatística, Direito, Português</td><td>17, 18, 22 a 24</td></tr></tbody></table>
<p>O edital não divulga quantas questões cada disciplina terá. Nas edições anteriores, <mark>Contabilidade Geral concentrou a maior parte</mark>, algo em torno de um quarto a um terço da prova. As demais disciplinas aparecem com poucas questões cada.</p>`,
    },
    {
      titulo: 'Onde estão os 25 acertos',
      html: `<p>Pense em três tipos de questão:</p>
<ol><li><b>Questões-base</b> (Contabilidade Geral, Custos, Gerencial): exigem conta, mas seguem sempre os mesmos modelos. Treino = acerto.</li>
<li><b>Questões "baratas"</b> (Ética, Legislação, Perícia, NBCs, Português): pouca matéria, muita decoreba e resposta rápida. <mark>Melhor custo-benefício do estudo.</mark></li>
<li><b>Questões caras</b> (consolidação, DFC completa, setor público detalhado, estatística inferencial): estude o básico e não trave nelas.</li></ol>
<div class="exemplo"><b>Meta realista:</b> Num cenário hipotético com 14 questões de Geral, 12 de revisão rápida e 24 restantes, acertar em média 60%, 70% e 45% rende 8,4 + 8,4 + 10,8 = <b>27,6 acertos esperados</b>. É uma média acima da meta, sem garantia de aprovação. Use o experimento para testar seu cenário.</div>`,
    },
    {
      titulo: 'Tática no dia',
      html: `<ul class="lista-check">
<li><b>Primeira passada (≈ 2h):</b> resolva o que você sabe e marque com um círculo as que travarem.</li>
<li><b>Segunda passada:</b> volte às marcadas. Questão de conta longa vai para o fim.</li>
<li>Média de <mark>4,8 minutos por questão</mark>. Se passar de 8 minutos numa só, siga em frente.</li>
<li><b>Nunca deixe em branco:</b> errar não desconta ponto.</li>
<li>Confira com atenção palavras absolutas ("sempre", "nunca", "exclusivamente"). Elas podem indicar uma generalização indevida, mas não tornam a alternativa errada por si só.</li>
<li>Reserve 20 minutos para passar tudo ao cartão de respostas com calma.</li></ul>
<div class="caixa alerta">Leia o <b>comando</b> da questão: "é <u>in</u>correto afirmar", "exceto" e "não" invertem a resposta. Sublinhe essas palavras na prova.</div>`,
    },
    {
      titulo: 'Como usar este livro',
      html: `<ol><li>Faça o <b>palpite</b> da abertura antes de ler: o erro fixa a memória.</li>
<li>Leia a teoria com calma: <mark>marca-texto</mark> é o que mais cai, e o quadro vermelho é pegadinha.</li>
<li>Brinque com o <b>experimento</b>. Ele mostra o conceito funcionando.</li>
<li>Responda às <b>questões</b>. As erradas vão sozinhas para o <b>caderno de erros</b>.</li>
<li>Releia o <b>resumo de bolso</b> na véspera.</li>
<li>Monte o <a href="#/plano">plano de estudo</a> com a data da prova e faça o <a href="#/simulado">simulado</a> perto do dia.</li></ol>
<p>Atalhos: <b>← →</b> viram a página, <b>Esc</b> volta ao sumário e <b>L</b> liga o modo leitura (letra maior, sem animações). A <a href="#/texto">versão em texto</a> serve para imprimir.</p>`,
    },
  ],
  demo: {
    titulo: 'Experimento: a calculadora da aprovação',
    instrucao: 'Primeiro dê o palpite. Depois ajuste seu percentual esperado de acerto em cada bloco e veja se chega aos 25.',
    montar: montar,
  },
  macetes: [
    '<b>25 de 50</b> aprova. Errar não desconta: nunca deixe em branco.',
    'Disciplinas "baratas" (ética, perícia, NBCs, português) são os acertos mais rápidos de conquistar.',
    'Cerca de <b>4,8 min por questão</b>. Travou? Marque e siga.',
    'Vale a norma <b>vigente até 90 dias</b> antes da prova.',
    '"Incorreto", "exceto" e "não" no comando: sublinhe!',
  ],
  questoes: [
    {
      enunciado: 'No Exame de Suficiência do CFC (Bacharel), composto de 50 questões objetivas de 1 ponto cada, a aprovação exige, no mínimo:',
      alternativas: ['20 acertos.', '25 acertos.', '30 acertos.', '35 acertos.'],
      correta: 1,
      comentario: 'São necessários 50% da prova, ou seja, <b>25 acertos</b> de 50.',
    },
    {
      enunciado: 'A aprovação em Exame de Suficiência como requisito para o registro profissional no CRC foi incluída no Decreto-Lei nº 9.295/1946 pela:',
      alternativas: ['Lei nº 6.404/1976.', 'Lei Complementar nº 101/2000.', 'Lei nº 12.249/2010.', 'Lei nº 11.638/2007.'],
      correta: 2,
      comentario: 'A <b>Lei 12.249/2010</b> alterou o DL 9.295/46 e passou a exigir a aprovação no Exame de Suficiência para o registro no CRC.',
    },
    {
      enunciado: 'Segundo o edital do Exame, as normas e a legislação cobradas são aquelas vigentes até:',
      alternativas: ['a data de publicação do edital.', '30 dias antes da prova.', 'a data da prova.', '90 dias antes da prova.'],
      correta: 3,
      comentario: 'O edital estabelece que valem as normas vigentes até <b>90 dias antes</b> da realização da prova. Alterações posteriores são desconsideradas.',
    },
    {
      enunciado: 'Cada questão do Exame de Suficiência possui:',
      alternativas: ['quatro alternativas e uma única resposta correta.', 'cinco alternativas e uma única resposta correta.', 'itens de certo ou errado.', 'quatro alternativas, podendo haver mais de uma correta.'],
      correta: 0,
      comentario: 'São <b>quatro opções (A, B, C e D)</b> e uma única resposta correta.',
    },
    {
      enunciado: 'Considerando que não há desconto por resposta errada, diante de uma questão em que você está em dúvida entre duas alternativas, a melhor estratégia é:',
      alternativas: ['deixar em branco para não perder pontos.', 'marcar sempre a alternativa A.', 'eliminar as alternativas erradas e marcar a mais provável.', 'anular a questão marcando duas alternativas.'],
      correta: 2,
      comentario: 'Errar não tira pontos. Eliminando duas alternativas, a chance de acerto sobe para 50%. Marcar duas alternativas anula a questão.',
    },
    {
      enunciado: 'Uma candidata acerta 9 das 14 questões de Contabilidade Geral e 10 das 20 questões de outras disciplinas que estudou. Nas 16 restantes, chuta, com expectativa de 25% de acerto. O número esperado de acertos e sua comparação com a meta de 25 são:',
      alternativas: ['19 acertos esperados, abaixo da meta.', '23 acertos esperados, abaixo da meta.', '25 acertos esperados, na meta.', '27 acertos esperados, acima da meta.'],
      correta: 1,
      comentario: '9 + 10 + 16 × 0,25 = 9 + 10 + 4 = <b>23</b>. A média está 2 acertos abaixo da meta; o resultado real dos chutes pode variar. É útil reforçar as disciplinas "baratas".',
    },
  ],
  resumo: [
    '50 questões A–D, 1 ponto cada, sem desconto por erro.',
    'Aprovação: 25 acertos (50%). Banca FGV, prova de 4 horas.',
    'Calculadora sem capacidade de armazenar texto; confira os modelos e a análise exigida no edital.',
    'Valem normas e leis vigentes até 90 dias antes da prova.',
    'Contabilidade Geral é a base; as disciplinas "baratas" completam os 25.',
    'Nunca deixe em branco. Sublinhe "incorreto", "exceto" e "não".',
    'Use o plano de estudo, o caderno de erros e o simulado.',
  ],
};
