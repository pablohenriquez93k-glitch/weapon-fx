# Changelog

## 1.3.2 (2026-10-03)
- **More Pew Pew skin**: switching from it to another skin in the middle of a match left its muzzle flash sizes and
  trail positions (battleship, hover ship, sniper impact, trails) until the next match. In Galactic War they could
  also stay without the skin, for example for a co-op guest. They now go back to the game's values whenever the
  skin is not used.

## 1.3.1 (2026-10-03)
- **Sheller muzzle flash**: the Sheller lost its muzzle flash. Its unit file only names a sound for firing; the flash
  comes from the base vehicle it inherits from, and Weapon FX read only one level of that inheritance. It now reads
  every level, like the game, and the Sheller gets its Weapon FX muzzle flash plus the ground dust.
- Same cause: the laser impact of the Commanders, the three Laser Defense Towers, the Umbrella and the Avenger comes
  from their base ammo, so it stayed vanilla. They now get Weapon FX impacts.
- With the Sheller now counted, the muzzle flash budget of the explosive family rose a little: at High and Uber, the
  flashes of the Lob, Leviathan, Grenadier, Kessler and Ares are slightly bigger.
- Galactic War co-op tested in game (GW AI Overhaul 7.5.0, two players, per-player tech): each player gets Weapon FX
  with their own settings, and changing a setting mid-battle reloads only that player's view.

## 1.3.0 (2026-10-03)
- **Galactic War**: Weapon FX now works in Galactic War, vanilla and GW AI Overhaul (GWO). The effects go into the war's
  own unit files (yours and the AI's), and changing a setting mid-battle reloads the view, same as in a normal match.
- **Replace GWO card effects** (new setting, default Off): some GWO tech cards change a weapon effect (Dox, Kestrel,
  Ant, Gil-E and others). Off: the card's effect stays. On: the Weapon FX version of that effect is used, with your
  level and skin. A card effect with no Weapon FX version (the Gil-E beam) stays as the card made it.

## 1.1.0 (2026-10-03)
- **More Pew Pew skin**: the weapon effects of More Pew Pew by dom314 (MIT), with the Low/Original/High/Uber levels.
  Original is dom's effects as he made them; effects he never covered (nukes, orbital units, Titans and others) are made
  in his style (his colors by ammo type, his effects as templates).
- Also from More Pew Pew, only while its skin is used: muzzle flash sizes (battleship, hover ship, sniper impact) and trail
  positions. Its sound changes are not included: Weapon FX stays visual only.
- Custom: the skin is now picked in the Custom editor. The global Skin selector is hidden while the level is Custom, so it
  can no longer override your custom setup; your custom skin starts from the global one.
- Team color with a skin: the army color multiplies the effect color, so strongly colored skins (More Pew Pew's pure red,
  Plasma's magenta) came out dark or wrong for most armies. With Team color ON, skin effects now turn gray at the same
  brightness first, so they show the army color. Effects without a skin are unchanged.
- 15 impact effects with chained particles (flak, anti-nuke, missiles, artillery, bombs and others) spawned 4× the
  particles at Uber instead of 2×, and too few at Low. They now scale like every other effect.
- A unit or effect file that cannot be read (for example, broken by another mod) is now skipped and logged. Before, it
  could silently stop Weapon FX from applying any effect.

## 1.0.2 (2026-10-02)
- Mod icon (300x300, hosted in this repository).

## 1.0.1 (2026-10-01)
- Fixed 24 texture files that were committed with mixed-case names while every effect references them in lowercase
  (could fail on Linux/macOS and on zip mounts). All paths are lowercase now.
- `titansOnly`: the mod needs TITANS files, so it no longer enables in Classic.
- A failed memory mount is now reported as a failure, so it can no longer trigger a scene reload.
- README: install path is `client_mods\`.

## 1.0.0 (2026-09-30)
- **Skins**: Cryogenic, Toxic, Inferno, Void and Holo join Plasma and Robotic. Pick one in Settings → Weapon FX, or by
  family, unit or effect in Custom.
- **Team color**: every effect can take the color of the army that fires it.
- Smaller download: each effect file is shipped once (73 MB → 29 MB).
- Skin names and the new options are translated into all 11 UI languages.
- License: MIT for our own work.
- Clean pa-mod-review: removed 6 misspelled particle keys copied from vanilla effects (the game ignored them, so
  nothing changes on screen), lowercase texture names, and `ui/mods/` folder named after the identifier.

## 0.4.0-preview (2026-09-26)
- First skins: Plasma and Robotic.
- Light and particle limits from NikolaMX's feedback.

## 0.3.0-preview (2026-09-25)
- Per-unit effects for every unit, heat palette and readability rules.
- Low / Original / High / Uber / Custom levels, export and import of Custom setups.

## 0.1.0
- Stronger cannon muzzle flash.
