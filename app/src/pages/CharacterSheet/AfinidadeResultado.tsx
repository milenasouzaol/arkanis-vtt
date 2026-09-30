import { elementoPorChave, type ChaveElemento } from './elementosParanormais'
import { ARQUETIPOS, CITACOES } from './arquetipos'
import { Moldura } from './AfinidadeEmpate'

/** Resultado do Teste de Personalidade: o elemento que venceu e quem veio depois dele. */
export default function AfinidadeResultado({
  ranking,
  onAceitar,
  onRecusar,
}: {
  /** Do mais forte pro mais fraco; o primeiro e o resultado. */
  ranking: ChaveElemento[]
  onAceitar: (elemento: ChaveElemento) => void
  onRecusar: () => void
}) {
  const e = elementoPorChave(ranking[0])!
  const arquetipo = ARQUETIPOS[e.key]
  const citacao = CITACOES[e.key]
  const outros = ranking.slice(1).map((k) => elementoPorChave(k)!)

  return (
    <div
      className="afin-final afin-empate aba-travada"
      style={{ '--elemento-cor': e.cor, '--elemento-fundo': `url(${e.fundo})` } as React.CSSProperties}
    >
      <div className="afin-final-fundo" />
      <div className="afin-final-correnteza" />
      <Moldura />

      <div className="afin-resultado-miolo">
        <h2 className="afin-empate-titulo">{e.frase}</h2>
        {arquetipo && (
          <p className="afin-empate-sub">Sua alma flui através de ondas de <em>{arquetipo.nome}</em></p>
        )}

        <div className="afin-resultado-corpo">
          <div className="afin-resultado-emblema">
            <img className={arquetipo ? '' : 'simbolo'} src={arquetipo?.emblema ?? e.simbolo} alt="" />
            <span className="afin-empate-nome">{e.nome}</span>
            {arquetipo && <span className="afin-resultado-arquetipo">{arquetipo.nome}</span>}
          </div>

          <div className="afin-resultado-cartao">
            {arquetipo && (
              <section>
                <h3>{arquetipo.titulo}</h3>
                <p>{arquetipo.texto}</p>
              </section>
            )}
            <section>
              <h3>{e.nome}</h3>
              <p>{citacao ? `“${citacao}”` : e.descricao}</p>
            </section>
            {outros.length > 0 && (
              <footer className="afin-resultado-rodape">
                <span className="afin-resultado-rotulo">O Outro Lado também reconheceu:</span>
                <span className="afin-resultado-outros">
                  {outros.map((o, i) => (
                    <span key={o.key}>
                      {i > 0 && ' | '}
                      <span style={{ color: o.cor }}>{ARQUETIPOS[o.key]?.nome ?? o.nome}</span>
                    </span>
                  ))}
                </span>
              </footer>
            )}
          </div>
        </div>

        <div className="afin-resultado-botoes">
          <button type="button" className="afin-resultado-botao" onClick={onRecusar}>Recusar</button>
          <button type="button" className="afin-resultado-botao" onClick={() => onAceitar(e.key)}>Aceitar</button>
        </div>
      </div>
    </div>
  )
}
