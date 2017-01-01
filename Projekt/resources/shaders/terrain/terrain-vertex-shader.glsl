precision mediump float;

attribute vec3 position;
attribute vec3 color;

varying vec3 fragColor;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{
  fragColor = color;
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);
}