// Unified SVG card renderer (Approach B): one vector card used for BOTH the
// on-screen preview and the eventual PDF export. viewBox is 450x650 user units
// = 45x65mm (1 unit = 0.1mm), matching the fallback art SVGs.
//
// Glow on weapon names uses the global #glow-teal / #glow-red filters defined
// once in index.html (referenced across inline SVGs in the same document).

const W = 450, H = 650, PAD = 28;

// pt -> user units (1pt = 0.3528mm = 3.528 units). Courier Prime is monospaced,
// so a glyph advance is ~0.6em; that lets us wrap text by character count.
const ptU = (pt) => +(pt * 3.528).toFixed(2);
const charU = (pt) => 0.6 * ptU(pt);

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrapWords(text, maxChars) {
  const lines = [];
  let cur = "";
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    if (cur === "") cur = word;
    else if (cur.length + 1 + word.length <= maxChars) cur += " " + word;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Largest pt in [minPt, maxPt] whose text fits in <= maxLines lines of availU.
function fitText(text, availU, maxPt, minPt, maxLines = 2) {
  for (let pt = maxPt; pt >= minPt; pt -= 0.5) {
    const maxChars = Math.floor(availU / charU(pt));
    const lines = wrapWords(text, maxChars);
    if (lines.length <= maxLines && lines.every((l) => l.length <= maxChars)) return { lines, pt };
  }
  const maxChars = Math.max(4, Math.floor(availU / charU(minPt)));
  let lines = wrapWords(text, maxChars);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, maxChars - 1) + "…";
  }
  return { lines, pt: minPt };
}

function T(x, y, s, o = {}) {
  const { size = 7, anchor = "middle", weight = 700, fill = "#d8f0ee", opacity = 1, ls = -0.6, filter } = o;
  return `<text x="${x}" y="${y}" font-size="${ptU(size)}" text-anchor="${anchor}" font-weight="${weight}" `
    + `fill="${fill}" opacity="${opacity}" letter-spacing="${ls}" font-family="'Courier Prime', monospace"`
    + `${filter ? ` filter="${filter}"` : ""}>${esc(s)}</text>`;
}

// Multi-line centred name with glow.
function nameBlock(fit, cx, topY, fill, filter) {
  const lh = ptU(fit.pt) * 1.08;
  const n = fit.lines.length;
  const startY = topY + (n === 1 ? lh * 0.5 : 0);
  return fit.lines.map((line, i) =>
    `<text x="${cx}" y="${(startY + i * lh).toFixed(1)}" font-size="${ptU(fit.pt)}" text-anchor="middle" `
    + `font-weight="700" fill="${fill}" letter-spacing="-1" font-family="'Courier Prime', monospace" `
    + `filter="${filter}">${esc(line.toUpperCase())}</text>`
  ).join("");
}

// ---- arc glyph ----
// Directional shape (FRONT wedge / CORRIDOR lane / OMNI rings) whose base tucks
// BEHIND the "ARC" oval so the two read as one continuous shape. The shape is
// drawn first, then the (opaque-ish) oval is laid on top to cover the overlap.
function arcGlyph(arc, cx, cy, idx) {
  const teal = "#4ecdc4";
  const fillId = `arcfill${idx}`, strokeId = `arcstroke${idx}`;
  const rx = 43, ry = 27;            // oval — large enough to hold "ARC"
  const top = cy - 80, bot = cy + 8; // shared by FRONT & CORRIDOR -> identical height
  // userSpaceOnUse so the edge-line gradient renders on vertical (CORRIDOR)
  // lines too — an objectBoundingBox gradient collapses on a zero-width bbox.
  const grads = `
    <linearGradient id="${fillId}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="rgba(78,205,196,0.6)"/><stop offset="100%" stop-color="rgba(78,205,196,0)"/>
    </linearGradient>
    <linearGradient id="${strokeId}" gradientUnits="userSpaceOnUse" x1="0" y1="${bot}" x2="0" y2="${top}">
      <stop offset="0%" stop-color="rgba(78,205,196,0.95)"/><stop offset="100%" stop-color="rgba(78,205,196,0.3)"/>
    </linearGradient>`;
  let shape;
  if (arc === "FRONT") {
    shape = `<polygon points="${cx-46},${top} ${cx+46},${top} ${cx+3},${bot} ${cx-3},${bot}" fill="url(#${fillId})"/>
      <line x1="${cx-3}" y1="${bot}" x2="${cx-46}" y2="${top}" stroke="url(#${strokeId})" stroke-width="2"/>
      <line x1="${cx+3}" y1="${bot}" x2="${cx+46}" y2="${top}" stroke="url(#${strokeId})" stroke-width="2"/>`;
  } else if (arc === "CORRIDOR") {
    shape = `<rect x="${cx-32}" y="${top}" width="64" height="${bot-top}" fill="url(#${fillId})"/>
      <line x1="${cx-32}" y1="${bot}" x2="${cx-32}" y2="${top}" stroke="url(#${strokeId})" stroke-width="2"/>
      <line x1="${cx+32}" y1="${bot}" x2="${cx+32}" y2="${top}" stroke="url(#${strokeId})" stroke-width="2"/>`;
  } else { // OMNI / all-round — glow rings encircling the oval
    shape = `<ellipse cx="${cx}" cy="${cy}" rx="54" ry="36" fill="none" stroke="rgba(78,205,196,0.6)"  stroke-width="5"/>
      <ellipse cx="${cx}" cy="${cy}" rx="54" ry="36" fill="none" stroke="rgba(78,205,196,0.3)"  stroke-width="10"/>
      <ellipse cx="${cx}" cy="${cy}" rx="54" ry="36" fill="none" stroke="rgba(78,205,196,0.12)" stroke-width="16"/>`;
  }
  const label = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(4,14,28,0.9)" stroke="${teal}" stroke-width="1.8"/>
    ${T(cx, cy + 11, "ARC", { size: 9, fill: "#d8f0ee", ls: -0.5 })}`;
  return { grads, body: shape + label };
}

function bg(art, clipId) {
  return `<image href="${art}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`;
}

// ---- blue (active) ----
export function blueCardSVG(w, art, idx) {
  const clipId = `clip${idx}`;
  const name = fitText(w.name, W - 2 * PAD, 18, 9);
  const arc = arcGlyph(w.arc, 84, 354, idx);
  const teal = "#d8f0ee", line = "rgba(78,205,196,0.5)";

  // one combined stat table, centred but shifted right to clear the ARC marker.
  const c = { L: 180, R: 416, label: 190, rngV: 312, div1: 350, acc: 388, div2: 272 };
  const rngHdrX = (c.L + c.div1) / 2, accHdrX = (c.div1 + c.R) / 2;
  const diceHdrX = (c.L + c.div2) / 2, strHdrX = (c.div2 + c.R) / 2;

  // Range-gating key: a "*" on a range VALUE (e.g. 50"*) means the starred
  // traits / strength half apply only at that range. We move the "*" onto the
  // range LABEL ("Long*"/"Short*") as the on-card key, and strip it from the
  // value. Trait & strength asterisks stay put (those are the starred items).
  const shortStar = /\*/.test(w.sRange || "");
  const longStar  = /\*/.test(w.lRange || "");
  const sRangeDisp = String(w.sRange ?? "").replace(/\*/g, "");
  const lRangeDisp = String(w.lRange ?? "").replace(/\*/g, "");

  const traitsFit = fitText("Traits: " + w.traits, W - 2 * PAD, 8, 8, 3);
  const traitsLines = traitsFit.lines.map((s, i) => {
    const y = 486 + i * (ptU(8) * 1.2);
    if (i === 0) {
      const rest = s.replace(/^Traits:\s*/, "");
      return `<text x="${PAD}" y="${y.toFixed(1)}" font-size="${ptU(8)}" text-anchor="start" fill="${teal}" `
        + `letter-spacing="-0.4" font-family="'Courier Prime', monospace">`
        + `<tspan font-weight="700">Traits:</tspan> <tspan font-weight="400">${esc(rest)}</tspan></text>`;
    }
    return `<text x="${PAD}" y="${y.toFixed(1)}" font-size="${ptU(8)}" text-anchor="start" fill="${teal}" `
      + `font-weight="400" letter-spacing="-0.4" font-family="'Courier Prime', monospace">${esc(s)}</text>`;
  }).join("");

  const vline = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${line}" stroke-width="1.2"/>`;
  const hline = (y) => `<line x1="${c.L}" y1="${y}" x2="${c.R}" y2="${y}" stroke="${line}" stroke-width="1.4"/>`;

  return `<svg class="card-svg blue" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="${clipId}"><rect x="0" y="0" width="${W}" height="${H}" rx="15"/></clipPath>
      ${arc.grads}
    </defs>
    ${bg(art, clipId)}

    ${T(PAD, 48, w.mount.toUpperCase(), { size: 7, anchor: "start", opacity: 0.85, ls: -1 })}
    ${T(W - PAD, 48, w.pts + " POINTS", { size: 7, anchor: "end", opacity: 0.85, ls: -1 })}

    ${nameBlock(name, W / 2, 122, "#d8f0ee", "url(#glow-teal)")}

    <!-- Range / Acc (above card middle) -->
    ${T(rngHdrX, 255, "Range", { size: 7, opacity: 0.8, ls: -0.6 })}
    ${T(accHdrX, 255, "ACC.", { size: 7, opacity: 0.8, ls: -0.6 })}
    ${hline(262)}
    ${vline(c.div1, 245, 329)}
    ${T(c.label, 287, "Short" + (shortStar ? "*" : ""), { size: 8, anchor: "start", weight: 400 })}
    ${T(c.rngV, 287, sRangeDisp, { size: 8 })}
    ${T(c.acc, 287, w.sAcc, { size: 8 })}
    ${T(c.label, 313, "Long" + (longStar ? "*" : ""), { size: 8, anchor: "start", weight: 400 })}
    ${T(c.rngV, 313, lRangeDisp, { size: 8 })}
    ${T(c.acc, 313, w.lAcc, { size: 8 })}

    <!-- Dice / Strength (below card middle; gap between tables centred on y=325) -->
    ${T(diceHdrX, 351, "Dice", { size: 7, opacity: 0.8, ls: -0.6 })}
    ${T(strHdrX, 351, "Strength", { size: 7, opacity: 0.8, ls: -0.6 })}
    ${hline(358)}
    ${vline(c.div2, 341, 393)}
    ${T(diceHdrX, 384, w.dice, { size: 9 })}
    ${T(strHdrX, 384, w.str, { size: 9 })}

    ${arc.body}

    ${traitsLines}

    ${T(W / 2, H - 40, (w.disabled || "11") + "+: Weapon Disabled", { size: 8.5, ls: -1 })}
  </svg>`;
}

// ---- red (disabled) ----
export function redCardSVG(w, art, idx, showDisabledText = true) {
  const clipId = `clipr${idx}`;
  const name = fitText(w.name, W - 2 * PAD, 16, 9);
  const cream = "#faf0f0";
  // size each detonation line down until it fits the card width (avoids clipping)
  const detPt = (s) => {
    for (let p = 7; p >= 5; p -= 0.5) if (String(s).length * charU(p) <= W - 2 * PAD) return p;
    return 5;
  };
  return `<svg class="card-svg red" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${clipId}"><rect x="0" y="0" width="${W}" height="${H}" rx="15"/></clipPath></defs>
    ${bg(art, clipId)}

    ${T(W / 2, 44, w.mount.toUpperCase(), { size: 7, fill: cream, opacity: 0.85, ls: -1, filter: "url(#glow-red)" })}
    ${nameBlock(name, W / 2, 122, cream, "url(#glow-red)")}

    ${showDisabledText ? (() => {
      const disY = 320;  // top of "WEAPON" (units = 0.1mm). Raise/lower to taste; "DISABLED" follows 46 below.
      return `${T(W / 2, disY, "WEAPON", { size: 17, fill: cream, ls: -1, filter: "url(#glow-red)" })}
    ${T(W / 2, disY + 46, "DISABLED", { size: 17, fill: cream, ls: -1, filter: "url(#glow-red)" })}`;
    })() : ""}

    ${T(W / 2, 486, "Repair Weapon {" + w.repair + "}", { size: 11, fill: cream, opacity: 0.95, ls: -1, filter: "url(#glow-red)" })}
    ${T(W / 2, 586, w.detA, { size: detPt(w.detA), fill: cream, ls: -0.4 })}
    ${T(W / 2, 610, w.detB, { size: detPt(w.detB), fill: cream, ls: -0.4 })}
  </svg>`;
}
