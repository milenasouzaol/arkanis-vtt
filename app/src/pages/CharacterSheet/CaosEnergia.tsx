import FundoShader from './FundoShader'
import { RUIDO_GLSL } from './OuroLiquido'

/*
 * Energia: o mesmo marmore em faixas do ouro de Conhecimento, nas cores roxas e magenta
 * do print da Millie, mas sem direcao certa. No ouro o tempo empurra as dobras sempre pro
 * mesmo lado; aqui cada dobra vai e volta em ritmos diferentes que nunca se repetem
 * juntos, entao os veios incham, encolhem e trocam de rumo o tempo todo.
 */

// Escuro > roxo > violeta > magenta > escuro > roxo > lilas > violeta > roxo > escuro > roxo > magenta
const ESCURO = [0.17, 0.06, 0.25]
const ROXO = [0.27, 0.09, 0.4]
const VIOLETA = [0.37, 0.15, 0.55]
const MAGENTA = [0.45, 0.16, 0.45]
const LILAS = [0.5, 0.3, 0.6]
export const FAIXAS_ENERGIA = [ESCURO, ROXO, VIOLETA, MAGENTA, ESCURO, ROXO, LILAS, VIOLETA, ROXO, ESCURO, ROXO, MAGENTA]

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

// Um deslocamento que vai e volta sem rumo: senos de periodos que nao batem entre si.
vec2 vaguear(float t, float s) {
  return vec2(sin(t * 0.13 + s) + 0.6 * sin(t * 0.31 + s * 2.3),
              cos(t * 0.11 + s * 1.7) + 0.6 * cos(t * 0.27 + s * 0.9));
}

void main() {
  vec2 uv = gl_FragCoord.xy / res.y * 1.7;
  vec2 q = vec2(fbm(uv + vaguear(t, 0.0)), fbm(uv + vec2(5.2, 1.3) + vaguear(t, 2.0)));
  vec2 r = vec2(fbm(uv + 3.0 * q + vec2(1.7, 9.2) + vaguear(t, 4.0) * 0.8),
                fbm(uv + 3.0 * q + vec2(8.3, 2.8) + vaguear(t, 6.0) * 0.8));
  float f = fbm(uv + 3.2 * r);
  vec3 c = cor(f * 2.2 - 0.62);
  c *= mix(1.0, 0.72 + 0.5 * fbm(uv * 0.6 + vaguear(t, 8.0) * 0.3), 0.45);
  gl_FragColor = vec4(c, 1.0);
}
`

export default function CaosEnergia({ parado = false }: { parado?: boolean }) {
  return <FundoShader fragmento={FRAGMENTO} faixas={FAIXAS_ENERGIA} reserva="afin-energia-liso" parado={parado} inicio={20} />
}
