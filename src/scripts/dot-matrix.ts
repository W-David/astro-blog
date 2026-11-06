const MAX_TRAIL = 10;

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
uniform float uPointerForce;
uniform vec2 uTrail[${MAX_TRAIL}];
uniform float uTrailAge[${MAX_TRAIL}];
uniform float uTrailAmp[${MAX_TRAIL}];

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

	float spread = mix(0.34, 1.2, pow(depth, 0.78));
	vec2 pos = vec2((uv.x * 2.0 - 1.0) * spread, mix(0.9, -0.98, pow(depth, 1.52)));
	float perspectiveScale = mix(0.16, 1.0, pow(depth, 1.4));

	// Slow ambient breathing keeps the field alive without reacting to page scroll.
	float waveA = sin(uv.x * 13.0 + uTime * 0.55 + sin(uv.y * 4.5) * 1.7);
	float waveB = sin(uv.y * 23.0 - uTime * 0.78 + uv.x * 2.4);
	float waveC = sin((uv.x + uv.y) * 9.0 + uTime * 0.31);
	pos.y += (waveA * 0.03 + waveB * 0.02) * perspectiveScale;
	pos.x += waveC * 0.018 * perspectiveScale;

	float glow = 0.0;
	float aurora = pow(0.5 + 0.5 * sin(uv.x * 8.0 + uv.y * 14.0 - uTime * 0.7), 5.0);
	float aurora2 = pow(0.5 + 0.5 * sin(uv.x * 5.0 - uv.y * 10.0 + uTime * 0.38), 8.0);
	glow += (aurora * 0.34 + aurora2 * 0.18) * (0.45 + depth * 0.55);

	// A local fluid vortex around the cursor. It only reads pointer movement;
	// page scrolling never feeds this field.
	vec2 pointerDiff = vec2((pos.x - uPointer.x) * aspect, pos.y - uPointer.y);
	float pointerDist = length(pointerDiff);
	vec2 radial = pointerDiff / max(pointerDist, 0.00001);
	vec2 tangent = vec2(-radial.y, radial.x);
	float falloff = exp(-pointerDist * pointerDist * 6.5);
	float swirl = sin(pointerDist * 20.0 - uTime * 2.0) * falloff * uPointerForce;
	float radialPulse = cos(pointerDist * 17.0 - uTime * 1.45) * falloff * uPointerForce;
	pos += vec2(tangent.x / aspect, tangent.y) * swirl * 0.045;
	pos += vec2(radial.x / aspect, radial.y) * radialPulse * 0.016;
	glow += falloff * uPointerActive * 0.42 + abs(swirl) * 0.55;

	// Trailing ripples: recent pointer positions keep expanding softly behind
	// the cursor, while the page scroll never feeds this field.
	for (int i = 0; i < ${MAX_TRAIL}; i++) {
		float amp = uTrailAmp[i];
		if (amp <= 0.001) continue;
		float age = max(0.0, uTrailAge[i]);
		vec2 diff = vec2((pos.x - uTrail[i].x) * aspect, pos.y - uTrail[i].y);
		float dist = length(diff);
		float ring = sin(dist * 34.0 - age * 10.0);
		float envelope = exp(-dist * dist * 8.0) * exp(-age * 1.6) * amp;
		vec2 radialTrail = normalize(diff + vec2(0.00001, 0.00003));
		pos += vec2(radialTrail.x / aspect, radialTrail.y) * ring * envelope * 0.026;
		glow += max(0.0, ring) * envelope * 0.45;
	}

	float grain = hash21(uv * 720.0);
	float edgeFade = smoothstep(0.0, 0.06, uv.x) * (1.0 - smoothstep(0.94, 1.0, uv.x))
		* smoothstep(0.0, 0.06, uv.y) * (1.0 - smoothstep(0.96, 1.0, uv.y));
	float fieldTint = smoothstep(0.02, 0.96, depth);

	vec3 cool = vec3(0.26, 0.57, 1.0);
	vec3 lavender = vec3(0.72, 0.46, 1.0);
	vec3 warm = vec3(1.0, 0.72, 0.54);
	vec3 base = mix(cool, lavender, smoothstep(0.0, 0.72, uv.x));
	base = mix(base, warm, fieldTint * 0.28);
	vec3 color = mix(base, warm, clamp(glow * 0.38, 0.0, 1.0));

	float pointSize = mix(1.8, 5.4, pow(depth, 1.8)) + grain * 1.3;
	pointSize *= (1.0 + glow * 0.42);
	gl_PointSize = pointSize * uDpr;
	vColor = color;
	vAlpha = (0.5 + fieldTint * 0.24 + glow * 0.58) * edgeFade;
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
	float circle = smoothstep(0.52, 0.16, radius);
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
		pointerForce: gl.getUniformLocation(program, 'uPointerForce'),
		trail: gl.getUniformLocation(program, 'uTrail[0]'),
		trailAge: gl.getUniformLocation(program, 'uTrailAge[0]'),
		trailAmp: gl.getUniformLocation(program, 'uTrailAmp[0]'),
	};

	let width = 1;
	let height = 1;
	let dpr = 1;
	let pointCount = 0;
	let startTime = performance.now();
	let pausedAt = 0;
	let pointerX = 0;
	let pointerY = 0;
	let targetX = 0;
	let targetY = 0;
	let pointerActive = 0;
	let targetActive = 0;
	let pointerForce = 0;
	let lastPointerX = 0;
	let lastPointerY = 0;
	let lastPointerAt = 0;
	let lastTrailAt = 0;

	type Trail = { x: number; y: number; birth: number; amp: number };
	const trails: Trail[] = Array.from({ length: MAX_TRAIL }, () => ({ x: 0, y: 0, birth: -100, amp: 0 }));
	const trailPositions = new Float32Array(MAX_TRAIL * 2);
	const trailAges = new Float32Array(MAX_TRAIL);
	const trailAmps = new Float32Array(MAX_TRAIL);
	let trailCursor = 0;
	let trailSerial = 0;

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

	const onPointerMove = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		const rect = canvas.getBoundingClientRect();
		const nextX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const nextY = 1 - ((event.clientY - rect.top) / rect.height) * 2;
		const dx = nextX - lastPointerX;
		const dy = nextY - lastPointerY;
		const distance = Math.hypot(dx, dy);
		const now = performance.now();
		if (now - lastPointerAt < 1000) {
			pointerForce = Math.min(1.5, pointerForce + Math.min(0.7, distance * 3.2));
		}
		lastPointerX = nextX;
		lastPointerY = nextY;
		lastPointerAt = now;
		targetX = nextX;
		targetY = nextY;
		targetActive = 1;

		if (now - lastTrailAt > 48 && distance > 0.004) {
			lastTrailAt = now;
			trails[trailCursor] = {
				x: nextX,
				y: nextY,
				birth: (now - startTime) / 1000,
				amp: Math.min(0.32, 0.13 + distance * 2.2),
			};
			trailCursor = (trailCursor + 1) % MAX_TRAIL;
			trailSerial += 1;
		}
	};

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerleave', () => {
		targetActive = 0;
		pointerForce = 0;
	});

	const resizeObserver = new ResizeObserver(() => resize());
	resizeObserver.observe(canvas);
	resize();

	const debugApi = {
		get pointerForce() {
			return pointerForce;
		},
		get trailSerial() {
			return trailSerial;
		},
	};
	(window as Window & { __dotMatrix?: typeof debugApi }).__dotMatrix = debugApi;

	let frame = 0;
	const render = (now: number) => {
		const time = (now - startTime) / 1000;
		pointerX += (targetX - pointerX) * 0.14;
		pointerY += (targetY - pointerY) * 0.14;
		pointerActive += (targetActive - pointerActive) * 0.08;
		pointerForce *= 0.97;

		for (let i = 0; i < MAX_TRAIL; i += 1) {
			const trail = trails[i];
			trailPositions[i * 2] = trail.x;
			trailPositions[i * 2 + 1] = trail.y;
			trailAges[i] = Math.max(0, time - trail.birth);
			trailAmps[i] = trail.amp;
		}

		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform2f(uniforms.resolution, width, height);
		gl.uniform1f(uniforms.time, time);
		gl.uniform1f(uniforms.dpr, dpr);
		gl.uniform2f(uniforms.pointer, pointerX, pointerY);
		gl.uniform1f(uniforms.pointerActive, pointerActive);
		gl.uniform1f(uniforms.pointerForce, pointerForce);
		gl.uniform2fv(uniforms.trail, trailPositions);
		gl.uniform1fv(uniforms.trailAge, trailAges);
		gl.uniform1fv(uniforms.trailAmp, trailAmps);
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
