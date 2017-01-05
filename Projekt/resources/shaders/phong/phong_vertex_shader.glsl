precision mediump float;

// ATTRIBUTES
attribute vec3 position;
attribute vec3 normal;
attribute vec2 texture;

// UNIFORMS
uniform vec3 ambient;
uniform vec3 lightPos;
uniform vec3 lightColor;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 camPosition;

// VARYING
varying vec3 worldPosition;
varying vec3 worldNormal;
varying vec3 lightDirection;
varying vec2 textureCoords;
 
void main()
{
    worldPosition = mat3(worldMatrix) * position;
    worldNormal = normalize(mat3(worldMatrix) * normal);
    gl_Position = projectionMatrix*viewMatrix*worldMatrix*vec4(position,1);
    textureCoords = texture;
}