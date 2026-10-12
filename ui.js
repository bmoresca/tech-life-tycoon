// Tech Life Tycoon — UI controller
(function () {
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SAVE_KEY = 'techlife-save-v1';

  const g = new Game();
  const scene = new Scene($('#scene'), g);
  let speed = 1, timer = null, tab = 'dev', lastDevYear = 0;
  const devForm = { name: '', typeId: null, platformId: null, sizeId: 'small' };

  // ---------- loop
  function setSpeed(v) {
    speed = v;
    document.querySelectorAll('.speed button').forEach(b => b.classList.toggle('on', +b.dataset.speed === v));
    if (timer) clearInterval(timer); timer = null;
    if (v > 0) timer = setInterval(step, 700 / v);
  }
  function step() {
    if (!g.s || g.pending || g.s.over) return;
    g.tick();
    refreshStats(); refreshStatus(); save();
    const focused = $('#tab-body').contains(document.activeElement) && document.activeElement !== $('#tab-body');
    if (focused) return;
    if (tab === 'dev') { if (g.s.project ? g.s.week % 2 === 0 : g.year !== lastDevYear) renderTab(); }
    else if (g.s.week % 2 === 0) renderTab();
  }
  let last = performance.now();
  function frame(now) { const dt = Math.min(50, now - last); last = now; scene.render(dt); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);

  // ---------- engine events
  g.on((type, payload) => {
    if (type === 'pending') openPending(payload);
    else if (type === 'resume') { closeModal(); refreshAll(); }
    else if (type === 'log') appendLog(payload);
    else if (type === 'news') scene.showToast(payload.text);
    else if (type === 'points') {
      if (payload.text) scene.addFloater(payload.text, '#5fd37a');
      else { if (payload.tech) scene.addFloater('+' + payload.tech + ' ⚙', '#5aa9ff'); if (payload.design) setTimeout(() => scene.addFloater('+' + payload.design + ' ✎', '#ffcc33'), 200); }
    }
    else if (type === 'stage') refreshAll();
    else if (type === 'research') { scene.showToast('🔬 ' + (payload.kind === 'type' ? 'New category unlocked: ' : 'Research complete: ') + payload.name); refreshAll(); }
  });

  // ---------- persistence
  function save() {
    if (!g.s) return;
    let p = null;
    if (g.pending) {
      const t = g.pending.type;
      p = t === 'reviews' ? { type: t, productId: g.pending.product.id } : t === 'contractdone' ? g.pending : { type: t, phase: g.pending.phase };
    }
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ s: g.s, pending: p })); } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY); if (!raw) return false;
      const data = JSON.parse(raw); if (!data.s) return false;
      g.s = data.s; g.pending = null;
      if (data.pending) {
        const p = data.pending;
        if (p.type === 'sliders' || p.type === 'devdone') g.pending = g.s.project ? { type: p.type, phase: p.phase, project: g.s.project } : null;
        else if (p.type === 'reviews') { const prod = g.s.products.find(x => x.id === p.productId); g.pending = prod ? { type: 'reviews', product: prod } : null; }
        else g.pending = p;
      }
      return true;
    } catch (e) { return false; }
  }

  // ---------- stats & status
  function refreshStats() {
    const s = g.s;
    $('#st-date').textContent = g.dateStr();
    $('#st-money').textContent = fmtMoney(s.money); $('#st-money').className = s.money < 0 ? 'bad' : '';
    $('#st-fans').textContent = fmtNum(s.fans);
    $('#st-hype').textContent = Math.round(s.hype);
    $('#st-rep').textContent = Math.round(s.rep);
    $('#st-rp').textContent = Math.floor(s.rp);
  }
  function researchLine() {
    const r = g.s.research; if (!r) return '';
    return `<div class="muted">🔬 Researching ${esc(r.name)} · week ${r.week}/${r.weeks}</div><div class="bar phase"><i style="width:${Math.min(100, r.week / r.weeks * 100)}%"></i></div>`;
  }
  function refreshStatus() {
    const s = g.s, p = s.project, el = $('#status');
    if (!p) {
      const active = s.products.filter(x => x.active);
      el.innerHTML = `<div><b class="accent">Idle.</b> <span class="muted">${active.length ? active.length + ' product(s) on the market. ' : ''}Start a new project or take a contract.</span></div>` +
        (active.length ? `<div class="muted">Last week: ${active.map(x => `${esc(x.name)} ${fmtMoney(x.lastWeek || 0)}`).join(' · ')}</div>` : '') + researchLine();
      return;
    }
    if (p.kind === 'software') {
      const type = g.type(p.typeId); const phase = g.D.phases[Math.max(0, p.phase)];
      el.innerHTML = `<div><b class="accent">${esc(p.name)}</b> <span class="muted">${type.name} · ${g.D.sizes[p.sizeId].name} · ${g.platform(p.platformId).name}</span></div>
        <div class="muted">${p.status === 'fixing' ? 'Fixing bugs…' : 'Phase ' + (p.phase + 1) + '/3: ' + phase.name} · ⚙ ${Math.round(p.tech)} ✎ ${Math.round(p.design)} · 🐛 ${Math.round(p.bugs)}</div>
        <div class="bar"><i style="width:${Math.min(100, p.week / p.weeks * 100)}%"></i></div>` + researchLine();
    } else {
      el.innerHTML = `<div><b class="accent">Contract:</b> ${esc(p.name)}</div><div class="muted">Points ${Math.round(p.points)} / ${p.offer.need} needed · pays ${fmtMoney(p.offer.pay)}</div>
        <div class="bar phase"><i style="width:${Math.min(100, p.week / p.weeks * 100)}%"></i></div>` + researchLine();
    }
  }
  function appendLog(entry) {
    const ul = $('#log'); const li = document.createElement('li'); li.className = entry.cls || '';
    li.innerHTML = `<span class="d">${g.dateStr()}</span>${esc(entry.text)}`; ul.prepend(li);
    while (ul.children.length > 80) ul.lastChild.remove();
  }
  function rebuildLog() { const ul = $('#log'); ul.innerHTML = ''; [...g.s.log].reverse().forEach(e => { const li = document.createElement('li'); li.className = e.cls || ''; li.innerHTML = `<span class="d">${e.date}</span>${esc(e.text)}`; ul.prepend(li); }); }
  function refreshAll() { refreshStats(); refreshStatus(); renderTab(); }

  // ---------- tabs
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); renderTab(); }));
  function renderTab() {
    const body = $('#tab-body'); if (!g.s) return;
    const fn = { dev: tabDev, contracts: tabContracts, post: tabPost, research: tabResearch, team: tabTeam, company: tabCompany, products: tabProducts }[tab];
    if (tab === 'dev') lastDevYear = g.year;
    body.innerHTML = fn();
    bindTab(body);
  }
  function bindTab(body) {
    body.querySelectorAll('[data-act]').forEach(el => el.addEventListener('click', () => {
      const a = el.dataset.act, id = +el.dataset.id; let err = null;
      if (a === 'accept') err = g.acceptContract(id);
      else if (a === 'post') err = g.post(el.dataset.kind);
      else if (a === 'research') err = g.startResearch(el.dataset.id);
      else if (a === 'hire') err = g.hire(id);
      else if (a === 'fire') g.fire(id);
      else if (a === 'path') err = g.choosePath(el.dataset.path);
      else if (a === 'start') {
        devForm.name = body.querySelector('#f-name').value.trim();
        err = g.startSoftware({ name: devForm.name, typeId: devForm.typeId, platformId: devForm.platformId, sizeId: devForm.sizeId });
        if (!err) devForm.name = '';
      }
      if (err) flash(err); refreshAll(); save();
    }));
    const tsel = body.querySelector('#f-type'), psel = body.querySelector('#f-plat'), nm = body.querySelector('#f-name');
    if (tsel) tsel.addEventListener('change', () => { devForm.typeId = tsel.value; devForm.platformId = null; devForm.name = nm.value; renderTab(); });
    if (psel) psel.addEventListener('change', () => { devForm.platformId = psel.value; devForm.name = nm.value; renderTab(); });
    body.querySelectorAll('.sizes label:not(.off)').forEach(l => l.addEventListener('click', () => { devForm.sizeId = l.dataset.size; devForm.name = nm.value; renderTab(); }));
  }
  function flash(msg) { scene.showToast('⚠ ' + msg); }

  function tabDev() {
    const s = g.s;
    if (s.project) {
      const p = s.project;
      if (p.kind === 'contract') return `<h3>Working on a contract</h3><p>${esc(p.name)}</p><p class="muted">Week ${p.week}/${p.weeks}. Points so far: ${Math.round(p.points)} of ${p.offer.need}.</p>`;
      const type = g.type(p.typeId);
      return `<h3>In development</h3><p><b>${esc(p.name)}</b> <span class="muted">· ${type.name} on ${g.platform(p.platformId).name}</span></p>
        <p class="muted">Week ${p.week}/${p.weeks}. Tech ⚙ ${Math.round(p.tech)} · Design ✎ ${Math.round(p.design)} · Bugs 🐛 ${Math.round(p.bugs)}</p>
        ${p.sliders.map((sl, i) => sl ? `<div class="card"><div class="title">Phase ${i + 1}: ${g.D.phases[i].name}</div><div class="meta">${g.D.phases[i].items.map((it, k) => `${it.label} ${sl[k]}%`).join(' · ')}</div></div>` : '').join('')}
        <p class="muted">Tip: ${esc(type.desc)}</p>`;
    }
    const types = g.unlockedTypes(); if (!devForm.typeId || !types.find(t => t.id === devForm.typeId)) devForm.typeId = types[0].id;
    const type = g.type(devForm.typeId);
    const plats = g.activePlatforms().filter(p => type.cats.includes(p.cat)).sort((a, b) => g.platformShare(b) - g.platformShare(a));
    if (!devForm.platformId || !plats.find(p => p.id === devForm.platformId)) devForm.platformId = plats[0] ? plats[0].id : null;
    const sizes = g.availableSizes(); if (!sizes.includes(devForm.sizeId)) devForm.sizeId = sizes[sizes.length - 1];
    const cost = devForm.platformId ? g.projectCost(devForm.sizeId, devForm.platformId) : 0;
    const size = g.D.sizes[devForm.sizeId];
    const tip = s.products.length === 0 ? `<div class="card tip"><div class="title">💡 Your first software</div><div class="meta">Keep it <b>Small</b> on the <b>Commodus 64</b> (you already own one, no license fee). Utilities like Performance and Reliability; Games want Features, Interface and Marketing. Finish, read the reviews, then Post on the BBS to pump sales. Press <b>?</b> up top for the full guide.</div></div>` : '';
    return `<h3>New software</h3>${tip}
      <div class="field"><label>Name</label><input type="text" id="f-name" maxlength="28" value="${esc(devForm.name)}" placeholder="e.g. TurboDisk, Chirpr, DoorsCleaner"></div>
      <div class="field"><label>Type ${s.trend ? `<span class="pill hot">🔥 Trending: ${g.type(s.trend).name}</span>` : ''}</label>
        <select id="f-type">${types.map(t => `<option value="${t.id}" ${t.id === devForm.typeId ? 'selected' : ''}>${t.name}${t.id === s.trend ? ' 🔥' : ''}</option>`).join('')}</select>
        <div class="muted">${esc(type.desc)}${type.minSize ? ' (Medium or larger)' : ''}</div></div>
      <div class="field"><label>Platform</label>
        ${plats.length ? `<select id="f-plat">${plats.map(p => `<option value="${p.id}" ${p.id === devForm.platformId ? 'selected' : ''}>${p.name} — ${Math.round(g.platformShare(p) * 100)}% share${s.platformsOwned.includes(p.id) ? '' : ' (license ' + fmtMoney(p.license * g.infl) + ')'}</option>`).join('')}</select>` : '<div class="bad">No platform supports this yet.</div>'}</div>
      <div class="field"><label>Project size</label><div class="sizes">${Object.entries(g.D.sizes).map(([id, sz]) => `<label data-size="${id}" class="${id === devForm.sizeId ? 'sel' : ''} ${sizes.includes(id) ? '' : 'off'}"><b>${sz.name}</b><br><span class="muted">${sz.weeks} wks</span></label>`).join('')}</div></div>
      <div class="row"><div>Cost: <b class="${cost > s.money ? 'bad' : 'good'}">${fmtMoney(cost)}</b></div><div class="muted">${size.weeks} weeks · ${size.need > 1 ? 'needs a team' : 'solo friendly'}</div></div>
      <div class="row"><button class="primary" data-act="start" ${!plats.length ? 'disabled' : ''}>Start development</button></div>`;
  }
  function tabContracts() {
    const s = g.s;
    if (!s.offers.length) return `<h3>Contracts</h3><p class="muted">No offers right now. ${g.network().verb} on ${g.network().name} to ask for work, or wait for the phone to ring.</p>`;
    return `<h3>Contract offers</h3>${s.contractMult ? '<p class="accent">Contracts currently pay ×' + s.contractMult.mult + '!</p>' : ''}` + s.offers.map(o => `<div class="card"><div class="title">${esc(o.task)} for <b>${esc(o.client)}</b></div>
      <div class="meta">${o.weeks} weeks · needs ~${o.need} points · pays <b class="good">${fmtMoney(o.pay)}</b> · expires in ${o.expires - s.week} wks</div>
      <div class="actions"><button data-act="accept" data-id="${o.id}" ${s.project ? 'disabled' : ''}>Accept</button></div></div>`).join('');
  }
  function tabPost() {
    const s = g.s, net = g.network(); const cd = s.postCooldown;
    const dis = cd > 0 ? 'disabled' : '';
    return `<h3>${net.verb} on ${net.name}</h3>
      <p class="muted">Fans: ${fmtNum(s.fans)} · Hype: ${Math.round(s.hype)} ${cd > 0 ? `· next ${net.noun} in ${cd} wk` : ''}${s.stage === 'indie' ? ' · Indie bonus ×1.5' : ''}</p>
      <div class="card"><div class="title">📣 Pump sales</div><div class="meta">Boost hype for products on the market (and the next launch). 12% chance to get ratioed.</div><div class="actions"><button data-act="post" data-kind="pump" ${dis}>${net.verb}</button></div></div>
      <div class="card"><div class="title">🤝 Ask for work</div><div class="meta">Brings in 2–3 contract offers.</div><div class="actions"><button data-act="post" data-kind="contracts" ${dis}>${net.verb}</button></div></div>
      <div class="card"><div class="title">📖 Share your journey</div><div class="meta">Build an audience. More fans = stronger launches.</div><div class="actions"><button data-act="post" data-kind="journey" ${dis}>${net.verb}</button></div></div>`;
  }
  function tabResearch() {
    const s = g.s, list = g.researchables();
    let html = `<h3>Research</h3><p class="muted">🔬 ${Math.floor(s.rp)} research points. You earn them by developing (12% of points) and by tinkering while idle. Unlock new software categories and team upgrades. One project at a time; research runs alongside development.</p>`;
    if (s.research) html += `<div class="card"><div class="title">In progress: ${esc(s.research.name)}</div><div class="meta">Week ${s.research.week}/${s.research.weeks}</div></div>`;
    const types = list.filter(x => x.kind === 'type'), boosts = list.filter(x => x.kind === 'boost');
    const card = r => `<div class="card"><div class="title">${esc(r.name)} ${r.hot ? '<span class="pill hot">🔥 trending</span>' : ''}</div><div class="meta">${esc(r.desc)}</div><div class="meta">🔬 <b class="${s.rp >= r.rp ? 'good' : 'bad'}">${r.rp}</b> · ${fmtMoney(r.cost)} · ${r.weeks} weeks</div><div class="actions"><button data-act="research" data-id="${r.id}" ${s.research || s.rp < r.rp || s.money < r.cost ? 'disabled' : ''}>Research</button></div></div>`;
    html += `<h4>New software categories (${types.length})</h4>` + (types.length ? types.map(card).join('') : '<p class="muted">Nothing new to discover this year. Time will tell.</p>');
    html += `<h4>Team & business upgrades (${boosts.length})</h4>` + (boosts.length ? boosts.map(card).join('') : '<p class="muted">Nothing available yet.</p>');
    const up = g.upcoming(); if (up.length) html += `<h4>On the horizon</h4><p class="muted">${up.map(u => `${esc(u.name)} <span class="pill">${u.year}</span>`).join(' ')}</p>`;
    if (s.researched.length) html += `<h4>Done</h4><p class="muted">${s.researched.map(id => { const t = g.type(id); return esc(t ? t.name : (g.D.research.find(r => r.id === id) || {}).name || id); }).join(' · ')}</p>`;
    return html;
  }
  function tabTeam() {
    const s = g.s, max = g.maxEmployees();
    let html = `<h3>Team (${s.employees.length}/${max})</h3>`;
    html += `<div class="card"><div class="title">${esc(s.founder)} <span class="pill">Founder</span></div><div class="meta">Tech ${s.skills.tech.toFixed(1)} · Design ${s.skills.design.toFixed(1)}${s.stage === 'indie' ? ' · solo focus ×1.35' : ''}</div></div>`;
    html += s.employees.map(e => `<div class="card"><div class="title">${esc(e.name)} <span class="pill">${e.title}</span></div><div class="meta">Tech ${e.tech.toFixed(1)} · Design ${e.design.toFixed(1)} · ${fmtMoney(e.salary)}/wk</div><div class="actions"><button class="danger" data-act="fire" data-id="${e.id}">Let go</button></div></div>`).join('');
    if (max === 0) html += `<p class="muted">You can't hire in this stage. Upgrade on the Company tab.</p>`;
    else {
      html += `<h4>Candidates</h4>` + (s.candidates.length ? s.candidates.map(c => `<div class="card"><div class="title">${esc(c.name)} <span class="pill">${c.title}</span></div><div class="meta">Tech ${c.tech} · Design ${c.design} · ${fmtMoney(c.salary)}/wk · signing ${fmtMoney(c.salary * 2)}</div><div class="actions"><button data-act="hire" data-id="${c.id}" ${s.employees.length >= max ? 'disabled' : ''}>Hire</button></div></div>`).join('') : '<p class="muted">No candidates. New ones appear every few months.</p>');
    }
    return html;
  }
  function tabCompany() {
    const s = g.s, st = g.stage();
    const order = ['garage', 'indie', 'solo', 'office', 'hq'];
    const ups = order.filter(k => order.indexOf(k) > order.indexOf(s.stage));
    const expected = g.expectedPPW();
    return `<h3>${esc(s.company)}</h3><p><b class="accent">${st.name}</b> — <span class="muted">${esc(st.desc)}</span></p>
      <p class="muted">Rent ${fmtMoney(st.rent * g.infl)}/wk · Salaries ${fmtMoney(s.employees.reduce((a, e) => a + e.salary, 0))}/wk · Revenue to date ${fmtMoney(s.totalRevenue)}</p>
      <p class="muted">Market expects ~${Math.round(expected * 12)} points for a small project this year. Your team makes ~${Math.round(g.staffPoints({ tech: .5, design: .5 }) / 1 * 12 / 1.0)}.</p>
      <h4>Upgrade</h4>` + ups.map(k => { const d = g.D.stages[k], cost = Math.round(g.D.stageCosts[k] * g.infl); return `<div class="card"><div class="title">${d.name} <span class="pill">${fmtMoney(cost)}</span></div><div class="meta">${esc(d.desc)} Max team ${d.maxEmployees}. Sizes: ${d.sizes.join(', ')}.</div><div class="actions"><button data-act="path" data-path="${k}" ${s.money < cost ? 'disabled' : ''}>Become ${d.name}</button></div></div>`; }).join('') +
      `<h4>Danger</h4><button class="danger" id="btn-reset">Start a new game</button>`;
  }
  function tabProducts() {
    const s = g.s; if (!s.products.length) return '<h3>Products</h3><p class="muted">Nothing shipped yet. Garage is quiet.</p>';
    return `<h3>Products (${s.products.length})</h3><table class="t"><tr><th>Name</th><th>Type</th><th>Score</th><th>Units</th><th>Revenue</th></tr>` +
      s.products.map(p => `<tr><td>${esc(p.name)} ${p.active ? '<span class="pill hot">live</span>' : ''}</td><td class="muted">${g.type(p.typeId).name}</td><td class="${p.score >= 7 ? 'good' : p.score < 5 ? 'bad' : ''}">${p.score}</td><td>${fmtNum(p.units)}</td><td>${fmtMoney(p.revenue)}</td></tr>`).join('') + '</table>';
  }
  document.addEventListener('click', e => { if (e.target.id === 'btn-reset' && confirm('Start over? Your current company will be lost.')) { localStorage.removeItem(SAVE_KEY); location.reload(); } });

  // ---------- modals
  const modalEl = $('#modal');
  function openModal(html) { modalEl.innerHTML = `<div class="modal">${html}</div>`; modalEl.classList.add('show'); return modalEl.firstElementChild; }
  function closeModal() { modalEl.classList.remove('show'); modalEl.innerHTML = ''; }

  function openPending(p) {
    refreshStats(); refreshStatus(); save();
    if (p.type === 'sliders') modalSliders(p);
    else if (p.type === 'devdone') modalDevDone(p);
    else if (p.type === 'reviews') modalReviews(p);
    else if (p.type === 'contractdone') modalContractDone(p);
    else if (p.type === 'path') modalPath();
    else if (p.type === 'ending') modalEnding();
    else if (p.type === 'gameover') modalGameOver();
  }

  function modalSliders(p) {
    const ph = g.D.phases[p.phase], proj = p.project, type = g.type(proj.typeId);
    const prev = proj.sliders[p.phase] || [50, 50, 50];
    const m = openModal(`<h2>${esc(proj.name)} — Phase ${p.phase + 1}/3: ${ph.name}</h2>
      <p class="muted">${type.name}: ${esc(type.desc)} Allocate your effort. The mix matters more than the totals.</p>
      ${ph.items.map((it, i) => `<div class="slider"><div class="lbl"><span>${it.label} <span class="muted">${it.tech >= 0.7 ? '⚙ tech' : it.tech <= 0.3 ? '✎ design' : '⚙✎ mixed'}</span></span><b id="v${i}">${prev[i]}%</b></div><input type="range" min="0" max="100" value="${prev[i]}" data-i="${i}"></div>`).join('')}
      <div class="btns"><button class="primary" id="ok">Start phase</button></div>`);
    m.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => m.querySelector('#v' + r.dataset.i).textContent = r.value + '%'));
    m.querySelector('#ok').addEventListener('click', () => g.setSliders(p.phase, [...m.querySelectorAll('input[type=range]')].map(r => +r.value)));
  }
  function modalDevDone(p) {
    const proj = p.project; const ratio = proj.bugs / Math.max(1, proj.points);
    const m = openModal(`<h2>${esc(proj.name)} is feature complete!</h2>
      <p>Points: ⚙ ${Math.round(proj.tech)} tech · ✎ ${Math.round(proj.design)} design</p>
      <p>Bugs: <b class="${ratio > 0.08 ? 'bad' : ratio > 0.04 ? 'accent' : 'good'}">🐛 ${Math.round(proj.bugs)}</b> <span class="muted">(${ratio > 0.08 ? 'reviewers will notice' : ratio > 0.04 ? 'a few rough edges' : 'pretty clean'})</span></p>
      <div class="btns"><button id="fix">Fix bugs (1 week, ~45%)</button><button class="primary" id="ship">Ship it!</button></div>`);
    m.querySelector('#fix').addEventListener('click', () => g.fixBugs());
    m.querySelector('#ship').addEventListener('click', () => g.ship());
  }
  function modalReviews(p) {
    const pr = p.product, type = g.type(pr.typeId), d = pr.detail;
    // find weakest phase for a hint
    let worst = -1, worstD = 0; const proj = { sliders: pr.sliders };
    const hints = [];
    if (d.match < 0.8) hints.push('Your slider mix did not fit what ' + type.name + ' buyers want.');
    if (d.q < 0.85) hints.push('Not enough work went in for ' + g.year + ' standards. Bigger team, or a smaller project.');
    if (d.bugs / Math.max(1, d.points) > 0.08) hints.push('Too many bugs. Push Reliability or fix before shipping.');
    if (!hints.length) hints.push('Nice work. Keep riding the trend and pumping hype at launch.');
    const m = openModal(`<h2>Reviews are in: ${esc(pr.name)}</h2><div class="bigscore">${pr.score} / 10</div>
      <div class="review">${pr.reviews.map(r => `<div class="card"><div class="meta">${esc(r.name)}</div><div class="sc">${r.score}/10</div><div>“${esc(r.quip)}”</div></div>`).join('')}</div>
      <p class="muted">Effort ${Math.round(d.q * 100)}% of expectations · Slider fit ${Math.round(d.match * 100)}% · Bugs ${d.bugs} · Points ${d.points}/${d.expected}</p>
      <p>${esc(hints.join(' '))}</p>
      <div class="btns"><button class="primary" id="ok">To market!</button></div>`);
    m.querySelector('#ok').addEventListener('click', () => g.closeReviews());
  }
  function modalContractDone(p) {
    const m = openModal(`<h2>Contract ${p.ok ? 'delivered' : 'delivered… badly'}</h2>
      <p>${esc(p.offer.task)} for ${esc(p.offer.client)}: ${p.points} points of ${p.offer.need} needed.</p>
      <p class="${p.ok ? 'good' : 'bad'}">${p.ok ? 'The client is thrilled.' : 'The client is disappointed and paid a fraction.'} You received <b>${fmtMoney(p.pay)}</b>.</p>
      <div class="btns"><button class="primary" id="ok">OK</button></div>`);
    m.querySelector('#ok').addEventListener('click', () => g.closePending());
  }
  function modalPath() {
    const paths = ['indie', 'solo', 'office'];
    const m = openModal(`<h2>Your company is growing. What kind of founder are you?</h2>
      <p class="muted">You can still move up later from the Company tab.</p>
      <div class="paths">${paths.map(k => { const d = g.D.stages[k], cost = Math.round(g.D.stageCosts[k] * g.infl); return `<div class="card" data-path="${k}"><h4>${d.name}</h4><div class="meta">${esc(d.desc)}</div><div class="meta">Team: ${d.maxEmployees} · Sizes: ${d.sizes.join(', ')}</div><div class="accent">${cost ? fmtMoney(cost) : 'Free'}</div></div>`; }).join('')}</div>
      <div class="btns"><button id="later">Decide later</button></div>`);
    m.querySelectorAll('[data-path]').forEach(c => c.addEventListener('click', () => { const err = g.choosePath(c.dataset.path); if (err) flash(err); }));
    m.querySelector('#later').addEventListener('click', () => g.skipPath());
  }
  function modalEnding() {
    const E = g.D.ending; let i = 0;
    const show = () => {
      if (i < E.headlines.length) {
        const m = openModal(`<h2>January 2026</h2><div class="headline">${esc(E.headlines[i])}</div><div class="btns"><button class="primary" id="n">${i === E.headlines.length - 1 ? 'What do we do?!' : 'Next'}</button></div>`);
        m.querySelector('#n').addEventListener('click', () => { i++; show(); });
      } else {
        const m = openModal(`<h2>Two AI companies now do everything. Your move.</h2><div class="paths">${E.choices.map((c, k) => `<div class="card" data-k="${k}"><h4>${esc(c.label)}</h4></div>`).join('')}</div>`);
        m.querySelectorAll('[data-k]').forEach(c => c.addEventListener('click', () => finalScreen(E.choices[+c.dataset.k].result)));
      }
    };
    show();
  }
  function finalScreen(resultText) {
    const sm = g.summary();
    openModal(`<h2>GAME OVER — ${esc(g.s.company)} (1984–2026)</h2>
      <p>${esc(resultText)}</p>
      <p class="muted">It didn't matter what you did. Nothing you could have done. Thanks for playing.</p>
      <div class="stats-grid">
        <div>Years in business</div><b>${sm.years}</b>
        <div>Products shipped</div><b>${sm.products}</b>
        <div>Contracts delivered</div><b>${sm.contracts}</b>
        <div>Lifetime revenue</div><b>${fmtMoney(sm.revenue)}</b>
        <div>Final cash</div><b>${fmtMoney(sm.money)}</b>
        <div>Fans</div><b>${fmtNum(sm.fans)}</b>
        <div>Final form</div><b>${esc(sm.stage)} (${sm.employees} staff)</b>
        <div>Best product</div><b>${sm.best ? esc(sm.best.name) + ' (' + sm.best.score + '/10)' : '—'}</b>
      </div>
      <div class="btns"><button class="primary" id="again">Play again</button></div>`);
    $('#again').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); location.reload(); });
  }
  function modalGameOver() {
    const sm = g.summary();
    openModal(`<h2>BANKRUPT</h2><p>The bank took the computer. ${esc(g.s.company)} is no more, in ${g.year}.</p>
      <p class="muted">${sm.products} products, ${fmtMoney(sm.revenue)} lifetime revenue. The AI companies didn't even need to show up.</p>
      <div class="btns"><button class="primary" id="again">Try again</button></div>`);
    $('#again').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); location.reload(); });
  }

  function modalGuide(first) {
    const m = openModal(`<h2>${first ? 'Welcome to the garage' : 'How to play'}</h2>
      <div class="guide">
      <p><b class="accent">Goal:</b> build a software company from 1984 until the AI apocalypse of 2026. Money, fans and reputation are your score. Weekly rent and salaries drain cash, so never sit idle for long.</p>
      <h4>Your first software</h4>
      <ol>
        <li>Open <b>Develop</b>, give it a name, pick <b>Utility</b> or <b>Video Game</b>, platform <b>Commodus 64</b> (you own one, so no license), size <b>Small</b>.</li>
        <li>Development has 3 phases with 3 sliders each. Each category has a secret ideal mix. Utilities: lean into Performance and Reliability. Games: Features, Interface and Marketing. Spreadsheets: Features, Reliability and Support.</li>
        <li>When it is feature complete, <b>fix bugs</b> if there are many, then ship. Reviews show your <i>Slider fit</i> and <i>Effort</i> so you can learn the mix.</li>
        <li>Sales trickle in weekly. Go to <b>Post</b> and pump sales on the BBS right after launch for a hype boost.</li>
      </ol>
      <h4>Then</h4>
      <ol>
        <li><b>Contracts</b> pay guaranteed cash while idle. Ask for work on the BBS when there are none.</li>
        <li><b>Research</b> 🔬 unlocks new categories (Database, Finance, Website, SaaS, Apps...) and upgrades like Source Control. Points come from developing.</li>
        <li>Around $25k you pick a path: Indie Hacker, Solopreneur or a Startup Office with employees. Bigger teams make bigger projects.</li>
        <li>Watch the news ticker. Platforms die, trends shift, crashes happen. <kbd>Space</kbd> pauses. The game autosaves.</li>
      </ol>
      </div>
      <div class="btns"><button class="primary" id="ok">${first ? 'Let\'s build something' : 'Got it'}</button></div>`);
    m.querySelector('#ok').addEventListener('click', () => { closeModal(); if (g.pending) openPending(g.pending); else setSpeed(1); });
  }
  $('#btn-help').addEventListener('click', () => { if (!g.s) return; setSpeed(0); modalGuide(false); });

  function modalStart(hasSave) {
    const m = openModal(`<h2>TECH LIFE TYCOON</h2>
      <p>It's 1984. You have a second-hand computer, a garage, and 42 years before two AI companies make all software obsolete. Make the most of it.</p>
      <div class="field"><label>Your name</label><input type="text" id="s-founder" maxlength="20" value="Sam Wozzle"></div>
      <div class="field"><label>Company name</label><input type="text" id="s-company" maxlength="20" value="Garage Soft"></div>
      <div class="btns">${hasSave ? '<button id="cont">Continue saved game</button>' : ''}<button class="primary" id="new">Start in the garage</button></div>`);
    m.querySelector('#new').addEventListener('click', () => {
      g.newGame(m.querySelector('#s-company').value.trim() || 'Garage Soft', m.querySelector('#s-founder').value.trim() || 'You');
      closeModal(); rebuildLog(); refreshAll(); save(); setSpeed(0); modalGuide(true);
    });
    if (hasSave) m.querySelector('#cont').addEventListener('click', () => { load(); g.migrate(); closeModal(); rebuildLog(); refreshAll(); if (g.pending) openPending(g.pending); setSpeed(1); });
  }

  // ---------- controls
  document.querySelectorAll('.speed button').forEach(b => b.addEventListener('click', () => setSpeed(+b.dataset.speed)));
  document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target.tagName !== 'INPUT' && !modalEl.classList.contains('show')) { e.preventDefault(); setSpeed(speed ? 0 : 1); } });

  window.TL = { g, scene, refreshAll, save, setSpeed };
  // boot
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  modalStart(hasSave);
})();
