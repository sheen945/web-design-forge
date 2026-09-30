# Cloudflare Pages / wrangler 命令参考

## 认证

```powershell
# 环境变量方式（推荐，无需交互登录）
$env:CLOUDFLARE_API_TOKEN = "<cfat_开头的token>"
$env:CLOUDFLARE_ACCOUNT_ID = "<32位账户ID>"
```

- Token 创建：dash.cloudflare.com → My Profile → API Tokens → Create Token
- 权限要求：**Account → Cloudflare Pages → Edit**
- Token 验证：`curl.exe https://api.cloudflare.com/client/v4/accounts/<ID>/tokens/verify -H "Authorization: Bearer <token>"`

## 项目管理

```powershell
# 列出所有项目（查重用）
npx wrangler pages project list

# 创建项目（--production-branch 必填！）
npx wrangler pages project create <项目名> --production-branch main

# 删除项目
npx wrangler pages project delete <项目名>

# 查看某项目的部署历史（确认环境/分支）
npx wrangler pages deployment list --project-name=<项目名>
```

## 部署

```powershell
# 部署静态目录（核心命令）
npx wrangler pages deploy "D:\路径\dist" --project-name=<项目名>
```

- 输出：`Deployment complete! https://<hash>.<项目名>.pages.dev`
- 别名：`https://<项目名>.pages.dev`（永远指向最新 Production）
- 首次全量上传；后续只传变化文件

## 分支模型（防坑必读）

| 部署方式 | 环境 | 说明 |
|----------|------|------|
| wrangler pages deploy（无 git） | Production (main) | 别名指向它 |
| 连 git 分支 | Preview | 分支别名（如 master.xxx.pages.dev） |

- **交付用 `<项目名>.pages.dev` 别名**，不要用哈希链接或分支别名
- 哈希链接是某次部署快照，每次部署都会变

## 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| Missing production branch | create 时没指定 | 加 `--production-branch main` |
| 8000096: manifest field expected | Direct Upload API 手写 | 改用 wrangler CLI |
| 401/403 | token 无 Pages 权限或过期 | 重新创建 token |
| Uploaded 0 files | dist 路径错误/空目录 | 检查路径 |

## 常用排查

```powershell
# 线上文件是否生效（中文名需编码）
$enc = [uri]::EscapeDataString("文件名.png")
curl.exe -o nul -s -w "%{http_code} %{size_download}B`n" "https://<项目名>.pages.dev/images/$enc"

# 绕过 CDN 缓存验证真实文件
curl.exe -o nul -s -w "%{size_download}B`n" "https://<项目名>.pages.dev/images/xxx.png?v=$(Get-Date -Format HHmmss)"
```

## 部署记录模板

```
## 部署记录
- 日期/时间：
- 项目名：
- 线上别名：https://<项目名>.pages.dev
- 本次哈希：https://<hash>.<项目名>.pages.dev
- 文件数/大小：
- 验证结果：
```
