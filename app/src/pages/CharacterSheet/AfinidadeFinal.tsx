import { elementoPorChave, type ChaveElemento } from './elementosParanormais'
import FundoElemento from './FundoElemento'
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
      className="afin-final aba-travada"
      style={{ '--elemento-cor': e.cor, '--elemento-fundo': `url(${e.fundo})` } as React.CSSProperties}
    >
      <FundoElemento elemento={e.key} />

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
