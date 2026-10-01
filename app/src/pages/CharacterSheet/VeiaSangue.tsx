import FundoShader from './FundoShader'
import { RUIDO_GLSL } from './OuroLiquido'

/*
 * Sangue: dentro de uma veia, com os coagulos passando da esquerda pra direita.
 *
 * Os coagulos sao manchas ovais de borda irregular (celulas de Voronoi esticadas na
 * horizontal e entortadas por ruido), com o miolo mais escuro. Duas camadas: a de tras
 * menor e mais lenta, a da frente maior e mais rapida, o que da a profundidade do tubo.
 * As paredes da veia, em cima e embaixo, ficam um pouco mais escuras.
 * Cores medidas do print da Millie: o vermelho do fundo (#69120b) e o dos coagulos (#51120a).
 */

const FRAGMENTO = `
precision mediump float;
uniform vec2 res;
uniform float t;
${RUIDO_GLSL}

// Quanto um ponto esta dentro de um coagulo (0 fora, 1 dentro), numa camada.
float coagulos(vec2 uv, float escala, float velocidade, float semente) {
  vec2 p = uv * escala;
  p.x -= t * velocidade;
  // A correnteza balanca os coagulos e deixa a borda deles irregular.
  p += (vec2(fbm(p * 0.7 + semente + t * 0.1), fbm(p * 0.7 - semente - t * 0.08)) - 0.5) * 0.7;
  vec2 i = floor(p);
  vec2 f = fract(p);
  float melhor = 9.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash(i + g + semente), hash(i + g + semente + 17.3));
      vec2 dif = g + o - f;
      dif.x /= 1.6;
      // Cada coagulo tem um tamanho; alguns somem de vez, pra nao virar um padrao certinho.
      float raio = mix(0.18, 0.36, hash(i + g + semente + 41.7));
      melhor = min(melhor, length(dif) - raio);
    }
  }
  return 1.0 - smoothstep(-0.02, 0.05, melhor);
}

void main() {
  vec2 uv = gl_FragCoord.xy / res.y;
  vec3 fundo = vec3(0.412, 0.071, 0.043);
  vec3 coagulo = vec3(0.318, 0.071, 0.039);

  vec3 c = fundo;
  // Camada de tras: mais apagada.
  float atras = coagulos(uv, 7.0, 0.35, 3.1);
  c = mix(c, mix(fundo, coagulo, 0.55), atras);
  // Camada da frente, com o miolo manchado mais escuro.
  float frente = coagulos(uv, 4.5, 0.45, 0.0);
  vec2 m = uv * 9.0 - vec2(t * 0.45 * 2.0, 0.0);
  float miolo = smoothstep(0.45, 0.75, fbm(m));
  c = mix(c, coagulo * (1.0 - 0.12 * miolo), frente);

  // Paredes da veia: um pouco mais escuras em cima e embaixo.
  float y = gl_FragCoord.y / res.y;
  c *= 0.86 + 0.14 * sin(3.14159 * y);
  gl_FragColor = vec4(c, 1.0);
}
`

export default function VeiaSangue({ parado = false }: { parado?: boolean }) {
  return <FundoShader fragmento={FRAGMENTO} reserva="afin-sangue-liso" parado={parado} inicio={10} />
}
