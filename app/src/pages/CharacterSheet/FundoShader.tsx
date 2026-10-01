import { useEffect, useRef, useState } from 'react'

/*
 * Fundo desenhado na placa de video (WebGL), redesenhado a cada quadro. Recebe o shader
 * de fragmento pronto; aqui fica so a parte chata: contexto, triangulo que cobre a tela,
 * resolucao, tempo e o laco de animacao.
 *
 * Desenha em meia resolucao e o CSS amplia: fica liso e pesa um quarto.
 */

const VERTICE = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const s = gl.createShader(tipo)!
  gl.shaderSource(s, fonte)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

export default function FundoShader({
  fragmento,
  faixas,
  reserva,
  parado = false,
  inicio = 0,
}: {
  /** Shader com `uniform vec2 res` e `uniform float t` (segundos). */
  fragmento: string
  /** Cores pro `uniform vec3 faixa[N]`, se o shader usar. */
  faixas?: number[][]
  /** Classe do fundo liso usado quando nao ha WebGL. */
  reserva: string
  /** Desenha um quadro so (fundo sem animacao, ou "menos movimento" no sistema). */
  parado?: boolean
  /** Tempo inicial, pra o primeiro quadro ja aparecer formado. */
  inicio?: number
}) {
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
      gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, fragmento))
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

    if (faixas) gl.uniform3fv(gl.getUniformLocation(programa, 'faixa'), new Float32Array(faixas.flat()))
    const uRes = gl.getUniformLocation(programa, 'res')
    const uT = gl.getUniformLocation(programa, 't')

    const ajustar = () => {
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
    const comeco = performance.now()
    let quadro = 0
    const desenhar = () => {
      ajustar()
      gl.uniform1f(uT, inicio + (performance.now() - comeco) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!parado && !menosMovimento) quadro = requestAnimationFrame(desenhar)
    }
    desenhar()

    const aoRedimensionar = () => { if (parado || menosMovimento) desenhar() }
    window.addEventListener('resize', aoRedimensionar)
    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('resize', aoRedimensionar)
      // Nao derrubar o contexto aqui: o React (StrictMode) desmonta e monta de novo o mesmo
      // canvas, e getContext devolveria o contexto ja derrubado, caindo no fundo liso.
      // Quando o canvas sai da tela de verdade, o navegador libera o contexto sozinho.
    }
  }, [fragmento, faixas, parado, inicio])

  if (semWebgl) return <div className={reserva} aria-hidden />
  return <canvas ref={tela} className="fundo-shader" aria-hidden />
}
