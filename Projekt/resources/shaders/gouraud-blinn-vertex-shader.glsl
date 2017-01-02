precision mediump float;
            
attribute vec3 position;
//attribute vec3 texture;
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

const float gamma = 2.2;
const float shininess = 30.0;

uniform sampler2D sampler;

void main()
{
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);

  worldPosition = (worldMatrix * vec4(position,1.0)).xyz;
  vecToLight = normalize(lightPos-worldPosition);
  outNormal = inNormal;

  vec3 normal = normalize((worldMatrix*vec4(outNormal,0.0)).xyz);

  float lambertian = max(dot(vecToLight,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {
    vec3 viewDir = normalize(camPos-worldPosition);
    vec3 halfDir = normalize(vecToLight + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, shininess);
  }

  vec3 textureColor = texture2D(sampler, texture).xyz;
  vec3 colorLinear = ambient + lambertian * (lightColor.xyz*textureColor.xyz) + specular * lightColor;
  // apply gamma correction (assume ambientColor, diffuseColor and specColor
  // have been linearized, i.e. have no gamma correction in them)
  //vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0/gamma));
  // use the gamma corrected color in the fragment
  fragColor = colorLinear;
}