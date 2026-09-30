# HTML PPT workflow

Only for fixed 16:9, page-by-page presentations. Homepage responsive reflow and scroll sections do not apply.

## Content before layout

Use the audience, speaking goal, duration and source material to outline the story. Default live talks to short on-screen points with full explanations in slide notes. One clear idea and a few short points are useful guides, not quotas. Reading-first decks may be denser while retaining hierarchy and legibility.

When the user supplies a manuscript and asks to retain language, structure or order, preserve the complete source in order across slide notes. Extract on-screen emphasis without changing viewpoints. Track source passages to stable slide IDs so nothing is lost. If the user explicitly wants all text on screen, respect that and use more pages or reading layouts. Never shrink type to force long copy into a target page count. When merging/deleting pages, move required notes to the retained slide in source order; do not silently drop the original script.

Keep a lightweight source-to-slide outline (or ledger for complex decks) recording required topics, assets and notes. Reconcile it before delivery. Production notes do not belong on audience slides.

## Select and test the design early

Use the [template index](template-selection.md) and inspect actual previews. Follow an explicit choice, including Cute Pixel Creator when chosen. Share palette, type, borders and suitable assets across modes; adapt the layout to slides. A homepage preview is not a complete deck template.

For a new full deck, first build a few representative slides with real content—for example opening, densest information and a case page. Render and inspect them using [PPT_VISUAL_QA.md](PPT_VISUAL_QA.md), fix density, image scale and style, then expand the deck. This is early self-review, not a new user approval step. A small edit only needs relevant review.

## Implement and reuse

Start with [presentation.html](C:/Users/Administrator/WorkBuddy/模板库-个人主页/presentation-html/presentation.html) and its [usage](C:/Users/Administrator/WorkBuddy/模板库-个人主页/presentation-html/README.md). Load [shared HTML editing/export](html-editing-export.md) and [presenter mode](presenter-mode.md). The bundled scripts implement navigation, synchronization and portable export.

- Author a 1920×1080 stage and scale the entire stage to the largest 16:9 viewport rectangle. Keep controls as overlays; do not reserve space that shrinks the stage. No mobile content reflow.
- Exactly one slide paints at a time; transitions must not leave prior-slide text visible. Keep stage/layout transforms separate from nested motion layers and respect reduced motion.
- Each `.slide` has a unique semantic `data-slide-id`, original `data-original-number`, and current `data-slide-title`. Current numbering comes from live slide order; never renumber semantic or edit IDs.
- Notes use `data-note-for` matching the semantic slide ID. Editable text uses explicit stable `data-edit-id` roles. Deleted IDs must not redirect old edits to another slide.
- Preserve working keyboard and touch navigation. Arrow keys, Space, PageUp/PageDown, Home/End navigate; F toggles fullscreen, E edits, N opens presenter, Escape exits editing, Cmd/Ctrl+S saves. Navigation ignores form fields and editable text.

## Verify

The original repo's Playwright harness is not bundled. Verify in a real browser instead (本机 Chrome CDP 9222 通道，详见技能根目录 deployment-guide.md 的浏览器验证章节）:

- Open the deck via its absolute `file://` path; check each slide's geometry (no overflow, no clipped content), metadata, asset loading, keyboard shortcuts and transform conflicts.
- Capture per-slide screenshots for review; measurements do not judge aesthetics.
- Review rendered slides with [PPT_VISUAL_QA.md](PPT_VISUAL_QA.md), using a montage for rhythm and full-size inspection for density/details. New decks need all pages checked; edits need affected pages and surrounding rhythm checked.

Verify notes coverage, export/reopen/edit, audience-to-presenter and presenter-to-audience navigation, current/next title, note text, font size, timer, and popup fallback. After structural changes, verify first/last navigation, count, IDs and note mapping again, including in the exported file. Keep QA outputs under task scratch space. An audit-only request does not authorize editing the source deck. A skipped check is not a pass.
