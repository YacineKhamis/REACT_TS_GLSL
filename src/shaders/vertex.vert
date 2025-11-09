#version 330

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}