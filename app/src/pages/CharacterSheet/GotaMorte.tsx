import FundoShader from './FundoShader'
import { RUIDO_GLSL } from './OuroLiquido'

/*
 * Morte: uma gota caindo na agua, no centro da tela.
 *
 * Por baixo, o marmore escuro em espiral do print da referencia (#141211 a #2b2b29). Por
 * cima, de tempos em tempos uma gota cai no centro: os aneis se abrem pra fora, entortam o
 * marmore como agua entorta o fundo, e se apagam. Tres gotas se revezam, entao sempre ha
 * aneis andando.
 */

const PERIODO = '7.5'

const FRAGMENTO = `
precision mediump float;
uniform vec2 res;
uniform float t;
${RUIDO_GLSL}

// Onda de uma gota: um pacote de aneis que anda pra fora a partir do centro e se apaga.
float onda(float d, float idade) {
  float frente = idade * 0.17;
  float pacote = exp(-pow((d - frente) * 9.0, 2.0));
  float aneis = sin((d - frente) * 70.0);
  float some = 1.0 - smoothstep(0.0, ${PERIODO}, idade);
  // Perto do centro a onda e mais forte; espalhando, perde forca.
  return aneis * pacote * some / (1.0 + d * 3.0);
}

void main() {
  vec2 p = (gl_FragCoord.xy - res * 0.5) / res.y;
  float d = length(p);

  float w = 0.0;
  for (int k = 0; k < 3; k++) {
    float idade = mod(t - float(k) * ${PERIODO} / 3.0, ${PERIODO});
    w += onda(d, idade);
  }

  // A agua entorta o fundo na direcao dos aneis.
  vec2 dir = d > 0.0001 ? p / d : vec2(0.0);
  vec2 q = p + dir * w * 0.035;

  // Marmore em espiral: o angulo gira mais perto do centro, e o ruido segue o giro.
  float ang = atan(q.y, q.x) + 2.2 / (0.35 + length(q)) + t * 0.02;
  vec2 esp = vec2(cos(ang), sin(ang)) * length(q);
  float f = fbm(esp * 3.0 + vec2(fbm(q * 2.0 + t * 0.03), fbm(q * 2.0 - t * 0.025)) * 1.6);

  // Tons medidos no print: do quase preto ao cinza do fundo.
  vec3 escuro = vec3(0.078, 0.071, 0.067);
  vec3 claro = vec3(0.19, 0.185, 0.175);
  vec3 c = mix(escuro, claro, smoothstep(0.25, 0.8, f));

  // A crista dos aneis pega um pouco de luz; o vale escurece.
  c += vec3(0.11, 0.105, 0.1) * max(w, 0.0) - vec3(0.03) * max(-w, 0.0);
  gl_FragColor = vec4(c, 1.0);
}
`

export default function GotaMorte({ parado = false }: { parado?: boolean }) {
  return <FundoShader fragmento={FRAGMENTO} reserva="afin-morte-liso" parado={parado} inicio={2} />
}
