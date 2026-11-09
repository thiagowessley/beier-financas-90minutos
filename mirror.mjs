// Baixa uma copia do site publicado no Lovable para a pasta origem/.
// Uso: node mirror.mjs
// Trocar ORIGEM se o endereco publicado mudar de novo.

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SITE = 'https://financas90minutos.lovable.app';
const RAIZ = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const DESTINO = join(RAIZ, 'origem');

rmSync(DESTINO, { recursive: true, force: true });
mkdirSync(DESTINO, { recursive: true });

async function baixar(caminho) {
  const url = SITE + caminho;
  const r = await fetch(url);
  if (!r.ok) {
    console.log('falhou', r.status, caminho);
    return null;
  }
  return Buffer.from(await r.arrayBuffer());
}

function salvar(caminho, dados) {
  const alvo = join(DESTINO, caminho);
  mkdirSync(dirname(alvo), { recursive: true });
  writeFileSync(alvo, dados);
  console.log('ok', caminho, dados.length, 'bytes');
}

const html = (await baixar('/')).toString('utf8');
salvar('/index.html', Buffer.from(html, 'utf8'));

// tudo que o HTML pede
const pedidos = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/(?:assets|__l5e)\/[^"]+)"/g)) pedidos.add(m[1]);

// tudo que o CSS pede
const css = html.match(/href="(\/assets\/[^"]+\.css)"/);
if (css) {
  const texto = (await baixar(css[1])).toString('utf8');
  for (const m of texto.matchAll(/url\((\/[^)]+)\)/g)) pedidos.add(m[1]);
}

// tudo que o JS pede
for (const jsPath of [...pedidos].filter((p) => p.endsWith('.js'))) {
  const texto = (await baixar(jsPath)).toString('utf8');
  for (const m of texto.matchAll(/"(\/(?:assets|__l5e)\/[^"]+)"/g)) pedidos.add(m[1]);
}

for (const caminho of pedidos) {
  const dados = await baixar(caminho);
  if (dados) salvar(caminho, dados);
}

// arquivos soltos na raiz que o HTML usa
for (const solto of ['/favicon.ico', '/favicon.png', '/compartilhamento-beier.jpg', '/robots.txt']) {
  const dados = await baixar(solto);
  if (dados) salvar(solto, dados);
}

console.log('\ntotal de arquivos:', pedidos.size);
