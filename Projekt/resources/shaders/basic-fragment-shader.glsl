precision mediump float;
        
varying vec3 fragColor;

varying vec3 outNormal;
varying vec3 vecToLight;
uniform vec3 ambient;
uniform vec3 lightColor;

void main()
{
  gl_FragColor = vec4(fragColor,1.0);
}