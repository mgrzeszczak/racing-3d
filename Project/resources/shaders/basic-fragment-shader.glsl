precision mediump float;

uniform vec3 ambient;
varying vec3 outSpecular;
varying vec3 outDiffuse;
varying vec2 textureCoords;
uniform sampler2D sampler;

void main()
{
    vec3 textureColor = texture2D(sampler, textureCoords).xyz;
    vec3 color = ambient + outDiffuse.xyz*textureColor.xyz+ outSpecular;
    gl_FragColor = vec4(color,1.0);
}