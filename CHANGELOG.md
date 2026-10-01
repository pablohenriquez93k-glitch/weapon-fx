# Changelog

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
