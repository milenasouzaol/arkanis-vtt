import { useEffect, useRef, useState } from 'react'

/*
 * Ouro derretido de Conhecimento, com os veios em movimento.
 *
 * Um shader pequeno roda na placa de video: ruido "dobrado" sobre ele mesmo (domain warp),
 * pintado nas mesmas faixas de cor do marmore que a Millie aprovou. O tempo entra nas
 * dobras, entao os veios escorrem e se retorcem, em vez de a imagem so deslizar.
 *
 * Desenha em meia resolucao e o CSS amplia: fica liso como metal e pesa um quarto.
 */

// Escuro > meio > ouro > meio > escuro > meio > brilho > ouro > meio > escuro > meio > ouro
const ESCURO = [0.31, 0.2, 0.06]
const MEIO = [0.43, 0.32, 0.14]
const OURO = [0.55, 0.41, 0.16]
const BRILHO = [0.69, 0.55, 0.24]
export const FAIXAS = [ESCURO, MEIO, OURO, MEIO, ESCURO, MEIO, BRILHO, OURO, MEIO, ESCURO, MEIO, OURO]

const VERTICE = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAGMENTO = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform vec3 faixa[12];

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

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const s = gl.createShader(tipo)!
  gl.shaderSource(s, fonte)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

/** `parado`: desenha um quadro so (preferencia de menos movimento, ou fundo sem animacao). */
export default function OuroLiquido({ parado = false, className = '' }: { parado?: boolean; className?: string }) {
  const tela = useRef<HTMLCanvasElement>(null)
  const [semWebgl, setSemWebgl] = useState(false)

  useEffect(() => {
    const canvas = tela.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) { setSemWebgl(true); return }

    let programa: WebGLProgram
    try {
      programa = gl.createProgram()!
      gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, VERTICE))
      gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTO))
      gl.linkProgram(programa)
      if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error('link')
    } catch {
      setSemWebgl(true)
      return
    }
    gl.useProgram(programa)

    // Um triangulo que cobre a tela inteira.
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const p = gl.getAttribLocation(programa, 'p')
    gl.enableVertexAttribArray(p)
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0)

    gl.uniform3fv(gl.getUniformLocation(programa, 'faixa'), new Float32Array(FAIXAS.flat()))
    const uRes = gl.getUniformLocation(programa, 'res')
    const uT = gl.getUniformLocation(programa, 't')

    const ajustar = () => {
      // meia resolucao: o CSS amplia
      const w = Math.max(1, Math.round(canvas.clientWidth / 2))
      const h = Math.max(1, Math.round(canvas.clientHeight / 2))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
    }

    const menosMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const inicio = performance.now()
    let quadro = 0
    const desenhar = () => {
      ajustar()
      // Comeca adiantado pra o primeiro quadro ja ter os veios formados.
      gl.uniform1f(uT, 40 + (performance.now() - inicio) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!parado && !menosMovimento) quadro = requestAnimationFrame(desenhar)
    }
    desenhar()

    const aoRedimensionar = () => { if (parado || menosMovimento) desenhar() }
    window.addEventListener('resize', aoRedimensionar)
    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('resize', aoRedimensionar)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [parado])

  // Sem placa de video disponivel, cai num dourado liso em vez de tela preta.
  if (semWebgl) return <div className={`afin-ouro-liso ${className}`} aria-hidden />
  return <canvas ref={tela} className={`afin-ouro-tela ${className}`} aria-hidden />
}
