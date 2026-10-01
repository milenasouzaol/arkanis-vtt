import type { ChaveElemento } from './elementosParanormais'
import OuroLiquido from './OuroLiquido'
import GotaMorte from './GotaMorte'
import CaosEnergia from './CaosEnergia'
import VeiaSangue from './VeiaSangue'

/**
 * Fundo das telas cheias da Afinidade. Conhecimento tem o ouro derretido com os veios em
 * movimento; Morte, a gota caindo na agua; Energia, o marmore roxo sem rumo;
 * Sangue, os coagulos passando dentro da veia. Os outros usam o fundo do elemento borrado com
 * a correnteza escura por cima.
 */
export default function FundoElemento({ elemento }: { elemento: ChaveElemento }) {
  if (elemento === 'conhecimento') {
    return (
      <div className="afin-fundo-ouro" aria-hidden>
        <OuroLiquido />
      </div>
    )
  }
  if (elemento === 'morte') {
    return (
      <div className="afin-fundo-ouro afin-fundo-morte" aria-hidden>
        <GotaMorte />
      </div>
    )
  }
  if (elemento === 'energia') {
    return (
      <div className="afin-fundo-ouro afin-fundo-energia" aria-hidden>
        <CaosEnergia />
      </div>
    )
  }
  if (elemento === 'sangue') {
    return (
      <div className="afin-fundo-ouro afin-fundo-sangue" aria-hidden>
        <VeiaSangue />
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
