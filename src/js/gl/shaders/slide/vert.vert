precision highp float;

uniform float uProgress;
uniform float uOffset;
uniform float uVelo;
uniform float uStrength;

#define M_PI 3.1415926535897932384626433832795

varying vec2 vUv;

void main(){
  vec3 pos = position;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);

  float dist = mvPosition.x / uOffset;
  mvPosition.z += sin(dist * M_PI + M_PI / 2.) * -uStrength * (1. + (uVelo * 1.5));

  vUv = uv;
  gl_Position = projectionMatrix * mvPosition;
}