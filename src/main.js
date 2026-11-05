import './styles.css';
import { kit, h, fmt } from './kit.js';
import { licoes } from './lessons/index.js';

/* =================== Estado (localStorage) =================== */
const CHAVE = 'livro-cfc-v1';
const est = (() => {
  try { return { licoes: {}, erros: {}, simulados: [], dataProva: null, leitura: false, ultima: null, simAtual: null, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') }; }
  catch { return { licoes: {}, erros: {}, simulados: [], dataProva: null, leitura: false, ultima: null, simAtual: null }; }
})();
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(est)); } catch { /* sem espaço */ } };
const reg = (id) => (est.licoes[id] ||= { vistas: [], respostas: {}, previsao: null, concluida: false });

const porId = Object.fromEntries(licoes.map((l) => [l.id, l]));
const prontas = () => licoes.filter((l) => !l.stub);
const LETRAS = ['A', 'B', 'C', 'D'];
const $main = document.getElementById('conteudo');
const $topo = document.getElementById('topo');
let limparTela = null;

function avisar(txt) {
  const a = document.getElementById('aviso');
  a.textContent = txt; a.classList.add('mostra');
  clearTimeout(avisar.t); avisar.t = setTimeout(() => a.classList.remove('mostra'), 2600);
}

function diasAteProva() {
  if (!est.dataProva) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(`${est.dataProva}T00:00:00`);
  return Math.round((d - hoje) / 86400000);
}

function aplicarLeitura() { document.body.classList.toggle('leitura', !!est.leitura); }
aplicarLeitura();

/* =================== Topo =================== */
function topo(ativo) {
  const d = diasAteProva();
  $topo.innerHTML = '';
  const link = (href, txt, chave) => h('a', { href, 'aria-current': ativo === chave ? 'page' : null }, txt);
  $topo.append(...[
    h('a', { class: 'marca-livro', href: '#/sumario' }, 'Livro Vivo', h('small', {}, 'CFC')),
    d != null ? h('span', { class: 'contagem' }, d > 0 ? `faltam ${d} dia${d > 1 ? 's' : ''}` : d === 0 ? 'a prova é hoje!' : 'prova realizada') : null,
    h('nav', { 'aria-label': 'Principal' },
      link('#/sumario', 'Sumário', 'sumario'),
      link('#/plano', 'Plano', 'plano'),
      link('#/simulado', 'Simulado', 'simulado'),
      link('#/erros', `Erros${Object.keys(est.erros).length ? ` (${Object.keys(est.erros).length})` : ''}`, 'erros'),
      link('#/texto', 'Versão texto', 'texto'),
      h('button', { type: 'button', 'aria-pressed': String(!!est.leitura), title: 'Atalho: tecla L', onclick: () => { est.leitura = !est.leitura; salvar(); aplicarLeitura(); topo(ativo); avisar(est.leitura ? 'Modo leitura ligado' : 'Modo caderno ligado'); } }, est.leitura ? 'Modo caderno' : 'Modo leitura'),
    ),
  ].filter(Boolean));
}

/* =================== Roteador =================== */
function rota() {
  const partes = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (limparTela) { try { limparTela(); } catch { /* */ } limparTela = null; }
  window.scrollTo(0, 0);
  const [r, a, b] = partes;
  if (!r) return telaCapa();
  if (r === 'sumario') return telaSumario();
  if (r === 'licao' && porId[a]) return telaLicao(porId[a], Number(b) || 0);
  if (r === 'simulado') return telaSimulado();
  if (r === 'erros') return telaErros();
  if (r === 'plano') return telaPlano();
  if (r === 'texto') return telaTexto();
  location.hash = '#/sumario';
}
window.addEventListener('hashchange', rota);

/* =================== Capa =================== */
async function telaCapa() {
  $topo.innerHTML = '';
  document.title = 'Livro Vivo · Exame de Suficiência CFC';
  const palco = h('div', { class: 'capa', 'aria-hidden': 'true' });
  const btn = h('button', { class: 'btn-caneta primario', type: 'button' }, 'Abrir o livro');
  const ui = h('div', { class: 'capa-ui' },
    h('h1', { class: 'sr' }, 'Livro Vivo'),
    h('p', { class: 'dedicatoria' }, 'Exame de Suficiência do CFC · Contabilidade'),
    h('p', {}, '24 lições com pergunta, palpite, experimento e questões no estilo da prova. Para passar, são 25 acertos em 50.'),
    h('div', { class: 'grupo-botoes' }, btn, h('a', { class: 'btn-caneta', href: '#/sumario' }, 'Ir ao sumário')),
  );
  $main.innerHTML = '';
  $main.append(h('div', { style: { position: 'relative' } }, palco, ui));
  try { await Promise.race([document.fonts.load('700 60px Caveat'), new Promise((r) => setTimeout(r, 1200))]); } catch { /* */ }
  if (!palco.isConnected) return;
  const { criarCapa } = await import('./three/capa.js');
  const capa = criarCapa(palco);
  limparTela = () => capa && capa.destruir();
  btn.addEventListener('click', async () => {
    btn.disabled = true; ui.style.transition = 'opacity .5s'; ui.style.opacity = 0;
    if (capa) await capa.abrir();
    location.hash = '#/sumario';
  });
  btn.focus();
}

/* =================== Sumário =================== */
function progressoGeral() {
  const ps = prontas();
  const feitas = ps.filter((l) => est.licoes[l.id]?.concluida).length;
  let resp = 0, cert = 0;
  ps.forEach((l) => Object.entries(est.licoes[l.id]?.respostas || {}).forEach(([qi, v]) => { resp++; if (l.questoes[qi] && l.questoes[qi].correta === v) cert++; }));
  return { feitas, total: ps.length, resp, cert };
}

function telaSumario() {
  topo('sumario');
  document.title = 'Sumário · Livro Vivo CFC';
  const pg = progressoGeral();
  const d = diasAteProva();
  const ult = est.ultima && porId[est.ultima.id];
  const folha = h('article', { class: 'folha' });
  folha.append(
    h('div', { class: 'folha-cabeca' }, h('span', {}, 'Sumário'), h('span', {}, 'Exame de Suficiência · Bacharel em Ciências Contábeis')),
    h('h1', {}, 'Seu caderno de estudos'),
    h('p', {}, 'Cada lição segue o mesmo caminho: ', h('b', {}, 'pergunta → palpite → teoria → experimento → macetes → questões → resumo'), '. Use ← → para virar as páginas.'),
  );
  const cartoes = h('div', { class: 'painel-topo' },
    h('div', { class: 'cartao' }, h('h3', {}, 'Progresso'), h('div', { class: 'grande' }, `${pg.feitas}/${pg.total}`), h('div', { class: 'barra', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': pg.total, 'aria-valuenow': pg.feitas }, h('i', { style: { width: `${pg.total ? (100 * pg.feitas) / pg.total : 0}%` } })), h('small', {}, 'lições concluídas')),
    h('div', { class: 'cartao' }, h('h3', {}, 'Questões'), h('div', { class: 'grande' }, pg.resp ? fmt.pct((100 * pg.cert) / pg.resp, 0) : '—'), h('small', {}, `${pg.cert} acertos em ${pg.resp} respondidas (meta: 50% ou mais)`)),
    h('div', { class: 'cartao' }, h('h3', {}, 'Dia da prova'), h('div', { class: 'grande' }, d == null ? '?' : d > 0 ? `${d} dias` : d === 0 ? 'hoje!' : 'feita'), h('a', { href: '#/plano' }, est.dataProva ? 'ver plano de estudo' : 'definir a data e montar o plano')),
  );
  folha.append(cartoes);
  if (ult) folha.append(h('p', {}, h('a', { class: 'btn-caneta primario', href: `#/licao/${ult.id}/${est.ultima.pag || 0}` }, `Continuar: ${ult.numero}. ${ult.titulo} →`)));
  // agrupa por disciplina mantendo ordem
  const grupos = [];
  licoes.forEach((l) => { let g = grupos.find((x) => x.d === l.disciplina); if (!g) grupos.push((g = { d: l.disciplina, ls: [] })); g.ls.push(l); });
  grupos.forEach((g) => {
    folha.append(h('section', { class: 'disciplina-grupo' }, h('h3', {}, g.d), h('ul', { class: 'indice' }, g.ls.map((l) => {
      const r = est.licoes[l.id];
      const st = l.stub ? h('span', { class: 'st prep' }, 'em preparação') : r?.concluida ? h('span', { class: 'st feito' }, '✓ estudada') : h('span', { class: `selo ${l.incidencia}` }, `cai ${l.incidencia === 'alta' ? 'muito' : l.incidencia === 'media' ? 'médio' : 'pouco'}`);
      const ps = paginasDa(l);
      const ir = (tipo) => ps.findIndex((p) => p.tipo === tipo);
      const atalhos = l.stub ? null : h('div', { class: 'atalhos' },
        h('a', { href: `#/licao/${l.id}/1` }, '📖 Teoria'),
        ir('demo') > 0 ? h('a', { href: `#/licao/${l.id}/${ir('demo')}`, class: 'exp' }, '🧪 Experimento') : null,
        ir('questoes') > 0 ? h('a', { href: `#/licao/${l.id}/${ir('questoes')}` }, `✍️ ${l.questoes.length} questões`) : null,
        h('a', { href: `#/licao/${l.id}/${ps.length - 1}` }, '📌 Resumo'));
      return h('li', {}, h('a', { href: `#/licao/${l.id}/0` }, h('span', { class: 'n' }, String(l.numero).padStart(2, '0')), h('span', { class: 't' }, l.titulo, h('small', {}, `${l.subtitulo || ''}${l.tempo ? ` · ~${l.tempo} min` : ''}`)), st), atalhos);
    }))));
  });
  folha.append(h('p', { class: 'dica-teclado' }, 'Atalhos: ← → viram a página · Esc volta ao sumário · L liga/desliga o modo leitura'));
  $main.innerHTML = '';
  $main.append(h('div', { class: 'livro' }, folha));
}

/* =================== Lição =================== */
function paginasDa(L) {
  const ps = [{ tipo: 'abertura', titulo: 'Abertura' }];
  (L.paginas || []).forEach((p, i) => ps.push({ tipo: 'teoria', titulo: p.titulo, i }));
  if (L.demo) ps.push({ tipo: 'demo', titulo: L.demo.titulo });
  if (L.macetes?.length) ps.push({ tipo: 'macetes', titulo: 'Macetes da margem' });
  if (L.questoes?.length) ps.push({ tipo: 'questoes', titulo: 'Hora da prova' });
  if (!L.stub) ps.push({ tipo: 'resumo', titulo: 'Resumo de bolso' });
  return ps;
}

function questaoEl(q, num, { escolhida = null, aoResponder, mostrarLogo = true } = {}) {
  const box = h('div', { class: 'questao' });
  box.append(h('div', { class: 'questao-num' }, `Questão ${num}`), h('div', { class: 'enunciado', html: q.enunciado }));
  const lista = h('ol', { class: 'alternativas', type: 'A' });
  const com = h('div', { class: 'comentario', html: q.comentario, hidden: true });
  const fb = h('p', { 'aria-live': 'polite', class: 'sr' });
  const marcar = (i, revelar) => {
    [...lista.querySelectorAll('.alt')].forEach((b, j) => {
      b.disabled = true;
      if (revelar) { if (j === q.correta) b.classList.add('certo'); if (j === i && i !== q.correta) b.classList.add('errado'); }
      else if (j === i) b.style.borderColor = 'var(--tinta)';
    });
    if (revelar) { com.hidden = false; fb.textContent = i === q.correta ? 'Resposta certa.' : `Resposta errada. A correta é ${LETRAS[q.correta]}.`; }
  };
  q.alternativas.forEach((a, i) => {
    const b = h('button', { type: 'button', class: 'alt' }, h('span', { class: 'letra' }, LETRAS[i]), h('span', { html: a }));
    b.addEventListener('click', () => { if (b.disabled) return; marcar(i, mostrarLogo); aoResponder && aoResponder(i, i === q.correta); });
    lista.append(h('li', {}, b));
  });
  box.append(lista, fb, com);
  if (escolhida != null) marcar(escolhida, mostrarLogo);
  box.revelar = (i) => marcar(i, true);
  return box;
}

function renderPagina(L, p, idx, total) {
  const folha = h('article', { class: 'folha', 'aria-label': `${L.titulo}, página ${idx + 1} de ${total}` });
  const cab = h('div', { class: 'folha-cabeca' }, h('span', {}, `Lição ${L.numero} · ${L.disciplina}`), h('span', {}, `pág. ${idx + 1}/${total}`));
  folha.append(cab);
  const r = reg(L.id);
  let limpar = null;
  if (p.tipo === 'abertura') {
    folha.append(
      h('h1', {}, `${L.numero}. ${L.titulo}`),
      L.subtitulo ? h('p', { class: 'caneta-vermelha' }, L.subtitulo) : null,
      L.stub ? null : h('p', {}, h('span', { class: `selo ${L.incidencia}` }, `incidência ${L.incidencia === 'media' ? 'média' : L.incidencia}`), ` · cerca de ${L.tempo} min`),
      h('p', { class: 'gancho' }, L.pergunta),
    );
    if (L.previsao) {
      folha.append(h('p', {}, 'Antes de estudar, ', h('b', {}, 'dê seu palpite'), '. Errar agora ajuda a lembrar depois.'));
      const card = kit.ui.previsao({ ...L.previsao, aoResponder: (i) => { r.previsao = i; salvar(); } });
      folha.append(card);
      if (r.previsao != null) card.querySelectorAll('.btn-caneta')[r.previsao]?.click();
    }
    if (L.stub) folha.append(h('div', { class: 'caixa' }, 'Esta lição ainda está sendo escrita. Volte em breve!'));
    else {
      const ps = paginasDa(L);
      const icone = { teoria: '📖', demo: '🧪', macetes: '💡', questoes: '✍️', resumo: '📌' };
      folha.append(h('h3', {}, 'Nesta lição'), h('ol', { class: 'roteiro' }, ps.map((pp, i) => i === 0 ? null : h('li', { class: pp.tipo === 'demo' ? 'exp' : '' },
        h('button', { type: 'button', class: 'link-pagina', onclick: () => mostrarLicao(L, i, 1) }, `${icone[pp.tipo] || ''} ${pp.tipo === 'demo' ? `Experimento interativo: ${pp.titulo.replace(/^Experimento:\s*/i, '')}` : pp.titulo}`)))),
        h('p', { class: 'dica-teclado' }, 'Toque em um item para ir direto, ou use "Próxima →" para seguir na ordem.'));
    }
  } else if (p.tipo === 'teoria') {
    const pg = L.paginas[p.i];
    folha.append(h('h2', {}, pg.titulo), h('div', { class: 'teoria', html: pg.html }));
    folha.querySelectorAll('.teoria table').forEach((t) => { if (!t.parentElement.classList.contains('tabela-rolagem')) { const w = h('div', { class: 'tabela-rolagem' }); t.replaceWith(w); w.append(t); } });
  } else if (p.tipo === 'demo') {
    folha.append(h('h2', {}, L.demo.titulo), h('p', {}, L.demo.instrucao || ''));
    const area = h('div', { class: 'demo-area' });
    folha.append(area);
    requestAnimationFrame(() => {
      try { const f = L.demo.montar(area, kit); if (typeof f === 'function') limpar = f; }
      catch (e) { console.error(e); area.append(h('p', { class: 'nok' }, 'Não foi possível abrir o experimento neste aparelho.')); }
    });
  } else if (p.tipo === 'macetes') {
    folha.append(h('h2', {}, 'Macetes da margem'), h('div', { class: 'postits' }, L.macetes.map((m) => h('div', { class: 'postit', html: m }))));
  } else if (p.tipo === 'questoes') {
    const placar = h('p', { class: 'placar-questoes', 'aria-live': 'polite' });
    const atual = () => {
      const rs = Object.entries(r.respostas); const c = rs.filter(([qi, v]) => L.questoes[qi]?.correta === v).length;
      placar.textContent = rs.length ? `${c} de ${rs.length} certas${rs.length === L.questoes.length ? ` · ${c * 2 >= L.questoes.length ? 'aprovada nesta lição! ✓' : 'revise a teoria e tente o caderno de erros'}` : ''}` : '';
    };
    folha.append(h('h2', {}, 'Hora da prova'), h('p', {}, `${L.questoes.length} questões no estilo da banca. Clique na alternativa: a correção aparece na hora. As que você errar vão para o `, h('a', { href: '#/erros' }, 'caderno de erros'), '.'), placar);
    L.questoes.forEach((q, qi) => folha.append(questaoEl(q, qi + 1, {
      escolhida: r.respostas[qi] ?? null,
      aoResponder: (i, ok) => {
        r.respostas[qi] = i;
        const k = `${L.id}#${qi}`;
        if (!ok) est.erros[k] = { quando: Date.now() };
        salvar(); atual(); topo();
      },
    })));
    folha.append(h('p', {}, h('button', { class: 'btn-caneta pequeno', type: 'button', onclick: () => { r.respostas = {}; salvar(); mostrarLicao(L, idx, 0); } }, 'Refazer as questões')));
    atual();
  } else if (p.tipo === 'resumo') {
    folha.append(h('h2', {}, 'Resumo de bolso'), h('ul', { class: 'lista-check' }, L.resumo.map((x) => h('li', { html: x }))));
    const prox = licoes[licoes.indexOf(L) + 1];
    const btnC = h('button', { class: `btn-caneta ${r.concluida ? '' : 'primario'}`, type: 'button' }, r.concluida ? '✓ Lição estudada' : 'Marcar como estudada');
    btnC.addEventListener('click', () => { r.concluida = !r.concluida; salvar(); btnC.textContent = r.concluida ? '✓ Lição estudada' : 'Marcar como estudada'; btnC.classList.toggle('primario', !r.concluida); if (r.concluida) avisar('Mais uma lição no bolso!'); });
    folha.append(h('div', { class: 'grupo-botoes' }, btnC, prox ? h('a', { class: 'btn-caneta', href: `#/licao/${prox.id}/0` }, `Próxima: ${prox.titulo} →`) : h('a', { class: 'btn-caneta', href: '#/simulado' }, 'Fazer o simulado →')));
  }
  folha._limpar = () => { if (limpar) { try { limpar(); } catch { /* */ } limpar = null; } };
  return folha;
}

let estadoLicao = null;
function telaLicao(L, pag) {
  topo('licao');
  const ps = paginasDa(L);
  pag = Math.max(0, Math.min(ps.length - 1, pag));
  document.title = `${L.numero}. ${L.titulo} · Livro Vivo CFC`;
  const palco = h('div', { class: 'livro-palco' });
  const pontos = h('div', { class: 'pontos', role: 'tablist', 'aria-label': 'Páginas da lição' });
  const ant = h('button', { class: 'btn-caneta', type: 'button' }, '← Anterior');
  const prox = h('button', { class: 'btn-caneta primario', type: 'button' }, 'Próxima →');
  const nav = h('nav', { class: 'navpag', 'aria-label': 'Virar página' }, ant, pontos, prox);
  $main.innerHTML = '';
  $main.append(h('div', { class: 'livro' }, palco, nav, h('p', { class: 'dica-teclado' }, '← → viram a página · Esc volta ao sumário')));
  estadoLicao = { L, ps, palco, pontos, ant, prox, pag: -1, folha: null };
  ant.onclick = () => virar(-1);
  prox.onclick = () => virar(1);
  mostrarLicao(L, pag, 0);
  limparTela = () => { estadoLicao?.folha?._limpar(); estadoLicao = null; };
}

function virar(dir) {
  const s = estadoLicao; if (!s) return;
  const n = s.pag + dir;
  if (n < 0) return;
  if (n >= s.ps.length) { const p = licoes[licoes.indexOf(s.L) + 1]; location.hash = p ? `#/licao/${p.id}/0` : '#/sumario'; return; }
  mostrarLicao(s.L, n, dir);
}

function mostrarLicao(L, idx, dir) {
  const s = estadoLicao; if (!s) return;
  const nova = renderPagina(L, s.ps[idx], idx, s.ps.length);
  const velha = s.folha;
  const anima = dir !== 0 && velha && !kit.reduzMovimento() && nova.animate;
  if (!anima) {
    if (velha) { velha._limpar(); velha.remove(); }
    s.palco.append(nova);
  } else {
    const ov = h('div', { class: 'virando' });
    const verso = h('div', { class: 'verso' });
    const dur = 650;
    if (dir > 0) { // página atual vira para a esquerda revelando a nova
      s.palco.append(nova);
      velha.remove(); ov.append(velha, verso); s.palco.append(ov);
      ov.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }], { duration: dur, easing: 'cubic-bezier(.45,.05,.25,1)' })
        .onfinish = () => { velha._limpar(); ov.remove(); };
    } else { // nova página volta da esquerda por cima da atual
      ov.append(nova, verso); s.palco.append(ov);
      ov.animate([{ transform: 'rotateY(-180deg)' }, { transform: 'rotateY(0deg)' }], { duration: dur, easing: 'cubic-bezier(.45,.05,.25,1)' })
        .onfinish = () => { velha._limpar(); velha.remove(); ov.remove(); s.palco.append(nova); };
    }
  }
  s.folha = nova; s.pag = idx;
  const r = reg(L.id);
  if (!r.vistas.includes(idx)) r.vistas.push(idx);
  est.ultima = { id: L.id, pag: idx }; salvar();
  history.replaceState(null, '', `#/licao/${L.id}/${idx}`);
  s.pontos.innerHTML = '';
  s.ps.forEach((p, i) => s.pontos.append(h('button', { type: 'button', role: 'tab', title: p.titulo, 'aria-label': `Página ${i + 1}: ${p.titulo}`, 'aria-current': i === idx ? 'true' : 'false', class: r.vistas.includes(i) ? 'vista' : '', onclick: () => i !== s.pag && mostrarLicao(L, i, i > s.pag ? 1 : -1) })));
  s.ant.disabled = idx === 0;
  const prox = licoes[licoes.indexOf(L) + 1];
  const seg = s.ps[idx + 1];
  const rotulo = { demo: 'Próxima: 🧪 Experimento →', macetes: 'Próxima: 💡 Macetes →', questoes: 'Próxima: ✍️ Questões →', resumo: 'Próxima: 📌 Resumo →' };
  s.prox.textContent = seg ? (rotulo[seg.tipo] || (idx === 0 ? 'Começar a teoria →' : 'Próxima página →')) : prox ? 'Próxima lição →' : 'Sumário →';
  [...s.pontos.children].forEach((b, i) => { if (s.ps[i].tipo === 'demo') b.classList.add('exp'); });
  window.scrollTo({ top: 0, behavior: kit.reduzMovimento() ? 'auto' : 'smooth' });
}

/* =================== Teclado =================== */
document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (t && (t.closest('input, textarea, select, [contenteditable], .palco3d'))) return;
  if (e.key === 'l' || e.key === 'L') { est.leitura = !est.leitura; salvar(); aplicarLeitura(); avisar(est.leitura ? 'Modo leitura ligado' : 'Modo caderno ligado'); if (location.hash.length > 2) topo(); return; }
  if (!estadoLicao) { if (e.key === 'Escape' && location.hash !== '#/sumario') location.hash = '#/sumario'; return; }
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); virar(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); virar(-1); }
  else if (e.key === 'Escape') location.hash = '#/sumario';
});

/* =================== Simulado =================== */
// Distribuição aproximada das 50 questões por disciplina (referência: edições anteriores).
const DIST = {
  'Contabilidade Geral': 14, 'Contabilidade de Custos': 4, 'Contabilidade Aplicada ao Setor Público': 4, 'Contabilidade Gerencial': 4,
  'Controladoria': 2, 'Noções de Direito e Legislação Aplicada': 4, 'Matemática Financeira e Estatística': 3, 'Teoria da Contabilidade': 2,
  'Princípios de Contabilidade e Normas Brasileiras de Contabilidade': 2, 'Legislação e Ética Profissional': 3, 'Auditoria Contábil': 3,
  'Perícia Contábil': 3, 'Língua Portuguesa Aplicada': 2,
};
const embaralhar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function montarSimulado() {
  const pool = [];
  prontas().filter((l) => l.disciplina !== 'Estratégia').forEach((l) => l.questoes.forEach((_, qi) => pool.push({ l: l.id, q: qi, d: l.disciplina })));
  const usados = new Set(), sel = [];
  const mist = embaralhar(pool);
  Object.entries(DIST).forEach(([d, n]) => mist.filter((x) => x.d === d).slice(0, n).forEach((x) => { sel.push(x); usados.add(`${x.l}#${x.q}`); }));
  for (const x of mist) { if (sel.length >= 50) break; if (!usados.has(`${x.l}#${x.q}`)) { sel.push(x); usados.add(`${x.l}#${x.q}`); } }
  const ordem = Object.keys(DIST);
  sel.sort((a, b) => ordem.indexOf(porId[a.l].disciplina) - ordem.indexOf(porId[b.l].disciplina));
  return { inicio: Date.now(), itens: sel.slice(0, 50).map(({ l, q }) => ({ l, q })), respostas: {}, entregue: false };
}

function telaSimulado() {
  topo('simulado');
  document.title = 'Simulado · Livro Vivo CFC';
  const folha = h('article', { class: 'folha' });
  $main.innerHTML = '';
  $main.append(h('div', { class: 'livro' }, folha));
  const sim = est.simAtual;
  const qtdPool = prontas().filter((l) => l.disciplina !== 'Estratégia').reduce((s, l) => s + l.questoes.length, 0);
  if (!sim || sim.entregue) {
    folha.append(
      h('div', { class: 'folha-cabeca' }, h('span', {}, 'Simulado'), h('span', {}, '4 horas · 50 questões')),
      h('h1', {}, 'Simulado do Exame'),
      h('p', {}, 'Igual à prova: até ', h('b', {}, '50 questões de múltipla escolha (A–D)'), ', ', h('b', {}, '4 horas'), ' (das 10h às 14h na prova real) e aprovação com ', h('b', {}, '50% de acertos'), '. A correção só aparece quando você entregar.'),
      h('div', { class: 'caixa' }, 'Dica: faça como no dia. Use uma calculadora simples, sem celular, e resolva primeiro as questões que você domina.'),
      h('p', {}, `Banco atual: ${qtdPool} questões de ${prontas().length} lições. As questões são sorteadas com uma distribuição aproximada por disciplina.`),
    );
    if (qtdPool < 10) { folha.append(h('p', { class: 'nok' }, 'Ainda há poucas questões no banco. Estude algumas lições antes.')); }
    folha.append(h('button', { class: 'btn-caneta primario', type: 'button', disabled: qtdPool < 10, onclick: () => { est.simAtual = montarSimulado(); salvar(); telaSimulado(); } }, 'Começar simulado'));
    if (est.simulados.length) {
      folha.append(h('h3', {}, 'Histórico'), kit.ui.tabela(['Data', 'Acertos', 'Resultado'], est.simulados.slice(-10).reverse().map((s) => [new Date(s.data).toLocaleString('pt-BR'), `${s.acertos}/${s.total}`, s.acertos * 2 >= s.total ? '<span class="ok">aprovada</span>' : '<span class="nok">abaixo de 50%</span>'])));
    }
    if (sim && sim.entregue) mostrarResultadoSim(folha, sim);
    return;
  }
  const LIM = 4 * 3600 * 1000;
  const rel = h('span', {});
  const mapa = h('div', { class: 'mapa-q' });
  const entregar = h('button', { class: 'btn-caneta primario pequeno', type: 'button' }, 'Entregar');
  folha.append(h('div', { class: 'relogio' }, rel, mapa, entregar), h('h1', {}, 'Simulado em andamento'));
  const atualizaMapa = () => {
    mapa.innerHTML = '';
    sim.itens.forEach((_, i) => mapa.append(h('a', { href: `#q${i + 1}`, class: sim.respostas[i] != null ? 'resp' : '', onclick: (e) => { e.preventDefault(); document.getElementById(`q${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, String(i + 1))));
  };
  sim.itens.forEach((it, i) => {
    const L = porId[it.l]; const q = L?.questoes[it.q];
    if (!q) return;
    const el = questaoEl(q, i + 1, { escolhida: sim.respostas[i] ?? null, mostrarLogo: false, aoResponder: (esc) => { sim.respostas[i] = esc; salvar(); atualizaMapa(); } });
    el.id = `q${i + 1}`;
    el.prepend(h('small', { class: 'caneta-vermelha' }, L.disciplina));
    const trocar = h('button', { class: 'btn-caneta pequeno', type: 'button', onclick: () => { delete sim.respostas[i]; salvar(); el.querySelectorAll('.alt').forEach((b) => { b.disabled = false; b.style.borderColor = ''; }); atualizaMapa(); } }, 'apagar resposta');
    el.append(trocar);
    folha.append(el);
  });
  folha.append(h('p', {}, h('button', { class: 'btn-caneta primario', type: 'button', onclick: () => fim() }, 'Entregar o simulado')));
  const fim = () => {
    const faltam = sim.itens.length - Object.keys(sim.respostas).length;
    if (faltam > 0 && !fim.confirmado) { fim.confirmado = true; avisar(`Faltam ${faltam} questões. Clique de novo em Entregar para confirmar.`); setTimeout(() => (fim.confirmado = false), 5000); return; }
    sim.entregue = true;
    let ac = 0;
    sim.itens.forEach((it, i) => { const q = porId[it.l]?.questoes[it.q]; if (!q) return; if (sim.respostas[i] === q.correta) ac++; else est.erros[`${it.l}#${it.q}`] = { quando: Date.now() }; });
    est.simulados.push({ data: Date.now(), acertos: ac, total: sim.itens.length });
    salvar(); telaSimulado();
  };
  entregar.onclick = fim;
  const tick = () => {
    const rest = LIM - (Date.now() - sim.inicio);
    if (rest <= 0) { fim.confirmado = true; fim(); return; }
    const hh = Math.floor(rest / 3600000), mm = Math.floor((rest % 3600000) / 60000), ss = Math.floor((rest % 60000) / 1000);
    rel.textContent = `⏱ ${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} · ${Object.keys(sim.respostas).length}/${sim.itens.length}`;
  };
  tick(); atualizaMapa();
  const iv = setInterval(tick, 1000);
  limparTela = () => clearInterval(iv);
}

function mostrarResultadoSim(folha, sim) {
  let ac = 0; const porD = {};
  sim.itens.forEach((it, i) => { const L = porId[it.l]; const q = L?.questoes[it.q]; if (!q) return; const d = (porD[L.disciplina] ||= { a: 0, t: 0 }); d.t++; if (sim.respostas[i] === q.correta) { ac++; d.a++; } });
  const tot = sim.itens.length, ok = ac * 2 >= tot;
  folha.append(
    h('hr'),
    h('div', { class: 'resultado-final' }, h('h2', {}, 'Último simulado'), h('div', { class: `grande ${ok ? 'ok' : 'nok'}` }, `${ac}/${tot}`), h('p', { class: ok ? 'ok' : 'nok' }, ok ? 'Aprovada! Continue assim. ✓' : `Faltaram ${Math.ceil(tot / 2) - ac} acertos para os 50%. Bora revisar os erros!`)),
    h('h3', {}, 'Por disciplina'),
    kit.ui.tabela(['Disciplina', 'Acertos', '%'], Object.entries(porD).map(([d, v]) => [d, `${v.a}/${v.t}`, `<span class="${v.a * 2 >= v.t ? 'ok' : 'nok'}">${fmt.pct((100 * v.a) / v.t, 0)}</span>`])),
    h('h3', {}, 'Correção comentada'),
  );
  sim.itens.forEach((it, i) => { const q = porId[it.l]?.questoes[it.q]; if (!q) return; const el = questaoEl(q, i + 1, { mostrarLogo: true }); const r = sim.respostas[i]; if (r != null) el.revelar(r); else { el.revelar(-1); el.prepend(h('p', { class: 'nok' }, 'Em branco')); } folha.append(el); });
}

/* =================== Caderno de erros =================== */
function telaErros() {
  topo('erros');
  document.title = 'Caderno de erros · Livro Vivo CFC';
  const folha = h('article', { class: 'folha' });
  $main.innerHTML = '';
  $main.append(h('div', { class: 'livro' }, folha));
  const itens = Object.keys(est.erros).map((k) => { const [l, q] = k.split('#'); return { k, L: porId[l], qi: Number(q) }; }).filter((x) => x.L && x.L.questoes?.[x.qi]);
  folha.append(h('div', { class: 'folha-cabeca' }, h('span', {}, 'Caderno de erros'), h('span', {}, `${itens.length} questão(ões)`)), h('h1', {}, 'Caderno de erros'),
    h('p', {}, 'Aqui ficam as questões que você errou nas lições e nos simulados. Acertou de novo? Ela sai do caderno.'));
  if (!itens.length) { folha.append(h('div', { class: 'caixa' }, 'Nenhum erro guardado. Faça as questões das lições ou um simulado.')); return; }
  embaralhar(itens).forEach((x, n) => {
    const el = questaoEl(x.L.questoes[x.qi], n + 1, { aoResponder: (i, ok) => { if (ok) { delete est.erros[x.k]; avisar('Acertou! Saiu do caderno de erros ✓'); } else est.erros[x.k] = { quando: Date.now() }; salvar(); topo('erros'); } });
    el.prepend(h('small', {}, h('a', { href: `#/licao/${x.L.id}/1` }, `Lição ${x.L.numero}: ${x.L.titulo}`)));
    folha.append(el);
  });
}

/* =================== Plano de estudo =================== */
function telaPlano() {
  topo('plano');
  document.title = 'Plano de estudo · Livro Vivo CFC';
  const folha = h('article', { class: 'folha' });
  $main.innerHTML = '';
  $main.append(h('div', { class: 'livro' }, folha));
  const inp = h('input', { type: 'date', value: est.dataProva || '', class: 'campo-inp', style: { width: '200px' }, 'aria-label': 'Data da prova' });
  inp.addEventListener('change', () => { est.dataProva = inp.value || null; salvar(); telaPlano(); });
  folha.append(h('div', { class: 'folha-cabeca' }, h('span', {}, 'Plano de estudo'), h('span', {}, '')), h('h1', {}, 'Plano até o dia da prova'),
    h('label', {}, h('b', {}, 'Data da prova: '), inp),
    h('p', {}, 'O plano distribui as lições ainda não estudadas pelos dias que faltam e começa pelas que mais caem. Ele reserva os dois últimos dias para o simulado e a revisão dos erros. Confirme a data no site do CFC/FGV.'));
  const d = diasAteProva();
  if (d == null) { folha.append(h('div', { class: 'caixa' }, 'Escolha a data da prova para gerar o plano.')); return; }
  if (d < 0) { folha.append(h('div', { class: 'caixa' }, 'Essa data já passou. Atualize para a próxima edição.')); return; }
  const pend = prontas().filter((l) => !est.licoes[l.id]?.concluida);
  const prio = { alta: 0, media: 1, baixa: 2 };
  const fila = [...pend].sort((a, b) => prio[a.incidencia] - prio[b.incidencia] || a.numero - b.numero);
  const diasEstudo = Math.max(1, d - 2);
  const totalMin = fila.reduce((s, l) => s + (l.tempo || 40), 0);
  const porDia = Math.max(30, Math.ceil(totalMin / diasEstudo));
  folha.append(h('p', {}, `Faltam ${d} dia(s). Lições pendentes: ${fila.length} (cerca de ${Math.round(totalMin / 60)} h). Ritmo sugerido: `, h('mark', {}, `~${Math.round(porDia / 6) * 6 >= 60 ? `${fmt.num(porDia / 60, 1)} h` : `${porDia} min`} por dia`), '.'));
  if (d <= 3) folha.append(h('div', { class: 'caixa alerta' }, 'Pouco tempo: foque nas lições de incidência alta, nos resumos de bolso e no caderno de erros.'));
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const lista = h('div', {});
  let i = 0;
  for (let k = 0; k <= d; k++) {
    const dia = new Date(hoje); dia.setDate(hoje.getDate() + k);
    const tarefas = [];
    if (k === d) tarefas.push('Dia da prova: leve documento com foto e caneta preta; a calculadora não pode guardar textos. Boa prova!');
    else if (k === d - 1) tarefas.push('Revisão leve: releia os resumos de bolso e os macetes. Durma cedo.');
    else if (k === d - 2 && d >= 3) tarefas.push(h('span', {}, h('a', { href: '#/simulado' }, 'Simulado completo'), ' + ', h('a', { href: '#/erros' }, 'caderno de erros')));
    else {
      let min = 0;
      while (i < fila.length && (min === 0 || min + (fila[i].tempo || 40) <= porDia * 1.15)) { const l = fila[i++]; min += l.tempo || 40; tarefas.push(h('a', { href: `#/licao/${l.id}/0` }, `${l.numero}. ${l.titulo}`)); }
      if (k > 0 && k % 4 === 0) tarefas.push(h('a', { href: '#/erros' }, '20 min no caderno de erros'));
      if (!tarefas.length) tarefas.push(h('span', {}, 'Revisão: ', h('a', { href: '#/erros' }, 'caderno de erros'), ' e questões das lições de incidência alta.'));
    }
    lista.append(h('div', { class: `dia ${k === 0 ? 'hoje' : ''}` }, h('div', { class: 'data' }, k === 0 ? 'Hoje' : dia.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })), h('ul', {}, tarefas.map((t) => h('li', {}, t)))));
  }
  if (i < fila.length) folha.append(h('div', { class: 'caixa alerta' }, `Não cabe tudo: ${fila.length - i} lição(ões) de menor incidência ficaram de fora. Leia pelo menos o resumo de bolso delas.`));
  folha.append(lista);
}

/* =================== Versão em texto =================== */
function telaTexto() {
  topo('texto');
  document.title = 'Versão em texto · Livro Vivo CFC';
  const folha = h('article', { class: 'folha versao-texto' });
  $main.innerHTML = '';
  $main.append(h('div', { class: 'livro' }, folha));
  folha.append(h('h1', {}, 'Versão em texto'), h('p', {}, 'Todo o conteúdo em uma página só: bom para leitor de tela, busca (Ctrl+F) e impressão. Os experimentos interativos ficam só na versão do caderno.'),
    h('p', { class: 'nao-imprimir' }, h('button', { class: 'btn-caneta', type: 'button', onclick: () => window.print() }, 'Imprimir / salvar PDF')),
    h('nav', { 'aria-label': 'Índice', class: 'nao-imprimir' }, h('ol', {}, prontas().map((l) => h('li', {}, h('a', { href: `#t-${l.id}`, onclick: (e) => { e.preventDefault(); document.getElementById(`t-${l.id}`)?.scrollIntoView(); } }, l.titulo))))));
  prontas().forEach((L) => {
    const s = h('section', { class: 'licao-texto', id: `t-${L.id}` });
    s.append(h('h2', {}, `${L.numero}. ${L.titulo}`), h('p', {}, h('i', {}, `${L.disciplina} · incidência ${L.incidencia}`)), h('p', {}, h('b', {}, 'Pergunta: '), L.pergunta));
    L.paginas.forEach((p) => s.append(h('h3', {}, p.titulo), h('div', { html: p.html })));
    if (L.macetes?.length) s.append(h('h3', {}, 'Macetes'), h('ul', {}, L.macetes.map((m) => h('li', { html: m }))));
    if (L.questoes?.length) {
      s.append(h('h3', {}, 'Questões'));
      L.questoes.forEach((q, i) => s.append(h('div', { class: 'questao' }, h('p', { html: `<b>${i + 1}.</b> ${q.enunciado}` }), h('ol', { type: 'A' }, q.alternativas.map((a) => h('li', { html: a }))), h('details', {}, h('summary', {}, 'Ver gabarito'), h('p', { html: `<b>Gabarito: ${LETRAS[q.correta]}</b>. ${q.comentario}` })))));
    }
    s.append(h('h3', {}, 'Resumo'), h('ul', {}, L.resumo.map((x) => h('li', { html: x }))));
    folha.append(s);
  });
}

rota();
