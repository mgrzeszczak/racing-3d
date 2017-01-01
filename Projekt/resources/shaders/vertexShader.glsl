precision mediump float;
            
attribute vec3 position;
//attribute vec3 texture;
attribute vec3 inNormal;

varying vec3 vecToLight;
varying vec3 outNormal;
varying vec3 fragColor;

uniform vec3 ambient;
uniform vec3 lightPos;
uniform vec3 lightColor;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{
  vecToLight = normalize(lightPos-position);
  outNormal = inNormal;
  vec3 color = lightColor * min((max(dot(normalize(outNormal),vecToLight),0.0) + ambient),1.0);
  fragColor = color;
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);
}