import { loadWeapons, getExcluded, addWeapon, resetAll, effectiveWeapons, importSet } from "./state.js";
import { blueCardSVG, redCardSVG } from "./cards-svg.js";
import { SLOTS, resolveArt, setArt, clearArt, hasCustom } from "./art.js";
import { buildEditor } from "./editor.js";
import { exportPdf } from "./pdf.js";

const grid = document.getElementById("card-grid");

let activeFilter = "All";
let activeTab = "cards";
const artUrl = { active: null, disabled: null };
let showDisabledText = localStorage.getItem("AT_showDisabledText") !== "false";

// ---- artwork ----
async function applyArt() {
  for (const slot of SLOTS) artUrl[slot] = await resolveArt(slot);
}

async function refreshArtPanel() {
  for (const slot of SLOTS) {
    const custom = await hasCustom(slot);
    const tag = document.querySelector(`[data-status="${slot}"]`);
    const reset = document.querySelector(`[data-reset="${slot}"]`);
    if (tag) { tag.textContent = custom ? "Custom image" : "Default artwork"; tag.classList.toggle("is-custom", custom); }
    if (reset) reset.disabled = !custom;
  }
}

function wireArtPanel() {
  for (const slot of SLOTS) {
    const input = document.querySelector(`[data-upload="${slot}"]`);
    const reset = document.querySelector(`[data-reset="${slot}"]`);
    const warn = document.querySelector(`[data-warn="${slot}"]`);
    input?.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const res = await setArt(slot, file);
      warn.textContent = res.warning || "";
      warn.classList.toggle("show", !!res.warning);
      if (!res.ok) { input.value = ""; return; }
      await applyArt();
      await refreshArtPanel();
      renderCards();
      input.value = "";
    });
    reset?.addEventListener("click", async () => {
      await clearArt(slot);
      warn.textContent = ""; warn.classList.remove("show");
      await applyArt();
      await refreshArtPanel();
      renderCards();
    });
  }
}

// ---- cards ----
function filteredWeapons() {
  const excluded = getExcluded();
  const all = loadWeapons();
  const visible = activeFilter === "All" ? all : all.filter((w) => w.titan === activeFilter);
  return visible.filter((w) => !excluded.has(w._key));
}

function refreshEditorIfOpen() {
  if (activeTab === "editor") buildEditor(activeFilter, renderCards);
}

let _idx = 0;
function renderCards() {
  _idx = 0;
  const weapons = filteredWeapons();
  const cards = [];
  weapons.forEach((w) => {
    for (let i = 0; i < (w.qty || 1); i++) {
      cards.push(`<div class="card-wrap">${blueCardSVG(w, artUrl.active, _idx++)}</div>`);
      cards.push(`<div class="card-wrap">${redCardSVG(w, artUrl.disabled, _idx++, showDisabledText)}</div>`);
    }
  });
  while (cards.length % 4 !== 0) cards.push('<div class="card-wrap"></div>');
  grid.innerHTML = cards.join("");
}

function wireFilters() {
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.addEventListener("click", () => {
      activeFilter = b.dataset.titan;
      document.querySelectorAll(".filter-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      renderCards();
      refreshEditorIfOpen();
    });
  });
}

function showTab(tab) {
  activeTab = tab;
  document.getElementById("tab-cards").hidden = tab !== "cards";
  document.getElementById("tab-editor").hidden = tab !== "editor";
  document.querySelectorAll(".tab-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "editor") buildEditor(activeFilter, renderCards);
}

function wireTabs() {
  document.querySelectorAll(".tab-btn").forEach((b) =>
    b.addEventListener("click", () => showTab(b.dataset.tab)));
  document.getElementById("add-weapon")?.addEventListener("click", () => {
    addWeapon(); renderCards(); buildEditor(activeFilter, renderCards);
  });
  document.getElementById("reset-all")?.addEventListener("click", () => {
    if (!confirm("Reset all edits, added weapons and exclusions to defaults?")) return;
    resetAll(); renderCards(); buildEditor(activeFilter, renderCards);
  });

  document.getElementById("export-set")?.addEventListener("click", () => {
    const json = JSON.stringify(effectiveWeapons(), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "at-weapon-set.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  const importFile = document.getElementById("import-file");
  document.getElementById("import-set")?.addEventListener("click", () => importFile?.click());
  importFile?.addEventListener("change", async () => {
    const f = importFile.files?.[0];
    if (!f) return;
    try {
      const arr = JSON.parse(await f.text());
      if (!confirm("Import this set? Replaces the current weapon list and clears your edits.")) { importFile.value = ""; return; }
      importSet(arr);
      renderCards();
      buildEditor(activeFilter, renderCards);
    } catch (e) {
      alert("Import failed: " + e.message);
    } finally {
      importFile.value = "";
    }
  });
}

function wireDisabledTextToggle() {
  const cb = document.getElementById("toggle-disabled-text");
  if (!cb) return;
  cb.checked = showDisabledText;
  cb.addEventListener("change", () => {
    showDisabledText = cb.checked;
    localStorage.setItem("AT_showDisabledText", showDisabledText ? "true" : "false");
    renderCards();
  });
}

function wireExport() {
  const btn = document.getElementById("btn-export");
  const status = document.getElementById("export-status");
  btn?.addEventListener("click", async () => {
    btn.disabled = true;
    status.textContent = "Generating…";
    try {
      await exportPdf({
        weapons: filteredWeapons(),
        artActive: artUrl.active,
        artDisabled: artUrl.disabled,
        showDisabledText,
        mode: document.getElementById("export-mode").value,
        onProgress: (d, t) => { status.textContent = `Generating… ${d}/${t}`; },
      });
      status.textContent = "";
    } catch (e) {
      console.error(e);
      status.textContent = "Export failed — see console.";
    } finally {
      btn.disabled = false;
    }
  });
}

async function init() {
  wireFilters();
  wireTabs();
  wireExport();
  wireArtPanel();
  wireDisabledTextToggle();
  await applyArt();
  await refreshArtPanel();
  renderCards();
}

// Register service worker for offline use. Relative path → scope = app dir,
// so it works under a GitHub Pages sub-path. Failures are non-fatal.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW registration failed", e));
  });
}

init();
