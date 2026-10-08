---
name: web-deploy-publisher
slug: web-deploy-publisher
version: 1.1.0
displayName: 网站部署发布
summary: 从网站构建到线上发布的全流程技能——图片压缩优化、Cloudflare Pages 部署、线上验证、二维码交付、腾讯技能商店发布与手动审核，含全部踩坑经验。
tags: [网站部署, Cloudflare, Pages, 图片压缩, 二维码, wrangler, 发布, 技能商店]
license: MIT
description: 网站从构建到发布的一站式流程：构建产物检查、图片压缩优化（超采大图缩小/WebP转换）、Cloudflare Pages 部署（wrangler CLI）、线上验证（CDP/curl）、二维码生成交付、腾讯技能商店发布（含两层审核：平台安全审核 + 企业手动审核）。沉淀了完整踩坑经验：Node fs.Stats .size 不是 .length、PowerShell -replace 回调陷阱、Cloudflare 分支模型（main=生产）、CDN 缓存、图片超采样问题、技能商店发布后需手动审核等。触发场景：用户说"部署网站"、"发布到网上"、"上线"、"图片加载慢帮我优化"、"生成二维码"、"重新部署"、"发布技能到腾讯技能商店"。
---

# 网站部署发布

把本地网站从「构建产物」到「线上可访问」的一站式流程，含图片压缩优化、Cloudflare Pages 部署、线上验证、二维码交付。基于作者个人主页实战（2026-08-11~13 三轮部署）沉淀。

**适用场景**：任何静态网站（React/Vite 构建产物、单文件 HTML、静态目录）上线。

---

## 总体流程（六步）

```
1. 构建产物准备（build + 图片复制）
2. 图片压缩优化（超采大图缩小，可选但强烈建议）
3. 创建独立项目 + 部署（Cloudflare Pages + wrangler）
4. 线上验证（curl + 真实浏览器 CDP）
5. 二维码交付（qrcode 库）
6. 发布到腾讯技能商店 + 企业账号手动审核（两层审核）
```

---

## 第 1 步：构建产物准备

### 1.1 构建

```powershell
cd "D:\项目目录"
npm run build   # 或 vite build
```

### 1.2 ⚠️ 图片复制（Vite 巨坑）

**Vite 构建不会自动把 public 外的图片复制进 dist！**

- 若图片在 `public/images/` → 自动进 dist
- 若图片在项目顶层 `images/`（与 src 平级）→ **必须手动复制**，否则线上 404

```powershell
# 每次 build 后执行：复制图片进 dist
Copy-Item "D:\项目\images\*" "D:\项目\dist\images\" -Recurse -Force
```

### 1.3 构建产物检查

```powershell
# 确认 dist 内容完整
Get-ChildItem "D:\项目\dist" -Recurse -File | Measure-Object Length -Sum
# 确认 index.html 引用的 JS/CSS 存在（文件名带哈希）
```

**典型问题**：
- 只 build 不复制图片 → 线上图全挂（404）
- 文件名含 `%` 等特殊字符 → 部分工具无法读取，尽量重命名

---

## 第 2 步：图片压缩优化（核心经验）

**为什么必做**：网页图片实际显示尺寸远小于原始尺寸（超采样）。例如作品卡显示 380×250px，原图却是 1179×2556 甚至 1080×8552——等于下载了 6~34 倍多余数据。**这是"图片加载慢"的第一大元凶。**

### 2.1 诊断：找出超采大图

```powershell
# 1. 列出 dist 里 >200KB 的图
Get-ChildItem "D:\项目\dist\images" -File | Sort-Object Length -Descending | Where-Object { $_.Length -gt 200KB } | ForEach-Object { "{0:N0} KB  {1}" -f ($_.Length/1KB), $_.Name }

# 2. 用 sharp 看原生像素尺寸（关键：判断是否超采）
node -e "const sharp=require('sharp'); const path=require('path'); (async()=>{const m=await sharp('D:\\项目\\images\\xxx.png').metadata(); console.log(m.width+'x'+m.height)})()"

# 3. 查源码里图片显示尺寸（决定压缩目标）
Select-String -Path "D:\项目\src\sections\*.tsx" -Pattern "className=.*h-|w-\[|object"
```

**判断标准**：图片原始宽 > 显示宽 ×2 或原始高 > 显示高 ×2 → 超采，可压。

### 2.2 压缩原则

1. **同格式压缩（首选）**：PNG→PNG、JPG→JPG，**保留原文件名** → 源码引用零改动、零风险
2. **改格式（次选）**：PNG→WebP 可再省 60-80%，但要改源码引用（`.png`→`.webp`），工作量与风险更高，只在图片超大时用（如动画帧序列）
3. **目标尺寸**：最大边 ≈ 显示尺寸 ×2（2x 保证高清屏清晰），普通图宽 760px 封顶
4. **质量**：JPG quality 78-80；PNG compressionLevel 9 + palette:true
5. **特殊：超长横幅**（如 1080×8552 战报截图）：高 > 宽×2.5 的按 600px 宽缩放即可

### 2.3 压缩脚本模板（compress.cjs）

```javascript
// 同格式压缩：所有 >200KB 图缩小到 760px 宽（保留文件名）
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const DIR = 'D:\\项目\\images';

(async () => {
  for (const f of fs.readdirSync(DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f))) {
    const p = path.join(DIR, f);
    const size = fs.statSync(p).size;
    if (size < 200 * 1024) continue;
    const m = await sharp(p).metadata();
    const maxW = m.height > m.width * 2.5 ? 600 : 760; // 超长横幅 600，普通 760
    let out = sharp(p);
    if (m.width > maxW) out = out.resize({ width: maxW, withoutEnlargement: true });
    if (/\.jpe?g$/i.test(f)) out = out.jpeg({ quality: 78 });
    else out = out.png({ compressionLevel: 9, palette: true });
    const tmp = p + '.tmp';
    await out.toFile(tmp);
    fs.renameSync(tmp, p);
  }
  console.log('DONE');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
```

### 2.4 压缩后：复制到 dist + 重新部署

```powershell
# 关键：把压缩后的图同步到 dist（包括 <100KB 的！）
Get-ChildItem "D:\项目\images" -File | Where-Object { $_.Name -match "\.(png|jpg)$" } | ForEach-Object {
  $old = Join-Path "D:\项目\dist\images" $_.Name
  if (Test-Path $old) {
    $oldSize = (Get-Item $old).Length
    if ($_.Length -lt $oldSize) { Copy-Item $_.FullName $old -Force; Write-Host "更新: $($_.Name)" }
  }
}
```

**⚠️ 教训**：只复制 >100KB 的图会漏掉压缩后小于 100KB 的文件（如 2.7MB→62KB 的图），线上还是旧版大图。必须"若新文件更小则覆盖"。

### 2.5 实战效果参考（作者个人主页）

| 阶段 | 大小 | 说明 |
|------|------|------|
| 原始 | 75MB | PNG 动画帧 25MB + 全站大图 50MB |
| WebP 转换 | 28.6MB | hero 帧 25MB→1.15MB（-96%） |
| 同格式压缩 | 6.7MB | 超采大图缩小（-76%） |

加载时间从 100+ 秒 → ~14 秒（478KB/s 网速）。

---

## 第 3 步：Cloudflare Pages 部署

### 3.1 项目命名规则（用户强制要求）

**每个网站单独一个项目名，不混用、不与以前项目重复！**

```powershell
# 先查重
npx wrangler pages project list
# 创建新项目（--production-branch main 必填！）
npx wrangler pages project create <项目名> --production-branch main
```

命名惯例：`<网站英文名>-profile` / `<网站名>-web` 等。

### 3.2 认证

```powershell
# 环境变量方式（无需 wrangler login，适合自动化）
$env:CLOUDFLARE_API_TOKEN = "<cfat_开头的token>"
$env:CLOUDFLARE_ACCOUNT_ID = "<32位账户ID>"
```

Token 从 Cloudflare 控制台 → My Profile → API Tokens 创建，需含 **Pages:Edit** 权限。

### 3.3 部署

```powershell
npx wrangler pages deploy "D:\项目\dist" --project-name=<项目名>
```

- 首次全量上传；后续只传变化文件（缓存复用）
- 成功输出：`Deployment complete! https://<hash>.<项目名>.pages.dev`

### 3.4 ⚠️ Cloudflare 分支模型（必读，防坑）

| 部署方式 | 环境 | 别名 |
|----------|------|------|
| `wrangler pages deploy`（无 git 连接） | **Production**（main） | `<项目名>.pages.dev` |
| 连了 git 仓库的分支部署 | Preview | `<branch>.<项目名>.pages.dev` |

- **`<项目名>.pages.dev` 别名永远指向最新 Production**，交付用这个
- 哈希链接（`<hash>.<项目名>.pages.dev`）是某次部署的快照
- **坑**：`master.<项目名>.pages.dev` 这类分支别名可能是 Preview 旧版，**不要交付**！
- 确认方法：`npx wrangler pages deployment list --project-name=<项目名>` 看 Environment 列

### 3.5 删除旧项目（用户要求拆分时）

```powershell
npx wrangler pages project delete <旧项目名>
# 会问确认，非交互环境自动 yes
```

### 3.6 环境变量坑

- `CLOUDFLARE_API_TOKEN` 每次新终端都要重设（不持久化）
- 项目目录若有 `.env` 会被 wrangler 读取，注意别放错

---

## 第 4 步：线上验证

### 4.1 curl 快速验证（图片是否生效）

```powershell
# 中文文件名需 URL 编码
$enc = [uri]::EscapeDataString("宜昌美食-大麻花续集9.6万播放")
curl.exe -o nul -s -w "%{http_code} %{size_download}B`n" "https://<项目名>.pages.dev/images/food-$enc.png"
```

**CDN 缓存坑**：压缩后线上可能仍返回旧版大图。用带时间戳参数绕过缓存验证真实文件：
```powershell
curl.exe -o nul -s -w "%{size_download}B`n" "https://<项目名>.pages.dev/images/xxx.png?v=$(Get-Date -Format HHmmss)"
```

### 4.2 真实浏览器验证（CDP）

headless 浏览器有**懒加载假象**（不滚动不加载图片，报 loaded:false 是正常的），必须用真实浏览器+滚动验证：

```powershell
# 统一方案：Chrome + 固定调试端口 9222 + 固定登录态目录（见 chrome-browser 技能）
# 推荐直接跑技能自带的自检脚本（没跑就用固定目录启动，已在跑直接复用）：
C:\Users\Administrator\AppData\Local\Programs\Python\Python311\python.exe C:\Users\Administrator\.workbuddy\skills\chrome-browser\scripts\chrome_browser.py open "https://<项目名>.pages.dev"
# 然后用 CDP 连 9222 端口截图/检查
```

> ⚠️ 2026-09-13 起：全机唯一浏览器 = **Chrome**（端口 9222，目录 `chrome-cdp-profile`）。
> 旧写法 `Start-Process chrome --remote-debugging-port=9230 --user-data-dir=C:\temp\chrome-debug`
> 已废弃（换端口/换目录 = 每次都是新浏览器、没登录态）。

**判断标准**：
- 页面无 JS 报错、标题正确
- Hero 首屏是黑幕 → 正常（滚动动画初始帧），滚动后内容出现
- 懒加载图片 loaded:false → 正常，真实用户滚动会加载

### 4.3 常见误判

| 现象 | 真相 |
|------|------|
| curl 截图 Hero 黑屏 | 滚动动画初始帧，正常 |
| 中文显示乱码 | Windows curl/控制台 GBK 解码问题，文件本身正常 |
| 大量图 loaded:false | 懒加载 + 无头不滚动，正常 |
| 图片 naturalWidth=0 | 无头解码时序假象，真实浏览器正常 |

---

## 第 6 步：企业账号手动审核（易漏！必做）

⚠️ **发布后 ≠ 上架！** 腾讯技能商店企业版有两层审核流程：

```
发布提交
  ↓
平台安全审核（自动，等待即可）
  ↓ （通过后）
企业手动审核 ← 这一步极易漏掉！
  ↓
技能正式上架
```

**漏掉这一步，技能永远显示「审核中」无法被搜索使用。**

### 6.1 进入审核页面

```powershell
# 直接打开审核页
https://skillhub.cn/admin/skill-reviews
```

或手动路径：右上角 → 「管理后台」→ 「技能管理」→「技能审核」

### 6.2 审核操作

1. 打开 `https://skillhub.cn/admin/skill-reviews`
2. 找到目标技能（如「网站部署发布 v1.0.0」）
3. 等待「状态」列从「安全审核中」变为「审核通过」（平台安全审核自动完成）
4. 「操作」列「审核通过」按钮变为可点击（不再是灰色禁用）
5. 点击「审核通过」→ 技能正式上架，可被搜索到

### 6.3 状态判断

| 状态 | 按钮状态 | 含义 |
|------|--------|------|
| 安全审核中 | 灰色禁用 | 等平台自动审核 |
| 审核通过 | 可点击 | 安全审核已过，需自己点 |
| 已上线 | 无按钮 | 审核完成 |

### 6.4 补充：腾讯技能商店发布入口

发布技能入口：`https://skillhub.cn/enterprise/dashboard/publish`

发布后「我的 Skills」列表看到状态「审核中」= 第一层安全审核进行中，**不是**最终状态。

### 6.5 发布记录存档（建议）

发布成功后建议存档记录：
```markdown
# 发布记录：<技能名> v<版本>
- 发布时间：YYYY-MM-DD HH:MM
- 发布入口：https://skillhub.cn/enterprise/dashboard/publish
- 审核页面：https://skillhub.cn/admin/skill-reviews
- 技能 Slug：<slug>
- 分类：<分类>
- zip 文件：<path>
- 注意事项：发布后需等安全审核 → 再手动点审核通过
```

---

## 第 5 步：二维码交付

```powershell
# 安装 qrcode 库（一次）
cd C:\Users\Administrator\.qclaw\workspace\temp
npm install qrcode
```

```javascript
// make-qr.js：生成红黑金主题二维码
const QRCode = require('qrcode');
const path = require('path');
QRCode.toFile(path.join(__dirname, '二维码.png'), 'https://<项目名>.pages.dev/', {
  width: 1000,
  margin: 6,        // ⚠️ 静默区 ≥4 模块（默认2会扫码失败）
  color: { dark: '#C62828', light: '#FFFFFF' },
  errorCorrectionLevel: 'H'
}).then(() => console.log('OK'));
```

**二维码交付要点**：
- 链接用**稳定生产别名** `<项目名>.pages.dev`（不要用哈希链接）
- margin ≥ 4（静默区不足扫不出）
- 交付时附上二维码文件路径（`MEDIA:` 行）
- 网站更新后链接不变，二维码无需重生成

---

## 踩坑清单（20 条实战经验）

### 构建与文件
1. **Vite 不复制 public 外图片进 dist** → 每次 build 后手动复制 images/ 到 dist/images/
2. **Node fs.Stats 属性是 `.size` 不是 `.length`** → 用 `.length` 返回 undefined，日志全 NaN
3. **Node 从 stdin 读代码中文路径变乱码** → 脚本必须写成文件执行，不能 `node -e` 传中文路径
4. **PowerShell `-replace` 带 `$m` 回调（PS 5.1）会把字面文本插入文件多次** → 别用 -replace 改源码，用 edit 工具或 .NET 精确替换
5. **console.log 中文+数字在 PowerShell 显示 NaN 是假象** → 用 Get-Item 验证文件实际大小
6. **文件名含 `%` 导致图片工具读取失败** → 重命名避免特殊字符

### 图片压缩
7. **超采样是图片慢的元凶** → 显示 380px 的图不需要 2500px 原始尺寸，先查源码显示尺寸再定压缩目标
8. **同格式压缩保留文件名 = 源码零改动** → 优先于转 WebP（需改引用）
9. **超长横幅截图**（高 > 宽×2.5）→ 按 600px 宽缩放即可（显示才 380px 宽）
10. **压缩后复制到 dist 要"更小才覆盖"** → 只复制 >100KB 会漏掉压缩后 <100KB 的图
11. **PNG palette:true 可再省 30-50%** → 截图类 PNG 适用

### 部署与 Cloudflare
12. **`wrangler pages project create` 必须 `--production-branch main`** → 否则报 Missing production branch
13. **`<项目名>.pages.dev` 别名指向最新 Production** → 交付用别名；哈希链接是快照
14. **分支别名可能是 Preview 旧版**（如 master.xxx.pages.dev）→ 不要交付！用 deployment list 确认
15. **CLOUDFLARE_API_TOKEN 每终端重设** → 不持久化
16. **每个网站独立项目名**（用户强制）→ 先 project list 查重再创建
17. **CDN 缓存旧文件** → 验证时 URL 加 `?v=时间戳` 绕过；用户端刷新 1-2 次

### 验证与交付
18. **headless 懒加载假象** → 用真实浏览器 + 滚动验证
19. **Windows curl/控制台中文乱码是 GBK 解码** → 文件本身 UTF-8 正常
20. **二维码 margin ≥ 4** → 静默区不足扫不出

### 技能商店发布（2026-08-13 新增）
21. **发布后 ≠ 上架！** 企业版有两层审核：平台安全审核（自动）→ 自己进 `https://skillhub.cn/admin/skill-reviews` 手动点「审核通过」→ 才真正上架。漏掉手动审核会一直显示「审核中」
22. **安全审核中 = 按钮灰色禁用** → 等状态变为「审核通过」且按钮可点后再操作
23. **技能发布入口**：`https://skillhub.cn/enterprise/dashboard/publish`（企业版网页版发布）
24. **团队登录**：登录弹窗选「团队登录」→「授权登录」即可（企业账号）
25. **分类选择（Radix UI Popover）**：普通 click 无效，需 eval + `elementFromPoint` 真实坐标 + 派发 pointerdown/mousedown/pointerup/mouseup/click 完整事件序列
26. **xb CLI 不支持 clickCoords**：坐标点击用 eval + elementFromPoint 实现
27. **zip 打包**：必须正斜杠路径（反斜杠会被安全校验跳过文件），且**不要包含 node_modules**（依赖在 package.json 注明）

---

## 参考文件

- `references/cloudflare-commands.md` — wrangler 完整命令参考
- `references/powershell-pitfalls.md` — PowerShell 5.1 坑位清单
- `scripts/compress-images.cjs` — 图片压缩脚本（可直接改路径使用）
- `scripts/make-qr.js` — 二维码生成脚本（可直接改链接使用）
