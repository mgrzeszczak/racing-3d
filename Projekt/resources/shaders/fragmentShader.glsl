precision mediump float;
        
varying vec3 fragColor;

varying vec3 outNormal;
varying vec3 vecToLight;
uniform vec3 ambient;
uniform vec3 lightColor;

void main()
{
  //vec3 ambient = vec3(0.1 0.1 0.1);
  //vec3 color = vec3(1.0 1.0 1.0) * min((max(dot(normalize(outNormal) vec3(0.01.00.0)) 0.0) + ambient)1.0);
  vec3 color = fragColor;
  gl_FragColor = vec4(color,1.0);
}