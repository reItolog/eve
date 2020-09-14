precision mediump float;

uniform float uProgress;
uniform float uVelo;

#define M_PI 3.1415926535897932384626433832795

varying vec2 vUv;

void main(){
  vec3 pos = position;

  pos.y += ((sin(uv.x * M_PI) * uVelo) * 0.35);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}