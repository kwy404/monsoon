<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot.svg" width="168" alt="Mo, o mascote do Monsoon: um panda vermelho de capa de chuva segurando um guarda-chuva colorido, a cara de um framework CSS utility-first sem etapa de build">
  </picture>
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
  <a href="https://github.com/kwy404/monsoon/blob/main/scripts/size.mjs"><img src="https://img.shields.io/badge/brotli-88%20kB-3b5bdb" alt="A folha de estilo completa, com todos os utilitários e componentes, tem cerca de 88 kB com brotli"></a>
  <a href="https://kwy404.github.io/monsoon/components.html"><img src="https://img.shields.io/badge/componentes-167-3b5bdb" alt="167 componentes CSS"></a>
</p>

<p align="center">
  <a href="https://kwy404.github.io/monsoon/">Documentação</a> &middot;
  <a href="https://kwy404.github.io/monsoon/components.html">Componentes</a> &middot;
  <a href="https://kwy404.github.io/monsoon/classes.html">Referência de classes</a> &middot;
  <a href="https://kwy404.github.io/monsoon/playground.html">Playground da semente</a> &middot;
  <a href="https://kwy404.github.io/monsoon/why.html">Por que Monsoon</a> &middot;
  <a href="https://github.com/kwy404/monsoon/blob/main/README.md">Read in English</a>
</p>

**Monsoon é um framework CSS utility-first e uma biblioteca de componentes que você usa direto de uma CDN.** Adicione uma tag `<link>` e escreva classes como `px-4`, `md:grid-cols-3`, `hover:bg-primary` ou `btn btn-primary` em HTML puro. Não há compilador nem arquivo de configuração, e a folha de estilo não precisa de JavaScript. Defina uma cor `--seed` e o Monsoon gera um tema completo e acessível com cores relativas OKLCH, incluindo modo escuro automático. Um único arquivo traz 4.923 utilitários, 10.237 classes de variante e 167 componentes, cerca de 88 kB com brotli.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
```

Quando você precisa de mais, duas peças opcionais continuam sem etapa de build: um script que dá comportamento a 45 componentes interativos (dropzone, recorte de imagem, seletor de data, tabela de dados, células de código de dois fatores e mais) e escreve valores arbitrários como `w-[37px]` e `bg-[#0ea5e9]` no navegador, e um comando de purge que compila esses valores em um arquivo estático para produção.

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/demo.svg" width="100%" alt="Demonstração animada de CSS utility-first sem build: classes do Monsoon montam um card e depois uma única cor --seed muda o tema de botões, badges e superfícies">
</p>

<table>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/no-build.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/no-build.svg" width="32" alt="Ícone sem build: framework CSS sem etapa de build"></picture><br><b>Sem etapa de build</b><br>Uma folha de estilo. Sem compilador, sem config, sem watcher.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/cdn.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/cdn.svg" width="32" alt="Ícone de nuvem: framework CSS por CDN"></picture><br><b>Direto da CDN</b><br>jsDelivr ou unpkg, ou hospede o arquivo você mesmo.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/seed-theme.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/seed-theme.svg" width="32" alt="Ícone de semente: gerar um tema a partir de uma cor em CSS"></picture><br><b>Tema a partir de uma cor</b><br><code>--seed</code> controla todas as cores semânticas, em CSS puro.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/dark-mode.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/dark-mode.svg" width="32" alt="Ícone de meia lua: modo escuro com uma linha de CSS"></picture><br><b>Modo escuro incluso</b><br>Segue o sistema, ou uma classe muda a página ou uma seção. O ancestral com tema mais próximo vence.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/accessibility.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/accessibility.svg" width="32" alt="Ícone de acessibilidade: contraste de cor acessível em CSS"></picture><br><b>Contraste acessível</b><br>O texto troca de cor para manter 4.5:1, testado para qualquer semente.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/utility-classes.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/utility-classes.svg" width="32" alt="Ícone de barras: classes utilitárias"></picture><br><b>4.923 utilitários</b><br>Layout, flex, grid, espaçamento, tipografia fluida, cor, efeitos e mais.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/variants.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/variants.svg" width="32" alt="Ícone de camadas: variantes hover, focus e responsivas"></picture><br><b>10.237 classes de variante</b><br>Estado, group, peer, dark, movimento, print, rtl e breakpoints.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/familiar-classes.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/familiar-classes.svg" width="32" alt="Ícone de pílula: componentes CSS com nomes de classe legíveis"></picture><br><b>167 componentes</b><br>Formulários, overlays, dados, mídia, dois fatores e login. 122 sem script.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/tiny-size.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/tiny-size.svg" width="32" alt="Ícone de compressão: CSS utilitário pequeno para produção"></picture><br><b>Cerca de 88 kB brotli</b><br>Todos os utilitários e componentes em uma requisição em cache.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/purge.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/purge.svg" width="32" alt="Ícone de funil: remover CSS não usado"></picture><br><b>Valores arbitrários sem build</b><br><code>w-[37px]</code> no navegador, ou compilado pela CLI de purge.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/framework-agnostic.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/framework-agnostic.svg" width="32" alt="Ícone de formas: utilitários CSS para React, Vue, Angular, PHP, WordPress, Django e Rails"></picture><br><b>Qualquer stack</b><br>17 guias de instalação, de React e Vue a Django e WordPress.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/container-queries.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/container-queries.svg" width="32" alt="Ícone de caixas: container queries com classes utilitárias"></picture><br><b>Container queries</b><br><code>@container</code> e variantes <code>@xs:</code> a <code>@xl:</code>.</td>
  </tr>
</table>

## Sumário

- [Começo rápido](#começo-rápido)
- [Por que Monsoon](#por-que-monsoon)
- [Instalar com npm, pnpm, yarn ou bun](#instalar-com-npm-pnpm-yarn-ou-bun)
- [Usar com React, Vue, Angular e mais](#usar-com-react-vue-angular-e-mais)
- [Componentes](#componentes)
- [Camada interativa](#camada-interativa)
- [Valores arbitrários](#valores-arbitrários)
- [Componentes de dois fatores e login](#componentes-de-dois-fatores-e-login)
- [Gerar um tema a partir de uma cor](#gerar-um-tema-a-partir-de-uma-cor)
- [Modo escuro com uma linha de CSS](#modo-escuro-com-uma-linha-de-css)
- [Variantes e container queries](#variantes-e-container-queries)
- [Tipografia e espaçamento fluidos](#tipografia-e-espaçamento-fluidos)
- [CLI de purge: envie só as classes que você usa](#cli-de-purge-envie-só-as-classes-que-você-usa)
- [Referência de classes por categoria](#referência-de-classes-por-categoria)
- [Vitrine](#vitrine)
- [Suporte a navegadores](#suporte-a-navegadores)
- [O que não está incluído](#o-que-não-está-incluído)
- [Perguntas frequentes](#perguntas-frequentes)
- [Guias](#guias)
- [Mais de kwy404](#mais-de-kwy404)
- [Autor](#autor)
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
    <div class="card">
      <div class="card-body space-y-4">
        <h1 class="text-2xl font-bold">Olá, Monsoon</h1>
        <p class="text-muted-foreground">Uma folha de estilo. Nenhuma etapa de build.</p>
        <button class="btn btn-primary">Começar</button>
      </div>
    </div>
  </main>
</body>
</html>
```

Em produção, fixe a versão para que os arquivos nunca mudem sem você saber:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.min.css">
<!-- opcional: componentes interativos e valores arbitrários -->
<script src="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.js" defer></script>
```

`https://unpkg.com/monsooncss` entrega a mesma folha de estilo.

## Por que Monsoon

Vinte coisas que o Monsoon faz e que você teria que montar sozinho. Cada uma tem uma demonstração ao vivo na [página Why Monsoon](https://kwy404.github.io/monsoon/why.html) (em inglês).

1. [**Zero build em produção, direto da CDN.**](https://kwy404.github.io/monsoon/why.html#reason-1) Um link de folha de estilo é toda a instalação.
2. [**Valores arbitrários sem etapa de build.**](https://kwy404.github.io/monsoon/why.html#reason-2) `w-[37px]` e `bg-[#0ea5e9]` com um script pequeno, ou compilados pela CLI de purge.
3. [**Um tema inteiro a partir de uma cor `--seed`.**](https://kwy404.github.io/monsoon/why.html#reason-3) Primário, destaque, superfícies, bordas e anel de foco em CSS puro.
4. [**Contraste acessível, testado em cada par de tokens.**](https://kwy404.github.io/monsoon/why.html#reason-4) Pelo menos 4.5:1 para qualquer semente, no claro e no escuro.
5. [**Tema por seção com `style="--seed"`.**](https://kwy404.github.io/monsoon/why.html#reason-5) Só aquela subárvore muda de tema.
6. [**Modo escuro que segue o ancestral com tema mais próximo.**](https://kwy404.github.io/monsoon/why.html#reason-6) Claro dentro de escuro dentro de claro, em qualquer profundidade.
7. [**167 componentes no mesmo arquivo.**](https://kwy404.github.io/monsoon/why.html#reason-7) Formulários, ações, navegação, overlays, dados, mídia e autenticação.
8. [**Componentes que não precisam de JavaScript.**](https://kwy404.github.io/monsoon/why.html#reason-8) Diálogos, popovers, menus e acordeões em HTML nativo.
9. [**Uma camada interativa opcional.**](https://kwy404.github.io/monsoon/why.html#reason-9) Soltar arquivos, recortar imagens, seletores de data, listas ordenáveis e comboboxes sobre inputs nativos.
10. [**Variantes de container query incluídas.**](https://kwy404.github.io/monsoon/why.html#reason-10) `@sm:` a `@xl:` reagem à largura do contêiner.
11. [**Utilitários fluidos de tipografia e espaçamento.**](https://kwy404.github.io/monsoon/why.html#reason-11) `text-fluid-*` e `p-fluid-*` crescem com a viewport.
12. [**Variantes print, rtl, ltr e forced-colors.**](https://kwy404.github.io/monsoon/why.html#reason-12) Um prefixo cada.
13. [**Purge sem config que compila valores arbitrários.**](https://kwy404.github.io/monsoon/why.html#reason-13) Um comando, nenhum arquivo de configuração.
14. [**Funciona com qualquer backend ou framework.**](https://kwy404.github.io/monsoon/why.html#reason-14) Classes simples, com 17 guias de instalação.
15. [**Uma escala de tokens para todos os controles.**](https://kwy404.github.io/monsoon/why.html#reason-15) Inputs, selects e botões do mesmo tamanho ficam alinhados.
16. [**Uma paleta OKLCH dentro do gamut.**](https://kwy404.github.io/monsoon/why.html#reason-16) 22 matizes na mesma curva de luminosidade, limitados ao sRGB.
17. [**Acessível por padrão.**](https://kwy404.github.io/monsoon/why.html#reason-17) Anel de foco visível, movimento reduzido e suporte a forced colors.
18. [**Utilitários sempre sobrescrevem componentes.**](https://kwy404.github.io/monsoon/why.html#reason-18) Sem `!important`, sem briga de especificidade.
19. [**Um arquivo em cache para todas as páginas e projetos.**](https://kwy404.github.io/monsoon/why.html#reason-19) A mesma URL é compartilhada entre sites.
20. [**Um índice de classes legível por máquina.**](https://kwy404.github.io/monsoon/why.html#reason-20) O [`classes.json`](https://github.com/kwy404/monsoon/blob/main/scripts/classes.json) lista cada classe com seu CSS e suas variantes.

## Instalar com npm, pnpm, yarn ou bun

```bash
npm install monsooncss
pnpm add monsooncss
yarn add monsooncss
bun add monsooncss
```

Importe como seu bundler importa CSS, ou copie o arquivo para a pasta pública:

```bash
cp node_modules/monsooncss/dist/monsoon.min.css public/monsoon.css
```

| Import | Arquivo | O que é |
| --- | --- | --- |
| `monsooncss` | `dist/monsoon.min.css` | A folha de estilo: utilitários, componentes e tema (export padrão). |
| `monsooncss/css` | `dist/monsoon.css` | A mesma folha de estilo, legível. |
| `monsooncss/js` | `dist/monsoon.esm.js` | A camada interativa como módulo ES. Chame `start()` uma vez. |
| `monsooncss/js/browser` | `dist/monsoon.js` | A camada interativa e o motor de valores arbitrários, inicia sozinho (global `Monsoon`). |
| `monsooncss/js/arbitrary` | `dist/monsoon-arbitrary.js` | Só o motor de valores arbitrários (global `MonsoonArbitrary`). |
| `monsooncss/arbitrary` | `src/arbitrary/index.mjs` | O parser de valores arbitrários, para ferramentas. |

## Usar com React, Vue, Angular e mais

O Monsoon é feito de classes CSS simples, então todo framework o usa do mesmo jeito: carregue a folha de estilo uma vez e escreva classes nos templates. Importe `'monsooncss'` (ele aponta para o arquivo minificado pelos `exports` do pacote), não um caminho dentro de `dist/`.

**React com Vite** (`src/main.jsx`):

```jsx
import 'monsooncss';
import './index.css';
```

**Next.js** (`app/layout.tsx`, o layout raiz):

```tsx
import 'monsooncss';
import './globals.css';
```

**Vue 3 com Vite** (`src/main.js`):

```js
import { createApp } from 'vue';
import 'monsooncss';
import App from './App.vue';

createApp(App).mount('#app');
```

**Nuxt** (`nuxt.config.ts`):

```ts
export default defineNuxtConfig({
  css: ['monsooncss'],
});
```

**Angular** (`angular.json`, ou `@import 'monsooncss';` no topo de `src/styles.css`):

```json
"styles": [
  "node_modules/monsooncss/dist/monsoon.min.css",
  "src/styles.css"
]
```

**Svelte com Vite** (`src/main.js`):

```js
import 'monsooncss';
import './app.css';
```

Para a camada interativa, chame `start()` de `monsooncss/js` uma vez no navegador, ou adicione a tag de script da CDN. Ela observa o documento, então componentes que o framework renderiza depois são aprimorados sozinhos e limpos quando removidos.

Há 17 guias de instalação passo a passo (em inglês): [HTML](https://kwy404.github.io/monsoon/docs/install-html.html), [React](https://kwy404.github.io/monsoon/docs/install-react.html), [Next.js](https://kwy404.github.io/monsoon/docs/install-nextjs.html), [Vue](https://kwy404.github.io/monsoon/docs/install-vue.html), [Nuxt](https://kwy404.github.io/monsoon/docs/install-nuxt.html), [Angular](https://kwy404.github.io/monsoon/docs/install-angular.html), [Svelte](https://kwy404.github.io/monsoon/docs/install-svelte.html), [SvelteKit](https://kwy404.github.io/monsoon/docs/install-sveltekit.html), [Astro](https://kwy404.github.io/monsoon/docs/install-astro.html), [Solid](https://kwy404.github.io/monsoon/docs/install-solid.html), [Remix](https://kwy404.github.io/monsoon/docs/install-remix.html), [Laravel](https://kwy404.github.io/monsoon/docs/install-laravel.html), [Django](https://kwy404.github.io/monsoon/docs/install-django.html), [Rails](https://kwy404.github.io/monsoon/docs/install-rails.html), [WordPress](https://kwy404.github.io/monsoon/docs/install-wordpress.html), [PHP](https://kwy404.github.io/monsoon/docs/install-php.html) e [Electron](https://kwy404.github.io/monsoon/docs/install-electron.html).

## Componentes

167 componentes vêm na mesma folha de estilo dos utilitários, com 1.142 classes de componente. Eles são feitos sobre HTML nativo (`<dialog>`, o atributo `popover`, `<details>`, `:has()`, `:user-invalid`), usam só tokens do tema, então seguem a `--seed` e o modo escuro, e compartilham uma escala de tamanhos de `-xs` a `-xl`. Os componentes vêm antes dos utilitários no arquivo, então `class="btn rounded-full"` simplesmente funciona.

```html
<button class="btn btn-primary">Salvar</button>
<button class="btn btn-outline btn-sm">Cancelar</button>
<span class="badge badge-success">Ativo</span>
<input type="email" class="input" placeholder="voce@exemplo.com" aria-label="E-mail">
```

| Grupo | Componentes | Classes | Destaques |
| --- | ---: | ---: | --- |
| Formulários | 26 | 165 | input, select, checkbox, toggle, range, código de uso único, label flutuante, campo de senha, radio card |
| Ações e feedback | 26 | 284 | botão, grupo de botões, botão de copiar, controle segmentado, alerta, toast, badge, progresso, skeleton, tooltip |
| Navegação e sobreposições | 26 | 187 | drawer, modal, sheet, popover, dropdown, paleta de comandos, navbar, mega menu, abas, paginação, etapas |
| Exibição de dados e layout | 38 | 187 | card, avatar, tabela, linha do tempo, estatísticas, acordeão, carrossel, preços, chat, mockups, prose, primitivos de layout |
| Mídia e arquivos | 10 | 78 | dropzone, recorte de imagem, upload de avatar, visualizador de imagens, galeria, comparação antes e depois, assinatura |
| Interativos | 24 | 153 | seletor de data, combobox, input de tags, lista ordenável, kanban, seletor de cor, tabela de dados, árvore, painéis divididos |
| Dois fatores e login | 17 | 126 | código de verificação, configuração de autenticador, QR code, códigos de recuperação, passkey, telefone, layouts de login |

Veja todos os componentes com prévia ao vivo no claro e no escuro e HTML para copiar em [kwy404.github.io/monsoon/components.html](https://kwy404.github.io/monsoon/components.html). As listas abaixo marcam os que precisam da [camada interativa](#camada-interativa).

<details>
<summary><b>Formulários: 26 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Input](https://kwy404.github.io/monsoon/components/input.html) | `.input` |  |
| [Date and time](https://kwy404.github.io/monsoon/components/date-time.html) | `.input` |  |
| [Textarea](https://kwy404.github.io/monsoon/components/textarea.html) | `.textarea` |  |
| [Select](https://kwy404.github.io/monsoon/components/select.html) | `.select` |  |
| [Multiple select](https://kwy404.github.io/monsoon/components/select-multiple.html) | `.select` |  |
| [Custom select](https://kwy404.github.io/monsoon/components/select-custom.html) | `.select-custom` |  |
| [Checkbox](https://kwy404.github.io/monsoon/components/checkbox.html) | `.checkbox` |  |
| [Radio](https://kwy404.github.io/monsoon/components/radio.html) | `.radio` |  |
| [Toggle](https://kwy404.github.io/monsoon/components/toggle.html) | `.toggle` |  |
| [Range](https://kwy404.github.io/monsoon/components/range.html) | `.range` |  |
| [File input](https://kwy404.github.io/monsoon/components/file-input.html) | `.file-input` |  |
| [Color input](https://kwy404.github.io/monsoon/components/color-input.html) | `.color-input` |  |
| [Rating](https://kwy404.github.io/monsoon/components/rating.html) | `.rating` |  |
| [One time code](https://kwy404.github.io/monsoon/components/otp.html) | `.otp` |  |
| [Field](https://kwy404.github.io/monsoon/components/field.html) | `.field` |  |
| [Fieldset](https://kwy404.github.io/monsoon/components/fieldset.html) | `.fieldset` |  |
| [Form layout](https://kwy404.github.io/monsoon/components/form-layout.html) | `.form` |  |
| [Form control](https://kwy404.github.io/monsoon/components/form-control.html) | `.form-control` |  |
| [Input group](https://kwy404.github.io/monsoon/components/input-group.html) | `.input-group` |  |
| [Floating label](https://kwy404.github.io/monsoon/components/floating-label.html) | `.floating-label` |  |
| [Search field](https://kwy404.github.io/monsoon/components/search-field.html) | `.search-field` |  |
| [Password field](https://kwy404.github.io/monsoon/components/password-field.html) | `.password-field` |  |
| [Checkbox card](https://kwy404.github.io/monsoon/components/checkbox-card.html) | `.checkbox-card` |  |
| [Radio card](https://kwy404.github.io/monsoon/components/radio-card.html) | `.radio-card` |  |
| [Switch group](https://kwy404.github.io/monsoon/components/switch-group.html) | `.switch-group` |  |
| [Input counter](https://kwy404.github.io/monsoon/components/input-counter.html) | `.input-counter` |  |

</details>

<details>
<summary><b>Ações e feedback: 26 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Button](https://kwy404.github.io/monsoon/components/button.html) | `.btn` |  |
| [Button shapes](https://kwy404.github.io/monsoon/components/button-shapes.html) | `.btn-square` |  |
| [Button group](https://kwy404.github.io/monsoon/components/button-group.html) | `.btn-group` |  |
| [Floating action button](https://kwy404.github.io/monsoon/components/fab.html) | `.fab` |  |
| [Copy button](https://kwy404.github.io/monsoon/components/copy-button.html) | `.copy-btn` |  |
| [Segmented control](https://kwy404.github.io/monsoon/components/segmented.html) | `.segmented` |  |
| [Toggle group](https://kwy404.github.io/monsoon/components/toggle-group.html) | `.toggle-group` |  |
| [Swap](https://kwy404.github.io/monsoon/components/swap.html) | `.swap` |  |
| [Alert](https://kwy404.github.io/monsoon/components/alert.html) | `.alert` |  |
| [Callout](https://kwy404.github.io/monsoon/components/callout.html) | `.callout` |  |
| [Banner](https://kwy404.github.io/monsoon/components/banner.html) | `.banner` |  |
| [Toast](https://kwy404.github.io/monsoon/components/toast.html) | `.toast` |  |
| [Badge](https://kwy404.github.io/monsoon/components/badge.html) | `.badge` |  |
| [Chip](https://kwy404.github.io/monsoon/components/chip.html) | `.chip` |  |
| [Tag](https://kwy404.github.io/monsoon/components/tag.html) | `.tag` |  |
| [Keyboard key](https://kwy404.github.io/monsoon/components/kbd.html) | `.kbd` |  |
| [Spinner](https://kwy404.github.io/monsoon/components/spinner.html) | `.spinner` |  |
| [Progress](https://kwy404.github.io/monsoon/components/progress.html) | `.progress` |  |
| [Radial progress](https://kwy404.github.io/monsoon/components/radial-progress.html) | `.radial-progress` |  |
| [Meter](https://kwy404.github.io/monsoon/components/meter.html) | `.meter` |  |
| [Skeleton](https://kwy404.github.io/monsoon/components/skeleton.html) | `.skeleton` |  |
| [Tooltip](https://kwy404.github.io/monsoon/components/tooltip.html) | `.tooltip` |  |
| [Indicator](https://kwy404.github.io/monsoon/components/indicator.html) | `.indicator` |  |
| [Status](https://kwy404.github.io/monsoon/components/status.html) | `.status` |  |
| [Empty state](https://kwy404.github.io/monsoon/components/empty-state.html) | `.empty-state` |  |
| [Notification](https://kwy404.github.io/monsoon/components/notification.html) | `.notification` |  |

</details>

<details>
<summary><b>Navegação e sobreposições: 26 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Drawer](https://kwy404.github.io/monsoon/components/drawer.html) | `.drawer` |  |
| [Drawer dialog](https://kwy404.github.io/monsoon/components/drawer-dialog.html) | `.drawer-dialog` |  |
| [Responsive drawer](https://kwy404.github.io/monsoon/components/drawer-responsive.html) | `.drawer-open-lg` |  |
| [Modal](https://kwy404.github.io/monsoon/components/modal.html) | `.modal` |  |
| [Sheet](https://kwy404.github.io/monsoon/components/sheet.html) | `.sheet` |  |
| [Popover](https://kwy404.github.io/monsoon/components/popover.html) | `.popover` |  |
| [Dropdown](https://kwy404.github.io/monsoon/components/dropdown.html) | `.dropdown` |  |
| [Menu](https://kwy404.github.io/monsoon/components/menu.html) | `.menu` |  |
| [Context menu](https://kwy404.github.io/monsoon/components/context-menu.html) | `.context-menu` |  |
| [Command palette](https://kwy404.github.io/monsoon/components/command-palette.html) | `.command-palette` |  |
| [Lightbox](https://kwy404.github.io/monsoon/components/lightbox.html) | `.lightbox` |  |
| [Navbar](https://kwy404.github.io/monsoon/components/navbar.html) | `.navbar` |  |
| [Mega menu](https://kwy404.github.io/monsoon/components/mega-menu.html) | `.mega-menu` |  |
| [Sidebar](https://kwy404.github.io/monsoon/components/sidebar.html) | `.sidebar` |  |
| [Tabs](https://kwy404.github.io/monsoon/components/tabs.html) | `.tabs` |  |
| [Breadcrumbs](https://kwy404.github.io/monsoon/components/breadcrumbs.html) | `.breadcrumbs` |  |
| [Pagination](https://kwy404.github.io/monsoon/components/pagination.html) | `.pagination` |  |
| [Steps](https://kwy404.github.io/monsoon/components/steps.html) | `.steps` |  |
| [Stepper](https://kwy404.github.io/monsoon/components/stepper.html) | `.stepper` |  |
| [Dock](https://kwy404.github.io/monsoon/components/dock.html) | `.dock` |  |
| [Link](https://kwy404.github.io/monsoon/components/link.html) | `.link` |  |
| [Table of contents](https://kwy404.github.io/monsoon/components/toc.html) | `.toc` |  |
| [Scroll spy](https://kwy404.github.io/monsoon/components/scroll-spy.html) | `.scroll-spy` |  |
| [Back to top](https://kwy404.github.io/monsoon/components/back-to-top.html) | `.back-to-top` |  |
| [Skip link](https://kwy404.github.io/monsoon/components/skip-link.html) | `.skip-link` |  |
| [Footer](https://kwy404.github.io/monsoon/components/footer.html) | `.footer` |  |

</details>

<details>
<summary><b>Exibição de dados e layout: 38 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Card](https://kwy404.github.io/monsoon/components/card.html) | `.card` |  |
| [Card overlay](https://kwy404.github.io/monsoon/components/card-overlay.html) | `.card-overlay` |  |
| [Card side](https://kwy404.github.io/monsoon/components/card-side.html) | `.card-side` |  |
| [Avatar](https://kwy404.github.io/monsoon/components/avatar.html) | `.avatar` |  |
| [Avatar group](https://kwy404.github.io/monsoon/components/avatar-group.html) | `.avatar-group` |  |
| [List](https://kwy404.github.io/monsoon/components/list.html) | `.list` |  |
| [Table](https://kwy404.github.io/monsoon/components/table.html) | `.table` |  |
| [Timeline](https://kwy404.github.io/monsoon/components/timeline.html) | `.timeline` |  |
| [Stats](https://kwy404.github.io/monsoon/components/stats.html) | `.stats` |  |
| [Collapse](https://kwy404.github.io/monsoon/components/collapse.html) | `.collapse` |  |
| [Accordion](https://kwy404.github.io/monsoon/components/accordion.html) | `.accordion` |  |
| [Carousel](https://kwy404.github.io/monsoon/components/carousel.html) | `.carousel` |  |
| [Rating display](https://kwy404.github.io/monsoon/components/rating-display.html) | `.rating-display` |  |
| [Divider](https://kwy404.github.io/monsoon/components/divider.html) | `.divider` |  |
| [Hero](https://kwy404.github.io/monsoon/components/hero.html) | `.hero` |  |
| [Feature grid](https://kwy404.github.io/monsoon/components/feature-grid.html) | `.feature-grid` |  |
| [Pricing](https://kwy404.github.io/monsoon/components/pricing.html) | `.pricing` |  |
| [Testimonial](https://kwy404.github.io/monsoon/components/testimonial.html) | `.testimonial` |  |
| [Chat](https://kwy404.github.io/monsoon/components/chat.html) | `.chat` |  |
| [Mockup browser](https://kwy404.github.io/monsoon/components/mockup-browser.html) | `.mockup-browser` |  |
| [Mockup window](https://kwy404.github.io/monsoon/components/mockup-window.html) | `.mockup-window` |  |
| [Mockup phone](https://kwy404.github.io/monsoon/components/mockup-phone.html) | `.mockup-phone` |  |
| [Mockup code](https://kwy404.github.io/monsoon/components/mockup-code.html) | `.mockup-code` |  |
| [Code block](https://kwy404.github.io/monsoon/components/code-block.html) | `.code-block` |  |
| [Countdown](https://kwy404.github.io/monsoon/components/countdown.html) | `.countdown` |  |
| [Diff](https://kwy404.github.io/monsoon/components/diff.html) | `.diff` |  |
| [Masonry](https://kwy404.github.io/monsoon/components/masonry.html) | `.masonry` |  |
| [Mask](https://kwy404.github.io/monsoon/components/mask.html) | `.mask` |  |
| [Blockquote](https://kwy404.github.io/monsoon/components/blockquote.html) | `.blockquote` |  |
| [Prose](https://kwy404.github.io/monsoon/components/prose.html) | `.prose` |  |
| [Stack](https://kwy404.github.io/monsoon/components/stack.html) | `.stack` |  |
| [Artboard](https://kwy404.github.io/monsoon/components/artboard.html) | `.artboard` |  |
| [Container narrow](https://kwy404.github.io/monsoon/components/container-narrow.html) | `.container-narrow` |  |
| [Section](https://kwy404.github.io/monsoon/components/section.html) | `.section` |  |
| [Grid auto](https://kwy404.github.io/monsoon/components/grid-auto.html) | `.grid-auto` |  |
| [Center](https://kwy404.github.io/monsoon/components/center.html) | `.center` |  |
| [Cluster](https://kwy404.github.io/monsoon/components/cluster.html) | `.cluster` |  |
| [Sidebar layout](https://kwy404.github.io/monsoon/components/sidebar-layout.html) | `.sidebar-layout` |  |

</details>

<details>
<summary><b>Mídia e arquivos: 10 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Dropzone](https://kwy404.github.io/monsoon/components/dropzone.html) | `.dropzone` | sim |
| [Dropzone compact](https://kwy404.github.io/monsoon/components/dropzone-compact.html) | `.dropzone-compact` | sim |
| [Image cropper](https://kwy404.github.io/monsoon/components/cropper.html) | `.cropper` | sim |
| [Avatar upload](https://kwy404.github.io/monsoon/components/avatar-upload.html) | `.avatar-upload` | sim |
| [Image viewer](https://kwy404.github.io/monsoon/components/image-viewer.html) | `.viewer` | sim |
| [Media gallery](https://kwy404.github.io/monsoon/components/media-gallery.html) | `.gallery` | sim |
| [Media gallery masonry](https://kwy404.github.io/monsoon/components/media-gallery-masonry.html) | `.gallery-masonry` | sim |
| [Before and after compare](https://kwy404.github.io/monsoon/components/compare.html) | `.compare` | sim |
| [Compare vertical](https://kwy404.github.io/monsoon/components/compare-vertical.html) | `.compare-vertical` | sim |
| [Signature pad](https://kwy404.github.io/monsoon/components/signature.html) | `.signature` | sim |

</details>

<details>
<summary><b>Interativos: 24 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Date picker](https://kwy404.github.io/monsoon/components/datepicker.html) | `.datepicker` | sim |
| [Date range picker](https://kwy404.github.io/monsoon/components/datepicker-range.html) | `.datepicker` | sim |
| [Combobox](https://kwy404.github.io/monsoon/components/combobox.html) | `.combobox` | sim |
| [Multi select combobox](https://kwy404.github.io/monsoon/components/combobox-multiple.html) | `.combobox` | sim |
| [Select (custom)](https://kwy404.github.io/monsoon/components/select-menu.html) | `.select-menu` | sim |
| [Tags input](https://kwy404.github.io/monsoon/components/tags-input.html) | `.tags-input` | sim |
| [Sortable list](https://kwy404.github.io/monsoon/components/sortable.html) | `.sortable` | sim |
| [Kanban board](https://kwy404.github.io/monsoon/components/kanban.html) | `.kanban` | sim |
| [Dual range slider](https://kwy404.github.io/monsoon/components/range-dual.html) | `.range-dual` | sim |
| [Color picker](https://kwy404.github.io/monsoon/components/color-picker.html) | `.color-picker` | sim |
| [Data table](https://kwy404.github.io/monsoon/components/data-table.html) | `.data-table` | sim |
| [Tree view](https://kwy404.github.io/monsoon/components/tree.html) | `.tree` | sim |
| [Tree with checkboxes](https://kwy404.github.io/monsoon/components/tree-checkbox.html) | `.tree` | sim |
| [Split panes](https://kwy404.github.io/monsoon/components/splitter.html) | `.splitter` | sim |
| [Toast manager](https://kwy404.github.io/monsoon/components/toast-manager.html) | `.toast` | sim |
| [Password strength](https://kwy404.github.io/monsoon/components/password-strength.html) | `.password-field` | sim |
| [Number counter](https://kwy404.github.io/monsoon/components/number-counter.html) | `.input-counter` | sim |
| [Textarea autosize](https://kwy404.github.io/monsoon/components/textarea-autosize.html) | `.textarea` | sim |
| [Command search](https://kwy404.github.io/monsoon/components/command-search.html) | `.command-palette` | sim |
| [Infinite scroll](https://kwy404.github.io/monsoon/components/infinite-scroll.html) | `.infinite-scroll` | sim |
| [Countdown timer](https://kwy404.github.io/monsoon/components/countdown-timer.html) | `.countdown` | sim |
| [Paste an image](https://kwy404.github.io/monsoon/components/clipboard-image.html) | `.paste-zone` | sim |
| [Rating input](https://kwy404.github.io/monsoon/components/rating-input.html) | `.rating-input` | sim |
| [Autoplay carousel](https://kwy404.github.io/monsoon/components/carousel-autoplay.html) | `.carousel-auto` | sim |

</details>

<details>
<summary><b>Dois fatores e login: 17 componentes</b></summary>

| Componente | Classe base | monsoon.js |
| --- | --- | :---: |
| [Verification code](https://kwy404.github.io/monsoon/components/otp-cells.html) | `.otp` | sim |
| [Authenticator app setup](https://kwy404.github.io/monsoon/components/authenticator-setup.html) | `.auth-card` | sim |
| [QR code](https://kwy404.github.io/monsoon/components/qr-code.html) | `.qr` | sim |
| [Recovery codes](https://kwy404.github.io/monsoon/components/recovery-codes.html) | `.backup-codes` | sim |
| [Method picker](https://kwy404.github.io/monsoon/components/method-picker.html) | `.auth-methods` |  |
| [Verify screen](https://kwy404.github.io/monsoon/components/verify-code.html) | `.auth-card` | sim |
| [Push approval](https://kwy404.github.io/monsoon/components/push-approval.html) | `.auth-push` |  |
| [Security key and passkey](https://kwy404.github.io/monsoon/components/security-key.html) | `.auth-key` |  |
| [Phone number](https://kwy404.github.io/monsoon/components/phone-input.html) | `.phone-input` | sim |
| [Two factor status](https://kwy404.github.io/monsoon/components/two-factor-status.html) | `.auth-status` |  |
| [Sign in progress](https://kwy404.github.io/monsoon/components/sign-in-steps.html) | `.auth-flow` |  |
| [Magic link sent](https://kwy404.github.io/monsoon/components/magic-link.html) | `.auth-mail-visual` | sim |
| [Trusted devices](https://kwy404.github.io/monsoon/components/trusted-devices.html) | `.auth-devices` |  |
| [New password](https://kwy404.github.io/monsoon/components/new-password.html) | `.auth-strength` | sim |
| [Sign in, centered](https://kwy404.github.io/monsoon/components/sign-in-centered.html) | `.auth-layout` | sim |
| [Sign in, split](https://kwy404.github.io/monsoon/components/sign-in-split.html) | `.auth-split` | sim |
| [Sign in, compact](https://kwy404.github.io/monsoon/components/sign-in-compact.html) | `.auth-card-compact` | sim |

</details>

## Camada interativa

Quase todo componente é CSS sobre HTML nativo. Alguns não podem ser concluídos só com CSS, como soltar arquivos, recortar uma imagem ou reordenar uma lista. O `monsoon.js` é o script opcional para esses casos: 35 comportamentos, cerca de 54 kB com brotli, que aprimoram elementos com atributos `data-m-*`. Ele também inclui o motor de [valores arbitrários](#valores-arbitrários). Sem o script, esses componentes continuam com todo o estilo e voltam aos controles nativos.

**Pela CDN.** Ele define um global `Monsoon` e inicia sozinho:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
<script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon.js" defer></script>
```

**Pelo npm.** Importe o módulo ES e chame `start()` uma vez:

```js
import 'monsooncss';
import { start } from 'monsooncss/js';

start();
```

**Atributos data.** `data-m-<nome>` liga um comportamento e `data-m-<nome>-<opção>` define suas opções. O HTML continua declarativo, então funciona em qualquer linguagem de template. Elementos adicionados depois são aprimorados automaticamente por um `MutationObserver`, e a limpeza roda quando eles são removidos.

```html
<button class="btn" data-m-copy="npm i monsooncss">Copiar</button>
<div class="datepicker" data-m-datepicker><input type="date" class="input"></div>
<div class="qr" data-m-qr data-m-qr-value="https://example.com"></div>
```

**Eventos.** Os componentes informam o que aconteceu com eventos DOM que sobem na árvore e podem ser cancelados, chamados `monsoon:<evento>`, como `monsoon:dropzone-change`, `monsoon:crop`, `monsoon:otp-complete`, `monsoon:table-sort`, `monsoon:tag-add` e `monsoon:sort`. Escute no elemento ou em qualquer ancestral.

**API.** `start()`, `enhance(root?, names?)`, `destroy(root)`, `define(name, setup)` para seus próprios comportamentos, `emit(el, name, detail)` e `components()`. Componentes com estado expõem no global uma função que recebe um elemento ou um seletor, como `Monsoon.dropzone(el)`, `Monsoon.cropper('#foto')` ou `Monsoon.datepicker(el)`. As funções de mídia (`dropzone`, `cropper`, `imageViewer`, `mediaGallery` e outras) também são exports nomeados de `monsooncss/js`.

**Dropzone com seu próprio upload.** Arrastar e soltar, colar, validação, prévias, progresso, nova tentativa e reordenação, enquanto o input nativo fica sincronizado para que um envio normal de formulário ainda mande os arquivos. Cancele `monsoon:dropzone-upload` para enviar cada arquivo você mesmo:

```html
<div class="dropzone" data-m-dropzone data-m-dropzone-max-size="10mb" data-m-dropzone-max-files="8">
  <label class="dropzone-area">
    <input type="file" name="anexos" multiple accept="image/*,.pdf">
    <span class="grid gap-1">
      <span class="dropzone-title">Solte arquivos aqui ou <span class="dropzone-browse">procure</span></span>
      <span class="dropzone-hint">Imagens e PDF de até 10 MB, no máximo 8 arquivos.</span>
    </span>
  </label>
</div>

<script>
  document.addEventListener('monsoon:dropzone-upload', async (event) => {
    event.preventDefault(); // esta página envia o arquivo
    const { file, done, error } = event.detail;
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await fetch('/upload', { method: 'POST', body });
      if (res.ok) done(await res.json());
      else error(`Falha no upload: ${res.status}`);
    } catch (e) {
      error(e.message);
    }
  });
</script>
```

**Recorte de imagem.** Mova e redimensione a área de recorte com as alças ou o teclado, escolha uma proporção, aplique zoom, gire e espelhe, e exporte um canvas, Blob, data URL ou File:

```html
<div class="cropper" id="foto" data-m-cropper data-m-cropper-aspect="1:1">
  <img src="/foto.jpg" alt="Foto de perfil">
</div>
<button class="btn btn-primary" id="salvar">Salvar</button>

<script>
  document.querySelector('#foto').addEventListener('monsoon:crop', (event) => {
    console.log(event.detail); // { x, y, width, height, rotate, flipX, flipY, zoom }
  });
  document.querySelector('#salvar').addEventListener('click', async () => {
    const file = await Monsoon.cropper('#foto').toFile('avatar.webp', 'image/webp', 0.9);
    // envie o arquivo com fetch, ou coloque de volta em um formulário
  });
</script>
```

Leia mais na [página da camada interativa](https://kwy404.github.io/monsoon/docs/interactive-layer.html) (em inglês).

## Valores arbitrários

Quando a escala não tem um passo que sirva, escreva o próprio valor. O Monsoon aceita valores arbitrários sem etapa de build.

```html
<div class="grid grid-cols-[200px_1fr] gap-3">
  <aside class="w-[37px] rounded-[14px] bg-[#0ea5e9]"></aside>
  <main class="h-[calc(100vh-4rem)] bg-[oklch(0.72_0.16_150)] text-[13px] font-[650]">...</main>
</div>
<p class="hover:bg-[#0369a1] md:w-[37rem] dark:text-[#eee] before:content-['#']">...</p>
```

| Você escreve | Você recebe |
| --- | --- |
| `w-[37px]` | `width: 37px` |
| `p-[3px_7px]` | `padding: 3px 7px` (sublinhado é espaço, `\_` é um sublinhado) |
| `h-[calc(100vh-4rem)]` | `height: calc(100vh - 4rem)` |
| `bg-(--brand)` | `background-color: var(--brand)` |
| `[mask-type:luminance]` | `mask-type: luminance` (qualquer propriedade) |
| `bg-[red]/50` | a cor com 50% de opacidade |
| `-mt-[3px]` | `margin-top: -3px` |
| `text-[length:var(--size)]` | `font-size: var(--size)` (uma dica de tipo para valores ambíguos) |

Todas as variantes funcionam com eles e podem ser empilhadas (`md:hover:underline-offset-[6px]`), além de `before:`, `after:`, `placeholder:`, `selection:`, `file:` e outras.

**Em tempo de execução ou compilado.** Os dois modos usam o mesmo parser, então uma classe significa a mesma coisa em desenvolvimento e em produção.

- **Em tempo de execução:** carregue `dist/monsoon.js`, ou só o motor com `dist/monsoon-arbitrary.js` (cerca de 6 kB brotli). Ele lê os atributos class ao carregar e observa novos elementos e mudanças de classe, compila cada classe nova uma vez e escreve as regras em uma folha de estilo construída, na ordem da folha estática. Classes sem colchetes não custam nada.
- **Compilado:** `npx monsooncss purge "src/**/*.{html,jsx,vue,php}" -o public/monsoon.css` encontra cada classe arbitrária nos seus arquivos e escreve regras estáticas para ela, então a produção não precisa de script.

```html
<script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon-arbitrary.js" defer></script>
```

**Segurança.** Atributos class podem vir de conteúdo de usuários, então um valor é ignorado, e nada é escrito, quando contém `;`, `{`, `}`, `@`, `!`, `<` ou `>`, um escape com barra invertida que não seja `\_`, um comentário, um caractere de controle, `expression(` ou `javascript:`, tem colchetes ou aspas desbalanceados, ou passa de 300 caracteres. Os seletores são escapados como `CSS.escape`, e os testes alimentam o parser com uma lista de tentativas de injeção.

**Nomes de cor sem passo.** Cada matiz da paleta também funciona sem passo, como classes estáticas sem script: `bg-red`, `text-blue`, `border-emerald`, `ring-violet`, `from-sky`. Elas usam o passo 500 no modo claro e o 400 no escuro.

Veja a sintaxe completa e todos os prefixos aceitos na [página de valores arbitrários](https://kwy404.github.io/monsoon/docs/arbitrary-values.html) (em inglês).

## Componentes de dois fatores e login

Um grupo de 17 componentes para telas de autenticação, no claro e no escuro, com suporte a movimento reduzido e forced colors: células de código de verificação, configuração de app autenticador com um QR code gerado no navegador, códigos de recuperação, seletor de método, tela de verificação, aprovação por push com correspondência de número, pedido de chave de segurança e passkey, campo de telefone com seletor de país, card de status de dois fatores, progresso de login, link mágico enviado, dispositivos confiáveis, formulário de nova senha com medidor de força, e layouts de login centralizado, dividido e compacto.

```html
<form class="auth-card">
  <header class="auth-header">
    <h2 class="auth-title">Digite o código que enviamos por SMS</h2>
    <p class="auth-description">Enviamos um código de 6 dígitos para o seu telefone.</p>
  </header>
  <div class="otp mx-auto" data-m-otp data-m-otp-separator="3" data-m-otp-autosubmit>
    <input class="otp-field" name="code" maxlength="6" inputmode="numeric" autocomplete="one-time-code" aria-label="Código de verificação">
  </div>
  <button class="btn btn-primary btn-block">Verificar</button>
  <button type="button" class="link link-primary" data-m-auth-resend data-m-auth-resend-seconds="30">Reenviar código</button>
</form>
```

Sem script, `.otp-field` é um único input nativo, então digitar, colar e o preenchimento automático por SMS funcionam. Com o `monsoon.js`, estes atributos acrescentam comportamento:

| Atributo | Comportamento |
| --- | --- |
| `data-m-otp` | 4 a 8 células com avanço automático, colar e preencher a partir de qualquer célula, estados de erro e sucesso, `monsoon:otp-complete` |
| `data-m-qr` | Um QR code em SVG sem dependências (modo byte, nível M, suficiente para qualquer URI `otpauth://`) |
| `data-m-auth-resend` | Um link de reenvio com contagem regressiva |
| `data-m-auth-phone` | Busca de país com bandeiras, formatação enquanto digita e um campo oculto em E.164 |
| `data-m-auth-password` | Regras de senha, pontuação de força e botão para mostrar a senha |
| `data-m-auth-codes` | Copiar, baixar como .txt e imprimir códigos de recuperação, com confirmação antes de continuar |

Todos os exemplos usam dados fictícios. Veja-os em Two factor and sign in na [galeria de componentes](https://kwy404.github.io/monsoon/components.html), por exemplo a [tela de verificação](https://kwy404.github.io/monsoon/components/verify-code.html) e o [login dividido](https://kwy404.github.io/monsoon/components/sign-in-split.html).

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

Cada token é um utilitário (`bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`) e uma propriedade customizada (`var(--primary)`), e todos os componentes os usam. Para mudar o tema de uma seção, coloque a semente nela:

```html
<section style="--seed: teal" class="rounded-2xl bg-surface p-8 space-y-3">
  <h2 class="text-2xl font-bold text-primary">Seção teal</h2>
  <button class="btn btn-primary">Primário</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2">Destaque</button>
</section>
```

**Contraste de cor acessível faz parte das fórmulas.** A cor primária nunca fica entre as luminosidades OKLCH 0.52 e 0.66, e o texto sobre ela alterna entre branco e quase preto no mesmo limite. Os testes verificam 4.5:1 (WCAG AA) para 13 pares de tokens em 18 sementes nomeadas e em uma varredura de 2.197 sementes sRGB, nos modos claro e escuro. Teste qualquer cor no [playground da semente](https://kwy404.github.io/monsoon/playground.html).

O Monsoon também traz sua própria paleta OKLCH de 22 matizes, de `slate` a `rose`, passos `50` a `950`, como propriedades `--color-{matiz}-{passo}` e como utilitários como `bg-emerald-100` e `text-rose-600`. Sem passo, `bg-red` ou `text-blue` usa o passo 500 no modo claro e o 400 no escuro.

## Modo escuro com uma linha de CSS

O modo escuro é automático via `prefers-color-scheme`. As cores semânticas trocam sozinhas, então a maioria das páginas não precisa de classes extras. Para forçar um esquema na página ou em qualquer seção:

```html
<html data-theme="dark">
<!-- ou class="dark", class="light", data-theme="light" -->

<aside class="dark rounded-2xl p-6">
  <p class="text-muted-foreground">Esta seção é sempre escura.</p>
  <div class="light rounded-xl p-4">E este card dentro dela é sempre claro.</div>
</aside>
```

O ancestral com tema mais próximo vence, em qualquer profundidade, tanto para os tokens quanto para a variante `dark:`. Uma seção com tema troca o `color-scheme` e pinta o próprio texto e fundo, então nunca mostra texto escuro sobre fundo escuro. Para cores fixas da paleta existe a variante `dark:`: `bg-slate-100 dark:bg-slate-800`.

## Variantes e container queries

```html
<button class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 active:scale-95 disabled:opacity-50">
  Salvar
</button>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">...</div>

<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">...</div>
</div>

<nav class="print:hidden">...</nav>
<span class="ml-4 rtl:ml-0 rtl:mr-4">Badge</span>
<div class="border-0 forced-colors:border">...</div>
```

| Variantes | Valores |
| --- | --- |
| Estado | `hover:` `focus:` `focus-within:` `focus-visible:` `active:` `disabled:` `group-hover:` `peer-checked:` |
| Estrutura | `first:` `last:` `odd:` `even:` |
| Esquema e movimento | `dark:` `motion-safe:` `motion-reduce:` |
| Breakpoints (min-width) | `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px, `2xl:` 1536px |
| Container queries | `@xs:` 20rem, `@sm:` 24rem, `@md:` 28rem, `@lg:` 32rem, `@xl:` 36rem (dentro de um pai com `@container`) |
| Mídia | `print:` `screen:` (no conjunto dos breakpoints, `print:hidden` vence `md:block`) |
| Direção | `rtl:` `ltr:` (utilitários que citam um lado físico, seguindo o atributo `dir` mais próximo) |
| Alto contraste | `forced-colors:` (display, bordas, outlines, sublinhados, `forced-color-adjust`) |

As variantes são aplicadas a um conjunto escolhido de utilitários para manter o arquivo pequeno: `hover:` para cores, opacidade, sombras e transformações; breakpoints para layout, espaçamento, tamanho e texto; `dark:` para cores da paleta. Classes com valor arbitrário aceitam todas as variantes. A [referência de classes](https://kwy404.github.io/monsoon/classes.html) mostra as variantes de cada classe.

## Tipografia e espaçamento fluidos

Os utilitários fluidos crescem suavemente com a viewport entre 360px e 1280px usando `clamp()` de rem mais vw, então continuam seguindo o tamanho de fonte do usuário e dispensam classes de breakpoint.

```html
<section class="p-fluid-lg">
  <h1 class="text-fluid-4xl font-bold">Título fluido</h1>
  <p class="text-fluid-base text-muted-foreground">Redimensione a janela para ver crescer.</p>
</section>
```

| Utilitários | Passos |
| --- | --- |
| `text-fluid-*` | `sm`, `base`, `lg`, `xl`, `2xl` a `6xl` |
| `p-fluid-*`, `px-fluid-*`, `py-fluid-*`, `m-fluid-*`, `gap-fluid-*` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` |

Veja a [página dos utilitários fluidos](https://kwy404.github.io/monsoon/utilities/fluid.html) (em inglês).

## CLI de purge: envie só as classes que você usa

O arquivo completo serve para a maioria dos sites. Para enviar menos, escaneie seus arquivos uma vez e gere uma folha de estilo só com os utilitários usados, mais o reset, os tokens de tema, os keyframes e a camada de componentes. As classes com valor arbitrário encontradas nos arquivos são compiladas em regras estáticas ao mesmo tempo.

```bash
npx monsooncss purge "src/**/*.html" -o public/monsoon.css
npx monsooncss purge "templates/**/*.html" "app/**/*.{php,erb,js}" --safelist bg-success,bg-danger -o static/monsoon.css
npx monsooncss classes --filter grid-cols
```

| Opção | Significado |
| --- | --- |
| `-o, --out <arquivo>` | Arquivo de saída. Sem ela o CSS vai para o stdout. |
| `--safelist a,b,c` | Classes mantidas mesmo que nenhum arquivo as cite (para nomes montados em tempo de execução). Classes arbitrárias também funcionam. |
| `--no-arbitrary` | Não compila classes com valor arbitrário. |
| `--no-minify` | Saída legível. |
| `--css <arquivo>` | Faz o purge de outra cópia da folha de estilo. |
| `classes --json`, `--filter <texto>` | Lista todas as classes, em JSON ou filtradas. |

Na página kitchen sink do repositório, o arquivo após o purge tem cerca de 39 kB com brotli, contra 88 kB do build completo. A maior parte do que sobra é a camada de componentes, que o purge mantém inteira.

## Referência de classes por categoria

| Categoria | Classes | Exemplos |
| --- | ---: | --- |
| colors | 2.248 | `text-foreground`, `bg-primary/90`, `border-slate-200`, `bg-red`, `ring-ring` |
| spacing | 796 | `p-4`, `px-6`, `mt-8`, `-mx-2`, `gap-3`, `space-y-4`, `p-fluid-md` |
| layout | 388 | `flex`, `grid`, `hidden`, `relative`, `inset-0`, `z-50`, `@container` |
| backgrounds | 367 | `bg-gradient-to-br`, `from-primary`, `to-accent`, `from-sky`, `bg-cover` |
| sizing | 268 | `w-full`, `max-w-3xl`, `size-10`, `h-screen`, `min-h-dvh` |
| borders | 193 | `border`, `rounded-xl`, `divide-y`, `ring-2`, `outline-none` |
| transforms | 143 | `scale-95`, `rotate-3`, `-translate-y-1`, `origin-top` |
| typography | 140 | `text-lg`, `font-semibold`, `tracking-tight`, `truncate`, `text-fluid-2xl` |
| grid | 111 | `grid-cols-3`, `col-span-2`, `grid-flow-row`, `auto-rows-fr` |
| flexbox | 58 | `flex-col`, `flex-1`, `shrink-0`, `basis-1/2`, `order-first` |
| interactivity | 58 | `cursor-pointer`, `select-none`, `snap-x`, `accent-primary` |
| alignment | 55 | `items-center`, `justify-between`, `place-items-center` |
| effects | 34 | `shadow-lg`, `opacity-50`, `mix-blend-multiply` |
| transitions | 29 | `transition`, `duration-200`, `ease-out` |
| filters | 24 | `blur-sm`, `backdrop-blur-md`, `grayscale` |
| accessibility | 6 | `sr-only`, `focus-ring`, `touch-target`, `forced-color-adjust-none` |
| animation | 5 | `animate-spin`, `animate-pulse` |

São 4.923 utilitários e 10.237 classes de variante. Pesquise todas com o CSS de cada uma em [kwy404.github.io/monsoon/classes.html](https://kwy404.github.io/monsoon/classes.html), ou leia [`scripts/classes.json`](https://github.com/kwy404/monsoon/blob/main/scripts/classes.json).

## Vitrine

Três apps completos feitos só com classes e componentes do Monsoon, cada um com o tema gerado a partir de uma cor semente e dados salvos no localStorage.

<table>
  <tr>
    <td width="33%" valign="top"><a href="https://kwy404.github.io/monsoon/showcase/chat/"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/docs/showcase/chat/thumb.png" width="100%" alt="Harbor, um app de chat de comunidade feito com o framework CSS Monsoon"></a><br><b><a href="https://kwy404.github.io/monsoon/showcase/chat/">Harbor</a></b>, um chat de comunidade<br>Servidores e canais, respostas, reações, editar e apagar, lista de membros e cor de destaque.</td>
    <td width="33%" valign="top"><a href="https://kwy404.github.io/monsoon/showcase/board/"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/docs/showcase/board/thumb.png" width="100%" alt="Stack, um quadro kanban feito com o framework CSS Monsoon"></a><br><b><a href="https://kwy404.github.io/monsoon/showcase/board/">Stack</a></b>, um quadro kanban<br>Arraste cards entre listas, etiquetas, checklists, prazos, comentários, filtros e cor do quadro.</td>
    <td width="33%" valign="top"><a href="https://kwy404.github.io/monsoon/showcase/calendar/"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/docs/showcase/calendar/thumb.png" width="100%" alt="Tidal, um app de calendário feito com o framework CSS Monsoon"></a><br><b><a href="https://kwy404.github.io/monsoon/showcase/calendar/">Tidal</a></b>, um calendário<br>Visões de dia, semana, mês e agenda, eventos sobrepostos, linha da hora atual e arrastar para mover.</td>
  </tr>
</table>

Mais páginas inteiras (dashboard, preços, landing de SaaS, artigo de blog, página de produto, portfólio e login) estão na [vitrine](https://kwy404.github.io/monsoon/showcase.html).

## Suporte a navegadores

O Monsoon mira as versões atuais de Chrome, Edge, Firefox e Safari. O tema por semente usa a sintaxe de cor relativa OKLCH (`oklch(from var(--seed) l c h)`), que exige Chrome e Edge 119 ou mais novos, Firefox 128 ou mais novo e Safari 18 ou mais novo. As variantes de container query exigem suporte a container queries, presente em todos os navegadores atuais. A variante `dark:` usa `@scope` onde existe, para a regra exata do ancestral mais próximo, com um fallback por seletor nos demais.

**Fallback para cor relativa.** Dentro de `@supports not (color: oklch(from red l c h))`, a folha de estilo traz tokens estáticos calculados a partir da semente padrão. `primary` e `ring` usam sua `--seed` diretamente, os tokens que dependem só do esquema de cor continuam alternando entre claro e escuro, e a página continua legível.

## O que não está incluído

- Variantes estáticas empilhadas como `dark:hover:` ou `md:hover:` nas classes prontas. Classes com valor arbitrário podem empilhar: `md:hover:bg-[#0369a1]`.
- O modificador important.
- Modificadores de opacidade em passos da paleta (`bg-emerald-500/50`). `bg-primary/90` e `bg-black/50` existem para cores semânticas, preto e branco, e qualquer cor aceita um como valor arbitrário: `bg-[red]/50`.

Use um valor arbitrário, o passo mais próximo da escala, um atributo `style` ou algumas linhas do seu próprio CSS com as variáveis do tema.

## Perguntas frequentes

### Como usar CSS utility-first sem etapa de build?

Adicione `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">` e escreva as classes no HTML. Todas as classes já estão declaradas, então nada precisa escanear seus arquivos nem gerar CSS.

### Um arquivo CSS utilitário via CDN serve para produção?

Sim. Fixe a versão e o arquivo (cerca de 88 kB brotli com todos os utilitários e componentes) fica em cache depois da primeira visita. Adicione subresource integrity se a sua política pedir, ou hospede você mesmo. Se cada kilobyte importa, rode `npx monsooncss purge` uma vez.

### O Monsoon aceita valores arbitrários como `w-[37px]` sem build?

Sim. O `dist/monsoon.js` ou o `dist/monsoon-arbitrary.js` de 6 kB escreve as regras no navegador, e o `npx monsooncss purge` as compila em CSS estático para produção.

### O Monsoon inclui componentes?

Sim, 167 na mesma folha de estilo: formulários, botões, alertas, modais, drawers, menus, abas, tabelas, cards, dropzone, recorte de imagem, seletores de data, tabela de dados, telas de dois fatores e login, e mais.

### O Monsoon precisa de JavaScript?

A folha de estilo não precisa: utilitários, tema, modo escuro e 122 dos 167 componentes são CSS puro. O `monsoon.js` opcional dá comportamento aos outros 45 (soltar arquivos, recorte, seletores de data, listas ordenáveis, células de código) e escreve valores arbitrários.

### Como gerar um tema a partir de uma cor em CSS?

Defina `--seed` em `:root` ou em qualquer elemento com `style="--seed: ..."`. Primário, secundário, destaque, superfícies, texto discreto, bordas e o anel de foco são derivados dela com cores relativas OKLCH.

### Como ter modo escuro com uma linha de CSS?

Ele já está ativo via `prefers-color-scheme`. Para forçar, adicione `class="dark"` ou `data-theme="dark"` no elemento html ou em qualquer seção. O ancestral com tema mais próximo vence.

### O Monsoon mantém contraste acessível para qualquer cor de marca?

Sim, para os pares de tokens semânticos. O primário sai da faixa de luminosidade insegura e o texto sobre ele troca de cor para ficar em 4.5:1 ou mais, o que os testes verificam nos dois modos.

### O Monsoon tem container queries com classes utilitárias?

Sim. Coloque `@container` em um pai e use `@xs:` a `@xl:` nos filhos, por exemplo `@md:flex-row`.

### Posso usar o Monsoon com React, Vue, Angular, PHP, WordPress, Django ou Rails?

Sim. Importe ou inclua a folha de estilo uma vez e escreva classes nos componentes ou templates. Há [17 guias de instalação](#usar-com-react-vue-angular-e-mais), e o purge lê qualquer arquivo de texto, como `"templates/**/*.html"` ou `"app/views/**/*.erb"`.

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
- [Arbitrary values without a build step](https://kwy404.github.io/monsoon/docs/arbitrary-values.html)
- [The optional interactive layer](https://kwy404.github.io/monsoon/docs/interactive-layer.html)

## Mais de kwy404

- [graphemely](https://kwy404.github.io/graphemely/): truncar, fatiar e contar strings com emoji com segurança.
- [edgegoat](https://kwy404.github.io/edgegoat/): entradas de teste para casos extremos de fuso horário, horário de verão, unicode e números.
- [vueleap](https://kwy404.github.io/vueleap/): migre de Vue 2 para Vue 3 com um comando.
- [numberparrot](https://kwy404.github.io/numberparrot/): converta números e valores monetários localizados de volta em números.
- [breakhound](https://kwy404.github.io/breakhound/): encontre bugs em qualquer biblioteca JavaScript automaticamente, sem escrever testes.
- [Voodoo.js](https://kwy404.github.io/Voodoo.js/): JSX e reatividade a partir de um arquivo HTML puro, usado nas partes interativas do site do Monsoon.
- [cookieowl](https://kwy404.github.io/cookieowl/): banner de cookies gratuito para LGPD e GDPR que bloqueia rastreadores de verdade.
- [installkite](https://kwy404.github.io/installkite/): torne qualquer site instalável e com funcionamento offline.
- [a11ymedic](https://kwy404.github.io/a11ymedic/): verificador de acessibilidade que explica cada problema e entrega a correção exata.
- [fontsketch](https://kwy404.github.io/fontsketch/): crie uma fonte com a sua letra, grátis e no navegador.
- [kastor](https://kwy404.github.io/kastor/): o ORM para TypeScript para quase todos os bancos de dados.

## Contribuindo

Issues e pull requests são bem-vindos. O [CONTRIBUTING.md](https://github.com/kwy404/monsoon/blob/main/CONTRIBUTING.md) explica o gerador, como adicionar um utilitário e como as variantes são atribuídas, e o [`src/components/CONVENTIONS.md`](https://github.com/kwy404/monsoon/blob/main/src/components/CONVENTIONS.md) trata dos componentes. As mudanças ficam no [CHANGELOG](https://github.com/kwy404/monsoon/blob/main/CHANGELOG.md).

## Autor

Criado por **Alexandre Kohler** ([GitHub](https://github.com/kwy404) e [LinkedIn](https://www.linkedin.com/in/alexandre-silva-173687256/)).

## Licença

[MIT](https://github.com/kwy404/monsoon/blob/main/LICENSE). Copyright 2026 Alexandre Kohler ([kwy404](https://github.com/kwy404))
