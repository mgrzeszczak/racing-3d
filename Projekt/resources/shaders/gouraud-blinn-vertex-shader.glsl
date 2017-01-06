precision mediump float;
            
attribute vec3 position;
attribute vec3 inNormal;
attribute vec2 texture;

varying vec3 vecToLight;
varying vec3 normal;
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
const float shininess = 30.0;
const float lightAttenuation = 0.0001;

varying vec3 outSpecular;
varying vec3 outDiffuse;
varying vec2 textureCoords;

void main()
{
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(position,1.0);
  worldPosition = vec3(worldMatrix * vec4(position,1.0));
  outNormal = normalize(vec3(worldMatrix*vec4(inNormal,0.0)));
  vecToLight = normalize(lightPos-worldPosition);

  float diffuse = max(dot(vecToLight,outNormal), 0.0);
     float specular = 0.0;

     if(diffuse > 0.0) {
        vec3 viewDir = normalize(camPos-worldPosition);
        vec3 halfDir = normalize(vecToLight + viewDir);
        float specAngle = max(dot(halfDir, outNormal), 0.0);
        specular = pow(specAngle, shininess);
     }
     //vec3 textureColor = texture2D(sampler, texture).xyz;
     //vec3 color = ambient + material_kd*diffuse*(lightColor.xyz*textureColor.xyz)+specular*lightColor.xyz;
    float distanceToLight = length(lightPos-worldPosition);
    float attenuation = 1.0/(1.0 + lightAttenuation * pow(distanceToLight, 2.0));

    textureCoords = texture;
    outDiffuse = attenuation*material_kd*diffuse*(lightColor);
    outSpecular = attenuation*material_ks*specular*lightColor.xyz;

}