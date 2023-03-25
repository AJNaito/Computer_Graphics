// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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

	var mv = MatrixMult(trans, rot);
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram(meshVS, meshFS);

		// Uniform transformations
		this.projection = gl.getUniformLocation(this.prog, 'projection');
		this.mvt = gl.getUniformLocation(this.prog, 'mvt');
		this.imvt = gl.getUniformLocation(this.prog, 'imvt');

		// booleans
		this.show = gl.getUniformLocation(this.prog, 'show');
		this.flip = gl.getUniformLocation(this.prog, 'flip');
		this.validTex = gl.getUniformLocation(this.prog, 'validTex');

		// Blinn/Phong Vars
		this.I = gl.getUniformLocation(this.prog, 'I');
		this.InitL = gl.getUniformLocation(this.prog, 'InitL');
		this.shiny = gl.getUniformLocation(this.prog, 'alpha');

		// attribute Model Params
		this.vertPos = gl.getAttribLocation(this.prog, 'pos');
		this.textCoords = gl.getAttribLocation(this.prog, 'txc');
		this.normals = gl.getAttribLocation(this.prog, 'normals');

		// Buffers
		this.vertBuffer = gl.createBuffer();
		this.textBuffer = gl.createBuffer();
		this.normsBuffer = gl.createBuffer();

		// Default
		gl.useProgram(this.prog);
		gl.uniform1i(this.show, 1);
		gl.uniform1i(this.validTex, 0);
		gl.uniform4f(this.I, 1, 1, 1, 1);
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.prog);

		if (swap) {
			gl.uniform1i(this.flip, 1);
		} else {
			gl.uniform1i(this.flip, 0);
        }
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.projection, false, matrixMVP);
		gl.uniformMatrix4fv(this.mvt, false, matrixMV);
		gl.uniformMatrix3fv(this.imvt, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textBuffer);
		gl.vertexAttribPointer(this.textCoords, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.textCoords);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normsBuffer);
		gl.vertexAttribPointer(this.normals, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normals);

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

		gl.useProgram(this.prog);
		this.shader = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(this.shader, 0);
		gl.uniform1i(this.validTex, 1);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		gl.useProgram(this.prog);

		if (show) {
			gl.uniform1i(this.show, 1);
		} else {
			gl.uniform1i(this.show, 0);
        }
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		gl.useProgram(this.prog);

		gl.uniform3f(this.InitL, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		gl.useProgram(this.prog);
		gl.uniform1f(this.shiny, shininess);
	}
}

var meshVS = `
	precision mediump float;
	uniform mat4 projection;
	uniform mat4 mvt;
	uniform mat3 imvt;
	uniform vec3 InitL;
	uniform int flip;

	attribute vec3 pos;
	attribute vec2 txc;
	attribute vec3 normals;

	varying vec2 texCoord;
	varying vec3 L, N, V;

	void main() {
		if (flip == 1) {
			vec3 position = vec3(pos[0], pos[2], pos[1]);
			gl_Position = projection * vec4(position, 1);
		} else {
			gl_Position = projection * vec4(pos, 1);
		}

		N = normalize((imvt * normals).xyz);
		V = -normalize((mvt * vec4(pos, 1)).xyz);
		L = normalize((mvt * vec4(InitL, 0)).xyz);

		texCoord = txc;
	}
`;

var meshFS = `
	precision mediump float;
	uniform vec4 I;
	uniform float alpha;
	uniform int show;
	uniform int validTex;
	uniform sampler2D tex;

	varying vec2 texCoord;
	varying vec3 L, N, V;

	void main() {
		vec4 diffuseColor = vec4(1, 1, 1, 1);
		if (show == 1 && validTex == 1) {
			diffuseColor = texture2D(tex, texCoord);
		}

		vec4 diffuse = max(dot(L, N), 0.0) * (diffuseColor * I);
		vec3 H = normalize(L + V);

		vec4 specular = 
			pow(max(dot(N, H), 0.0), alpha) * (vec4(1,1,1,1) * I);

		if (dot(L, N) < 0.0) {
			specular = vec4(0.0,0.0,0.0, 1.0);
		}

		vec4 shaded = diffuse + specular;

		gl_FragColor = shaded;
	}
`;
