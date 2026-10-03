import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackwardStep, faForwardStep, faPenToSquare, faPlay, faPlus, faSkull, faStop, faTrash, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'
import { vdTotal, type Combatente } from './combate'
import type { Barras, Combate, Vida } from './useCombate'

// Aba Encontros de Combate (12.4). Sem combate rodando: a lista dos combates salvos
// (Nome + VD + Iniciar). Rodando: a ordem de iniciativa, os turnos e a rodada.
export default function PainelCombate({ souMestre, combates, vdDe, ativo, ordem, vidas, barras, meusPersonagens, onCriar, onEditar, onExcluir, onIniciar, onEncerrar, onAdicionar, onPassar, onRemover, onAbrir }: {
  souMestre: boolean
  combates: Combate[]
  vdDe: Record<string, number | null>
  ativo: Combate | null
  ordem: Combatente[]
  vidas: Record<string, Vida>
  barras: (c: Combatente) => Barras | null
  meusPersonagens: string[]
  onCriar: () => void
  onEditar: (c: Combate) => void
  onExcluir: (c: Combate) => void
  onIniciar: (c: Combate) => void
  onEncerrar: (c: Combate) => void
  onAdicionar: (c: Combate) => void
  onPassar: (c: Combate, voltar: boolean) => void
  onRemover: (c: Combate, combatenteId: string) => void
  onAbrir: (c: Combatente) => void
}) {
  if (!ativo) {
    return (
      <div className="cenas-painel combate-painel">
        {!combates.length ? (
          <div className="combate-vazio">
            <p>Sem Combates</p>
            {souMestre && <button type="button" className="mesa-botao" onClick={onCriar}><FontAwesomeIcon icon={faPlus} /> Criar Combate</button>}
          </div>
        ) : (
          <>
            {souMestre && (
              <div className="cenas-botoes combate-botoes">
                <button type="button" className="mesa-botao" onClick={onCriar}><FontAwesomeIcon icon={faPlus} /> Criar Combate</button>
              </div>
            )}
            <ul className="combate-lista">
              {combates.map((c) => (
                <li key={c.id} className="combate-card">
                  <div>
                    <strong>{c.name}</strong>
                    <span>VD: {vdTotal(c.ameacas, Object.entries(vdDe).map(([id, vd]) => ({ id, vd })))}</span>
                  </div>
                  {souMestre && (
                    <div className="combate-card-acoes">
                      <button type="button" className="combate-icone" aria-label={`Editar ${c.name}`} onClick={() => onEditar(c)}><FontAwesomeIcon icon={faPenToSquare} /></button>
                      <button type="button" className="combate-icone" aria-label={`Excluir ${c.name}`} onClick={() => window.confirm(`Excluir o combate "${c.name}"?`) && onExcluir(c)}><FontAwesomeIcon icon={faTrash} /></button>
                      <button type="button" className="mesa-botao" onClick={() => onIniciar(c)}><FontAwesomeIcon icon={faPlay} /> Iniciar</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {!souMestre && <p className="mesa-painel-vazio">Nenhum combate em andamento.</p>}
          </>
        )}
      </div>
    )
  }

  const barra = (valor: [number, number | null], classe: string) => (
    <span className={`combate-barra ${classe}`}>
      {valor[1] ? <span style={{ width: `${Math.max(0, Math.min(100, (valor[0] / valor[1]) * 100))}%` }} /> : null}
      <small>{valor[0]}{valor[1] !== null ? `/${valor[1]}` : ''}</small>
    </span>
  )

  return (
    <div className="cenas-painel combate-painel">
      <header className="combate-topo">
        <strong>{ativo.name}</strong>
        {souMestre && (
          <div className="combate-topo-acoes">
            <button type="button" className="combate-icone" aria-label="Adicionar ameaças" title="Adicionar" onClick={() => onAdicionar(ativo)}><FontAwesomeIcon icon={faPlus} /></button>
            <button type="button" className="combate-icone" aria-label="Encerrar combate" title="Encerrar" onClick={() => window.confirm('Encerrar o combate?') && onEncerrar(ativo)}><FontAwesomeIcon icon={faStop} /></button>
          </div>
        )}
      </header>

      <ol className="combate-ordem">
        {ordem.map((c) => {
          const vez = c.id === ativo.turno_atual
          const meu = c.character_id !== null && meusPersonagens.includes(c.character_id)
          const b = barras(c)
          const vida = vidas[c.id]
          // Jogador não vê a vida nem a ficha dos monstros (12.4).
          const verDetalhes = c.tipo === 'jogador' || souMestre
          return (
            <li key={c.id} className={`combate-linha${vez ? ' vez' : ''}${meu ? ' meu' : ''}`}>
              <button type="button" className="combate-quem" disabled={!verDetalhes} onClick={() => onAbrir(c)}>
                <span className="ator-token">{c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={c.tipo === 'ameaca' ? faSkull : faUser} />}</span>
                <span className="combate-nome">
                  <strong>{c.name}</strong>
                  {b && (
                    <span className="combate-barras">
                      {barra(b.pv, 'vida')}
                      {barra(b.pe, 'esforco')}
                      {barra(b.san, 'sanidade')}
                    </span>
                  )}
                  {souMestre && vida && <span className="combate-barras">{barra([vida.pv_atual, vida.pv_max], 'vida')}</span>}
                </span>
              </button>
              <span className="combate-iniciativa" title="Iniciativa">{c.iniciativa}</span>
              {souMestre && c.tipo === 'ameaca' && vida && vida.pv_atual <= 0 && (
                <button type="button" className="combate-icone" aria-label={`Tirar ${c.name} do combate`} title="Tirar do combate" onClick={() => onRemover(ativo, c.id)}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <footer className="combate-rodape">
        {souMestre && (
          <div className="combate-turnos">
            <button type="button" className="mesa-botao" onClick={() => onPassar(ativo, true)}><FontAwesomeIcon icon={faBackwardStep} /> Voltar Turno</button>
            <button type="button" className="mesa-botao" onClick={() => onPassar(ativo, false)}>Próximo turno <FontAwesomeIcon icon={faForwardStep} /></button>
          </div>
        )}
        <p>Rodada Atual: <strong>{ativo.rodada}</strong></p>
      </footer>
    </div>
  )
}

// Indicador de turno no topo do mapa (12.4): a fila inteira do combate, na ordem da
// iniciativa, em cards verticais. Todo mundo fica apagado; quem está na vez fica aceso.
// Quem está na vez clica no próprio card pra passar o turno, e o destaque anda pro próximo.
export function IndicadorTurno({ ativo, ordem, meusPersonagens, souMestre, onPassar }: {
  ativo: Combate
  ordem: Combatente[]
  meusPersonagens: string[]
  souMestre: boolean
  onPassar: () => void
}) {
  const atual = ordem.find((c) => c.id === ativo.turno_atual)
  if (!ordem.length) return null
  const minhaVez = atual?.character_id != null && meusPersonagens.includes(atual.character_id)
  return (
    <div className="indicador-turno" role="status" aria-live="polite" aria-label={atual ? `Vez de ${atual.name}` : 'Combate'}>
      <ol className="indicador-turno-fila">
        {ordem.map((c) => {
          const vez = c.id === ativo.turno_atual
          const pode = vez && (minhaVez || souMestre)
          return (
            <li key={c.id} className={`indicador-turno-card${vez ? ' vez' : ''}`}>
              <button
                type="button"
                className={pode ? 'pode' : undefined}
                disabled={!pode}
                title={pode ? (minhaVez ? 'Clique pra passar o turno' : 'Passar o turno') : c.name}
                onClick={onPassar}
              >
                {c.image_url ? <img src={c.image_url} alt="" draggable={false} /> : <FontAwesomeIcon icon={c.tipo === 'ameaca' ? faSkull : faUser} />}
              </button>
            </li>
          )
        })}
      </ol>
      {atual && <span className="indicador-turno-nome">{minhaVez ? 'Sua vez' : atual.name}</span>}
    </div>
  )
}
