const RODADAS = [
  [
    "Caixa disponível de R$ 20.000: escolha o grupo.",
    [
      "Ativo circulante",
      "Imobilizado",
      "PL"
    ],
    0,
    "Disponível para uso: ativo circulante.",
    "Caixa 20.000"
  ],
  [
    "Máquina de uso, líquida de depreciação, R$ 40.000.",
    [
      "Investimentos",
      "Imobilizado",
      "Passivo"
    ],
    1,
    "Bem tangível utilizado na atividade: imobilizado.",
    "Máquina 40.000"
  ],
  [
    "Ações próprias em tesouraria, R$ 4.000.",
    [
      "Ativo circulante",
      "Receita",
      "Redutora do PL"
    ],
    2,
    "Ações em tesouraria reduzem o PL; não são ativo.",
    "Tesouraria −4.000"
  ],
  [
    "Empréstimo vencendo em 6 meses, R$ 15.000.",
    [
      "Passivo circulante",
      "Passivo não circulante",
      "RLP"
    ],
    0,
    "Obrigação vencendo em até 12 meses.",
    "Empréstimo 15.000"
  ],
  [
    "Crédito fora do ciclo, recebível em 3 anos, R$ 10.000.",
    [
      "Intangível",
      "Realizável a longo prazo",
      "PL"
    ],
    1,
    "Direito realizável a longo prazo.",
    "Crédito 10.000"
  ],
  [
    "Software reconhecido como ativo, R$ 5.000.",
    [
      "Investimentos",
      "Estoques",
      "Intangível"
    ],
    2,
    "Identificável sem substância física.",
    "Software 5.000"
  ],
  [
    "Participação permanente em coligada, R$ 15.000.",
    [
      "Investimentos",
      "Imobilizado",
      "Receita"
    ],
    0,
    "Participação permanente: investimentos no ANC.",
    "Coligada 15.000"
  ],
  [
    "Agora monte a DRE: receita bruta 200.000 − deduções 20.000. Receita líquida?",
    [
      "180.000",
      "200.000",
      "220.000"
    ],
    0,
    "200.000 − 20.000 = 180.000.",
    "DRE: receita líquida"
  ],
  [
    "Receita líquida 180.000 − CMV 100.000. Lucro bruto?",
    [
      "100.000",
      "80.000",
      "180.000"
    ],
    1,
    "180.000 − 100.000 = 80.000.",
    "DRE: lucro bruto"
  ],
  [
    "Lucro bruto 80.000 − despesas 30.000 + receitas financeiras 2.000 − despesas financeiras 7.000. Resultado antes de IR/CSLL?",
    [
      "50.000",
      "43.000",
      "45.000"
    ],
    2,
    "80.000 − 30.000 + 2.000 − 7.000 = 45.000.",
    "DRE: antes de IR/CSLL"
  ],
  [
    "Resultado 45.000 − IR/CSLL 12.000 − participações 3.000. Lucro líquido?",
    [
      "30.000",
      "33.000",
      "45.000"
    ],
    0,
    "45.000 − 12.000 − 3.000 = 30.000. Reservas e dividendos serão destinações posteriores.",
    "DRE: lucro líquido"
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
  "id": "08-balanco-dre",
  "numero": 8,
  "disciplina": "Contabilidade Geral",
  "titulo": "Balanço, DRE e destinação do resultado",
  "subtitulo": "Organize as contas e siga o caminho do lucro",
  "incidencia": "alta",
  "tempo": 70,
  "pergunta": "Uma empresa pode ter lucro e ainda assim não poder distribuí-lo integralmente?",
  "previsao": {
    "pergunta": "Uma companhia tem estatuto omisso sobre dividendos. Qual é a regra legal básica?",
    "opcoes": [
      "25% de toda receita",
      "50% do lucro líquido ajustado conforme a lei",
      "100% do caixa disponível"
    ],
    "correta": 1,
    "explicacao": "O art. 202 da Lei 6.404/76 prevê metade do lucro ajustado na omissão estatutária; 25% não é o padrão universal."
  },
  "paginas": [
    {
      "titulo": "Balanço: a fotografia na data de encerramento",
      "html": "<p>O BP organiza os recursos e suas fontes. O ativo apresenta aplicações; passivos, obrigações; PL, o interesse residual. A Lei 6.404/76, arts. 178–182, e a NBC TG 26 orientam a apresentação.</p><div class=\"formula\">Ativo = Passivo exigível + Patrimônio Líquido</div><p>Ativo circulante inclui realização no ciclo operacional, itens mantidos para negociação, realização esperada em até 12 meses e caixa/equivalentes sem restrição de uso de longo prazo. O ciclo operacional vai da aquisição dos recursos para processamento até sua realização em caixa. Se não for claramente identificável, presume-se 12 meses.</p><div class=\"exemplo\">Construtora com ciclo normal de 24 meses mantém imóveis para venda em 18 meses: são estoques circulantes, pois pertencem ao ciclo normal. Um empréstimo concedido, fora do ciclo, recebível em 18 meses fica no realizável a longo prazo.</div><p>Passivo circulante inclui liquidação no ciclo normal, negociação, vencimento em até 12 meses ou ausência, na data do balanço, de direito de diferir a liquidação por pelo menos 12 meses. A intenção de refinanciar, sozinha, não cria esse direito.</p><div class=\"caixa alerta\">FGV: “mais de 12 meses” não torna automaticamente não circulante um estoque do ciclo operacional. Leia prazo, natureza e direitos existentes na data do balanço.</div>"
    },
    {
      "titulo": "Ativo não circulante: quatro gavetas",
      "html": "<table class=\"tabela\"><tr><th>Grupo</th><th>Exemplo e lógica</th></tr><tr><td>Realizável a longo prazo</td><td>Direito fora do ciclo recebido após 12 meses.</td></tr><tr><td>Investimentos</td><td>Participações permanentes e bens não destinados à manutenção da atividade, conforme a natureza.</td></tr><tr><td>Imobilizado</td><td>Bens tangíveis utilizados na produção, administração ou fornecimento.</td></tr><tr><td>Intangível</td><td>Ativos identificáveis sem substância física, como software que atende aos critérios.</td></tr></table><div class=\"exemplo\">Caixa 20.000 + clientes de curto prazo 30.000 = AC de 50.000. Empréstimo a terceiro para receber em três anos 10.000 + participação permanente 15.000 + máquinas líquidas 40.000 + software 5.000 = ANC de 70.000. Ativo total = <b>120.000</b>.</div><p>Depreciação acumulada reduz o imobilizado, e perdas estimadas de crédito reduzem recebíveis: não são passivos. Pela lei, certos direitos com partes relacionadas, sem caráter de negócio usual, são classificados no RLP (art. 179, II); leia as condições do caso.</p><div class=\"caixa alerta\">Um imóvel pode ser estoque, propriedade para investimento ou imobilizado. Sua finalidade é decisiva; o nome “imóvel” não resolve a questão.</div>"
    },
    {
      "titulo": "Patrimônio líquido: origem e retenção dos recursos",
      "html": "<p>O PL reúne capital social, reservas de capital, ajustes de avaliação patrimonial (AAP), reservas de lucros, ações em tesouraria e prejuízos acumulados. Capital a integralizar reduz o capital subscrito. Reservas de capital têm origens específicas, como ágio na emissão de ações; não são lucros guardados.</p><p>Reservas de lucros resultam de destinações do lucro. AAP registra contrapartidas de avaliações previstas em norma que ainda não transitam pelo resultado. Ações em tesouraria são ações próprias adquiridas: <mark>reduzem o PL</mark>, não são investimento no ativo.</p><div class=\"exemplo\">Capital subscrito 100.000 − a integralizar 10.000 + reserva de capital 8.000 + AAP 3.000 + reservas de lucros 12.000 − tesouraria 4.000 − prejuízos 9.000 = <b>PL de 100.000</b>.</div><p>Na sociedade por ações, o saldo positivo de lucros acumulados é conta transitória para destinação; ao fim do processo, os lucros devem ter destinação legal. Prejuízos acumulados podem permanecer como dedução.</p><div class=\"caixa alerta\">Constituir reserva transfere valor dentro do PL; não é despesa da DRE. Dividendo reconhecido como obrigação reduz o PL e cria passivo.</div>"
    },
    {
      "titulo": "DRE: descer a escada até o lucro líquido",
      "html": "<p>A DRE usa competência: reconhece receitas e despesas do período, mesmo sem recebimento ou pagamento. O art. 187 estabelece sua estrutura legal. Separe deduções da receita, custos, despesas operacionais, resultado financeiro, tributos sobre lucro e participações.</p><table class=\"tabela\"><tr><th>Etapa</th><th>R$</th></tr><tr><td>Receita bruta</td><td>200.000</td></tr><tr><td>− devoluções, abatimentos e tributos sobre vendas</td><td>(20.000)</td></tr><tr><td>= receita líquida</td><td>180.000</td></tr><tr><td>− CMV</td><td>(100.000)</td></tr><tr><td>= lucro bruto</td><td>80.000</td></tr><tr><td>− despesas de vendas e administrativas</td><td>(30.000)</td></tr><tr><td>+ receitas financeiras − despesas financeiras</td><td>2.000 − 7.000</td></tr><tr><td>= resultado antes de IR/CSLL</td><td>45.000</td></tr><tr><td>− IR/CSLL do período</td><td>(12.000)</td></tr><tr><td>− participações informadas</td><td>(3.000)</td></tr><tr><td>= lucro líquido</td><td><b>30.000</b></td></tr></table><p>O exemplo não tem outras receitas/despesas. Se houver, inclua-as no subtotal apropriado. O valor de tributos foi dado: não se deve presumir alíquota única para toda companhia. Participações seguem bases e sequência legais; não aplique todas sobre o mesmo subtotal sem conferir o enunciado.</p><div class=\"caixa alerta\">Lucro bruto não é receita líquida. Dividendos e reserva legal são destinações, não despesas para calcular o lucro líquido.</div>"
    },
    {
      "titulo": "DRA: lucro e outros resultados abrangentes",
      "html": "<p>A Demonstração do Resultado Abrangente acrescenta ao lucro líquido os ORA previstos nas normas. A opção de apresentar DRE e DRA em uma única demonstração depende de permissão legal. No Brasil, a legislação societária exige a DRE separada; a DRA começa pelo lucro líquido e é apresentada na sequência da DRE (CPC 26, itens 10A e 10B e nota ao item 81).</p><div class=\"formula\">Resultado abrangente = lucro líquido + outros resultados abrangentes</div><p>Exemplos de ORA: determinados ajustes de conversão de operação no exterior, remensurações de planos de benefício definido e variações de instrumentos classificados em ORA. Alguns componentes podem ser reclassificados futuramente ao resultado; outros não. A DRA evidencia esses grupos e efeitos tributários pertinentes.</p><div class=\"exemplo\">Lucro líquido 30.000 e ganho líquido de tributos em ORA de 8.000 → resultado abrangente <b>38.000</b>. Se os sócios aportaram mais 20.000, esse aporte aumenta o PL, mas não é receita nem resultado abrangente.</div><div class=\"caixa alerta\">Nem toda variação do PL passa na DRA: aportes e distribuições aos proprietários nessa condição são transações com sócios. “Abrangente” não significa somar qualquer movimento do patrimônio.</div>"
    },
    {
      "titulo": "Reserva legal e dividendo obrigatório: calcule na ordem",
      "html": "<p>A reserva legal recebe 5% do lucro líquido antes das demais destinações, limitada a 20% do capital social. A companhia pode deixar de constituí-la quando reserva legal mais reservas de capital excederem 30% do capital. É uma faculdade, não novo limite automático para a reserva legal.</p><div class=\"exemplo\">Capital 100.000, reserva legal existente 18.000, lucro 60.000: 5% = 3.000, mas faltam só 2.000 para o limite de 20.000. Constituição: <b>2.000</b>.</div><p>Com estatuto omisso, o dividendo obrigatório básico é metade do lucro líquido ajustado: deduza reserva legal e reserva para contingências; acrescente reversão desta última. Observe ainda as exclusões e limitações autorizadas pela lei.</p><div class=\"exemplo\">Lucro 100.000; reserva legal 5.000; contingências 10.000; reversão 3.000. Base = 100.000 − 5.000 − 10.000 + 3.000 = 88.000. Dividendo, sem outros ajustes = <b>44.000</b>.</div><p>Se o estatuto omisso for alterado para disciplinar o dividendo, a lei impede percentual inferior a 25% do lucro ajustado. Isso não transforma a regra da omissão em 25%.</p><div class=\"caixa alerta\">Calcule a reserva legal com o limite restante. Depois forme a base ajustada; não aplique metade diretamente sobre receitas ou saldo bancário.</div><p>Fonte: <a href=\"https://www.planalto.gov.br/ccivil_03/leis/l6404compilada.htm\">Lei 6.404/76, arts. 193 e 202</a>.</p>"
    },
    {
      "titulo": "Outras reservas e o fechamento do resultado",
      "html": "<p>As reservas têm finalidades diferentes. <b>Estatutária</b>: finalidade, critério e limite no estatuto. <b>Contingências</b>: compensar queda futura de lucro por perda provável estimável; reverte quando cessam razões ou ocorre a perda. Não confunda com provisão, que é passivo.</p><p><b>Incentivos fiscais</b>: parcela de lucro decorrente de doações/subvenções governamentais para investimento, nos termos do art. 195-A, com possível exclusão da base do dividendo obrigatório. <b>Retenção de lucros</b>: orçamento de capital aprovado, não vontade genérica de guardar dinheiro.</p><p><b>Lucros a realizar</b>: quando o dividendo obrigatório supera a parcela realizada, permite reter o excesso em reserva, respeitada a lei. Lucro de equivalência patrimonial é exemplo relevante de resultado ainda não realizado financeiramente para esse cálculo.</p><div class=\"exemplo\">Dividendo calculado 45.000; parcela realizada 30.000: podem ir <b>15.000</b> para lucros a realizar, pagando-se 30.000 agora. Ao realizar, e não havendo absorção por prejuízos, a reserva alimenta o primeiro dividendo declarado após a realização.</div><p>Reservas estatutárias e retenções não podem prejudicar o dividendo obrigatório. Confira também o limite global do art. 199 e suas exclusões. Na destinação, a soma de reservas, dividendos e demais destinações deve conciliar com o lucro disponível.</p><div class=\"caixa alerta\">Questões autorais desta lição seguem o estilo FGV/CFC; não são reproduções de prova. Roteiro: apure lucro → absorva prejuízos quando cabível → reservas → dividendos → confira o fechamento.</div>"
    }
  ],
  "macetes": [
    "Ciclo operacional pode superar 12 meses.",
    "Tesouraria reduz PL; depreciação acumulada reduz ativo.",
    "Receita líquida menos CMV = lucro bruto.",
    "Reserva não é despesa; dividendo não é despesa.",
    "Reserva legal: 5%, teto de 20%; atenção ao saldo já existente.",
    "Estatuto omisso: metade do lucro ajustado.",
    "DRA = lucro + ORA; aporte fica fora."
  ],
  "questoes": [
    {
      "enunciado": "Estoque será vendido em 18 meses dentro do ciclo operacional normal de 24 meses. Pela NBC TG 26, fica no:",
      "alternativas": [
        "Realizável a longo prazo.",
        "Ativo circulante.",
        "Imobilizado.",
        "Patrimônio líquido."
      ],
      "correta": 1,
      "comentario": "Realização no ciclo normal basta para classificação circulante. O prazo de 12 meses não substitui esse critério."
    },
    {
      "enunciado": "Capital 100.000, reservas de lucros 20.000, ações em tesouraria 8.000 e prejuízos acumulados 7.000. Sem outras contas, o PL é:",
      "alternativas": [
        "135.000",
        "120.000",
        "105.000",
        "113.000"
      ],
      "correta": 2,
      "comentario": "100.000 + 20.000 − 8.000 − 7.000 = <b>105.000</b>. As duas últimas contas reduzem o PL."
    },
    {
      "enunciado": "Receita bruta 300.000, deduções 30.000, CMV 170.000 e despesas administrativas 40.000. O lucro bruto é:",
      "alternativas": [
        "300.000",
        "270.000",
        "60.000",
        "100.000"
      ],
      "correta": 3,
      "comentario": "Receita líquida = 300.000 − 30.000 = 270.000. Lucro bruto = 270.000 − 170.000 = <b>100.000</b>. Despesa administrativa vem depois."
    },
    {
      "enunciado": "Capital social 200.000, reserva legal existente 38.000 e lucro líquido 80.000. Sem faculdade de dispensa aplicável, quanto constituir de reserva legal?",
      "alternativas": [
        "2.000",
        "4.000",
        "10.000",
        "40.000"
      ],
      "correta": 0,
      "comentario": "5% × 80.000 = 4.000, mas teto = 20% × 200.000 = 40.000. Restam 40.000 − 38.000 = <b>2.000</b>."
    },
    {
      "enunciado": "Estatuto omisso: lucro 120.000, reserva legal 6.000, reserva para contingências 14.000 e reversão de contingências 4.000. Sem outros ajustes, o dividendo obrigatório é:",
      "alternativas": [
        "26.000",
        "52.000",
        "60.000",
        "57.000"
      ],
      "correta": 1,
      "comentario": "Base = 120.000 − 6.000 − 14.000 + 4.000 = 104.000. Metade = <b>52.000</b>."
    },
    {
      "enunciado": "Lucro líquido 50.000, ORA positivo líquido de tributos 9.000 e aporte de sócios 30.000. O resultado abrangente é:",
      "alternativas": [
        "89.000",
        "80.000",
        "59.000",
        "50.000"
      ],
      "correta": 2,
      "comentario": "50.000 + 9.000 = <b>59.000</b>. Aporte de 30.000 não é resultado abrangente."
    },
    {
      "enunciado": "Receita líquida 180.000, CMV 100.000, despesas operacionais 30.000, receita financeira 2.000, despesa financeira 7.000, IR/CSLL 12.000 e participações 3.000. Lucro líquido:",
      "alternativas": [
        "45.000",
        "33.000",
        "50.000",
        "30.000"
      ],
      "correta": 3,
      "comentario": "180.000 − 100.000 − 30.000 + 2.000 − 7.000 − 12.000 − 3.000 = <b>30.000</b>."
    },
    {
      "enunciado": "Dividendo obrigatório calculado em 70.000 supera a parcela realizada do lucro, de 50.000. Observados os requisitos legais, a reserva de lucros a realizar poderá receber:",
      "alternativas": [
        "20.000",
        "50.000",
        "70.000",
        "120.000"
      ],
      "correta": 0,
      "comentario": "Excesso = 70.000 − 50.000 = <b>20.000</b>. Não se retém automaticamente todo o lucro ou todo o dividendo."
    }
  ],
  "resumo": [
    "BP: ativo = passivo exigível + PL.",
    "Circulante considera ciclo operacional e demais critérios da NBC TG 26.",
    "ANC: RLP, investimentos, imobilizado e intangível.",
    "PL: capital, reservas, AAP e contas redutoras.",
    "DRE: receita líquida − custos − despesas + outras receitas = resultado antes de tributos e participações.",
    "DRA soma lucro e ORA, sem transações com proprietários.",
    "Reserva legal é destinação: 5%, limitada a 20% do capital.",
    "Regra facultativa dos 30% considera reserva legal mais reservas de capital.",
    "Estatuto omisso: 50% do lucro ajustado conforme art. 202.",
    "Contingência em reserva de lucro não é provisão no passivo."
  ],
  "demo": {
    "titulo": "Oficina: classifique o BP e monte a DRE",
    "instrucao": "Clique no grupo ou subtotal previsto. Cada resposta constrói a tabela da oficina.",
    montar: montarOficina
  }
};
