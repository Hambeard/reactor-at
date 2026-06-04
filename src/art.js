// Per-state artwork: two slots — "active" (blue) and "disabled" (red).
// User uploads are stored locally in IndexedDB (blobs), never transmitted.
// Resolution order for a slot: user upload -> bundled fallback SVG.
// This keeps GW artwork off the distributed app: only the original
// fallback SVGs ship; any uploaded image lives only in the user's browser.

const DB_NAME = "at-cards";
const STORE = "art";
export const SLOTS = ["active", "disabled"];

export const FALLBACK = {
  active: "art/blue-alt.png",
  disabled: "art/red-alt.png",
};

// Recommended print resolution at 45x65mm trim (~300dpi minimum).
export const MIN_PX = { w: 565, h: 819 };
export const RECOMMENDED_PX = { w: 1200, h: 1735 };

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const r = tx(db, "readonly").get(key);
    r.onsuccess = () => resolve(r.result || null);
    r.onerror = () => reject(r.error);
  });
}

async function idbSet(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const r = tx(db, "readwrite").put(val, key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

async function idbDel(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const r = tx(db, "readwrite").delete(key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

// Read an image File/Blob's pixel dimensions (raster); SVG returns null (vector).
export function imageSize(blob) {
  return new Promise((resolve) => {
    if (blob.type === "image/svg+xml") return resolve(null);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// Save an uploaded image for a slot. Returns { ok, warning }.
export async function setArt(slot, file) {
  if (!SLOTS.includes(slot)) throw new Error("bad slot: " + slot);
  if (!file.type.startsWith("image/")) {
    return { ok: false, warning: "That file isn't an image." };
  }
  const size = await imageSize(file);
  let warning = null;
  if (size && (size.w < MIN_PX.w || size.h < MIN_PX.h)) {
    warning = `Low resolution (${size.w}×${size.h}px). For crisp print, aim for ~${RECOMMENDED_PX.w}×${RECOMMENDED_PX.h}px.`;
  }
  await idbSet(slot, file);
  return { ok: true, warning };
}

export async function clearArt(slot) {
  await idbDel(slot);
}

export async function hasCustom(slot) {
  return (await idbGet(slot)) != null;
}

// One object URL per slot, recycled so we don't leak.
const _urls = {};
function setUrl(slot, url) {
  if (_urls[slot] && _urls[slot].startsWith("blob:")) URL.revokeObjectURL(_urls[slot]);
  _urls[slot] = url;
  return url;
}

// Resolve a CSS-usable url() for a slot: custom upload if present, else fallback.
// Fallback path is made absolute against the document base — a relative url()
// inside a CSS custom property would otherwise resolve relative to the
// stylesheet (src/styles.css), pointing at the wrong place.
export async function resolveArt(slot) {
  const blob = await idbGet(slot);
  if (blob) return setUrl(slot, URL.createObjectURL(blob));
  return setUrl(slot, new URL(FALLBACK[slot], document.baseURI).href);
}
