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

### v5 additions

| File in the game | What it is | Source pack | Licence |
|---|---|---|---|
| `assets/chars/anims2.glb` | 25 more clips on the same 65-bone rig: Sword_Regular_A / A_Rec / B / B_Rec / C, Sword_Regular_Combo, Sword_Heavy_Combo, Sword_Dash, Sword_Block, Hit_Knockback, LayToIdle, Melee_Hook, Melee_Hook_Rec, NinjaJump_Start / Idle / Land, OverhandThrow, Idle_Shield_Break, TreeChopping, Zombie_Scratch, Zombie_Idle, Zombie_Walk_Fwd, Shield_Dash, Idle_Rail_Call, Slide_Start | Quaternius, **Universal Animation Library 2 [Standard]**, `Unreal-Godot/UAL2_Standard.glb`. Downloaded 2026-11-12 from the official free download on https://quaternius.itch.io/universal-animation-library-2 (no account, the "Standard" file, 17 MB zip). Kept at `CreatorStudio/assets_free/quaternius/universal-animation-library-2/`. | CC0 1.0 (licence text copied to `assets/chars/LICENSE_Quaternius_UAL2_CC0.txt`) |

### v6 sounds (replaces the v5 synthesized set)

Swings, impacts, footsteps, body falls, cloth, jump/land and UI sounds are now recorded sounds from three Kenney packs, all **CC0 1.0 Universal** (kenney.nl, "License: Creative Commons Zero"). Downloaded 2026-11-12 from the pack pages' direct download (no account, no payment); the zips and their `License.txt` are kept in `CreatorStudio/assets_free/sfx_cc0/`. `tools/build_audio_v6.py` holds the exact file-to-file map, re-pitches some, normalises the peak, adds a 2 ms fade-in and a 40 ms fade-out, and encodes OGG.

| Game sound (variants) | Source files | Pack |
|---|---|---|
| `swing_0..4`, `swing_heavy_0..2` (pitched down), `throw`, `skill_dash`, `skill_whirl` | `knifeSlice.ogg`, `knifeSlice2.ogg`, `drawKnife1..3.ogg` | Kenney **RPG Audio** (https://kenney.nl/assets/rpg-audio) |
| `cloth_0..3`, `jump_0..1`, `dash_0..2`, `creak_0..2` (bamboo creaks) | `cloth1..4.ogg`, `clothBelt.ogg`, `creak1..3.ogg` | Kenney **RPG Audio** |
| `impact_flesh_0..4`, `impact_flesh_heavy_0..2`, `hurt_0..1` | `impactPunch_medium_000..004.ogg`, `impactPunch_heavy_000..004.ogg` | Kenney **Impact Sounds** (https://kenney.nl/assets/impact-sounds) |
| `impact_armor_0..4`, `impact_armor_heavy_0..2`, `impact_block_0..2`, `guard_break_0..1` | `impactMetal_medium_*.ogg`, `impactPlate_heavy_*.ogg`, `impactMetal_light_*.ogg`, `impactMetal_heavy_000/002.ogg` | Kenney **Impact Sounds** |
| `step_stone_0..4`, `step_wood_0..4`, `step_grass_0..4` | `footstep_concrete_*.ogg`, `footstep_wood_*.ogg`, `footstep_grass_*.ogg` | Kenney **Impact Sounds** |
| `thud_0..2` (body falls), `land_0..2` | `impactSoft_heavy_*.ogg`, `impactSoft_medium_*.ogg` | Kenney **Impact Sounds** |
| `ui`, `ui_tick`, `ui_card`, `ui_pick` | `click_001.ogg`, `tick_001.ogg`, `select_001.ogg`, `confirmation_001.ogg` | Kenney **Interface Sounds** (https://kenney.nl/assets/interface-sounds) |

- **Voices: none.** No CC0 grunt recordings were found without an account, so every voice (hero, enemies, brute, boss) was removed rather than kept synthetic. `InkAudio.voice()` is a no-op.
- **Still synthesized in-house** (numpy, `tools/make_sfx_v5.py`, `tools/make_music.py`): the deep booms and risers (`shockwave`, `thunder`, `boss_sting`, `skill_charge`, `skill_wave`, `ult_ink`), the `bell`, `tell`, `perfect` and `dissolve` cues, the wind loop and the three music loops.
- The v5 synthesized swings, impacts, steps, voices and the `amb_*` ambient loops were deleted from the game.
- No one has listened to this mix: files were checked by waveform (peak, start/end samples) and a recorded fight by loudness meter and spectrogram only.

Not from any pack (procedural, made for this game): the straw hat, the red scarf and the boss's cape and banners (verlet cloth), the sword and scabbard, the runner's twin blades and narrow hat, the brute's helmet, plates and iron club, the thrower's spears, the boss's horned helmet and armour; every building, bridge, bamboo stalk, banner, lantern, rock and mountain.

## Web build

- Godot 4.7.2 official Web export template (`web_nothreads_release`), MIT licence, taken from the official release archive `Godot_v4.7.2-stable_export_templates.tpz` on github.com/godotengine/godot.
