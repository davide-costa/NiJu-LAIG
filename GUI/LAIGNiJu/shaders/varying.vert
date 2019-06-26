attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 RGBcolorVar;
varying vec2 vTextureCoord;
varying float timeFactorForVar;

uniform float timeFactor;
uniform float scaleFactor;
uniform vec3 RGBcolor;


void main() 
{
    float normScale = timeFactor * scaleFactor;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + (aVertexNormal * normScale * 0.1), 1.0);

	vTextureCoord = aTextureCoord;
    timeFactorForVar = timeFactor;
	RGBcolorVar = RGBcolor;
}