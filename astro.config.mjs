// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://rushwang.blog',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark-dimmed',
			wrap: true,
		},
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Space Grotesk',
			cssVariable: '--font-space-grotesk',
			fallbacks: ['"PingFang SC"', '"Noto Sans SC"', '"Microsoft YaHei"', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/space-grotesk-300.ttf'],
						weight: '300',
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/space-grotesk-400.ttf'],
						weight: '400',
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/space-grotesk-500.ttf'],
						weight: '500',
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Fraunces',
			cssVariable: '--font-fraunces',
			fallbacks: ['"Songti SC"', '"STSong"', 'serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/fraunces-400.ttf'],
						weight: '400',
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/fraunces-400-italic.ttf'],
						weight: '400',
						style: 'italic',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/fraunces-700.ttf'],
						weight: '700',
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
