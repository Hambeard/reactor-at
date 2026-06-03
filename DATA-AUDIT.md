# Data Audit — 28 cards vs BattleScribe XML (AT 2018)

Source of truth: `Adeptus Titanicus 2018.txt` (BattleScribe gameSystem, 109 weapon profiles).
Reference dump: `data-audit/weapons_extracted.json`.

## Corrections APPLIED to weapons.js (17)
Numeric stats only (dice/str/range/pts/accuracy). Structure (titan/arc/mount), detonation, repair untouched.

FIX  Apocalypse Missile Launchers: dice 1 -> 10
FIX  Paired Turbo Laser Destructors: sRange 16" -> 18"
FIX  Vulcan Mega-Bolter Array: dice 18 -> 12
FIX  Graviton Ruinator: str 8 -> 10
FIX  Graviton Ruinator: sRange 20" -> 22"
FIX  Graviton Ruinator: lRange 40" -> 45"
FIX  Sunfury Plasma Annihilator: str 9 -> 8
FIX  Sunfury Plasma Annihilator: lRange 36" -> 24"
FIX  Sunfury Plasma Annihilator: lAcc -1 -> —
FIX  Volkite Destructor: sRange 24" -> 16"
FIX  Volkite Destructor: lRange — -> 24"
FIX  Apocalypse Missile Launcher: pts 15 -> 10
FIX  Turbo Laser Destructor: sRange 16" -> 18"
FIX  Turbo Laser Destructor: pts 25 -> 20
FIX  Vulcan Mega-Bolter: pts 15 -> 10
FIX  Conversion Beam Dissolutor: pts 30 -> 25
FIX  Graviton Destructor: pts 25 -> 20

## FLAGS — need your decision (not auto-changed)
- Variable Strength (Maximal Fire weapons — higher value on Maximal Fire):
FLAG Conversion Beam Extirpator: str xml='10/12*' (variable) kept ours='10'
FLAG Conversion Beam Dissolutor: str xml='9/11*' (variable) kept ours='9'
- **Warhound detonation**: our data = S5/S7 (rolls 11-14/15+). Official GW Warhound card PDF = **S7/S9, rolls 9-12/13+**. XML has no detonation. Recommend adopting GW card values for Warhound.
- **Disabled Roll**: XML differs from our values on some (e.g. Reaver Turbo 9 vs our 10; Warhound Vulcan/Graviton 10 vs our 9). GW Warhound cards show 9+. Conflicts between XML & official cards — review.
- **Traits wording**: XML uses sub-traits in parens e.g. `Shieldbane (Draining)`, and `Blast` (value held separately) vs our `Blast 3`. Our wording kept; confirm "Blast 3" radii are right.

## Candidate weapons to ADD (generic, not yet in set) — 70
Need titan + mount + arc assigned (not in the profile). Pick which to add:
  Acastus Twin Lascannon  |  10pts  D2 S6  6"/12"  acc —/—  | 
  Acheron Chainfist  |  0pts  D2 S7  2"/-  acc +1/—  | Rending, Melee
  Acheron Pattern Flame Cannon  |  0pts  D2 S7  T/-  acc —/—  | Firestorm
  Aftershock Warheads  |  0pts  D4 S7  30"/120"  acc -1/+2  | Limited, Barrage, Blast, Quake, Rending
  Apocalypse Missile Array  |  10pts  D3 S4  30"/120"  acc —/+1  | Barrage
  Apocalypse Missile Strongpoint  |  0pts  D5 S4  30/120  acc —/+1  | Barrage
  Ardex Defensor Mega-Bolter  |  10pts  D6 S4  10"/20"  acc -/-  | Paired, Rapid
  Armiger Autocannon  |  0pts  D1 S4  6"/16"  acc -/-  | Ordnance
  Asterius Karacnos Mortar Battery  |  0pts  D6 S4  12"/36"  acc —/—  | Barrage, Rending
  Asterius Twin Conversion Beam Cannon  |  0pts  D4 S9  *24"/**48"  acc —/—  | Paired, Blast
  Asterius Twin Volkite Culverins  |  0pts  D2 S4  4"/8"  acc -/-  | Voidbreaker (1)
  Atrapos Graviton Singularity Cannon  |  0pts  D1 S6  8"/20"  acc +1/—  | Blast (3"), Concussive
  Atrapos Lascutter  |  0pts  D2 S6  2"/-  acc +1/-  | Fusion, Melee
  Avenger Gatling Cannon  |  5pts  D8 S3  8"/24"  acc +1/—  | Rapid
  Castigator Pattern Bolt Cannon  |  0pts  D7 S3  8"/20"  acc +1/—  | Rapid
  Castigator Warblade  |  0pts  D2 S7  2"/-  acc +1/—  | Rending, Melee
  Cerastus Shock Lance  |  0pts  D2 S8  2"/-  acc +2/—  | Melee
  Chasmata Laser Blaster  |  40pts  D3 S8  22"/35"  acc —/-1  | 
  Cruciator Gatling Array  |  40pts  D12 S6  10"/30"  acc +1/-  | Carapace, Ordnance
  Daemonic Bile  |  15pts  DD3 S5  T/-  acc -/-  | Firestorm, Fusion
  Desolator Chainsword  |  50pts  D4 S10  4"/-  acc +1/-  | Melee, Rending, Bypass
  Eruption Lance  |  0pts  D2 S10  30"/60"  acc —/—  | Carapace, Blast, Fusion (Draining)
  Exo-Planar Cannon  |  0pts  D2 S6  8"/16"  acc +1/-  | -
  Exo-planar Bombard  |  0pts  D2 S6  8"/16"  acc +1/-  | Bypass
  Fissure Bombards  |  0pts  D2 S12  24"/36"  acc -1/—  | Carapace, Blast, Mortar, Barrage, Concussive, Quake
  Gyges Siege Claw  |  0pts  D1 S6  2"/-  acc +1/-  | Melee, Rending
  Hekaton Siege Claw  |  10pts  D2 S6  2"/-  acc +1/—  | Melee, Rending
  Incisor Pattern Melta Lance  |  25pts  D2 S9  6"/10"  acc -/-1  | Fusion
  Ion Gauntlet Shield Shock Blast  |  0pts  D2 S6  4"/12"  acc —/—  | Rapid
  Krius Grav Imploder  |  60pts  D2 S12  2"/8"  acc +2/-  | Short: Melee, Rending.
Long: Concussive, Draining, Ordance, Quake
  Krius Siege Drill  |  50pts  D3 S13  2"/-  acc +2/-  | Melee, Fusion (Draining)
  Lascutter  |  0pts  D1 S5  2"/-  acc +1/-  | Fusion, Melee
  Leviathan Laser Annhilator  |  0pts  D5 S11  18"/36"  acc —/—  | Shieldbane (Draining), Rending
  Lightning Cannon  |  10pts  D1 S5  12"/20"  acc +1/—  | Rending
  Lightning Lock  |  0pts  D1 S5  8"/14"  acc +1/-  | Rending
  Macro Cannon Battery  |  0pts  D2 S10  12/24  acc —/-1  | Ordnance
  Magma Lance  |  0pts  D3 S12  30"/120"  acc -1/—  | Blast, Draining (2 dice)
  Natrix Shock Lance  |  20pts  D1 S4  6"/10"  acc +1/—  | Bypass, Specialised, Shock (Draining)
  Neutron Laser  |  45pts  D1 S7  30"/60"  acc +1/-  | Bypass, Carapace, Draining, Shock
  Paired Chasmata Pattern Laser Blasters  |  80pts  D6 S8  22"/35"  acc —/-1  | 
  Paired Chasmata Pattern Turbo Laser Destructor  |  55pts  D4 S8  24"/35"  acc —/—  | 
  Plasma Eclipse Battery  |  0pts  D2*/4 S13  12"/30"  acc +1/—  | Fusion (Draining), *Blast 5" (Draining), Maximal Fire
  Porphyrion Ironstorm Missile Pod  |  0pts  D6 S4  6"/36"  acc —/—  | Barrage, Rapid
  Porphyrion Twin Magna Lascannon  |  0pts  D4 S8  6"/48"  acc +1/—  | Paired
  Questoris Melee Weapon  |  5pts  D1 S7  2"/-  acc +1/—  | Melee
  Radial Missile Array  |  0pts  D12 S6  30"/120"  acc -1/+1  | Barrage, Rapid, Limited
  Rapid-Fire Battlecannon  |  10pts  D2 S5  8"/24"  acc +1/—  | Ordnance
  Reaper Chain-Cleaver  |  0pts  D1 S6  2"/-  acc +1/-  | Melee
  Revelator Missile Launcher  |  50pts  D3 S8  24"/48"  acc —/+1  | Carapace, Limited(4), Concussive, Ordnance
  Shudder Missiles  |  20pts  D2 S6  12"/40"  acc -/—  | Barrage, Quake
  Sinistramanus Tenebrae  |  0pts  D3 S10  30"/120"  acc —/—  | 
  Stalker Meltagun  |  5pts  D1 S8  3"/6"  acc +1/-  | Fusion
  Storm Laser  |  0pts  D3 S4  8"/24"  acc -/-  | Rapid
  Storm Laser Array  |  0pts  D3 S4  8"/24"  acc -/-  | Rapid
  Storm Laser Flenser  |  0pts  D2 S5  8"/30"  acc -/+1  | -
  Stormspear Rocket Pod  |  15pts  D3 S5  6"/16"  acc —/—  | 
  Suzerain Class Plasma Destructor  |  70pts  D3 S11  16"/30"  acc +1/—  | Fusion (Draining), Maximal Fire
  Swarmer Missiles  |  10pts  D5 S4  12"/40"  acc -1/—  | Rapid
  The Silence Singularity Warheads  |  0pts  D1 SX  30"/X  acc -1/+2  | Limited, Bypass, Vortex, Blast
  Thermal Cannon  |  10pts  D1 S8  6"/12"  acc —/-1  | Fusion
  Thermal Spear  |  0pts  D1 S8  5"/8"  acc -/-1  | Fusion
  Turbo Laser Battery  |  0pts  D4 S8  16"/32"  acc —/—  | Carapace, Paired, Shieldbane (Draining)
  Ursus Claw  |  10pts  D1 S4  8"/12"  acc —/—  | Impale, Specialised
  Void Cascade Warheads  |  0pts  D8 S6  30"/120"  acc -1/+2  | Limited, Barrage, Rapid, Void Breaker (2)
  Volkite Chieorovile  |  15pts  D3 S4  8"/16"  acc —/—  | Voidbreaker (1)
  Volkite Eradicator  |  20pts  D3 S5  12"/20"  acc -/-1  | Voidbreaker (2), Beam (2) {Draining}
  Volkite Veuglaire  |  0pts  D2 S4  8"/16"  acc -/-  | Voidbreaker (1)
  Warp Missile Support Rack  |  10pts  D1 SX  20"/80"  acc +1/+2  | Carapace, Limited, Warp
  Warp Missile Support Rack (Vortex)  |  10pts  D1 SX  20"/80"  acc +1/+2  | Carapace, Limited, Vortex
  Warp Storm Warheads  |  0pts  D2 SX  30"/X  acc -1/+2  | Limited, Bypass, Warp, Concussive

## Legio-specific / named variants — 4 (probably skip unless wanted)
  Earthbreaker Missiles [WL]  |  15pts  D4 S4  30"/120"  acc —/+1  | Barrage, Carapace, Paired, Quake
  Melta Cannon with Toxin Nodes  |  55pts  D1 S10  12"/24"  acc —/—  | Blast, Fusion
  Plasma Blastgun with Toxin Nodes  |  50pts  D2 S7  8"/24"  acc —/-1  | Blast, Maximal Fire
  Volcano Cannon with Toxin Nodes  |  45pts  D1 S9  30"/60"  acc —/—  | Blast, Draining
