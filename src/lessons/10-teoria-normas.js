const RODADAS = [
  [
    "Informação pode alterar a decisão de um credor. Qual característica?",
    [
      "Relevância",
      "Comparabilidade",
      "Tempestividade"
    ],
    0,
    "Capacidade de fazer diferença na decisão é relevância, fundamental.",
    "Decisão do credor"
  ],
  [
    "Relato completo, neutro e sem erro no processo.",
    [
      "Verificabilidade",
      "Representação fidedigna",
      "Compreensibilidade"
    ],
    1,
    "Os três atributos compõem representação fidedigna, fundamental.",
    "Completa e neutra"
  ],
  [
    "Métodos consistentes ajudam comparar períodos.",
    [
      "Materialidade",
      "Custo",
      "Comparabilidade"
    ],
    2,
    "Consistência apoia comparabilidade, característica de melhoria.",
    "Comparar períodos"
  ],
  [
    "Observadores independentes conferem os mesmos dados.",
    [
      "Verificabilidade",
      "Relevância",
      "Tempestividade"
    ],
    0,
    "Conferência direta ou indireta: verificabilidade.",
    "Conferir dados"
  ],
  [
    "Relatório chega antes da decisão.",
    [
      "Neutralidade",
      "Tempestividade",
      "Prudência"
    ],
    1,
    "Informação a tempo de influenciar a decisão.",
    "Chegar a tempo"
  ],
  [
    "Informação complexa apresentada de forma clara.",
    [
      "Custo",
      "Comparabilidade",
      "Compreensibilidade"
    ],
    2,
    "Clareza sem excluir complexidade relevante.",
    "Clareza"
  ],
  [
    "NBC PP: em qual família?",
    [
      "Profissional",
      "Técnica geral",
      "Divulgação climática"
    ],
    0,
    "PP é profissional do perito; TP é técnica de perícia.",
    "NBC PP"
  ],
  [
    "NBC TG 03: qual família?",
    [
      "Profissional",
      "Técnica geral",
      "Interpretação"
    ],
    1,
    "TG = técnica geral; 03 trata de fluxos de caixa.",
    "NBC TG 03"
  ],
  [
    "ITG: qual tipo de documento?",
    [
      "Comunicado técnico",
      "Norma profissional",
      "Interpretação técnica geral"
    ],
    2,
    "ITG detalha aplicação; CTG é comunicado técnico geral.",
    "ITG"
  ],
  [
    "NBC TDS 02 focaliza:",
    [
      "Divulgações sobre clima",
      "Cálculo de dividendos",
      "Auditoria interna"
    ],
    0,
    "A TDS 02 trata de riscos e oportunidades climáticos e suas divulgações.",
    "NBC TDS 02"
  ]
];
function montarOficina(el, kit) {
  const { h, ui } = kit;
  let n = 0, acertos = 0;
  const pergunta = h('p'), area = h('div'), resultado = h('div', { class: 'demo-resultado', 'aria-live': 'polite' }), historico = h('div');
  const linhas = [];
  function mostrar() {
    area.replaceChildren();
    if (n === RODADAS.length) {
      pergunta.textContent = 'Concluído: ' + acertos + '/' + RODADAS.length + ' acertos. Confira sua montagem abaixo.';
      area.append(h('button', { class: 'btn-caneta', onclick: () => { n = 0; acertos = 0; linhas.length = 0; historico.replaceChildren(); resultado.textContent = ''; mostrar(); } }, 'Recomeçar')); return;
    }
    const r = RODADAS[n]; pergunta.textContent = (n + 1) + '/' + RODADAS.length + ' — ' + r[0];
    area.append(ui.botoes(r[1], (i, b, grupo) => {
      if (grupo.dataset.respondido) return; grupo.dataset.respondido = '1';
      [...grupo.children].forEach(x => { x.disabled = true; });
      if (i === r[2]) acertos++;
      resultado.textContent = (i === r[2] ? 'Acertou! ' : 'Confira o raciocínio: ') + r[3];
      linhas.push([r[4], r[1][r[2]]]); historico.replaceChildren(ui.tabela(['Item montado', 'Classificação / valor correto'], linhas));
      n++; area.append(h('button', { class: 'btn-caneta', onclick: mostrar }, n === RODADAS.length ? 'Ver placar' : 'Continuar'));
    }));
  }
  el.append(h('div', { class: 'demo-painel' }, pergunta, area, resultado), historico); mostrar();
}

export default {
  "id": "10-teoria-normas",
  "numero": 10,
  "disciplina": "Teoria da Contabilidade",
  "titulo": "Estrutura conceitual e as NBCs",
  "subtitulo": "O raciocínio por trás das contas e o mapa das normas",
  "incidencia": "alta",
  "tempo": 65,
  "pergunta": "Uma estimativa pode ser fidedigna mesmo sem acertar exatamente o futuro?",
  "previsao": {
    "pergunta": "Uma estimativa foi feita com método adequado, premissas neutras e incerteza explicada. Ela pode representar fielmente o fenômeno?",
    "opcoes": [
      "Não, estimativas sempre contêm erro",
      "Sim, livre de erro não exige precisão absoluta da estimativa",
      "Somente se for igual ao valor pago depois"
    ],
    "correta": 1,
    "explicacao": "Livre de erro se refere à descrição e ao processo aplicado adequadamente. Incerteza de mensuração não invalida automaticamente uma estimativa."
  },
  "paginas": [
    {
      "titulo": "Para quem e para que existe o relatório?",
      "html": "<p>A NBC TG Estrutura Conceitual, correspondente ao CPC 00 (R2), orienta o relatório financeiro de propósito geral. Seu objetivo é fornecer informação útil a investidores, credores por empréstimos e outros credores, atuais e potenciais, nas decisões de fornecer recursos. Inclui avaliar a administração dos recursos pela gestão.</p><p>Esses usuários precisam conhecer recursos econômicos, reivindicações contra a entidade e mudanças. A contabilidade por competência informa efeitos das transações quando ocorrem; a informação de caixa complementa essa visão. O relatório não pretende informar sozinho o valor exato da empresa nem atender exclusivamente ao fisco.</p><p>A <b>entidade que reporta</b> pode ser uma pessoa jurídica, parte dela ou conjunto de entidades. Seu limite precisa produzir informação útil e não ser arbitrário. A premissa de <b>continuidade</b> pressupõe operação no futuro previsível, sem intenção ou necessidade de liquidar ou cessar atividades; caso contrário, outra base pode ser necessária, com explicação.</p><div class=\"exemplo\">Serviço de 12.000 prestado em dezembro e recebido em janeiro, atendidos os critérios da norma aplicável: receita e recebível em dezembro; caixa em janeiro. A competência explica desempenho antes do recebimento.</div><div class=\"caixa alerta\">A Estrutura Conceitual não é norma que prevalece sobre uma NBC específica. Ela auxilia desenvolvimento, interpretação e escolhas quando não há regra diretamente aplicável.</div>"
    },
    {
      "titulo": "Duas características fundamentais",
      "html": "<p><b>Relevância</b>: capacidade de fazer diferença em decisões, por valor preditivo, confirmatório ou ambos. <b>Materialidade</b> é um aspecto da relevância específico da entidade, avaliado por natureza, magnitude ou ambas. Não existe percentual universal que resolva todos os casos.</p><p><b>Representação fidedigna</b>: informação completa, neutra e livre de erro. Completa contém o necessário para compreender; neutra não é orientada a favorecer um resultado; livre de erro significa processo e descrição adequados, sem prometer exatidão absoluta de estimativas.</p><p>Prudência é cautela ao julgar sob incerteza e apoia neutralidade. Não autoriza subavaliar deliberadamente ativos ou superavaliar passivos. A substância econômica deve ser representada: forma jurídica isolada pode ser insuficiente.</p><div class=\"exemplo\">Erro de 1.000 sobre lucro de 10.000 representa 10%; sobre lucro de 1.000.000, 0,1%. Esses cálculos ajudam, mas uma transação de pequeno valor com administrador pode ser material pela natureza. Avalie o contexto.</div><div class=\"caixa alerta\">FGV: trocar “relevância” por “comparabilidade” na lista de fundamentais é armadilha. Estimativa bem descrita pode ser fidedigna mesmo que o futuro difira.</div>"
    },
    {
      "titulo": "Quatro características de melhoria e a restrição de custo",
      "html": "<table class=\"tabela\"><tr><th>Característica</th><th>Pergunta prática</th></tr><tr><td>Comparabilidade</td><td>Consigo identificar semelhanças e diferenças entre entidades ou períodos?</td></tr><tr><td>Verificabilidade</td><td>Observadores independentes e conhecedores podem chegar a consenso razoável?</td></tr><tr><td>Tempestividade</td><td>A informação chega a tempo de influenciar decisões?</td></tr><tr><td>Compreensibilidade</td><td>Foi classificada e apresentada com clareza a usuários diligentes?</td></tr></table><p>Consistência é usar os mesmos métodos para itens semelhantes; ajuda a comparabilidade, mas não é seu sinônimo. Comparabilidade não exige tratar coisas diferentes como iguais. Verificar pode ser direto, como contar caixa, ou indireto, conferindo entradas e método de um cálculo.</p><p>Não se exclui fenômeno complexo relevante só para tornar o relatório fácil. As melhorias não consertam informação irrelevante ou representação inadequada. A <b>restrição de custo</b> exige que os benefícios da informação justifiquem os custos de produzi-la e utilizá-la.</p><div class=\"exemplo\">Dois avaliadores recalculam valor presente com os mesmos fluxos e taxa e obtêm 10.000: verificabilidade do processo. Publicar o cálculo meses depois da decisão pode comprometer a tempestividade.</div><div class=\"caixa alerta\">Relatório bonito e rápido, mas incompleto ou tendencioso, não se torna útil só pelas características de melhoria.</div>"
    },
    {
      "titulo": "Elementos: recursos, obrigações e desempenho",
      "html": "<p><b>Ativo</b> é recurso econômico presente controlado em decorrência de eventos passados. Recurso econômico é direito com potencial de produzir benefícios. <b>Passivo</b> é obrigação presente de transferir recurso econômico decorrente de eventos passados; a entidade não tem capacidade prática de evitar a transferência. <b>PL</b> é o interesse residual nos ativos após deduzir passivos.</p><p><b>Receitas</b> aumentam ativos ou reduzem passivos, elevando o PL, exceto contribuições dos proprietários nessa condição. <b>Despesas</b> reduzem ativos ou elevam passivos, diminuindo o PL, exceto distribuições aos proprietários.</p><div class=\"exemplo\">Ativo 150.000 e passivo 90.000 → PL 60.000. Aporte de 20.000 eleva ativo e PL a 170.000 e 80.000: não é receita. Serviço prestado por 5.000, atendida a NBC aplicável, eleva recebível e lucro. Dividendo de 3.000 reconhecido como obrigação reduz PL: não é despesa.</div><p>Propriedade jurídica não é requisito universal de ativo: controle do direito é essencial. Ganhos e perdas se enquadram nas definições de receitas e despesas; não formam novos elementos fundamentais.</p><div class=\"caixa alerta\">Na definição atual, não substitua “potencial” por certeza de benefício. Probabilidade baixa pode afetar reconhecimento e mensuração, mas não elimina automaticamente a existência do direito.</div>"
    },
    {
      "titulo": "Reconhecimento, baixa e mensuração",
      "html": "<p><b>Reconhecer</b> é incluir um item nas demonstrações, em palavras e valor monetário, conectando-o aos totais. Atender à definição é necessário, mas o reconhecimento também deve fornecer informação relevante e representação fidedigna, considerando o custo. A Estrutura atual não impõe um único teste mecânico de probabilidade para todos os itens; normas específicas podem fixar critérios.</p><p><b>Desreconhecer</b> é retirar total ou parcialmente ativo ou passivo reconhecido, normalmente quando se perde controle do ativo ou deixa de existir obrigação presente. O objetivo é representar os itens retidos e a mudança ocorrida; venda formal sem transferência substantiva exige análise.</p><table class=\"tabela\"><tr><th>Base</th><th>Ideia</th></tr><tr><td>Custo histórico</td><td>Valor da transação, atualizado por consumo, pagamentos, juros e perdas pertinentes.</td></tr><tr><td>Valor justo</td><td>Preço de saída em transação ordenada entre participantes do mercado.</td></tr><tr><td>Valor em uso / cumprimento</td><td>Valor presente específico da entidade para benefícios do ativo / recursos para cumprir passivo.</td></tr><tr><td>Custo corrente</td><td>Custo atual de ativo equivalente ou contraprestação por passivo equivalente.</td></tr></table><div class=\"exemplo\">Fluxo único estimado de 12.100 em dois anos e taxa de 10%: VP = 12.100 ÷ 1,1² = <b>10.000</b>. A conta de desconto sozinha não diz se é valor justo ou em uso: isso depende das premissas e do objetivo da medida.</div><div class=\"caixa alerta\">Custo histórico não significa valor congelado para sempre. Apresentação e notas não substituem reconhecimento quando a norma o exige.</div>"
    },
    {
      "titulo": "Manutenção de capital: o que precisa ser preservado?",
      "html": "<p>No conceito <b>financeiro</b>, capital equivale aos ativos líquidos/PL. Há lucro se os ativos líquidos finais superarem os iniciais, excluídos aportes e distribuições. A medida pode usar unidades monetárias nominais ou poder aquisitivo constante.</p><div class=\"exemplo\">PL inicial 100.000; final 140.000; aporte 20.000; dividendos 5.000. Lucro pela manutenção financeira nominal = 140.000 − 100.000 − 20.000 + 5.000 = <b>25.000</b>.</div><p>Sem aportes/distribuições, com capital inicial 100.000 e inflação de 10%, preservar poder aquisitivo exige 110.000. Se o capital final é 125.000, excedente em poder aquisitivo constante = <b>15.000</b>; nominal = 25.000.</p><p>No conceito <b>físico</b>, preserva-se capacidade operacional/produtiva. A manutenção de capital físico requer custo corrente como base de mensuração. A escolha influencia a separação entre retorno do capital e retorno sobre o capital.</p><div class=\"exemplo\">Para manter a mesma capacidade produtiva, o conjunto de recursos que custava 100.000 agora exige 120.000. Se os recursos finais disponíveis são 125.000, sem aportes/distribuições e nas premissas simplificadas, o excedente sobre a capacidade preservada é <b>5.000</b>.</div><div class=\"caixa alerta\">Capital físico não é contar dinheiro nem simplesmente corrigir pelo índice geral de preços: o foco é capacidade produtiva.</div>"
    },
    {
      "titulo": "Mapa das NBCs: profissionais e técnicas",
      "html": "<p>A Resolução CFC 1.328/2011 organiza as NBCs em profissionais e técnicas. As primeiras orientam exercício profissional; as segundas, conceitos e procedimentos. A sigla identifica a família, não uma escala de importância.</p><table class=\"tabela\"><tr><th>Profissionais</th><th>Campo</th></tr><tr><td>PG</td><td>Geral</td></tr><tr><td>PA</td><td>Auditor independente</td></tr><tr><td>PI</td><td>Auditor interno, na estrutura da resolução</td></tr><tr><td>PP</td><td>Perito contábil</td></tr><tr><td>PO</td><td>Ex.: PO 900, independência em asseguração diferente de auditoria e revisão</td></tr></table><p>Técnicas: <b>TG</b> geral; <b>TSP</b> setor público; <b>TA</b> auditoria independente de informação histórica; <b>TR</b> revisão de informação histórica; <b>TO</b> asseguração de informação não histórica; <b>TSC</b> serviços correlatos; <b>TI</b> auditoria interna; <b>TP</b> perícia; <b>TDS</b> divulgação de sustentabilidade. Há também famílias específicas, como TASP e TAS.</p><p><b>ITG</b> é interpretação técnica geral; <b>CTG</b>, comunicado técnico geral. Interpretações detalham aplicação; comunicados esclarecem questões técnicas específicas. Não trate esses documentos como sugestões sem efeito normativo. Pronunciamentos CPC são incorporados às NBCs pelo CFC; CPC não é o Conselho Federal.</p><div class=\"caixa alerta\">PP orienta o profissional perito; TP, o trabalho de perícia. PI e TI também não são sinônimos. Consulte a redação e vigência aplicáveis ao corte do edital.</div><p>Fontes: <a href=\"https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/\">estrutura das NBCs</a>; <a href=\"https://crcpi.org.br/wp-content/uploads/2025/05/Guia-do-Profissional-da-Contabilidade-CRCPI-1.pdf\">Resolução 1.328/11 no guia oficial do CRCPI</a>; <a href=\"https://portalrestore.cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/nbc-pa-do-auditor-independente/\">NBC PO 900</a>.</p>"
    },
    {
      "titulo": "Sustentabilidade e clima: informação financeira conectada",
      "html": "<p>A <b>NBC TDS 01</b> define requisitos gerais de divulgação financeira relacionada à sustentabilidade. O foco são riscos e oportunidades com expectativa razoável de afetar perspectivas da entidade: fluxos de caixa, acesso a financiamento ou custo de capital. Não é somente relatório de ações sociais.</p><p>A <b>NBC TDS 02</b> trata do clima: riscos físicos, riscos de transição e oportunidades. As informações se organizam em governança, estratégia, gerenciamento de riscos e métricas e metas. A conexão com as demonstrações e a consistência de premissas ajudam o usuário a entender efeitos financeiros.</p><div class=\"exemplo\">Uma fábrica exposta a enchentes identifica possível paralisação: risco físico. Mudança de tecnologia e de demanda por produtos intensivos em carbono envolve transição. Se uma análise hipotética usa impacto de 200.000 com probabilidade de 10%, o valor ponderado é 20.000; esse cálculo isolado <b>não autoriza reconhecer provisão</b>. O reconhecimento segue a NBC aplicável, enquanto a divulgação avalia materialidade e requisitos das TDS.</div><p>A TDS 02 inclui métricas climáticas, como emissões de gases de efeito estufa por escopos, observadas suas regras e dispensas de transição. Divulgação não equivale a asseguração: normas para o trabalho de asseguração têm outro objeto.</p><div class=\"caixa alerta\">Na prova, TDS 01 = requisitos gerais; TDS 02 = clima. Não confunda divulgar risco com registrar automaticamente uma despesa ou passivo.</div><p>Fontes: <a href=\"https://cfc.org.br/wp-content/uploads/2024/10/NBC-TDS-01.pdf\">NBC TDS 01</a> e <a href=\"https://cfc.org.br/wp-content/uploads/2024/10/NBC-TDS-02.pdf\">NBC TDS 02</a>. Estrutura Conceitual: <a href=\"https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/normas-completas/\">catálogo oficial do CFC</a>.</p>"
    }
  ],
  "macetes": [
    "Fundamentais: relevância + representação fidedigna.",
    "Fidedigna: completa, neutra, livre de erro.",
    "Melhoria: compare, verifique, chegue a tempo e compreenda.",
    "Materialidade depende de natureza e magnitude no contexto.",
    "Prudência não é pessimismo deliberado.",
    "Aporte não é receita; dividendo não é despesa.",
    "Capital financeiro preserva valor; físico preserva capacidade.",
    "PG/PA/PI/PP/PO: profissionais; TG/TA/TP/TDS: técnicas."
  ],
  "questoes": [
    {
      "enunciado": "As características qualitativas fundamentais são:",
      "alternativas": [
        "Comparabilidade e tempestividade.",
        "Verificabilidade e neutralidade.",
        "Relevância e representação fidedigna.",
        "Compreensibilidade e custo."
      ],
      "correta": 2,
      "comentario": "Relevância e representação fidedigna são fundamentais. Comparabilidade, verificabilidade, tempestividade e compreensibilidade são de melhoria."
    },
    {
      "enunciado": "Uma estimativa usa processo adequado, premissas neutras e explica incertezas. O valor final realizado difere do previsto. Isso significa que:",
      "alternativas": [
        "Toda estimativa viola a Estrutura Conceitual.",
        "A informação era necessariamente irrelevante.",
        "Houve obrigatoriamente erro contábil.",
        "A diferença, isoladamente, não prova falta de representação fidedigna."
      ],
      "correta": 3,
      "comentario": "Livre de erro não exige previsão perfeita. Avaliam-se método, descrição, premissas e informações disponíveis quando a estimativa foi feita."
    },
    {
      "enunciado": "Manter o mesmo método para itens semelhantes ao longo do tempo contribui diretamente para:",
      "alternativas": [
        "Comparabilidade.",
        "Aumento do lucro.",
        "Materialidade automática.",
        "Eliminação de estimativas."
      ],
      "correta": 0,
      "comentario": "Consistência ajuda a comparação entre períodos. Não é objetivo aumentar lucro nem eliminar julgamento."
    },
    {
      "enunciado": "PL inicial 80.000, final 125.000, aporte 20.000 e distribuição 5.000. Pela manutenção financeira nominal, o lucro é:",
      "alternativas": [
        "45.000",
        "30.000",
        "20.000",
        "50.000"
      ],
      "correta": 1,
      "comentario": "125.000 − 80.000 − 20.000 + 5.000 = <b>30.000</b>. Exclua aportes e devolva distribuições para apurar desempenho."
    },
    {
      "enunciado": "Direito a receber 12.100 em dois anos, taxa de desconto de 10% ao ano. O valor presente é:",
      "alternativas": [
        "12.100",
        "11.000",
        "10.000",
        "9.801"
      ],
      "correta": 2,
      "comentario": "VP = 12.100/(1,10 × 1,10) = 12.100/1,21 = <b>10.000</b>. O desconto não define sozinho a base normativa da mensuração."
    },
    {
      "enunciado": "A norma profissional do perito e a família técnica de perícia são, respectivamente:",
      "alternativas": [
        "TG e PG.",
        "TA e PA.",
        "TP e PP.",
        "PP e TP."
      ],
      "correta": 3,
      "comentario": "P = profissional; T = técnica. NBC PP orienta o perito; NBC TP trata dos procedimentos da perícia."
    },
    {
      "enunciado": "Sobre as NBC TDS 01 e 02, é correto afirmar:",
      "alternativas": [
        "A 01 trata dos requisitos gerais e a 02 de divulgações relacionadas ao clima.",
        "A 01 reconhece toda emissão como passivo e a 02 calcula multas.",
        "A 01 é de auditoria interna e a 02 de perícia.",
        "Ambas dispensam avaliação de materialidade."
      ],
      "correta": 0,
      "comentario": "TDS 01 fornece requisitos gerais de divulgação financeira ligada à sustentabilidade; TDS 02 focaliza clima. Divulgação não cria automaticamente reconhecimento de passivo."
    },
    {
      "enunciado": "Sem aportes ou distribuições, capital inicial de 100.000 e final de 125.000. Inflação de 10%. O excedente após preservar poder aquisitivo inicial é:",
      "alternativas": [
        "25.000",
        "15.000",
        "10.000",
        "35.000"
      ],
      "correta": 1,
      "comentario": "Capital a preservar = 100.000 × 1,10 = 110.000. Excedente = 125.000 − 110.000 = <b>15.000</b>. Nominalmente seriam 25.000."
    }
  ],
  "resumo": [
    "Objetivo: informação útil a investidores e credores sobre decisões de recursos.",
    "A Estrutura Conceitual não prevalece sobre norma específica.",
    "Relevância e representação fidedigna são fundamentais.",
    "Melhoria: comparabilidade, verificabilidade, tempestividade e compreensibilidade.",
    "Custo restringe a informação; materialidade depende da entidade.",
    "Ativo: direito controlado; passivo: obrigação presente; PL: residual.",
    "Reconhecimento busca relevância e representação fidedigna, sob a norma aplicável.",
    "Mensuração: custo histórico ou bases de valor atual apropriadas.",
    "Capital financeiro preserva valor; capital físico preserva capacidade produtiva.",
    "NBCs: profissionais e técnicas; ITG interpreta e CTG esclarece.",
    "TDS 01: requisitos gerais; TDS 02: clima."
  ],
  "demo": {
    "titulo": "Jogo: características e famílias das normas",
    "instrucao": "Leia o caso, dê seu palpite e confira a classificação. Ao final, reveja o mapa que você construiu.",
    montar: montarOficina
  }
};
