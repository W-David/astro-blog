# Rushing's travel of Mr.Wang

Personal Astro blog for [rushwang.blog](https://rushwang.blog).

**Theme: Lumen** — a dark, cinematic editorial layout with a live WebGL fluid-gradient background, large-scale typography, and a poster-style article archive.

![Lumen theme — fluid background](preview.jpg)

[观看流体背景动图](fluid-preview.gif)

## Stack

- Astro 7 content collections + Markdown
- `astro:assets` for optimized local images
- Local fonts registered with Astro's `fontProviders.local()` (Space Grotesk + Fraunces)
- Custom WebGL2 fluid shader (fractal noise + pointer flowmap + scroll deformation)
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
│   └── images/         # post cover photography
├── components/         # header, footer, post cards, fluid canvas
├── content/blog/       # Markdown posts
├── layouts/            # BaseLayout + BlogPost
├── pages/              # home, archive, about, dynamic posts, RSS
├── scripts/
│   ├── lumen.ts        # header, reveal, reading progress
│   └── fluid-background.js  # WebGL2 fluid renderer
└── styles/global.css   # Lumen design system
```

## Content

Posts live in `src/content/blog`. Each post can declare a local `heroImage` in frontmatter; the image is automatically optimized at build time and used both in the poster archive and on the article page.

Photography is sourced from Unsplash and committed locally. The homepage uses the moving fluid field as its opening image; photography remains in the article covers and the About page.

## DeepSeek fluid reference

The background follows the DeepSeek homepage fluid-gradient effect and is adapted from the MIT-licensed [Deepseek新版官网Background组件](https://github.com/zhiyingpan-dev/deepseek_background) by panzhiying-dev. The original renderer uses a WebGL2 fragment shader with fractal noise, a low-resolution pointer flowmap, and glassmorphism-friendly motion.

The implementation here keeps the pointer influence deliberately subtle, adds a scroll-driven deformation, respects `prefers-reduced-motion`, and falls back to a static blue gradient when WebGL2 is unavailable.

Related reading: [DeepSeek's Homepage Polish Comes Down to Three Techniques](https://guibai.dev/a/7676826408547958793/).
