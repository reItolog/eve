precision highp float;
precision highp int;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

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