// Monta a versao que vai para o Hostinger em /90-minutos/.
// Entrada: origem/ (copia do site publicado no Lovable)
// Saida:   dist/90-minutos/ (o que o servidor entrega)

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const RAIZ = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const ORIGEM = join(RAIZ, 'origem');
const SAIDA = join(RAIZ, 'dist');
const DESTINO = join(SAIDA, '90-minutos');
const CAMINHO = '/90-minutos/';
const SITE = 'https://beiereducacao.com.br';

rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(DESTINO, { recursive: true });
cpSync(ORIGEM, DESTINO, { recursive: true });

let html = readFileSync(join(DESTINO, 'index.html'), 'utf8');

// 1. tira o selo e os rastreadores do Lovable, que nao existem no nosso servidor
html = html.replace(/<style>\s*#lovable-badge[\s\S]*?<\/style>/, '');
html = html.replace(/<aside\s+id="lovable-badge"[\s\S]*?<\/aside>/, '');
html = html.replace(/<script>\s*\(\(\) => \{[\s\S]*?lovable-badge[\s\S]*?\}\)\(\);\s*<\/script>/, '');
html = html.replace(/<script defer src="\/~flock\.js"[^>]*><\/script>/, '');
html = html.replace(/<script defer src="\/__l5e\/events[^>]*><\/script>/, '');

// 2. caminhos absolutos passam a ser relativos, para o site viver dentro de /90-minutos/
html = html.replace(/(src|href)="\/(assets|__l5e)\//g, '$1="$2/');
html = html.replace(/href="\/favicon\.png"/g, 'href="favicon.png"');

// 3. endereco canonico e imagem de compartilhamento no dominio definitivo
if (!html.includes('rel="canonical"')) {
  html = html.replace('</head>', `  <link rel="canonical" href="${SITE}${CAMINHO}">\n  </head>`);
}
html = html.replace(
  /<meta property="og:image" content="[^"]*">/,
  `<meta property="og:image" content="${SITE}${CAMINHO}compartilhamento-beier.jpg">`
);
html = html.replace(
  /<meta name="twitter:image" content="[^"]*">/,
  `<meta name="twitter:image" content="${SITE}${CAMINHO}compartilhamento-beier.jpg">`
);

writeFileSync(join(DESTINO, 'index.html'), html);

// 4. o roteador do site precisa saber que ele mora dentro de /90-minutos/
const pastaAssets = join(DESTINO, 'assets');
for (const nome of readdirSeguro(pastaAssets)) {
  if (!nome.endsWith('.js')) continue;
  const caminho = join(pastaAssets, nome);
  let js = readFileSync(caminho, 'utf8');
  js = js.replace(/"\/(assets|__l5e)\//g, '"$1/');
  js = js.replace('basename:t="/"', `basename:t="${CAMINHO}"`);
  writeFileSync(caminho, js);
}

// 5. sobra do Lovable que nao serve para nada no nosso servidor
for (const lixo of ['flock.js', '__l5e/events.270c78a44fc53e7b.js', '__l5e/rrweb-record']) {
  rmSync(join(DESTINO, lixo), { force: true });
}

// 6. regra do servidor: endereco desconhecido cai na pagina
writeFileSync(
  join(DESTINO, '.htaccess'),
  [
    'RewriteEngine On',
    'RewriteBase /90-minutos/',
    'RewriteCond %{REQUEST_FILENAME} !-f',
    'RewriteCond %{REQUEST_FILENAME} !-d',
    'RewriteRule . index.html [L]',
    '',
    'AddType application/javascript .js',
    'AddType text/css .css',
    '',
    'ErrorDocument 404 /90-minutos/index.html',
    '',
  ].join('\n')
);

// 7. robots do site novo
writeFileSync(
  join(DESTINO, 'robots.txt'),
  ['User-agent: *', 'Allow: /', `Sitemap: ${SITE}${CAMINHO}sitemap.xml`, ''].join('\n')
);

function readdirSeguro(pasta) {
  try {
    return readdirSync(pasta);
  } catch {
    return [];
  }
}

console.log('gerado em', DESTINO);
console.log('arquivos:', readdirSeguro(DESTINO).join(', '));
console.log('assets:', readdirSeguro(pastaAssets).join(', '));
