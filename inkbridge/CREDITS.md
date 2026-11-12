# Credits

- Design, code, shaders, world, props, gear (hats, helmets, armour plates, weapons, cloth) and synthesized sounds: made with AI for Anas. The world and all gear are procedural (built in code).
- Font: Alexandria (variable) by Mohamed Gaber, SIL Open Font License 1.1 (copied from `CreatorStudio/matbakh/ui/fonts`). The OFL text was not available offline; add `OFL.txt` from https://openfontlicense.org before public distribution.
- Sound effects: in-house numpy-synthesized CreatorStudio SFX kit (`sfx_kit/v2`, `sfx_kit/impact_soft_a.wav`) and `tools/make_sfx.py`; no third-party samples.
- v2 music (bridge loop, boss loop, phase-2 storm layer) and the perfect-dodge / thunder sounds: synthesized in-house with numpy by `tools/make_music.py`; no samples, no third-party audio.
- Engine: Godot Engine 4.7.2 (MIT licence), https://godotengine.org.

## v4 characters and animation (third-party, all CC0 1.0 Universal, public domain)

All four files in `assets/chars/` are cut down from packs by **Quaternius** (https://quaternius.com), licence **CC0 1.0** (https://creativecommons.org/publicdomain/zero/1.0/). The licence text shipped with the packs is copied to `assets/chars/LICENSE_Quaternius_CC0.txt`. CC0 needs no attribution; it is given here anyway. The files were made with `tools/slim_gltf.py`, which strips every texture (the ink shader paints each surface a flat wash) and unused clips. Local source copies: `VELES-UNREAL/ArtSource/Quaternius/` (downloaded earlier from the pack pages; nothing was downloaded for v4).

| File in the game | What it is | Source pack | Licence |
|---|---|---|---|
| `assets/chars/shade.glb` | Body used by the hero, the swordsman, the runner, the spear thrower and the boss: the "Male Ranger" outfit (tunic, trousers, boots, bracers, belts, pauldron, hood), 65-bone rig | Quaternius, Modular Character Outfits - Fantasy [Standard], `Male_Ranger.gltf` | CC0 1.0 |
| `assets/chars/brute.glb` | Body used by the armoured brute: the "Male Peasant" outfit | Quaternius, Modular Character Outfits - Fantasy [Standard], `Male_Peasant.gltf` | CC0 1.0 |
| `assets/chars/head.glb` | Head, hair and beard (used where there is no hood) | Quaternius, Universal Base Characters [Standard], `Superhero_Male_FullBody` head with hair and beard pieces from the same pack's Hairstyles folder (taken from the earlier local build `ArtSource/Quaternius/Build/SK_QWarrior.glb`; the exact hairstyle files were not re-checked) | CC0 1.0 |
| `assets/chars/anims.glb` | 19 animation clips on the same rig: Sword_Idle, Sword_Attack, Roll, Death01, Hit_Chest, Hit_Head, Idle, Jog_Fwd, Sprint, Walk, Fixing_Kneeling, Crouch_Idle, Spell_Simple_Enter/Idle/Shoot, Jump_Start, Jump_Land, Punch_Cross, Punch_Jab | Quaternius, Universal Animation Library [Standard], `UAL1_Standard.glb` | CC0 1.0 |

Not from any pack (procedural, made for this game): the straw hat, the red scarf and the boss's cape and banners (verlet cloth), the sword and scabbard, the runner's twin blades and narrow hat, the brute's helmet, plates and iron club, the thrower's spears, the boss's horned helmet and armour; every building, bridge, bamboo stalk, banner, lantern, rock and mountain.

## Web build

- Godot 4.7.2 official Web export template (`web_nothreads_release`), MIT licence, taken from the official release archive `Godot_v4.7.2-stable_export_templates.tpz` on github.com/godotengine/godot.
