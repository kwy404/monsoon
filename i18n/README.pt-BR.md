<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot.svg" width="150" alt="Mo, o mascote do Monsoon: um panda vermelho de capa de chuva com um guarda-chuva">
  </picture>
</p>

<h1 align="center">Monsoon</h1>

<p align="center">CSS utility-first em uma folha de estilo, com tema a partir de uma cor e modo escuro automático.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/v/monsooncss?color=3b5bdb&label=npm" alt="versão no npm"></a>
  <a href="https://github.com/kwy404/monsoon/actions/workflows/ci.yml"><img src="https://github.com/kwy404/monsoon/actions/workflows/ci.yml/badge.svg" alt="status da CI"></a>
  <a href="https://github.com/kwy404/monsoon/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/monsooncss?color=3b5bdb" alt="licença MIT"></a>
</p>

<p align="center">
  <a href="https://kwy404.github.io/monsoon/">Documentação</a> &middot;
  <a href="https://kwy404.github.io/monsoon/components.html">Componentes</a> &middot;
  <a href="https://kwy404.github.io/monsoon/playground.html">Playground</a> &middot;
  <a href="https://kwy404.github.io/monsoon/builder.html">Montador de páginas</a> &middot;
  <a href="https://github.com/kwy404/monsoon/blob/main/README.md">English</a>
</p>

O Monsoon é um arquivo CSS com todas as classes utilitárias e componentes já escritos. Basta linkar o arquivo, escrever classes como `px-4`, `md:grid-cols-3` ou `btn btn-primary` no HTML e recarregar a página. Não há compilador nem arquivo de configuração. Uma cor em `--seed` gera o tema inteiro, e o modo escuro segue o sistema sozinho.

## Começo rápido

Salve como `index.html` e abra no navegador:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.min.css">
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-md p-8">
    <div class="card">
      <div class="card-body space-y-4">
        <h1 class="text-2xl font-bold">Olá, Monsoon</h1>
        <p class="text-muted-foreground">Uma folha de estilo. Sem build.</p>
        <button class="btn btn-primary">Começar</button>
      </div>
    </div>
  </main>
</body>
</html>
```

Fixe a versão, como acima, para o arquivo nunca mudar sem você saber.

## Instalar com npm

```bash
npm install monsooncss
```

```js
import 'monsooncss';
```

Sem bundler, copie `node_modules/monsooncss/dist/monsoon.min.css` para a pasta pública e linke no layout. A [página de instalação](https://kwy404.github.io/monsoon/docs/installation-npm.html) mostra o arquivo de entrada dos frameworks mais comuns.

## Tema a partir de uma cor

```css
:root { --seed: #0d9488; }
```

O Monsoon calcula primary, secondary, accent, superfícies, bordas, o anel de foco e cores de texto legíveis a partir da cor, com cores relativas em OKLCH, no próprio navegador. Use `style="--seed: teal"` em qualquer elemento para mudar o tema só daquela parte. Os testes conferem contraste de 4.5:1 nos pares de tokens para várias cores, no modo claro e no escuro.

## Modo escuro

O modo escuro segue `prefers-color-scheme`. Para forçar, use `data-theme="dark"`, `class="dark"` ou `class="light"` na raiz ou em qualquer seção; vale o ancestral com tema mais próximo.

## Componentes

São 167 componentes, como botões, formulários, cards, tabelas, diálogos, menus e navegação, na mesma folha de estilo e feitos sobre HTML nativo. Alguns comportamentos que o CSS não resolve sozinho, como área para soltar arquivos ou recorte de imagem, vêm do script opcional:

```html
<script src="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.js" defer></script>
```

O script também traz valores arbitrários como `w-[37px]` ou `bg-[#0d9488]`. Cada página de componente no site tem prévia ao vivo e um botão para copiar o HTML.

## Enviar menos CSS

O arquivo completo tem cerca de 88 kB com brotli. Para manter só as classes que você usa:

```bash
npx monsooncss purge "src/**/*.html" -o public/monsoon.css
```

Use `--safelist a,b,c` para classes montadas em tempo de execução.

## Navegadores

Versões atuais do Chrome, Edge, Firefox e Safari. O tema por cor precisa de relative color syntax (Chrome e Edge 119, Firefox 128, Safari 18). Navegadores antigos recebem tokens fixos da cor padrão.

## Licença

[MIT](../LICENSE). Feito por Alexandre Kohler ([GitHub](https://github.com/kwy404), [LinkedIn](https://www.linkedin.com/in/alexandre-silva-173687256/)).
