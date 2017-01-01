precision mediump float;

attribute vec3 position;
//attribute vec3 texture;
attribute vec3 inNormal;

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

  /*


  vec3 normal = normalize((worldMatrix*vec4(outNormal,1.0)).xyz);
  //vec3 color = lightColor * min((max(dot(normalize((worldMatrix*vec4(outNormal,1.0)).xyz),vecToLight),0.0) + ambient),1.0);
  //fragColor = color;

  float lambertian = max(dot(vecToLight,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {
    vec3 viewDir = normalize(camPos-worldPosition);
    // this is blinn phong
    vec3 halfDir = normalize(vecToLight + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, shininess);

    // this is phong (for comparison)
    //if(mode == 2) {
    //vec3 reflectDir = reflect(-vecToLight, outNormal);
    //float specAngle = max(dot(reflectDir, viewDir), 0.0);
    // note that the exponent is different here
    //specular = pow(specAngle, shininess/4.0);
  }
  vec3 textureColor = vec3(0.5,0.05,0.05);
  vec3 colorLinear = ambient + lambertian * (lightColor.xyz*textureColor.xyz) + specular * lightColor;
  //colorLinear.xyz = colorLinear.xyz*textureColor.xyz;
  // apply gamma correction (assume ambientColor, diffuseColor and specColor
  // have been linearized, i.e. have no gamma correction in them)
  //vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0/gamma));
  // use the gamma corrected color in the fragment
  fragColor = colorLinear;*/
}