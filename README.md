# Rushing's travel of Mr.Wang（Astro 博客）

从 [W-David/RecoBlog](https://github.com/W-David/RecoBlog) 迁移过来的静态博客，基于官方 Astro Blog 模板。

> 本项目只在本地 / 你自己的静态托管上运行。**请勿**自动部署到现有的 `rushwang.blog` 或 AWS/OpenShip 服务器；原来的 coblog 栈也不受影响。

## 环境要求

- Node.js **22.23.4+**（官方 Astro 当前要求）
- npm

## 常用命令

在项目根目录执行：

```bash
# 安装依赖
npm install

# 本地开发预览（默认 http://localhost:4321）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 预览构建结果
npm run preview
```

## 内容说明

- 文章位于 `src/content/blog/`，共 9 篇，分类字段 `category` 对应原 RecoBlog 目录：图库 / 杂记 / 算法 / 记录 / 运维。
- VuePress 的 `:::tip` / `:::info` 已转成 Markdown 引用块。
- 「动漫美图」里的相对路径图片已改为 GitHub raw 链接。
- 站点标题与标语沿用原 RecoBlog：`Rushing's travel of Mr.Wang`。

## 自行部署（可选）

构建产物在 `dist/`，可上传到任意静态托管，例如：

- [Vercel](https://vercel.com/)：导入本仓库，框架选 Astro
- [Netlify](https://www.netlify.com/)：Build command `npm run build`，Publish directory `dist`
- Cloudflare Pages、GitHub Pages、对象存储 + CDN 等

部署前可在 `astro.config.mjs` 里把 `site` 改成你的正式域名。
