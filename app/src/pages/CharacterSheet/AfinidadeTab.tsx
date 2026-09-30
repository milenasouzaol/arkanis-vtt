import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'
import AfinidadeEscolha, { type Caminho } from './AfinidadeEscolha'
import AfinidadeElementos from './AfinidadeElementos'
import AfinidadeFinal from './AfinidadeFinal'
import AfinidadePagina from './AfinidadePagina'
import { sortearElemento, type ChaveElemento } from './elementosParanormais'

export default function AfinidadeTab({ character, onUpdated }: { character: CharacterRecord & { afinidade_elemento?: string | null }; onUpdated: () => void }) {
  const [elemento, setElemento] = useState<string | null>(null)
  // null = a tela dos tres caminhos; senao, o caminho que a pessoa escolheu.
  const [caminho, setCaminho] = useState<Caminho | null>(null)
  // Elemento esperando o "Finalizar" da tela final: escolhido na roda ou sorteado.
  const [aceito, setAceito] = useState<ChaveElemento | null>(null)

  useEffect(() => {
    supabase.from('characters').select('afinidade_elemento').eq('id', character.id).single().then(({ data }) => setElemento(data?.afinidade_elemento ?? null))
  }, [character.id])

  async function confirmElemento(key: string) {
    await supabase.from('characters').update({ afinidade_elemento: key }).eq('id', character.id)
    setElemento(key)
    onUpdated()
  }

  async function removeAfinidade() {
    await supabase.from('characters').update({ afinidade_elemento: null }).eq('id', character.id)
    setElemento(null)
    setCaminho(null)
    setAceito(null)
    onUpdated()
  }

  function escolherCaminho(c: Caminho) {
    setCaminho(c)
    // "Escolha por Mim" pula a roda: sorteia na hora e ja abre a tela final do elemento.
    if (c === 'aleatorio') setAceito(sortearElemento())
  }

  /** Da tela final, o sorteio volta pros tres cartoes; a roda volta pra roda. */
  function voltarDaTelaFinal() {
    setAceito(null)
    if (caminho === 'aleatorio') setCaminho(null)
  }

  if (elemento) return <AfinidadePagina elemento={elemento} onRemover={removeAfinidade} />

  if (aceito) {
    return <AfinidadeFinal elemento={aceito} onFinalizar={() => confirmElemento(aceito)} onVoltar={voltarDaTelaFinal} />
  }

  if (caminho === 'escolher') {
    return <AfinidadeElementos onAceitar={setAceito} onVoltar={() => setCaminho(null)} />
  }

  if (caminho === 'teste') {
    return (
      <div>
        <h2>Teste de Personalidade</h2>
        <p>As 30 perguntas ainda não foram escritas.</p>
        <button type="button" onClick={() => setCaminho(null)}>Voltar</button>
      </div>
    )
  }

  return <AfinidadeEscolha onEscolher={escolherCaminho} />
}
