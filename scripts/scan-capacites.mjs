import fs from 'fs';
import vm from 'vm';
const A = '/Users/theoseguret/Documents/Wonderland/technohab/assets/';
for (const f of ['fit.data.js', 'generator.js', 'rules.js']) vm.runInThisContext(fs.readFileSync(A + f, 'utf8'));
const G = globalThis.TechnoHabGenerator, R = globalThis.TechnoHabRules, F = globalThis.TechnoHabFit;

// 24 configurations balayant surface, programme, priorité.
const CONFIGS = [
  [35, 0, 1, false, false, 'compact'], [35, 0, 1, true, true, 'compact'],
  [40, 1, 1, false, true, 'compact'], [45, 1, 1, true, true, 'compact'],
  [50, 1, 1, false, true, 'light'], [55, 2, 1, false, true, 'compact'],
  [60, 2, 1, false, false, 'economy'], [65, 2, 1, false, false, 'compact'],
  [70, 2, 1, true, true, 'compact'], [75, 2, 1, false, true, 'compact'],
  [75, 3, 1, false, false, 'light'], [80, 3, 1, false, true, 'compact'],
  [85, 3, 1, true, true, 'economy'], [90, 3, 1, false, true, 'light'],
  [100, 3, 2, true, true, 'compact'], [110, 3, 1, true, true, 'compact'],
  [120, 4, 2, true, true, 'compact'], [130, 4, 1, false, true, 'light'],
  [140, 4, 2, true, true, 'economy'], [150, 5, 1, true, true, 'compact'],
  [150, 5, 2, true, true, 'compact'], [180, 5, 2, true, true, 'light'],
  [220, 5, 2, true, true, 'compact'], [250, 5, 2, true, true, 'economy'],
];

const N = 30;
const ruleTotals = {}, fitFail = {};
let rows = [];

for (const [surface, bedrooms, bathrooms, sepK, wc, priority] of CONFIGS) {
  const opts = { surface, bedrooms, bathrooms, separateKitchen: sepK, includeWc: wc, priority };
  const prog = G.buildProgram(opts);
  const saturation = prog.minimumTotal / surface;
  let hard = 0, sigs = new Set(), worst = 0, roomsTot = 0, fitOk = 0, nonRect = 0, ms = 0, t0 = Date.now();
  const by = {};
  for (let v = 0; v < N; v++) {
    const p = G.generatePlan(opts, v, (Math.random() * 4294967296) >>> 0);
    const rep = R.evaluatePlan(p);
    if (rep.summary.hard) hard++;
    rep.violations.forEach(x => { by[x.ruleId] = (by[x.ruleId] || 0) + 1; ruleTotals[x.ruleId] = (ruleTotals[x.ruleId] || 0) + 1; });
    sigs.add(p.rooms.map(r => r.id + ':' + r.x0.toFixed(1) + ',' + r.y0.toFixed(1)).sort().join('|'));
    worst = Math.max(worst, Math.abs(p.rooms.reduce((s, r) => s + r.area, 0) - p.boundary.area));
    for (const r of p.rooms) {
      roomsTot++;
      if (r.edgeCount > 4) nonRect++;
      const u = r.usableRect;
      const ok = F.fits(r.type, u.x1 - u.x0, u.y1 - u.y0);
      if (ok) fitOk++; else fitFail[r.type] = (fitFail[r.type] || 0) + 1;
    }
  }
  ms = Math.round((Date.now() - t0) / N);
  rows.push({
    label: `${surface}m² ${bedrooms}ch ${bathrooms}sdb ${sepK ? 'K' : '-'}${wc ? 'W' : '-'} ${priority.slice(0, 4)}`,
    sat: saturation, hard, div: sigs.size, fit: fitOk / roomsTot, nonRect: nonRect / roomsTot, worst, ms, by
  });
}

console.log('configuration                  | satur | HARD  | div   | meublable | formes L | ecart | ms');
console.log('-'.repeat(100));
for (const r of rows) {
  console.log(
    r.label.padEnd(30) + ' | ' +
    (r.sat * 100).toFixed(0).padStart(4) + '% | ' +
    (r.hard + '/' + N).padStart(5) + ' | ' +
    (r.div + '/' + N).padStart(5) + ' | ' +
    (r.fit * 100).toFixed(0).padStart(8) + '% | ' +
    (r.nonRect * 100).toFixed(0).padStart(7) + '% | ' +
    r.worst.toFixed(3).padStart(5) + ' | ' + String(r.ms).padStart(3)
  );
}
console.log('\n--- regles declenchees, tous scenarios confondus ---');
Object.entries(ruleTotals).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k.padEnd(22) + String(v).padStart(5)));
console.log('\n--- pieces non meublables selon le socle (fits) ---');
Object.entries(fitFail).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k.padEnd(22) + String(v).padStart(5)));
