function montarFinancas(el, kit) {
  const { h, ui, fmt, pen, INK } = kit;
  let capital = 1000, taxa = 10, meses = 3;
  const palpite = h('div'), resultado = h('div', { 'aria-live': 'polite' }), graf = h('div'), tab = h('div', { style: { overflowX: 'auto' }, tabindex: '0', 'aria-label': 'Tabela SAC e Price, role horizontalmente se necessário' });
  function preparar() {
    resultado.replaceChildren(); graf.replaceChildren(); tab.replaceChildren(); palpite.replaceChildren();
    const i = taxa / 100, simples = capital * (1 + i * meses), composto = capital * (1 + i) ** meses;
    palpite.append(ui.previsao({ pergunta: `R$ ${capital}, ${taxa}% ao mês, ${meses} mês(es): qual montante será maior?`, opcoes: ['Simples', 'Compostos', 'Iguais'], correta: i === 0 || meses === 1 ? 2 : 1,
      explicacao: 'Nos juros simples a base fica no capital inicial; nos compostos cada período incorpora os juros anteriores.', aoResponder: () => {
        resultado.append(h('p', { class: 'demo-resultado' }, `Simples: ${fmt.brl(simples)}. Compostos: ${fmt.brl(composto)}. Diferença: ${fmt.brl(composto - simples)}.`));
        const g = pen.grafico(graf, { xmin: 0, xmax: meses, ymin: 0, ymax: composto * 1.15, rotuloX: 'meses', rotuloY: 'montante (R$)' }); g.eixos();
        g.serie(t => capital * (1 + i * t), { cor: INK.azul, reta: true });
        g.serie(Array.from({ length: meses + 1 }, (_, t) => [t, capital * (1 + i) ** t]), { cor: INK.vermelho });
        graf.append(h('p', {}, 'Azul: simples. Vermelho: compostos. Valores em datas mensais; curva liga os pontos.'));
        const pmt = i === 0 ? capital / meses : capital * i / (1 - (1 + i) ** -meses), amort = capital / meses;
        let saldoS = capital, saldoP = capital, totalS = 0, totalP = 0;
        const linhas = [];
        for (let t = 1; t <= meses; t++) {
          const js = saldoS * i, jp = saldoP * i, ap = pmt - jp;
          saldoS = Math.max(0, saldoS - amort); saldoP = Math.max(0, saldoP - ap); totalS += js; totalP += jp;
          linhas.push([t, fmt.brl(js + amort), fmt.brl(js), fmt.brl(amort), fmt.brl(saldoS), fmt.brl(pmt), fmt.brl(jp), fmt.brl(ap), fmt.brl(saldoP)]);
        }
        tab.append(h('p', {}, 'Agora use o mesmo capital como empréstimo, com prestações ao fim de cada mês, sem tarifas ou correção monetária.'), ui.tabela(['Mês', 'SAC prestação', 'SAC juros', 'SAC amort.', 'SAC saldo', 'Price prestação', 'Price juros', 'Price amort.', 'Price saldo'], linhas), h('p', {}, `Juros totais: SAC ${fmt.brl(totalS)}; Price ${fmt.brl(totalP)}. Cálculo interno sem arredondar; exibição em centavos.`));
      } }));
  }
  el.append(h('div', { class: 'demo-linha' },
    ui.controle({ rotulo: 'Capital (R$)', min: 100, max: 10000, passo: 100, valor: capital, formato: fmt.brl, aoMudar: v => { capital = v; preparar(); } }),
    ui.controle({ rotulo: 'Taxa mensal (%)', min: 0, max: 20, passo: 1, valor: taxa, aoMudar: v => { taxa = v; preparar(); } }),
    ui.controle({ rotulo: 'Meses', min: 1, max: 24, passo: 1, valor: meses, aoMudar: v => { meses = v; preparar(); } })
  ), palpite, resultado, graf, tab);
  preparar();
}

export default {
  id: '17-matematica-financeira', numero: 17, disciplina: 'Matemática Financeira e Estatística',
  titulo: 'Matemática financeira', subtitulo: 'A mesma quantia em datas diferentes não vale a mesma coisa', incidencia: 'alta', tempo: 80,
  pergunta: 'Dobrar o prazo sempre dobra os juros?',
  previsao: { pergunta: 'R$ 1.000 a 10% ao mês, durante dois meses, em juros compostos. Qual o montante?', opcoes: ['R$ 1.200', 'R$ 1.210', 'R$ 1.100'], correta: 1, explicacao: 'Primeiro mês: 1.000 × 1,10 = 1.100. Segundo: 1.100 × 1,10 = 1.210. Os R$ 10 adicionais são juros sobre os juros do primeiro mês.' },
  paginas: [
    { titulo: 'Juros simples e compostos: desenhe a linha do tempo', html: `<p><b>C</b> é capital na data zero; <b>J</b> são juros; <b>M</b> é montante; <b>i</b> é taxa decimal por período; <b>n</b> é número de períodos. Antes de calcular, iguale a unidade de taxa e prazo: 2% ao mês com três meses usa i = 0,02 e n = 3.</p>
<div class="formula">Simples: J = C × i × n; M = C(1 + in)<br>Compostos: M = C(1 + i)ⁿ; J = M − C</div>
<div class="exemplo">R$ 2.000 a 5% ao mês por três meses. Simples: J = 2.000 × 0,05 × 3 = 300; M = 2.300. Compostos: 2.000 × 1,05 = 2.100; × 1,05 = 2.205; × 1,05 = 2.315,25. Juros = 315,25.</div>
<p>Em simples, o acréscimo monetário por período é constante; em compostos, os juros incidem no saldo acumulado. Com taxa positiva e prazo superior a um período, o composto supera o simples. Em um período, ambos coincidem. Não generalize essa comparação a qualquer prazo fracionário sem verificar o regime.</p>
<div class="caixa alerta">Na calculadora simples, multiplique sucessivamente por 1+i. Não digite 5 no lugar de 0,05. Para trazer dinheiro futuro ao presente, divida pelo fator de capitalização; não subtraia a taxa do valor futuro.</div>
<p>Convenções de dias, como ano comercial de 360 dias, devem vir do enunciado. Se houver prazo de 90 dias e taxa anual simples de 12% em ano comercial, n = 90/360 = 0,25; juros de 1.000 = 1.000 × 0,12 × 0,25 = 30.</p>` },
    { titulo: 'Quatro descontos: qual é a base?', html: `<p>Um título tem valor nominal <b>N</b> no vencimento. Ao antecipá-lo, recebe-se valor atual <b>A</b>; desconto <b>D = N − A</b>. No comercial (por fora), a taxa incide sobre o nominal. No racional (por dentro), o valor atual é a base econômica dos juros.</p>
<table class="tabela"><tr><th>Regime</th><th>Valor atual</th><th>Desconto</th></tr><tr><td>Comercial simples</td><td>A = N(1 − dn)</td><td>D = Ndn</td></tr><tr><td>Racional simples</td><td>A = N/(1 + in)</td><td>D = N − A</td></tr><tr><td>Comercial composto</td><td>A = N(1 − d)ⁿ</td><td>D = N[1 − (1 − d)ⁿ]</td></tr><tr><td>Racional composto</td><td>A = N/(1 + i)ⁿ</td><td>D = N[1 − (1 + i)⁻ⁿ]</td></tr></table>
<div class="exemplo">N = 1.210, taxa 10% por período, n = 2. Comercial simples: A = 1.210 × 0,80 = 968; D = 242. Racional simples: A = 1.210/1,20 = 1.008,33; D ≈ 201,67. Comercial composto: A = 1.210 × 0,90² = 980,10; D = 229,90. Racional composto: A = 1.210/1,10² = 1.000; D = 210.</div>
<p>Para equivalência em um período, <b>1 − d = 1/(1+i)</b>, logo d = i/(1+i). Uma taxa de desconto comercial de 10% não equivale a juros de 10%: i = 0,10/0,90 ≈ 11,11%.</p>
<div class="caixa alerta">Comercial simples exige cuidado com 1 − dn: se dn ≥ 1, o valor atual seria nulo ou negativo. Não trate isso como operação usual de antecipação.</div>` },
    { titulo: 'Taxas: proporcional não é equivalente em compostos', html: `<p><b>Proporcionais</b> guardam a mesma razão dos prazos: 2% ao mês e 24% ao ano. São equivalentes em juros simples. <b>Equivalentes</b> produzem o mesmo montante no mesmo horizonte: em compostos, use potências.</p>
<div class="formula">1 + i anual = (1 + i mensal)¹²</div>
<div class="exemplo">10% ao mês equivale a 21% em dois meses: 1,10² − 1 = 0,21. A proporcional bimestral seria 20%, que não produz o mesmo montante composto.</div>
<p><b>Taxa nominal</b>, no sentido de convenção de capitalização, tem unidade distinta da capitalização: 24% a.a. com capitalização mensal normalmente indica taxa periódica de 24%/12 = 2% a.m. A taxa anual efetiva é 1,02¹² − 1 ≈ 26,8242%. <b>Efetiva</b> expressa a variação no período efetivo de capitalização.</p>
<p>No contexto de inflação, “nominal” significa rendimento monetário sem descontar inflação, conceito diferente da convenção anterior. A taxa real preserva a comparação de poder de compra.</p>
<div class="formula">Fisher: 1 + i nominal = (1 + i real)(1 + inflação)<br>i real = (1 + i nominal)/(1 + inflação) − 1</div>
<div class="exemplo">Rendimento monetário 15,5%; inflação 5%: 1,155/1,05 − 1 = 10% reais. Subtrair 15,5 − 5 = 10,5% é apenas aproximação, não resposta exata.</div>` },
    { titulo: 'Séries uniformes: cada parcela tem sua própria data', html: `<p>Uma série uniforme tem pagamentos iguais (<b>PMT</b>) em intervalos regulares. Na série <b>postecipada</b>, a primeira parcela é ao fim do primeiro período. O valor presente é a soma de cada parcela descontada.</p>
<div class="formula">PV = PMT × [1 − (1+i)⁻ⁿ]/i<br>PMT = PV × i/[1 − (1+i)⁻ⁿ]<br>FV = PMT × [(1+i)ⁿ − 1]/i</div>
<div class="exemplo">Duas parcelas de R$ 110, ao fim dos meses 1 e 2, taxa 10%: PV = 110/1,10 + 110/1,21 = 100 + 90,9091 = 190,91. Não desconte as duas como se vencessem juntas.</div>
<p>Na série <b>antecipada</b>, primeira parcela na data zero: PV antecipado = PV postecipado × (1+i). No exemplo: 190,9091 × 1,10 = 210,00. Com taxa zero, PV = n × PMT; não use a fórmula com divisão por zero.</p>
<p>Carência desloca a série: primeiro calcule o valor na data imediatamente anterior à primeira prestação e depois traga esse valor à data zero. O <b>custo anual equivalente</b> converte um valor presente de custos em parcela anual: CAE = PV dos custos × i/[1 − (1+i)⁻ⁿ]. Ajuda a comparar alternativas com ciclos e hipóteses compatíveis.</p>
<div class="caixa alerta">“Entrada + parcelas” normalmente é série antecipada ou fluxo misto. Desenhe as datas antes de aplicar o fator. A calculadora simples permite somar valores presentes em séries curtas.</div>` },
    { titulo: 'SAC, Price e SACRE: prestação não é amortização', html: `<div class="formula">Prestação = juros + amortização<br>Juros do período = saldo inicial do período × i</div>
<p>No <b>SAC</b>, amortização constante A = dívida/n; juros e prestações decrescem, sem indexação ou encargos adicionais. Na <b>Price</b>, prestação constante calculada pela fórmula da série postecipada; juros caem e amortizações crescem. O saldo devedor diminui pela amortização, não pela prestação inteira.</p>
<div class="exemplo">Dívida de 1.000 em dois meses a 10% a.m. SAC: A = 500. Mês 1: J = 100, prestação 600, saldo 500. Mês 2: J = 50, prestação 550, saldo zero. Juros totais = 150.<br>Price: PMT = 1.000 × 0,10/[1 − 1,10⁻²] = 576,190476. Mês 1: juros 100, amortização 476,190476, saldo 523,809524. Mês 2: juros 52,380952, amortização 523,809524. Juros totais ≈ 152,38.</div>
<p>O <b>SACRE</b> é sistema de amortização crescente com recálculos periódicos de prestações e saldo conforme o contrato. Dentro de um intervalo de prestação constante, a redução dos juros permite amortização crescente. Não o confunda com SAC, nem com a média aritmética entre SAC e Price (essa é a ideia do SAM). Indexadores e periodicidade do recálculo importam.</p>
<div class="exemplo">Em um intervalo de SACRE com saldo inicial 1.000, taxa 1% e prestação fixa 110: primeiro mês J = 10, A = 100, saldo 900; segundo J = 9, A = 101, saldo 799. Este exemplo ilustra crescimento da amortização dentro do intervalo; o próximo recálculo depende do contrato.</div>
<aside class="nota">Com mesmos capital, taxa e prazo e sem correção, SAC amortiza mais cedo e tem juros totais menores que Price. <a href="https://www.marinha.mil.br/cccpm/sistemas-amortizacao-saldo-devedor">Referência sobre sistemas de amortização: CCCPM</a>.</aside>` },
    { titulo: 'Decidir investir: VPL, TIR, payback e TMA', html: `<p>A <b>TMA</b> é a taxa mínima de atratividade, refletindo custo de oportunidade e risco considerados na análise. O <b>VPL</b> compara o investimento inicial com o valor presente dos fluxos futuros à TMA.</p>
<div class="formula">VPL = −I₀ + Σ FCₜ/(1+TMA)ᵗ</div>
<div class="exemplo">Pague 1.000 hoje, receba 600 no ano 1 e 605 no ano 2. TMA = 10%: VPL = −1.000 + 600/1,10 + 605/1,21 = −1.000 + 545,4545 + 500 = 45,45. O projeto agrega valor nessa taxa.</div>
<p>A <b>TIR</b> é taxa que zera o VPL. Em fluxo convencional, com um desembolso inicial seguido de entradas, TIR maior que TMA indica aceitação. Fluxos com várias mudanças de sinal podem ter múltiplas TIR ou nenhuma solução economicamente útil; projetos mutuamente exclusivos podem gerar conflito de ranking. O VPL mostra valor absoluto à taxa escolhida.</p>
<div class="exemplo">Investir 1.000 e receber 1.210 em dois anos: 1.000 = 1.210/(1+r)² → (1+r)² = 1,21 → r = 10% a.a.</div>
<p><b>Payback simples</b> mede tempo para recuperar o desembolso sem desconto. <b>Descontado</b> usa fluxos a valor presente. Ambos ignoram os fluxos posteriores à recuperação. Para investimento 1.000 e entradas de 400 por ano, recuperação simples ocorre no terceiro ano; com geração uniforme dentro do ano, 2 + 200/400 = 2,5 anos. Se os recebimentos forem só ao final do ano, a recuperação ocorre na data 3.</p>` },
    { titulo: 'Custo amortizado: os juros que a contabilidade reconhece', html: `<p>No método da taxa efetiva, os juros são calculados sobre o valor contábil inicial do período. O valor contábil evolui com juros efetivos, recebimentos/pagamentos e demais ajustes cabíveis. Custos de transação e descontos podem fazer a taxa efetiva diferir da taxa contratual.</p>
<div class="formula">Saldo final = saldo inicial + juros efetivos − fluxo pago/recebido</div>
<div class="exemplo">Passivo inicialmente reconhecido por R$ 1.000, sem parcelas intermediárias, a quitar por R$ 1.210 ao fim de dois anos. Taxa efetiva = 10% a.a. Ano 1: despesa financeira 100, saldo 1.100. Ano 2: despesa 110, saldo 1.210; pagamento de 1.210 zera a dívida.</div>
<p>Para um ativo financeiro análogo, a apropriação seria receita financeira. O método não reconhece toda a diferença de R$ 210 na origem nem distribui R$ 105 iguais por ano. A mensuração deve observar a categoria contábil aplicável; nem todo instrumento financeiro é mensurado ao custo amortizado.</p>
<div class="caixa alerta">“Amortização” de um financiamento significa redução de principal; “custo amortizado” é base de mensuração contábil pela taxa efetiva. O uso da mesma palavra não torna os conceitos iguais.</div>
<p>Quando uma compra a prazo exige ajuste a valor presente, separe o preço à vista dos juros do financiamento. Exemplo: preço à vista 1.000, pagamento único 1.100 em um ano, taxa 10%: ativo inicial 1.000, passivo inicial 1.000 e juros de 100 apropriados ao longo do ano, respeitada a norma do ativo.</p>` },
    { titulo: 'Índices, inflação e deflação: compare poder de compra', html: `<p>Um número-índice fixa uma base, normalmente 100. A variação entre duas datas depende da razão dos índices, não da subtração dos pontos.</p>
<div class="formula">Variação = índice final/índice inicial − 1<br>Valor atualizado = valor antigo × índice final/índice inicial<br>Valor em moeda da base = valor nominal × índice base/índice atual</div>
<div class="exemplo">Índice passa de 120 a 132: inflação = 132/120 − 1 = 10%, não 12%. Valor de 2.000 passa a 2.200 para preservar poder de compra. Receita nominal de 2.420 na data final equivale a 2.420/1,10 = 2.200 na data inicial.</div>
<p>Inflações sucessivas se compõem: 10% e 20% dão 1,10 × 1,20 − 1 = 32%. <b>Deflação</b> é queda do nível de preços: índice 100 → 95 = −5%. Já <b>deflacionar</b> um valor significa retirar o efeito dos preços, mesmo que tenha ocorrido inflação positiva.</p>
<div class="exemplo">Aplicação com rendimento real de 2% e correção de 5%: fator total = 1,02 × 1,05 = 1,071. Sobre 1.000, saldo 1.071; ganho nominal 7,1%, não 7% exatos.</div>
<p>Roteiro para a calculadora simples: anote datas; converta taxas em decimais; escreva a fórmula; calcule fatores por multiplicações; guarde casas intermediárias; arredonde só a resposta. Nas questões autorais abaixo, os prazos e fatores são curtos para treinar esse procedimento.</p>` },
  ],
  demo: { titulo: 'Juros à caneta e laboratório SAC × Price', instrucao: 'Ajuste capital, taxa e prazo. Faça o palpite para revelar o gráfico e a tabela de amortização; qualquer ajuste pede nova previsão.', montar: montarFinancas },
  macetes: ['<b>Taxa e prazo na mesma unidade</b> antes de tudo.', 'Simples: cresce por soma; compostos: multiplica o saldo.', 'Por fora usa nominal; por dentro busca valor presente.', 'Taxa equivalente composta usa potência, não regra de três.', 'SAC fixa amortização; Price fixa prestação, sem indexação.', 'VPL desconta à TMA; TIR zera VPL; payback mede tempo.', 'Taxa real é divisão de fatores: (1+nominal)/(1+inflação) − 1.'],
  questoes: [
    { enunciado: 'R$ 2.000 aplicados a juros simples de 3% ao mês por quatro meses produzem montante de:', alternativas: ['R$ 2.240', 'R$ 2.251,02', 'R$ 240', 'R$ 2.060'], correta: 0, comentario: 'J = 2.000 × 0,03 × 4 = 240. M = 2.000 + 240 = 2.240. R$ 240 é só juros, não montante.' },
    { enunciado: 'R$ 1.000 a 10% ao período em juros compostos por três períodos resultam em:', alternativas: ['R$ 1.300', 'R$ 1.210', 'R$ 1.331', 'R$ 1.100'], correta: 2, comentario: '1.000 × 1,10 = 1.100; × 1,10 = 1.210; × 1,10 = 1.331. Juros = 331; o montante pedido é 1.331.' },
    { enunciado: 'Título de R$ 5.000 antecipado por dois meses a desconto comercial simples de 2% ao mês gera valor atual de:', alternativas: ['R$ 200', 'R$ 4.800', 'R$ 4.807,69', 'R$ 5.200'], correta: 1, comentario: 'D = 5.000 × 0,02 × 2 = 200. A = 5.000 − 200 = 4.800. Dividir por 1,04 daria desconto racional simples, não comercial.' },
    { enunciado: 'Título de R$ 1.210, vencível em dois períodos, descontado racionalmente a juros compostos de 10% por período tem valor atual de:', alternativas: ['R$ 980,10', 'R$ 968', 'R$ 1.008,33', 'R$ 1.000'], correta: 3, comentario: 'A = 1.210/(1,10)² = 1.210/1,21 = 1.000. Desconto = 210. 980,10 seria o valor no desconto comercial composto a 10%.' },
    { enunciado: 'Taxa nominal de 24% ao ano, com capitalização mensal, corresponde à taxa mensal e ao fator anual, respectivamente:', alternativas: ['2% e (1,02)¹²', '24% e 1,24', '2% e 1,24 necessariamente', '12% e (1,12)²'], correta: 0, comentario: 'Taxa mensal convencional = 24%/12 = 2%. Fator anual composto = 1,02¹² ≈ 1,268242; taxa anual efetiva ≈ 26,8242%, diferente da nominal de 24%.' },
    { enunciado: 'O rendimento nominal foi 15,5% e a inflação foi 5%. O rendimento real exato é:', alternativas: ['10,5%', '20,5%', '10%', '9,5%'], correta: 2, comentario: '1 + real = 1,155/1,05 = 1,10. Real = 0,10 = 10%. A subtração 15,5% − 5% ignora o termo composto.' },
    { enunciado: 'Empréstimo de R$ 1.200 pelo SAC, em três prestações mensais, taxa 10% a.m., sem outros encargos. A segunda prestação é:', alternativas: ['R$ 520', 'R$ 480', 'R$ 440', 'R$ 400'], correta: 1, comentario: 'Amortização = 1.200/3 = 400. Após a primeira, saldo = 800. Juros do segundo mês = 800 × 10% = 80. Segunda prestação = 400 + 80 = 480.' },
    { enunciado: 'Investimento de R$ 1.000 gera R$ 600 ao fim do ano 1 e R$ 605 ao fim do ano 2. À TMA de 10%, o VPL é aproximadamente:', alternativas: ['R$ 205', 'R$ 100', '−R$ 45,45', 'R$ 45,45'], correta: 3, comentario: 'PV₁ = 600/1,10 = 545,4545; PV₂ = 605/1,21 = 500. VPL = 545,4545 + 500 − 1.000 = 45,4545 ≈ 45,45.' },
    { enunciado: 'Duas parcelas postecipadas de R$ 110 vencem em um e dois meses. À taxa de 10% ao mês, o valor presente é aproximadamente:', alternativas: ['R$ 190,91', 'R$ 200', 'R$ 210', 'R$ 220'], correta: 0, comentario: 'PV = 110/1,10 + 110/1,21 = 100 + 90,9091 = 190,91. R$ 210 seria o valor de duas parcelas antecipadas nas datas zero e um.' },
    { enunciado: 'Um índice passou de 125 para 150. Um valor de R$ 3.000 na data inicial, corrigido pelo índice, será:', alternativas: ['R$ 3.750', 'R$ 3.025', 'R$ 3.600', 'R$ 2.500'], correta: 2, comentario: 'Fator = 150/125 = 1,20. Inflação = 20%. Valor corrigido = 3.000 × 1,20 = 3.600. A diferença de 25 pontos não significa 25%.' },
  ],
  resumo: ['Simples: M = C(1+in). Compostos: M = C(1+i)ⁿ.', 'Desconto é N − A; comercial usa N, racional calcula A por divisão.', 'Comercial composto: A=N(1−d)ⁿ; racional composto: A=N/(1+i)ⁿ.', 'Equivalência composta: fatores elevados a prazos compatíveis.', 'PV postecipado = PMT[1−(1+i)⁻ⁿ]/i; antecipado multiplica por 1+i.', 'SAC: amortização constante; Price: prestação constante; SACRE: recálculos contratuais.', 'VPL = fluxos descontados menos investimento; TIR zera VPL.', 'Payback simples não desconta; ambos os paybacks ignoram fluxos posteriores à recuperação.', 'Custo amortizado apropria juros pela taxa efetiva sobre o saldo.', 'Inflação = índice final/inicial − 1; real = (1+nominal)/(1+inflação) − 1.'],
};
