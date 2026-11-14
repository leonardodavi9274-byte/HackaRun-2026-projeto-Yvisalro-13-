// Gera os dados do modo demonstração com a planta em escala real (Shopping Veredas Douradas, fictício).
// Uso, na raiz: node backend/scripts/generate-demo-veredas.mjs
// Lê 0021_veredas_douradas_map.sql e posiciona as lojas fictícias do catálogo do protótipo em unidades
// de mesma categoria, escolhendo a unidade cuja distância de caminhada a partir da entrada principal
// fica mais próxima da distância usada nas telas. Grava:
//  - backend/src/infrastructure/demo/veredas-seed.ts (mapa + lojas servidos pela API em memória)
//  - frontend/src/features/demo/data/store-placement.js (piso e distância real de cada loja do catálogo)
import {readFileSync, writeFileSync} from "node:fs";
import {indexMall} from "../../frontend/src/features/mall-map/models/map-document.js";
import {buildGraph, distancesFrom} from "../../frontend/src/features/mall-map/models/pathfinding.js";

const root = new URL("../../", import.meta.url);
const sql = readFileSync(new URL("backend/supabase/migrations/0021_veredas_douradas_map.sql", root), "utf8");
const document = JSON.parse(sql.match(/'coordination','(.*)'(?:::jsonb)?,(?:true|false)\);/)[1].replace(/''/g, "'"));
const vdStores = [...sql.matchAll(/\('(vd-[a-z0-9-]+)','veredas-douradas','([^']+)','([a-z-]+)','([^']+)'/g)]
  .map(([, id, name, categoryId, unitId]) => ({id, name, categoryId, unitId}));

// Lojas do catálogo fictício (frontend/src/features/demo/data/catalog.js) e a distância das telas.
const PROTOTYPE = [
  ["grao-fino", "Grão Fino", "cafe-doces", 30], ["casa-ninho", "Casa Ninho", "casa", 60],
  ["passo-firme", "Passo Firme", "tenis", 70], ["moda-leve", "Moda Leve", "moda", 80],
  ["pagina-viva", "Página Viva", "livros", 95], ["doce-aurora", "Doce Aurora", "cafe-doces", 110],
  ["pixel-house", "Pixel House", "eletronicos", 120], ["arena-games", "Arena Games", "games", 150],
  ["brilho-beleza", "Brilho Beleza", "beleza", 180], ["vento-moda", "Vento Moda", "moda", 190],
  ["ponto-esporte", "Ponto Esporte", "esporte", 200], ["sport-vibe", "Sport Vibe", "tenis", 210],
  ["corre-tenis", "Corre Tênis", "tenis", 230], ["megatech", "Megatech", "eletronicos", 340],
  ["lumen-tech", "Lumen Tech", "eletronicos", 350], ["estante-azul", "Estante Azul", "livros", 360],
  ["lar-sereno", "Lar Sereno", "casa", 370], ["flor-de-pele", "Flor de Pele", "beleza", 380],
  ["trilha-esporte", "Trilha Esporte", "esporte", 395], ["som-e-cia", "Som&Cia", "eletronicos", 410],
];
const ENTRANCE = "t-entrada-sul";

const index = indexMall({mall: {}, map: {document}, stores: []});
const graph = buildGraph(index);
const entrance = [...index.pointById.values()].find(p => p.id === ENTRANCE || p.label.startsWith("Entrada Sul"));
const dist = distancesFrom(graph, entrance.node);
const unitDistance = unitId => dist.get(index.unitById.get(unitId).door) ?? Infinity;

const occupied = new Set(vdStores.map(s => s.unitId));
const vacant = [...index.unitById.values()].filter(u => !occupied.has(u.id) && u.floorId === "t").map(u => ({unitId: u.id}));
const replaced = new Set(), takenVacant = new Set(), placement = {};

// Categorias com menos unidades primeiro; sem candidata, usa uma unidade vaga do Térreo.
const scarcity = c => vdStores.filter(s => s.categoryId === c).length;
for (const [id, name, categoryId, target] of [...PROTOTYPE].sort((a, b) => scarcity(a[2]) - scarcity(b[2]) || a[3] - b[3])) {
  const pick = list => list.filter(c => Number.isFinite(unitDistance(c.unitId)))
    .sort((a, b) => Math.abs(unitDistance(a.unitId) - target) - Math.abs(unitDistance(b.unitId) - target))[0];
  let chosen = pick(vdStores.filter(s => s.categoryId === categoryId && !replaced.has(s.id) && index.unitById.get(s.unitId).floorId === "t"));
  if (chosen) replaced.add(chosen.id);
  else { chosen = pick(vacant.filter(v => !takenVacant.has(v.unitId))); takenVacant.add(chosen.unitId); }
  placement[id] = {name, categoryId, unitId: chosen.unitId, floor: index.floorById.get(index.unitById.get(chosen.unitId).floorId).name,
    distanceM: Math.round(unitDistance(chosen.unitId))};
}

const stores = [...vdStores.filter(s => !replaced.has(s.id)),
  ...Object.entries(placement).map(([id, p]) => ({id, name: p.name, categoryId: p.categoryId, unitId: p.unitId}))];

writeFileSync(new URL("backend/src/infrastructure/demo/veredas-seed.ts", root),
  "// Gerado por backend/scripts/generate-demo-veredas.mjs a partir de 0021_veredas_douradas_map.sql.\n" +
  "// Shopping, lojas e acessos fictícios. Não editar à mão: altere o script e gere de novo.\n" +
  "export const VEREDAS_MAP_DOCUMENT: unknown = " + JSON.stringify(document) + ";\n\n" +
  "export const VEREDAS_STORES: ReadonlyArray<{id: string; name: string; categoryId: string; unitId: string | null}> = " +
  JSON.stringify(stores, null, 1) + ";\n");

writeFileSync(new URL("frontend/src/features/demo/data/store-placement.js", root),
  "// Gerado por backend/scripts/generate-demo-veredas.mjs. Piso e distância de caminhada (m) a partir da\n" +
  `// ${entrance.label}, calculados no grafo da planta do Shopping Veredas Douradas (fictício).\n` +
  "export const STORE_PLACEMENT = " + JSON.stringify(Object.fromEntries(Object.entries(placement).map(([id, p]) => [id, {unitId: p.unitId, floor: p.floor, distanceM: p.distanceM}])), null, 1) + ";\n");

console.log(`Entrada: ${entrance.label}; lojas: ${stores.length} (${replaced.size} substituídas, ${takenVacant.size} em unidades vagas)`);
for (const [id, p] of Object.entries(placement)) console.log(id.padEnd(15), p.unitId.padEnd(12), String(p.distanceM).padStart(4), "m", p.floor);
