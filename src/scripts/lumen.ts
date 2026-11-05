const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateClock() {
	const nodes = document.querySelectorAll<HTMLElement>('[data-clock]');
	if (!nodes.length) return;
	const formatter = new Intl.DateTimeFormat('zh-CN', {
		timeZone: 'Asia/Shanghai',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
	const value = formatter.format(new Date());
	nodes.forEach((node) => {
		node.textContent = value;
	});
}

function initHeader() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	if (!header) return;

	const update = () => {
		header.classList.toggle('is-scrolled', window.scrollY > 32);
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
	const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
	if (!nodes.length) return;

	if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
		nodes.forEach((node) => node.classList.add('is-visible'));
		return;
	}

	document.documentElement.dataset.revealReady = 'true';

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -7% 0px', threshold: 0.08 },
	);

	nodes.forEach((node, index) => {
		node.style.setProperty('--i', String(Math.min(index, 10)));
		observer.observe(node);
	});
}

function initReadingProgress() {
	const bar = document.querySelector<HTMLElement>('[data-progress]');
	if (!bar) return;

	const update = () => {
		const scrollable = document.documentElement.scrollHeight - window.innerHeight;
		const value = scrollable > 0 ? window.scrollY / scrollable : 0;
		bar.style.width = `${Math.min(100, Math.max(0, value * 100))}%`;
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
}

export function initLumen() {
	if (typeof window === 'undefined') return;

	updateClock();
	window.setInterval(updateClock, 30_000);
	initHeader();
	initReveal();
	initReadingProgress();
}
