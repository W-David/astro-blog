import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: [['list'], ['html', { open: 'never' }]],
	outputDir: 'test-results',
	use: {
		baseURL: 'http://127.0.0.1:4321',
		channel: 'chrome',
		headless: true,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		launchOptions: {
			args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
		},
	},
	projects: [
		{
			name: 'desktop-chrome',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1440, height: 900 },
			},
		},
		{
			name: 'mobile-chrome',
			use: {
				viewport: { width: 390, height: 844 },
				deviceScaleFactor: 2,
				isMobile: true,
				hasTouch: true,
			},
		},
	],
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4321',
		url: 'http://127.0.0.1:4321',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
