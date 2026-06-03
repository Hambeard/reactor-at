# AT Weapon Cards — QA Test Plan

Server: `python3 src/devserver.py` → http://localhost:8775 (no-store).
Legend: **[A]** = agent can auto-verify in preview · **[U]** = you check (downloads, print, other browsers).

## 1. Cards render
- [ ] [A] All 28 weapons → 56 cards (blue+red), 4-wide grid.
- [ ] [U] Names: uppercase, ≤2 lines, never truncated/overflowing; long names smaller.
- [ ] [U] Name glow: teal (blue side) / red (red side).
- [ ] [U] Tables readable; RANGE/ACC + DICE/STRENGTH dividers + header rules.
- [ ] [U] ARC: 3 types correct — Warlord carapace=CORRIDOR (lane), arm=FRONT (cone), Reaver carapace=OMNI (rings). Oval holds "ARC".
- [ ] [U] Blue/red same weapon: name + repair(=traits) + detonation(=disabled) vertically aligned.

## 2. Artwork
- [ ] [A] Default = bundled SVG fallback (blue steel / red grunge).
- [ ] [U] Upload Active img → blue cards use it live; Disabled → red.
- [ ] [A] Reset → back to fallback. Status shows Custom/Default.
- [ ] [U] Low-res upload (<565×819) → warning shown, still applies.
- [ ] [U] "Show WEAPON DISABLED text" unticked → text hidden on red.
- [ ] [U] Reload browser → uploaded art persists (IndexedDB).

## 3. Filter
- [ ] [A] Titan filter (All/Warlord/Reaver/Warhound) limits cards + editor rows.

## 4. Edit Data
- [ ] [A] Edit a field → card updates live; row flagged modified; persists reload.
- [ ] [U] Inch-marks: type `Blast 5"` in Traits → renders with `"`.
- [ ] [A] Per-row ↺ reset (base) restores default; DEL removes added.
- [ ] [A] + Add Weapon → new editable row + 2 cards.
- [ ] [A] Select/deselect-all header checkbox toggles all include boxes.
- [ ] [U] Unchecked rows excluded from card grid + PDF (but NOT from JSON export).
- [ ] [U] Reset All → defaults; clears edits/added/exclusions/imported set.

## 5. JSON set
- [ ] [U] Export Set → `at-weapon-set.json`; contains ALL weapons incl edits + unchecked.
- [ ] [U] Edit a value, Export, Reset All, Import that file → edit restored, full set loads.
- [ ] [U] Import garbage file → friendly error, no breakage.

## 6. PDF export
- [ ] [U] Export PDF (Interleaved) → opens; art/vignette/ARC-fade/name-glow present; **font = Courier Prime**.
- [ ] [U] Crop marks at every card corner; cards 45×65mm (measure print); 16/page; 4 pages for full set.
- [ ] [U] Separated mode → blue pages then red.
- [ ] [A] Progress counter "Generating… N/total" advances; button re-enables after.
- [ ] [U] Custom art + DISABLED-text-off reflected in PDF.
- [ ] [U] Print double-sided, cut: front/back align acceptably.

## 7. Robustness
- [ ] [U] Works in Safari + Firefox (not just Chrome) — render + PDF.
- [ ] [U] Mobile/narrow width: usable (cards scroll).
- [ ] [U] Offline (stop server after load / no internet): app + PDF still work (fonts/libs vendored).
- [ ] [A] No console errors on load / tab switch / export.
