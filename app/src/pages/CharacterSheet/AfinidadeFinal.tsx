import { elementoPorChave, type ChaveElemento } from './elementosParanormais'
import transcender from '../../assets/afinidade/simbolo-transcender.webp'

export default function AfinidadeFinal({
  elemento,
  onFinalizar,
  onVoltar,
}: {
  elemento: ChaveElemento
  onFinalizar: () => void
  onVoltar: () => void
}) {
  const e = elementoPorChave(elemento)
  if (!e) return null

  return (
    <div
      className="afin-final"
      style={{ '--elemento-cor': e.cor, '--elemento-fundo': `url(${e.fundo})` } as React.CSSProperties}
    >
      {/* O fundo do elemento entra borrado, e por cima passa a correnteza mais escura. */}
      <div className="afin-final-fundo" />
      <div className="afin-final-correnteza" />

      <button type="button" className="afin-voltar" onClick={onVoltar}>Voltar</button>

      <div className="afin-final-miolo">
        <h2 className="afin-final-frase">{e.frase}</h2>
        <div className="afin-centro-selo afin-final-selo">
          <img className="afin-centro-transcender" src={transcender} alt="" />
          <img className="afin-centro-elemento" src={e.simbolo} alt="" />
        </div>
        <button type="button" className="afin-aceitar" onClick={onFinalizar}>Finalizar</button>
      </div>
    </div>
  )
}
