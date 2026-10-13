<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot.svg" width="168" alt="Mo, o mascote do Monsoon: um panda vermelho de capa de chuva segurando um guarda-chuva colorido, a cara de um framework CSS utility-first sem etapa de build">
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/banner-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/banner.svg" width="820" alt="Banner do Monsoon: CSS utility-first direto de uma CDN, sem etapa de build, tema inteiro a partir de uma cor semente e modo escuro automático">
  </picture>
</p>

<h1 align="center">Monsoon: CSS utility-first sem etapa de build</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/v/monsooncss?color=3b5bdb&label=npm" alt="versão do monsooncss no npm"></a>
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/dm/monsooncss" alt="downloads mensais do monsooncss no npm"></a>
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/dt/monsooncss" alt="downloads totais do monsooncss no npm"></a>
  <a href="https://github.com/kwy404/monsoon/actions/workflows/ci.yml"><img src="https://github.com/kwy404/monsoon/actions/workflows/ci.yml/badge.svg" alt="status da CI do framework CSS Monsoon"></a>
  <a href="https://github.com/kwy404/monsoon/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/monsooncss?color=3b5bdb" alt="licença MIT"></a>
  <a href="https://github.com/kwy404/monsoon/blob/main/scripts/size.mjs"><img src="https://img.shields.io/badge/brotli-43%20kB-3b5bdb" alt="A folha de estilo completa tem cerca de 43 kB com brotli"></a>
</p>

<p align="center">
  <a href="https://kwy404.github.io/monsoon/">Documentação</a> &middot;
  <a href="https://kwy404.github.io/monsoon/#playground">Playground da semente</a> &middot;
  <a href="https://kwy404.github.io/monsoon/components.html">Componentes</a> &middot;
  <a href="https://kwy404.github.io/monsoon/classes.html">Referência de classes</a> &middot;
  <a href="https://github.com/kwy404/monsoon/blob/main/README.md">Read in English</a>
</p>

**Monsoon é um framework CSS utility-first que você usa direto de uma CDN.** Adicione uma tag `<link>` e escreva classes como `px-4`, `md:grid-cols-3` e `hover:bg-primary` em HTML puro. Não há compilador, arquivo de configuração nem JavaScript. Defina uma cor `--seed` e o Monsoon gera um tema completo e acessível com cores relativas OKLCH, incluindo modo escuro automático.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
```

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/demo.svg" width="100%" alt="Demonstração animada de CSS utility-first sem build: classes do Monsoon montam um card e depois uma única cor --seed muda o tema de botões, badges e superfícies">
</p>

<table>
  <tr>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/no-build.svg" width="32" alt="Ícone sem build: framework CSS sem etapa de build"><br><b>Sem etapa de build</b><br>Uma folha de estilo. Sem compilador, sem config, sem watcher.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/cdn.svg" width="32" alt="Ícone de nuvem: framework CSS por CDN"><br><b>Direto da CDN</b><br>jsDelivr ou unpkg, ou hospede o arquivo você mesmo.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/seed-theme.svg" width="32" alt="Ícone de semente: gerar um tema a partir de uma cor em CSS"><br><b>Tema a partir de uma cor</b><br><code>--seed</code> controla todas as cores semânticas, em CSS puro.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark-mode.svg" width="32" alt="Ícone de meia lua: modo escuro com uma linha de CSS"><br><b>Modo escuro incluso</b><br>Segue o sistema, ou uma classe muda a página ou uma seção.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/accessibility.svg" width="32" alt="Ícone de acessibilidade: contraste de cor acessível em CSS"><br><b>Contraste acessível</b><br>O texto troca de cor para manter 4.5:1, testado para qualquer semente.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/utility-classes.svg" width="32" alt="Ícone de barras: classes utilitárias"><br><b>4.616 utilitários</b><br>Layout, flex, grid, espaçamento, tipografia, cor, efeitos e mais.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/variants.svg" width="32" alt="Ícone de camadas: variantes hover, focus e responsivas"><br><b>7.565 classes de variante</b><br>Estado, group, peer, dark, movimento e breakpoints.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/container-queries.svg" width="32" alt="Ícone de caixas: container queries com classes utilitárias"><br><b>Container queries</b><br><code>@container</code> e variantes <code>@xs:</code> a <code>@xl:</code>.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/tiny-size.svg" width="32" alt="Ícone de compressão: CSS utilitário pequeno para produção"><br><b>Cerca de 43 kB brotli</b><br>O arquivo inteiro. Uma requisição em cache.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/purge.svg" width="32" alt="Ícone de funil: remover CSS não usado"><br><b>CLI de purge opcional</b><br>Mantém só as classes que seus arquivos usam.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/framework-agnostic.svg" width="32" alt="Ícone de formas: utilitários CSS para PHP, WordPress, Django e Rails"><br><b>Qualquer stack</b><br>HTML, PHP, WordPress, Django, Rails ou qualquer framework JS.</td>
    <td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/familiar-classes.svg" width="32" alt="Ícone de pílula: nomes de classe legíveis"><br><b>Nomes que se leem como CSS</b><br><code>gap-6</code>, <code>text-muted-foreground</code>, <code>rounded-xl</code>.</td>
  </tr>
</table>

## Sumário

- [Começo rápido](#começo-rápido)
- [Instalar com npm, pnpm, yarn ou bun](#instalar-com-npm-pnpm-yarn-ou-bun)
- [Gerar um tema a partir de uma cor](#gerar-um-tema-a-partir-de-uma-cor)
- [Modo escuro com uma linha de CSS](#modo-escuro-com-uma-linha-de-css)
- [Variantes e container queries](#variantes-e-container-queries)
- [CLI de purge: envie só as classes que você usa](#cli-de-purge-envie-só-as-classes-que-você-usa)
- [Referência de classes por categoria](#referência-de-classes-por-categoria)
- [Suporte a navegadores](#suporte-a-navegadores)
- [O que não está incluído](#o-que-não-está-incluído)
- [Perguntas frequentes](#perguntas-frequentes)
- [Guias](#guias)
- [Mais de kwy404](#mais-de-kwy404)
- [Licença](#licença)

## Começo rápido

Salve como `index.html` e abra no navegador. Todas as classes já estão na folha de estilo.

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-md p-8">
    <div class="rounded-2xl border bg-surface p-6 shadow-lg space-y-4">
      <h1 class="text-2xl font-bold">Olá, Monsoon</h1>
      <p class="text-muted-foreground">Uma folha de estilo. Nenhuma etapa de build.</p>
      <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">
        Começar
      </button>
    </div>
  </main>
</body>
</html>
```

Em produção, fixe a versão para que o arquivo nunca mude sem você saber:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@0.1.0/dist/monsoon.min.css">
```

`https://unpkg.com/monsooncss` entrega o mesmo arquivo.

## Instalar com npm, pnpm, yarn ou bun

```bash
npm install monsooncss
pnpm add monsooncss
yarn add monsooncss
bun add monsooncss
```

O pacote traz `dist/monsoon.min.css` (export padrão) e o legível `dist/monsoon.css` (`monsooncss/css`). Importe como seu bundler importa CSS, ou copie o arquivo para a pasta pública:

```bash
cp node_modules/monsooncss/dist/monsoon.min.css public/monsoon.css
```

## Gerar um tema a partir de uma cor

Defina `--seed` com qualquer cor CSS. O Monsoon deriva os tokens semânticos no navegador com a sintaxe de cor relativa OKLCH:

```css
:root {
  --seed: #0d9488;
}
```

| Tokens | Uso |
| --- | --- |
| `primary`, `primary-foreground` | Ações principais e links. A luminosidade sai da faixa em que o texto não alcança 4.5:1. |
| `secondary`, `secondary-foreground` | Botões discretos e chips, um tom de baixa saturação da semente. |
| `accent`, `accent-foreground` | Destaques, o matiz da semente girado em 180 graus. |
| `background`, `foreground` | Fundo da página e texto. |
| `surface`, `surface-2`, `surface-3` | Cards, painéis e camadas elevadas. |
| `muted`, `muted-foreground` | Preenchimentos sutis e texto secundário. |
| `border`, `ring` | Bordas finas e o anel de foco. |
| `success`, `warning`, `danger`, `info` | Cores de status, cada uma com seu `-foreground`. |

Cada token é um utilitário (`bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`) e uma propriedade customizada (`var(--primary)`). Para mudar o tema de uma seção, coloque a semente nela:

```html
<section style="--seed: teal" class="rounded-2xl bg-surface p-8 space-y-3">
  <h2 class="text-2xl font-bold text-primary">Seção teal</h2>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primário</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2">Destaque</button>
</section>
```

**Contraste de cor acessível faz parte das fórmulas.** A cor primária nunca fica entre as luminosidades OKLCH 0.52 e 0.66, e o texto sobre ela alterna entre branco e quase preto no mesmo limite. Os testes verificam 4.5:1 (WCAG AA) para 13 pares de tokens em 18 sementes nomeadas e em uma varredura de 2.197 sementes sRGB, nos modos claro e escuro. Teste qualquer cor no [playground da semente](https://kwy404.github.io/monsoon/#playground).

O Monsoon também traz sua própria paleta OKLCH de 22 matizes, de `slate` a `rose`, passos `50` a `950`, como propriedades `--color-{matiz}-{passo}` e como utilitários como `bg-emerald-100` e `text-rose-600`.

## Modo escuro com uma linha de CSS

O modo escuro é automático via `prefers-color-scheme`. As cores semânticas trocam sozinhas, então a maioria das páginas não precisa de classes extras. Para forçar um esquema na página ou em qualquer seção:

```html
<html data-theme="dark">
<!-- ou class="dark", class="light", data-theme="light" -->

<aside class="dark bg-background text-foreground rounded-2xl p-6">
  <p class="text-muted-foreground">Esta seção é sempre escura.</p>
</aside>
```

Para cores fixas da paleta existe a variante `dark:`: `bg-slate-100 dark:bg-slate-800`.

## Variantes e container queries

```html
<button class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 active:scale-95 disabled:opacity-50">
  Salvar
</button>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">...</div>

<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">...</div>
</div>
```

| Variantes | Valores |
| --- | --- |
| Estado | `hover:` `focus:` `focus-within:` `focus-visible:` `active:` `disabled:` `group-hover:` `peer-checked:` |
| Estrutura | `first:` `last:` `odd:` `even:` |
| Esquema e movimento | `dark:` `motion-safe:` `motion-reduce:` |
| Breakpoints (min-width) | `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px, `2xl:` 1536px |
| Container queries | `@xs:` 20rem, `@sm:` 24rem, `@md:` 28rem, `@lg:` 32rem, `@xl:` 36rem (dentro de um pai com `@container`) |

As variantes são aplicadas a um conjunto escolhido de utilitários para manter o arquivo pequeno: `hover:` para cores, opacidade, sombras e transformações; breakpoints para layout, espaçamento, tamanho e texto; `dark:` para cores da paleta. A [referência de classes](https://kwy404.github.io/monsoon/classes.html) mostra as variantes de cada classe.

## CLI de purge: envie só as classes que você usa

O arquivo completo serve para a maioria dos sites. Para enviar menos, escaneie seus arquivos uma vez e gere uma folha de estilo só com as regras usadas, mais o reset, os tokens de tema e os keyframes:

```bash
npx monsooncss purge "src/**/*.html" -o public/monsoon.css
npx monsooncss purge "templates/**/*.html" "app/**/*.{php,erb,js}" --safelist bg-success,bg-danger -o static/monsoon.css
npx monsooncss classes --filter grid-cols
```

| Opção | Significado |
| --- | --- |
| `-o, --out <arquivo>` | Arquivo de saída. Sem ela o CSS vai para o stdout. |
| `--safelist a,b,c` | Classes mantidas mesmo que nenhum arquivo as cite (para nomes montados em tempo de execução). |
| `--no-minify` | Saída legível. |
| `--css <arquivo>` | Faz o purge de outra cópia da folha de estilo. |
| `classes --json`, `--filter <texto>` | Lista todas as classes, em JSON ou filtradas. |

Na página kitchen sink do repositório, o arquivo após o purge tem cerca de 5.7 kB com brotli, contra 43 kB do build completo.

## Referência de classes por categoria

| Categoria | Classes | Exemplos |
| --- | ---: | --- |
| colors | 2.050 | `text-foreground`, `bg-primary/90`, `border-slate-200`, `ring-ring` |
| spacing | 761 | `p-4`, `px-6`, `mt-8`, `-mx-2`, `gap-3`, `space-y-4` |
| layout | 388 | `flex`, `grid`, `hidden`, `relative`, `inset-0`, `z-50`, `@container` |
| backgrounds | 301 | `bg-gradient-to-br`, `from-primary`, `to-accent`, `bg-cover` |
| sizing | 268 | `w-full`, `max-w-3xl`, `size-10`, `h-screen`, `min-h-dvh` |
| borders | 193 | `border`, `rounded-xl`, `divide-y`, `ring-2`, `outline-none` |
| transforms | 143 | `scale-95`, `rotate-3`, `-translate-y-1`, `origin-top` |
| typography | 131 | `text-lg`, `font-semibold`, `tracking-tight`, `truncate`, `text-balance` |
| grid | 111 | `grid-cols-3`, `col-span-2`, `grid-flow-row`, `auto-rows-fr` |
| flexbox | 58 | `flex-col`, `flex-1`, `shrink-0`, `basis-1/2`, `order-first` |
| interactivity | 58 | `cursor-pointer`, `select-none`, `snap-x`, `accent-primary` |
| alignment | 55 | `items-center`, `justify-between`, `place-items-center` |
| effects | 34 | `shadow-lg`, `opacity-50`, `mix-blend-multiply` |
| transitions | 29 | `transition`, `duration-200`, `ease-out` |
| filters | 24 | `blur-sm`, `backdrop-blur-md`, `grayscale` |
| accessibility | 7 | `sr-only`, `skip-link`, `focus-ring`, `touch-target` |
| animation | 5 | `animate-spin`, `animate-pulse` |

Pesquise todas com o CSS de cada uma em [kwy404.github.io/monsoon/classes.html](https://kwy404.github.io/monsoon/classes.html), ou leia [`scripts/classes.json`](https://github.com/kwy404/monsoon/blob/main/scripts/classes.json).

## Suporte a navegadores

O Monsoon mira as versões atuais de Chrome, Edge, Firefox e Safari. O tema por semente usa a sintaxe de cor relativa OKLCH (`oklch(from var(--seed) l c h)`), que exige Chrome e Edge 119 ou mais novos, Firefox 128 ou mais novo e Safari 18 ou mais novo. As variantes de container query exigem suporte a container queries, presente em todos os navegadores atuais.

**Fallback para cor relativa.** Dentro de `@supports not (color: oklch(from red l c h))`, a folha de estilo traz tokens estáticos calculados a partir da semente padrão. `primary` e `ring` usam sua `--seed` diretamente, os tokens que dependem só do esquema de cor continuam alternando entre claro e escuro, e a página continua legível.

## O que não está incluído

Uma folha de estilo pronta não conhece valores inventados na hora de escrever o HTML, então isto não faz parte do Monsoon:

- variantes empilhadas como `dark:hover:` ou `md:hover:`;
- valores arbitrários como `w-[37px]`;
- o modificador important;
- modificadores de opacidade além das cores semânticas, preto e branco (`bg-primary/90` e `bg-black/50` existem, cores da paleta com `/50` não).

Use o passo mais próximo da escala, um atributo `style` ou algumas linhas do seu próprio CSS com as variáveis do tema.

## Perguntas frequentes

### Como usar CSS utility-first sem etapa de build?

Adicione `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">` e escreva as classes no HTML. Todas as classes já estão declaradas, então nada precisa escanear seus arquivos nem gerar CSS.

### Um arquivo CSS utilitário via CDN serve para produção?

Sim. Fixe a versão e o arquivo (cerca de 43 kB brotli) fica em cache depois da primeira visita. Adicione subresource integrity se a sua política pedir, ou hospede você mesmo. Se cada kilobyte importa, rode `npx monsooncss purge` uma vez.

### Como gerar um tema a partir de uma cor em CSS?

Defina `--seed` em `:root` ou em qualquer elemento com `style="--seed: ..."`. Primário, secundário, destaque, superfícies, texto discreto, bordas e o anel de foco são derivados dela com cores relativas OKLCH.

### Como ter modo escuro com uma linha de CSS?

Ele já está ativo via `prefers-color-scheme`. Para forçar, adicione `class="dark"` ou `data-theme="dark"` no elemento html ou em qualquer seção.

### O Monsoon mantém contraste acessível para qualquer cor de marca?

Sim, para os pares de tokens semânticos. O primário sai da faixa de luminosidade insegura e o texto sobre ele troca de cor para ficar em 4.5:1 ou mais, o que os testes verificam nos dois modos.

### O Monsoon tem container queries com classes utilitárias?

Sim. Coloque `@container` em um pai e use `@xs:` a `@xl:` nos filhos, por exemplo `@md:flex-row`.

### Posso usar o Monsoon com PHP, WordPress, Django ou Rails?

Sim. Inclua a folha de estilo no layout, escreva classes nos templates e aponte o purge para as pastas de templates, como `"templates/**/*.html"` ou `"app/views/**/*.erb"`.

### O Monsoon inclui JavaScript?

Não. É uma folha de estilo. O tema e o modo escuro são calculados pelo motor de CSS.

## Guias

Os guias estão em inglês:

- [Utility-first CSS without a build step](https://kwy404.github.io/monsoon/utility-first-css-without-a-build-step.html)
- [How to load a CSS framework from a CDN](https://kwy404.github.io/monsoon/css-framework-from-a-cdn.html)
- [A no build CSS framework for real projects](https://kwy404.github.io/monsoon/no-build-css-framework.html)
- [Utility CSS from a CDN in production](https://kwy404.github.io/monsoon/utility-css-cdn-in-production.html)
- [Generate a theme from one color in CSS](https://kwy404.github.io/monsoon/generate-a-theme-from-one-color-css.html)
- [Dark mode with one line of CSS](https://kwy404.github.io/monsoon/dark-mode-with-one-line-of-css.html)
- [Container queries with utility classes](https://kwy404.github.io/monsoon/container-queries-utility-classes.html)
- [An OKLCH color palette for CSS](https://kwy404.github.io/monsoon/oklch-color-palette-css.html)
- [Accessible color contrast in CSS](https://kwy404.github.io/monsoon/accessible-color-contrast-css.html)
- [CSS utilities for PHP, WordPress, Django and Rails](https://kwy404.github.io/monsoon/css-utilities-for-php-wordpress-django-rails.html)

## Mais de kwy404

- [graphemely](https://kwy404.github.io/graphemely/): truncar, fatiar e contar strings com emoji com segurança.
- [edgegoat](https://kwy404.github.io/edgegoat/): entradas de teste para casos extremos de fuso horário, horário de verão, unicode e números.
- [vueleap](https://kwy404.github.io/vueleap/): migre de Vue 2 para Vue 3 com um comando.
- [numberparrot](https://kwy404.github.io/numberparrot/): converta números e valores monetários localizados de volta em números.
- [breakhound](https://kwy404.github.io/breakhound/): encontre bugs em qualquer biblioteca JavaScript automaticamente, sem escrever testes.
- [Voodoo.js](https://github.com/kwy404/Voodoo.js): JSX e reatividade a partir de um arquivo HTML puro, usado nas partes interativas do site do Monsoon.

## Contribuindo

Issues e pull requests são bem-vindos. O [CONTRIBUTING.md](https://github.com/kwy404/monsoon/blob/main/CONTRIBUTING.md) explica o gerador, como adicionar um utilitário e como as variantes são atribuídas. As mudanças ficam no [CHANGELOG](https://github.com/kwy404/monsoon/blob/main/CHANGELOG.md).

## Licença

[MIT](https://github.com/kwy404/monsoon/blob/main/LICENSE). Copyright 2026 Alexandre Kohler ([kwy404](https://github.com/kwy404))
