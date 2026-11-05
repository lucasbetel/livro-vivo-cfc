// Lição 20 — Perícia contábil. Demo: linha do tempo do processo pericial (CPC) com palpites de prazo e de quem faz.
const ATORES = {
  juiz: { nome: 'Juiz', cor: 'roxo' },
  partes: { nome: 'Partes', cor: 'azul' },
  perito: { nome: 'Perito do juízo', cor: 'verde' },
  assistente: { nome: 'Assistente técnico', cor: 'laranja' },
};

// tipo: 'quem' (quem faz), 'prazo' ou 'quanto'
const ETAPAS = [
  {
    tipo: 'quem', acao: 'Nomeia perito especializado no objeto da perícia e fixa, de imediato, o prazo para a entrega do laudo.',
    opcoes: ['Juiz', 'Partes', 'Perito do juízo', 'Assistente técnico'], correta: 0,
    ator: 'juiz', prazo: 'início', curto: 'nomeia o perito e fixa o prazo', art: 'art. 465',
    exp: 'Quem nomeia é o juiz, e ele já fixa o prazo do laudo. Não existe termo de compromisso: o perito cumpre o encargo “independentemente de termo de compromisso” (art. 466).',
  },
  {
    tipo: 'prazo', acao: 'Contado da intimação do despacho de nomeação, as partes podem arguir impedimento ou suspeição do perito, indicar assistente técnico e apresentar quesitos. Em quanto tempo?',
    opcoes: ['5 dias', '10 dias', '15 dias', '30 dias'], correta: 2,
    ator: 'partes', prazo: '15 dias', curto: 'arguição + assistente + quesitos', art: 'art. 465, §1º',
    exp: 'São <b>15 dias</b>, contados da intimação da nomeação, para as três providências: arguir impedimento ou suspeição, indicar assistente técnico e apresentar quesitos.',
  },
  {
    tipo: 'prazo', acao: 'Ciente da nomeação, o perito apresenta proposta de honorários, currículo com comprovação de especialização e contatos profissionais (em especial o e-mail).',
    opcoes: ['48 horas', '5 dias', '10 dias', '15 dias'], correta: 1,
    ator: 'perito', prazo: '5 dias', curto: 'honorários + currículo + contatos', art: 'art. 465, §2º',
    exp: '<b>5 dias</b> para o perito apresentar proposta de honorários, currículo e contatos profissionais, inclusive o endereço eletrônico para as intimações.',
  },
  {
    tipo: 'prazo', acao: 'Intimadas da proposta de honorários, as partes podem se manifestar em prazo comum. Depois, o juiz arbitra o valor.',
    opcoes: ['5 dias', '10 dias', '15 dias', '20 dias'], correta: 0,
    ator: 'partes', prazo: '5 dias', curto: 'falam sobre os honorários', art: 'art. 465, §3º',
    exp: 'Prazo comum de <b>5 dias</b>. Em seguida, o juiz arbitra o valor e intima as partes para o adiantamento (art. 95).',
  },
  {
    tipo: 'quanto', acao: 'O juiz pode autorizar que parte dos honorários arbitrados seja paga ao perito já no início dos trabalhos. Qual é o limite?',
    opcoes: ['até 30%', 'até 50%', 'até 70%', '100%'], correta: 1,
    ator: 'juiz', prazo: 'até 50%', curto: 'adianta honorários; resto no fim', art: 'art. 465, §4º',
    exp: 'Até <b>50%</b> no início. O restante só no final, depois de entregue o laudo e prestados todos os esclarecimentos. Perícia inconclusiva ou deficiente pode ter a remuneração reduzida (§5º).',
  },
  {
    tipo: 'prazo', acao: 'O perito deve comunicar previamente aos assistentes das partes as diligências e os exames que fará, com prova nos autos. Antecedência mínima:',
    opcoes: ['24 horas', '3 dias', '5 dias', '10 dias'], correta: 2,
    ator: 'perito', prazo: '5 dias antes', curto: 'avisa as diligências', art: 'art. 466, §2º',
    exp: 'O perito garante aos assistentes acesso e acompanhamento das diligências, com comunicação comprovada nos autos e antecedência mínima de <b>5 dias</b>.',
  },
  {
    tipo: 'quem', acao: 'Indefere quesitos impertinentes e formula os quesitos que entender necessários ao esclarecimento da causa.',
    opcoes: ['Perito do juízo', 'Assistente técnico', 'Juiz', 'Partes'], correta: 2,
    ator: 'juiz', prazo: 'durante', curto: 'indefere quesitos impertinentes', art: 'art. 470',
    exp: 'É o <b>juiz</b> quem indefere quesitos impertinentes e formula os próprios. As partes ainda podem apresentar <b>quesitos suplementares</b> durante a diligência (art. 469).',
  },
  {
    tipo: 'prazo', acao: 'Por motivo justificado, o perito não consegue entregar o laudo no prazo. O juiz pode conceder, por uma vez, prorrogação de:',
    opcoes: ['mais 15 dias', 'metade do prazo original', 'o mesmo prazo original', 'mais 30 dias'], correta: 1,
    ator: 'juiz', prazo: '+ metade do prazo', curto: 'prorroga o laudo (uma vez)', art: 'art. 476',
    exp: 'Uma única prorrogação, pela <b>metade do prazo originalmente fixado</b>. Se o perito descumprir o prazo sem motivo legítimo, pode ser substituído e multado (art. 468).',
  },
  {
    tipo: 'prazo', acao: 'O perito protocola o laudo em juízo, no prazo fixado, com antecedência mínima da audiência de instrução e julgamento de:',
    opcoes: ['10 dias', '15 dias', '20 dias', '30 dias'], correta: 2,
    ator: 'perito', prazo: '20 dias antes da AIJ', curto: 'protocola o laudo', art: 'art. 477',
    exp: 'O laudo é protocolado no prazo fixado pelo juiz e <b>pelo menos 20 dias antes</b> da audiência de instrução e julgamento.',
  },
  {
    tipo: 'quem', acao: 'No prazo comum de 15 dias da intimação do laudo, apresenta o parecer técnico-contábil, concordando ou divergindo do perito.',
    opcoes: ['Juiz', 'Assistente técnico', 'Perito do juízo', 'Ministério Público'], correta: 1,
    ator: 'assistente', prazo: '15 dias', curto: 'parecer técnico-contábil', art: 'art. 477, §1º',
    exp: 'Intimadas do laudo, as partes têm prazo comum de <b>15 dias</b> para se manifestar e, no mesmo prazo, o <b>assistente técnico</b> apresenta seu parecer.',
  },
  {
    tipo: 'prazo', acao: 'Havendo divergência ou dúvida das partes, do juiz ou do MP, ou ponto divergente no parecer do assistente, o perito do juízo deve esclarecer em:',
    opcoes: ['5 dias', '10 dias', '15 dias', '20 dias'], correta: 2,
    ator: 'perito', prazo: '15 dias', curto: 'presta esclarecimentos', art: 'art. 477, §2º',
    exp: 'O perito do juízo tem <b>15 dias</b> para esclarecer os pontos de divergência ou dúvida, inclusive os apontados no parecer do assistente técnico.',
  },
  {
    tipo: 'prazo', acao: 'Se ainda houver dúvida, o perito (ou o assistente) é intimado, por meio eletrônico, a comparecer à audiência para responder a quesitos. Antecedência mínima:',
    opcoes: ['5 dias', '10 dias', '15 dias', '20 dias'], correta: 1,
    ator: 'perito', prazo: '10 dias antes da AIJ', curto: 'intimado para a audiência', art: 'art. 477, §4º',
    exp: 'A parte pede a intimação já formulando as perguntas como quesitos (§3º). A intimação é eletrônica, com pelo menos <b>10 dias</b> de antecedência da audiência.',
  },
];

function montarLinhaDoTempo(el, kit) {
  const { h, INK, pen, ui } = kit;
  const ESP = 60, TOPO = 36, LARG = 480;
  const legenda = h('div', { class: 'demo-linha' },
    Object.values(ATORES).map((a) => h('span', { style: { color: INK[a.cor], fontWeight: '700' } }, `● ${a.nome}`)));
  const caixaSvg = h('div', {});
  const q = pen.quadro(caixaSvg, { largura: LARG, altura: TOPO + (ETAPAS.length - 1) * ESP + 40 });

  let marcadores = [];
  const desenharBase = () => {
    q.limpar();
    q.linha(30, TOPO - 18, 30, TOPO + (ETAPAS.length - 1) * ESP + 14, { cor: INK.lapis, tracejado: true, animar: false });
    marcadores = ETAPAS.map((_, i) => {
      q.circulo(30, TOPO + i * ESP, 14, { cor: INK.lapis, animar: false });
      return q.texto(52, TOPO + i * ESP + 6, `etapa ${i + 1}: ?`, { cor: INK.lapis, tamanho: 18, animar: false });
    });
  };
  const desenharEtapa = (i) => {
    const e = ETAPAS[i], a = ATORES[e.ator], y = TOPO + i * ESP, cor = INK[a.cor];
    q.remover(marcadores[i]);
    q.circulo(30, y, 24, { cor, preenchimento: cor, estilo: 'solid' });
    q.texto(30, y + 5, String(i + 1), { cor: '#ffffff', tamanho: 15, ancora: 'middle', fonte: 'texto', peso: 700 });
    q.texto(52, y + 2, `${e.prazo} · ${a.nome}`, { cor, tamanho: 21, peso: 700 });
    q.texto(52, y + 24, `${e.curto} (${e.art})`, { cor: INK.lapis, tamanho: 16, fonte: 'texto' });
  };

  let n = 0, acertos = 0;
  const etapaEl = h('p', { class: 'demo-fato' });
  const placar = h('span', { class: 'demo-placar' });
  const area = h('div', {});
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const PERG = { quem: 'Quem faz?', prazo: 'Qual o prazo?', quanto: 'Qual o limite?' };

  const proximo = () => {
    area.innerHTML = '';
    if (n >= ETAPAS.length) {
      etapaEl.innerHTML = `<b>Fim do processo!</b> Você acertou ${acertos} de ${ETAPAS.length}. Repare no ritmo: <b>15</b> (partes) → <b>5</b> (perito) → <b>5</b> (partes) → laudo <b>20</b> dias antes da AIJ → <b>15</b> (parecer) → <b>15</b> (esclarecimentos) → <b>10</b> (intimação).`;
      msg.textContent = 'Toda a linha do tempo está desenhada acima. Recomece para treinar de novo.';
      area.append(h('button', { class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; desenharBase(); proximo(); } }, 'Recomeçar'));
      return;
    }
    const e = ETAPAS[n];
    etapaEl.innerHTML = `<b>Etapa ${n + 1}/${ETAPAS.length} · ${PERG[e.tipo]}</b><br>${e.acao}`;
    placar.textContent = `acertos: ${acertos}`;
    msg.textContent = 'Dê seu palpite. A etapa será desenhada na linha do tempo com o prazo e a cor de quem a pratica.';
    area.append(ui.botoes(e.opcoes, (i, b, g) => {
      if (g.dataset.ok) return;
      g.dataset.ok = '1';
      [...g.children].forEach((x, j) => { x.disabled = true; if (j === e.correta) x.classList.add('certo'); });
      if (i === e.correta) acertos++; else b.classList.add('errado');
      placar.textContent = `acertos: ${acertos}`;
      desenharEtapa(n);
      const a = ATORES[e.ator];
      msg.innerHTML = `<p class="${i === e.correta ? 'ok' : 'nok'}">${i === e.correta ? '✔ Isso!' : '✘ Quase.'} ${e.exp}</p><p class="lanc"><b>${a.nome}</b> · ${e.prazo} · CPC, ${e.art}</p>`;
      n++;
      area.append(h('button', { class: 'btn-caneta primario', onclick: proximo }, n < ETAPAS.length ? 'Próxima etapa →' : 'Ver resultado'));
    }));
  };
  el.append(h('div', { class: 'demo-painel' }, legenda, h('div', { class: 'demo-linha' }, etapaEl, placar), area, msg), caixaSvg);
  desenharBase();
  proximo();
}

export default {
  id: '20-pericia',
  numero: 20,
  disciplina: 'Perícia Contábil',
  titulo: 'Perícia contábil',
  subtitulo: 'Perito, assistente, quesitos e o relógio do CPC',
  incidencia: 'media',
  tempo: 55,
  pergunta: 'Se o juiz não concordar com o laudo do perito, ele é obrigado a decidir conforme o laudo?',
  previsao: {
    pergunta: 'Num processo judicial, quem escreve o <b>laudo pericial contábil</b> e quem escreve o <b>parecer técnico-contábil</b>?',
    opcoes: ['Os dois são escritos pelo perito do juízo', 'Laudo: perito do juízo · Parecer: assistente técnico', 'Laudo: assistente técnico · Parecer: perito do juízo'],
    correta: 1,
    explicacao: 'O <b>laudo</b> é a peça do <b>perito do juízo</b>, nomeado pelo juiz. O <b>parecer técnico-contábil</b> é a peça do <b>assistente técnico</b>, contratado pela parte (NBC TP 01). E o juiz <b>não fica preso</b> ao laudo: ele aprecia a prova e explica na sentença por que seguiu ou não as conclusões (CPC, art. 479).',
  },
  paginas: [
    {
      titulo: 'O que é perícia contábil e quais são os tipos',
      html: `<p>Pela <b>NBC TP 01</b>, a perícia contábil é o <mark>conjunto de procedimentos técnico-científicos</mark> que leva à instância decisória elementos de prova para subsidiar a justa solução do litígio ou a constatação de um fato. Isso é feito por meio de <b>laudo pericial contábil</b> e/ou <b>parecer técnico-contábil</b>.</p>
<div class="caixa"><b>Natureza:</b> é meio de <b>prova técnica</b>. No processo judicial, o perito é <b>auxiliar da justiça</b> (CPC, art. 149) e o juiz é assistido por ele “quando a prova do fato depender de conhecimento técnico ou científico” (CPC, art. 156).<br><b>Quem pode:</b> a perícia contábil, judicial ou extrajudicial, é de <b>competência exclusiva de contador</b> em situação regular no CRC (NBC TP 01; DL 9.295/46, arts. 25 e 26).</div>
<table class="tabela"><thead><tr><th>Tipo</th><th>Onde acontece</th></tr></thead><tbody>
<tr><td><b>Judicial</b></td><td>sob a tutela da Justiça: perito nomeado pelo juiz, de ofício ou a pedido das partes</td></tr>
<tr><td><b>Extrajudicial</b></td><td>fora do Judiciário. Abrange a perícia <b>arbitral</b>, a <b>oficial/estatal</b> e a <b>voluntária</b></td></tr>
<tr><td><b>Arbitral</b></td><td>no juízo arbitral, sob o controle da Lei de Arbitragem (Lei 9.307/96)</td></tr>
<tr><td><b>Oficial / estatal</b></td><td>sob o controle de órgãos do Estado</td></tr>
<tr><td><b>Voluntária</b></td><td>contratada espontaneamente pelo interessado ou de comum acordo entre as partes</td></tr></tbody></table>
<p>Os prazos processuais em dias contam-se em <b>dias úteis</b> (CPC, art. 219). A sequência didática da demo não significa que o prazo do perito só comece após terminar o prazo das partes: cada um tem seu próprio marco de intimação/ciência. No CPC, a prova pericial consiste em <b>exame, vistoria ou avaliação</b> (art. 464). O juiz <b>indefere</b> a perícia quando a prova não depende de conhecimento técnico, quando é desnecessária diante de outras provas ou quando a verificação é impraticável. Em ponto de menor complexidade, pode trocá-la por <b>prova técnica simplificada</b>, que é a inquirição de um especialista pelo juiz.</p>
<aside class="nota">Se as partes já juntaram pareceres técnicos suficientes na inicial e na contestação, o juiz pode dispensar a perícia (art. 472).</aside>`,
    },
    {
      titulo: 'Perito do juízo × assistente técnico',
      html: `<table class="tabela"><thead><tr><th></th><th>Perito do juízo</th><th>Assistente técnico</th></tr></thead><tbody>
<tr><td>Quem escolhe</td><td>o <b>juiz</b> (ou árbitro, ou autoridade)</td><td>a <b>parte</b></td></tr>
<tr><td>Relação</td><td>auxiliar da justiça, deve ser <b>imparcial</b></td><td>de <b>confiança da parte</b></td></tr>
<tr><td>Impedimento e suspeição</td><td><b>sim</b>, aplicam-se a ele</td><td><b>não</b> se sujeita (CPC, art. 466, §1º)</td></tr>
<tr><td>Peça que escreve</td><td><b>laudo</b> pericial contábil</td><td><b>parecer</b> técnico-contábil</td></tr>
<tr><td>Quem paga</td><td>quem requereu a perícia, ou rateio se foi de ofício ou pedida por ambos (art. 95)</td><td>a parte que o indicou</td></tr></tbody></table>
<p><b>Nomeação.</b> O juiz nomeia entre profissionais inscritos em <b>cadastro mantido pelo tribunal</b> (art. 156, §1º). Onde não houver inscrito, a escolha é livre, desde que o profissional comprove o conhecimento necessário (§5º). O CFC mantém o <b>Cadastro Nacional de Peritos Contábeis (CNPC)</b>, e o perito comprova a regularidade no CRC.</p>
<ul class="lista-check"><li><b>Perícia consensual</b> (art. 471): as partes escolhem juntas o perito, desde que sejam plenamente capazes e a causa admita autocomposição. Ela substitui a perícia do perito nomeado pelo juiz.</li>
<li><b>Perícia complexa</b> (art. 475): o juiz pode nomear mais de um perito, e a parte pode indicar mais de um assistente.</li>
<li>O perito <b>não assina termo de compromisso</b>: cumpre o encargo independentemente dele (art. 466).</li></ul>
<div class="caixa alerta"><b>Pegadinha da FGV:</b> “o assistente técnico está sujeito às mesmas causas de impedimento e suspeição do perito”. <b>Errado.</b> Ele é de confiança da parte. O <b>perito do juízo</b> deve ser imparcial. A dispensa processual do assistente não o libera de independência técnica, veracidade e deveres profissionais (NBC PP 01 (R2), itens 6–13).</div>`,
    },
    {
      titulo: 'Impedimento, suspeição, escusa, substituição e responsabilidade',
      html: `<p>Os motivos de impedimento e suspeição do juiz (CPC, arts. 144 e 145) aplicam-se ao <b>perito</b> (art. 148).</p>
<table class="tabela"><thead><tr><th>Impedimento (objetivo)</th><th>Suspeição (subjetivo)</th></tr></thead><tbody>
<tr><td>ser parte no processo, ou ter cônjuge/companheiro ou parente até o 3º grau como parte ou advogado; ter atuado no processo em outra função</td><td>ser <b>amigo íntimo ou inimigo</b> de parte ou advogado; receber presentes de interessados; aconselhar a parte; ser credor ou devedor da parte; ter interesse no resultado</td></tr></tbody></table>
<p>A NBC PP 01 (R2) trata de <b>impedimentos profissionais</b> e de impedimento e suspeição legal. Além disso, o profissional só deve aceitar trabalho para o qual tenha capacitação e condições técnicas. A expressão didática “impedimento técnico-científico” não substitui essas categorias atuais.</p>
<div class="formula">Partes arguem em 15 dias · Perito se escusa em 15 dias</div>
<ul class="lista-check"><li>As partes arguem impedimento ou suspeição em <b>15 dias</b> da intimação da nomeação (art. 465, §1º).</li>
<li>O perito pode <b>escusar-se</b> alegando motivo legítimo, em <b>15 dias</b> contados da intimação ou do impedimento ou suspeição supervenientes, sob pena de renúncia ao direito (art. 157, §1º). Aceita a escusa, o juiz nomeia outro (art. 467).</li>
<li><b>Substituição</b> (art. 468): por falta de conhecimento técnico, ou por descumprir o prazo sem motivo legítimo. Nesse segundo caso, o juiz comunica a corporação profissional e pode multar o perito. O substituído devolve os valores relativos ao trabalho não realizado em <b>15 dias</b>, sob pena de ficar impedido de atuar como perito por <b>5 anos</b>.</li></ul>
<div class="caixa"><b>Responsabilidade:</b> o perito que, por dolo ou culpa, prestar informações inverídicas responde pelos prejuízos e fica <b>inabilitado de 2 a 5 anos</b> para outras perícias, e o juiz comunica o órgão de classe (art. 158). Há ainda o crime de falsa perícia (Código Penal, art. 342) e a responsabilidade ética perante o CRC.</div>`,
    },
    {
      titulo: 'Planejamento, diligências e quesitos',
      html: `<p><b>Planejamento (NBC TP 01).</b> Antes de executar, o perito conhece o objeto e a finalidade da perícia e define natureza, oportunidade e extensão dos exames. Ele também garante o cumprimento do prazo, identifica fatos importantes, riscos e a legislação aplicável e organiza a equipe. O planejamento também embasa a proposta de honorários.</p>
<table class="tabela"><thead><tr><th>Procedimento</th><th>O que é</th></tr></thead><tbody>
<tr><td>Exame</td><td>análise de livros, registros e documentos</td></tr>
<tr><td>Vistoria</td><td>verificação e constatação de situação, coisa ou fato</td></tr>
<tr><td>Indagação</td><td>busca de informações por entrevista com quem conhece o fato</td></tr>
<tr><td>Investigação</td><td>pesquisa para trazer ao laudo o que está oculto</td></tr>
<tr><td>Arbitramento</td><td>determinação de valores, quantidades ou solução de controvérsia por <b>critério técnico-científico</b></td></tr>
<tr><td>Mensuração</td><td>qualificação e quantificação física de coisas, bens, direitos e obrigações</td></tr>
<tr><td>Avaliação</td><td>atribuição de valor a coisas, bens, direitos, obrigações, despesas e receitas</td></tr>
<tr><td>Testabilidade</td><td>verificar os elementos probantes dos autos e confrontá-los com as premissas</td></tr>
<tr><td>Comparação</td><td>relacionar objetos ou estados patrimoniais/de resultado para analisar semelhanças e diferenças</td></tr>
<tr><td>Certificação</td><td>atestar a informação obtida na formação da prova pericial (NBC TP 01 (R2), item 35(j))</td></tr></tbody></table>
<p><b>Termo de diligência:</b> instrumento pelo qual o perito <b>solicita documentos, coisas, dados e informações</b> necessários ao laudo ou ao parecer. Se não for atendido, o perito comunica ao juiz. Ele avisa os assistentes das diligências com <b>5 dias</b> de antecedência (art. 466, §2º) e pode ouvir testemunhas, pedir documentos e juntar planilhas e fotos (art. 473, §3º).</p>
<table class="tabela"><thead><tr><th>Quesito</th><th>Quando</th></tr></thead><tbody>
<tr><td>Iniciais (das partes)</td><td>em 15 dias da intimação da nomeação (art. 465, §1º)</td></tr>
<tr><td>Suplementares</td><td>durante a diligência (art. 469)</td></tr>
<tr><td>Do juiz</td><td>o juiz formula os que achar necessários e <b>indefere os impertinentes</b> (art. 470)</td></tr>
<tr><td>De esclarecimento</td><td>após o laudo, inclusive para a audiência (art. 477, §3º)</td></tr></tbody></table>
<div class="caixa alerta">O laudo deve trazer <b>resposta conclusiva a todos os quesitos</b> (art. 473, IV). É <b>vedado</b> ao perito ultrapassar os limites da designação e emitir opiniões pessoais além do exame técnico (art. 473, §2º). Perito não decide quem tem razão.</div>`,
    },
    {
      titulo: 'Laudo × parecer, prazos e esclarecimentos',
      html: `<p><b>Laudo pericial contábil</b> é a peça do <b>perito do juízo</b>. <b>Parecer técnico-contábil</b> é a peça do <b>assistente técnico</b>. Textos antigos e o edital também usam “parecer pericial contábil”.</p>
<div class="caixa"><b>Conteúdo mínimo do laudo (CPC, art. 473):</b> (I) exposição do objeto da perícia; (II) análise técnica ou científica; (III) indicação do <b>método</b> utilizado, demonstrando que é aceito pelos especialistas; (IV) <b>resposta conclusiva</b> a todos os quesitos do juiz, das partes e do MP. A fundamentação deve ser em linguagem simples e com coerência lógica.</div>
<p>Pela NBC TP 01, o laudo traz identificação do processo e das partes, síntese do objeto, resumo dos autos, metodologia, relato das diligências, quesitos transcritos e respondidos, conclusão, encerramento e assinatura. <b>Apêndices</b> são elaborados pelo próprio perito. <b>Anexos</b> são documentos de terceiros.</p>
<table class="tabela"><thead><tr><th>Momento</th><th>Prazo</th><th>CPC</th></tr></thead><tbody>
<tr><td>Protocolo do laudo</td><td>no prazo do juiz e <b>pelo menos 20 dias antes</b> da audiência</td><td>art. 477</td></tr>
<tr><td>Prorrogação justificada</td><td><b>uma vez</b>, pela <b>metade</b> do prazo original</td><td>art. 476</td></tr>
<tr><td>Manifestação das partes + parecer do assistente</td><td><b>15 dias</b> (prazo comum)</td><td>art. 477, §1º</td></tr>
<tr><td>Esclarecimentos do perito</td><td><b>15 dias</b></td><td>art. 477, §2º</td></tr>
<tr><td>Intimação para a audiência</td><td>pelo menos <b>10 dias</b> antes, por meio eletrônico</td><td>art. 477, §4º</td></tr></tbody></table>
<div class="caixa alerta"><b>O juiz não está preso ao laudo:</b> ele aprecia a prova e indica na sentença por que considerou ou deixou de considerar as conclusões, levando em conta o método do perito (art. 479). Se a matéria não ficou esclarecida, pode determinar <b>nova perícia</b> sobre os mesmos fatos. A segunda perícia <b>não substitui</b> a primeira: o juiz avalia as duas (art. 480).</div>`,
    },
    {
      titulo: 'Honorários periciais',
      html: `<ol><li>Ciente da nomeação, o perito apresenta a <b>proposta de honorários</b> em <b>5 dias</b>, com currículo e contatos (art. 465, §2º).</li>
<li>As partes se manifestam em <b>5 dias</b> (prazo comum), e o juiz <b>arbitra</b> o valor (§3º).</li>
<li>O juiz pode liberar <mark>até 50%</mark> no início dos trabalhos. O restante é pago ao final, depois do laudo e de todos os esclarecimentos (§4º).</li>
<li>Se a perícia for <b>inconclusiva ou deficiente</b>, o juiz pode reduzir a remuneração (§5º).</li></ol>
<p><b>Como orçar (NBC PP 01):</b> considerar a relevância, o vulto, o risco e a complexidade do trabalho, as horas estimadas por etapa e por qualificação da equipe, o prazo, a forma de recebimento e eventuais laudos de outros profissionais.</p>
<table class="tabela"><thead><tr><th>Quem adianta (art. 95)</th><th>Situação</th></tr></thead><tbody>
<tr><td>A parte que requereu a perícia</td><td>perícia pedida por uma das partes</td></tr>
<tr><td>Rateio entre as partes</td><td>perícia determinada de ofício ou pedida por ambas</td></tr>
<tr><td>Cada parte</td><td>o seu próprio assistente técnico</td></tr></tbody></table>
<p>Se o responsável pelo pagamento for beneficiário da <b>gratuidade de justiça</b>, a perícia é custeada com recursos públicos, conforme tabela do tribunal (art. 95, §3º).</p>
<div class="caixa alerta">O perito substituído devolve o que recebeu pelo trabalho não feito em <b>15 dias</b>, sob pena de ficar <b>5 anos</b> impedido de atuar como perito judicial (art. 468, §2º). O assistente técnico combina honorários diretamente com a parte, mediante contrato escrito.</div>`,
    },
    {
      titulo: 'Apuração de haveres (ITP 01)',
      html: `<p>Na <b>dissolução parcial</b>, a sociedade continua, mas um sócio sai (morte, retirada, recesso ou exclusão). Ele, ou o espólio, recebe seus <b>haveres</b>. A <b>ITP 01</b> do CFC (publicada em 28/11/2025) disciplina a apuração judicial, arbitral ou voluntária, em dissolução total ou parcial. Contempla valor patrimonial contábil, balanço de determinação, fluxo de caixa descontado e múltiplos de mercado, observadas as disposições contratuais e a decisão aplicável. Sem definição expressa, adota-se o balanço de determinação (item 10); isso não autoriza ignorar o CPC.</p>
<div class="caixa"><b>Código Civil, art. 1.031:</b> a quota é liquidada com base na situação patrimonial da sociedade <b>na data da resolução</b>, verificada em <b>balanço especialmente levantado</b>, salvo disposição contratual em contrário. Ela é paga em dinheiro em <b>90 dias</b> a partir da liquidação, salvo acordo ou estipulação contratual.</div>
<p><b>CPC, art. 604:</b> o juiz fixa a <b>data da resolução</b>, define o <b>critério de apuração</b> conforme o contrato social e nomeia o perito.</p>
<table class="tabela"><thead><tr><th>Evento (CPC, art. 605)</th><th>Data da resolução</th></tr></thead><tbody>
<tr><td>Morte do sócio</td><td>data do óbito</td></tr>
<tr><td>Retirada imotivada</td><td>60º dia após a sociedade receber a notificação do sócio</td></tr>
<tr><td>Recesso</td><td>dia em que a sociedade recebe a notificação do dissidente</td></tr>
<tr><td>Retirada por justa causa (sociedade por prazo determinado) e exclusão judicial</td><td>trânsito em julgado da decisão</td></tr>
<tr><td>Exclusão extrajudicial</td><td>data da assembleia ou reunião que a deliberou</td></tr></tbody></table>
<p><b>CPC, art. 606:</b> se o contrato for <b>omisso</b>, o critério é o valor patrimonial apurado em <mark>balanço de determinação</mark> na data da resolução. Nele, os ativos <b>tangíveis e intangíveis</b> e o passivo são avaliados a <b>preço de saída</b>. O perito deve ser, de preferência, especialista em avaliação de sociedades.</p>
<table class="tabela"><thead><tr><th>Balanço patrimonial comum</th><th>Balanço de determinação</th></tr></thead><tbody>
<tr><td>valores contábeis (em geral, custo histórico)</td><td>ativos e passivos ajustados a preço de saída, incluindo intangíveis não registrados</td></tr></tbody></table>
<aside class="nota">CPC, art. 608: até a data da resolução, entram nos haveres os lucros ou juros sobre capital próprio declarados e o pró-labore, se houver. Depois dela, o ex-sócio só tem direito a correção monetária e juros contratuais ou legais.</aside>`,
    },
    {
      titulo: 'Perícia nas espécies de lides',
      html: `<table class="tabela"><thead><tr><th>Lide</th><th>O que o perito apura</th></tr></thead><tbody>
<tr><td><b>Bancária / financeira</b></td><td>revisão de cláusulas, taxas e encargos; sistema de amortização (Price, SAC); <b>capitalização de juros</b>. Nos contratos do Sistema Financeiro Nacional, é permitida em periodicidade inferior à anual a partir de 31/3/2000, se expressamente pactuada (STJ, Súmula 539). A cobrança de encargos abusivos no período de normalidade <b>descaracteriza a mora</b>.</td></tr>
<tr><td><b>Trabalhista</b></td><td>liquidação de sentença por cálculo, arbitramento ou artigos (CLT, art. 879); verbas rescisórias (saldo de salário, aviso prévio, 13º, férias + 1/3, FGTS + multa); <b>reflexos</b> (ex.: horas extras habituais em DSR, férias, 13º e FGTS)</td></tr>
<tr><td><b>Desapropriação</b></td><td><b>juros compensatórios</b>, que compensam a perda antecipada da posse (imissão provisória); <b>juros moratórios</b>, pelo atraso no pagamento da indenização; base de cálculo da indenização (DL 3.365/41, arts. 15-A e 15-B)</td></tr>
<tr><td><b>Inventário, tutela e curatela</b></td><td><b>prestação de contas</b> do inventariante, tutor ou curador; <b>glosa</b> das despesas sem comprovação ou sem pertinência. O <b>ônus da prova</b> é de quem presta as contas</td></tr>
<tr><td><b>Condomínio</b></td><td>conciliação bancária (extrato × razão), uso do <b>fundo de reserva</b>, cálculo da inadimplência (multa limitada a 2%, CC, art. 1.336, §1º)</td></tr>
<tr><td><b>Tributária e societária</b></td><td>apuração de tributos; <b>danos emergentes</b> (o que efetivamente se perdeu) e <b>lucros cessantes</b> (o que razoavelmente se deixou de lucrar, CC, art. 402)</td></tr></tbody></table>
<div class="caixa alerta"><b>Pegadinha:</b> juros <b>compensatórios</b> remuneram a perda antecipada da posse do bem; juros <b>moratórios</b> remuneram o atraso no pagamento. Danos <b>emergentes</b> = perda efetiva. Lucros <b>cessantes</b> = ganho que deixou de existir.</div>
<p>Em todas as lides vale a mesma regra: o perito responde aos quesitos com base em documentos e critério técnico. Ele considera a legislação e os critérios fixados para o trabalho, mas <b>não substitui o juiz na decisão jurídica</b> nem emite opinião pessoal sobre quem deve ganhar a causa.</p>`,
    },
  ],
  demo: {
    titulo: 'Experimento: a linha do tempo do processo pericial',
    instrucao: 'Em cada etapa, dê seu palpite (prazo, limite ou quem faz). A etapa é desenhada na linha do tempo na cor de quem a pratica: roxo = juiz, azul = partes, verde = perito do juízo, laranja = assistente técnico.',
    montar: montarLinhaDoTempo,
  },
  macetes: [
    '<b>15-5-5:</b> partes têm 15 dias (quesitos, assistente, arguição) → perito 5 dias (proposta) → partes 5 dias (sobre os honorários).',
    'Laudo: <b>20 dias antes</b> da audiência. Prorrogação: <b>uma vez, metade</b> do prazo.',
    'Depois do laudo: <b>15</b> dias para parecer e manifestação, <b>15</b> para esclarecimentos e intimação para a audiência com <b>10</b> dias.',
    'Honorários: até <b>50%</b> no início. Perícia inconclusiva pode ter os honorários reduzidos.',
    '<b>L</b>audo = perito do juízo (<b>L</b>ei, imparcial). <b>P</b>arecer = assistente (<b>P</b>arte).',
    'Assistente técnico não se sujeita ao impedimento e à suspeição <b>processuais do CPC</b>; continua sujeito aos deveres e impedimentos profissionais das NBCs.',
    'Impedimento = fato <b>objetivo</b> (parente, ser parte). Suspeição = vínculo <b>subjetivo</b> (amizade íntima, inimizade, interesse).',
    'Contrato social omisso → <b>balanço de determinação</b>, preço de saída, intangíveis incluídos, na data da resolução.',
  ],
  questoes: [
    {
      enunciado: 'Nos termos do CPC, após a intimação do despacho de nomeação do perito, as partes têm o prazo de ______ para arguir o impedimento ou a suspeição do perito, indicar assistente técnico e apresentar quesitos. Assinale a opção que completa corretamente a lacuna.',
      alternativas: ['5 dias', '10 dias', '15 dias', '20 dias'],
      correta: 2,
      comentario: 'CPC, art. 465, §1º: <b>15 dias</b> contados da intimação do despacho de nomeação, para as três providências. Os 5 dias são do perito, para apresentar a proposta de honorários (§2º).',
    },
    {
      enunciado: 'Ciente da nomeação, o perito judicial deve apresentar, no prazo de 5 dias,',
      alternativas: [
        'o laudo pericial preliminar e o cronograma de diligências.',
        'proposta de honorários, currículo com comprovação de especialização e contatos profissionais, em especial o endereço eletrônico.',
        'os quesitos que pretende responder e a relação dos assistentes técnicos.',
        'o termo de compromisso assinado, sem o qual não pode iniciar os trabalhos.',
      ],
      correta: 1,
      comentario: 'CPC, art. 465, §2º. O perito <b>não</b> assina termo de compromisso: cumpre o encargo independentemente dele (art. 466). Quesitos são formulados pelas partes e pelo juiz, não pelo perito.',
    },
    {
      enunciado: 'De acordo com o CPC, o perito deve protocolar o laudo em juízo, no prazo fixado pelo juiz, pelo menos',
      alternativas: ['10 dias antes da audiência de instrução e julgamento.', '15 dias após a última diligência realizada.', '30 dias antes da prolação da sentença.', '20 dias antes da audiência de instrução e julgamento.'],
      correta: 3,
      comentario: 'CPC, art. 477, caput: <b>20 dias antes da audiência</b>. Os 10 dias referem-se à antecedência da intimação do perito ou assistente para comparecer à audiência (art. 477, §4º).',
    },
    {
      enunciado: 'Sobre o assistente técnico, de acordo com o CPC, assinale a opção correta.',
      alternativas: [
        'É de confiança da parte e não está sujeito a impedimento ou suspeição.',
        'É nomeado pelo juiz e deve atuar com a mesma imparcialidade do perito do juízo.',
        'Deve protocolar seu parecer antes da entrega do laudo do perito do juízo.',
        'Está sujeito às mesmas hipóteses de impedimento e suspeição do perito do juízo.',
      ],
      correta: 0,
      comentario: 'CPC, art. 466, §1º: os assistentes técnicos são de <b>confiança da parte</b> e <b>não</b> estão sujeitos a impedimento ou suspeição. O parecer vem <b>depois</b> do laudo, no prazo comum de 15 dias (art. 477, §1º).',
    },
    {
      enunciado: 'Considerando a NBC TP 01, as peças escritas elaboradas pelo perito do juízo e pelo assistente técnico denominam-se, respectivamente,',
      alternativas: ['parecer técnico-contábil e laudo pericial contábil.', 'termo de diligência e laudo pericial contábil.', 'laudo pericial contábil e parecer técnico-contábil.', 'relatório de auditoria e laudo arbitral.'],
      correta: 2,
      comentario: '<b>Laudo</b> pericial contábil = perito do juízo. <b>Parecer</b> técnico-contábil = assistente técnico. O termo de diligência é o instrumento para <b>solicitar</b> documentos e informações, não a peça final.',
    },
    {
      enunciado: 'Segundo a NBC TP 01, o procedimento pericial que consiste na determinação de valores, quantidades ou na solução de controvérsia por critério técnico-científico denomina-se',
      alternativas: ['vistoria.', 'indagação.', 'certificação.', 'arbitramento.'],
      correta: 3,
      comentario: '<b>Arbitramento</b>: determinar valores, quantidades ou resolver controvérsia por critério técnico-científico. Vistoria = constatar situação, coisa ou fato. Indagação = entrevista. Certificação = atestar a informação obtida na formação da prova pericial (NBC TP 01 (R2), item 35(j)).',
    },
    {
      enunciado: 'A perícia contábil, tanto a judicial como a extrajudicial, é de competência',
      alternativas: [
        'exclusiva de contador em situação regular perante o Conselho Regional de Contabilidade de sua jurisdição.',
        'de qualquer profissional da contabilidade, contador ou técnico em contabilidade, com registro ativo.',
        'de qualquer profissional de nível superior nomeado pelo juiz.',
        'exclusiva de contador com pós-graduação em perícia e registro no tribunal.',
      ],
      correta: 0,
      comentario: 'NBC TP 01: competência <b>exclusiva de contador</b> em situação regular no CRC. O DL 9.295/46 (arts. 25, c, e 26) inclui as perícias judiciais e extrajudiciais entre as atribuições privativas dos contadores. Técnico em contabilidade não faz perícia.',
    },
    {
      enunciado: 'Se o perito, por motivo justificado, não puder apresentar o laudo dentro do prazo, o juiz poderá conceder-lhe',
      alternativas: [
        'prorrogações sucessivas, cada uma pelo mesmo prazo originalmente fixado.',
        'prorrogação de 30 dias, improrrogável.',
        'por uma vez, prorrogação pela metade do prazo originalmente fixado.',
        'a nomeação automática de outro perito para concluir o trabalho.',
      ],
      correta: 2,
      comentario: 'CPC, art. 476: <b>uma única</b> prorrogação, pela <b>metade</b> do prazo original. Sem motivo legítimo, o perito pode ser substituído e multado, e o juiz comunica a corporação profissional (art. 468).',
    },
    {
      enunciado: 'O contador nomeado perito do juízo é amigo íntimo do autor da ação. À luz do CPC, essa situação caracteriza',
      alternativas: [
        'impedimento, por se tratar de hipótese objetiva prevista em lei.',
        'situação irrelevante, pois o perito presta compromisso de imparcialidade.',
        'impedimento técnico-científico.',
        'suspeição, que pode ser arguida pelas partes no prazo de 15 dias contados da intimação da nomeação.',
      ],
      correta: 3,
      comentario: 'Amizade íntima com a parte é hipótese de <b>suspeição</b> (art. 145, I), que vale também para o perito (art. 148). As partes a arguem em 15 dias (art. 465, §1º, I). Impedimento é objetivo (parentesco, ser parte). Impedimento técnico-científico é a falta de capacitação ou estrutura.',
    },
    {
      enunciado: 'Em ação de dissolução parcial de sociedade, sendo omisso o contrato social, o critério de apuração de haveres previsto no CPC (art. 606) é o valor patrimonial apurado em',
      alternativas: [
        'balanço patrimonial do último exercício, a valores contábeis históricos.',
        'balanço de determinação, na data da resolução, avaliando-se bens e direitos tangíveis e intangíveis e o passivo a preço de saída.',
        'fluxo de caixa descontado dos cinco exercícios seguintes à sentença.',
        'valor de mercado das quotas na data do trânsito em julgado da sentença.',
      ],
      correta: 1,
      comentario: 'CPC, art. 606: na omissão do contrato, vale o <b>balanço de determinação</b> na <b>data da resolução</b>, com ativos tangíveis e intangíveis e passivo a <b>preço de saída</b>. O balanço contábil comum não basta, porque usa valores históricos e ignora intangíveis não registrados.',
    },
  ],
  resumo: [
    'Perícia contábil: procedimentos técnico-científicos que levam provas à instância decisória, por laudo e/ou parecer (NBC TP 01).',
    'Exclusiva de contador regular no CRC. Tipos: judicial e extrajudicial (arbitral, oficial/estatal, voluntária).',
    'Perito do juízo: nomeado, imparcial, faz o laudo. Assistente técnico: da parte, sem impedimento ou suspeição processuais do CPC, mas sujeito às NBCs, faz o parecer.',
    'Partes: 15 dias da nomeação para quesitos, assistente e arguição. Perito: 5 dias para proposta, currículo e contatos.',
    'Honorários: partes falam em 5 dias, juiz arbitra, até 50% no início, redução se a perícia for inconclusiva.',
    'Diligências avisadas com 5 dias de antecedência. Termo de diligência = pedido formal de documentos e informações.',
    'Laudo pelo menos 20 dias antes da AIJ. Prorrogação: uma vez, metade do prazo.',
    'Após o laudo: 15 dias (manifestação e parecer), 15 dias (esclarecimentos), intimação para audiência com 10 dias.',
    'O juiz não está preso ao laudo (art. 479). A segunda perícia não substitui a primeira (art. 480).',
    'Informação inverídica por dolo ou culpa: indenização + inabilitação de 2 a 5 anos (art. 158).',
    'Apuração de haveres: data da resolução (art. 605). Contrato omisso → balanço de determinação a preço de saída (art. 606).',
  ],
};
