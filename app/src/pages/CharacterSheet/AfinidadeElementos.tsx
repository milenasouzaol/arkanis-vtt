import { useState } from 'react'
import { ELEMENTOS, elementoPorChave, type ChaveElemento } from './elementosParanormais'
import transcender from '../../assets/afinidade/simbolo-transcender.webp'

export default function AfinidadeElementos({
  onAceitar,
  onVoltar,
}: {
  onAceitar: (key: ChaveElemento) => void
  onVoltar: () => void
}) {
  const [escolhido, setEscolhido] = useState<ChaveElemento | null>(null)
  const atual = elementoPorChave(escolhido)

  return (
    <div
      className={`afin-palco${atual ? ' com-elemento' : ''}`}
      style={atual ? ({ '--elemento-tinta': atual.tinta } as React.CSSProperties) : undefined}
    >
      {/* Camada ampliada: a arte, os orbes e o selo andam juntos, grudados nos circulos. */}
      <div className="afin-arte">
        {ELEMENTOS.map((e) => (
          <button
            key={e.key}
            type="button"
            className={`afin-orbe${escolhido === e.key ? ' escondido' : ''}`}
            style={{ left: `${e.x}%`, top: `${e.y}%`, '--orbe-cor': e.cor } as React.CSSProperties}
            onClick={() => setEscolhido(e.key)}
            aria-label={e.nome}
          >
            <img src={e.simbolo} alt="" />
          </button>
        ))}

        <div className="afin-centro-selo afin-arte-selo">
          <img className="afin-centro-transcender" src={transcender} alt="" />
          {atual && <img className="afin-centro-elemento" src={atual.simbolo} alt="" />}
        </div>
      </div>

      {/* Camada de texto, fora da ampliacao, pra as fontes ficarem no tamanho certo. */}
      <div className="afin-sobre">
        <button type="button" className="afin-voltar" onClick={onVoltar}>Voltar</button>

        {atual && (
          <>
            <div className="afin-sobre-topo">
              <div className="afin-centro-nome">{atual.nome}</div>
              <p className="afin-centro-descricao">{atual.descricao}</p>
            </div>
            <div className="afin-sobre-pe">
              <button type="button" className="afin-aceitar" onClick={() => onAceitar(atual.key)}>
                Aceitar o meu destino
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
