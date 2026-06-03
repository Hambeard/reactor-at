// Data editor: an editable table over the weapon list. Edits to defaults are
// saved as overrides; added weapons are stored separately. Text inputs handle
// inch-marks (") natively. `onChange` re-renders the cards.
import { WEAPON_FIELDS } from "./data/weapons.js";
import {
  loadWeapons, getExcluded, saveExcluded,
  saveFieldOverride, resetFieldOverride, updateAdded, deleteAdded,
} from "./state.js";

export function buildEditor(filter, onChange) {
  const head = document.getElementById("editor-head");
  const body = document.getElementById("editor-body");
  if (!head || !body) return;

  const excluded = getExcluded();
  const visible = loadWeapons().filter((w) => filter === "All" || w.titan === filter);

  // header (first cell = select/deselect-all for the visible rows)
  head.innerHTML = "";
  const htr = document.createElement("tr");
  const allTh = document.createElement("th");
  const allCb = document.createElement("input");
  allCb.type = "checkbox";
  allCb.title = "Select / deselect all (visible)";
  allCb.checked = visible.length > 0 && visible.every((w) => !excluded.has(w._key));
  allCb.addEventListener("change", () => {
    const ex = getExcluded();
    visible.forEach((w) => (allCb.checked ? ex.delete(w._key) : ex.add(w._key)));
    saveExcluded(ex);
    onChange();
    buildEditor(filter, onChange);
  });
  allTh.appendChild(allCb);
  htr.appendChild(allTh);
  WEAPON_FIELDS.forEach((f) => htr.appendChild(th(f.label, f.title)));
  htr.appendChild(th(""));
  head.appendChild(htr);

  // rows
  body.innerHTML = "";
  loadWeapons().forEach((w) => {
    if (filter !== "All" && w.titan !== filter) return;
    const tr = document.createElement("tr");
    if (w._modified) tr.classList.add("modified");
    if (w._isAdded) tr.classList.add("added");

    // include checkbox
    const tdC = document.createElement("td");
    tdC.className = "ed-chk";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !excluded.has(w._key);
    cb.title = "Include in printout";
    cb.addEventListener("change", () => {
      const ex = getExcluded();
      cb.checked ? ex.delete(w._key) : ex.add(w._key);
      saveExcluded(ex);
      onChange();
    });
    tdC.appendChild(cb);
    tr.appendChild(tdC);

    // fields
    WEAPON_FIELDS.forEach((f) => {
      const td = document.createElement("td");
      const inp = document.createElement("input");
      inp.type = "text";
      inp.value = w[f.key] ?? "";
      if (f.w) inp.style.width = f.w + "px";
      inp.addEventListener("change", () => {
        let v = inp.value;
        if (f.type === "int") v = parseInt(v) || 0;
        if (w._isAdded) updateAdded(w._addedIdx, f.key, v);
        else saveFieldOverride(w._key, f.key, v);
        onChange();
        buildEditor(filter, onChange); // refresh (modified flag, key changes)
      });
      td.appendChild(inp);
      tr.appendChild(td);
    });

    // action
    const tdA = document.createElement("td");
    tdA.className = "ed-act";
    if (w._isAdded) {
      tdA.appendChild(btn("DEL", "ed-del", () => {
        deleteAdded(w._addedIdx); onChange(); buildEditor(filter, onChange);
      }));
    } else if (w._modified) {
      tdA.appendChild(btn("↺", "ed-reset", () => {
        resetFieldOverride(w._key); onChange(); buildEditor(filter, onChange);
      }, "Reset to default"));
    }
    tr.appendChild(tdA);
    body.appendChild(tr);
  });
}

function th(t, title) { const e = document.createElement("th"); e.textContent = t; if (title) e.title = title; return e; }
function btn(label, cls, fn, title) {
  const b = document.createElement("button");
  b.textContent = label; b.className = cls; if (title) b.title = title;
  b.addEventListener("click", fn);
  return b;
}
