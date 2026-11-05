# Rushing's travel of Mr.Wang

Personal Astro blog for [rushwang.blog](https://rushwang.blog).

**Theme: Lumen** — a dark, cinematic editorial layout with a live WebGL dot-matrix background, large-scale typography, and a poster-style article archive.

![Lumen theme — dot matrix and pointer ripple](preview.jpg)

[观看点阵波纹动图](dot-matrix-preview.gif)

## Stack

- Astro 7 content collections + Markdown
- `astro:assets` for optimized local images
- Local fonts registered with Astro's `fontProviders.local()` (Space Grotesk + Fraunces)
- Custom WebGL2 + GLSL for the site-wide dot matrix (pointer ripples, scroll waves, ambient aurora)
- Vanilla TypeScript for scroll reveals, header state, and reading progress
- RSS + sitemap enabled

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure

```text
src/
├── assets/
│   ├── fonts/          # local webfonts
│   └── images/         # hero and post cover photography
├── components/         # header, footer, post cards, dot-matrix canvas
├── content/blog/       # Markdown posts
├── layouts/            # BaseLayout + BlogPost
├── pages/              # home, archive, about, dynamic posts, RSS
├── scripts/
│   ├── lumen.ts        # header, reveal, reading progress
│   └── dot-matrix.ts   # WebGL2 shader + pointer/scroll ripples
└── styles/global.css   # Lumen design system
```

## Content

Posts live in `src/content/blog`. Each post can declare a local `heroImage` in frontmatter; the image is automatically optimized at build time and used both in the poster archive and on the article page.

Photography is sourced from Unsplash and committed locally. The homepage now uses the live dot-matrix field itself as its opening image; photography remains in the article covers and the About portrait.

## Interaction references

- [WebGL Water](https://madebyevan.com/webgl-water/) — classic heightfield water ripples
- [three.js `webgl_points_waves`](https://threejs.org/examples/#webgl_points_waves) — GPU point-field wave motion
- [jekorx/particle-wave](https://github.com/jekorx/particle-wave) — perspective particle sea composition

The implementation here is dependency-free WebGL2 + GLSL, tuned to the site's warm/cool Lumen palette. It keeps the canvas behind all content, respects `prefers-reduced-motion`, and falls back to a static CSS dot field when WebGL2 is unavailable.
