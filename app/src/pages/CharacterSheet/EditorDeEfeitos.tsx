import { PERICIAS } from './itemMods'
import { ATRIBUTOS_DO_EFEITO, alvosDoContexto, infoDoAlvo, textoDoEfeito, type AlvoDoEfeito, type Contexto, type EfeitoEscolhido } from './efeitosEscolhidos'

// Linhas de efeito da condição/maldição/modificação personalizada (pedido da Millie, 08/10):
// em quê mexe, quanto, se é em valor ou em dados, e (no item) se só vale quando ligado.
export default function EditorDeEfeitos({ contexto, efeitos, onChange }: {
  contexto: Contexto
  efeitos: EfeitoEscolhido[]
  onChange: (lista: EfeitoEscolhido[]) => void
}) {
  const alvos = alvosDoContexto(contexto)

  function novo(): EfeitoEscolhido {
    return { alvo: 'defesa', modo: 'valor', valor: contexto === 'condicao' ? -2 : 2 }
  }

  function mudar(i: number, patch: Partial<EfeitoEscolhido>) {
    onChange(efeitos.map((e, j) => {
      if (j !== i) return e
      const proximo = { ...e, ...patch }
      // Trocou o alvo: ajusta o modo e o "qual" pro que o alvo aceita.
      if (patch.alvo) {
        const info = infoDoAlvo(patch.alvo)
        const modos = info.modos[contexto]
        if (!modos.includes(proximo.modo)) proximo.modo = modos[0]
        proximo.qual = info.qual === 'pericia' ? PERICIAS[0] : info.qual === 'atributo' ? 'agilidade' : null
        if (!info.ligavel || contexto !== 'item') proximo.ligavel = false
      }
      return proximo
    }))
  }

  return (
    <div className="efeitos-escolhidos">
      {efeitos.map((e, i) => {
        const info = infoDoAlvo(e.alvo)
        const modos = info.modos[contexto]
        return (
          <div key={i} className="efeitos-escolhidos-linha">
            <select className="conditions-modal-custom-name" aria-label="Mexe em" value={e.alvo} onChange={(ev) => mudar(i, { alvo: ev.target.value as AlvoDoEfeito })}>
              {alvos.map((a) => <option key={a.id} value={a.id}>{a.rotulo}</option>)}
            </select>
            {info.qual === 'pericia' && (
              <select className="conditions-modal-custom-name" aria-label="Perícia" value={e.qual ?? ''} onChange={(ev) => mudar(i, { qual: ev.target.value })}>
                {PERICIAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            {info.qual === 'atributo' && (
              <select className="conditions-modal-custom-name" aria-label="Atributo" value={e.qual ?? ''} onChange={(ev) => mudar(i, { qual: ev.target.value })}>
                {ATRIBUTOS_DO_EFEITO.map((a) => <option key={a.id} value={a.id}>{a.rotulo}</option>)}
              </select>
            )}
            <input
              className="conditions-modal-custom-name efeitos-escolhidos-valor"
              type="number"
              aria-label="Quanto"
              value={e.valor}
              onChange={(ev) => mudar(i, { valor: Math.trunc(Number(ev.target.value) || 0) })}
            />
            {modos.length > 1 ? (
              <select className="conditions-modal-custom-name" aria-label="Em valor ou em dados" value={e.modo} onChange={(ev) => mudar(i, { modo: ev.target.value as EfeitoEscolhido['modo'] })}>
                <option value="valor">no valor</option>
                <option value="dados">{e.alvo === 'dano' ? 'dados de dano' : 'em dados (d20)'}</option>
              </select>
            ) : (
              <span className="efeitos-escolhidos-modo">{e.modo === 'dados' ? 'dados' : 'no valor'}</span>
            )}
            {contexto === 'item' && info.ligavel && (
              <label className="efeitos-escolhidos-ligavel" title="Vira um liga/desliga no item: só soma quando ligado">
                <input type="checkbox" checked={!!e.ligavel} onChange={(ev) => mudar(i, { ligavel: ev.target.checked })} /> só quando ligado
              </label>
            )}
            <button type="button" className="mods-modal-remove" onClick={() => onChange(efeitos.filter((_, j) => j !== i))} aria-label="Tirar este efeito">×</button>
            <span className="efeitos-escolhidos-resumo">{textoDoEfeito(e)}</span>
          </div>
        )
      })}
      <button type="button" className="mods-modal-btn" onClick={() => onChange([...efeitos, novo()])}>+ Adicionar efeito</button>
      <p className="efeitos-escolhidos-dica">Negativo diminui (ex.: -1 em dados = -1d20). A ficha aplica sozinha.</p>
    </div>
  )
}
