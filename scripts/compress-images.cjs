/**
 * 图片压缩脚本（同格式压缩，保留文件名）
 * 用法: node compress-images.cjs <图片目录> [阈值KB] [最大宽px]
 * 示例: node compress-images.cjs "D:\项目\images" 200 760
 * 功能:
 *   - 所有 >阈值KB 的 PNG/JPG 压缩
 *   - 普通图缩到 最大宽px（默认760，2x 显示需求）
 *   - 超长横幅（高>宽×2.5）缩到 600px 宽
 *   - 同格式输出（PNG->PNG, JPG->JPG），保留文件名，源码引用零改动
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const DIR = process.argv[2] || '.';
const THRESHOLD_KB = parseInt(process.argv[3] || '200', 10);
const MAX_W = parseInt(process.argv[4] || '760', 10);
const EXTREME_W = 600; // 超长横幅宽度

(async () => {
  const all = fs.readdirSync(DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  let totalBefore = 0, totalAfter = 0, count = 0;
  for (const f of all) {
    const p = path.join(DIR, f);
    const size = fs.statSync(p).size;
    if (size < THRESHOLD_KB * 1024) continue;
    const m = await sharp(p).metadata();
    totalBefore += size;
    const maxW = m.height > m.width * 2.5 ? EXTREME_W : MAX_W;
    let out = sharp(p);
    if (m.width > maxW) out = out.resize({ width: maxW, withoutEnlargement: true });
    if (/\.jpe?g$/i.test(f)) out = out.jpeg({ quality: 78 });
    else out = out.png({ compressionLevel: 9, palette: true });
    const tmp = p + '.tmp';
    await out.toFile(tmp);
    fs.renameSync(tmp, p);
    const after = fs.statSync(p).size;
    totalAfter += after;
    count++;
    console.log(`${(size/1024).toFixed(0).padStart(5)}KB -> ${(after/1024).toFixed(0).padStart(4)}KB  ${f}  (${m.width}x${m.height})`);
  }
  console.log(`\n合计 ${count} 张: ${(totalBefore/1024/1024).toFixed(1)}MB -> ${(totalAfter/1024/1024).toFixed(1)}MB`);
  if (count === 0) console.log('没有超过阈值的大图，无需压缩');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
