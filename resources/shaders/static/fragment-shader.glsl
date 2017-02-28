precision mediump float;

varying vec2 textureCoords;
uniform sampler2D sampler;

void main()
{
    vec3 textureColor = texture2D(sampler, textureCoords).xyz;
    gl_FragColor = vec4(textureColor,1.0);
}