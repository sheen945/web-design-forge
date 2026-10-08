# web-design-forge

> 高设计感网站全链路技能——从设计定调、数据驱动设计系统生成、Awwwards 级动效构建，到图片压缩、Cloudflare Pages 部署上线、二维码交付，一站式把「能看」的网页锻造成「记得住」的作品。

## 简介

web-design-forge 是一个 WorkBuddy / Claude Code 技能，扮演「设计总监」角色：客户已经拒绝过所有像模板的方案，付费买的是独特的观点。它把网站设计拆解为一条可执行的流水线——**设计定调 → 设计系统生成 → 高级动效构建 → 构建 → 交付自检 → 部署上线**，并用一份本地设计智能数据库替代「凭感觉猜」。

触发场景：网站设计、网页设计、做网站、落地页、官网、作品集网站、个人主页、简历网站、16:9 HTML PPT/幻灯片、UI 设计、高级感/获奖级页面、重塑现有页面、部署网站、发布上线、图片加载慢优化。适用于单文件 HTML、React/Vite、Vue、Next.js 等任意技术栈。

## 功能特性

- **六阶段全链路工作流**：设计定调（四问 + 两遍法设计计划）→ 数据驱动设计系统 → 高级技术选型 → 构建（含文案写作规范）→ 交付前必过清单 → 部署上线。每一步都有明确产出与验收标准。
- **反 AI 套路铁律**：每次设计前默读的负面清单——奶油色背景 + 陶土色点缀、SaaS 卡片套装、禁用字体（Inter / Roboto / Arial / Open Sans / 系统默认）、每区块都淡入上滑、标题只斜一个词等；配合克制原则（Chanel 法则：大胆只用在一个地方，删掉一切不为需求服务的装饰）。
- **设计智能数据库（search.py）**：84 种风格、192 套配色（含 WCAG 校订）、74 组字体搭配、192 种产品类型 + 161 条行业推理规则、99 条 UX 准则、22 个技术栈规范。一条命令生成完整设计系统（配色/字体/风格/落地结构/反模式），支持三档滑杆微调（variance 大胆度 / motion 动效复杂度 / density 信息密度，1–10 档），多页项目可 `--persist` 持久化 design-system/ 跨会话保持一致。**检索返回 0 条时不许编造**，换关键词重试。
- **28 项获奖级动效技术库**：T1–T13 基础获奖动效（Lenis+GSAP 滚动、文字拆分、自定义光标、clip-path 揭示、WebGL 图像置换等）、T14–T20 现代 CSS 原生技术（滚动驱动动画零 JS、View Transitions、容器查询、:has()、Rive 等）、T21–T28 组件微交互（按钮/表单/卡片悬浮/骨架屏/WebGL 着色器），另有 Spline 交互式 3D 场景集成指南。动效纪律：非用户触发的动效少而精，永远检查 `prefers-reduced-motion`。
- **交付物三分流**：通用网站模式走六阶段主流程；个人主页/作品集/简历站走 `references/homepage/` 双模式工作流（19 个风格预设、模板索引、DESIGN_REVIEW 验收）；16:9 HTML PPT 走 PRESENTATION_WORKFLOW（分页播放/演讲者视图，PPT_VISUAL_QA 验收）。网页与幻灯片是两种产物，布局与验收规则互相独立。
- **部署 + 二维码交付**：Cloudflare Pages 一键上线（项目名查重、`<项目名>.pages.dev` 别名交付、CDN 缓存绕过验证、Chrome CDP 真实浏览器滚动验证），图片压缩脚本（`compress-images.cjs`，sharp 驱动，目标宽 ≈ 显示宽×2、普通图 760px 封顶）、二维码生成（`make-qr.js`，margin ≥ 4 否则扫不出），附 27 条踩坑清单与 PowerShell 5.1 坑位文档。
- **事实纪律**：只写用户提供的真实信息；缺失就留占位并明确标注，绝不编造数据、项目、背书、链接。

## 工作原理 / 技术栈

- 技能本体是声明式 `SKILL.md`（WorkBuddy / Claude Code 技能格式），按「文件索引」懒加载 `references/` 下的深度文档，只在需要时读取。
- 设计决策不靠灵感靠检索：`scripts/search.py` 读取 `data/` 下的 CSV 数据库（风格/配色/字体/产品类型/行业推理规则/UX 准则/`stacks/` 22 个技术栈规范），按关键词 + 域 + 技术栈 + 三档滑杆输出成套设计系统；`validate_data.py` 校验数据完整性。
- 部署链路：`npm run build`（Vite 项目需手动把 images/ 复制进 dist）→ `compress-images.cjs`（sharp）→ `wrangler pages project create` + `wrangler pages deploy` → curl 加时间戳验证 → `make-qr.js`（qrcode）生成分享二维码。
- 依赖：Python 3（search.py）、Node.js（compress-images.cjs 需 sharp、make-qr.js 需 qrcode）、Cloudflare wrangler CLI（部署支线）。

## 安装与使用

把本仓库目录复制到技能目录，文件夹名保持 `web-design-forge`：

- WorkBuddy / CodeBuddy：`~/.workbuddy/skills/web-design-forge/`
- Claude Code：`~/.claude/skills/web-design-forge/`

重启会话后即可通过触发词自动匹配。也可以直接命令行调用设计智能引擎：

```bash
PY="C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"
SCRIPTS="C:/Users/Administrator/.workbuddy/skills/web-design-forge/scripts"

# 生成完整设计系统（配色/字体/风格/落地结构/反模式，一次出全）
"$PY" "$SCRIPTS/search.py" "烤肉店 餐饮 官网 烟火气" --design-system -p "项目名"

# 三档滑杆微调（1-10）：variance 居中←→大胆 / motion 微妙←→复杂 / density 宽松←→密集
"$PY" "$SCRIPTS/search.py" "internal dashboard" --design-system --variance 8 --motion 6 --density 8 -p "Ops"

# 单域深挖
"$PY" "$SCRIPTS/search.py" "关键词" --domain style|color|typography|landing|ux|chart|icons|gsap

# 技术栈实现规范
"$PY" "$SCRIPTS/search.py" "关键词" --stack html-tailwind|react|nextjs|vue|nuxtjs|svelte|astro|shadcn|threejs

# 多页项目持久化设计系统（生成 design-system/MASTER.md + pages/ 覆盖页）
"$PY" "$SCRIPTS/search.py" "关键词" --design-system -p "项目名" --persist --output-dir "<项目根目录>"
```

## 项目结构

```
web-design-forge/
├── SKILL.md                  # 技能定义（frontmatter + 六阶段流程 + 铁律 + 文件索引）
├── README.md                 # 本文档（中文）
├── README_EN.md              # 英文版说明
├── data/                     # 设计智能数据库（CSV）
│   └── stacks/               #   22 个技术栈实现规范（html-tailwind/react/nextjs/vue/threejs 等）
├── references/               # 懒加载深度文档
│   ├── frontend-design-full.md    # Anthropic 官方完整设计方法论
│   ├── techniques-foundation.md   # T1–T13 基础获奖动效
│   ├── techniques-modern.md       # T14–T20 现代 CSS 原生技术
│   ├── techniques-micro.md        # T21–T28 组件微交互
│   ├── spline-3d.md               # Spline 交互式 3D 场景
│   ├── deployment-guide.md        # 部署全流程 + 27 条踩坑清单
│   ├── cloudflare-commands.md     # wrangler 命令参考
│   ├── powershell-pitfalls.md     # PowerShell 5.1 坑位
│   └── homepage/                  # 个人主页/HTML PPT 全套（14 个文件 + 19 个 SVG 模板预览）
└── scripts/                  # 工具脚本
    ├── search.py             #   设计智能检索引擎（核心入口）
    ├── core.py / design_system.py
    ├── validate_data.py      #   数据校验
    ├── compress-images.cjs   #   图片压缩（依赖 sharp）
    └── make-qr.js            #   二维码生成（依赖 qrcode）
```

## 注意事项

- **主页模式的外置模板库**：做个人主页时会引用外置模板库 `C:/Users/Administrator/WorkBuddy/模板库-个人主页/`（hero 视频模板 59.7MB、单文件 HTML、React/Tailwind、PPT 模板等 5 套），该目录不在本仓库内，需另行准备；没有它时按 `references/homepage/` 的指引手工构建即可。
- **检索纪律**：数据库检索返回 0 条时不许编造，换关键词重试；兜底时使用通用默认值并明确告知用户「非数据库匹配」。不要直接读 `data/` 下的 CSV，一律走 `search.py` 命令行。
- **部署支线的三个巨坑**：Vite 不自动复制 public 外的 images/ 进 dist（需手动复制）；Cloudflare Pages 分支别名可能指向 Preview 旧版，交付一律用 `<项目名>.pages.dev`；headless 浏览器有懒加载假象，验收要用真实浏览器（Chrome CDP 9222）滚动验证。
- **非商业条款**：本技能吸收了 `personal-homepage-skill`（非商业许可）的方法论，涉及个人主页/作品集模板的部分**仅限非商业用途**，商用前请确认。
- 图片压缩与二维码脚本需要 `npm install sharp` / `npm install qrcode` 提供依赖。

## License

混合许可，按来源分别遵循（详见 `SKILL.md` 文末「来源与署名」，原作者署名均已保留）：

- 设计哲学与反套路方法论：Anthropic 官方 `frontend-design` 技能（Apache License 2.0）
- 设计智能数据库与检索引擎：`claude-code-ui-ux-skill`（作者 @nicohodt，MIT）
- 28 项获奖技术、Anti-Gravity 创意哲学、Spline 3D 章节：GENESIS `ui-ux-gold-standard`（作者 Miguel Jiminez，MIT）
- 个人主页/HTML PPT 双模式工作流、19 风格预设、主页模板库：`personal-homepage-skill`（作者 powerycy / 升级打怪，**非商业许可**，仅限非商业用途）
- 部署上线流程与踩坑清单：自有技能 `web-deploy-publisher`（作者实战经验沉淀）

## 作者

sheen945
