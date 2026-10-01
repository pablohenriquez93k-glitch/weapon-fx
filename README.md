# Weapon FX

Client-side cosmetic mod for **Planetary Annihilation: TITANS** (build 124680).
It makes muzzle flashes, trails and impacts stronger and richer. **No gameplay changes**: the mod ships only effect
files (.pfx) and a small UI script. Unit and ammo files are never shipped. They are read from the game you have
installed, and only their effect keys are changed, in memory.

## Settings (Settings → Weapon FX)
- **Low**: lighter than the original game, for slower computers.
- **Original**: the game's effects, unchanged.
- **High** (default): stronger, richer effects.
- **Uber**: the strongest.
- **Custom**: pick a base level, then override it by weapon family, by unit, by family inside a unit, or effect by
  effect. Units are browsed by type (land, structures, air, naval, orbital, commanders). Effects that several units
  share are shown on both sides (e.g. the Manhattan shows the Dox bullet it fires). **Export** gives a text code to
  share your setup; **Import** loads one.
- **Skin**: a visual theme over the chosen level: Cryogenic, Toxic, Inferno, Void, Holo, Plasma or Robotic. In Custom
  you can also pick a skin by family, unit or effect.
- **Team color**: every effect takes the color of the army that fires it, over the skin and level. Effects lose
  some of their glow with it.

Changes apply when you press **Save**; **Cancel** changes nothing. No restart needed. Starting a match with a new
level has no black screen. Changing it in the middle of a match reloads the view (the screen goes black for a
moment, same as F5).

## What it does
- Every unit gets its own effects (fire, trail, impact), generated from the vanilla ones: a reinforced core plus
  extra layers (sparks, embers, smoke, dust, debris, lights, ground dust and a ring under heavy guns).
- **Heat palette**: projectiles leave the barrel white, turn amber halfway and dark red at max range. The gradient
  is tied to each weapon's real range and speed. Beams do the same over the firing time. Cold energy weapons
  (Tesla, lasers that are blue in vanilla) use a violet palette.
- **Readability rules**: impact cores never grow past the weapon's damage radius, and debris and embers never fly
  further than 3× that radius. Units that have no area of effect don't get a bigger core.
- Budget per effect: never heavier than NikolaMX's version of that same effect (or the median of its weapon family).

## Install
Source: https://github.com/pablohenriquez93k-glitch/weapon-fx

1. Unzip into `%LOCALAPPDATA%\Uber Entertainment\Planetary Annihilation\mods\`.
2. Enable **Weapon FX (preview)** in Community Mods.
3. **Turn off other effect mods while testing** (Effects and Stuff, Laser Unit Effects, Air Team Colored Trails…),
   so you see only this mod's effects.

## Known limits
- Tested in game: Dox, Ant, Gil-E, Tesla, Boom, Bumblebee, Leveler, Ares, Atlas, Pelter, Holkins, Anchor, Flak,
  Galata and the bomber; every skin on the Dox. Air, naval, orbital, nukes,
  mines and torpedoes are checked by numbers only (size, light, reach against the damage radius), not in game.
- Nukes and mines use `sim_*_effect`; those may be read by the server, so they might show vanilla effects.
- Galactic War: not applied yet (it uses its own unit specs). You get the vanilla effects there.
- UI languages: English, Spanish, French, German, Russian, Chinese (simplified), Japanese, Korean, Italian,
  Polish and Portuguese. Other languages show English.

## License
MIT (see `LICENSE`) for our own work: code, scripts and our own textures. Effects and textures that come from
Planetary Annihilation: Titans belong to their owners and are not covered by this license.

## Credits
- **NikolaMX** — Effects and Stuff (Nik version) is the reference: its per-effect size set the ceiling for this
  mod. Thanks, NikolaMX! No files from it are included; the techniques were rebuilt from the vanilla effects.
  NikolaMX also tested the previews and gave the feedback that shaped the lighting and particle limits.
- Pablo & Claude.

## Feedback we'd love
1. Is the battle still easy to read, or do some effects hide information?
2. Which unit looks worst or overloaded?
3. How does it feel performance-wise in big games?
4. Is the Custom editor clear?
