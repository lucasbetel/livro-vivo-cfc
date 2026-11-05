// Teste de fumaça: abre todas as páginas de todas as lições e procura erros.
// Uso: PW=<caminho do playwright-core> node scripts/fumaca.cjs [url] [larguraxaltura]
const { chromium } = require(process.env.PW || 'playwright-core');
const url = process.argv[2] || 'http://localhost:5179/';
const [W, H] = (process.argv[3] || '1100x850').split('x').map(Number);

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const erros = [];
  page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });
  await page.goto(url + '#/sumario');
  await page.waitForSelector('.indice a');
  const links = await page.$$eval('.indice a', (as) => as.map((a) => a.getAttribute('href')));
  let falhas = 0;
  for (const href of links) {
    const id = href.split('/')[2];
    await page.goto(url + href); await page.waitForSelector('.pontos button');
    const n = await page.$$eval('.pontos button', (b) => b.length);
    const linha = [];
    for (let i = 0; i < n; i++) {
      const antes = erros.length;
      await page.goto(`${url}#/licao/${id}/${i}`);
      await page.waitForSelector('.folha');
      await page.waitForTimeout(i === n - 4 ? 1200 : 150);
      const info = await page.evaluate(() => {
        const a = document.querySelector('.demo-area');
        const r = { scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, demo: !!a };
        if (a) { r.filhos = a.children.length; r.canvas = a.querySelectorAll('canvas').length; r.svg = a.querySelectorAll('svg').length; r.nok = !!a.querySelector(':scope > p.nok'); }
        return r;
      });
      if (info.demo) {
        // exercita: clica nos primeiros botões da demo
        const bs = await page.$$('.demo-area button:not([disabled])');
        for (const b of bs.slice(0, 3)) { try { await b.click({ timeout: 800 }); await page.waitForTimeout(250); } catch { /* */ } }
        linha.push(`demo(f=${info.filhos},c=${info.canvas},s=${info.svg}${info.nok ? ',FALHOU' : ''})`);
        if (info.nok || !info.filhos) falhas++;
      }
      if (info.scroll) { linha.push(`p${i}:ROLAGEM-H`); falhas++; }
      if (erros.length > antes) { linha.push(`p${i}:ERRO ${erros.slice(antes).join(' | ').slice(0, 200)}`); falhas++; }
    }
    console.log(`${id}: ${n} págs ${linha.join(' ')}`);
  }
  // telas extras
  for (const r of ['#/simulado', '#/erros', '#/plano', '#/texto', '#/']) {
    const antes = erros.length;
    await page.goto(url + r); await page.waitForTimeout(r === '#/' ? 1500 : 300);
    if (erros.length > antes) { console.log(`${r}: ERRO ${erros.slice(antes).join(' | ')}`); falhas++; } else console.log(`${r}: ok`);
  }
  console.log(`\nFALHAS: ${falhas}`);
  await browser.close();
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
