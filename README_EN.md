# web-design-forge

> A full-pipeline skill for high-design websites — from design direction and data-driven design-system generation to Awwwards-grade motion, image compression, Cloudflare Pages deployment, and QR-code delivery. It forges "acceptable" web pages into work people remember.

## Introduction

web-design-forge is a WorkBuddy / Claude Code skill that plays the role of a design director: clients have already rejected every template-looking proposal, and what they pay for is a unique point of view. It turns website design into an executable pipeline — **design direction → design-system generation → advanced motion build → construction → pre-delivery checklist → go-live** — and replaces "guessing by feel" with a local design-intelligence database.

Trigger scenarios: website design, web page design, building a website, landing pages, official sites, portfolio sites, personal homepages, résumé sites, 16:9 HTML PPT/slides, UI design, premium/award-level pages, redesigning existing pages, deploying a site, going live, and slow-image optimization. Works with any stack — single-file HTML, React/Vite, Vue, Next.js, and more.

## Features

- **Six-phase end-to-end workflow**: design direction (four questions + a two-pass design plan) → data-driven design system → advanced technique selection → build (with copywriting rules) → mandatory pre-delivery checklist → deployment. Every phase has a defined output and acceptance bar.
- **Anti-AI-cliché iron rules**: a negative checklist to read before every design — cream backgrounds with terracotta accents, SaaS card kits, banned fonts (Inter / Roboto / Arial / Open Sans / system defaults), fade-up entrances on every block, a single italicized word in a headline, and more. Paired with a restraint principle (the Chanel rule: boldness in exactly one place; remove every decoration that doesn't serve the brief).
- **Design-intelligence database (`search.py`)**: 84 styles, 192 WCAG-audited palettes, 74 font pairings, 192 product types with 161 industry inference rules, 99 UX heuristics, and 22 tech-stack specs. One command produces a complete design system (palette/typography/style/landing structure/anti-patterns), with three 1–10 sliders (variance = safe↔bold, motion = subtle↔complex, density = airy↔dense). Multi-page projects can `--persist` a `design-system/` folder to stay consistent across sessions. **Zero results means never fabricate** — retry with different keywords instead.
- **28 award-grade motion techniques**: T1–T13 foundations (Lenis+GSAP scrolling, text-splitting, custom cursors, clip-path reveals, WebGL image displacement, etc.), T14–T20 modern native CSS (scroll-driven animations with zero JS, View Transitions, container queries, `:has()`, Rive, etc.), T21–T28 component micro-interactions (buttons/forms/card hover/skeletons/WebGL shaders), plus a Spline interactive-3D integration guide. Motion discipline: non-user-triggered motion stays few and deliberate; `prefers-reduced-motion` is always honored.
- **Three deliverable tracks**: general websites follow the six-phase main flow; personal homepages/portfolios/résumé sites use the dual-mode workflow in `references/homepage/` (19 style presets, template index, DESIGN_REVIEW acceptance); 16:9 HTML decks use PRESENTATION_WORKFLOW (paged playback / speaker view, PPT_VISUAL_QA acceptance). Pages and slides are independent products with separate layout and acceptance rules.
- **Deploy + QR-code delivery**: one-command Cloudflare Pages go-live (project-name dedup, `<project>.pages.dev` alias for delivery, CDN-cache-bypass verification, real-browser scroll checks via Chrome CDP), an image-compression script (`compress-images.cjs`, sharp-powered, target width ≈ 2× display width, 760 px cap for regular images), QR generation (`make-qr.js`, margin ≥ 4 or it won't scan), a 27-item pitfalls list, and a PowerShell 5.1 pitfalls doc.
- **Fact discipline**: only real information the user provides; gaps are left as clearly marked placeholders — never fabricated data, projects, endorsements, or links.

## How It Works / Tech Stack

- The skill itself is a declarative `SKILL.md` (WorkBuddy / Claude Code skill format) that lazy-loads deep-dive documents from `references/` via a file index, reading only what's needed.
- Design decisions come from retrieval, not inspiration: `scripts/search.py` queries the CSV database under `data/` (styles/palettes/fonts/product types/industry inference rules/UX heuristics/`stacks/` 22 tech-stack specs) and outputs a full design system by keyword + domain + stack + sliders; `validate_data.py` checks data integrity.
- Deployment chain: `npm run build` (Vite projects must manually copy `images/` into `dist/`) → `compress-images.cjs` (sharp) → `wrangler pages project create` + `wrangler pages deploy` → curl with a timestamp query to verify → `make-qr.js` (qrcode) for the share QR code.
- Dependencies: Python 3 (search.py), Node.js (sharp for compress-images.cjs, qrcode for make-qr.js), and the Cloudflare wrangler CLI for the deployment track.

## Installation & Usage

Copy this repository's folder into your skills directory, keeping the folder name `web-design-forge`:

- WorkBuddy / CodeBuddy: `~/.workbuddy/skills/web-design-forge/`
- Claude Code: `~/.claude/skills/web-design-forge/`

Restart the session and the skill activates via trigger words. You can also call the design-intelligence engine directly from the command line:

```bash
PY="C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"
SCRIPTS="C:/Users/Administrator/.workbuddy/skills/web-design-forge/scripts"

# Full design system in one shot (palette/typography/style/landing structure/anti-patterns)
"$PY" "$SCRIPTS/search.py" "bbq restaurant warm lively" --design-system -p "ProjectName"

# Three sliders (1-10): variance safe<->bold / motion subtle<->complex / density airy<->dense
"$PY" "$SCRIPTS/search.py" "internal dashboard" --design-system --variance 8 --motion 6 --density 8 -p "Ops"

# Deep dive into a single domain
"$PY" "$SCRIPTS/search.py" "keywords" --domain style|color|typography|landing|ux|chart|icons|gsap

# Tech-stack implementation specs
"$PY" "$SCRIPTS/search.py" "keywords" --stack html-tailwind|react|nextjs|vue|nuxtjs|svelte|astro|shadcn|threejs

# Persist the design system for multi-page projects (design-system/MASTER.md + pages/ overrides)
"$PY" "$SCRIPTS/search.py" "keywords" --design-system -p "ProjectName" --persist --output-dir "<project root>"
```

## Project Structure

```
web-design-forge/
├── SKILL.md                  # Skill definition (frontmatter + six-phase flow + iron rules + file index)
├── README.md                 # Chinese documentation
├── README_EN.md              # This file (English)
├── data/                     # Design-intelligence database (CSV)
│   └── stacks/               #   22 tech-stack implementation specs (html-tailwind/react/nextjs/vue/threejs...)
├── references/               # Lazy-loaded deep-dive docs
│   ├── frontend-design-full.md    # Anthropic's full official design methodology
│   ├── techniques-foundation.md   # T1–T13 foundational award-grade motion
│   ├── techniques-modern.md       # T14–T20 modern native CSS techniques
│   ├── techniques-micro.md        # T21–T28 component micro-interactions
│   ├── spline-3d.md               # Spline interactive 3D scenes
│   ├── deployment-guide.md        # Full deployment flow + 27-item pitfalls list
│   ├── cloudflare-commands.md     # wrangler command reference
│   ├── powershell-pitfalls.md     # PowerShell 5.1 pitfalls
│   └── homepage/                  # Personal-homepage/HTML-PPT kit (14 files + 19 SVG template previews)
└── scripts/                  # Tooling
    ├── search.py             #   Design-intelligence engine (main entry)
    ├── core.py / design_system.py
    ├── validate_data.py      #   Data validation
    ├── compress-images.cjs   #   Image compression (requires sharp)
    └── make-qr.js            #   QR generation (requires qrcode)
```

## Notes

- **External template library for homepage mode**: personal-homepage work references an external template library at `C:/Users/Administrator/WorkBuddy/模板库-个人主页/` (59.7 MB hero-video template, single-file HTML, React/Tailwind, PPT templates — 5 sets). That directory is not part of this repo; prepare it separately, or follow `references/homepage/` to build by hand.
- **Retrieval discipline**: when the database returns zero matches, never fabricate — retry with different keywords. As a fallback, use generic defaults and explicitly tell the user it's "not a database match." Never read the CSVs under `data/` directly; always go through the `search.py` CLI.
- **Three deployment traps**: Vite does not auto-copy `images/` outside `public/` into `dist/` (copy manually); Cloudflare Pages branch aliases may point to an old Preview build — always deliver the `<project>.pages.dev` alias; headless browsers create lazy-loading illusions — verify with real-browser scrolling (Chrome CDP 9222).
- **Non-commercial clause**: this skill absorbs methodology from `personal-homepage-skill` (non-commercial license); the parts covering personal-homepage/portfolio templates are **for non-commercial use only** — confirm before any commercial use.
- The image-compression and QR scripts need `npm install sharp` / `npm install qrcode` for their dependencies.

## License

Mixed licensing — each source follows its own terms (see "Sources & Attribution" at the end of `SKILL.md`; original author credits are preserved):

- Design philosophy & anti-cliché methodology: Anthropic's official `frontend-design` skill (Apache License 2.0)
- Design-intelligence database & retrieval engine: `claude-code-ui-ux-skill` by @nicohodt (MIT)
- 28 award-grade techniques, Anti-Gravity creative philosophy, Spline 3D chapter: GENESIS `ui-ux-gold-standard` by Miguel Jiminez (MIT)
- Personal-homepage/HTML-PPT dual-mode workflow, 19 style presets, homepage template library: `personal-homepage-skill` by powerycy / 升级打怪 (**non-commercial license**, non-commercial use only)
- Deployment flow & pitfalls list: in-house skill `web-deploy-publisher` (distilled from hands-on experience)

## Author

sheen945
