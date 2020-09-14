precision highp float;

uniform sampler2D uTexture;

uniform float uProgress;

uniform bool uOut;

vec4 transparent = vec4(0., 0., 0., 0.);

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  vec4 tex = texture2D(uTexture, uv);

  if (!uOut) uv.y = 1. - uv.y;
  float t = step(uv.y, uProgress);
  vec4 color = mix(transparent, tex, t);
  
  gl_FragColor = color;
}  