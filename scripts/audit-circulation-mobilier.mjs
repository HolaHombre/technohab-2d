/* Audit des heuristiques de pose — ce qu'il reste à parcourir une fois posé.
 *
 * Le solveur de `placement.js` valide chaque équipement contre trois
 * contraintes locales : il tient dans le polygone utile, il ne recouvre pas
 * une autre emprise, sa zone d'usage n'est pas mordue. Aucune ne parle du
 * vide restant. Ce script mesure ce vide.
 *
 * Cinq grandeurs, par pièce meublée :
 *   ilots      composantes connexes du sol praticable après pose (érosion 0,60)
 *   seuils     baies de porte auxquelles ce sol ne touche pas
 *   coupees    pièces dont deux baies tombent dans deux composantes distinctes
 *   fenetres   baies de fenêtre masquées par une emprise, ou hors d'atteinte
 *   usages     zones d'usage requises séparées de la porte (règle S4 du socle)
 *
 *   node scripts/audit-circulation-mobilier.mjs [--seeds N]
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js']
  .forEach((file) => { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const generator = globalThis.TechnoHabGenerator;
const model = globalThis.TechnoHabRoomModel;
const nominal = globalThis.TechnoHabPlacement;

/* Ablation. `cornerScore` pèse 20 points sur 100 et récompense la distance aux
   extrémités du mur : on la neutralise sans rien toucher au fichier, en
   réévaluant la source amendée dans un second exemplaire du module. */
const ABLATION = process.argv.includes('--sans-angle');
let placement = nominal;
if (ABLATION) {
  const source = readFileSync(join(root, 'assets', 'placement.js'), 'utf8');
  const patched = source.replace('Math.min(along, span - along) / 0.6', '1');
  if (patched === source) throw new Error('l’ablation ne trouve plus cornerScore dans placement.js');
  const bac = { TechnoHabPlacement: null };
  new Function('root', patched.replace(/\}\)\(typeof globalThis[^;]*;\s*$/, '})(root);'))(bac);
  placement = bac.TechnoHabPlacement;
}

const PAS = 0.05;          // maillage, en mètres
const CONTOURNEMENT = 0.60; // largeur d'un passage qui contourne un meuble
const APPROCHE = 0.75;      // rayon de recherche d'un sol praticable devant une baie

/* --- Le champ praticable ------------------------------------------------- */

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, p = ring.length - 1; i < ring.length; p = i, i += 1) {
    const a = ring[i], b = ring[p];
    if ((a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
const inPolygon = (point, polygon) =>
  polygon.reduce((inside, ring) => pointInRing(point, ring) ? !inside : inside, false);

/* Transformée de distance par chanfrein : la distance de chaque cellule au
   plus proche obstacle. Deux passes, poids 1 et √2 — l'érosion naïve du
   générateur coûte le carré du rayon par cellule, celle-ci rien. */
function distanceTransform(libre, nx, ny) {
  const INF = 1e9, d = new Float64Array(nx * ny);
  const D1 = PAS, D2 = PAS * Math.SQRT2;
  for (let i = 0; i < nx * ny; i += 1) d[i] = libre[i] ? INF : 0;
  for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) {
    const k = j * nx + i;
    if (!d[k]) continue;
    if (i > 0) d[k] = Math.min(d[k], d[k - 1] + D1);
    if (j > 0) d[k] = Math.min(d[k], d[k - nx] + D1);
    if (i > 0 && j > 0) d[k] = Math.min(d[k], d[k - nx - 1] + D2);
    if (i < nx - 1 && j > 0) d[k] = Math.min(d[k], d[k - nx + 1] + D2);
  }
  for (let j = ny - 1; j >= 0; j -= 1) for (let i = nx - 1; i >= 0; i -= 1) {
    const k = j * nx + i;
    if (!d[k]) continue;
    if (i < nx - 1) d[k] = Math.min(d[k], d[k + 1] + D1);
    if (j < ny - 1) d[k] = Math.min(d[k], d[k + nx] + D1);
    if (i < nx - 1 && j < ny - 1) d[k] = Math.min(d[k], d[k + nx + 1] + D2);
    if (i > 0 && j < ny - 1) d[k] = Math.min(d[k], d[k + nx - 1] + D2);
  }
  return d;
}

function composantes(passable, nx, ny) {
  const label = new Int32Array(nx * ny).fill(-1);
  let n = 0;
  for (let s = 0; s < nx * ny; s += 1) {
    if (!passable[s] || label[s] >= 0) continue;
    const pile = [s];
    label[s] = n;
    while (pile.length) {
      const k = pile.pop(), i = k % nx, j = (k - i) / nx;
      if (i > 0 && passable[k - 1] && label[k - 1] < 0) { label[k - 1] = n; pile.push(k - 1); }
      if (i < nx - 1 && passable[k + 1] && label[k + 1] < 0) { label[k + 1] = n; pile.push(k + 1); }
      if (j > 0 && passable[k - nx] && label[k - nx] < 0) { label[k - nx] = n; pile.push(k - nx); }
      if (j < ny - 1 && passable[k + nx] && label[k + nx] < 0) { label[k + nx] = n; pile.push(k + nx); }
    }
    n += 1;
  }
  return { label, count: n };
}

/* --- La pièce ------------------------------------------------------------ */

function champDePiece(room, placements) {
  const rect = room.usableBounds || room.usableRect || room;
  const w = rect.x1 - rect.x0, h = rect.y1 - rect.y0;
  const nx = Math.max(1, Math.ceil(w / PAS)), ny = Math.max(1, Math.ceil(h / PAS));
  const polygone = (room.usablePolygon || []).map((ring) =>
    ring.map((p) => ({ x: p.x - rect.x0, y: p.y - rect.y0 })));
  const libre = new Uint8Array(nx * ny);
  for (let i = 0; i < nx; i += 1) for (let j = 0; j < ny; j += 1) {
    const x = (i + 0.5) * PAS, y = (j + 0.5) * PAS;
    if (polygone.length && !inPolygon({ x, y }, polygone)) continue;
    if (!polygone.length && (x > w || y > h)) continue;
    const occupe = placements.some((pose) => {
      const f = pose.footprint;
      return x > f.x0 && x < f.x1 && y > f.y0 && y < f.y1;
    });
    if (!occupe) libre[j * nx + i] = 1;
  }
  const d = distanceTransform(libre, nx, ny);
  const passable = new Uint8Array(nx * ny);
  for (let k = 0; k < nx * ny; k += 1) if (d[k] >= CONTOURNEMENT / 2) passable[k] = 1;
  return { rect, w, h, nx, ny, libre, passable, composantes: composantes(passable, nx, ny) };
}

/* La cellule praticable la plus proche d'un point, dans un rayon donné. */
function ancrer(champ, x, y, rayon) {
  let best = -1, bestD = Infinity;
  const i0 = Math.max(0, Math.floor((x - rayon) / PAS)), i1 = Math.min(champ.nx - 1, Math.ceil((x + rayon) / PAS));
  const j0 = Math.max(0, Math.floor((y - rayon) / PAS)), j1 = Math.min(champ.ny - 1, Math.ceil((y + rayon) / PAS));
  for (let i = i0; i <= i1; i += 1) for (let j = j0; j <= j1; j += 1) {
    const k = j * champ.nx + i;
    if (!champ.passable[k]) continue;
    const dist = Math.hypot((i + 0.5) * PAS - x, (j + 0.5) * PAS - y);
    if (dist <= rayon && dist < bestD) { bestD = dist; best = k; }
  }
  return best;
}

/* Le rectangle de sol devant une baie, sur une profondeur donnée. */
function devant(ouverture, rect, w, h, profondeur) {
  const x = ouverture.x - rect.x0, y = ouverture.y - rect.y0;
  const demi = (ouverture.bayWidth || ouverture.largeur || 0.8) / 2;
  if (ouverture.axe === 'vertical') {
    const vers = x <= w / 2 ? 1 : -1;
    return { x0: Math.min(x, x + vers * profondeur), x1: Math.max(x, x + vers * profondeur),
      y0: y - demi, y1: y + demi, x, y };
  }
  const vers = y <= h / 2 ? 1 : -1;
  return { x0: x - demi, x1: x + demi,
    y0: Math.min(y, y + vers * profondeur), y1: Math.max(y, y + vers * profondeur), x, y };
}

const chevauche = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;

function ouverturesDe(room, plan) {
  const list = [];
  (plan.portes || []).forEach((o) => { if ((o.entre || []).includes(room.id)) list.push({ o, kind: 'porte' }); });
  if (plan.entree && (plan.entree.entre || []).includes(room.id)) list.push({ o: plan.entree, kind: 'entree' });
  (plan.fenetres || []).forEach((o) => { if ((o.entre || []).includes(room.id)) list.push({ o, kind: 'fenetre' }); });
  return list;
}

/* --- Le banc ------------------------------------------------------------- */

const CONFIGS = [
  [45, 1, 1, false, true, 'compact', 'rectangle'], [55, 2, 1, false, true, 'compact', 'rectangle'],
  [70, 2, 1, true, true, 'compact', 'lShape'], [80, 3, 1, false, true, 'compact', 'rectangle'],
  [90, 3, 1, false, true, 'light', 'lShape'], [110, 3, 1, true, true, 'compact', 'rectangle'],
  [130, 4, 1, false, true, 'light', 'uShape'], [150, 5, 2, true, true, 'compact', 'rectangle'],
];
const SEEDS = Number((process.argv.find((a) => a.startsWith('--seeds=')) || '').split('=')[1]) || 6;

const total = {
  pieces: 0, meublees: 0, ilots: 0, seuilsMuets: 0, seuils: 0, coupees: 0,
  fenetres: 0, fenetresMasquees: 0, fenetresHorsAtteinte: 0,
  usages: 0, usagesSepares: 0, lits: 0, litsFlottants: 0, margeLit: [],
  fenetresIsolees: 0, echouee: [], solTotal: 0, solPrincipal: 0
};
const parType = {};
const exemples = [];

function compte(type, champLibelle) {
  if (!parType[type]) parType[type] = { pieces: 0, ilots: 0, seuilsMuets: 0, coupees: 0, fenMasquees: 0, usagesSepares: 0 };
  parType[type][champLibelle] += 1;
}

for (const c of CONFIGS) {
  const options = { surface: c[0], bedrooms: c[1], bathrooms: c[2], separateKitchen: c[3], includeWc: c[4], priority: c[5], shape: c[6] };
  for (let v = 1; v <= SEEDS; v += 1) {
    let plan;
    try { plan = generator.generatePlan(options, v, 707000 + v * 31 + c[0]); } catch (_) { continue; }
    if (!plan || !plan.rooms) continue;
    for (const room of plan.rooms) {
      const programContext = {
        area: room.usableArea || room.area || room.targetArea,
        openKitchen: room.type === 'living' && plan.options && !plan.options.separateKitchen,
        integratedWc: room.id === 'bath_1' && plan.options && !plan.options.includeWc,
        includeOptional: true
      };
      let designation;
      try { designation = model.designate(room.type, room.variant, programContext); } catch (_) { continue; }
      if (!designation || !designation.valid || !designation.equipments.length) continue;
      total.pieces += 1;
      const spatial = placement.roomContext(room, plan);
      let resultat;
      try {
        resultat = placement.optimize(designation.equipments, spatial.rectangle, {
          relations: designation.relations, context: spatial.context,
          seed: String(plan.seed) + ':' + room.id, attempts: 18
        });
      } catch (_) { continue; }
      if (!resultat || !resultat.fits) continue;
      total.meublees += 1;

      const champ = champDePiece(room, resultat.placements);
      if (champ.composantes.count > 1) { total.ilots += 1; compte(room.type, 'ilots'); }
      compte(room.type, 'pieces');

      /* Ce qui est praticable mais séparé du plus grand îlot est du sol perdu. */
      const aires = new Array(champ.composantes.count).fill(0);
      for (let k = 0; k < champ.nx * champ.ny; k += 1) {
        if (champ.passable[k]) aires[champ.composantes.label[k]] += PAS * PAS;
      }
      const totalSol = aires.reduce((a, b) => a + b, 0);
      const principal = aires.length ? Math.max.apply(null, aires) : 0;
      total.solTotal += totalSol;
      total.solPrincipal += principal;
      if (totalSol > 0.3 && principal / totalSol < 0.9) {
        total.echouee.push({ piece: room.id, type: room.type, perdu: totalSol - principal, sur: totalSol });
      }

      const ouvertures = ouverturesDe(room, plan);
      const ancres = [];
      for (const { o, kind } of ouvertures) {
        const zone = devant(o, champ.rect, champ.w, champ.h, kind === 'fenetre' ? CONTOURNEMENT : 0.90);
        if (kind === 'fenetre') {
          total.fenetres += 1;
          const masquee = resultat.placements.some((p) => chevauche(p.footprint, zone));
          if (masquee) { total.fenetresMasquees += 1; compte(room.type, 'fenMasquees'); }
          const k = ancrer(champ, zone.x, zone.y, APPROCHE);
          if (k < 0) total.fenetresHorsAtteinte += 1;
          ancres.push({ kind, id: o.id, cellule: k, masquee });
          continue;
        }
        total.seuils += 1;
        const k = ancrer(champ, zone.x, zone.y, APPROCHE);
        if (k < 0) { total.seuilsMuets += 1; compte(room.type, 'seuilsMuets'); }
        ancres.push({ kind, id: o.id, cellule: k, masquee: false });
      }

      const portes = ancres.filter((a) => a.kind !== 'fenetre' && a.cellule >= 0);
      const labels = new Set(portes.map((a) => champ.composantes.label[a.cellule]));
      if (labels.size > 1) { total.coupees += 1; compte(room.type, 'coupees'); }
      if (portes.length) {
        const depuis = champ.composantes.label[portes[0].cellule];
        ancres.filter((a) => a.kind === 'fenetre').forEach((a) => {
          if (a.cellule < 0 || champ.composantes.label[a.cellule] !== depuis) total.fenetresIsolees += 1;
        });
      }

      /* S4 — chaque zone d'usage requise rejoint-elle la porte ? */
      const reference = portes.length ? champ.composantes.label[portes[0].cellule] : null;
      if (reference !== null) {
        resultat.placements.forEach((pose) => {
          (pose.usage || []).forEach((u) => {
            total.usages += 1;
            const cx = (u.x0 + u.x1) / 2, cy = (u.y0 + u.y1) / 2;
            const k = ancrer(champ, cx, cy, Math.max(APPROCHE, Math.hypot(u.x1 - u.x0, u.y1 - u.y0) / 2 + 0.3));
            if (k < 0 || champ.composantes.label[k] !== reference) {
              total.usagesSepares += 1; compte(room.type, 'usagesSepares');
            }
          });
        });
      }

      /* Le lit : où tombe-t-il sur son mur ? */
      resultat.placements.forEach((pose) => {
        if (!/^bed_/.test(pose.equipment.id)) return;
        total.lits += 1;
        const f = pose.footprint;
        const horizontal = Math.abs(pose.inward.y) === 1;
        const gauche = horizontal ? f.x0 : f.y0;
        const droite = horizontal ? champ.w - f.x1 : champ.h - f.y1;
        const marge = Math.min(gauche, droite);
        total.margeLit.push(marge);
        if (marge > 0.35) {
          total.litsFlottants += 1;
          if (exemples.length < 12) {
            exemples.push({ plan: plan.seed, piece: room.id,
              piecew: champ.w.toFixed(2), pieceh: champ.h.toFixed(2),
              lit: pose.equipment.id, gauche: gauche.toFixed(2), droite: droite.toFixed(2),
              ilots: champ.composantes.count });
          }
        }
      });
    }
  }
}

const pct = (n, d) => d ? (100 * n / d).toFixed(1) + ' %' : '—';
const med = (a) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

console.log('\n' + (ABLATION ? '[ablation : cornerScore neutralisé] ' : '[nominal] ') +
  'Audit des heuristiques de pose — ' + total.pieces + ' pièces programmées, ' +
  total.meublees + ' meublées (' + pct(total.meublees, total.pieces) + ')');
console.log('Érosion ' + CONTOURNEMENT.toFixed(2) + ' m (contournement), maillage ' + (PAS * 100) + ' cm.\n');
console.log('  sol praticable en plusieurs îlots     ' + String(total.ilots).padStart(5) + '   ' + pct(total.ilots, total.meublees));
console.log('  pièces à baies séparées (circ. coupée)' + String(total.coupees).padStart(5) + '   ' + pct(total.coupees, total.meublees));
console.log('  seuils de porte sans sol praticable   ' + String(total.seuilsMuets).padStart(5) + '   ' + pct(total.seuilsMuets, total.seuils) + ' des ' + total.seuils + ' seuils');
console.log('  fenêtres masquées par une emprise     ' + String(total.fenetresMasquees).padStart(5) + '   ' + pct(total.fenetresMasquees, total.fenetres) + ' des ' + total.fenetres + ' fenêtres');
console.log('  fenêtres sans approche praticable     ' + String(total.fenetresHorsAtteinte).padStart(5) + '   ' + pct(total.fenetresHorsAtteinte, total.fenetres));
console.log('  zones d’usage séparées de la porte    ' + String(total.usagesSepares).padStart(5) + '   ' + pct(total.usagesSepares, total.usages) + ' des ' + total.usages + ' zones');
console.log('  lits décollés des deux angles (>35 cm)' + String(total.litsFlottants).padStart(5) + '   ' + pct(total.litsFlottants, total.lits) + ' des ' + total.lits + ' lits');
console.log('  fenêtres coupées de la porte         ' + String(total.fenetresIsolees).padStart(6) + '   ' + pct(total.fenetresIsolees, total.fenetres));
console.log('  marge médiane du lit au plus proche angle : ' + med(total.margeLit).toFixed(2) + ' m');
console.log('  sol praticable échoué hors du grand îlot  : ' +
  (total.solTotal - total.solPrincipal).toFixed(1) + ' m² sur ' + total.solTotal.toFixed(1) +
  ' m² (' + pct(total.solTotal - total.solPrincipal, total.solTotal) + '), ' +
  total.echouee.length + ' pièces perdent plus de 10 % de leur sol\n');

console.log('par type de pièce');
console.log('type            pièces  îlots  coupées  seuils muets  fen. masquées  usages séparés');
Object.keys(parType).sort().forEach((t) => {
  const r = parType[t];
  console.log(t.padEnd(14) + String(r.pieces).padStart(7) + String(r.ilots).padStart(7) +
    String(r.coupees).padStart(9) + String(r.seuilsMuets).padStart(14) +
    String(r.fenMasquees).padStart(15) + String(r.usagesSepares).padStart(16));
});

if (exemples.length) {
  console.log('\nquelques lits flottants');
  exemples.forEach((e) => console.log('  ' + e.plan + '/' + e.piece + ' ' + e.piecew + '×' + e.pieceh +
    ' m — ' + e.lit + ' laisse ' + e.gauche + ' m et ' + e.droite + ' m de part et d’autre, ' + e.ilots + ' îlot(s)'));
}
