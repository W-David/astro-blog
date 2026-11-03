export function initReveal() {
	if (typeof window === 'undefined') return;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
	if (!nodes.length) return;
	if (reduce || !('IntersectionObserver' in window)) {
		nodes.forEach((el) => el.classList.add('is-visible'));
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target as HTMLElement;
				el.classList.add('is-visible');
				io.unobserve(el);
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
	);
	nodes.forEach((el, i) => {
		const delay = Number(el.dataset.delay ?? Math.min(i * 60, 420));
		el.style.transitionDelay = `${delay}ms`;
		io.observe(el);
	});
}

document.addEventListener('DOMContentLoaded', initReveal);
