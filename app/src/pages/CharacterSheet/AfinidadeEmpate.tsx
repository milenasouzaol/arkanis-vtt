import { useState } from 'react'
import { elementoPorChave, type ChaveElemento } from './elementosParanormais'
import { ARQUETIPOS } from './arquetipos'
import molduraSupEsq from '../../assets/afinidade/moldura-sup-esq.webp'
import molduraSupDir from '../../assets/afinidade/moldura-sup-dir.webp'
import molduraInfEsq from '../../assets/afinidade/moldura-inf-esq.webp'
import molduraInfDir from '../../assets/afinidade/moldura-inf-dir.webp'

/** Os quatro cantos da moldura, usados no empate e no resultado. */
export function Moldura() {
  return (
    <>
      <img className="afin-empate-moldura sup-esq" src={molduraSupEsq} alt="" />
      <img className="afin-empate-moldura sup-dir" src={molduraSupDir} alt="" />
      <img className="afin-empate-moldura inf-esq" src={molduraInfEsq} alt="" />
      <img className="afin-empate-moldura inf-dir" src={molduraInfDir} alt="" />
    </>
  )
}

/** "Decida seu Destino": quando o teste quase empata, a pessoa escolhe entre os do topo. */
export default function AfinidadeEmpate({
  opcoes,
  onEscolher,
}: {
  opcoes: ChaveElemento[]
  onEscolher: (elemento: ChaveElemento) => void
}) {
  const [escolhido, setEscolhido] = useState<ChaveElemento>(opcoes[0])
  const atual = elementoPorChave(escolhido)!

  return (
    <div
      className="afin-final afin-empate aba-travada"
      style={{ '--elemento-cor': atual.cor, '--elemento-fundo': `url(${atual.fundo})` } as React.CSSProperties}
    >
      {/* Mesmo fundo da tela final, na cor de quem esta escolhido agora. */}
      <div className="afin-final-fundo" />
      <div className="afin-final-correnteza" />
      <Moldura />

      <div className="afin-empate-miolo">
        <h2 className="afin-empate-titulo">Decida seu Destino</h2>
        <p className="afin-empate-sub">Você gera conflito entre as entidades do Outro Lado.</p>

        <div className="afin-empate-opcoes">
          {opcoes.map((k) => {
            const e = elementoPorChave(k)!
            const arquetipo = ARQUETIPOS[k]
            return (
              <button
                key={k}
                type="button"
                className={`afin-empate-opcao${escolhido === k ? ' escolhido' : ''}`}
                onClick={() => setEscolhido(k)}
                aria-pressed={escolhido === k}
              >
                <img className={`afin-empate-imagem${arquetipo ? '' : ' simbolo'}`} src={arquetipo?.emblema ?? e.simbolo} alt="" />
                <span className="afin-empate-nome">{arquetipo?.nome ?? e.nome}</span>
                {arquetipo && <span className="afin-empate-elemento">{e.nome}</span>}
              </button>
            )
          })}
        </div>

        <button type="button" className="afin-aceitar" onClick={() => onEscolher(escolhido)}>Escolher</button>
      </div>
    </div>
  )
}
