// Tira capturas de rotas: node scripts/capturas.cjs url saida largura altura rota1 rota2 ...
const { chromium } = require(process.env.PW || 'playwright-core');
const [url, saida, W, H, ...rotas] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  for (const r of rotas) {
    await p.goto(url + '#/' + r); await p.waitForTimeout(1800);
    await p.evaluate(() => { const a = document.querySelector('.demo-area'); if (a) a.scrollIntoView(); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: saida + '/' + r.split('/').join('_') + '.png' });
  }
  await b.close();
})();
