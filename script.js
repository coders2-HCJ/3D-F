let rx = 0, ry = 0, rz = 0;
setInterval(function() {
	const gl = document.querySelector("canvas").getContext("webgl");
	function createShader(type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}
	const m4 = {
		multiply(a, b) {
			let result = new Float32Array(16);
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					let sum = 0;
					for (let k = 0; k < 4; k++) {
						sum += b[i * 4 + k] * a[k * 4 + j];
					}
					result[i * 4 + j] = sum;
				}
			}
			return result;
		},
		translate: (m, x, y, z) => m4.multiply(m, [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		]),
		rotateX(m, deg) {
			const c = Math.cos(deg * Math.PI / 180);
			const s = Math.sin(deg * Math.PI / 180);
			return this.multiply(m, [
				1, 0, 0, 0,
				0, c, s, 0,
				0, -s, c, 0,
				0, 0, 0, 1
			]);
		},
		rotateY(m, deg) {
			const c = Math.cos(deg * Math.PI / 180);
			const s = Math.sin(deg * Math.PI / 180);
			return this.multiply(m, [
				c, 0, -s, 0,
				0, 1, 0, 0,
				s, 0, c, 0,
				0, 0, 0, 1
			]);
		},
		rotateZ(m, deg) {
			const c = Math.cos(deg * Math.PI / 180);
			const s = Math.sin(deg * Math.PI / 180);
			return this.multiply(m, [
				c, s, 0, 0,
				-s, c, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]);
		},
		scale: (m, x, y, z) => m4.multiply(m, [
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		]),
		project: (m, w, h, d) => m4.multiply(m, [
			2 / w, 0, 0, 0,
			0, -2 / h, 0, 0,
			0, 0, 2 / d, 0,
			-1, 1, 0, 1
		])
	};
	Promise.all([fetch("./shaders/vertex.glsl").then(res => res.text()), fetch("./shaders/fragment.glsl").then(res => res.text())]).then(function(shaders) {
		const vertexShader = createShader(gl.VERTEX_SHADER, shaders[0]);
		const fragmentShader = createShader(gl.FRAGMENT_SHADER, shaders[1]);
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		const aPositionIndex = gl.getAttribLocation(program, "aPosition");
		const aColorIndex = gl.getAttribLocation(program, "aColor");
		const uMatrixIndex = gl.getUniformLocation(program, "uMatrix");
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		const vertices = [
			// left column front
			0, 0, 0,
			0, 150, 0,
			30, 0, 0,
			0, 150, 0,
			30, 150, 0,
			30, 0, 0,

			// top rung front
			30, 0, 0,
			30, 30, 0,
			100, 0, 0,
			30, 30, 0,
			100, 30, 0,
			100, 0, 0,

			// middle rung front
			30, 60, 0,
			30, 90, 0,
			67, 60, 0,
			30, 90, 0,
			67, 90, 0,
			67, 60, 0,

			// left column back
			0, 0, 30,
			30, 0, 30,
			0, 150, 30,
			0, 150, 30,
			30, 0, 30,
			30, 150, 30,

			// top rung back
			30, 0, 30,
			100, 0, 30,
			30, 30, 30,
			30, 30, 30,
			100, 0, 30,
			100, 30, 30,

			// middle rung back
			30, 60, 30,
			67, 60, 30,
			30, 90, 30,
			30, 90, 30,
			67, 60, 30,
			67, 90, 30,

			// top
			0, 0, 0,
			100, 0, 0,
			100, 0, 30,
			0, 0, 0,
			100, 0, 30,
			0, 0, 30,

			// top rung right
			100, 0, 0,
			100, 30, 0,
			100, 30, 30,
			100, 0, 0,
			100, 30, 30,
			100, 0, 30,

			// under top rung
			30, 30, 0,
			30, 30, 30,
			100, 30, 30,
			30, 30, 0,
			100, 30, 30,
			100, 30, 0,

			// between top rung and middle
			30, 30, 0,
			30, 60, 30,
			30, 30, 30,
			30, 30, 0,
			30, 60, 0,
			30, 60, 30,

			// top of middle rung
			30, 60, 0,
			67, 60, 30,
			30, 60, 30,
			30, 60, 0,
			67, 60, 0,
			67, 60, 30,

			// right of middle rung
			67, 60, 0,
			67, 90, 30,
			67, 60, 30,
			67, 60, 0,
			67, 90, 0,
			67, 90, 30,

			// bottom of middle rung.
			30, 90, 0,
			30, 90, 30,
			67, 90, 30,
			30, 90, 0,
			67, 90, 30,
			67, 90, 0,

			// right of bottom
			30, 90, 0,
			30, 150, 30,
			30, 90, 30,
			30, 90, 0,
			30, 150, 0,
			30, 150, 30,

			// bottom
			0, 150, 0,
			0, 150, 30,
			30, 150, 30,
			0, 150, 0,
			30, 150, 30,
			30, 150, 0,

			// left side
			0, 0, 0,
			0, 0, 30,
			0, 150, 30,
			0, 0, 0,
			0, 150, 30,
			0, 150, 0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([
			// left column front
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,

			// top rung front
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,

			// middle rung front
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,
			200, 70, 120,

			// left column back
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// top rung back
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// middle rung back
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// top
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,

			// top rung right
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,

			// under top rung
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,

			// between top rung and middle
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,

			// top of middle rung
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,

			// right of middle rung
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,

			// bottom of middle rung.
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,

			// right of bottom
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// bottom
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// left side
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220
		]), gl.STATIC_DRAW);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.useProgram(program);
		gl.enableVertexAttribArray(aPositionIndex);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.vertexAttribPointer(aPositionIndex, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aColorIndex);
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.vertexAttribPointer(aColorIndex, 3, gl.UNSIGNED_BYTE, true, 0, 0);
		let matrix = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
		matrix = m4.project(matrix, gl.canvas.width, gl.canvas.height, 400);
		matrix = m4.translate(matrix, 200, 150, 0);
		matrix = m4.rotateX(matrix, rx);
		matrix = m4.rotateY(matrix, ry);
		matrix = m4.rotateZ(matrix, rz);
		matrix = m4.translate(matrix, -50, -75, -15);
		gl.uniformMatrix4fv(uMatrixIndex, false, matrix);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
	});
	rx += 0.1;
	ry += 0.2;
	rz += 0.3;
});