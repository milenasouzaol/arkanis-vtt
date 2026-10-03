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
      <div className="mesa-sessao-pessoa">
        <span className="mesa-sessao-ponto mesa-sessao-ponto-mestre" aria-hidden />
        <strong>{mestre ? mestre.nomeConta : 'Mestre ausente'} [Mestre]</strong>
      </div>
      <div className="mesa-sessao-metricas">
        Latência <b>{latencia === null ? '—' : `${latencia}ms`}</b> FPS <b>{fps}</b>
      </div>
      {jogadores.map((j) => (
        <div key={j.userId} className="mesa-sessao-pessoa">
          <span className="mesa-sessao-ponto" aria-hidden />
          {rotuloJogador(j)}
        </div>
      ))}
    </section>
  )
}
