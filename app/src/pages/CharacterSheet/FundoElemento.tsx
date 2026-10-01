import type { ChaveElemento } from './elementosParanormais'
import OuroLiquido from './OuroLiquido'

/**
 * Fundo das telas cheias da Afinidade. Conhecimento tem o ouro derretido com os veios em
 * movimento; os outros usam o fundo do elemento borrado com a correnteza escura por cima.
 */
export default function FundoElemento({ elemento }: { elemento: ChaveElemento }) {
  if (elemento === 'conhecimento') {
    return (
      <div className="afin-fundo-ouro" aria-hidden>
        <OuroLiquido />
      </div>
    )
  }
  return (
    <>
      <div className="afin-final-fundo" />
      <div className="afin-final-correnteza" />
    </>
  )
}
