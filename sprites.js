// Tech Life Tycoon — pixel-art scene renderer (canvas)
(function (root) {
  const PAL = {
    h: '#3b2a1a', s: '#f1c6a0', e: '#222', t: '#3d7bd6', p: '#2d3a6b', b: '#222', k: '#1a1a1a', w: '#fff',
  };
  const SHIRTS = ['#3d7bd6', '#d64545', '#3fa65b', '#d6a53d', '#8b5cd6', '#d65cb0'];
  const HAIRS = ['#3b2a1a', '#111', '#c8842a', '#8a8a8a', '#e3c35a', '#5a2a0c'];

  // Seated person facing left, 14x16. Two frames (typing).
  const PERSON = [
    [
      '....hhhhhh....',
      '...hhhhhhhh...',
      '...hhssssss...',
      '...hsssesss...',
      '...hssssss....',
      '....ssss......',
      '....tttttt....',
      '...tttttttt...',
      '..ttttttttt...',
      '.sstttttttt...',
      'ss.tttttttt...',
      '...pppppppp...',
      '...pppppppp...',
      '..pppp..pppp..',
      '..pppp..pppp..',
      '..bbbb..bbbb..',
    ],
    [
      '....hhhhhh....',
      '...hhhhhhhh...',
      '...hhssssss...',
      '...hsssesss...',
      '...hssssss....',
      '....ssss......',
      '....tttttt....',
      '...tttttttt...',
      '.sstttttttt...',
      'ss.tttttttt...',
      '...tttttttt...',
      '...pppppppp...',
      '...pppppppp...',
      '..pppp..pppp..',
      '..pppp..pppp..',
      '..bbbb..bbbb..',
    ],
  ];

  function drawSprite(ctx, rows, x, y, sc, pal) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c]; if (ch === '.') continue;
        ctx.fillStyle = pal[ch] || '#f0f';
        ctx.fillRect(x + c * sc, y + r * sc, sc, sc);
      }
    }
  }
  const rect = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

  // Desk + chair + computer. (x,y) = desk top-left. Person sits to the right of the desk.
  function drawDesk(ctx, x, y, era, person, frame, sc, t) {
    const dw = 46 * sc / 2, dh = 4 * sc / 2;
    // desk legs & top
    rect(ctx, x + 2, y + dh, 3, 18 * sc / 2, '#5a3b1e');
    rect(ctx, x + dw - 5, y + dh, 3, 18 * sc / 2, '#5a3b1e');
    rect(ctx, x, y, dw, dh, '#8a5a2b');
    rect(ctx, x, y, dw, 2, '#a86f38');
    drawComputer(ctx, x + 4, y, era, sc, t);
    // chair
    const px = x + dw - 2 * sc, py = y - 10 * sc;
    rect(ctx, px + 7 * sc, py + 5 * sc, 3 * sc, 10 * sc, '#333');
    rect(ctx, px + 2 * sc, py + 13 * sc, 8 * sc, 2 * sc, '#333');
    drawSprite(ctx, PERSON[frame], px, py, sc, person);
  }

  function drawComputer(ctx, x, y, era, sc, t) {
    const s = sc / 2; // base unit
    const blink = Math.floor(t / 400) % 2;
    switch (era) {
      case 0: { // Commodus 64: small CRT + wedge keyboard
        rect(ctx, x + 2, y - 22 * s, 22 * s, 18 * s, '#d9cdb3'); rect(ctx, x + 4, y - 20 * s, 18 * s, 13 * s, '#2b2bb3');
        rect(ctx, x + 6, y - 18 * s, 10 * s, 1.5 * s, '#9fa8ff'); rect(ctx, x + 6, y - 15 * s, 7 * s, 1.5 * s, '#9fa8ff');
        if (blink) rect(ctx, x + 6, y - 12 * s, 2 * s, 2 * s, '#9fa8ff');
        rect(ctx, x + 8, y - 4 * s, 12 * s, 4 * s, '#c9b78f'); // base
        rect(ctx, x + 26 * s, y - 3 * s, 16 * s, 3 * s, '#c6b48a'); rect(ctx, x + 27 * s, y - 2.5 * s, 14 * s, 1 * s, '#6b5a3a'); // keyboard
        break; }
      case 1: { // IBN PC/AT: monitor on box, green text
        rect(ctx, x + 2, y - 10 * s, 24 * s, 10 * s, '#d8d0bd'); rect(ctx, x + 20 * s, y - 8 * s, 4 * s, 2 * s, '#333');
        rect(ctx, x + 3, y - 32 * s, 22 * s, 21 * s, '#d9cdb3'); rect(ctx, x + 5, y - 30 * s, 18 * s, 15 * s, '#0a1a0a');
        rect(ctx, x + 7, y - 28 * s, 11 * s, 1.5 * s, '#4cff4c'); rect(ctx, x + 7, y - 25 * s, 8 * s, 1.5 * s, '#4cff4c'); rect(ctx, x + 7, y - 22 * s, 13 * s, 1.5 * s, '#4cff4c');
        if (blink) rect(ctx, x + 7, y - 19 * s, 2 * s, 2 * s, '#4cff4c');
        rect(ctx, x + 30 * s, y - 3 * s, 14 * s, 3 * s, '#d8d0bd'); rect(ctx, x + 31 * s, y - 2.5 * s, 12 * s, 1 * s, '#777');
        break; }
      case 2: { // Beige tower + CRT
        rect(ctx, x + 2, y - 26 * s, 24 * s, 22 * s, '#ddd3bf'); rect(ctx, x + 4, y - 24 * s, 20 * s, 16 * s, '#1c3b6e');
        rect(ctx, x + 4, y - 24 * s, 20 * s, 2 * s, '#2f5aa8'); rect(ctx, x + 6, y - 20 * s, 12 * s, 1.5 * s, '#fff'); rect(ctx, x + 6, y - 17 * s, 9 * s, 1.5 * s, '#ddd');
        rect(ctx, x + 10, y - 4 * s, 10 * s, 4 * s, '#c9bf9f');
        rect(ctx, x + 30 * s, y - 3 * s, 14 * s, 3 * s, '#d8d0bd'); rect(ctx, x + 31 * s, y - 2.5 * s, 12 * s, 1 * s, '#777');
        rect(ctx, x - 12 * s, y + 6 * s, 9 * s, 26 * s, '#d5ccb5'); rect(ctx, x - 10 * s, y + 9 * s, 5 * s, 1.5 * s, '#555'); rect(ctx, x - 10 * s, y + 13 * s, 5 * s, 1.5 * s, '#555');
        if (blink) rect(ctx, x - 10 * s, y + 28 * s, 1.5 * s, 1.5 * s, '#4cff4c');
        break; }
      case 3: { // LCD + black tower
        rect(ctx, x + 4, y - 24 * s, 22 * s, 17 * s, '#2a2a2a'); rect(ctx, x + 5, y - 23 * s, 20 * s, 15 * s, '#3a78c8');
        rect(ctx, x + 5, y - 23 * s, 20 * s, 2 * s, '#235c9e'); rect(ctx, x + 7, y - 19 * s, 10 * s, 1.5 * s, '#fff'); rect(ctx, x + 7, y - 16 * s, 14 * s, 1.5 * s, '#e0e0e0');
        rect(ctx, x + 13, y - 7 * s, 4 * s, 7 * s, '#2a2a2a'); rect(ctx, x + 8, y - 1.5 * s, 14 * s, 1.5 * s, '#2a2a2a');
        rect(ctx, x + 30 * s, y - 3 * s, 14 * s, 3 * s, '#2d2d2d'); rect(ctx, x + 31 * s, y - 2.5 * s, 12 * s, 1 * s, '#666');
        rect(ctx, x - 12 * s, y + 6 * s, 9 * s, 26 * s, '#1e1e1e'); if (blink) rect(ctx, x - 10 * s, y + 9 * s, 1.5 * s, 1.5 * s, '#3af');
        break; }
      case 4: { // Laptop
        rect(ctx, x + 8, y - 16 * s, 24 * s, 15 * s, '#8c8c8c'); rect(ctx, x + 9, y - 15 * s, 22 * s, 13 * s, '#dfe8f5');
        rect(ctx, x + 9, y - 15 * s, 22 * s, 2 * s, '#aab8cc'); rect(ctx, x + 11, y - 11 * s, 12 * s, 1.5 * s, '#333'); rect(ctx, x + 11, y - 8 * s, 16 * s, 1.5 * s, '#666');
        rect(ctx, x + 6, y - 2 * s, 30 * s, 2 * s, '#9a9a9a'); rect(ctx, x + 10, y - 1.5 * s, 22 * s, 1 * s, '#555');
        break; }
      case 5: { // All-in-one silver + phone
        rect(ctx, x + 2, y - 26 * s, 28 * s, 19 * s, '#c9cdd3'); rect(ctx, x + 3, y - 25 * s, 26 * s, 15 * s, '#f4f6fa');
        rect(ctx, x + 3, y - 25 * s, 26 * s, 2 * s, '#4a90e2'); rect(ctx, x + 5, y - 21 * s, 10 * s, 1.5 * s, '#333'); rect(ctx, x + 5, y - 18 * s, 18 * s, 1.5 * s, '#888'); rect(ctx, x + 5, y - 15 * s, 14 * s, 1.5 * s, '#888');
        rect(ctx, x + 13, y - 7 * s, 6 * s, 7 * s, '#b0b4ba'); rect(ctx, x + 8, y - 1.5 * s, 16 * s, 1.5 * s, '#b0b4ba');
        rect(ctx, x + 34 * s, y - 3 * s, 12 * s, 3 * s, '#e0e0e0'); rect(ctx, x + 35 * s, y - 2.5 * s, 10 * s, 1 * s, '#999');
        rect(ctx, x + 36 * s, y - 9 * s, 4 * s, 6 * s, '#111'); rect(ctx, x + 36.5 * s, y - 8.5 * s, 3 * s, 4.5 * s, blink ? '#38c' : '#1a5');
        break; }
      case 6: { // Dual monitors
        for (let i = 0; i < 2; i++) {
          const mx = x + 2 + i * 15 * s;
          rect(ctx, mx, y - 24 * s, 14 * s, 15 * s, '#111'); rect(ctx, mx + 0.5 * s, y - 23.5 * s, 13 * s, 13 * s, i ? '#1e1e2e' : '#23303f');
          rect(ctx, mx + 2 * s, y - 21 * s, 6 * s, 1.2 * s, i ? '#8be' : '#fff'); rect(ctx, mx + 2 * s, y - 18 * s, 9 * s, 1.2 * s, '#9c9'); rect(ctx, mx + 2 * s, y - 15 * s, 5 * s, 1.2 * s, '#c96');
          rect(ctx, mx + 6 * s, y - 8 * s, 2 * s, 8 * s, '#222');
        }
        rect(ctx, x + 32 * s, y - 3 * s, 14 * s, 3 * s, '#1a1a1a'); rect(ctx, x + 33 * s, y - 2.5 * s, 12 * s, 1 * s, '#555');
        break; }
      default: { // Ultrawide + RGB glow
        const g = ctx.createLinearGradient(x, 0, x + 34 * s, 0); g.addColorStop(0, '#7b2ff7'); g.addColorStop(1, '#2fd0f7');
        ctx.fillStyle = g; ctx.fillRect(x - 1, y - 27 * s, 36 * s, 20 * s);
        rect(ctx, x + 1, y - 25 * s, 32 * s, 16 * s, '#0e0e16');
        rect(ctx, x + 3, y - 22 * s, 12 * s, 1.2 * s, '#d0d0ff'); rect(ctx, x + 3, y - 19 * s, 20 * s, 1.2 * s, '#6cf'); rect(ctx, x + 3, y - 16 * s, 16 * s, 1.2 * s, '#c6f');
        rect(ctx, x + 20 * s, y - 22 * s, 11 * s, 9 * s, '#1a1a2e'); if (blink) rect(ctx, x + 22 * s, y - 20 * s, 7 * s, 5 * s, '#2a2a4e');
        rect(ctx, x + 15 * s, y - 7 * s, 4 * s, 7 * s, '#222'); rect(ctx, x + 10 * s, y - 1.5 * s, 14 * s, 1.5 * s, '#222');
        rect(ctx, x + 36 * s, y - 3 * s, 12 * s, 3 * s, '#111'); const kg = ctx.createLinearGradient(x + 36 * s, 0, x + 48 * s, 0); kg.addColorStop(0, '#f0f'); kg.addColorStop(1, '#0ff'); ctx.fillStyle = kg; ctx.fillRect(x + 37 * s, y - 2.5 * s, 10 * s, 1 * s);
        break; }
    }
  }

  function drawPlant(ctx, x, y) {
    rect(ctx, x, y - 8, 12, 8, '#b5651d'); rect(ctx, x + 1, y - 9, 10, 2, '#c97a2e');
    rect(ctx, x + 4, y - 22, 4, 14, '#2e7d32'); rect(ctx, x - 2, y - 18, 7, 5, '#388e3c'); rect(ctx, x + 7, y - 20, 7, 5, '#388e3c'); rect(ctx, x + 2, y - 26, 8, 5, '#43a047');
  }
  function drawBox(ctx, x, y, w, h) { rect(ctx, x, y, w, h, '#b58a4a'); rect(ctx, x, y, w, 3, '#8d6a37'); rect(ctx, x + w / 2 - 1, y, 2, h, '#8d6a37'); }
  function drawWindow(ctx, x, y, w, h, night) {
    rect(ctx, x - 3, y - 3, w + 6, h + 6, '#e8e2d2');
    rect(ctx, x, y, w, h, night ? '#1b2340' : '#8fd0ff');
    if (!night) { rect(ctx, x + w - 18, y + 6, 10, 10, '#ffe066'); rect(ctx, x + 8, y + 14, 16, 5, '#fff'); rect(ctx, x + 14, y + 10, 12, 5, '#fff'); }
    else { rect(ctx, x + w - 16, y + 6, 6, 6, '#fff3b0'); for (let i = 0; i < 6; i++) rect(ctx, x + 6 + (i * 13) % (w - 10), y + 8 + (i * 7) % (h - 12), 1, 1, '#fff'); }
    rect(ctx, x + w / 2 - 1, y, 2, h, '#e8e2d2'); rect(ctx, x, y + h / 2 - 1, w, 2, '#e8e2d2');
  }
  function drawSkyline(ctx, x, y, w, h, night) {
    rect(ctx, x, y, w, h, night ? '#141a33' : '#9fd6ff');
    let bx = x; let i = 0;
    while (bx < x + w) { const bw = 12 + (i * 7) % 16, bh = 20 + (i * 13) % (h - 30); rect(ctx, bx, y + h - bh, bw, bh, night ? '#2a3150' : '#6f88a8'); for (let r = 0; r < bh - 6; r += 6) for (let c = 2; c < bw - 3; c += 5) if ((r + c + i) % 3) rect(ctx, bx + c, y + h - bh + r + 2, 2, 3, night ? '#ffe9a0' : '#dde'); bx += bw + 4; i++; }
  }

  class Scene {
    constructor(canvas, game) {
      this.cv = canvas; this.ctx = canvas.getContext('2d'); this.g = game; this.floaters = []; this.t = 0; this.toast = null;
      this.ctx.imageSmoothingEnabled = false;
    }
    addFloater(text, color) {
      const base = this.founderPos();
      this.floaters.push({ x: base.x + 10 + Math.random() * 30, y: base.y - 10, text, color, life: 1 });
    }
    showToast(text) { this.toast = { text, life: 1, born: this.t }; }
    founderPos() { return { x: 190, y: 250 }; }
    layout() {
      const stage = this.g.s ? this.g.s.stage : 'garage';
      if (stage === 'garage' || stage === 'indie') return 'garage';
      if (stage === 'solo') return 'studio';
      return stage;
    }
    render(dt) {
      this.t += dt;
      const ctx = this.ctx, W = this.cv.width, H = this.cv.height, g = this.g, s = g.s;
      const era = s ? g.eraIndex() : 0;
      const night = s ? (Math.floor(s.week / 2) % 3 === 0) : false;
      const typing = !!(s && s.project);
      const frame = typing ? Math.floor(this.t / 220) % 2 : 0;
      const lay = this.layout();
      ctx.clearRect(0, 0, W, H);

      if (lay === 'garage') {
        rect(ctx, 0, 0, W, 250, '#a58a63'); // wood wall
        for (let y = 0; y < 250; y += 16) rect(ctx, 0, y, W, 2, '#8d7352');
        rect(ctx, 0, 250, W, H - 250, '#7d7d7d'); for (let x = 0; x < W; x += 40) rect(ctx, x, 250, 1, H - 250, '#6c6c6c'); // concrete
        // garage door
        rect(ctx, 430, 30, 200, 220, '#cfc6b3'); for (let y = 30; y < 250; y += 28) rect(ctx, 430, y, 200, 3, '#a89d86'); rect(ctx, 520, 140, 20, 4, '#555');
        drawWindow(ctx, 40, 40, 90, 60, night);
        // shelf with boxes
        rect(ctx, 250, 70, 150, 4, '#5a3b1e'); drawBox(ctx, 260, 46, 28, 24); drawBox(ctx, 300, 50, 36, 20); drawBox(ctx, 350, 44, 30, 26);
        rect(ctx, 250, 130, 150, 4, '#5a3b1e'); drawBox(ctx, 270, 108, 40, 22); rect(ctx, 330, 112, 14, 18, '#3d7bd6'); rect(ctx, 348, 112, 14, 18, '#d64545');
        // poster
        rect(ctx, 150, 60, 60, 80, '#f3efe4'); rect(ctx, 160, 70, 40, 40, '#ffcc33'); ctx.fillStyle = '#222'; ctx.font = '10px monospace'; ctx.fillText('PEAR', 164, 128);
        drawBox(ctx, 40, 210, 50, 40); drawBox(ctx, 560, 215, 44, 35); drawBox(ctx, 575, 185, 30, 30);
        // bike
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(470, 300, 18, 0, Math.PI * 2); ctx.arc(530, 300, 18, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(470, 300); ctx.lineTo(500, 270); ctx.lineTo(530, 300); ctx.lineTo(500, 300); ctx.lineTo(470, 300); ctx.stroke();
        if (s && s.stage === 'indie') { rect(ctx, 380, 200, 80, 50, '#2b2b2b'); rect(ctx, 384, 204, 72, 42, '#3a3a3a'); ctx.fillStyle = '#4cff4c'; ctx.font = '8px monospace'; ctx.fillText('BUILD IN', 392, 222); ctx.fillText('PUBLIC', 398, 236); }
        drawDesk(ctx, 100, 232, era, this.founderPal(), frame, 3, this.t);
      } else if (lay === 'studio') {
        rect(ctx, 0, 0, W, 240, '#f0e6d2'); rect(ctx, 0, 240, W, H - 240, '#b98b5a'); for (let x = 0; x < W; x += 36) rect(ctx, x, 240, 1, H - 240, '#9e7347');
        drawWindow(ctx, 60, 36, 120, 80, night); drawWindow(ctx, 430, 36, 120, 80, night);
        rect(ctx, 230, 50, 90, 60, '#fff'); rect(ctx, 236, 56, 78, 48, '#dde'); ctx.fillStyle = '#222'; ctx.font = '8px monospace'; ctx.fillText('TODO: ship', 244, 72); ctx.fillText('[x] coffee', 244, 84); ctx.fillText('[ ] sleep', 244, 96);
        drawPlant(ctx, 600, 240); drawPlant(ctx, 30, 240);
        rect(ctx, 520, 150, 90, 90, '#8a5a2b'); rect(ctx, 522, 152, 86, 20, '#a86f38'); rect(ctx, 522, 176, 86, 20, '#a86f38'); rect(ctx, 522, 200, 86, 20, '#a86f38'); for (let i = 0; i < 12; i++) rect(ctx, 528 + i * 7, 155 + (i % 3) * 24, 5, 14, ['#d64545', '#3d7bd6', '#3fa65b', '#d6a53d'][i % 4]);
        drawDesk(ctx, 90, 222, era, this.founderPal(), frame, 3, this.t);
        this.drawEmployees(ctx, [[330, 232], [430, 232]], era, frame);
      } else if (lay === 'office') {
        rect(ctx, 0, 0, W, 230, '#e9eef5'); rect(ctx, 0, 230, W, H - 230, '#5d6f8a'); for (let y = 230; y < H; y += 8) for (let x = (y / 8 % 2) * 8; x < W; x += 16) rect(ctx, x, y, 8, 8, '#54657f');
        drawSkyline(ctx, 40, 30, 240, 90, night); rect(ctx, 37, 27, 246, 96, 'transparent'); ctx.strokeStyle = '#cfd6e0'; ctx.lineWidth = 3; ctx.strokeRect(38, 28, 244, 94);
        rect(ctx, 330, 40, 160, 90, '#fff'); ctx.strokeStyle = '#999'; ctx.lineWidth = 2; ctx.strokeRect(330, 40, 160, 90); ctx.fillStyle = '#d64545'; ctx.font = '9px monospace'; ctx.fillText('Q3 ROADMAP', 340, 58); ctx.fillStyle = '#3d7bd6'; ctx.fillText('- ship it', 340, 76); ctx.fillText('- ???', 340, 92); ctx.fillText('- profit', 340, 108);
        drawPlant(ctx, 600, 230); drawPlant(ctx, 20, 230);
        rect(ctx, 520, 60, 80, 24, '#333'); ctx.fillStyle = '#4cff4c'; ctx.font = '8px monospace'; ctx.fillText((s ? s.company : '').slice(0, 10).toUpperCase(), 526, 76);
        drawDesk(ctx, 60, 212, era, this.founderPal(), frame, 3, this.t);
        this.drawEmployees(ctx, [[250, 190], [370, 190], [490, 190], [250, 290], [370, 290], [490, 290]], era, frame);
      } else { // hq
        drawSkyline(ctx, 0, 0, W, 170, night); rect(ctx, 0, 170, W, 6, '#9aa6b8'); for (let x = 0; x < W; x += 160) rect(ctx, x, 0, 4, 176, '#9aa6b8');
        rect(ctx, 0, 176, W, H - 176, '#d9dde3'); for (let x = 0; x < W; x += 32) rect(ctx, x, 176, 1, H - 176, '#c4c9d1');
        rect(ctx, 20, 20, 170, 40, '#111'); ctx.fillStyle = '#0ff'; ctx.font = 'bold 14px monospace'; ctx.fillText((s ? s.company : '').slice(0, 14).toUpperCase(), 30, 46);
        // ping-pong table
        rect(ctx, 30, 300, 90, 34, '#2e7d32'); rect(ctx, 30, 316, 90, 2, '#fff'); rect(ctx, 73, 300, 2, 34, '#ccc');
        drawPlant(ctx, 150, 350); drawPlant(ctx, 20, 290);
        drawDesk(ctx, 40, 200, era, this.founderPal(), frame, 3, this.t);
        const pos = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) pos.push([200 + c * 110, 190 + r * 60]);
        this.drawEmployees(ctx, pos, era, frame);
      }

      // floaters
      ctx.font = 'bold 12px monospace';
      for (const f of this.floaters) { f.y -= dt * 0.03; f.life -= dt / 1600; ctx.globalAlpha = Math.max(0, f.life); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y); }
      ctx.globalAlpha = 1; this.floaters = this.floaters.filter(f => f.life > 0);

      // header strip
      if (s) {
        rect(ctx, 0, 0, W, 18, 'rgba(0,0,0,0.55)'); ctx.fillStyle = '#fff'; ctx.font = '10px monospace';
        ctx.fillText(`${g.stage().name.toUpperCase()}  ·  ${g.dateStr()}  ·  ${g.D.computers[era].name}`, 8, 12);
      }
      if (this.toast) {
        const age = this.t - this.toast.born; if (age > 6000) this.toast = null; else {
          const a = age < 300 ? age / 300 : age > 5500 ? (6000 - age) / 500 : 1; ctx.globalAlpha = a;
          rect(ctx, 20, H - 50, W - 40, 36, 'rgba(20,20,30,0.9)'); rect(ctx, 20, H - 50, 4, 36, '#ffcc33'); ctx.fillStyle = '#fff'; ctx.font = '10px monospace';
          this.wrap(ctx, this.toast.text, 32, H - 36, W - 60, 12); ctx.globalAlpha = 1;
        }
      }
    }
    wrap(ctx, text, x, y, maxW, lh) {
      const words = text.split(' '); let line = ''; let yy = y;
      for (const w of words) { const t = line + w + ' '; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = w + ' '; yy += lh; if (yy > y + lh) break; } else line = t; }
      ctx.fillText(line, x, yy);
    }
    founderPal() { return { ...PAL, t: '#3d7bd6', h: '#3b2a1a' }; }
    drawEmployees(ctx, positions, era, frame) {
      const emps = this.g.s ? this.g.s.employees : [];
      positions.forEach(([x, y], i) => {
        const e = emps[i];
        if (!e) { // empty desk
          rect(ctx, x, y, 60, 5, '#9a9a9a'); rect(ctx, x + 2, y + 5, 3, 20, '#777'); rect(ctx, x + 55, y + 5, 3, 20, '#777'); return;
        }
        const pal = { ...PAL, t: SHIRTS[e.color % SHIRTS.length], h: HAIRS[(e.color * 7 + i) % HAIRS.length] };
        drawDesk(ctx, x, y, era, pal, (frame + i) % 2, 2.4, this.t + i * 137);
      });
    }
  }

  root.Scene = Scene;
})(window);
