// Valida a estrutura das lições: node scripts/validar.mjs [id-opcional]
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lessons');
const DISC = ['Estratégia', 'Contabilidade Geral', 'Contabilidade de Custos', 'Contabilidade Aplicada ao Setor Público',
  'Contabilidade Gerencial', 'Controladoria', 'Noções de Direito e Legislação Aplicada', 'Matemática Financeira e Estatística',
  'Teoria da Contabilidade', 'Legislação e Ética Profissional', 'Princípios de Contabilidade e Normas Brasileiras de Contabilidade',
  'Auditoria Contábil', 'Perícia Contábil', 'Língua Portuguesa Aplicada'];
const filtro = process.argv[2];
let erros = 0, avisos = 0, totalQ = 0;
const arquivos = readdirSync(dir).filter((f) => /^\d\d-.*\.js$/.test(f) && (!filtro || f.startsWith(filtro)));
for (const f of arquivos) {
  const id = f.replace(/\.js$/, '');
  const err = (m) => { erros++; console.log(`✘ ${id}: ${m}`); };
  const av = (m) => { avisos++; console.log(`! ${id}: ${m}`); };
  let L;
  try { L = (await import(pathToFileURL(join(dir, f)).href)).default; } catch (e) { err(`não carrega: ${e.message}`); continue; }
  if (L.stub) { av('ainda é STUB'); continue; }
  if (L.id !== id) err(`id "${L.id}" ≠ nome do arquivo`);
  if (!DISC.includes(L.disciplina)) err(`disciplina inválida: ${L.disciplina}`);
  ['titulo', 'subtitulo', 'pergunta'].forEach((k) => typeof L[k] === 'string' && L[k].trim() || err(`falta ${k}`));
  if (!['alta', 'media', 'baixa'].includes(L.incidencia)) err('incidencia inválida');
  if (!(L.tempo > 0)) err('tempo inválido');
  const p = L.previsao;
  if (!p || !Array.isArray(p.opcoes) || !(p.correta >= 0 && p.correta < p.opcoes.length) || !p.explicacao) err('previsao inválida');
  if (!Array.isArray(L.paginas) || L.paginas.length < 3) err('paginas: mínimo 3');
  (L.paginas || []).forEach((pg, i) => (pg.titulo && pg.html) || err(`pagina ${i} sem titulo/html`));
  if (!L.demo || typeof L.demo.montar !== 'function' || !L.demo.titulo) err('demo inválida');
  if (!Array.isArray(L.macetes) || L.macetes.length < 3) err('macetes: mínimo 3');
  if (!Array.isArray(L.resumo) || L.resumo.length < 5) err('resumo: mínimo 5');
  const q = L.questoes || [];
  if (q.length < 6) err(`questoes: ${q.length} (mínimo 6)`);
  const pos = [0, 0, 0, 0];
  q.forEach((x, i) => {
    if (!x.enunciado) err(`q${i + 1} sem enunciado`);
    if (!Array.isArray(x.alternativas) || x.alternativas.length !== 4) err(`q${i + 1} precisa de 4 alternativas`);
    if (!(Number.isInteger(x.correta) && x.correta >= 0 && x.correta <= 3)) err(`q${i + 1} correta inválida`);
    else pos[x.correta]++;
    if (!x.comentario) err(`q${i + 1} sem comentario`);
    if (new Set(x.alternativas || []).size !== (x.alternativas || []).length) err(`q${i + 1} alternativas repetidas`);
  });
  if (q.length >= 6 && Math.max(...pos) > Math.ceil(q.length * 0.5)) av(`gabarito concentrado: ${pos.join('/')}`);
  totalQ += q.length;
  console.log(`✔ ${id}: ${L.paginas.length} páginas, ${q.length} questões`);
}
console.log(`\n${arquivos.length} lições · ${totalQ} questões · ${erros} erro(s) · ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
