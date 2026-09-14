#!/usr/bin/env node

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.argv[2] || 8001);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = path.resolve(root, relative);
  return candidate === root || candidate.startsWith(`${root}${path.sep}`) ? candidate : null;
}

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/api/status') {
    const payload = Buffer.from(JSON.stringify({
      project: 'TechnoHab',
      service: 'local-preview',
      port,
    }));
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': payload.length,
      'Content-Type': 'application/json; charset=utf-8',
    });
    if (request.method === 'HEAD') response.end();
    else response.end(payload);
    return;
  }

  const file = resolveRequest(request.url);
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    const payload = Buffer.from('Page introuvable.');
    response.writeHead(404, {
      'Cache-Control': 'no-store',
      'Content-Length': payload.length,
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end(payload);
    return;
  }

  const payload = fs.readFileSync(file);
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Length': payload.length,
    'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') response.end();
  else response.end(payload);
}).listen(port, '127.0.0.1', () => {
  console.log(`TechnoHab : http://127.0.0.1:${port}`);
});

