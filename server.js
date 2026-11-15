// Static dev server + terminal QR code for phones on the same Wi-Fi.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const qrcode = require('qrcode-terminal');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4', '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404 - Not found'); }
    const mime = TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': data.length,
      'Accept-Ranges': 'bytes'
    });
    res.end(data);
  });
});

function lanIP() {
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list) if (i.family === 'IPv4' && !i.internal) return i.address;
  return null;
}

server.listen(PORT, '0.0.0.0', () => {
  const ip = lanIP();
  console.log('\n  ORBITAL ENGINEER - Mission Control online\n');
  console.log(`  Local:    http://localhost:${PORT}`);
  if (ip) {
    const url = `http://${ip}:${PORT}`;
    console.log(`  Network:  ${url}\n`);
    console.log('  Scan with your phone (same Wi-Fi):\n');
    qrcode.generate(url, { small: true });
  } else {
    console.log('  No network connection found, QR code skipped.');
  }
});
