# Template selection and index

The maintained [template-index.json](assets/template-index.json) maps names, reasonable Chinese search terms, preview paths, implementation paths and implementation roles. The JSON is small — read it directly and match the user's keywords against `name` and `keywordsZh`.

A returned implementation may be a preview component, not a complete site. Read `kind`:

| Kind | What exists | How to use |
| --- | --- | --- |
| `style-preview` | 18 static SVG catalog thumbnails in `assets/template-previews/` | Browse the SVGs to commit to a direction, then adapt its visual vocabulary per STYLE_PRESETS.md; build homepage and slide layouts separately. (The original live React gallery is not bundled.) |
| `complete-homepage` | Hero neural-AI homepage with runnable source, media and portable folder | Inspect its actual portable preview, read its usage and adapt only if selected. It is not a PPT template. |
| `homepage-starter` | Single HTML skeleton with editing/export | Apply chosen style and real content; verify desktop/mobile. |
| `presentation-starter` | Two-slide fixed-stage skeleton with editing/export/presenter | Apply chosen style and build representative slides before expanding. |
| `homepage-source-starter` | React/Tailwind source skeleton; no standalone preview | Build it in a project before judging its rendering. |

Before choosing a style, open or render actual indexed previews; do not infer appearance from English names, identity tags or keywords alone. User-selected styles go straight to that preview and implementation. Without a choice, select a small relevant set based on person, audience, available evidence and tone; adapt the number to the task. This selection need not block on user confirmation.

**Cute Pixel Creator** is indexed as `cute-pixel-creator`: the live React preview uses pink grid paper, dark ink, pixel blocks and a yellow quest panel. The older SVG thumbnail uses yellow paper and is only a catalog cover. It is a style preview, not a finished deck. A PPT can reuse those features with a restrained title slide, readable information layout and large case imagery. It is not the universal default.

Homepage preview components and SVG snapshots may differ in detail; inspect the implementation to be used. Complete templates (hero, single-html, presentation-html, react-tailwind) live in the external library `C:/Users/Administrator/WorkBuddy/模板库-个人主页/` — the index's `implementation` field already points there. Style descriptions live in [STYLE_PRESETS.md](STYLE_PRESETS.md). Cinematic and Orbis prompt references remain available there; a prompt specification alone is not a complete runnable template.

## Maintenance

When adding or renaming a style, update the entry in `assets/template-index.json` together with its SVG thumbnail. Include Chinese terms people would reasonably search, not every possible identity. Keep preview paths relative to the JSON file. Do not list nonexistent full decks as templates.
