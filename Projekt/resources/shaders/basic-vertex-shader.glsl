precision mediump float;

attribute vec3 position;
attribute vec3 inNormal;
attribute vec2 texture;


varying vec2 fragTexCoord;
varying vec3 vecToLight;
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
  fragColor = lightColor;
  worldPosition = vec3(worldMatrix * vec4(position,1.0));
  outNormal = normalize(vec3(worldMatrix*vec4(inNormal,0.0)));
  //worldPosition = (mat3(worldMatrix) * position);
  //outNormal = normalize(mat3(worldMatrix)*inNormal);
  vecToLight = normalize(lightPos-worldPosition);
  fragTexCoord = texture;
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);
}