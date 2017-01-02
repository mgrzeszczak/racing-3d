precision mediump float;

attribute vec3 position;
//attribute vec3 texture;
attribute vec3 inNormal;

attribute vec2 texture;
varying vec2 fragTexCoord;

varying vec3 vecToLight;
varying vec3 normal;
varying vec3 fragColor;
varying vec3 outNormal;
varying vec3 worldPosition;

uniform vec3 ambient;
uniform vec3 lightPos;
uniform vec3 lightColor;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 camPos;

const float gamma = 2.2;
const float shininess = 30.0;

void main()
{
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);

  fragColor = lightColor;
  worldPosition = (worldMatrix * vec4(position,1.0)).xyz;
  vecToLight = normalize(lightPos-worldPosition);
  outNormal = inNormal;
  fragTexCoord = texture;
}