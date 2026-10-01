import FundoShader from './FundoShader'
import { RUIDO_GLSL } from './OuroLiquido'

/*
 * Morte: uma gota caindo na agua, no centro da tela.
 *
 * A agua e uma superficie de verdade: a altura dela vem dos aneis das gotas mais um
 * tremor leve, e dessa altura sai a inclinacao em cada ponto. Com a inclinacao a luz
 * reflete nas cristas (o brilho que faz parecer agua) e o fundo e visto entortado, como
 * o fundo de um lago. O fundo e o marmore escuro em espiral do print (#141211 a #2b2b29).
 */

// Uma gota a cada 14s; os aneis andam devagar, como agua parada.
const PERIODO = '14.0'

const FRAGMENTO = `
precision mediump float;
uniform vec2 res;
uniform float t;
${RUIDO_GLSL}

// Altura dos aneis de uma gota: um pacote que anda do centro pra fora e se apaga.
float anel(float d, float idade) {
  float frente = idade * 0.09;
  float pacote = exp(-pow((d - frente) * 13.0, 2.0));
  float some = 1.0 - smoothstep(${PERIODO} * 0.8, ${PERIODO}, idade);
  // O primeiro instante e o respingo: forte e concentrado no centro.
  float respingo = exp(-idade * 2.5) * exp(-d * d * 400.0);
  return (sin((d - frente) * 42.0) * pacote * some + respingo) / (1.0 + d * 0.9);
}

float altura(vec2 p) {
  float d = length(p);
  float h = 0.0;
  for (int k = 0; k < 3; k++) {
    h += anel(d, mod(t - float(k) * ${PERIODO} / 3.0, ${PERIODO}));
  }
  // Tremor leve da superficie, pra agua nunca ficar parada que nem vidro.
  h += (fbm(p * 3.5 + vec2(t * 0.05, -t * 0.04)) - 0.5) * 0.05;
  return h;
}

void main() {
  vec2 p = (gl_FragCoord.xy - res * 0.5) / res.y;

  // Inclinacao da agua a partir da altura dos vizinhos.
  float e = 1.5 / res.y;
  float h = altura(p);
  float hx = altura(p + vec2(e, 0.0)) - h;
  float hy = altura(p + vec2(0.0, e)) - h;
  vec3 n = normalize(vec3(-hx, -hy, e * 16.0));

  // Refracao: o fundo e visto deslocado pela inclinacao da agua.
  vec2 q = p + n.xy * 0.05;

  // Fundo: marmore em espiral, o angulo gira mais perto do centro.
  float ang = atan(q.y, q.x) + 2.2 / (0.35 + length(q)) + t * 0.02;
  vec2 esp = vec2(cos(ang), sin(ang)) * length(q);
  float f = fbm(esp * 3.0 + vec2(fbm(q * 2.0 + t * 0.03), fbm(q * 2.0 - t * 0.025)) * 1.6);
  vec3 escuro = vec3(0.078, 0.071, 0.067);
  vec3 claro = vec3(0.19, 0.185, 0.175);
  vec3 c = mix(escuro, claro, smoothstep(0.25, 0.8, f));

  // Luz de cima e um pouco do lado: sombreia as encostas e brilha nas cristas.
  vec3 luz = normalize(vec3(-0.45, 0.55, 1.0));
  float difusa = dot(n, luz);
  float brilho = pow(max(dot(reflect(-luz, n), vec3(0.0, 0.0, 1.0)), 0.0), 90.0);
  // Agua reflete mais olhando de lado: as encostas pegam um reflexo frio e palido.
  float fresnel = pow(1.0 - n.z, 3.0);

  c *= 0.85 + 0.2 * difusa;
  c += vec3(0.3, 0.3, 0.29) * brilho * 0.35;
  c += vec3(0.1, 0.1, 0.1) * fresnel * 0.4;
  gl_FragColor = vec4(c, 1.0);
}
`

export default function GotaMorte({ parado = false }: { parado?: boolean }) {
  return <FundoShader fragmento={FRAGMENTO} reserva="afin-morte-liso" parado={parado} inicio={2} />
}
