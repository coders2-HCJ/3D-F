attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uMatrix;
varying vec4 vColor;
void main() {
    gl_Position = uMatrix * aPosition;
    vColor = aColor;
}
