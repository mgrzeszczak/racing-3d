precision mediump float;
            
attribute vec3 position;
attribute vec3 inNormal;
attribute vec2 texture;

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
uniform float material_kd;
uniform float material_ks;

const float gamma = 2.2;
const float shininess = 80.0;

uniform sampler2D sampler;

void main()
{
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);
  fragColor = lightColor;
  worldPosition = (mat3(worldMatrix) * position);
  outNormal = normalize(mat3(worldMatrix)*inNormal);
  vecToLight = normalize(lightPos-worldPosition);

  float diffuse = material_kd*max(dot(vecToLight,outNormal), 0.0);
  float specular = 0.0;

  if(diffuse > 0.0) {
    vec3 viewDir = normalize(camPos-worldPosition);
    vec3 reflectDir = -normalize(reflect(vecToLight, outNormal));
    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    specular = material_ks*pow(specAngle, shininess/4.0);
  }
  vec3 textureColor = texture2D(sampler, texture).xyz;
  vec3 color = ambient + diffuse*(lightColor.xyz*textureColor.xyz)+specular*lightColor.xyz;

  fragColor = color;
}