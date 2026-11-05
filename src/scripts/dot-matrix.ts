type Ripple = {
	x: number;
	y: number;
	birth: number;
	amp: number;
};

const MAX_RIPPLES = 8;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('Unable to create shader');
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(info || 'Shader compile failed');
	}
	return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
	const vertex = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aGrid;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDpr;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uScrollPhase;
uniform float uScrollEnergy;

uniform vec2 uRipples[${MAX_RIPPLES}];
uniform float uRippleBirth[${MAX_RIPPLES}];
uniform float uRippleAmp[${MAX_RIPPLES}];

out vec3 vColor;
out float vAlpha;

float hash21(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

void main() {
	vec2 uv = aGrid;
	float depth = uv.y;
	float aspect = uResolution.x / uResolution.y;

	// Perspective field: far dots sit near the horizon, near dots spread wide.
	float spread = mix(0.34, 1.2, pow(depth, 0.78));
	vec2 pos = vec2((uv.x * 2.0 - 1.0) * spread, mix(0.9, -0.98, pow(depth, 1.52)));

	// A soft, breathing wave field gives the grid a sense of depth.
	float waveA = sin(uv.x * 13.0 + uTime * 0.55 + sin(uv.y * 4.5) * 1.7);
	float waveB = sin(uv.y * 23.0 - uTime * 0.78 + uv.x * 2.4);
	float waveC = sin((uv.x + uv.y) * 9.0 + uTime * 0.31);
	float perspectiveScale = mix(0.16, 1.0, pow(depth, 1.4));

	pos.y += (waveA * 0.03 + waveB * 0.02) * perspectiveScale;
	pos.x += waveC * 0.018 * perspectiveScale;

	// Scrolling injects a travelling transverse wave.
	float scrollWave = sin(uv.y * 24.0 - uScrollPhase * 2.4 + uv.x * 4.0);
	pos.y += scrollWave * (0.018 + uScrollEnergy * 0.16) * perspectiveScale;

	float glow = 0.0;
	float aurora = pow(0.5 + 0.5 * sin(uv.x * 8.0 + uv.y * 14.0 - uTime * 0.7), 5.0);
	float aurora2 = pow(0.5 + 0.5 * sin(uv.x * 5.0 - uv.y * 10.0 + uTime * 0.38), 8.0);
	glow += (aurora * 0.42 + aurora2 * 0.22) * (0.45 + depth * 0.55);
	vec2 pointerDiff = vec2((pos.x - uPointer.x) * aspect, pos.y - uPointer.y);
	float pointerDist = length(pointerDiff);
	float pointerHalo = exp(-pointerDist * pointerDist * 8.5) * uPointerActive;
	float pointerWave = sin(pointerDist * 27.0 - uTime * 3.2) * exp(-pointerDist * 3.8) * uPointerActive;
	vec2 pointerRadial = normalize(pointerDiff + vec2(0.00001, 0.00003));
	glow += pointerHalo * 1.1 + max(0.0, pointerWave) * 2.5;
	pos += vec2(pointerRadial.x / aspect, pointerRadial.y) * pointerWave * 0.06;

	// Concentric rings ripple away from recent pointer positions.
	for (int i = 0; i < ${MAX_RIPPLES}; i++) {
		float amp = uRippleAmp[i];
		if (amp <= 0.001) continue;

		float age = max(0.0, uTime - uRippleBirth[i]);
		vec2 diff = vec2((pos.x - uRipples[i].x) * aspect, pos.y - uRipples[i].y);
		float dist = length(diff);
		float ring = sin(dist * 34.0 - age * 11.0);
		float envelope = exp(-dist * 5.2) * exp(-age * 1.25) * amp;
		float displacement = ring * envelope;

		vec2 radial = normalize(diff + vec2(0.00001, 0.00003));
		pos += vec2(radial.x / aspect, radial.y) * displacement * 0.085;
		glow += max(0.0, ring) * envelope * 1.35;
	}

	float grain = hash21(uv * 720.0);
	float edgeFade = smoothstep(0.0, 0.06, uv.x) * (1.0 - smoothstep(0.94, 1.0, uv.x))
		* smoothstep(0.0, 0.06, uv.y) * (1.0 - smoothstep(0.96, 1.0, uv.y));
	float fieldTint = smoothstep(0.02, 0.96, depth);

	vec3 cool = vec3(0.22, 0.62, 1.0);
	vec3 lavender = vec3(0.72, 0.43, 1.0);
	vec3 warm = vec3(1.0, 0.69, 0.46);
	vec3 base = mix(cool, lavender, smoothstep(0.0, 0.72, uv.x));
	base = mix(base, warm, fieldTint * 0.25);
	vec3 color = mix(base, warm, clamp(glow * 0.5, 0.0, 1.0));
	color += vec3(0.1, 0.09, 0.14) * grain;

	float pointSize = mix(0.9, 7.2, pow(depth, 1.9)) + grain * 1.4;
	pointSize *= (1.0 + glow * 0.62);
	gl_PointSize = pointSize * uDpr;
	vColor = color;
	vAlpha = (0.5 + fieldTint * 0.24 + glow * 0.9) * edgeFade;
	gl_Position = vec4(pos, 0.0, 1.0);
}
`;

	const fragment = `#version 300 es
precision highp float;

in vec3 vColor;
in float vAlpha;
out vec4 outColor;

void main() {
	vec2 point = gl_PointCoord - 0.5;
	float radius = length(point);
	float circle = smoothstep(0.52, 0.18, radius);
	if (circle <= 0.001) discard;
	outColor = vec4(vColor, circle * vAlpha);
}
`;

	const program = gl.createProgram();
	if (!program) throw new Error('Unable to create WebGL program');
	const vs = compileShader(gl, gl.VERTEX_SHADER, vertex);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(info || 'Program link failed');
	}
	return program;
}

export function initDotMatrix() {
	if (typeof window === 'undefined') return;
	const canvas = document.querySelector<HTMLCanvasElement>('[data-dot-matrix]');
	if (!canvas) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const gl = canvas.getContext('webgl2', {
		alpha: true,
		antialias: true,
		premultipliedAlpha: false,
		powerPreference: 'high-performance',
	});

	if (!gl) {
		document.documentElement.classList.add('no-webgl');
		return;
	}

	let program: WebGLProgram;
	try {
		program = createProgram(gl);
	} catch (error) {
		console.warn('Dot matrix disabled:', error);
		document.documentElement.classList.add('no-webgl');
		return;
	}

	document.documentElement.classList.add('has-webgl');
	canvas.addEventListener('webglcontextlost', (event) => {
		event.preventDefault();
		document.documentElement.classList.remove('has-webgl');
		document.documentElement.classList.add('no-webgl');
	});
	gl.useProgram(program);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.disable(gl.DEPTH_TEST);
	gl.clearColor(0, 0, 0, 0);

	const positionBuffer = gl.createBuffer();
	const positionLocation = gl.getAttribLocation(program, 'aGrid') ?? 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	const uniforms = {
		resolution: gl.getUniformLocation(program, 'uResolution'),
		time: gl.getUniformLocation(program, 'uTime'),
		dpr: gl.getUniformLocation(program, 'uDpr'),
		pointer: gl.getUniformLocation(program, 'uPointer'),
		pointerActive: gl.getUniformLocation(program, 'uPointerActive'),
		scrollPhase: gl.getUniformLocation(program, 'uScrollPhase'),
		scrollEnergy: gl.getUniformLocation(program, 'uScrollEnergy'),
		ripples: gl.getUniformLocation(program, 'uRipples[0]'),
		rippleBirth: gl.getUniformLocation(program, 'uRippleBirth[0]'),
		rippleAmp: gl.getUniformLocation(program, 'uRippleAmp[0]'),
	};

	let width = 1;
	let height = 1;
	let dpr = 1;
	let pointCount = 0;
	let startTime = performance.now();
	let pointerX = 0;
	let pointerY = 0;
	let pointerActive = 0;
	let pointerTarget = 0;
	let scrollPhase = 0;
	let scrollEnergy = 0;
	let lastScroll = window.scrollY;
	let pausedAt = 0;

	const ripples: Ripple[] = Array.from({ length: MAX_RIPPLES }, () => ({
		x: 0,
		y: 0,
		birth: -100,
		amp: 0,
	}));
	const ripplePositions = new Float32Array(MAX_RIPPLES * 2);
	const rippleBirths = new Float32Array(MAX_RIPPLES).fill(-100);
	const rippleAmps = new Float32Array(MAX_RIPPLES);
	let rippleCursor = 0;

	const resize = () => {
		const rect = canvas.getBoundingClientRect();
		width = Math.max(1, rect.width);
		height = Math.max(1, rect.height);
		dpr = Math.min(window.devicePixelRatio || 1, 1.75);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		gl.viewport(0, 0, canvas.width, canvas.height);

		const spacing = width < 700 ? 15 : 14;
		const cols = Math.max(22, Math.min(150, Math.round(width / spacing) + 1));
		const rows = Math.max(22, Math.min(110, Math.round(height / spacing) + 1));
		const points = new Float32Array(cols * rows * 2);
		let i = 0;
		for (let row = 0; row < rows; row += 1) {
			for (let col = 0; col < cols; col += 1) {
				points[i++] = col / (cols - 1);
				points[i++] = row / (rows - 1);
			}
		}
		pointCount = cols * rows;
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
	};

	const spawnRipple = (nx: number, ny: number, amp: number) => {
		const index = rippleCursor;
		rippleCursor = (rippleCursor + 1) % MAX_RIPPLES;
		ripples[index] = {
			x: nx,
			y: ny,
			birth: (performance.now() - startTime) / 1000,
			amp,
		};
	};

	const onPointerMove = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		const rect = canvas.getBoundingClientRect();
		pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointerY = 1 - ((event.clientY - rect.top) / rect.height) * 2;
		pointerTarget = 1;
	};

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerleave', () => {
		pointerTarget = 0;
	});
	window.addEventListener('pointerdown', (event) => {
		const rect = canvas.getBoundingClientRect();
		pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointerY = 1 - ((event.clientY - rect.top) / rect.height) * 2;
		pointerTarget = 1;
		spawnRipple(pointerX, pointerY, 1.05);
	});
	window.addEventListener(
		'scroll',
		() => {
			const y = window.scrollY;
			const delta = y - lastScroll;
			lastScroll = y;
			scrollEnergy = Math.min(2.4, scrollEnergy + Math.abs(delta) * 0.018);
			scrollPhase += delta * 0.006;
			if (Math.abs(delta) > 10) {
				spawnRipple(0.5 + Math.sin(y * 0.002) * 0.28, 0.18, Math.min(1.1, Math.abs(delta) * 0.02));
			}
		},
		{ passive: true },
	);

	const resizeObserver = new ResizeObserver(() => resize());
	resizeObserver.observe(canvas);
	resize();

	let frame = 0;
	const render = (now: number) => {
		const time = (now - startTime) / 1000;
		pointerActive += (pointerTarget - pointerActive) * 0.08;
		scrollEnergy *= 0.94;

		for (let i = 0; i < MAX_RIPPLES; i += 1) {
			const ripple = ripples[i];
			ripplePositions[i * 2] = ripple.x;
			ripplePositions[i * 2 + 1] = ripple.y;
			rippleBirths[i] = ripple.birth;
			rippleAmps[i] = ripple.amp;
			ripple.amp *= 0.998;
		}

		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);
		gl.uniform2f(uniforms.resolution, width, height);
		gl.uniform1f(uniforms.time, time);
		gl.uniform1f(uniforms.dpr, dpr);
		gl.uniform2f(uniforms.pointer, pointerX, pointerY);
		gl.uniform1f(uniforms.pointerActive, pointerActive);
		gl.uniform1f(uniforms.scrollPhase, scrollPhase);
		gl.uniform1f(uniforms.scrollEnergy, scrollEnergy);
		gl.uniform2fv(uniforms.ripples, ripplePositions);
		gl.uniform1fv(uniforms.rippleBirth, rippleBirths);
		gl.uniform1fv(uniforms.rippleAmp, rippleAmps);
		gl.drawArrays(gl.POINTS, 0, pointCount);

		if (!reducedMotion) frame = requestAnimationFrame(render);
	};

	if (reducedMotion) {
		render(performance.now());
	} else {
		frame = requestAnimationFrame(render);
	}

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			pausedAt = performance.now();
			cancelAnimationFrame(frame);
		} else if (!reducedMotion) {
			if (pausedAt) startTime += performance.now() - pausedAt;
			pausedAt = 0;
			frame = requestAnimationFrame(render);
		}
	});
}
