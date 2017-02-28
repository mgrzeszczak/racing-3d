precision mediump float;
precision highp int;

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

const float gamma = 2.2;
const float shininess = 30.0;
const float lightAttenuation = 0.00001;

uniform float material_kd;
uniform float material_ks;

varying vec2 fragTexCoord;
uniform sampler2D sampler;

struct LightInfo {
    vec3 left;
    vec3 right;
    vec3 front;
    vec3 position;
    vec3 color;
    vec3 ambient;
    float attenuation;
};

uniform LightInfo reflectorLights[100];
uniform int lightCount;

float calculateDiffuse(vec3 L,vec3 N){
   return max(dot(L,N),0.0);
}

float calculateSpecular(vec3 camPos,vec3 worldPosition,vec3 vecToLight,vec3 outNormal,float shininess){
   vec3 viewDir = normalize(camPos-worldPosition);
   vec3 halfDir = normalize(vecToLight + viewDir);
   float specAngle = max(dot(halfDir, outNormal), 0.0);
   return pow(specAngle, shininess);
}

void main()
{
   float diffuse = calculateDiffuse(vecToLight,outNormal);
   float specular = 0.0;
   if (diffuse>0.0)
       specular+=calculateSpecular(camPos,worldPosition,vecToLight,outNormal,shininess);

   vec3 textureColor = texture2D(sampler, fragTexCoord).xyz;

   float distanceToLight = length(lightPos-worldPosition);
   float attenuation = 1.0/(1.0 + lightAttenuation * pow(distanceToLight, 2.0));

   vec3 totalDiffuse = diffuse*attenuation*material_kd*lightColor;
   vec3 totalSpecular = specular*attenuation*material_ks*lightColor;

    for (int i=0;i<100;i++){
       if (reflectorLights[i].color[0]==0.0) continue;

       vec3 front = reflectorLights[i].front;
       vec3 left = reflectorLights[i].left;
       vec3 right = reflectorLights[i].right;

       vec3 dir = normalize(worldPosition-reflectorLights[i].position);

       if (dot(dir,front)<0.0) continue;
       if (dot(dir,left)<0.0) continue;
       if (dot(dir,right)<0.0) continue;

       vec3 ldir = normalize(reflectorLights[i].position-worldPosition);

       diffuse = calculateDiffuse(ldir,outNormal);
       specular = 0.0;

       if(diffuse > 0.0) specular+=calculateSpecular(camPos,worldPosition,ldir,outNormal,shininess);

       distanceToLight = length(reflectorLights[i].position-worldPosition);
       attenuation = 1.0/(1.0 + reflectorLights[i].attenuation * pow(distanceToLight, 2.0));

       diffuse = attenuation*material_kd*diffuse;
       specular = attenuation*material_ks*specular;

       totalDiffuse += diffuse*reflectorLights[i].color;
       totalSpecular += specular*reflectorLights[i].color;
   }

   vec3 color = totalDiffuse.xyz*textureColor.xyz+totalSpecular+ambient;
   gl_FragColor = vec4(color,1.0);
}