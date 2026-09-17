const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'site');
const port = Number(process.env.PORT || 4175);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  if(req.method==='POST'&&req.url==='/capture'){
    let body='';req.on('data',chunk=>{body+=chunk;if(body.length>24000000)req.destroy();});
    req.on('end',()=>{try{const {name,png}=JSON.parse(body);if(!/^(hallNightToMirror|hallNightToLiving|shower|childMirror|dressing|bathroomSink|bathroomDoor|childWindow|childReverse|hall|overview|top|living|reverse|tv|kitchen|mirror|bedroom|bedroomWardrobe)(-neutral|-night|-m[5679]-(1000|1200|1400|1600|1800|2000))?$/.test(name)||!png.startsWith('data:image/png;base64,'))throw new Error('Invalid capture');const output=path.join(root,'renders',name+'.png');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,Buffer.from(png.slice(22),'base64'));res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({saved:name+'.png'}));}catch(e){res.writeHead(400);res.end('Invalid capture');}});return;
  }
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(file, (error, info) => {
    if (error || !info.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, '127.0.0.1');








