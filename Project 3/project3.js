// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
	constructor()
	{
		this.prog   = InitShaderProgram( curvesVS, curvesFS );
		// [TO-DO] Other initializations should be done here.
		// [TO-DO] This is a good place to get the locations of attributes and uniform variables.

		//Uniform varible location of model view projection var
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.firstVert = gl.getUniformLocation(this.prog, 'p0');
		this.secondVert = gl.getUniformLocation(this.prog, 'p1');
		this.thirdVert = gl.getUniformLocation(this.prog, 'p2');
		this.fourthVert = gl.getUniformLocation(this.prog, 'p3');

		// Vertex attribut location
		this.time = gl.getAttribLocation(this.prog, 't');
		
		// Initialize the attribute buffer
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}

		// [TO-DO] This is where you can create and set the contents of the vertex buffer object
		// for the vertex attribute we need.
		this.timeBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.timeBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);

	}
	setViewport( width, height )
	{
		// [TO-DO] This is where we should set the transformation matrix.
		// [TO-DO] Do not forget to bind the program before you set a uniform variable value.
		// this will be a transformation matrix
		// Compute the orthographic projection matrix and send it to the shader
		var trans = [2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1]; //orthographic view

		gl.useProgram(this.prog);	// Bind the program
		gl.uniformMatrix4fv(this.mvp, false, trans);
	}
	updatePoints( pt )
	{
		// [TO-DO] The control points have changed, we must update corresponding uniform variables.
		// [TO-DO] Do not forget to bind the program before you set a uniform variable value.
		// [TO-DO] We can access the x and y coordinates of the i^th control points using
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");
		// get attributes of cx and cy for each point and bind them to their corresponding buffers
		var p = [];
		for (var i = 0; i < 4; ++i) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			p.push(x);
			p.push(y);
		}

		// Bind First Vert Data
		gl.useProgram(this.prog);
		gl.uniform2fv(this.firstVert, new Float32Array(p.slice(0, 2)));

		// Bind Second Vert Data
		gl.useProgram(this.prog);
		gl.uniform2fv(this.secondVert, new Float32Array(p.slice(2, 4)));

		// Bind Third Vert Data
		gl.useProgram(this.prog);
		gl.uniform2fv(this.thirdVert, new Float32Array(p.slice(4, 6)));

		// Bind Fourth Vert Data
		gl.useProgram(this.prog);
		gl.uniform2fv(this.fourthVert, new Float32Array(p.slice(6, 8)));

	}
	draw()
	{
		// [TO-DO] This is where we give the command to draw the curve.
		// [TO-DO] Do not forget to bind the program and set the vertex attribute.

		gl.useProgram(this.prog);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.timeBuffer);
		gl.vertexAttribPointer(this.time, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.time);
		gl.drawArrays(gl.LINE_STRIP, 0, this.steps);
	}
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		vec2 position = (pow(1.0 - t, 3.0) * p0) + (3.0 * pow(1.0 - t, 2.0) * t * p1) + (3.0 * (1.0 - t) * pow(t, 2.0) * p2) + (pow(t, 3.0) * p3);

		// [TO-DO] Replace the following with the proper vertex shader code
		gl_Position = mvp * vec4(position,0,1);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;