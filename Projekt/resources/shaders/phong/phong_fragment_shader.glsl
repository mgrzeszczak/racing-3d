precision mediump float;

// UNIFORMS
uniform vec3 ambient;
uniform vec3 lightPos;
uniform vec3 lightColor;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 camPosition;
uniform sampler2D sampler;

// VARYING
varying vec3 worldPosition;
varying vec3 worldNormal;
varying vec3 lightDirection;
varying vec2 textureCoords;

// CONSTANTS
const float gamma = 2.2;
const float shininess = 30.0;
const float material_ks = 0.3;
const float material_kd = 0.7;

void main(){
    vec3 L = lightDirection;
    vec3 V = normalize(camPosition - worldPosition);
    float LdotN = max(dot(L,worldNormal),0.0);
    float diffuse = material_kd * LdotN;

    float specular = 0.0;

    if(LdotN > 0.0)
    {
        //choose H or R to see the difference
        vec3 R = -normalize(reflect(L, worldNormal));//Reflection
        specular = 0.0;
        specular = material_ks * pow(max(dot(R, V),0),shininess);
        //Blinn-Phong
        // vec3 H = normalize(L + V );//Halfway
        //specular = material_ks * pow(max(0, dot(H, world_normal)), material_shininess);
    }
    vec3 color = ambient + (diffuse+specular)*(texture2D(sampler, textureCoords).xyz);
    gl_FragColor = vec4(color,1.0);
}