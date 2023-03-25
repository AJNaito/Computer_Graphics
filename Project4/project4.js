// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1];

	var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1];

	var rot = MatrixMult(rotY, rotX);
	var transformation = MatrixMult(trans, rot);


	var mvp = MatrixMult(projectionMatrix, transformation);

	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram(meshVS, meshFS);

		//Uniform variables
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.flipYZ = gl.getUniformLocation(this.prog, 'flip');
		this.showTex = gl.getUniformLocation(this.prog, 'show');
		this.hasTex = gl.getUniformLocation(this.prog, 'validTex');

		//attribute variables
		this.vertPos = gl.getAttribLocation(this.prog, 'pos');
		this.txtCoord = gl.getAttribLocation(this.prog, 'txc')

		// Create buffer
		this.vertBuffer = gl.createBuffer();
		this.txtBuffer = gl.createBuffer();

		// Default values
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTex, 1);
		gl.uniform1i(this.hasTex, 0);
	}


	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.prog);

		if (swap) {
			gl.uniform1i(this.flipYZ, 1);
		} else {
			gl.uniform1i(this.flipYZ, 0);
		}
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvp, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtBuffer);
		gl.vertexAttribPointer(this.txtCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.txtCoord);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		// You can set the texture image data using the following command.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// bind texture to data
		gl.useProgram(this.prog);
		this.shader = gl.getUniformLocation(this.prog, 'tex')
		gl.uniform1i(this.shader, 0);
		gl.uniform1i(this.hasTex, 1);
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show)
	{
		gl.useProgram(this.prog);

		if (show) {
			gl.uniform1i(this.showTex, 1);
		} else {
			gl.uniform1i(this.showTex, 0);
		}
	}
	
}
var meshVS = `
	attribute vec3 pos;
	attribute vec2 txc;
	uniform mat4 mvp;
	uniform int flip;
	varying mediump vec2 texCoord;

	void main()
	{
		if (flip == 1) {
			vec3 position = vec3(pos[0], pos[2], pos[1]);
			gl_Position = mvp * vec4(position,1);
		} else {
			gl_Position = mvp * vec4(pos,1);
		}

		texCoord = txc;
	}
`;
// Fragment shader source code
var meshFS = `
	uniform int show;
	uniform int validTex;
	uniform sampler2D tex;
	varying mediump vec2 texCoord;

	void main()
	{
		if (show == 1 && validTex == 1) {
			gl_FragColor = texture2D(tex, texCoord);
		} else {
			gl_FragColor = vec4(1,gl_FragCoord.z * gl_FragCoord.z,0,1);
		}
	}
`;
