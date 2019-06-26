#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 RGBcolorVar;
varying float timeFactorForVar;

uniform sampler2D uSampler;

void main() 
{
	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(mix(color.rgb, RGBcolorVar, timeFactorForVar), timeFactorForVar);
}