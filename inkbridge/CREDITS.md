# Credits

- Design, code, shaders, world, props, gear (hats, helmets, armour plates, weapons, cloth) and synthesized sounds: made with AI for Anas. The world and all gear are procedural (built in code).
- Font: Alexandria (variable) by Mohamed Gaber, SIL Open Font License 1.1 (copied from `CreatorStudio/matbakh/ui/fonts`). The OFL text was not available offline; add `OFL.txt` from https://openfontlicense.org before public distribution.
- Sound effects and music: see "v6.1 sounds" below (CC0 recordings from OpenGameArt and Kenney, layered, plus in-house synthesis). The v1-v5 synthesized kit and the v2 music are no longer in the game.

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

### v6.1 sounds (replaces the v6 set)

Every game sound is now built by `tools/build_audio_v61.py`, which layers CC0 recordings (a transient, a whoosh, a thump, a splat, a ring) and adds in-house synthesis only for the sub thumps, the bells, the drums, the drone and the flute-like lead. All packs below were downloaded 2026-11-12 from the file links on their OpenGameArt pages (no account); each page shows the licence **CC0** (checked on the page the same day). The downloads are kept in `CreatorStudio/assets_free/sfx_cc0/oga/dl/<page name>/` with the saved pages next to them.

| Used for | Files | Author | Page (licence CC0) |
|---|---|---|---|
| light swings, jump, perfect-dodge swell | `swish-1..13.wav` | artisticdude | https://opengameart.org/content/swishes-sound-pack |
| whoosh layer of swings, dash, throw, skills, dissolve, brush stroke | `swosh-01..` (flac) | qubodup | https://opengameart.org/content/swish-bamboo-stick-weapon-swhoshes |
| heavy swings (`sword.N.ogg`), armour hits, block, guard break, boss sting (`sword_clash.N.ogg`) | 20 files | StarNinjas | https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes |
| the body of every hit, falls, landings, boss slam | `hitNN.mp3.flac` | Independent.nu | https://opengameart.org/content/37-hitspunches |
| the wet "ink" layer of hits | `crack11`, `crack12` (flac) | Independent.nu | https://opengameart.org/content/2-wooden-squish-splatter-sequences |
| footsteps (weight layer), boss steps | `stone01`, `wood01..03`, `leaves01..02` (ogg) | TinyWorlds | https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud |
| sword unsheathing (ink dash, ultimate, start), metal ring, chainmail, cloth, wood creak, UI clicks | `battle/sword-unsheathe*.wav`, `inventory/metal-ringing.wav`, `metal-small1..3.wav`, `chainmail1.wav`, `cloth.wav`, `cloth-heavy.wav`, `armor-light.wav`, `wood-small.wav`, `interface/interface1..3.wav` | artisticdude | https://opengameart.org/content/rpg-sound-pack |
| wind bed, bamboo bed, storm wind | `wind1.wav`, `wind3.wav`, `wind5.wav` | Luke.RUSTLTD | https://opengameart.org/content/wind1 |
| water under the bridges | `VistulaShort_0.mp3` | RandomMind | https://opengameart.org/content/sea-and-river-wave-sounds |
| storm rain bed | `1.ogg` from `Rain OGG.zip` | Ylmir | https://opengameart.org/content/rain-loopable |
| thunder | `rain-thunder.ogg` | WuxiaScrub | https://opengameart.org/content/rain-long-thunder |
| footsteps (texture layer) | `footstep_concrete_*.ogg`, `footstep_wood_*.ogg`, `footstep_grass_*.ogg` | Kenney | https://kenney.nl/assets/impact-sounds (CC0) |

- **Music** (`music_title`, `music_bridge`, `music_fight`, `music_boss`, `music_storm`): synthesized in-house by the same script (drum, rim, drone and a breathy flute voice with vibrato, through a long reverb). No samples, no third-party music.
- **Voices: none.**
- Kenney RPG Audio and Interface Sounds are no longer used by the game.
- No one has listened to these sounds or this mix: they were checked by waveform numbers, loudness meter and spectrogram only.

Not from any pack (procedural, made for this game): the straw hat, the red scarf and the boss's cape and banners (verlet cloth), the sword and scabbard, the runner's twin blades and narrow hat, the brute's helmet, plates and iron club, the thrower's spears, the boss's horned helmet and armour; every building, bridge, bamboo stalk, banner, lantern, rock and mountain.

## Web build

- Godot 4.7.2 official Web export template (`web_nothreads_release`), MIT licence, taken from the official release archive `Godot_v4.7.2-stable_export_templates.tpz` on github.com/godotengine/godot.

## v6.1 entry screens (fonts)

- Display font: **Aref Ruqaa Bold**, Copyright 2015-2020 The Aref Ruqaa Project Authors (https://github.com/alif-type/aref-ruqaa), SIL Open Font License 1.1. File `assets/fonts/ArefRuqaa-Bold.ttf`, copied from `CreatorStudio/reels/letters3d/engine/fonts/` (nothing downloaded); licence text in `assets/fonts/OFL_ArefRuqaa.txt`.
- Text font: Alexandria (as above); its licence text is now in `assets/fonts/OFL_Alexandria.txt` (copied from `itch/OFL_Alexandria.txt`).
- The lettering on the web loading screen (`web/shell.html`) is a small PNG of the title set in Aref Ruqaa Bold, embedded in the page; the rest of that page uses the device's own Arabic font.
- The in-game credits screen (`scripts/entry.gd`, `CREDIT_SOUNDS` and `_build_credits`) repeats the entries of this file; pack names there are written from the page addresses in the v6.1 sounds table. Keep the two in step.
