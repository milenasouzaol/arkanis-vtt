import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { armaServe, textoDoEncanto, type AlvoDoEncanto, type Encanto } from './encantos'

export type ArmaEscolhivel = { inventario_id: string; character_id: string; personagem: string; item: string; tipo: string | null; natureza: string | null; encantos: Encanto[] }

// Amaldiçoar Arma, Arma Atroz, Chamas do Caos: escolher qual arma (a sua ou a de um aliado da
// campanha) e, quando o ritual pede, o elemento.
export default function EscolherArmaModal({ ritual, alvo, elementos, campanhaId, characterId, onEscolher, onClose }: {
  ritual: string
  alvo: AlvoDoEncanto
  elementos: string[]
  campanhaId: string | null
  characterId: string
  onEscolher: (arma: ArmaEscolhivel, elemento: string) => void
  onClose: () => void
}) {
  const [armas, setArmas] = useState<ArmaEscolhivel[] | null>(null)
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const [elemento, setElemento] = useState(elementos[0] ?? '')

  useEffect(() => {
    if (campanhaId) {
      supabase.rpc('armas_da_campanha', { p_campaign_id: campanhaId }).then(({ data }) => setArmas((data ?? []) as ArmaEscolhivel[]))
      return
    }
    // Fora de campanha: só as armas do próprio personagem.
    supabase
      .from('character_inventory')
      .select('id, encantos, custom_item, equipment_items(name, type, stats)')
      .eq('character_id', characterId)
      .then(({ data }) =>
        setArmas(
          (data ?? []).map((i: any) => ({
            inventario_id: i.id, character_id: characterId, personagem: 'Você',
            item: i.equipment_items?.name ?? i.custom_item?.name ?? 'Item',
            tipo: i.equipment_items?.type ?? i.custom_item?.type ?? null,
            natureza: i.equipment_items?.stats?.natureza ?? i.custom_item?.stats?.natureza ?? null,
            encantos: i.encantos ?? [],
          })),
        ),
      )
  }, [campanhaId, characterId])

  const lista = (armas ?? []).filter((a) => armaServe(alvo, a))
  const arma = lista.find((a) => a.inventario_id === escolhida)

  return createPortal(
    <div className="conditions-modal-backdrop" onClick={onClose}>
      <div className="escolher-arma" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${ritual}: escolher arma`}>
        <h3>{ritual}</h3>
        <p className="escolher-arma-dica">
          Escolha a arma{alvo === 'qualquer_arma_ou_municao' ? ' (qualquer uma, inclusive de fogo) ou a munição' : ' corpo a corpo'} — a sua ou a de um aliado.
        </p>
        {elementos.length > 0 && (
          <label className="escolher-arma-elemento">
            Elemento
            <select value={elemento} onChange={(e) => setElemento(e.target.value)}>
              {elementos.map((el) => <option key={el} value={el}>{el}</option>)}
            </select>
          </label>
        )}
        <ul className="escolher-arma-lista">
          {armas === null && <li className="escolher-arma-dica">Carregando…</li>}
          {armas !== null && !lista.length && <li className="escolher-arma-dica">Ninguém tem uma arma que sirva pra este ritual.</li>}
          {lista.map((a) => (
            <li key={a.inventario_id}>
              <button type="button" className={escolhida === a.inventario_id ? 'ativo' : undefined} onClick={() => setEscolhida(a.inventario_id)}>
                <strong>{a.item}</strong>
                <span>{a.personagem}</span>
                {a.encantos.length > 0 && <small>{a.encantos.map((e) => `${e.nome}: ${textoDoEncanto(e)}`).join(' · ')}</small>}
              </button>
            </li>
          ))}
        </ul>
        <div className="escolher-arma-acoes">
          <button type="button" className="inv-item-btn" onClick={onClose}>Cancelar</button>
          <button type="button" className="inv-item-btn" disabled={!arma} onClick={() => arma && onEscolher(arma, elemento)}>Conjurar</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
