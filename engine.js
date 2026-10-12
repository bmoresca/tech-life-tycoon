// Tech Life Tycoon — game engine (no DOM; runs in browser and node)
(function (root) {
  const D = (typeof DATA !== 'undefined') ? DATA : require('./data.js');

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~[-1,1]
  const fmtMoney = n => {
    const s = n < 0 ? '-' : '';
    n = Math.abs(n);
    if (n >= 1e9) return s + '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return s + '$' + (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4) return s + '$' + (n / 1e3).toFixed(1) + 'k';
    return s + '$' + Math.round(n).toLocaleString('en-US');
  };
  const fmtNum = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : Math.round(n).toLocaleString('en-US');

  class Game {
    constructor() { this.D = D; this.listeners = []; this.pending = null; this.s = null; }

    on(fn) { this.listeners.push(fn); }
    emit(type, payload) { for (const fn of this.listeners) fn(type, payload); }

    newGame(company, founder) {
      this.s = {
        company: company || 'Garage Soft', founder: founder || 'You',
        week: 0, money: 15000, fans: 0, rep: 0, hype: 0,
        stage: 'garage', employees: [], products: [], project: null, offers: [], log: [],
        skills: { tech: 8, design: 8 }, platformsOwned: [], eventsFired: {}, mods: [],
        contractMult: null, salaryMult: 1, trend: null, trendUntil: 0,
        postCooldown: 0, totalRevenue: 0, contractsDone: 0, over: false, candidates: [],
        bestProduct: null, nextOffer: 10, seq: 1,
        rp: 0, researched: [], research: null, warnedDebt: false,
      };
      this.pending = null;
      this.fireEvents();
      this.rollTrend();
      this.genCandidates();
      this.genOffer();
      return this.s;
    }

    migrate() { const s = this.s; if (!s) return; s.rp = s.rp || 0; s.researched = s.researched || []; s.research = s.research || null; }

    // ---- research
    has(id) { return this.s.researched.includes(id); }
    rpScale(y) { return Math.pow(1.06, y - D.START_YEAR); }
    researchables() {
      const s = this.s, yr = this.year, list = [];
      for (const t of D.types) {
        if (!t.research || this.has(t.id) || t.unlock > yr) continue;
        list.push({ kind: 'type', id: t.id, name: t.name, desc: t.desc, rp: Math.round(25 * this.rpScale(t.unlock)), cost: Math.round(1200 * this.infl), weeks: 4, hot: s.trend === t.id });
      }
      for (const r of D.research) {
        if (this.has(r.id) || r.from > yr) continue;
        list.push({ kind: 'boost', id: r.id, name: r.name, desc: r.desc, rp: r.rp, cost: Math.round(r.cost * this.infl), weeks: r.weeks });
      }
      return list;
    }
    upcoming(n = 4) {
      const yr = this.year, list = [];
      for (const t of D.types) if (t.research && !this.has(t.id) && t.unlock > yr) list.push({ kind: 'type', id: t.id, name: t.name, year: t.unlock });
      for (const r of D.research) if (!this.has(r.id) && r.from > yr) list.push({ kind: 'boost', id: r.id, name: r.name, year: r.from });
      return list.sort((a, b) => a.year - b.year).slice(0, n);
    }
    startResearch(id) {
      const s = this.s; if (s.research) return 'Already researching something.';
      const item = this.researchables().find(x => x.id === id); if (!item) return 'Not available.';
      if (s.rp < item.rp) return `Need ${item.rp} research points (have ${Math.floor(s.rp)}).`;
      if (s.money < item.cost) return `Need ${fmtMoney(item.cost)}.`;
      s.rp -= item.rp; s.money -= item.cost;
      s.research = { id, kind: item.kind, name: item.name, week: 0, weeks: item.weeks };
      this.log(`Research started: ${item.name} (${item.weeks} weeks).`);
      return null;
    }
    progressResearch() {
      const s = this.s, r = s.research; if (!r) return;
      r.week++;
      if (r.week >= r.weeks) {
        s.researched.push(r.id); s.research = null;
        this.log(r.kind === 'type' ? `Research complete: you can now build ${r.name}!` : `Research complete: ${r.name}. ${D.research.find(x => x.id === r.id).desc}`, 'good');
        this.emit('research', r);
      }
    }
    outputMult() { return 1 + (this.has('srcctl') ? 0.08 : 0) + (this.has('ide') ? 0.08 : 0) + (this.has('agile') ? 0.10 : 0) + (this.has('remote') ? 0.06 : 0); }
    bugMult() { return (this.has('unittest') ? 0.7 : 1) * (this.has('ci') ? 0.7 : 1); }
    addRP(points) { this.s.rp += points * 0.12; }

    // ---- time helpers
    get date() { const d = new Date(D.START_YEAR, 0, 1); d.setDate(d.getDate() + this.s.week * 7); return d; }
    get year() { return this.date.getFullYear(); }
    get yearF() { return D.START_YEAR + this.s.week / 52.18; }
    get infl() { return Math.pow(1.035, this.yearF - D.START_YEAR); }
    dateStr() { return this.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    marketSize(y = this.yearF) { return Math.pow(1.075, y - D.START_YEAR); }
    expectedPPW(y = this.yearF) { return 9.5 * Math.pow(1.06, y - D.START_YEAR); } // expected points per week
    eraIndex() { let i = 0; D.computers.forEach((c, k) => { if (this.year >= c.from) i = k; }); return i; }
    network() { let n = D.networks[0]; for (const x of D.networks) if (this.year >= x.from) n = x; return n; }
    reviewers() { let r = D.reviewers[1984]; for (const k of Object.keys(D.reviewers)) if (this.year >= +k) r = D.reviewers[k]; return r; }

    log(text, cls = '') { this.s.log.unshift({ week: this.s.week, date: this.dateStr(), text, cls }); if (this.s.log.length > 200) this.s.log.pop(); this.emit('log', { text, cls }); }

    // ---- lookups
    type(id) { return D.types.find(t => t.id === id); }
    platform(id) { return D.platforms.find(p => p.id === id); }
    stage() { return D.stages[this.s.stage]; }
    unlockedTypes() { return D.types.filter(t => t.unlock <= this.year && (!t.research || this.has(t.id))); }
    yearTypes() { return D.types.filter(t => t.unlock <= this.year); }
    activePlatforms() { return D.platforms.filter(p => p.from <= this.year && p.to >= this.year); }
    platformShare(p, y = this.yearF) {
      if (y < p.from || y > p.to + 1) return 0;
      const up = p.from <= D.START_YEAR ? 1 : clamp((y - p.from) / 2, 0.15, 1);
      const down = clamp((p.to + 1 - y) / 3, 0.1, 1);
      return p.share * up * down;
    }
    availableSizes() { return this.stage().sizes; }
    maxEmployees() { return this.stage().maxEmployees; }
    projectCost(sizeId, platId) {
      const size = D.sizes[sizeId];
      const lic = this.s.platformsOwned.includes(platId) ? 0 : this.platform(platId).license * this.infl;
      return Math.round(size.cost * this.infl + lic);
    }

    // ---- weekly tick
    tick() {
      const s = this.s;
      if (this.pending || s.over) return false;
      s.week++;
      const infl = this.infl;

      // running costs
      let cost = this.stage().rent * infl;
      for (const e of s.employees) cost += e.salary;
      s.money -= cost;

      // project progress
      if (s.project) this.progressProject(); else s.rp += 1.5 * this.rpScale(this.yearF);
      this.progressResearch();

      // sales
      for (const p of s.products) if (p.active) this.sellWeek(p);

      // decay & cooldowns
      s.hype *= 0.88; if (s.hype < 0.5) s.hype = 0;
      if (s.postCooldown > 0) s.postCooldown--;
      s.mods = s.mods.filter(m => m.until > s.week);
      if (s.contractMult && s.contractMult.until <= s.week) s.contractMult = null;
      s.offers = s.offers.filter(o => o.expires > s.week);

      // passive skill growth (experience), ~2.5%/yr
      s.skills.tech *= 1.0002; s.skills.design *= 1.0002;
      for (const e of s.employees) { e.tech *= 1.0002; e.design *= 1.0002; }

      // organic offers
      if (--s.nextOffer <= 0) { this.genOffer(); s.nextOffer = Math.round(rnd(8, 16)); }
      if (s.week % 26 === 0) this.genCandidates();
      if (s.week >= s.trendUntil) this.rollTrend();

      this.fireEvents();

      // path choice prompt
      if (s.stage === 'garage' && !s.pathPrompted && s.money >= 25000 * infl && !s.project) {
        s.pathPrompted = true;
        this.pending = { type: 'path' };
        this.emit('pending', this.pending);
      }

      // endings
      if (s.money < 0 && !s.warnedDebt) { s.warnedDebt = true; this.log('You are in the red. The bank gets nervous below ' + fmtMoney(-25000 * infl) + '. Take a contract or ship something!', 'bad'); }
      if (s.money >= 0) s.warnedDebt = false;
      if (s.money < -25000 * infl) {
        s.over = true; s.endReason = 'bankrupt';
        this.pending = { type: 'gameover', reason: 'bankrupt' };
        this.emit('pending', this.pending);
      } else if (this.year >= D.END_YEAR) {
        s.over = true; s.endReason = 'ai';
        this.pending = { type: 'ending' };
        this.emit('pending', this.pending);
      }
      this.emit('tick');
      return true;
    }

    // ---- events
    fireEvents() {
      const s = this.s; const d = this.date;
      for (const ev of D.events) {
        const key = ev.y + '-' + ev.m;
        if (s.eventsFired[key]) continue;
        if (d.getFullYear() > ev.y || (d.getFullYear() === ev.y && d.getMonth() + 1 >= ev.m)) {
          s.eventsFired[key] = true;
          this.applyEvent(ev);
        }
      }
    }
    applyEvent(ev) {
      const s = this.s;
      if (ev.salesMods) for (const m of ev.salesMods) s.mods.push({ ...m, until: s.week + m.weeks });
      if (ev.fansPct) s.fans = Math.round(s.fans * (1 + ev.fansPct / 100));
      if (ev.hype) s.hype += ev.hype;
      if (ev.contractMult) s.contractMult = { mult: ev.contractMult.mult, until: s.week + ev.contractMult.weeks };
      if (ev.salaryMult) s.salaryMult = ev.salaryMult;
      this.log(ev.text, 'event');
      this.emit('news', ev);
    }
    salesMod(type) {
      let m = 1;
      for (const mod of this.s.mods) {
        if (mod.all) m *= mod.mult;
        else if (mod.types && mod.types.includes(type.id)) m *= mod.mult;
        else if (mod.cats && mod.cats.some(c => type.cats.includes(c))) m *= mod.mult;
        else if (mod.not && !mod.not.includes(type.id)) m *= mod.mult;
      }
      return m;
    }
    rollTrend() {
      const s = this.s;
      const list = this.yearTypes();
      s.trend = pick(list).id;
      s.trendUntil = s.week + Math.round(rnd(20, 40));
      if (s.week > 0) this.log(`Trend alert: ${this.type(s.trend).name} is hot right now.`, 'trend');
    }

    // ---- projects
    startSoftware({ name, typeId, platformId, sizeId }) {
      const s = this.s;
      if (s.project) return 'Already working on something.';
      const type = this.type(typeId), plat = this.platform(platformId), size = D.sizes[sizeId];
      if (!type || !plat || !size) return 'Invalid selection.';
      if (type.unlock > this.year) return 'Not invented yet.';
      if (!type.cats.includes(plat.cat)) return `${type.name} can't run on ${plat.name}.`;
      if (!this.availableSizes().includes(sizeId)) return 'Your company is too small for that size.';
      if (type.minSize === 'medium' && sizeId === 'small') return `${type.name} needs at least a Medium project.`;
      const cost = this.projectCost(sizeId, platformId);
      if (s.money < cost) return `Need ${fmtMoney(cost)} to start.`;
      s.money -= cost;
      if (!s.platformsOwned.includes(platformId)) s.platformsOwned.push(platformId);
      s.project = {
        kind: 'software', name: name || `${type.name} ${s.seq}`, typeId, platformId, sizeId,
        weeks: size.weeks, week: 0, phase: -1, sliders: [null, null, null],
        points: 0, tech: 0, design: 0, bugs: 0, fixWeeks: 0, status: 'dev',
      };
      this.log(`Started development of ${s.project.name} (${type.name}, ${size.name}, ${plat.name}). Cost ${fmtMoney(cost)}.`, 'good');
      this.enterPhase(0);
      return null;
    }
    enterPhase(i) {
      const p = this.s.project; p.phase = i;
      this.pending = { type: 'sliders', phase: i, project: p };
      this.emit('pending', this.pending);
    }
    setSliders(phase, values) {
      const p = this.s.project;
      if (!p || p.kind !== 'software') return;
      p.sliders[phase] = values.map(v => clamp(+v || 0, 0, 100));
      this.pending = null;
      this.emit('resume');
    }
    phaseWeights(phase, vals) {
      const items = D.phases[phase].items;
      let sum = vals.reduce((a, b) => a + b, 0); if (sum <= 0) { vals = [1, 1, 1]; sum = 3; }
      const fr = vals.map(v => v / sum);
      let tech = 0; fr.forEach((f, i) => tech += f * items[i].tech);
      return { fr, tech, design: 1 - tech };
    }
    staffPoints(w) {
      const s = this.s;
      const mult = (s.stage === 'indie' ? 1.35 : 1) * this.outputMult();
      let pts = (s.skills.tech * w.tech + s.skills.design * w.design) * mult;
      for (const e of s.employees) pts += e.tech * w.tech + e.design * w.design;
      return pts * rnd(0.8, 1.2);
    }
    progressProject() {
      const s = this.s, p = s.project;
      if (p.kind === 'software') {
        if (p.status === 'fixing') {
          p.fixWeeks--; const fixed = Math.round(p.bugs * 0.45); p.bugs -= fixed;
          this.emit('points', { text: `-${fixed} bugs`, kind: 'fix' });
          if (p.fixWeeks <= 0) { p.status = 'dev'; this.pending = { type: 'devdone', project: p }; this.emit('pending', this.pending); }
          return;
        }
        const phaseLen = p.weeks / 3;
        const phase = Math.min(2, Math.floor(p.week / phaseLen));
        if (phase !== p.phase) { this.enterPhase(phase); return; } // pause for sliders before working this week
        const w = this.phaseWeights(phase, p.sliders[phase]);
        const pts = this.staffPoints(w);
        const t = pts * w.tech, d = pts * w.design;
        p.points += pts; p.tech += t; p.design += d; this.addRP(pts);
        let newBugs = pts * rnd(0.05, 0.12) * this.bugMult();
        if (phase === 1) { const rel = w.fr[2]; newBugs *= (1 - rel * 0.8); p.bugs -= pts * rel * 0.6; }
        p.bugs = Math.max(0, p.bugs + newBugs);
        p.week++;
        this.emit('points', { tech: Math.round(t), design: Math.round(d) });
        if (p.week >= p.weeks) { this.pending = { type: 'devdone', project: p }; this.emit('pending', this.pending); }
      } else if (p.kind === 'contract') {
        const pts = this.staffPoints({ tech: 0.6, design: 0.4 });
        p.points += pts; p.week++; this.addRP(pts);
        this.emit('points', { tech: Math.round(pts * 0.6), design: Math.round(pts * 0.4) });
        if (p.week >= p.weeks) this.finishContract();
      }
    }
    fixBugs() {
      const p = this.s.project; if (!p) return;
      p.status = 'fixing'; p.fixWeeks = 1; this.pending = null; this.emit('resume');
    }
    expectedPoints(sizeId, y = this.yearF) { const size = D.sizes[sizeId]; return this.expectedPPW(y) * 12 * size.need; }
    matchFactor(type, sliders) {
      let dist = 0;
      for (let ph = 0; ph < 3; ph++) {
        const ideal = type.ideal.slice(ph * 3, ph * 3 + 3); const isum = ideal.reduce((a, b) => a + b, 0);
        const { fr } = this.phaseWeights(ph, sliders[ph] || [50, 50, 50]);
        let d = 0; for (let i = 0; i < 3; i++) d += Math.abs(fr[i] - ideal[i] / isum);
        dist += d / 2;
      }
      return clamp(1 - (dist / 3) * 2.5, 0, 1);
    }
    ship() {
      const s = this.s, p = s.project; if (!p || p.kind !== 'software') return;
      const type = this.type(p.typeId), plat = this.platform(p.platformId), size = D.sizes[p.sizeId];
      const E = this.expectedPoints(p.sizeId);
      const q = Math.pow(Math.min(1.15, p.points / E), 0.7);
      const m = this.matchFactor(type, p.sliders);
      const bugPen = Math.max(0.5, 1 - 1.5 * p.bugs / Math.max(1, p.points));
      const trend = s.trend === type.id ? 1.1 : 1;
      const platFit = this.platformShare(plat) < 0.04 ? 0.85 : 1;
      let raw = 10 * (0.3 + 0.7 * m) * q * bugPen * trend * platFit;
      const score = clamp(Math.round((raw + gauss() * 0.5) * 10) / 10, 1, 10);
      const reviewers = this.reviewers().map(name => {
        const sc = clamp(Math.round(score + gauss() * 0.8), 1, 10);
        const bucket = sc >= 10 ? 10 : sc >= 9 ? 9 : sc >= 7 ? 7 : sc >= 5 ? 5 : sc >= 3 ? 3 : 1;
        return { name, score: sc, quip: pick(D.quips[bucket]) };
      });
      const product = {
        id: s.seq++, name: p.name, typeId: p.typeId, platformId: p.platformId, sizeId: p.sizeId,
        score, reviews: reviewers, released: s.week, weeksOnMarket: type.weeks, age: 0, units: 0, revenue: 0, active: true,
        hypeAtLaunch: s.hype, detail: { q: +q.toFixed(2), match: +m.toFixed(2), bugs: Math.round(p.bugs), points: Math.round(p.points), expected: Math.round(E) },
      };
      s.products.unshift(product);
      s.project = null;
      // founder & team grow
      const gain = 0.25 * Math.pow(1.04, this.yearF - D.START_YEAR) * Math.sqrt(size.need);
      s.skills.tech += gain; s.skills.design += gain;
      for (const e of s.employees) { e.tech += gain * 0.6; e.design += gain * 0.6; }
      s.rep += (score - 5) * 2;
      if (!s.bestProduct || score > s.bestProduct.score) s.bestProduct = product;
      this.log(`${product.name} released on ${plat.name}! Review score: ${score}/10.`, score >= 7 ? 'good' : score >= 5 ? '' : 'bad');
      this.pending = { type: 'reviews', product };
      this.emit('pending', this.pending);
    }
    closeReviews() { this.pending = null; this.emit('resume'); }

    sellWeek(prod) {
      const s = this.s; const type = this.type(prod.typeId), plat = this.platform(prod.platformId), size = D.sizes[prod.sizeId];
      prod.age++;
      const W = prod.weeksOnMarket, a = prod.age;
      let curve;
      if (type.curve === 'spike') curve = a <= 2 ? a / 2 : Math.exp(-(a - 2) / (W / 3.2));
      else { const peak = W / 3; curve = a <= peak ? a / peak : a <= 2 * peak ? 1 : Math.exp(-(a - 2 * peak) / (W / 4)); }
      const share = Math.max(0.02, this.platformShare(plat));
      const sf = Math.pow(prod.score / 10, 3) * 2;
      const hypeF = 1 + (prod.age <= 6 ? s.hype / 150 : s.hype / 400);
      const fanF = 1 + Math.min(2.0, s.fans / (3000 * this.marketSize()));
      const trend = s.trend === type.id ? 1.3 : 1;
      const boost = (this.has('cloud') && plat.cat !== 'desktop' ? 1.15 : 1) * (this.has('analytics') ? 1.1 : 1);
      let units = 80 * boost * this.marketSize() * share * type.mult * size.salesMult * sf * hypeF * fanF * trend * this.salesMod(type) * curve * rnd(0.75, 1.25);
      if (type.volatile) units *= rnd(0.3, 2.2);
      units = Math.round(units);
      const rev = units * type.price * Math.pow(1.02, this.yearF - D.START_YEAR);
      prod.units += units; prod.revenue += rev; prod.lastWeek = rev; s.money += rev; s.totalRevenue += rev;
      s.fans += Math.round(units * 0.05 * (this.has('opensource') ? 1.3 : 1) * (prod.score / 10) * (type.curve === 'ramp' ? 0.4 : 1) / (1 + s.fans / (6000 * this.marketSize())));
      if (a >= W) { prod.active = false; this.log(`${prod.name} is off the market. Total: ${fmtNum(prod.units)} ${type.unit}, ${fmtMoney(prod.revenue)}.`); }
    }

    // ---- contracts
    genOffer() {
      const s = this.s; if (s.offers.length >= 4) return;
      const tasks = D.contractTasks.filter(t => t.from <= this.year); const task = pick(tasks);
      const size = Math.random() < 0.6 ? 1 : Math.random() < 0.7 ? 2 : 3.5;
      const weeks = Math.round(rnd(4, 7) * Math.sqrt(size));
      const E = this.expectedPPW() * weeks * size * 0.8 * (1 + s.employees.length * 0.15);
      const pay = Math.round(E * 120 * this.infl * (1 + s.rep / 100) * (s.contractMult ? s.contractMult.mult : 1) * rnd(0.85, 1.2));
      s.offers.push({ id: s.seq++, client: pick(D.clients), task: task.text, weeks, need: Math.round(E), pay, expires: s.week + 12 });
    }
    acceptContract(id) {
      const s = this.s; if (s.project) return 'Already busy.';
      const o = s.offers.find(x => x.id === id); if (!o) return 'Offer gone.';
      s.offers = s.offers.filter(x => x.id !== id);
      s.project = { kind: 'contract', name: `${o.task} for ${o.client}`, offer: o, weeks: o.weeks, week: 0, points: 0 };
      this.log(`Signed contract: ${s.project.name} (${fmtMoney(o.pay)}, ${o.weeks} weeks).`);
      return null;
    }
    finishContract() {
      const s = this.s, p = s.project, o = p.offer;
      const ok = p.points >= o.need; const ratio = clamp(p.points / o.need, 0, 1);
      const pay = Math.round(ok ? o.pay : o.pay * (0.3 + 0.4 * ratio));
      s.money += pay; s.totalRevenue += pay; s.contractsDone++;
      s.rep += ok ? 3 : -4;
      s.project = null;
      this.log(ok ? `${o.client} is thrilled. Paid ${fmtMoney(pay)}.` : `${o.client} is unhappy with the work. Paid only ${fmtMoney(pay)}.`, ok ? 'good' : 'bad');
      this.pending = { type: 'contractdone', ok, pay, offer: o, points: Math.round(p.points) };
      this.emit('pending', this.pending);
    }
    closePending() { this.pending = null; this.emit('resume'); }

    // ---- social posting
    post(kind) {
      const s = this.s; if (s.postCooldown > 0) return 'Too soon. Wait a bit.';
      const net = this.network();
      const indie = (s.stage === 'indie' ? 1.5 : 1) * (this.has('growth') ? 1.4 : 1);
      s.postCooldown = 3;
      if (kind === 'pump') {
        if (Math.random() < 0.12) { s.fans = Math.round(s.fans * 0.94); this.log(`Your ${net.noun} on ${net.name} got ratioed. Fans -6%.`, 'bad'); return null; }
        const h = rnd(18, 35) * net.pump * indie; s.hype = Math.min(100, s.hype + h);
        this.log(`You ${net.verb.toLowerCase()}ed on ${net.name} to pump sales. Hype +${Math.round(h)}.`, 'good');
      } else if (kind === 'contracts') {
        const n = Math.random() < 0.5 ? 2 : 3; for (let i = 0; i < n; i++) this.genOffer();
        this.log(`You asked ${net.name} for work. New contract offers arrived.`, 'good');
      } else if (kind === 'journey') {
        const gain = Math.round((40 * this.marketSize() + Math.min(s.fans * 0.01, 2000 * this.marketSize())) * net.fans * indie * (this.has('opensource') ? 1.3 : 1));
        s.fans += gain; this.log(`You shared your founder journey on ${net.name}. +${fmtNum(gain)} fans.`, 'good');
      }
      return null;
    }

    // ---- company
    choosePath(path) {
      const s = this.s;
      if (!D.stages[path]) return 'Unknown path.';
      const order = ['garage', 'indie', 'solo', 'office', 'hq'];
      if (order.indexOf(path) <= order.indexOf(s.stage)) return 'That is not a step up.';
      const cost = Math.round(D.stageCosts[path] * this.infl);
      if (s.money < cost) return `Need ${fmtMoney(cost)}.`;
      s.money -= cost; s.stage = path;
      if (s.employees.length > this.maxEmployees()) s.employees.length = this.maxEmployees();
      this.log(`You are now: ${D.stages[path].name}. ${D.stages[path].desc}`, 'event');
      if (this.pending && this.pending.type === 'path') { this.pending = null; this.emit('resume'); }
      this.emit('stage');
      return null;
    }
    skipPath() { if (this.pending && this.pending.type === 'path') { this.pending = null; this.emit('resume'); } }
    genCandidates() {
      const s = this.s; const base = 6 * Math.pow(1.06, this.yearF - D.START_YEAR);
      s.candidates = [];
      for (let i = 0; i < 4; i++) {
        const lvl = rnd(0.6, 1.6); const tech = base * lvl * rnd(0.6, 1.4), design = base * lvl * rnd(0.6, 1.4);
        const solo = s.stage === 'solo' ? 0.75 : 1;
        const salary = Math.round(320 * this.infl * Math.pow(lvl, 1.4) * s.salaryMult * solo);
        s.candidates.push({ id: s.seq++, name: pick(D.firstNames) + ' ' + pick(D.lastNames), tech: +tech.toFixed(1), design: +design.toFixed(1), salary, title: lvl > 1.3 ? 'Senior' : lvl > 0.9 ? 'Mid-level' : 'Junior' });
      }
    }
    hire(id) {
      const s = this.s; const c = s.candidates.find(x => x.id === id); if (!c) return 'Gone.';
      if (s.employees.length >= this.maxEmployees()) return 'No room. Upgrade your company.';
      const signing = c.salary * 2; if (s.money < signing) return `Need ${fmtMoney(signing)} signing bonus.`;
      s.money -= signing; s.employees.push({ ...c, hired: s.week, color: Math.floor(Math.random() * 6) });
      s.candidates = s.candidates.filter(x => x.id !== id);
      this.log(`Hired ${c.name} (${c.title}) at ${fmtMoney(c.salary)}/week.`);
      this.emit('stage');
      return null;
    }
    fire(id) { const s = this.s; const e = s.employees.find(x => x.id === id); if (!e) return; s.employees = s.employees.filter(x => x.id !== id); this.log(`${e.name} left the company.`); this.emit('stage'); }

    // ---- summary
    summary() {
      const s = this.s;
      return {
        years: this.year - D.START_YEAR, products: s.products.length, contracts: s.contractsDone, revenue: s.totalRevenue, fans: s.fans,
        best: s.bestProduct, employees: s.employees.length, stage: this.stage().name, money: s.money,
      };
    }
  }

  const api = { Game, fmtMoney, fmtNum, clamp };
  if (typeof module !== 'undefined') module.exports = api; else Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis);
