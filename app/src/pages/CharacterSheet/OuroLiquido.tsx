import FundoShader from './FundoShader'

/*
 * Ouro derretido de Conhecimento, com os veios em movimento.
 *
 * Ruido "dobrado" sobre ele mesmo (domain warp), pintado nas faixas de cor do marmore que
 * a Millie aprovou. O tempo entra nas dobras, entao os veios escorrem e se retorcem, em
 * vez de a imagem so deslizar.
 */

// Escuro > meio > ouro > meio > escuro > meio > brilho > ouro > meio > escuro > meio > ouro
const ESCURO = [0.31, 0.2, 0.06]
const MEIO = [0.43, 0.32, 0.14]
const OURO = [0.55, 0.41, 0.16]
const BRILHO = [0.69, 0.55, 0.24]
export const FAIXAS = [ESCURO, MEIO, OURO, MEIO, ESCURO, MEIO, BRILHO, OURO, MEIO, ESCURO, MEIO, OURO]

export const RUIDO_GLSL = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * ruido(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`

const FRAGMENTO = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform vec3 faixa[12];
${RUIDO_GLSL}
vec3 cor(float x) {
  x = clamp(x, 0.0, 1.0) * 11.0;
  vec3 c = faixa[0];
  for (int i = 0; i < 11; i++) {
    if (x >= float(i)) c = mix(faixa[i], faixa[i + 1], clamp(x - float(i), 0.0, 1.0));
  }
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / res.y * 1.7;
  // Duas dobras: a primeira entorta o espaco, a segunda entorta de novo usando a primeira.
  vec2 q = vec2(fbm(uv + t * 0.030), fbm(uv + vec2(5.2, 1.3) - t * 0.024));
  vec2 r = vec2(fbm(uv + 3.0 * q + vec2(1.7, 9.2) + t * 0.040),
                fbm(uv + 3.0 * q + vec2(8.3, 2.8) - t * 0.033));
  float f = fbm(uv + 3.2 * r);
  vec3 c = cor(f * 2.2 - 0.62);
  // Sombra larga por cima, como a segunda camada do marmore estatico.
  c *= mix(1.0, 0.72 + 0.5 * fbm(uv * 0.6 - t * 0.015), 0.45);
  gl_FragColor = vec4(c, 1.0);
}
`

export default function OuroLiquido({ parado = false }: { parado?: boolean }) {
  return <FundoShader fragmento={FRAGMENTO} faixas={FAIXAS} reserva="afin-ouro-liso" parado={parado} inicio={40} />
}
