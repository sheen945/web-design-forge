# PowerShell 5.1 坑位清单

本机环境：Windows + PowerShell 5.1。以下坑全部踩过（2026-08 实战），务必遵守。

## 1. `-replace` 带回调函数（最高危！）

**症状**：`-replace 'pattern', { param($m) ... }` 在 PS 5.1 中不会执行回调，而是把**字面文本**（`param($m) $m.Value -replace ...`）插入文件，且可能**重复插入多次**。

**真实事故**：改 HeroSection.tsx 时，205 行文件被膨胀到 1665 行（垃圾内容重复 9 次）。

**正确做法**：
- 优先用 edit 工具精确替换
- 或 .NET 精确替换：`[System.IO.File]::ReadAllText + IndexOf 定位 + Replace + WriteAllText`
- **禁止**用 `-replace` 配合回调改源码文件

## 2. Node 从 stdin 读代码：中文路径变乱码

**症状**：`node -e "..."` 或管道传入包含中文路径的代码时，中文变成 `?????`。

**原因**：PowerShell 管道编码（GBK）破坏 UTF-8。

**正确做法**：**必须把脚本写成 .js 文件再执行**，不要在命令行内联中文路径。

## 3. `-replace` 对含 `$` 的替换串

**症状**：替换串里含 `$`（如 `$m`、`${}`）时被当作捕获组引用或转义符。

**正确做法**：
- 用**单引号**字符串（`'...'`）包裹含 `$` 的内容
- 或避免 -replace，用 .NET 方法

## 4. 中文乱码（输出/文件）

- **控制台显示乱码**：`chcp 65001` 或 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`；GBK 解码 UTF-8 是显示问题，文件本身可能正常
- **脚本文件中文乱码**：PowerShell 脚本需 **UTF-8 BOM** 保存（无 BOM 时 PS5.1 按 GBK 读，中文全乱）
- **curl 输出乱码**：Windows curl 用 GBK 解码响应，中文 JSON/HTML 乱码是正常现象，用 `curl.exe -o file` 落盘再检查

## 5. Node fs.Stats：`.size` 不是 `.length`

**症状**：`fs.statSync(f).length` 返回 undefined → 日志全 NaN。

**真相**：Node 的 Stats 对象属性是 `.size`（`.length` 是字符串/数组的）。

## 6. 数组参数拆分 bug

**症状**：`node script.ps1 @argList` 或命令行传含空格数组时，PowerShell 5.1 会把元素拆成多个独立参数；以 `(` 开头的参数报「此时不应有 (」错误。

**解决**：批量脚本用 Node.js 驱动（`execFileSync('node', [args...])` 数组传递），绕开 PowerShell 解析。

## 7. exec 的 workdir 参数不生效

**症状**：`exec(workdir=...)` 没切目录，命令在错误目录执行。

**解决**：命令内显式 `cd "绝对路径"` 或用绝对路径。

## 8. 启动 GUI 程序

**禁止**直接调用可执行文件（会卡住等待退出）；必须：

```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=C:\Users\Administrator\WorkBuddy\chrome-cdp-profile","<url>"
```

> 浏览器统一方案见 `chrome-browser` 技能：Chrome + 端口 9222 + `chrome-cdp-profile`。
> 另注：命令派生出来的进程会在命令结束时被沙盒回收；需要浏览器长期驻留时，
> 让用户双击桌面「启动浏览器.exe」。

## 9. 环境变量不持久化

**症状**：`$env:CLOUDFLARE_API_TOKEN = "xxx"` 只对当前终端生效，新终端丢失。

**解决**：每次部署命令前重设，或写进脚本开头。

## 10. 交互式命令禁止

- 禁止需要用户输入的交互式命令（如 `wrangler login` 浏览器授权）
- 非交互环境 wrangler delete 等会自动用 fallback yes

## 编码速查

| 场景 | 编码 |
|------|------|
| PowerShell 脚本文件 | UTF-8 BOM |
| Node 脚本文件 | UTF-8（无 BOM 也行） |
| 网页源码 | UTF-8 |
| 控制台显示中文 | chcp 65001 |
