// Client-side PDF export. Each card SVG is rasterized to a high-res PNG via an
// offscreen canvas (the browser renders gradients, lighting filters, vignette
// and glow faithfully — svg2pdf could not), then placed in a jsPDF doc.
// A4, 45x65mm, 4x4 per page, crop marks. Two layouts:
//  - interleaved: each blue followed by its red
//  - separated:   all blue pages, then all red pages
import { blueCardSVG, redCardSVG } from "./cards-svg.js";

const CW = 45, CH = 65, COLS = 4, ROWS = 4;
const PER = COLS * ROWS;
const PAGE_W = 210, PAGE_H = 297;
const MX = (PAGE_W - COLS * CW) / 2;
const MY = (PAGE_H - ROWS * CH) / 2;
const MARK = 3;
const DPI = 300;
const PXW = Math.round(CW / 25.4 * DPI);   // ~1063
const PXH = Math.round(CH / 25.4 * DPI);   // ~1535

// Name-glow filters live in a global <defs> in index.html; inline them so they
// resolve when the card is rasterized in isolation.
const GLOW = `
<filter id="glow-teal" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="b2"/><feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="b3"/>
  <feFlood flood-color="rgba(78,205,196,0.9)" result="c1"/><feComposite in="c1" in2="b1" operator="in" result="g1"/>
  <feFlood flood-color="rgba(78,205,196,0.6)" result="c2"/><feComposite in="c2" in2="b2" operator="in" result="g2"/>
  <feFlood flood-color="rgba(78,205,196,0.3)" result="c3"/><feComposite in="c3" in2="b3" operator="in" result="g3"/>
  <feMerge><feMergeNode in="g3"/><feMergeNode in="g2"/><feMergeNode in="g1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="glow-red" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b2"/><feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="b3"/>
  <feFlood flood-color="rgba(255,136,136,0.9)" result="c1"/><feComposite in="c1" in2="b1" operator="in" result="g1"/>
  <feFlood flood-color="rgba(255,60,60,0.6)" result="c2"/><feComposite in="c2" in2="b2" operator="in" result="g2"/>
  <feFlood flood-color="rgba(204,0,0,0.4)" result="c3"/><feComposite in="c3" in2="b3" operator="in" result="g3"/>
  <feMerge><feMergeNode in="g3"/><feMergeNode in="g2"/><feMergeNode in="g1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>`;

// Pre-rasterize the background art (SVG with lighting filters, or uploaded
// image) to a PNG data URL. A top-level <img> loads it fine (filters render);
// embedding the resulting PNG in the card avoids the "external/nested resource
// won't load when an SVG is rasterized via <img>" problem (which left blank art).
function artToPng(u) {
  return new Promise((res, rej) => {
    if (!u) { res(u); return; }
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = PXW; cv.height = PXH;
      cv.getContext("2d").drawImage(im, 0, 0, PXW, PXH);
      try { res(cv.toDataURL("image/png")); } catch (e) { rej(e); }
    };
    im.onerror = () => rej(new Error("art load failed"));
    im.src = u;
  });
}

// Courier Prime embedded as @font-face data-URLs — an SVG rasterized via <img>
// is isolated and can't see the page's webfonts, so it must carry its own.
let FONT_CSS = null;
async function ensureFont() {
  if (FONT_CSS !== null) return;
  const toData = async (p) => {
    const b = await (await fetch(p)).blob();
    return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
  };
  const [w400, w700] = await Promise.all([
    toData("src/vendor/courier-prime-400.woff2"),
    toData("src/vendor/courier-prime-700.woff2"),
  ]);
  FONT_CSS = `@font-face{font-family:'Courier Prime';font-style:normal;font-weight:400;src:url(${w400}) format('woff2')}`
    + `@font-face{font-family:'Courier Prime';font-style:normal;font-weight:700;src:url(${w700}) format('woff2')}`;
}

function prep(svg) {
  let s = svg.replace("<defs>", `<defs><style>${FONT_CSS}</style>${GLOW}`);
  s = s.replace("<svg ", `<svg width="${PXW}" height="${PXH}" `);
  return s;
}

function rasterize(svgString) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([prep(svgString)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => setTimeout(() => {     // delay: let the embedded @font-face apply before snapshot
      const cv = document.createElement("canvas");
      cv.width = PXW; cv.height = PXH;
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0, PXW, PXH);
      URL.revokeObjectURL(url);
      try { resolve(cv.toDataURL("image/png")); } catch (e) { reject(e); }
    }, 180);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("svg raster failed")); };
    img.src = url;
  });
}

function cropMarks(doc, x, y) {
  doc.setDrawColor(120); doc.setLineWidth(0.1);
  const L = MARK;
  for (const [px, py, sx, sy] of [[x, y, -1, -1], [x + CW, y, 1, -1], [x, y + CH, -1, 1], [x + CW, y + CH, 1, 1]]) {
    doc.line(px, py, px + sx * L, py);
    doc.line(px, py, px, py + sy * L);
  }
}

export async function exportPdf({ weapons, artActive, artDisabled, showDisabledText, mode, onProgress }) {
  const { jsPDF } = window.jspdf;
  // compress:false — PNG IDAT is already DEFLATE-compressed, so jsPDF's
  // compress:true just re-deflates each image in pure JS (~150ms/card) for
  // negligible size gain. Off → ~8x faster export, near-identical file size.
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: false });

  await ensureFont();
  // pre-rasterize art to PNG data URLs so it renders during card rasterization
  const aData = await artToPng(artActive);
  const dData = await artToPng(artDisabled);

  let idx = 0;
  const blues = [], reds = [];
  weapons.forEach((w) => {
    for (let i = 0; i < (w.qty || 1); i++) {
      blues.push(blueCardSVG(w, aData, idx++));
      reds.push(redCardSVG(w, dData, idx++, showDisabledText));
    }
  });

  let seq;
  // splitAt: index where the disabled (red) section starts. In separated mode
  // the reds must begin on a fresh page (page layout restarts there), not run
  // straight on from the blues' last partial page.
  let splitAt = Infinity;
  if (mode === "separated") { seq = [...blues, ...reds]; splitAt = blues.length; }
  else { seq = []; for (let i = 0; i < blues.length; i++) { seq.push(blues[i]); seq.push(reds[i]); } }

  // Rasterize in concurrent batches: each card carries a 180ms font-apply delay,
  // so running CONC at once overlaps those delays (≈45s sequential → a few s).
  // Memory is bounded to CONC full-res PNGs — place each batch, then drop it.
  const CONC = 6;
  let done = 0;
  for (let base = 0; base < seq.length; base += CONC) {
    const chunk = seq.slice(base, base + CONC);
    const pngs = await Promise.all(chunk.map((s) => rasterize(s)));
    for (let j = 0; j < pngs.length; j++) {
      const i = base + j;
      // section-local index: reds (i >= splitAt) restart their own page layout
      const local = i < splitAt ? i : i - splitAt;
      if (i > 0 && local % PER === 0) doc.addPage();   // new page on fill OR at the blue->red split
      const slot = local % PER, r = Math.floor(slot / COLS);
      // Duplex: the red (back) section mirrors columns L<->R so each Disabled
      // card lands behind its Active card after a long-edge flip.
      const isBack = i >= splitAt;
      const col = isBack ? (COLS - 1 - (slot % COLS)) : (slot % COLS);
      const x = MX + col * CW, y = MY + r * CH;
      doc.addImage(pngs[j], "PNG", x, y, CW, CH);
      cropMarks(doc, x, y);
      onProgress?.(++done, seq.length);
    }
    await new Promise((r) => setTimeout(r));   // yield so UI repaints between batches
  }
  doc.save("at-weapon-cards.pdf");
}
