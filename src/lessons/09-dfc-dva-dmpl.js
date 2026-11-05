const RODADAS = [
  [
    "Recebimento de clientes, R$ 100.000: atividade?",
    [
      "Operacional",
      "Investimento",
      "Financiamento"
    ],
    0,
    "Receita da atividade principal recebida: operacional.",
    "Clientes +100.000"
  ],
  [
    "Compra à vista de máquina, R$ 25.000.",
    [
      "Operacional",
      "Investimento",
      "Financiamento"
    ],
    1,
    "Imobilizado adquirido: investimento.",
    "Máquina −25.000"
  ],
  [
    "Empréstimo recebido em dinheiro, R$ 20.000.",
    [
      "Operacional",
      "Investimento",
      "Financiamento"
    ],
    2,
    "Captação de recursos de terceiros: financiamento.",
    "Empréstimo +20.000"
  ],
  [
    "Salários pagos, R$ 30.000.",
    [
      "Operacional",
      "Investimento",
      "Financiamento"
    ],
    0,
    "Pagamento ligado à operação.",
    "Salários −30.000"
  ],
  [
    "Venda à vista de equipamento, R$ 14.000.",
    [
      "Operacional",
      "Investimento",
      "Financiamento"
    ],
    1,
    "Valor integral recebido na alienação: investimento.",
    "Venda de equipamento +14.000"
  ],
  [
    "Amortização do principal de empréstimo, R$ 8.000.",
    [
      "Operacional",
      "Investimento",
      "Financiamento"
    ],
    2,
    "Redução de dívida financeira: financiamento.",
    "Principal −8.000"
  ],
  [
    "Novo caso: lucro 50.000 inclui depreciação de 10.000. Primeiro subtotal indireto?",
    [
      "40.000",
      "60.000",
      "50.000"
    ],
    1,
    "50.000 + 10.000 = 60.000. A despesa não teve saída de caixa.",
    "Indireto: após depreciação"
  ],
  [
    "Subtotal 60.000 inclui ganho de 4.000 na venda de máquina. Ajuste?",
    [
      "56.000",
      "64.000",
      "46.000"
    ],
    0,
    "Retire o ganho: 60.000 − 4.000 = 56.000; recebimento será investimento.",
    "Indireto: após ganho"
  ],
  [
    "Subtotal 56.000; clientes aumentaram 12.000. Novo subtotal?",
    [
      "68.000",
      "56.000",
      "44.000"
    ],
    2,
    "56.000 − 12.000 = 44.000. Receita ainda não recebida.",
    "Indireto: após clientes"
  ],
  [
    "Subtotal 44.000; estoques aumentaram 5.000. Novo subtotal?",
    [
      "39.000",
      "49.000",
      "44.000"
    ],
    0,
    "44.000 − 5.000 = 39.000. Aplicação em estoques operacionais.",
    "Indireto: após estoques"
  ],
  [
    "Subtotal 39.000; fornecedores aumentaram 7.000. Sem outros ajustes, FCO?",
    [
      "32.000",
      "46.000",
      "39.000"
    ],
    1,
    "39.000 + 7.000 = 46.000. Parte das compras ainda não foi paga.",
    "Indireto: FCO final"
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
  "id": "09-dfc-dva-dmpl",
  "numero": 9,
  "disciplina": "Contabilidade Geral",
  "titulo": "DFC, DVA, DMPL e notas explicativas",
  "subtitulo": "Caixa, riqueza e patrimônio contam histórias diferentes",
  "incidencia": "alta",
  "tempo": 65,
  "pergunta": "Se houve lucro, por que faltou dinheiro para pagar as contas?",
  "previsao": {
    "pergunta": "A depreciação reduziu o lucro em R$ 8.000. No método indireto da DFC, você:",
    "opcoes": [
      "Subtrai mais 8.000 do lucro",
      "Soma 8.000 de volta ao lucro",
      "Registra pagamento de investimento de 8.000"
    ],
    "correta": 1,
    "explicacao": "A despesa não consumiu caixa no período. Somar de volta cancela seu efeito no lucro; não cria entrada de dinheiro."
  },
  "paginas": [
    {
      "titulo": "DFC: o caminho do dinheiro",
      "html": "<p>A DFC explica a mudança de <b>caixa e equivalentes de caixa</b>. Caixa inclui numerário e depósitos à vista. Equivalentes são aplicações de curto prazo, alta liquidez, conversíveis em montante conhecido e com risco insignificante de mudança de valor. Em regra, o vencimento original é de até três meses a partir da aquisição; não basta faltar pouco para vencer hoje.</p><div class=\"exemplo\">Aplicação adquirida com vencimento em 60 dias, resgate por valor conhecido e risco insignificante pode ser equivalente. Título comprado há um ano e que vence em 20 dias não se torna equivalente só por isso. Transferir 5.000 do banco para um equivalente troca componentes do caixa: não é fluxo de investimento.</div><p>Concilie saldo inicial + fluxos operacionais + investimento + financiamento + efeito cambial, quando houver = saldo final. A variação cambial de caixa em moeda estrangeira é evidenciada separadamente dos três fluxos.</p><p>A Lei 6.404/76, art. 176, exige DFC e dispensa a companhia fechada com PL <b>inferior a R$ 2 milhões</b> na data do balanço. A dispensa legal não elimina eventuais exigências do regime contábil ou regulador aplicável.</p><div class=\"caixa alerta\">Com PL exatamente igual a R$ 2 milhões, a dispensa legal não se aplica. Lucro não é saldo de caixa.</div>"
    },
    {
      "titulo": "Operacional, investimento e financiamento",
      "html": "<table class=\"tabela\"><tr><th>Atividade</th><th>Exemplos usuais</th></tr><tr><td>Operacional</td><td>Recebimento de clientes, pagamento a fornecedores e empregados.</td></tr><tr><td>Investimento</td><td>Compra e venda de imobilizado; aquisição de participação não equivalente de caixa.</td></tr><tr><td>Financiamento</td><td>Integralização de capital, captação e amortização do principal de empréstimos.</td></tr></table><p>A classificação segue a <b>natureza da transação</b>, não o nome do banco usado para pagar. Se uma máquina for comprada com empréstimo recebido em dinheiro, há entrada de financiamento e saída de investimento. Aquisição por arrendamento sem desembolso inicial não entra como fluxo inicial: é transação sem caixa a divulgar.</p><div class=\"exemplo\">Clientes +100.000; fornecedores e salários −70.000 → FCO +30.000. Máquina −25.000 → FCI −25.000. Empréstimo +20.000 e principal pago −8.000 → FCF +12.000. Variação = <b>17.000</b>.</div><div class=\"caixa alerta\">Depreciação não é pagamento. Venda de máquina gera fluxo de investimento pelo valor recebido, não somente pelo ganho contábil. Em instituição financeira, empréstimos concedidos podem ser operacionais: observe o negócio.</div>"
    },
    {
      "titulo": "Método direto: recebimentos e pagamentos",
      "html": "<p>O método direto apresenta as principais classes de entradas e saídas operacionais. A DRE usa competência, então receita de vendas não é automaticamente recebimento de clientes.</p><div class=\"formula\">Recebimentos = vendas + clientes iniciais − clientes finais</div><p>A fórmula simplificada pressupõe ausência de baixas, perdas, tributos e outras movimentações. Para fornecedores, primeiro calcule compras: CMV + estoque final − estoque inicial. Depois: pagamentos = compras + fornecedores iniciais − fornecedores finais.</p><div class=\"exemplo\">Vendas 200.000; clientes inicial 30.000 e final 50.000: recebimentos = <b>180.000</b>. CMV 100.000; estoques inicial 20.000 e final 35.000: compras = 115.000. Fornecedores inicial 15.000 e final 25.000: pagamentos = <b>105.000</b>. Com salários pagos de 30.000 e sem outros fluxos, FCO = 180.000 − 105.000 − 30.000 = <b>45.000</b>.</div><p>A NBC TG 03 admite direto ou indireto. No Brasil, ao adotar o direto, apresente também a conciliação entre lucro líquido e fluxo operacional exigida pela norma.</p><div class=\"caixa alerta\">Aumento de clientes significa receita ainda não recebida, nas premissas do exemplo. Subtrair clientes finais sem somar o saldo inicial erra a conciliação.</div>"
    },
    {
      "titulo": "Método indireto: transformar lucro em caixa operacional",
      "html": "<p>Parta do lucro e ajuste itens sem caixa, resultados ligados a investimento/financiamento e variações do capital de giro operacional. Não ajuste indiscriminadamente todo ativo e passivo: caixa, empréstimos e imobilizado têm outro tratamento.</p><table class=\"tabela\"><tr><th>Ajuste</th><th>Efeito usual</th></tr><tr><td>Depreciação que reduziu o lucro</td><td>Somar</td></tr><tr><td>Ganho na venda de imobilizado</td><td>Subtrair; recebimento vai em investimento</td></tr><tr><td>Aumento de clientes/estoques operacionais</td><td>Subtrair</td></tr><tr><td>Aumento de fornecedores operacionais</td><td>Somar</td></tr></table><div class=\"exemplo\">Lucro 50.000 + depreciação 10.000 − ganho na venda de máquina 4.000 − aumento de clientes 12.000 − aumento de estoques 5.000 + aumento de fornecedores 7.000 = <b>FCO de 46.000</b>, sem outros ajustes. Se a máquina foi vendida por 14.000, os 14.000 aparecem no FCI; os 4.000 não são saída operacional real.</div><p>O método só muda a apresentação operacional: investimento e financiamento continuam baseados em pagamentos e recebimentos. Com os mesmos dados, direto e indireto chegam ao mesmo FCO.</p><div class=\"caixa alerta\">Somar depreciação não significa “depreciação gera caixa”. Apenas desfaz uma despesa sem desembolso incluída no lucro.</div>"
    },
    {
      "titulo": "Juros, dividendos e políticas consistentes",
      "html": "<p>Na NBC TG 03, juros e dividendos devem ser apresentados separadamente e classificados consistentemente. Para entidades não financeiras, a norma admite alternativas: juros pagos podem ser operacionais ou financiamento; juros e dividendos recebidos, operacionais ou investimento; dividendos pagos, financiamento ou operacional.</p><p>A orientação brasileira do item 34A encoraja fortemente <b>juros pagos e recebidos e dividendos recebidos no operacional</b>, e <b>dividendos pagos no financiamento</b>. Alternativa diferente exige nota evidenciando a escolha. Para instituições financeiras, juros pagos/recebidos e dividendos recebidos são usualmente operacionais.</p><div class=\"exemplo\">A empresa recebe juros de 2.000 e dividendos de 3.000, paga juros de 1.000 e dividendos de 4.000. Seguindo a orientação encorajada: efeito no FCO = 2.000 + 3.000 − 1.000 = <b>4.000</b>; efeito no FCF = <b>−4.000</b>.</div><p>IR e CSLL pagos são normalmente operacionais, salvo identificação específica com investimento ou financiamento.</p><div class=\"caixa alerta\">Não responda “sempre” se a norma admite escolha. Nas questões desta lição, quando necessário, a política é informada.</div><p>Fonte: <a href=\"https://www.cpc.org.br/Arquivos/Documentos/183_CPC_03_R2_rev%2024.pdf\">CPC 03 / NBC TG 03, itens 31–35</a>.</p>"
    },
    {
      "titulo": "DVA: riqueza criada e para quem foi",
      "html": "<p>A DVA, NBC TG 09, mostra valor adicionado e distribuição. A Lei 6.404/76 exige a demonstração para companhias abertas. Ela não mede apenas caixa nem equivale ao lucro. Nas receitas e insumos, observe os critérios próprios da DVA, inclusive tributos incorporados aos valores e sua distribuição, sem copiar mecanicamente a receita líquida da DRE.</p><div class=\"formula\">Receitas − insumos de terceiros = VA bruto<br>VA bruto − depreciação/amortização/exaustão = VA líquido produzido<br>VA líquido + recebido em transferência = VA total a distribuir</div><div class=\"exemplo\">Receitas conforme DVA 300.000 − insumos 180.000 = bruto 120.000. Menos depreciação 20.000 = líquido 100.000. Mais equivalência/receitas financeiras em transferência 10.000 = <b>110.000</b>.</div><p>Distribuição do exemplo: pessoal 40.000 + impostos, taxas e contribuições 25.000 + capital de terceiros (juros/alugueis) 15.000 + capital próprio 30.000 = <b>110.000</b>. Capital próprio inclui dividendos e lucros retidos; prejuízo também repercute nessa parcela.</p><div class=\"caixa alerta\">Salários não entram como insumos adquiridos de terceiros: aparecem na distribuição a pessoal. Resultado de equivalência integra riqueza recebida em transferência, não riqueza produzida pela própria entidade.</div>"
    },
    {
      "titulo": "DMPL, DLPA e notas: fechar e explicar",
      "html": "<p>A <b>DMPL</b> mostra cada componente do PL e concilia saldos inicial e final: resultado, ORA, aportes, dividendos, ajustes retrospectivos e transferências internas. Integra o conjunto completo de demonstrações na NBC TG 26.</p><p>A <b>DLPA</b> acompanha lucros ou prejuízos acumulados: saldo anterior, ajustes pertinentes, reversões, resultado e destinações. A Lei 6.404/76 exige DLPA e permite incluí-la na DMPL, se elaborada e publicada (art. 186, §2º). Não conclua que toda entidade está dispensada de DMPL só porque a lei menciona DLPA; considere o regime normativo.</p><div class=\"exemplo\">PL inicial 200.000 + lucro 50.000 + ORA 8.000 + aporte 30.000 − dividendos reconhecidos 20.000 = <b>268.000</b>. Transferir 5.000 do lucro para reserva legal muda colunas, mas não esse total.</div><p>As <b>notas explicativas</b> integram as demonstrações. Explicam bases de elaboração, políticas contábeis materiais, julgamentos, incertezas de estimativas, detalhamentos de saldos e outras informações exigidas. Devem ser organizadas e cruzar referências com as demonstrações.</p><div class=\"caixa alerta\">Nota não corrige reconhecimento inadequado: explicar um erro não torna o saldo correto. DFC responde “onde foi o caixa”; DVA, “quem recebeu riqueza”; DMPL, “por que o PL mudou”.</div><p>Referências: <a href=\"https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/normas-completas/\">NBC TG 03, 09 e 26</a>; Lei 6.404/76, arts. 176 e 186.</p>"
    }
  ],
  "macetes": [
    "DFC não é DRE com outro nome.",
    "Aumento de ativo operacional consome caixa, nas premissas usuais.",
    "Aumento de fornecedor operacional preserva caixa.",
    "Depreciação volta no indireto; não entra dinheiro.",
    "Venda de máquina: recebimento no investimento, ganho retirado do lucro na conciliação.",
    "DVA distribui riqueza; lucro retido remunera capital próprio.",
    "Transferência para reserva não altera o PL total."
  ],
  "questoes": [
    {
      "enunciado": "Lucro 40.000; depreciação 8.000; aumento de clientes 6.000; redução de estoques 3.000; aumento de fornecedores 5.000. Sem outros ajustes, FCO indireto:",
      "alternativas": [
        "50.000",
        "44.000",
        "56.000",
        "34.000"
      ],
      "correta": 0,
      "comentario": "40.000 + 8.000 − 6.000 + 3.000 + 5.000 = <b>50.000</b>."
    },
    {
      "enunciado": "Uma indústria compra máquina à vista por 60.000 e capta empréstimo em dinheiro de 80.000. Classificação dos fluxos:",
      "alternativas": [
        "Ambos operacionais.",
        "Investimento −60.000 e financiamento +80.000.",
        "Financiamento −60.000 e investimento +80.000.",
        "Somente entrada líquida operacional de 20.000."
      ],
      "correta": 1,
      "comentario": "Aquisição de imobilizado é FCI; captação é FCF. Evidenciam-se separadamente −60.000 e +80.000."
    },
    {
      "enunciado": "Lucro de 70.000 inclui ganho de 5.000 na venda de máquina recebida por 18.000. Na conciliação indireta e no FCI, respectivamente:",
      "alternativas": [
        "Somar 5.000; entrada 5.000.",
        "Subtrair 18.000; entrada 5.000.",
        "Subtrair 5.000; entrada 18.000.",
        "Somar 18.000; saída 5.000."
      ],
      "correta": 2,
      "comentario": "Retira-se o ganho de 5.000 do lucro operacional conciliado; todo recebimento de 18.000 vai ao investimento."
    },
    {
      "enunciado": "Pela dispensa específica do art. 176, §6º, qual companhia pode não elaborar DFC, sem considerar outras exigências?",
      "alternativas": [
        "Aberta, PL de 1 milhão.",
        "Fechada, PL de 2 milhões exatos.",
        "Fechada, PL de 3 milhões.",
        "Fechada, PL de 1,9 milhão."
      ],
      "correta": 3,
      "comentario": "Exige companhia fechada e PL inferior a R$ 2 milhões na data do balanço. 1,9 < 2; igualdade não basta."
    },
    {
      "enunciado": "Na DVA: receitas 500.000; insumos de terceiros 300.000; depreciação 40.000; valor adicionado recebido em transferência 20.000. Total a distribuir:",
      "alternativas": [
        "180.000",
        "200.000",
        "220.000",
        "160.000"
      ],
      "correta": 0,
      "comentario": "500.000 − 300.000 = 200.000 bruto; −40.000 = 160.000 líquido; +20.000 = <b>180.000</b>."
    },
    {
      "enunciado": "PL inicial 150.000; lucro 35.000; aporte 20.000; dividendos reconhecidos 10.000; transferência de 2.000 para reserva. PL final:",
      "alternativas": [
        "197.000",
        "195.000",
        "193.000",
        "205.000"
      ],
      "correta": 1,
      "comentario": "150.000 + 35.000 + 20.000 − 10.000 = <b>195.000</b>. Transferência de 2.000 entre contas do PL não muda o total."
    },
    {
      "enunciado": "Seguindo a classificação fortemente encorajada pela NBC TG 03, dividendos recebidos e dividendos pagos ficam, respectivamente, em:",
      "alternativas": [
        "Investimento e operacional.",
        "Financiamento e investimento.",
        "Operacional e financiamento.",
        "Operacional e operacional, obrigatoriamente."
      ],
      "correta": 2,
      "comentario": "Item 34A: recebidos no operacional, pagos no financiamento. A questão fixa a orientação encorajada; existem alternativas com divulgação."
    },
    {
      "enunciado": "Vendas 200.000, clientes inicial 30.000 e final 50.000, sem baixas ou outras alterações. No método direto, recebimentos de clientes:",
      "alternativas": [
        "220.000",
        "200.000",
        "150.000",
        "180.000"
      ],
      "correta": 3,
      "comentario": "200.000 + 30.000 − 50.000 = <b>180.000</b>. O aumento de 20.000 em clientes representa vendas ainda não recebidas."
    }
  ],
  "resumo": [
    "Equivalente de caixa exige liquidez, valor conhecido e risco insignificante.",
    "DFC separa operacional, investimento e financiamento.",
    "Direto: recebimentos e pagamentos; indireto: conciliação do lucro.",
    "Indireto remove itens sem caixa e ajusta capital de giro operacional.",
    "Juros/dividendos exigem política consistente e divulgação.",
    "Dispensa legal: companhia fechada com PL inferior a R$ 2 milhões.",
    "DVA: riqueza produzida + recebida em transferência = distribuição.",
    "DVA distribui a pessoal, governo, capital de terceiros e próprio.",
    "DMPL concilia todas as contas do PL; DLPA pode estar nela incluída.",
    "Notas explicam políticas materiais, julgamentos e detalhes necessários."
  ],
  "demo": {
    "titulo": "Oficina da DFC: atividades e método indireto",
    "instrucao": "Classifique cada transação. Depois escolha os ajustes para construir a conciliação do lucro ao caixa.",
    montar: montarOficina
  }
};
