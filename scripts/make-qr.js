/**
 * 二维码生成脚本
 * 用法: node make-qr.js <网址> <输出路径> [颜色]
 * 示例: node make-qr.js "https://xxx.pages.dev" "C:\out\qr.png" "#C62828"
 * 注意: margin 6（静默区≥4模块，否则扫码失败）
 */
const QRCode = require('qrcode');
const path = require('path');

const url = process.argv[2];
const outFile = process.argv[3];
const color = process.argv[4] || '#C62828';

if (!url || !outFile) {
  console.error('用法: node make-qr.js <网址> <输出路径> [颜色]');
  process.exit(1);
}

QRCode.toFile(outFile, url, {
  width: 1000,
  margin: 6,
  color: { dark: color, light: '#FFFFFF' },
  errorCorrectionLevel: 'H'
}).then(() => {
  console.log('QR saved:', outFile);
}).catch(e => {
  console.error('QR error:', e.message);
  process.exit(1);
});
