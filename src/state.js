// User edits to weapon data, layered over WEAPONS_DEFAULT and persisted in
// localStorage. (Images are NOT stored here — those go to IndexedDB via art.js.)
import { WEAPONS_DEFAULT } from "./data/weapons.js";

const K_OVERRIDES = "AT_weaponOverrides";
const K_ADDED = "AT_weaponAdded";
const K_EXCLUDED = "AT_weaponExcluded";
const K_SET = "AT_weaponSet";   // imported base set (replaces built-in defaults if present)

const readJSON = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
};

export const getOverrides = () => readJSON(K_OVERRIDES, {});
export const getAdded = () => readJSON(K_ADDED, []);
export const getExcluded = () => new Set(readJSON(K_EXCLUDED, []));
export const saveOverrides = (o) => localStorage.setItem(K_OVERRIDES, JSON.stringify(o));
export const saveAdded = (a) => localStorage.setItem(K_ADDED, JSON.stringify(a));
export const saveExcluded = (s) => localStorage.setItem(K_EXCLUDED, JSON.stringify([...s]));

const keyOf = (w) => `${w.titan}||${w.mount}||${w.name}`;

const getSet = () => readJSON(K_SET, null);
const baseSet = () => getSet() || WEAPONS_DEFAULT;

// Effective weapon list = base set (+ per-field overrides) + user-added.
export function loadWeapons() {
  const ov = getOverrides(), added = getAdded();
  const base = baseSet().map((w) => {
    const k = keyOf(w);
    return { ...w, ...(ov[k] || {}), _modified: !!ov[k], _isAdded: false, _key: k };
  });
  return [...base, ...added.map((w, i) => ({ ...w, _modified: false, _isAdded: true, _addedIdx: i, _key: keyOf(w) }))];
}

// --- edits (used by the data editor) ---
export function saveFieldOverride(key, field, val) {
  const o = getOverrides();
  (o[key] ??= {})[field] = val;
  saveOverrides(o);
}
export function resetFieldOverride(key) {
  const o = getOverrides();
  delete o[key];
  saveOverrides(o);
}
export function updateAdded(idx, field, val) {
  const a = getAdded();
  if (a[idx]) { a[idx][field] = val; saveAdded(a); }
}
export function deleteAdded(idx) {
  const a = getAdded();
  a.splice(idx, 1);
  saveAdded(a);
}
export function addWeapon() {
  const a = getAdded();
  a.push({ titan: "Warlord", name: "New Weapon", arc: "FRONT", mount: "Warlord Arm", pts: 0,
    sRange: '—', lRange: '—', sAcc: '—', lAcc: '—', dice: '—', str: '—', traits: "",
    repair: "4+", detA: "", detB: "", disabled: "11", qty: 1 });
  saveAdded(a);
}

export function resetAll() {
  localStorage.removeItem(K_OVERRIDES);
  localStorage.removeItem(K_ADDED);
  localStorage.removeItem(K_EXCLUDED);
  localStorage.removeItem(K_SET);
}

// --- card-set sharing (JSON) ---
const META = new Set(["_modified", "_isAdded", "_addedIdx", "_key"]);
// flat, clean weapon objects with edits/added baked in — ALL rows (the
// print-include checkboxes don't limit the export).
export function effectiveWeapons() {
  return loadWeapons()
    .map((w) => Object.fromEntries(Object.entries(w).filter(([k]) => !META.has(k))));
}
// Import a set (array of weapon objects). Becomes the base; edits/added/exclusions reset.
export function importSet(arr) {
  if (!Array.isArray(arr) || !arr.length || !arr.every((w) => w && typeof w.name === "string")) {
    throw new Error("Not a valid card set (expected an array of weapons).");
  }
  localStorage.setItem(K_SET, JSON.stringify(arr));
  localStorage.removeItem(K_OVERRIDES);
  localStorage.removeItem(K_ADDED);
  localStorage.removeItem(K_EXCLUDED);
}
