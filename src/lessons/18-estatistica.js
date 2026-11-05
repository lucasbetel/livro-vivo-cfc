function montarDados(el, kit) {
  const { h, ui, pen, fmt, INK } = kit;
  let texto = '2; 4; 4; 6; 14', amostral = false;
  const erro = h('p', { role: 'status' }), palpite = h('div'), resultado = h('div', { 'aria-live': 'polite' }), desenho = h('div');
  function preparar() {
    erro.textContent = ''; palpite.replaceChildren(); resultado.replaceChildren(); desenho.replaceChildren();
    const partes = texto.trim().split(/[;\s]+/).filter(Boolean);
    const numeros = partes.map(s => /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s) ? Number(s.replace(',', '.')) : NaN);
    if (numeros.length < 2 || numeros.length > 30 || numeros.some(v => !Number.isFinite(v) || Math.abs(v) > 1e9)) {
      erro.textContent = 'Informe de 2 a 30 números entre −1 bilhão e 1 bilhão. Separe por ponto e vírgula ou espaço; vírgula pode ser decimal.'; return;
    }
    const x = numeros.sort((a, b) => a - b), n = x.length, media = x.reduce((a, b) => a + b, 0) / n;
    const mediana = n % 2 ? x[(n - 1) / 2] : (x[n / 2 - 1] + x[n / 2]) / 2;
    const soma = x.reduce((s, v) => s + (v - media) ** 2, 0), variancia = soma / (amostral ? n - 1 : n), dp = Math.sqrt(variancia);
    const frequencias = new Map(); x.forEach(v => frequencias.set(v, (frequencias.get(v) || 0) + 1));
    const fmax = Math.max(...frequencias.values()), modas = [...frequencias].filter(([, f]) => f === fmax).map(([v]) => v);
    // Convenção didática explícita: frequências todas iguais = sem moda destacada.
    const semModa = frequencias.size > 1 && new Set(frequencias.values()).size === 1;
    const modaTexto = semModa ? 'sem moda destacada (frequências iguais)' : modas.map(v => fmt.num(v)).join('; ');
    const iguais = Math.abs(media - mediana) <= 1e-12 * Math.max(1, Math.abs(media), Math.abs(mediana));
    palpite.append(ui.previsao({ pergunta: 'Neste conjunto, a média está abaixo, acima ou na mesma posição da mediana?', opcoes: ['Abaixo', 'Acima', 'Mesma posição'], correta: iguais ? 2 : media < mediana ? 0 : 1,
      explicacao: 'A média usa todos os valores; a mediana depende da posição central dos dados ordenados.', aoResponder: () => {
        resultado.append(ui.tabela(['Medida', 'Resultado'], [['n', n], ['Média', fmt.num(media, 4)], ['Mediana', fmt.num(mediana, 4)], ['Moda(s)', modaTexto], [`Variância ${amostral ? 'amostral' : 'populacional'}`, fmt.num(variancia, 4)], ['Desvio padrão', fmt.num(dp, 4)], ['Divisor da variância', amostral ? n - 1 : n]]));
        const minimo = Math.min(x[0], media - dp), maximo = Math.max(x[n - 1], media + dp), margem = Math.max(1, (maximo - minimo) * 0.12);
        const g = pen.grafico(desenho, { xmin: minimo - margem, xmax: maximo + margem, ymin: 0, ymax: fmax + 4, rotuloX: 'valor', rotuloY: 'frequência', fmtX: v => fmt.num(v, 1) }); g.eixos();
        for (const [v, f] of frequencias) for (let j = 1; j <= f; j++) g.ponto(v, j, '', { cor: INK.lapis, d: 8 });
        g.linha(g.sx(media), g.sy(0), g.sx(media), g.sy(fmax + 2), { cor: INK.vermelho });
        g.linha(g.sx(mediana), g.sy(0), g.sx(mediana), g.sy(fmax + 1), { cor: INK.azul, tracejado: true });
        if (!semModa) modas.forEach(v => g.ponto(v, fmax + 0.4, '', { cor: INK.verde, d: 12 }));
        const y = g.sy(fmax + 2.7); g.linha(g.sx(media - dp), y, g.sx(media + dp), y, { cor: INK.roxo });
        [media - dp, media + dp].forEach(v => g.linha(g.sx(v), y - 6, g.sx(v), y + 6, { cor: INK.roxo }));
        g.texto((g.sx(media - dp) + g.sx(media + dp)) / 2, y - 10, 'média ± 1 DP', { ancora: 'middle', cor: INK.roxo, tamanho: 18 });
        desenho.append(h('p', {}, 'Pontos cinza: observações empilhadas. Vermelho: média; azul tracejado: mediana; verde: moda(s); roxo: média ± um desvio padrão. Linhas podem coincidir. O intervalo roxo não é um intervalo de confiança.'));
      } }));
  }
  const campo = h('textarea', { rows: 3, 'aria-label': 'Dados separados por ponto e vírgula', oninput: e => { texto = e.target.value; preparar(); } }); campo.value = texto;
  const tipo = h('select', { 'aria-label': 'Divisor da variância', onchange: e => { amostral = e.target.value === 'amostra'; preparar(); } }, h('option', { value: 'populacao' }, 'População: dividir por n'), h('option', { value: 'amostra' }, 'Amostra: dividir por n − 1'));
  el.append(h('label', {}, 'Edite os dados (ex.: 2; 4; 4; 6; 14)', campo), tipo, erro, palpite, resultado, desenho);
  preparar();
}

export default {
  id: '18-estatistica', numero: 18, disciplina: 'Matemática Financeira e Estatística',
  titulo: 'Estatística aplicada', subtitulo: 'Dos dados à decisão, sem confundir evidência com certeza', incidencia: 'alta', tempo: 80,
  pergunta: 'Uma única venda muito alta muda a média e a mediana da mesma forma?',
  previsao: { pergunta: 'As vendas foram 2, 4, 4, 6 e 14 mil reais. Qual medida é maior?', opcoes: ['Média', 'Mediana', 'São iguais'], correta: 0, explicacao: 'Média = (2+4+4+6+14)/5 = 6. Mediana = 4, o terceiro valor ordenado. A venda de 14 puxa a média para cima.' },
  paginas: [
    { titulo: 'Organize antes de calcular', html: `<p><b>População</b> é o conjunto de interesse; <b>amostra</b> é um subconjunto observado. Parâmetro descreve a população (μ, σ²); estatística amostral descreve a amostra (x̄, s²). Uma análise descritiva resume dados; uma inferência usa a amostra para concluir sobre a população, com incerteza.</p>
<p>Variáveis qualitativas descrevem categorias, como setor e opinião; quantitativas representam contagens ou medidas. Número de notas fiscais é discreto; tempo de atendimento é contínuo. Uma série temporal acompanha datas; uma geográfica compara locais; uma específica compara categorias.</p>
<table class="tabela"><tr><th>Erros por documento</th><th>Frequência absoluta</th><th>Relativa</th><th>Acumulada</th></tr><tr><td>0</td><td>6</td><td>60%</td><td>6</td></tr><tr><td>1</td><td>3</td><td>30%</td><td>9</td></tr><tr><td>2</td><td>1</td><td>10%</td><td>10</td></tr></table>
<div class="exemplo">Foram 10 documentos, mas 5 erros: 0×6 + 1×3 + 2×1 = 5. Média de erros por documento = 5/10 = 0,5. Não confunda número de observações com soma dos valores.</div>
<p>Barras comparam categorias; linhas mostram evolução temporal; histogramas agrupam valores quantitativos em intervalos; dispersão relaciona duas variáveis. Em histogramas com classes de amplitudes diferentes, a área, e não simplesmente a altura, deve representar a frequência.</p>
<div class="caixa alerta">Eixos truncados podem exagerar diferenças. Percentuais exigem base: 10% de uma filial pequena não pesa tanto quanto 10% de uma filial grande.</div>` },
    { titulo: 'Média, mediana e moda: três centros diferentes', html: `<div class="formula">Média simples: x̄ = Σx/n<br>Média ponderada: x̄ = Σ(wx)/Σw</div>
<p>A média usa todos os valores e é sensível a extremos. A mediana exige <b>ordenar</b>: com n ímpar, posição (n+1)/2; com n par, média das duas posições centrais. Moda é o valor de maior frequência; pode haver mais de uma. Nesta lição, quando todas as frequências são iguais e há valores distintos, dizemos “sem moda destacada”.</p>
<div class="exemplo">Dados 2, 4, 4, 6, 14: soma 30; média 6; mediana 4; moda 4. Troque 14 por 114: soma 130, média 26; mediana e moda continuam 4. A mediana é mais resistente ao valor extremo.</div>
<div class="exemplo">Uma loja vende 10 peças a R$ 20 e 30 a R$ 40. Preço médio = (10×20 + 30×40)/(10+30) = 1.400/40 = R$ 35. A média simples dos preços, R$ 30, ignora as quantidades.</div>
<p>Dados agrupados em classes exigem aproximações: a média usa os pontos médios ponderados pelas frequências. Sem os dados individuais, não se recupera necessariamente a média exata. Em distribuição simétrica unimodal, média, mediana e moda coincidem; a simetria sozinha não obriga a existir uma única moda.</p>
<aside class="nota">Para quatro valores 1, 3, 7, 9, mediana = (3+7)/2 = 5. A mediana não precisa ser um valor observado.</aside>` },
    { titulo: 'Dispersão: duas variâncias, duas perguntas', html: `<p>A amplitude é máximo menos mínimo. A variância mede dispersão pelos desvios quadráticos em relação à média; o desvio padrão é sua raiz e volta à unidade original. Somar os desvios simples daria zero, por isso usamos quadrados.</p>
<div class="formula">População: σ² = Σ(x−μ)²/N; σ = √σ²<br>Amostra: s² = Σ(x−x̄)²/(n−1); s = √s²</div>
<div class="exemplo">Dados 2, 4, 6: média 4. Desvios −2, 0, 2; quadrados 4, 0, 4; soma 8. Como população: variância 8/3 ≈ 2,6667; DP ≈ 1,6330. Como amostra: variância 8/2 = 4; DP = 2. O divisor n−1 corrige a estimação da variância populacional quando a média foi estimada pela amostra.</div>
<div class="formula">Coeficiente de variação: CV = (DP/média) × 100%</div>
<div class="exemplo">Filial A: média 100, DP 10 → CV 10%. Filial B: média 200, DP 30 → CV 15%. B tem maior dispersão relativa. Use CV em escalas com zero significativo e média positiva; média zero torna a razão indefinida, e médias negativas dificultam interpretação.</div>
<p>Somar uma constante a todos os valores desloca a média, mas não altera variância nem DP. Multiplicar por k multiplica a média por k, o DP por |k| e a variância por k².</p>
<div class="caixa alerta">Variância está na unidade ao quadrado. Se valores estão em reais, DP está em reais e variância em reais². CV é percentual.</div>` },
    { titulo: 'Probabilidade e valor esperado', html: `<p>Em resultados equiprováveis, P(A) = casos favoráveis/casos possíveis. Probabilidades ficam entre 0 e 1. O complemento tem probabilidade 1−P(A).</p>
<div class="formula">P(A∪B) = P(A)+P(B)−P(A∩B)<br>P(A|B) = P(A∩B)/P(B), se P(B)>0<br>Independentes: P(A∩B) = P(A)P(B)</div>
<div class="exemplo">Entre 100 notas, 30 têm atraso, 20 têm erro e 10 têm ambos. P(atraso ou erro) = 0,30+0,20−0,10 = 0,40. P(erro dado atraso) = 10/30 = 1/3. “Ou” inclui a interseção, salvo indicação contrária.</div>
<p>Eventos mutuamente exclusivos não ocorrem juntos; eventos independentes não alteram a probabilidade um do outro. Se A e B têm probabilidades positivas e são exclusivos, não são independentes.</p>
<div class="formula">Valor esperado: E(X) = ΣxP(X=x)</div>
<div class="exemplo">Uma perda pode ser 0 (60%), 100 (30%) ou 500 (10%). E(perda) = 0×0,60+100×0,30+500×0,10 = 80. Isso não prevê que a próxima perda será exatamente 80; é uma média ponderada de cenários.</div>
<p>Em auditoria, selecionar documentos sem reposição torna as probabilidades sucessivas dependentes. Se 2 de 10 documentos têm erro, a chance de dois selecionados sem reposição terem erro é (2/10)×(1/9) = 1/45, não (2/10)².</p>` },
    { titulo: 'Binomial e normal: conte sucessos ou padronize medidas', html: `<p>A distribuição <b>binomial</b> modela número de sucessos em n ensaios independentes, dois resultados por ensaio e probabilidade p constante. “Sucesso” pode significar encontrar erro: é apenas o evento contado.</p>
<div class="formula">P(X=k) = C(n,k)pᵏ(1−p)ⁿ⁻ᵏ<br>C(n,k) = n!/[k!(n−k)!]<br>E(X)=np; Var(X)=np(1−p)</div>
<div class="exemplo">Três verificações independentes, p de erro = 0,20. Exatamente um erro: C(3,1)×0,20×0,80² = 3×0,20×0,64 = 0,384 = 38,4%. Pelo menos um: 1−0,80³ = 48,8%. “Exatamente um” e “ao menos um” são perguntas diferentes.</div>
<p>A <b>normal</b> é contínua, simétrica e definida por média μ e DP σ. A área total é 1. Aproximadamente 68%, 95% e 99,7% ficam em μ±1σ, μ±2σ e μ±3σ. A regra não vale para qualquer distribuição.</p>
<div class="formula">Escore z = (x−μ)/σ</div>
<div class="exemplo">Tempo normal com μ=50 e σ=5: x=60 → z=(60−50)/5=2. Cerca de 95% ficam entre 40 e 60; aproximadamente 2,5% ficam acima de 60 (tabela normal: cerca de 2,28%). Não confunda a aproximação 95% com valor tabelado exato.</div>
<p>Para variável contínua, P(X exatamente igual a um ponto) = 0, embora intervalos tenham probabilidade positiva. Uma amostra pequena sem reposição de população finita não atende automaticamente à independência binomial.</p>` },
    { titulo: 'Amostragem e estimação: quem entrou na amostra?', html: `<p><b>Aleatória simples</b>: cada amostra de tamanho fixado tem igual chance no desenho usual. <b>Estratificada</b>: dividir em grupos e sortear dentro de cada um, preservando representação. <b>Sistemática</b>: sortear um início e selecionar a cada k unidades; periodicidade da lista pode enviesar o resultado.</p>
<div class="exemplo">População de 1.000 notas, amostra sistemática de 100: intervalo k = 1.000/100 = 10. Sorteando início 7, seleciona-se 7, 17, 27, ... , 997. Começar sempre no primeiro documento não equivale a início aleatório.</div>
<p>Na auditoria, dimensionamento considera risco de amostragem, desvio/distorção tolerável, expectativa de erros e características da população. Testar apenas notas maiores pode ser uma seleção dirigida útil, mas não permite projetar automaticamente a conclusão sobre todas as notas menores não selecionadas.</p>
<p>Estimativa <b>pontual</b> fornece um número; intervalo de confiança expressa precisão sob um modelo. Para observações independentes, o erro padrão da média é σ/√n (ou estimado por s/√n). O teorema central do limite permite aproximação normal da distribuição das médias sob condições adequadas; não transforma os dados brutos em normais.</p>
<div class="exemplo">σ conhecido = 10, n = 100 e média amostral 50: erro padrão = 10/10 = 1. IC de 95%, com modelo normal e z=1,96: 50±1,96 → [48,04; 51,96]. Se σ for desconhecido e a amostra pequena normal, usa-se t de Student com n−1 graus de liberdade.</div>
<div class="caixa alerta">95% de confiança refere-se à cobertura do procedimento em amostragens repetidas; não diz que 95% dos dados estão no intervalo da média. Amostra maior reduz erro aleatório, mas não cura viés de seleção.</div>` },
    { titulo: 'Hipóteses: rejeitar não é provar', html: `<p>Defina <b>H₀</b> (hipótese nula), <b>H₁</b> (alternativa) e nível de significância α antes de olhar o resultado. O p-valor mede, supondo H₀ e o modelo, quão extremos seriam resultados como o observado ou mais extremos. Não é a probabilidade de H₀ ser verdadeira.</p>
<table class="tabela"><tr><th>Decisão</th><th>H₀ verdadeira</th><th>H₀ falsa</th></tr><tr><td>Rejeitar H₀</td><td>Erro tipo I (probabilidade α)</td><td>Decisão correta (poder 1−β)</td></tr><tr><td>Não rejeitar H₀</td><td>Decisão correta</td><td>Erro tipo II (probabilidade β)</td></tr></table>
<div class="exemplo">H₀: média dos valores é 100. Em teste bilateral a 5%, p=0,03 → rejeitar H₀, pois 0,03&lt;0,05. Se p=0,20, não rejeitar H₀; isso não prova igualdade, pois o teste pode ter baixo poder.</div>
<p>Quando aplicável o teste z, z = (x̄−μ₀)/(σ/√n). Exemplo: x̄=103, μ₀=100, σ=10, n=100 → z=3/1=3. Em teste bilateral normal a 5%, |z|&gt;1,96 → rejeitar H₀.</p>
<p>Reduzir α sem alterar tamanho de amostra e demais condições tende a dificultar rejeição e elevar β. Significância estatística não mede relevância econômica: diferença pequena pode ser estatisticamente detectável em amostra enorme.</p>
<aside class="nota">Em prova, “aceitar definitivamente H₀” costuma esconder o erro: a decisão formal é não rejeitar H₀ com a evidência disponível.</aside>` },
    { titulo: 'Correlação, regressão e uso contábil', html: `<p>Correlação de Pearson mede direção e intensidade de associação <b>linear</b>, com −1≤r≤1. r perto de 1: associação positiva forte; perto de −1: negativa forte. r=0 não exclui relação não linear. Correlação não prova causalidade; pode haver variável omitida.</p>
<div class="formula">ŷ = a + bx<br>b = Σ[(x−x̄)(y−ȳ)] / Σ(x−x̄)²<br>a = ȳ − bx̄</div>
<div class="exemplo">Produção x = 1, 2, 3; custo y = 3, 5, 7. x̄=2; ȳ=5. Numerador = (−1)(−2)+0+1×2 = 4. Denominador = 1+0+1 = 2. b=2; a=5−2×2=1. Reta ŷ=1+2x. Para x=4, previsão 9. Aqui r=1, pois os três pontos estão exatamente na reta.</div>
<p>Resíduo é observado menos previsto: e=y−ŷ. R² descreve a proporção da variação de y explicada pelo modelo ajustado. Na regressão linear simples com intercepto, R²=r²; r=−0,8 também gera R²=0,64. O sinal da inclinação não aparece no R².</p>
<p>Aplicações contábeis incluem projeção de custos, estimativas de inadimplência e orçamento. Verifique representatividade dos dados, extremos, mudança de regime e incerteza. Extrapolar muito além da faixa observada aumenta o risco; uma reta histórica não garante custos futuros.</p>
<div class="caixa alerta">Uma perda esperada estatística auxilia estimativas, mas o reconhecimento contábil depende da norma aplicável. A estatística não substitui critérios de ativo, passivo, receita ou despesa.</div>
<p>Na demo, altere um valor extremo e compare média com mediana; depois mude de população para amostra e veja que só o divisor da variância muda. Questões a seguir são autorais no estilo CFC/FGV.</p>` },
  ],
  demo: { titulo: 'Seu conjunto de dados, desenhado à caneta', instrucao: 'Edite os números, escolha população ou amostra e dê um palpite. O gráfico revela média, mediana, moda e desvio padrão.', montar: montarDados },
  macetes: ['Ordene antes de buscar a <b>mediana</b>.', 'Média ponderada divide pela <b>soma dos pesos</b>.', 'População divide por N; variância amostral estimadora divide por n−1.', 'DP tem a unidade original; variância tem unidade ao quadrado.', '“Pelo menos um” muitas vezes é <b>1 − nenhum</b>.', 'Tipo I: rejeitar uma H₀ verdadeira; tipo II: não rejeitar uma H₀ falsa.', 'Correlação não prova causa; r=0 não descarta relação não linear.'],
  questoes: [
    { enunciado: 'Nos dados 2, 4, 4, 6 e 14, média, mediana e moda são, respectivamente:', alternativas: ['4, 6 e 4', '6, 4 e 4', '6, 6 e 14', '4, 4 e 6'], correta: 1, comentario: 'Soma = 30; n=5; média=30/5=6. Dados já ordenados: mediana é o 3º valor, 4. O valor 4 ocorre duas vezes, maior frequência, logo é a moda.' },
    { enunciado: 'Considerando 2, 4 e 6 como amostra, a variância amostral e o desvio padrão amostral são:', alternativas: ['8/3 e √(8/3)', '4 e 4', '8 e 2', '4 e 2'], correta: 3, comentario: 'Média=4. Soma dos quadrados=(-2)²+0²+2²=8. s²=8/(3−1)=4. s=√4=2. Dividir por três calcularia variância populacional.' },
    { enunciado: 'Foram vendidas 10 unidades a R$ 20 e 30 a R$ 40. O preço médio ponderado é:', alternativas: ['R$ 35', 'R$ 30', 'R$ 25', 'R$ 40'], correta: 0, comentario: 'Receita=10×20+30×40=1.400. Quantidade=40. Preço médio=1.400/40=35. Não se usa média simples de 20 e 40 porque as quantidades diferem.' },
    { enunciado: 'Em 100 documentos, 30 têm atraso, 20 têm erro e 10 têm ambos. A probabilidade de atraso ou erro é:', alternativas: ['50%', '10%', '40%', '60%'], correta: 2, comentario: 'União = 30+20−10 = 40 documentos. Probabilidade=40/100=40%. Subtrai-se a interseção contada duas vezes.' },
    { enunciado: 'Três verificações independentes têm probabilidade constante de erro de 20% cada. A probabilidade de exatamente um erro é:', alternativas: ['48,8%', '38,4%', '60%', '12,8%'], correta: 1, comentario: 'Binomial: C(3,1)×0,2×0,8² = 3×0,2×0,64 = 0,384 = 38,4%. O fator três conta as três posições possíveis do único erro.' },
    { enunciado: 'Uma variável normal tem média 50 e desvio padrão 5. O escore z correspondente a 60 é:', alternativas: ['10', '0,5', '−2', '2'], correta: 3, comentario: 'z=(60−50)/5=10/5=2. O valor está dois desvios padrão acima da média. É positivo porque 60 é maior que 50.' },
    { enunciado: 'Rejeitar uma hipótese nula que é verdadeira caracteriza:', alternativas: ['erro tipo I', 'erro tipo II', 'poder do teste', 'certeza de fraude'], correta: 0, comentario: 'Erro tipo I: rejeitar H₀ verdadeira, controlado por α. Tipo II: não rejeitar H₀ falsa, probabilidade β. Poder=1−β.' },
    { enunciado: 'Uma perda será zero com probabilidade 60%, R$ 100 com 30% e R$ 500 com 10%. Seu valor esperado é:', alternativas: ['R$ 200', 'R$ 600', 'R$ 80', 'R$ 100'], correta: 2, comentario: 'E(X)=0×0,60+100×0,30+500×0,10=0+30+50=80. As probabilidades somam 1. Valor esperado não precisa ser um resultado possível isolado.' },
    { enunciado: 'A reta de regressão estimada é ŷ=100+3x. Para x=20, a previsão é:', alternativas: ['R$ 2.060', '160 unidades de y', '60 unidades de y', '123 unidades de y'], correta: 1, comentario: 'Substitua x: ŷ=100+3×20=100+60=160. O intercepto é 100; a inclinação 3 representa variação prevista em y por unidade de x.' },
    { enunciado: 'Uma média amostral é 50, com n=100 e desvio padrão populacional conhecido de 10. Usando z=1,96 e as condições para IC normal, o intervalo de confiança de 95% é:', alternativas: ['[30,4; 69,6]', '[49,8; 50,2]', '[40; 60]', '[48,04; 51,96]'], correta: 3, comentario: 'Erro padrão=10/√100=1. Margem=1,96×1=1,96. IC=50±1,96=[48,04;51,96]. Usar o DP 10 diretamente confundiria dispersão individual com precisão da média.' },
  ],
  resumo: ['População tem parâmetros; amostra fornece estatísticas e estimativas.', 'Média=Σx/n; ponderada=Σwx/Σw; mediana exige ordenação.', 'Variância populacional divide por N; amostral, por n−1.', 'DP=raiz da variância; CV=DP/média ×100%, com interpretação adequada.', 'União soma probabilidades e desconta a interseção.', 'Binomial: C(n,k)pᵏ(1−p)ⁿ⁻ᵏ; média np; variância np(1−p).', 'Normal: z=(x−μ)/σ; regra aproximada 68–95–99,7.', 'Erro padrão da média: σ/√n; confiança não é proporção de dados no intervalo.', 'Tipo I: rejeitar H₀ verdadeira; tipo II: não rejeitar H₀ falsa.', 'Regressão ŷ=a+bx; correlação não demonstra causalidade.'],
};
