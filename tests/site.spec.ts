import { test, expect, type Page } from '@playwright/test';

const routes = [
	{ path: '/', label: 'home' },
	{ path: '/blog/', label: 'blog index' },
	{ path: '/about/', label: 'about' },
	{ path: '/blog/aliyun-reinstall-notes/', label: 'article: aliyun' },
	{ path: '/blog/anime-wallpapers/', label: 'article: anime' },
	{ path: '/blog/binary-search-variants/', label: 'article: binary search' },
	{ path: '/blog/bst-cpp/', label: 'article: BST' },
	{ path: '/blog/emergency-rescue/', label: 'article: emergency' },
	{ path: '/blog/grub2-theme/', label: 'article: grub2' },
	{ path: '/blog/linux-notes/', label: 'article: linux' },
	{ path: '/blog/nginx-multi-frontend/', label: 'article: nginx' },
	{ path: '/blog/owncloud-on-vps/', label: 'article: owncloud' },
];

async function collectConsoleErrors(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
	page.on('console', (message) => {
		if (message.type() !== 'error') return;
		const text = message.text();
		// Aborted image/preload requests during teardown are not app runtime errors.
		if (/ERR_CONNECTION_RESET|ERR_ABORTED|ERR_FAILED/.test(text)) return;
		errors.push(`console: ${text}`);
	});
	return errors;
}

for (const route of routes) {
	test(`${route.label} loads without runtime errors`, async ({ page }) => {
		const errors = await collectConsoleErrors(page);
		const response = await page.goto(route.path, { waitUntil: 'load' });
		await page.waitForTimeout(250);

		expect(response?.status()).toBe(200);
		expect(await page.title()).not.toHaveLength(0);
		expect(await page.locator('h1').count()).toBe(1);
		expect(await page.locator('[data-dot-matrix]').count()).toBe(1);
		expect(await page.evaluate(() => document.documentElement.classList.contains('has-webgl') || document.documentElement.classList.contains('no-webgl'))).toBe(true);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
		expect(errors).toEqual([]);
	});
}

test('homepage navigation links resolve', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: 'Notes' }).click();
	await expect(page).toHaveURL(/\/blog\/?$/);
	await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: 'About' }).click();
	await expect(page).toHaveURL(/\/about\/?$/);
});

test('mouse movement produces a trailing pointer ripple and scroll does not add new ripples', async ({ page }, testInfo) => {
	test.skip(testInfo.project.name !== 'desktop-chrome', 'Pointer interaction is desktop-only');

	await page.goto('/');
	await page.waitForFunction(() => Boolean((window as unknown as { __dotMatrix?: unknown }).__dotMatrix));

	const initial = await page.evaluate(() => {
		const api = (window as unknown as { __dotMatrix: { pointerForce: number; trailSerial: number } }).__dotMatrix;
		return { force: api.pointerForce, serial: api.trailSerial };
	});

	await page.mouse.move(280, 470);
	for (let i = 0; i < 10; i += 1) {
		await page.mouse.move(280 + i * 42, 470 + i * 4, { steps: 2 });
		await page.waitForTimeout(70);
	}
	await page.waitForTimeout(80);

	const afterMove = await page.evaluate(() => {
		const api = (window as unknown as { __dotMatrix: { pointerForce: number; trailSerial: number } }).__dotMatrix;
		return { force: api.pointerForce, serial: api.trailSerial };
	});

	expect(afterMove.serial).toBeGreaterThan(initial.serial);
	expect(afterMove.force).toBeGreaterThan(0.01);

	const serialBeforeScroll = afterMove.serial;
	await page.mouse.wheel(0, 900);
	await page.waitForTimeout(500);
	const afterScroll = await page.evaluate(() => {
		const api = (window as unknown as { __dotMatrix: { trailSerial: number } }).__dotMatrix;
		return api.trailSerial;
	});

	expect(afterScroll).toBe(serialBeforeScroll);
});

test('dot matrix fills the stage below the header', async ({ page }) => {
	await page.goto('/');
	const bounds = await page.evaluate(() => {
		const canvas = document.querySelector('[data-dot-matrix]')?.getBoundingClientRect();
		const header = document.querySelector('.site-header')?.getBoundingClientRect();
		return {
			canvas: canvas ? { top: canvas.top, bottom: canvas.bottom, left: canvas.left, width: canvas.width } : null,
			headerBottom: header ? header.bottom : 0,
			viewportHeight: window.innerHeight,
		};
	});

	expect(bounds.canvas).not.toBeNull();
	expect(bounds.canvas!.top).toBeGreaterThanOrEqual(bounds.headerBottom - 1);
	expect(bounds.canvas!.bottom).toBeGreaterThanOrEqual(bounds.viewportHeight - 1);
	expect(bounds.canvas!.left).toBe(0);
	expect(bounds.canvas!.width).toBeGreaterThanOrEqual(await page.evaluate(() => window.innerWidth) - 1);
});
