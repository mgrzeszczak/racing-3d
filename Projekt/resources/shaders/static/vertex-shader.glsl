precision mediump float;

attribute vec3 position;
attribute vec3 inNormal;
attribute vec2 texture;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec3 outNormal;
varying vec2 textureCoords;

void main()
{
  outNormal = normalize(vec3(worldMatrix*vec4(inNormal,0.0)));
  textureCoords = texture;
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);
}