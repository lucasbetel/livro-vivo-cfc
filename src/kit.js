// Kit de ferramentas para as lições (DOM, traço de caneta, controles, 3D).
// As lições recebem este objeto em demo.montar(el, kit) — não precisam importar nada.
import rough from 'roughjs';
import * as THREE from 'three';

const NS = 'http://www.w3.org/2000/svg';
export const reduzMovimento = () =>
  document.body.classList.contains('leitura') ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- DOM ---------------- */
// h('div', {class:'x', onclick: fn, html:'<b>oi</b>'}, filho1, 'texto', ...)
export function h(tag, props = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) {
    if (f == null || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return el;
}

/* ---------------- Formatação ---------------- */
export const fmt = {
  brl: (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  num: (v, casas = 2) => (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }),
  int: (v) => Math.round(Number(v) || 0).toLocaleString('pt-BR'),
  pct: (v, casas = 1) => `${(Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`,
};

/* ---------------- Traço de caneta (SVG + roughjs) ---------------- */
export const INK = {
  azul: '#1f3a68', vermelho: '#c0392b', verde: '#2e7d4f', lapis: '#6b6b6b',
  laranja: '#d9822b', roxo: '#6a3d9a', marca: 'rgba(255, 221, 0, 0.55)', rosa: 'rgba(255, 105, 180, 0.35)',
};

export function tracar(no, dur = 700) {
  if (reduzMovimento()) return;
  const paths = no.tagName === 'path' ? [no] : [...no.querySelectorAll('path')];
  paths.forEach((p, i) => {
    if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none' && !p.getAttribute('stroke')) return;
    let len = 0;
    try { len = p.getTotalLength(); } catch { return; }
    if (!len) return;
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset ${dur}ms ease ${i * 40}ms`;
    requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
  });
}

// Quadro de desenho à caneta. Coordenadas no viewBox (largura x altura).
export function quadro(el, { largura = 640, altura = 360, semente = 7 } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${largura} ${altura}`);
  svg.setAttribute('role', 'img');
  svg.classList.add('pen-svg');
  el.appendChild(svg);
  const base = { seed: semente, roughness: 1.1, bowing: 1.1, stroke: INK.azul, strokeWidth: 1.7 };
  const rc = rough.svg(svg, { options: base });
  const conv = (o = {}) => {
    const r = { ...o };
    if (o.cor) r.stroke = o.cor;
    if (o.preenchimento) { r.fill = o.preenchimento; r.fillStyle = o.estilo || 'hachure'; r.hachureGap = o.espaco || 6; }
    if (o.espessura) r.strokeWidth = o.espessura;
    if (o.tracejado) r.strokeLineDash = [8, 6];
    delete r.cor; delete r.preenchimento; delete r.estilo; delete r.espaco; delete r.espessura; delete r.tracejado; delete r.animar;
    return r;
  };
  const add = (no, o = {}) => { svg.appendChild(no); if (o.animar !== false) tracar(no); return no; };
  const q = {
    svg, rc, largura, altura,
    linha: (x1, y1, x2, y2, o = {}) => add(rc.line(x1, y1, x2, y2, conv(o)), o),
    retangulo: (x, y, w, hh, o = {}) => add(rc.rectangle(x, y, w, hh, conv(o)), o),
    circulo: (x, y, d, o = {}) => add(rc.circle(x, y, d, conv(o)), o),
    elipse: (x, y, w, hh, o = {}) => add(rc.ellipse(x, y, w, hh, conv(o)), o),
    poligono: (pts, o = {}) => add(rc.polygon(pts, conv(o)), o),
    curva: (pts, o = {}) => add(rc.curve(pts, conv(o)), o),
    caminho: (d, o = {}) => add(rc.path(d, conv(o)), o),
    seta: (x1, y1, x2, y2, o = {}) => {
      const g = document.createElementNS(NS, 'g');
      g.appendChild(rc.line(x1, y1, x2, y2, conv(o)));
      const a = Math.atan2(y2 - y1, x2 - x1), t = o.ponta || 12;
      g.appendChild(rc.line(x2, y2, x2 - t * Math.cos(a - 0.45), y2 - t * Math.sin(a - 0.45), conv(o)));
      g.appendChild(rc.line(x2, y2, x2 - t * Math.cos(a + 0.45), y2 - t * Math.sin(a + 0.45), conv(o)));
      return add(g, o);
    },
    // texto manuscrito; o = {cor, tamanho, ancora:'start'|'middle'|'end', peso, fonte:'mao'|'texto'}
    texto: (x, y, str, o = {}) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x); t.setAttribute('y', y);
      t.setAttribute('fill', o.cor || INK.azul);
      t.setAttribute('font-size', o.tamanho || 22);
      t.setAttribute('text-anchor', o.ancora || 'start');
      t.setAttribute('dominant-baseline', o.base || 'alphabetic');
      if (o.peso) t.setAttribute('font-weight', o.peso);
      t.classList.add(o.fonte === 'texto' ? 'pen-texto-plano' : 'pen-texto');
      t.textContent = str;
      svg.appendChild(t);
      if (o.animar !== false && !reduzMovimento()) { t.style.opacity = 0; t.style.transition = 'opacity .5s'; requestAnimationFrame(() => (t.style.opacity = 1)); }
      return t;
    },
    marca: (x, y, w, hh) => { // marca-texto
      const r = document.createElementNS(NS, 'rect');
      Object.entries({ x, y, width: w, height: hh, fill: INK.marca, rx: 4 }).forEach(([k, v]) => r.setAttribute(k, v));
      svg.insertBefore(r, svg.firstChild);
      return r;
    },
    remover: (no) => no && no.remove(),
    limpar: () => { svg.innerHTML = ''; },
  };
  return q;
}

// Gráfico de eixos à caneta. Devolve o quadro + escalas sx/sy + funções de série.
export function grafico(el, { largura = 640, altura = 380, xmin = 0, xmax = 10, ymin = 0, ymax = 10, margem = 56, rotuloX = '', rotuloY = '', marcasX = 5, marcasY = 5, fmtX = (v) => fmt.int(v), fmtY = (v) => fmt.int(v) } = {}) {
  const q = quadro(el, { largura, altura });
  const L = margem, R = largura - 20, T = 20, B = altura - margem + 10;
  const sx = (v) => L + ((v - xmin) / (xmax - xmin)) * (R - L);
  const sy = (v) => B - ((v - ymin) / (ymax - ymin)) * (B - T);
  const g = {
    ...q, sx, sy,
    eixos() {
      q.seta(L, B, R + 8, B, { cor: INK.lapis });
      q.seta(L, B, L, T - 8, { cor: INK.lapis });
      for (let i = 0; marcasX > 0 && i <= marcasX; i++) {
        const v = xmin + ((xmax - xmin) * i) / marcasX;
        q.linha(sx(v), B - 4, sx(v), B + 4, { cor: INK.lapis, animar: false });
        q.texto(sx(v), B + 22, fmtX(v), { tamanho: 15, ancora: 'middle', cor: INK.lapis, fonte: 'texto', animar: false });
      }
      for (let i = 0; marcasY > 0 && i <= marcasY; i++) {
        const v = ymin + ((ymax - ymin) * i) / marcasY;
        q.linha(L - 4, sy(v), L + 4, sy(v), { cor: INK.lapis, animar: false });
        q.texto(L - 8, sy(v) + 5, fmtY(v), { tamanho: 14, ancora: 'end', cor: INK.lapis, fonte: 'texto', animar: false });
      }
      if (rotuloX) q.texto(R, B + 44, rotuloX, { tamanho: 20, ancora: 'end', cor: INK.lapis });
      if (rotuloY) q.texto(L + 8, T + 4, rotuloY, { tamanho: 20, cor: INK.lapis });
    },
    // serie(fn | [[x,y],...], {cor, passos})
    serie(f, o = {}) {
      const pts = typeof f === 'function'
        ? Array.from({ length: (o.passos || 40) + 1 }, (_, i) => { const x = xmin + ((xmax - xmin) * i) / (o.passos || 40); return [sx(x), sy(f(x))]; })
        : f.map(([x, y]) => [sx(x), sy(y)]);
      return o.reta ? q.linha(...pts[0], ...pts[pts.length - 1], o) : q.curva(pts, o);
    },
    ponto(x, y, rotulo, o = {}) {
      const c = q.circulo(sx(x), sy(y), o.d || 12, { cor: o.cor || INK.vermelho, preenchimento: o.cor || INK.vermelho, estilo: 'solid' });
      if (rotulo) q.texto(sx(x) + 10, sy(y) - 10, rotulo, { cor: o.cor || INK.vermelho, tamanho: o.tamanho || 20 });
      return c;
    },
    barra(x, largura, y, o = {}) {
      return q.retangulo(sx(x) - largura / 2, sy(y), largura, sy(ymin) - sy(y), { preenchimento: o.cor || INK.azul, cor: o.cor || INK.azul, ...o });
    },
  };
  return g;
}

/* ---------------- Controles ---------------- */
export function controle({ rotulo, min = 0, max = 100, passo = 1, valor = 50, formato = (v) => v, aoMudar }) {
  const id = `c${Math.random().toString(36).slice(2, 8)}`;
  const saida = h('output', { for: id, class: 'ctl-valor' }, formato(valor));
  const inp = h('input', { type: 'range', id, min, max, step: passo, value: valor });
  inp.addEventListener('input', () => { const v = Number(inp.value); saida.textContent = formato(v); aoMudar && aoMudar(v); });
  const wrap = h('label', { class: 'ctl', for: id }, h('span', { class: 'ctl-rotulo' }, rotulo), inp, saida);
  wrap.valor = () => Number(inp.value);
  wrap.definir = (v) => { inp.value = v; saida.textContent = formato(Number(v)); };
  return wrap;
}

export function campo({ rotulo, valor = '', tipo = 'number', passo = 'any', aoMudar }) {
  const inp = h('input', { type: tipo, value: valor, step: passo, class: 'campo-inp' });
  inp.addEventListener('input', () => aoMudar && aoMudar(tipo === 'number' ? Number(inp.value) : inp.value));
  return h('label', { class: 'campo' }, h('span', {}, rotulo), inp);
}

// botoes(['A','B'], (indice, botao) => {...}, {classe})
export function botoes(opcoes, aoEscolher, { classe = '' } = {}) {
  const g = h('div', { class: `grupo-botoes ${classe}`, role: 'group' });
  opcoes.forEach((o, i) => {
    const b = h('button', { type: 'button', class: 'btn-caneta' }, typeof o === 'string' ? o : o.rotulo);
    b.addEventListener('click', () => aoEscolher(i, b, g));
    g.appendChild(b);
  });
  return g;
}

// Cartão "faça sua previsão" reutilizável (pergunta → palpite → revela).
export function previsao({ pergunta, opcoes, correta, explicacao, aoResponder }) {
  const fb = h('div', { class: 'prev-fb', 'aria-live': 'polite' });
  const card = h('div', { class: 'previsao' }, h('p', { class: 'prev-pergunta', html: pergunta }));
  const g = botoes(opcoes, (i, b, grp) => {
    if (grp.dataset.respondido) return;
    grp.dataset.respondido = '1';
    [...grp.children].forEach((x, j) => { x.disabled = true; if (j === correta) x.classList.add('certo'); });
    if (i !== correta) b.classList.add('errado');
    fb.innerHTML = `<p class="${i === correta ? 'ok' : 'nok'}">${i === correta ? '✔ Boa previsão!' : '✘ Não foi dessa vez — veja por quê:'}</p><p>${explicacao}</p>`;
    aoResponder && aoResponder(i, i === correta);
  });
  card.append(g, fb);
  return card;
}

export function tabela(cabecalho, linhas, { classe = '' } = {}) {
  return h('table', { class: `tabela ${classe}` },
    h('thead', {}, h('tr', {}, cabecalho.map((c) => h('th', { html: String(c) })))),
    h('tbody', {}, linhas.map((l) => h('tr', {}, l.map((c) => h('td', { html: String(c) }))))));
}

/* ---------------- 3D (Three.js) ---------------- */
// Sprite com texto manuscrito para usar em cenas 3D.
export function rotulo3d(texto, { cor = INK.azul, tamanho = 64, fundo = null, escala = 1 } = {}) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const fonte = `600 ${tamanho}px Caveat, "Comic Sans MS", cursive`;
  ctx.font = fonte;
  const linhas = String(texto).split('\n');
  const w = Math.max(...linhas.map((l) => ctx.measureText(l).width)) + 24;
  const hh = tamanho * 1.15 * linhas.length + 12;
  c.width = Math.ceil(w); c.height = Math.ceil(hh);
  ctx.font = fonte;
  if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.fillStyle = cor; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  linhas.forEach((l, i) => ctx.fillText(l, c.width / 2, 6 + i * tamanho * 1.15));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const k = (0.01 * escala);
  sp.scale.set(c.width * k, c.height * k, 1);
  return sp;
}

// Palco 3D pronto: cena, câmera, luzes, arrastar para girar, redimensiona sozinho.
// const p = palco3d(el, {altura: 360}); p.cena.add(...); p.aoQuadro((dt, t) => ...); return p.destruir;
export function palco3d(el, { altura = 360, camera = [0, 3, 9], alvo = [0, 0.8, 0], girar = true } = {}) {
  const wrap = h('div', { class: 'palco3d', style: { height: `min(${altura}px, 92vw)` }, tabindex: '0', 'aria-label': 'Cena 3D: arraste ou use as setas para girar' });
  el.appendChild(wrap);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  wrap.appendChild(renderer.domElement);
  const cena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  cam.position.set(...camera);
  const alvoV = new THREE.Vector3(...alvo);
  cam.lookAt(alvoV);
  cena.add(new THREE.HemisphereLight(0xfff8e8, 0x8a7a60, 1.2));
  const sol = new THREE.DirectionalLight(0xffffff, 1.6);
  sol.position.set(4, 8, 5); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
  cena.add(sol);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.12 }));
  chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
  const raio = Math.hypot(camera[0] - alvo[0], camera[2] - alvo[2]);
  const altBase = camera[1];
  let fator = 1; // afasta a câmera em telas estreitas (celular)
  let ang = Math.atan2(camera[0] - alvo[0], camera[2] - alvo[2]), angAlvo = ang, arr = null;
  if (girar) {
    wrap.addEventListener('pointerdown', (e) => { arr = e.clientX; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', (e) => { if (arr != null) { angAlvo -= (e.clientX - arr) * 0.01; arr = e.clientX; } });
    wrap.addEventListener('pointerup', () => (arr = null));
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { angAlvo += 0.2; e.stopPropagation(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { angAlvo -= 0.2; e.stopPropagation(); e.preventDefault(); }
    });
  }
  const fns = [];
  const ro = new ResizeObserver(() => {
    const w = wrap.clientWidth || 600, hh = wrap.clientHeight || altura;
    renderer.setSize(w, hh, false); cam.aspect = w / hh; cam.updateProjectionMatrix();
    fator = Math.max(1, 1.45 / cam.aspect);
  });
  ro.observe(wrap);
  let vivo = true, ultimo = performance.now();
  const loop = (t) => {
    if (!vivo) return;
    const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
    ang += (angAlvo - ang) * 0.12;
    cam.position.x = alvoV.x + Math.sin(ang) * raio * fator; cam.position.z = alvoV.z + Math.cos(ang) * raio * fator;
    cam.position.y = alvoV.y + (altBase - alvoV.y) * fator;
    cam.lookAt(alvoV);
    fns.forEach((f) => f(dt, t / 1000));
    renderer.render(cena, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return {
    THREE, cena, camera: cam, renderer, el: wrap,
    aoQuadro: (f) => fns.push(f),
    destruir: () => { vivo = false; ro.disconnect(); renderer.dispose(); wrap.remove(); },
  };
}

// Material "papel/cartolina" padrão para objetos 3D.
export const mat3d = (cor = 0xf3e9d2, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0.02, ...extra });

export const kit = {
  h, fmt, INK, THREE,
  pen: { quadro, grafico, tracar },
  ui: { controle, campo, botoes, previsao, tabela },
  tres: { palco3d, rotulo3d, mat3d },
  reduzMovimento,
};
export default kit;
