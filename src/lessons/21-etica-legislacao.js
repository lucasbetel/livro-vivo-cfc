// Lição 21 — Legislação e Ética Profissional. Demo: dilemas éticos (pentágono de ameaças e escada de sanções).
const AMEACAS = ['Interesse próprio', 'Autorrevisão', 'Defesa de interesse', 'Familiaridade', 'Intimidação'];
const SANCOES = ['Advertência ou censura (Código de Ética)', 'Multa', 'Suspensão do exercício', 'Cassação do exercício'];

const DILEMAS = [
  {
    tipo: 'ameaca', correta: 1,
    txt: 'A firma que fez a escrituração e elaborou as demonstrações contábeis da Cia. Beta é contratada para auditá-las no mesmo exercício.',
    exp: 'Quem avalia o próprio trabalho tende a não enxergar os próprios erros: <b>autorrevisão</b>. Para cliente de auditoria que seja entidade de interesse público, preparar os registros e as demonstrações é vedado (NBC PA 400).',
  },
  {
    tipo: 'pena', correta: 3,
    txt: 'Um contador ficou com o dinheiro que o cliente lhe entregou para pagar as guias de impostos.',
    exp: 'Apropriação indevida de valores de clientes confiados à sua guarda → <b>cassação</b> do exercício profissional, desde que homologada por 2/3 do Plenário do TSED (DL 9.295/46, art. 27, f).',
  },
  {
    tipo: 'ameaca', correta: 4,
    txt: 'O diretor financeiro avisa que vai trocar de contador se ele não aceitar lançar uma despesa deste ano no exercício seguinte.',
    exp: 'Pressão real, a ameaça de substituição, para aceitar um tratamento inadequado = <b>intimidação</b>.',
  },
  {
    tipo: 'pena', correta: 0,
    txt: 'Numa palestra, o contador contou detalhes financeiros confidenciais de um cliente, identificando-o, sem autorização.',
    exp: 'Quebra de sigilo é infração ao <b>Código de Ética</b> (NBC PG 01): advertência reservada, censura reservada ou censura pública, conforme a gravidade (DL 9.295/46, art. 27, g).',
  },
  {
    tipo: 'ameaca', correta: 0,
    txt: 'Os honorários de um único cliente representam quase metade da receita do escritório, e o sócio teme perdê-lo.',
    exp: 'Dependência financeira do cliente = <b>interesse próprio</b>: o medo de perder a receita pode influenciar o julgamento.',
  },
  {
    tipo: 'pena', correta: 1,
    txt: 'Uma pessoa sem registro no CRC anuncia e presta serviços de escrituração contábil.',
    exp: 'Exercer a profissão sem o registro exigido no art. 12 → <b>multa</b> de 1 a 10 vezes o valor da anuidade do exercício em curso (DL 9.295/46, art. 27, a).',
  },
  {
    tipo: 'ameaca', correta: 3,
    txt: 'O sócio responsável audita o mesmo cliente há muitos anos e é padrinho do filho do diretor financeiro.',
    exp: 'Relacionamento longo e próximo leva à simpatia excessiva = <b>familiaridade</b>. Salvaguardas típicas: rodízio do sócio e revisão por profissional não envolvido.',
  },
  {
    tipo: 'pena', correta: 2,
    txt: 'Após processo com ampla defesa, o CRC comprovou que o profissional tem incapacidade técnica no desempenho de suas funções (sem gravidade extrema).',
    exp: '<b>Suspensão</b> de 6 meses a 1 ano (DL 9.295/46, art. 27, e). Se a incapacidade técnica for de <b>natureza grave</b>, a lei prevê cassação (art. 27, f).',
  },
  {
    tipo: 'ameaca', correta: 2,
    txt: 'O auditor aceita representar o cliente numa disputa judicial com o Fisco e defende publicamente a posição da empresa.',
    exp: 'Promover a posição do cliente a ponto de comprometer a objetividade = <b>defesa de interesse</b>.',
  },
  {
    tipo: 'pena', correta: 2,
    txt: 'O profissional, na parte técnica sob sua responsabilidade, assinou documento falso e fez escrituração irregular no sentido de fraudar as rendas públicas.',
    exp: '<b>Suspensão</b> do exercício pelo período de <b>até 2 anos</b> (DL 9.295/46, art. 27, d). Atenção: se ficar comprovado crime contra a ordem econômica e tributária, a lei prevê cassação (art. 27, f).',
  },
];

function montarDilemas(el, kit) {
  const { h, INK, pen, ui } = kit;
  const caixa = h('div', {});
  const q = pen.quadro(caixa, { largura: 480, altura: 300 });
  const VERT = [[240, 52], [343, 127], [303, 247], [177, 247], [137, 127]];
  const ROT = [[240, 30, 'middle'], [380, 104, 'middle'], [292, 282, 'start'], [188, 282, 'end'], [100, 104, 'middle']];

  const desenharAmeacas = (certa, palpite) => {
    q.limpar();
    q.poligono(VERT, { cor: INK.lapis, animar: false });
    VERT.forEach(([x, y]) => q.linha(240, 160, x, y, { cor: INK.lapis, tracejado: true, animar: false }));
    VERT.forEach(([x, y], i) => {
      const ok = i === certa, erro = i === palpite && palpite !== certa;
      const cor = ok ? INK.verde : erro ? INK.vermelho : INK.azul;
      q.circulo(x, y, ok || erro ? 30 : 18, { cor, preenchimento: ok || erro ? cor : '#fffaf0', estilo: 'solid', animar: ok || erro });
      const [lx, ly, anc] = ROT[i];
      q.texto(lx, ly, AMEACAS[i], { ancora: anc, tamanho: 21, cor, peso: ok ? 700 : null, animar: false });
    });
  };

  const ROTULOS = [['Advertência', 'ou censura'], ['Multa'], ['Suspensão'], ['Cassação']];
  const SUB = ['NBC PG 01', 'em anuidades', 'por prazo', '2/3 do TSED'];
  const desenharSancoes = (certa, palpite) => {
    q.limpar();
    q.texto(14, 26, 'Escada de sanções', { cor: INK.lapis, tamanho: 21, animar: false });
    ROTULOS.forEach((linhas, i) => {
      const x = 14 + i * 116, w = 104, topo = 238 - (i + 1) * 44;
      const ok = i === certa, erro = i === palpite && palpite !== certa;
      const cor = ok ? INK.verde : erro ? INK.vermelho : INK.azul;
      q.retangulo(x, topo, w, 262 - topo, { cor, preenchimento: ok || erro ? cor : null, estilo: 'hachure', espaco: 7, animar: ok || erro });
      linhas.forEach((l, j) => q.texto(x + w / 2, topo - 10 - (linhas.length - 1 - j) * 20, l, { ancora: 'middle', tamanho: 20, cor, peso: ok ? 700 : null, animar: false }));
      q.texto(x + w / 2, topo + 24, SUB[i], { ancora: 'middle', tamanho: 15, cor: INK.lapis, fonte: 'texto', animar: false });
    });
    q.seta(14, 284, 466, 284, { cor: INK.lapis, animar: false });
    q.texto(466, 278, 'mais grave', { ancora: 'end', tamanho: 17, cor: INK.lapis, animar: false });
  };

  let n = 0, acertos = 0;
  const casoEl = h('p', { class: 'demo-fato' });
  const placar = h('span', { class: 'demo-placar' });
  const area = h('div', {});
  const msg = h('div', { class: 'demo-resultado', 'aria-live': 'polite' });
  const proximo = () => {
    area.innerHTML = '';
    if (n >= DILEMAS.length) {
      q.limpar();
      casoEl.innerHTML = `<b>Fim!</b> Você acertou ${acertos} de ${DILEMAS.length}. Ameaças vêm da NBC PG 100. Multa, suspensão e cassação vêm do art. 27 do DL 9.295/46. Advertência e censura vêm do Código de Ética.`;
      msg.textContent = 'Recomece para treinar de novo.';
      area.append(h('button', { class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; proximo(); } }, 'Recomeçar'));
      return;
    }
    const d = DILEMAS[n];
    const ehAmeaca = d.tipo === 'ameaca';
    casoEl.innerHTML = `<b>Dilema ${n + 1}/${DILEMAS.length} · ${ehAmeaca ? 'Qual ameaça aos princípios éticos?' : 'Que sanção a lei prevê?'}</b><br>${d.txt}`;
    placar.textContent = `acertos: ${acertos}`;
    msg.textContent = 'Dê seu palpite e veja o desenho marcar a resposta.';
    if (ehAmeaca) desenharAmeacas(-1, -1); else desenharSancoes(-1, -1);
    area.append(ui.botoes(ehAmeaca ? AMEACAS : SANCOES, (i, b, g) => {
      if (g.dataset.ok) return;
      g.dataset.ok = '1';
      [...g.children].forEach((x, j) => { x.disabled = true; if (j === d.correta) x.classList.add('certo'); });
      if (i === d.correta) acertos++; else b.classList.add('errado');
      placar.textContent = `acertos: ${acertos}`;
      if (ehAmeaca) desenharAmeacas(d.correta, i); else desenharSancoes(d.correta, i);
      msg.innerHTML = `<p class="${i === d.correta ? 'ok' : 'nok'}">${i === d.correta ? '✔ Isso!' : '✘ Não foi essa.'} ${d.exp}</p>`;
      n++;
      area.append(h('button', { class: 'btn-caneta primario', onclick: proximo }, n < DILEMAS.length ? 'Próximo dilema →' : 'Ver resultado'));
    }));
  };
  el.append(h('div', { class: 'demo-painel' }, h('div', { class: 'demo-linha' }, casoEl, placar), area, msg), caixa);
  proximo();
}

export default {
  id: '21-etica-legislacao',
  numero: 21,
  disciplina: 'Legislação e Ética Profissional',
  titulo: 'Ética profissional e legislação contábil',
  subtitulo: 'Código de Ética, ameaças, CFC/CRCs e as penalidades',
  incidencia: 'media',
  tempo: 50,
  pergunta: 'O CRC pode cassar o registro de um contador? Em que casos — e quem precisa confirmar?',
  previsao: {
    pergunta: 'Um contador elaborou as demonstrações contábeis de uma empresa e agora foi convidado para auditá-las. Que ameaça à ética aparece?',
    opcoes: ['Intimidação', 'Autorrevisão', 'Familiaridade'],
    correta: 1,
    explicacao: 'Ele teria de avaliar o <b>próprio trabalho</b>, e quem revisa o que fez tende a não ver os próprios erros: é a ameaça de <b>autorrevisão</b> (NBC PG 100). Intimidação é pressão para agir contra o julgamento. Familiaridade é relacionamento longo ou próximo demais.',
  },
  paginas: [
    {
      titulo: 'Ética, moral e o papel do contador',
      html: `<p><b>Ética</b> vem do grego <i>ethos</i> (morada, caráter, modo de ser). <b>Moral</b> vem do latim <i>mos/mores</i> (costumes). Na prova, a diferença é esta:</p>
<table class="tabela"><thead><tr><th>Ética</th><th>Moral</th></tr></thead><tbody>
<tr><td>ramo da <b>Filosofia</b>: reflexão teórica sobre os fundamentos do agir humano (“por que devo agir assim?”)</td><td>conjunto de <b>normas e costumes</b> vividos por um grupo (“o que se faz aqui”)</td></tr>
<tr><td>tende ao universal e ao permanente</td><td>varia com a <b>cultura</b>, o lugar e a época</td></tr>
<tr><td>teórica, reflexiva</td><td>prática, normativa</td></tr></tbody></table>
<p><b>Fontes das regras éticas:</b> a consciência individual, a família, a religião, os costumes da sociedade, as leis e os <b>códigos profissionais</b>.</p>
<p><b>Ética profissional</b> (deontologia) é o conjunto de deveres que orientam uma profissão. Na Contabilidade isso pesa mais: investidores, credores, governo e sociedade decidem com base na informação contábil. Por isso o contador atua no <mark>interesse público</mark>, e não só no interesse de quem o contrata.</p>
<div class="caixa alerta"><b>Pegadinha:</b> “a moral é a ciência que estuda a ética” está <b>invertido</b>. A ética é a reflexão sobre a moral. Também é falso dizer que ética “só existe quando imposta por lei”: lei e ética se cruzam, mas não se confundem.</div>
<aside class="nota">Sanção moral = reprovação social ou da consciência. Sanção ética profissional = aplicada pelo Conselho, com processo e direito de defesa.</aside>`,
    },
    {
      titulo: 'Código de Ética (NBC PG 01): deveres e sigilo',
      html: `<p>A <b>NBC PG 01 — Código de Ética Profissional do Contador</b> fixa a conduta do contador no exercício da atividade e nos assuntos ligados à profissão e à classe. Principais <b>deveres</b>:</p>
<ul class="lista-check">
<li>exercer a profissão com <b>zelo, diligência, honestidade e capacidade técnica</b>, observando as NBCs e a legislação, sem prejuízo da dignidade e da independência profissionais;</li>
<li><b>guardar sigilo</b> sobre o que souber em razão do exercício profissional, inclusive no serviço público;</li>
<li>comunicar ao cliente ou empregador, <b>em documento reservado</b>, circunstância adversa que possa influir na decisão dele;</li>
<li>inteirar-se de todas as circunstâncias <b>antes de emitir opinião</b>;</li>
<li>quando <b>substituído</b>, informar ao substituto os fatos que ele deve conhecer para bem exercer a função;</li>
<li>manifestar <b>imediatamente</b> a existência de impedimento para o exercício da profissão;</li>
<li>cooperar com os Conselhos de Contabilidade e cumprir as determinações deles;</li>
<li>cumprir a <b>educação profissional continuada</b>, quando obrigatória (NBC PG 12).</li></ul>
<div class="caixa"><b>Sigilo — as exceções:</b> o dever de sigilo vale “ressalvados os casos previstos em <b>lei</b> ou quando solicitado por <b>autoridades competentes</b>, entre estas os <b>Conselhos Federal e Regionais de Contabilidade</b>”. O CRC, ao fiscalizar, pode pedir informações: entregá-las não é quebra de sigilo.</div>
<div class="caixa alerta"><b>Pegadinha:</b> o sigilo <b>não termina</b> com o fim do contrato. E pedido de credor, concorrente ou jornalista não é exceção.</div>`,
    },
    {
      titulo: 'Vedações, honorários e relação com colegas',
      html: `<p><b>É vedado ao contador</b> (exemplos que caem):</p>
<ul class="lista-check">
<li><b>assinar</b> documentos ou peças contábeis elaborados por outrem <b>alheio à sua orientação, supervisão ou revisão</b>;</li>
<li><b>facilitar</b> o exercício da profissão a não habilitados ou impedidos;</li>
<li><b>reter abusivamente</b> livros, papéis ou documentos confiados à sua guarda;</li>
<li><b>recusar-se a prestar contas</b> de quantias que lhe foram confiadas, ou <b>apropriar-se indevidamente</b> de valores;</li>
<li><b>aconselhar</b> o cliente ou o empregador contra a lei, os Princípios de Contabilidade ou as NBCs;</li>
<li>receber provento que não decorra exclusivamente de sua <b>prática lícita</b>;</li>
<li>citar em publicação referência que <b>identifique o cliente</b>, quebrando o sigilo, salvo autorização;</li>
<li>intitular-se com <b>categoria profissional que não possui</b>, ou publicar como seu trabalho técnico do qual não participou.</li></ul>
<p><b>Honorários.</b> O valor dos serviços deve ser fixado <b>previamente, por contrato escrito</b>, considerando: relevância, vulto, complexidade, custos e dificuldade do serviço; tempo necessário; possibilidade de ficar impedido de fazer outros serviços; resultado lícito favorável ao contratante; se o cliente é eventual, habitual ou permanente; e o local da prestação.</p>
<div class="caixa">A NBC PG 01 veda a <b>mercantilização</b> na publicidade e exige observância das regras sobre concorrência desleal (itens 11–15). Honorário menor que o de outro profissional não é, por si só, antiético; um preço que inviabilize a execução conforme as normas cria ameaça à competência e ao zelo (PG 300, seção 330). O contador pode <b>transferir</b> o contrato a outro contador com <b>anuência do cliente, por escrito</b>. Na transferência <b>parcial</b> da execução, a responsabilidade técnica continua sendo dele.</div>
<p><b>Colegas:</b> a conduta se pauta por consideração, respeito, apreço e solidariedade. Mas solidariedade, mesmo de empregado, <b>não justifica conivência</b> com erro ou com infração ética ou legal.</p>`,
    },
    {
      titulo: 'Penalidades éticas e o julgamento',
      html: `<p>A transgressão do Código de Ética é sancionada, segundo a gravidade, com:</p>
<div class="formula">advertência reservada → censura reservada → censura pública</div>
<table class="tabela"><thead><tr><th>Atenuantes</th><th>Agravantes</th></tr></thead><tbody>
<tr><td>ação em defesa de prerrogativa profissional; ausência de punição ética anterior; prestação de relevantes serviços à Contabilidade; aplicação de salvaguardas</td><td>ato que denigra publicamente a imagem do profissional da contabilidade; punição ética anterior transitada em julgado; gravidade da infração</td></tr></tbody></table>
<p><b>Quem julga:</b> originariamente os <b>CRCs</b>, como <b>Tribunais Regionais de Ética e Disciplina (TRED)</b>. Cabe recurso ao <b>CFC</b>, como <b>Tribunal Superior de Ética e Disciplina (TSED)</b>, no prazo de <mark>15 dias úteis</mark> da intimação, por recurso voluntário (Res. CFC 1.603/2020, art. 61). O art. 10 do DL 1.040/69 atribui ao CFC a função de tribunal superior de ética; não fixa esse prazo.</p>
<ul class="lista-check"><li>O recurso <b>de ofício</b> é previsto para <b>suspensão e cassação</b>, abrangendo penas cumuladas pelo mesmo fato (Res. CFC 1.603/2020, art. 62). Censura pública isolada não integra essa lista.</li>
<li>O profissional atingido pública e injustamente no exercício da profissão pode pedir <b>desagravo público</b> ao CRC.</li></ul>
<div class="caixa alerta"><b>Não confunda:</b> advertência e censura são <b>penalidades éticas</b> (Código de Ética, art. 27, g, do DL 9.295/46). <b>Multa, suspensão e cassação</b> são penalidades <b>disciplinares</b> das alíneas a até f do mesmo art. 27. A FGV mistura as listas.</div>`,
    },
    {
      titulo: 'NBC PG 100, 200 e 300: princípios e ameaças',
      html: `<p>Convergidas ao Código do IESBA: a <b>NBC PG 100</b> traz a aplicação geral, os princípios e a estrutura conceitual. A <b>NBC PG 200</b> trata do contador <b>empregado</b> (que trabalha dentro da organização). A <b>NBC PG 300</b> trata do contador que <b>presta serviços</b> (externo).</p>
<table class="tabela"><thead><tr><th>Princípio fundamental</th><th>Em uma linha</th></tr></thead><tbody>
<tr><td><b>Integridade</b></td><td>ser franco e honesto em todas as relações profissionais</td></tr>
<tr><td><b>Objetividade</b></td><td>não deixar viés, conflito de interesses ou influência indevida comprometer o julgamento</td></tr>
<tr><td><b>Competência profissional e devido zelo</b></td><td>manter conhecimento atualizado e agir com diligência, conforme as normas</td></tr>
<tr><td><b>Confidencialidade</b></td><td>respeitar o sigilo das informações obtidas nas relações profissionais</td></tr>
<tr><td><b>Comportamento profissional</b></td><td>cumprir leis e regulamentos e evitar conduta que desacredite a profissão</td></tr></tbody></table>
<p><b>Estrutura conceitual:</b> o contador <b>identifica</b>, <b>avalia</b> e <b>trata</b> as ameaças, usando o teste do <b>terceiro razoável e bem informado</b>.</p>
<table class="tabela"><thead><tr><th>Ameaça</th><th>Exemplo</th></tr></thead><tbody>
<tr><td><b>Interesse próprio</b></td><td>dependência dos honorários de um cliente; interesse financeiro no cliente</td></tr>
<tr><td><b>Autorrevisão</b></td><td>avaliar trabalho que a própria firma fez (implantou o sistema e depois o audita)</td></tr>
<tr><td><b>Defesa de interesse</b></td><td>promover as ações do cliente; defendê-lo em litígio com terceiros</td></tr>
<tr><td><b>Familiaridade</b></td><td>relação longa com o cliente; parente próximo em cargo-chave do cliente</td></tr>
<tr><td><b>Intimidação</b></td><td>ameaça de demissão ou de substituição; pressão para aceitar tratamento contábil</td></tr></tbody></table>
<div class="caixa"><b>Tratamento:</b> (1) eliminar as circunstâncias que criam a ameaça; (2) aplicar <b>salvaguardas</b> que a reduzam a nível aceitável, como revisão por profissional não envolvido ou rodízio de pessoal; (3) recusar ou encerrar o trabalho. A PG 200 e a PG 300 também tratam de conflito de interesses, incentivos e presentes, e do descumprimento de leis e regulamentos pelo cliente ou empregador (NOCLAR).</div>`,
    },
    {
      titulo: 'Independência (NBC PA 400 e PO 900) e educação continuada (NBC PG 12)',
      html: `<p><b>Independência</b> é exigida em trabalhos de asseguração e está ligada à objetividade e à integridade. Ela tem duas faces: <b>independência de pensamento</b> (atitude mental) e <b>independência na aparência</b> (um terceiro bem informado não pode concluir que ela foi comprometida).</p>
<table class="tabela"><thead><tr><th>Norma</th><th>Alcance</th></tr></thead><tbody>
<tr><td><b>NBC PA 400</b></td><td>independência em trabalhos de <b>auditoria e revisão</b></td></tr>
<tr><td><b>NBC PO 900</b></td><td>independência em trabalhos de <b>asseguração diferentes</b> de auditoria e revisão (ex.: asseguração de relatório de sustentabilidade)</td></tr></tbody></table>
<ul class="lista-check"><li>vedado ter <b>interesse financeiro direto</b> no cliente de auditoria;</li>
<li>vedados <b>honorários contingentes</b> (condicionados ao resultado) no trabalho de auditoria;</li>
<li>o auditor não assume <b>responsabilidades da administração</b> do cliente;</li>
<li>em entidade de interesse público, não pode fazer a escrituração nem preparar as demonstrações que vai auditar;</li>
<li>presentes e hospitalidade, só se <b>triviais e irrelevantes</b>; há rodízio de sócios em entidades de interesse público.</li></ul>
<div class="caixa"><b>NBC PG 12 — Educação Profissional Continuada (EPC):</b> atividade formal, reconhecida pelo CFC, para manter, atualizar e expandir a competência técnica. É <b>obrigatória para grupos definidos na norma</b>, como auditores inscritos no CNAI, auditores e responsáveis técnicos de entidades reguladas (CVM, Banco Central, SUSEP) e peritos inscritos no CNPC. A NBC PG 12 (R5), aplicável desde 2026, exige em regra <b>40 pontos por ano-calendário</b>, com pelo menos <b>12 pontos em aquisição de conhecimento</b>; há hipóteses normativas de dispensa e redução excepcional fundamentada (pontuação: itens 6–7). Não cumprir a EPC é infração às normas profissionais e ao Código de Ética.</div>
<aside class="nota">Independência <b>não</b> é um dos cinco princípios fundamentais. Ela é exigência adicional para quem faz asseguração.</aside>`,
    },
    {
      titulo: 'DL 9.295/46: CFC, CRCs e o exercício da profissão',
      html: `<p>O <b>Decreto-Lei 9.295/46</b> criou o <b>Conselho Federal de Contabilidade</b> (sede em Brasília) e os <b>Conselhos Regionais</b> (um por estado e no DF). A fiscalização do exercício da profissão cabe ao CFC e aos CRCs. A Lei 12.249/2010 trouxe mudanças importantes.</p>
<table class="tabela"><thead><tr><th>CFC (art. 6º)</th><th>CRCs (art. 10)</th></tr></thead><tbody>
<tr><td>organizar seu regimento e aprovar os regimentos dos CRCs; dirimir dúvidas dos CRCs; <b>decidir em última instância</b> os recursos contra penalidades impostas pelos CRCs; <b>regular</b> os princípios contábeis, o <b>Exame de Suficiência</b>, o cadastro de qualificação técnica e a educação continuada; <b>editar as NBCs</b> técnicas e profissionais</td><td><b>registrar</b> os profissionais e expedir a carteira; <b>fiscalizar</b> o exercício da profissão, impedindo e punindo infrações; examinar reclamações e representações; publicar relatório anual; propor o próprio regimento ao CFC</td></tr></tbody></table>
<div class="caixa"><b>Art. 12:</b> só exerce a profissão quem concluiu o <b>bacharelado em Ciências Contábeis</b> reconhecido pelo MEC, foi <b>aprovado no Exame de Suficiência</b> e tem <b>registro no CRC</b>. Exercer sem registro é infração. Técnicos em contabilidade registrados, ou que se registraram até <b>1º/6/2015</b>, mantêm o direito ao exercício.</div>
<ul class="lista-check"><li><b>Art. 25:</b> trabalhos técnicos de contabilidade: organização e execução de serviços contábeis, escrituração, levantamento de balanços e demonstrações, perícias, revisão de balanços e de contas (auditoria), entre outros.</li>
<li><b>Art. 26:</b> perícias judiciais ou extrajudiciais, revisão de balanços e as demais atribuições da alínea c do art. 25 são <b>privativas dos contadores</b>.</li>
<li><b>Anuidade:</b> obrigatória para os registrados, paga até <b>31 de março</b> de cada ano (art. 21).</li>
<li><b>Exame de Suficiência:</b> regulamentado pelo CFC. A aprovação exige ao menos <b>50%</b> dos pontos (25 das 50 questões).</li></ul>`,
    },
    {
      titulo: 'Penalidades do art. 27, DL 1.040/69 e Regulamento Geral',
      html: `<p><b>DL 9.295/46, art. 27</b>, com redação da Lei 12.249/2010: penalidades ético-disciplinares.</p>
<table class="tabela"><thead><tr><th>Alínea</th><th>Penalidade</th><th>Quando</th></tr></thead><tbody>
<tr><td>a</td><td>multa de <b>1 a 10</b> anuidades</td><td>infração aos arts. 12 (exercer sem os requisitos ou sem registro) e 26 (privativas de contador)</td></tr>
<tr><td>b</td><td>multa de <b>1 a 10</b> anuidades (profissionais) e de <b>2 a 20</b> (empresas e organizações contábeis)</td><td>infração aos arts. 15 e 20 (organizações que exploram serviços contábeis)</td></tr>
<tr><td>c</td><td>multa de <b>1 a 5</b> anuidades</td><td>demais infrações sem penalidade especial</td></tr>
<tr><td>d</td><td><b>suspensão até 2 anos</b></td><td>falsidade de documentos que assinar e irregularidade de escrituração para <b>fraudar rendas públicas</b></td></tr>
<tr><td>e</td><td><b>suspensão de 6 meses a 1 ano</b></td><td><b>incapacidade técnica</b> comprovada, assegurada ampla defesa</td></tr>
<tr><td>f</td><td><b>cassação</b> do exercício profissional</td><td>incapacidade técnica <b>grave</b>; crime contra a ordem econômica e tributária; falsa prova de requisito para o registro; <b>apropriação indevida de valores de clientes</b>. Exige homologação por <mark>2/3 do Plenário do TSED</mark></td></tr>
<tr><td>g</td><td>advertência reservada, censura reservada e censura pública</td><td>casos previstos no Código de Ética</td></tr></tbody></table>
<p><b>DL 1.040/69:</b> dispõe sobre os Conselhos Federal e Regionais de Contabilidade e a eleição de seus membros. O art. 10 prevê a elaboração e aprovação do Código de Ética e o funcionamento do CFC como tribunal superior de ética profissional. Os procedimentos recursais são disciplinados pela Res. CFC 1.603/2020, e não por esse artigo. O CFC é composto por um representante efetivo de cada CRC, com suplente.</p>
<div class="caixa"><b>Resolução CFC 1.612/2021 — Regulamento Geral dos Conselhos de Contabilidade:</b> consolida a estrutura, a organização e o funcionamento do CFC e dos CRCs. Os Conselhos têm natureza autárquica, como pessoa jurídica de direito público que exerce o poder de polícia sobre a profissão. O CFC é o órgão normativo e a instância superior. Os CRCs executam o registro e a fiscalização. A administração é feita por órgãos colegiados (Plenário, Conselho Diretor, Câmaras especializadas) e pela Presidência.</div>`,
    },
  ],
  demo: {
    titulo: 'Experimento: dilemas éticos',
    instrucao: 'Leia cada dilema. Nos de ameaça, aponte qual das cinco ameaças da NBC PG 100 aparece; nos de sanção, escolha a penalidade prevista. O pentágono e a escada de sanções marcam a resposta.',
    montar: montarDilemas,
  },
  macetes: [
    'Penalidades <b>éticas</b> (Código): <b>A</b>dvertência reservada, <b>C</b>ensura reservada, <b>C</b>ensura pública. As <b>disciplinares</b> do art. 27 são Multa, Suspensão e Cassação.',
    'Cassação só vale com homologação de <b>2/3 do TSED</b> (Plenário do CFC).',
    'Suspensão: <b>até 2 anos</b> (falsidade para fraudar rendas públicas) × <b>6 meses a 1 ano</b> (incapacidade técnica).',
    'Ameaças <b>“I-A-D-F-I”</b>: Interesse próprio, Autorrevisão, Defesa de interesse, Familiaridade, Intimidação.',
    'Princípios <b>“I-O-C-C-C”</b>: Integridade, Objetividade, Competência e zelo, Confidencialidade, Comportamento profissional. Independência <b>não</b> entra na lista.',
    'Recurso voluntário ao CFC: <b>15 dias úteis</b> da intimação (Res. 1.603/2020, art. 61). Suspensão e cassação → recurso <b>de ofício</b> (art. 62).',
    'Art. 12: <b>bacharelado + Exame de Suficiência + registro no CRC</b>.',
    'Sigilo cede à <b>lei</b> e às <b>autoridades competentes</b>, inclusive o CRC.',
  ],
  questoes: [
    {
      enunciado: 'Nos termos do Código de Ética Profissional do Contador (NBC PG 01), as penalidades aplicáveis pela transgressão de seus preceitos são:',
      alternativas: [
        'multa, suspensão do exercício profissional e cassação.',
        'advertência reservada, censura reservada e censura pública.',
        'advertência pública, multa e censura reservada.',
        'advertência verbal, suspensão temporária e exclusão do quadro.',
      ],
      correta: 1,
      comentario: 'O Código de Ética prevê <b>advertência reservada, censura reservada e censura pública</b>, conforme a gravidade. Multa, suspensão e cassação são penalidades <b>disciplinares</b> do art. 27 do DL 9.295/46, alíneas a até f.',
    },
    {
      enunciado: 'Um escritório de contabilidade elaborou as demonstrações contábeis da Cia. Beta e, em seguida, foi convidado a auditá-las. Segundo a estrutura conceitual da NBC PG 100, a ameaça predominante aos princípios fundamentais é a de',
      alternativas: ['intimidação.', 'familiaridade.', 'autorrevisão.', 'defesa de interesse.'],
      correta: 2,
      comentario: 'A firma teria de avaliar o <b>próprio trabalho</b>: ameaça de <b>autorrevisão</b>. Intimidação envolve pressão. Familiaridade envolve relação longa ou próxima. Defesa de interesse envolve promover a posição do cliente.',
    },
    {
      enunciado: 'O diretor financeiro de um cliente informa ao contador que irá substituí-lo caso ele não concorde com um tratamento contábil inadequado. De acordo com a NBC PG 100, trata-se de ameaça de',
      alternativas: ['interesse próprio.', 'autorrevisão.', 'familiaridade.', 'intimidação.'],
      correta: 3,
      comentario: 'Pressão real ou aparente que dissuade o contador de agir com objetividade, como a ameaça de substituição por divergência contábil, é <b>intimidação</b>.',
    },
    {
      enunciado: 'Conforme o art. 27 do Decreto-Lei 9.295/46, a cassação do exercício profissional aplica-se, entre outras hipóteses, à apropriação indevida de valores de clientes confiados à guarda do profissional, desde que homologada por',
      alternativas: [
        '2/3 do Plenário do Tribunal Superior de Ética e Disciplina.',
        'maioria simples do Plenário do Conselho Regional de Contabilidade.',
        'unanimidade do Conselho Diretor do CFC.',
        'decisão judicial transitada em julgado.',
      ],
      correta: 0,
      comentario: 'Art. 27, f: cassação nos casos de incapacidade técnica grave, crime contra a ordem econômica e tributária, falsa prova de requisito para o registro e apropriação indevida de valores de clientes, <b>desde que homologada por 2/3 do Plenário do TSED</b>.',
    },
    {
      enunciado: 'O profissional com comprovada incapacidade técnica no desempenho de suas funções, a critério do CRC e assegurada ampla defesa, está sujeito, conforme o DL 9.295/46, à suspensão do exercício da profissão pelo prazo de',
      alternativas: ['até 30 dias.', 'até 2 anos.', '6 meses a 1 ano.', '1 a 5 anos.'],
      correta: 2,
      comentario: 'Art. 27, e: suspensão de <b>6 meses a 1 ano</b>. A suspensão de “até 2 anos” é da alínea d (falsidade de documentos e escrituração irregular para fraudar rendas públicas). Incapacidade técnica <b>grave</b> leva à cassação (alínea f).',
    },
    {
      enunciado: 'Segundo o Decreto-Lei 9.295/46, com a redação dada pela Lei 12.249/2010, para novo registro na categoria de contador, ressalvados os direitos adquiridos previstos em lei, é necessário',
      alternativas: [
        'bacharelado em Ciências Contábeis ou curso técnico em contabilidade, e registro no CRC.',
        'apenas a aprovação no Exame de Suficiência, independentemente de formação.',
        'registro no CFC e filiação ao sindicato da categoria.',
        'conclusão do bacharelado em Ciências Contábeis reconhecido pelo MEC, aprovação em Exame de Suficiência e registro no CRC.',
      ],
      correta: 3,
      comentario: 'Art. 12: <b>bacharelado</b> reconhecido pelo MEC + <b>Exame de Suficiência</b> + <b>registro no CRC</b>. O curso técnico só garante o direito a quem se registrou até 1º/6/2015. O registro é no CRC, não no CFC.',
    },
    {
      enunciado: 'Quanto ao sigilo profissional, a NBC PG 01 estabelece que o contador deve guardar sigilo sobre o que souber em razão do exercício profissional, ressalvados',
      alternativas: [
        'os casos previstos em lei ou quando solicitado por autoridades competentes, entre estas os Conselhos Regionais de Contabilidade.',
        'os pedidos de informação formulados por credores do cliente.',
        'as informações de clientes cujo contrato já tenha sido encerrado.',
        'os casos em que a divulgação traga benefício financeiro ao profissional.',
      ],
      correta: 0,
      comentario: 'As exceções são os casos previstos em <b>lei</b> e as solicitações de <b>autoridades competentes</b>, entre elas os <b>CRCs</b>. O sigilo continua depois do fim do contrato, e credores não são autoridade competente.',
    },
    {
      enunciado: 'Assinale a opção que distingue corretamente ética e moral.',
      alternativas: [
        'Ética e moral são sinônimos perfeitos, sem distinção conceitual.',
        'A ética é a reflexão filosófica sobre os fundamentos do agir humano; a moral é o conjunto de normas e costumes vividos por um grupo, em determinado tempo e lugar.',
        'A moral é universal e imutável, enquanto a ética varia conforme a cultura de cada povo.',
        'A ética só existe quando há lei escrita que a imponha.',
      ],
      correta: 1,
      comentario: '<b>Ética</b> = reflexão teórica e filosófica sobre a conduta. <b>Moral</b> = normas e costumes praticados, que variam com a cultura e a época. A alternativa C inverte os conceitos, e a D confunde ética com direito.',
    },
    {
      enunciado: 'Das decisões dos Conselhos Regionais de Contabilidade, na condição de Tribunais Regionais de Ética e Disciplina, cabe recurso ao CFC, na condição de Tribunal Superior de Ética e Disciplina,',
      alternativas: [
        'no prazo de 30 dias, sem efeito suspensivo.',
        'no prazo de 5 dias, apenas com efeito devolutivo.',
        'no prazo de 15 dias úteis da intimação, por recurso voluntário.',
        'somente quando a penalidade aplicada for a de cassação.',
      ],
      correta: 2,
      comentario: 'Res. CFC 1.603/2020, art. 61: cabe recurso voluntário em <b>15 dias úteis da intimação</b>, entregue ao órgão que proferiu a decisão e remetido ao CFC. O art. 10 do DL 1.040/69 estabelece a função de tribunal superior de ética do CFC, mas não esse prazo. Não se restringe à cassação.',
    },
    {
      enunciado: 'NÃO é um dos princípios fundamentais de ética previstos na NBC PG 100:',
      alternativas: ['integridade.', 'objetividade.', 'confidencialidade.', 'independência.'],
      correta: 3,
      comentario: 'Os cinco princípios são integridade, objetividade, competência profissional e devido zelo, confidencialidade e comportamento profissional. A <b>independência</b> é exigência adicional para trabalhos de asseguração (NBC PA 400 e PO 900) e não está entre os princípios fundamentais.',
    },
  ],
  resumo: [
    'Ética = reflexão filosófica sobre a conduta. Moral = normas e costumes de um grupo, que variam com tempo e lugar.',
    'NBC PG 01: zelo, diligência, honestidade e capacidade técnica. Sigilo, salvo lei ou autoridade competente (inclusive o CRC).',
    'Vedado: assinar trabalho alheio à sua supervisão, reter documentos, aconselhar contra a lei, mercantilizar a publicidade ou praticar concorrência desleal.',
    'Honorários fixados previamente por contrato escrito. Transferência do contrato só com anuência do cliente, por escrito.',
    'Penalidades éticas: advertência reservada, censura reservada e censura pública. Julga o CRC (TRED), com recurso voluntário ao CFC (TSED) em 15 dias úteis da intimação (Res. 1.603/2020, art. 61).',
    'Princípios (PG 100): integridade, objetividade, competência e zelo, confidencialidade e comportamento profissional.',
    'Ameaças: interesse próprio, autorrevisão, defesa de interesse, familiaridade e intimidação. Respostas: eliminar, salvaguardas ou recusar.',
    'PA 400: independência em auditoria e revisão. PO 900: outros trabalhos de asseguração. PG 12: EPC obrigatória para grupos definidos.',
    'DL 9.295/46, art. 12: bacharelado + Exame de Suficiência + registro no CRC. Perícia e auditoria são privativas de contador (art. 26).',
    'Art. 27: multas em anuidades; suspensão até 2 anos (fraude a rendas públicas) ou de 6 meses a 1 ano (incapacidade técnica); cassação com 2/3 do TSED.',
    'DL 1.040/69: conselhos e eleições, julgamento ético. Res. CFC 1.612/2021: Regulamento Geral dos Conselhos.',
  ],
};
