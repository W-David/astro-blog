# Rushing's travel of Mr.Wang

Personal Astro blog for [rushwang.blog](https://rushwang.blog).

**Theme: Lumen** — a dark, cinematic editorial layout built around one full-bleed hero image, large-scale typography, and a poster-style article archive.

![Lumen theme — hero and poster archive](preview.jpg)

## Stack

- Astro 7 content collections + Markdown
- `astro:assets` for optimized local images
- Local fonts registered with Astro's `fontProviders.local()` (Space Grotesk + Fraunces)
- Vanilla TypeScript for scroll reveals, header state, reading progress, and pointer light
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
├── components/         # header, footer, post cards, date / head
├── content/blog/       # Markdown posts
├── layouts/            # BaseLayout + BlogPost
├── pages/              # home, archive, about, dynamic posts, RSS
├── scripts/lumen.ts    # progressive client interactions
└── styles/global.css   # Lumen design system
```

## Content

Posts live in `src/content/blog`. Each post can declare a local `heroImage` in frontmatter; the image is automatically optimized at build time and used both in the poster archive and on the article page.

Photography is sourced from Unsplash and committed locally. The design deliberately uses a single ambient hero rather than a repeated card template: scrolling from the cover leads directly into the staggered poster grid.
