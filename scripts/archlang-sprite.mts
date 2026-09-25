// Régénère les symboles de mobilier issus d'ArchLang dans assets/icons/furniture.svg.
//
// Source : `fixtureGlyph` de ArchLang (MIT, voir THIRD_PARTY_NOTICES.md), lu dans
// un clone local. La table id → catégorie (ADAPTED) et les symboles propres au
// catalogue (EXTRA) vivent dans assets/icon-provenance.data.js : une seule source.
//
// Usage : ARCHLANG_DIR=/chemin/vers/archlang npx --yes tsx scripts/archlang-sprite.mts
//   puis : npm run icons:inline
// Le clone doit être à la révision ARCHLANG_REVISION et avoir ses dépendances
// installées (npm install). Le script n'est pas une dépendance d'exécution.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.ARCHLANG_DIR;
if (!dir) throw new Error('ARCHLANG_DIR : chemin du clone ArchLang requis');
const load = (p: string) => import(pathToFileURL(join(dir, p)).href);
const { fixtureGlyph, hasFixtureGlyph } = await load('src/elements/fixtures-glyphs.ts');
const { DEFAULT_THEME } = await load('src/theme.ts');

vm.runInThisContext(readFileSync(join(root, 'assets/icon-provenance.data.js'), 'utf8'));
const prov = (globalThis as any).TechnoHabIconProvenance;
const ADAPTED: Record<string, string> = prov.adapted;
const EXTRA: { id: string; label: string; category: string; w: number; d: number }[] = prov.extraSymbols;
if (process.env.ARCHLANG_REV_CHECK !== '0' && prov.archlangRevision) {
  console.error('Révision attendue :', prov.archlangRevision);
}

const theme: any = { ...DEFAULT_THEME, furnitureStroke: '#S', furnitureFill: '#B', opening: '#O' };
const sizes: any = { refDim: 1000, wallStroke: 3, thin: 1.6, roomFont: 30, areaFont: 22, dimFont: 20, furnFont: 17, margin: 170, hatchGap: 13 };
const f = (n: number) => String(+(n / 10).toFixed(2)); // mm ArchLang → cm du viewBox
const P = (p: any) => `${f(p.x)} ${f(p.y)}`;

function node(n: any): string {
  const pr = n.prim, stroked = n.paint.stroke && n.paint.stroke !== 'none';
  // Trait seul ; seul un aplat de la couleur du trait (point, ergot) reste plein.
  const solid = n.paint.fill === '#S';
  const shape = (tag: string, attrs: string) =>
    stroked ? `<${tag} class="outline" ${attrs}/>` : solid ? `<${tag} class="dot" ${attrs}/>` : '';
  switch (pr.t) {
    case 'polygon': return shape('path', `d="M${pr.pts.map(P).join('L')}z"`);
    case 'line': return `<path class="outline" d="M${P(pr.a)}L${P(pr.b)}"/>`;
    case 'circle': return shape('circle', `cx="${f(pr.center.x)}" cy="${f(pr.center.y)}" r="${f(pr.r)}"`);
    case 'arc': return `<path class="outline" d="M${P(pr.start)}A${f(pr.r)} ${f(pr.r)} 0 0 ${pr.sweep} ${P(pr.end)}"/>`;
    case 'region': return shape('path', `d="${pr.loops.map((l: any) => 'M' + l.map(P).join('L') + 'z').join('')}"`);
    case 'path': return shape('path', `d="${pr.loops.map((l: any) => `M${P(l.start)}` + l.edges.map((e: any) =>
      e.t === 'line' ? `L${P(e.to)}` : `A${f(e.r)} ${f(e.r)} 0 0 ${e.sweep} ${P(e.to)}`).join('') + 'z').join('')}"`);
    case 'text': return '';
    default: throw new Error('primitive ArchLang non gérée : ' + pr.t);
  }
}

function body(category: string, wCm: number, hCm: number): string {
  if (!hasFixtureGlyph(category)) throw new Error('pas de glyphe ArchLang : ' + category);
  const nodes = fixtureGlyph(category, { x: 0, y: 0, w: wCm * 10, h: hCm * 10 }, theme, sizes)!;
  return nodes.map(node).filter(Boolean).map((s: string) => `    ${s}`).join('\n');
}

const path = join(root, 'assets/icons/furniture.svg');
let svg = readFileSync(path, 'utf8');
const seen = new Set<string>();
svg = svg.replace(/(<symbol id="furn-([^"]+)" viewBox="0 0 (\S+) (\S+)"[^>]*>)([\s\S]*?)(<\/symbol>)/g,
  (m, open, id, w, h, _b, close) => {
    const cat = ADAPTED[id] || EXTRA.find((x) => x.id === id)?.category;
    if (!cat) return m;
    seen.add(id);
    return `${open}\n${body(cat, +w, +h)}\n  ${close}`;
  });
for (const x of EXTRA) {
  if (seen.has(x.id)) continue;
  const w = x.w, d = x.d, m = (n: number) => (n / 100).toFixed(2);
  const sym = `  <symbol id="furn-${x.id}" viewBox="0 0 ${w} ${d}" data-label="${x.label}" data-w="${m(w)}" data-h="${m(d)}" data-rotatable="true">\n${body(x.category, w, d)}\n  </symbol>\n\n`;
  svg = svg.replace(/<\/svg>\s*$/, sym + '</svg>\n');
  seen.add(x.id);
}
writeFileSync(path, svg);
console.log(`${seen.size} symboles ArchLang régénérés dans assets/icons/furniture.svg`);
