# كتاب الذكاء الاصطناعي | AI pop-up book (reader)

Source project: `CreatorStudio/book_ai/` (edit there, then `python tools/build_site.py` rebuilds this folder).
Reader is the default; `?autoplay=1` is the reel timeline.

## Add a chapter
1. `book_ai/assets/chapters/chN.js` (same shape as `ch2.js`), cards in `book_ai/img/cards/` (`tools/prep_new.py` + `tools/cards_new.py`).
2. Set `ready: true` for it in `assets/chapters/index.js`, then rebuild.

## Credits and licences
- three.js r160, MIT licence: `assets/vendor/three/LICENSE`.
- Fonts, SIL Open Font License 1.1 (texts in `assets/fonts/`): Alexandria (The Alexandria Project Authors),
  Aref Ruqaa (The Aref Ruqaa Project Authors), IBM Plex Sans Arabic (IBM Corp.), Amiri (The Amiri Project Authors, body text).
- Illustrations, page and desk textures: made for this project with image generation (owner's own), no third-party art.
