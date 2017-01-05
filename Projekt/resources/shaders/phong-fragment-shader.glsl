precision mediump float;

varying vec3 fragColor;
varying vec3 worldPosition;
varying vec3 outNormal;
varying vec3 vecToLight;

uniform vec3 ambient;
uniform vec3 lightPos;
uniform vec3 lightColor;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 camPos;

uniform bool hasTexture;

const float gamma = 2.2;
const float shininess = 80.0;

varying vec2 fragTexCoord;
uniform sampler2D sampler;

void main()
{
   float diffuse = max(dot(vecToLight,outNormal), 0.0);
   float specular = 0.0;

   if(diffuse > 0.0) {
     vec3 viewDir = normalize(camPos-worldPosition);
     vec3 reflectDir = -normalize(reflect(vecToLight, outNormal));
     float specAngle = max(dot(reflectDir, viewDir), 0.0);
     specular = pow(specAngle, shininess/4.0);
   }
   vec3 textureColor = texture2D(sampler, fragTexCoord).xyz;
   vec3 color = ambient + diffuse*(lightColor.xyz*textureColor.xyz)+specular*lightColor.xyz;

   gl_FragColor = vec4(color,1.0);
}