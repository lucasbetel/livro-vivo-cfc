// Capa 3D: caderno sobre a mesa, que abre ao clicar.
import * as THREE from 'three';

function texturaCanvas(w, hh, desenhar) {
  const c = document.createElement('canvas');
  c.width = w; c.height = hh;
  desenhar(c.getContext('2d'), w, hh);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texCapa() {
  return texturaCanvas(1024, 1366, (g, w, hh) => {
    const grad = g.createLinearGradient(0, 0, w, hh);
    grad.addColorStop(0, '#24467d'); grad.addColorStop(1, '#162c52');
    g.fillStyle = grad; g.fillRect(0, 0, w, hh);
    // textura de tecido
    g.globalAlpha = 0.06; g.strokeStyle = '#fff';
    for (let i = 0; i < hh; i += 6) { g.beginPath(); g.moveTo(0, i); g.lineTo(w, i + 3); g.stroke(); }
    g.globalAlpha = 1;
    // etiqueta
    g.save(); g.translate(w / 2, 520); g.rotate(-0.025);
    g.fillStyle = '#fbf7ee'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
    g.fillRect(-380, -250, 760, 500); g.shadowColor = 'transparent';
    g.strokeStyle = 'rgba(70,120,190,.35)'; g.lineWidth = 2;
    for (let y = -170; y < 240; y += 52) { g.beginPath(); g.moveTo(-360, y); g.lineTo(360, y); g.stroke(); }
    g.strokeStyle = 'rgba(214,69,65,.6)'; g.beginPath(); g.moveTo(-300, -250); g.lineTo(-300, 250); g.stroke();
    g.fillStyle = '#1f3a68'; g.textAlign = 'center';
    g.font = '700 150px Caveat, cursive'; g.fillText('Livro Vivo', 30, -60);
    g.font = '400 70px Caveat, cursive'; g.fillStyle = '#c0392b'; g.fillText('Exame de Suficiência', 30, 40);
    g.fillStyle = '#1f3a68'; g.font = '400 62px Caveat, cursive'; g.fillText('Contabilidade · CFC', 30, 130);
    g.font = '400 46px Caveat, cursive'; g.fillStyle = '#6b6b6b'; g.fillText('24 lições + simulado', 30, 205);
    g.restore();
    // elástico
    g.fillStyle = '#111b30'; g.fillRect(w - 120, 0, 34, hh);
    // rodapé
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '400 64px Caveat, cursive'; g.textAlign = 'center';
    g.fillText('A = P + PL', w / 2 - 50, 1080);
    g.font = '400 44px Caveat, cursive'; g.fillStyle = 'rgba(255,255,255,.6)';
    g.fillText('25 acertos e a carteira do CRC é sua ✓', w / 2 - 50, 1170);
  });
}

function texPagina() {
  return texturaCanvas(1024, 1366, (g, w, hh) => {
    g.fillStyle = '#fbf7ee'; g.fillRect(0, 0, w, hh);
    g.strokeStyle = 'rgba(70,120,190,.3)'; g.lineWidth = 2;
    for (let y = 160; y < hh; y += 56) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(214,69,65,.55)'; g.beginPath(); g.moveTo(130, 0); g.lineTo(130, hh); g.stroke();
    g.fillStyle = '#c0392b'; g.font = '400 92px Caveat, cursive'; g.textAlign = 'left';
    g.fillText('Para a Mikaelen,', 170, 380);
    g.fillStyle = '#1f3a68'; g.font = '400 70px Caveat, cursive';
    ['um caderno vivo para estudar', 'no seu ritmo: pergunta, palpite,', 'experimento e resposta.', '', 'Você vai passar! ♥'].forEach((l, i) => g.fillText(l, 170, 494 + i * 112));
  });
}

export function criarCapa(el) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  cena.fog = new THREE.Fog(0xe9dfc8, 14, 30);
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const camBase = new THREE.Vector3(0, 9.5, 8.2);
  cam.position.copy(camBase);
  const alvo = new THREE.Vector3(0, 0, 2.2);

  cena.add(new THREE.HemisphereLight(0xfff6e0, 0x7a6448, 1.1));
  const sol = new THREE.DirectionalLight(0xfff1d6, 2.2);
  sol.position.set(-5, 10, 4); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
  cena.add(sol);

  // mesa
  const mesaTex = texturaCanvas(512, 512, (g, w, hh) => {
    g.fillStyle = '#b98b5b'; g.fillRect(0, 0, w, hh);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = `rgba(${90 + Math.random() * 40},${55 + Math.random() * 25},25,${0.08 + Math.random() * 0.12})`;
      g.lineWidth = 1 + Math.random() * 3; g.beginPath();
      const y = Math.random() * hh; g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + Math.random() * 20 - 10, w * 0.6, y + Math.random() * 20 - 10, w, y + Math.random() * 16 - 8); g.stroke();
    }
  });
  mesaTex.wrapS = mesaTex.wrapT = THREE.RepeatWrapping; mesaTex.repeat.set(4, 4);
  const mesa = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: mesaTex, roughness: 0.8 }));
  mesa.rotation.x = -Math.PI / 2; mesa.receiveShadow = true; cena.add(mesa);

  // livro
  const W = 3.6, H = 4.8, E = 0.5, CE = 0.06;
  const livro = new THREE.Group(); cena.add(livro);
  const papel = new THREE.MeshStandardMaterial({ color: 0xf6efdf, roughness: 0.95 });
  const azul = new THREE.MeshStandardMaterial({ color: 0x1f3a68, roughness: 0.7 });
  const miolo = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, E - CE * 2, H - 0.12), papel);
  miolo.position.set(0.04, E / 2, 0); miolo.castShadow = true; livro.add(miolo);
  const contra = new THREE.Mesh(new THREE.BoxGeometry(W, CE, H), azul);
  contra.position.y = CE / 2; contra.castShadow = true; livro.add(contra);
  const lombada = new THREE.Mesh(new THREE.BoxGeometry(CE * 1.5, E, H), azul);
  lombada.position.set(-W / 2, E / 2, 0); livro.add(lombada);
  // primeira página (aparece ao abrir)
  const pag1 = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, H - 0.2), new THREE.MeshStandardMaterial({ map: texPagina(), roughness: 0.95 }));
  pag1.rotation.x = -Math.PI / 2; pag1.position.set(0.04, E - CE + 0.002, 0); livro.add(pag1);
  // capa articulada na lombada
  const dobra = new THREE.Group(); dobra.position.set(-W / 2, E - CE / 2, 0); livro.add(dobra);
  const matCapa = [azul, azul, new THREE.MeshStandardMaterial({ map: texCapa(), roughness: 0.6 }), papel, azul, azul];
  const capa = new THREE.Mesh(new THREE.BoxGeometry(W, CE, H), matCapa);
  capa.position.x = W / 2; capa.castShadow = true; dobra.add(capa);
  livro.rotation.y = -0.18; livro.position.set(0, 0, 0.3);

  // lápis
  const lapis = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 3.4, 6), new THREE.MeshStandardMaterial({ color: 0xf2b632, roughness: 0.6 }));
  corpo.rotation.z = Math.PI / 2; corpo.castShadow = true; lapis.add(corpo);
  const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.45, 6), new THREE.MeshStandardMaterial({ color: 0xe8c9a0 }));
  ponta.rotation.z = -Math.PI / 2; ponta.position.x = 1.92; lapis.add(ponta);
  const borr = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.32, 12), new THREE.MeshStandardMaterial({ color: 0xe57373 }));
  borr.rotation.z = Math.PI / 2; borr.position.x = -1.86; lapis.add(borr);
  lapis.position.set(3.4, 0.12, 1.4); lapis.rotation.y = 0.9; cena.add(lapis);

  // calculadora (a prova permite calculadora simples)
  const calc = new THREE.Group();
  const cc = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 2.2), new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 0.5 }));
  cc.castShadow = true; calc.add(cc);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.45), new THREE.MeshStandardMaterial({ color: 0xb9c7a5 }));
  visor.position.set(0, 0.09, -0.75); calc.add(visor);
  const tecla = new THREE.BoxGeometry(0.22, 0.05, 0.2);
  const matT = new THREE.MeshStandardMaterial({ color: 0xe8e2d6 });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { const t = new THREE.Mesh(tecla, matT); t.position.set(-0.45 + c * 0.3, 0.1, -0.25 + r * 0.3); calc.add(t); }
  calc.position.set(-3.8, 0.08, 1.2); calc.rotation.y = -0.35; cena.add(calc);

  // post-its
  const notas = [['Débito = aplicação', '#fff3a6', [3.1, 0.02, -1.6], 0.3], ['CMV = EI + C − EF', '#ffd6e0', [-3.3, 0.02, -1.8], -0.25], ['PE = CF ÷ MCu', '#d6f0ff', [2.6, 0.02, -3.2], -0.1]];
  notas.forEach(([txt, cor, pos, rot]) => {
    const t = texturaCanvas(256, 256, (g, w, hh) => { g.fillStyle = cor; g.fillRect(0, 0, w, hh); g.fillStyle = '#3b2f00'; g.font = '400 40px Caveat, cursive'; g.textAlign = 'center'; const p = txt.split(' = '); g.fillText(p[0] + ' =', w / 2, 110); g.fillText(p[1] || '', w / 2, 160); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(...pos); m.receiveShadow = true; cena.add(m);
  });

  // interação
  let mx = 0, my = 0;
  const mover = (e) => { const r = el.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - 0.5) * 2; my = ((e.clientY - r.top) / r.height - 0.5) * 2; };
  el.addEventListener('pointermove', mover);
  const ro = new ResizeObserver(() => {
    const w = el.clientWidth || 800, hh = el.clientHeight || 600;
    renderer.setSize(w, hh, false); cam.aspect = w / hh;
    cam.fov = w < hh ? 52 : 36; cam.updateProjectionMatrix();
  });
  ro.observe(el);

  let abrindo = 0, abrirRes = null, vivo = true, t0 = performance.now();
  const reduz = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('leitura');
  const loop = (now) => {
    if (!vivo) return;
    const t = (now - t0) / 1000;
    if (abrindo > 0) {
      abrindo = Math.min(1, abrindo + 0.012);
      const e = abrindo < 0.5 ? 2 * abrindo * abrindo : 1 - Math.pow(-2 * abrindo + 2, 2) / 2;
      dobra.rotation.z = e * Math.PI * 0.98;
      cam.position.lerpVectors(camBase, new THREE.Vector3(-0.2, 7.2, 2.6), e);
      if (abrindo >= 1 && abrirRes) { const r = abrirRes; abrirRes = null; setTimeout(r, 900); }
    } else if (!reduz()) {
      dobra.rotation.z = 0.04 + Math.sin(t * 1.3) * 0.03;
      cam.position.x += (camBase.x + mx * 0.9 - cam.position.x) * 0.05;
      cam.position.y += (camBase.y - my * 0.5 - cam.position.y) * 0.05;
    }
    cam.lookAt(alvo);
    renderer.render(cena, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return {
    abrir() {
      if (reduz()) return Promise.resolve();
      return new Promise((res) => { abrirRes = res; abrindo = 0.001; });
    },
    destruir() { vivo = false; ro.disconnect(); el.removeEventListener('pointermove', mover); renderer.dispose(); renderer.domElement.remove(); },
  };
}
