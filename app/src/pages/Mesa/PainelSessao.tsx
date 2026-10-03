import { rotuloJogador, type Membro } from './mesa'

// Rodapé esquerdo da mesa (12.14): mestre com latência e FPS, e um item por jogador conectado.
export default function PainelSessao({ conectados, latencia, fps }: {
  conectados: Membro[]
  latencia: number | null
  fps: number
}) {
  const mestre = conectados.find((m) => m.papel === 'mestre')
  const jogadores = conectados.filter((m) => m.papel !== 'mestre')

  return (
    <section className="mesa-sessao" aria-label="Painel de sessão">
      <div className="mesa-sessao-mestre">
        <span className="mesa-sessao-ponto" aria-hidden />
        <strong>{mestre ? mestre.nomeConta : 'Mestre ausente'}</strong>
        <span className="mesa-sessao-metricas">
          {latencia === null ? '— ms' : `${latencia} ms`} · {fps} FPS
        </span>
      </div>
      {jogadores.map((j) => (
        <div key={j.userId} className="mesa-sessao-jogador">
          <span className="mesa-sessao-ponto" aria-hidden />
          {rotuloJogador(j)}
        </div>
      ))}
    </section>
  )
}
