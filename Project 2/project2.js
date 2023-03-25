// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	var radians = (rotation * Math.PI) / 180;

	var sM = Array(scale, 0, 0, 0, scale, 0, 0, 0, 1);
	var rM = Array(Math.cos(radians), Math.sin(radians), 0, -1 * Math.sin(radians), Math.cos(radians), 0, 0, 0, 1);
	var tM = Array(1, 0, 0, 0, 1, 0, positionX, positionY, 1);

	var transMatrix = matrixMultiplication(rM, sM);
							
	transMatrix = matrixMultiplication(tM, transMatrix);

	return transMatrix;

}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	return matrixMultiplication(trans2, trans1);
}

function matrixMultiplication(matrix1, matrix2) {
	var retArray = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);

	for (var i = 0; i < 9; i+=3) {
		retArray[i] = matrix1[0] * matrix2[i] + matrix1[3] * matrix2[i + 1] + matrix1[6] * matrix2[i + 2];
		retArray[i + 1] = matrix1[1] * matrix2[i] + matrix1[4] * matrix2[i + 1] + matrix1[7] * matrix2[i + 2];
		retArray[i + 2] = matrix1[2] * matrix2[i] + matrix1[5] * matrix2[i + 1] + matrix1[8] * matrix2[i + 2];
    }

	return retArray;
}
