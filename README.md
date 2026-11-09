# Beier Educação - Página de vendas do curso de 90 minutos

Página de vendas do curso "Domine em 90 minutos as finanças da sua empresa", publicada em
`https://beiereducacao.com.br/90-minutos/`.

## Como este repositório funciona

A página é criada no Lovable e publicada em `https://financas90minutos.lovable.app`. Este repositório
guarda uma cópia do site publicado, já preparada para rodar dentro da pasta `/90-minutos/` do site da
Beier, servida pelo Hostinger.

Duas ramificações:

| Ramificação | Conteúdo | Para que serve |
|---|---|---|
| `main` | ferramentas, cópia da origem e imagem do produto | histórico e reprodução |
| `publicado` | somente os arquivos do site | é a que o Hostinger publica |

## Arquivos

```
mirror.mjs          baixa o site publicado no Lovable para origem/
build.mjs           monta a versão final em dist/90-minutos/
origem/             cópia fiel do que o Lovable publicou
dist/90-minutos/    resultado, o que vai para o servidor
hotmart/            imagem 600x600 do produto para o checkout
```

## O que o build corrige

1. Caminhos absolutos passam a ser relativos, para o site viver dentro de `/90-minutos/`.
2. O roteador do site passa a saber que mora em `/90-minutos/`.
3. Sai o selo "Edit with Lovable" e os rastreadores do Lovable.
4. Entram o endereço canônico e a imagem de compartilhamento no domínio definitivo.
5. Entra o `.htaccess` com queda para `index.html` e o `robots.txt`.

## Como atualizar a página

Quando a página for alterada no Lovable e publicada de novo:

```
node mirror.mjs
node build.mjs
```

Depois publicar o conteúdo de `dist/90-minutos/` na ramificação `publicado`.

## Deploy no Hostinger

O Hostinger puxa a ramificação `publicado` para a pasta `public_html/90-minutos`.

No painel: Sites, beiereducacao.com.br, Avançado, GIT, conectar com GitHub, escolher este repositório,
ramificação `publicado`, diretório `public_html/90-minutos`.

## Pendências conhecidas

- O código de origem em React continua só no Lovable. A conexão do Lovable com o GitHub está bloqueada
  por permissão de dono do projeto. Enquanto isso, a atualização é feita pela cópia publicada.
- Os números da página (3.243 empresários, 98% de nota 10 e as notas das aulas) precisam de fonte
  antes de serem usados como prova.
