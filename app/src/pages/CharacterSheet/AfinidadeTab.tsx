import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CharacterRecord } from './index'
import AfinidadeEscolha, { type Caminho } from './AfinidadeEscolha'
import AfinidadeElementos from './AfinidadeElementos'
import AfinidadeFinal from './AfinidadeFinal'
import type { ChaveElemento } from './elementosParanormais'

const ELEMENTOS = [
  { key: 'sangue', name: 'Sangue', description: 'Vitalidade, fúria, o corpo levado ao extremo.' },
  { key: 'morte', name: 'Morte', description: 'Entropia, decadência, o fim de todas as coisas.' },
  { key: 'conhecimento', name: 'Conhecimento', description: 'Segredos proibidos, mente e percepção além do véu.' },
  { key: 'energia', name: 'Energia', description: 'Caos, eletricidade, o acaso que rege o universo.' },
] as const

export default function AfinidadeTab({ character, onUpdated }: { character: CharacterRecord & { afinidade_elemento?: string | null }; onUpdated: () => void }) {
  const [elemento, setElemento] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  // null = a tela dos tres caminhos; senao, o caminho que a pessoa escolheu.
  const [caminho, setCaminho] = useState<Caminho | null>(null)
  const [sorteado, setSorteado] = useState<string | null>(null)
  // Elemento ja escolhido na roda, esperando o "Finalizar" da tela final.
  const [aceito, setAceito] = useState<ChaveElemento | null>(null)
  const [rituais, setRituais] = useState<{ id: string; name: string; circle: number }[]>([])
  const [poderes, setPoderes] = useState<{ id: string; name: string; description: string }[]>([])

  useEffect(() => {
    supabase.from('characters').select('afinidade_elemento').eq('id', character.id).single().then(({ data }) => setElemento(data?.afinidade_elemento ?? null))
  }, [character.id])

  useEffect(() => {
    if (!elemento) return
    supabase.from('rituals').select('id, name, circle').eq('elemento', elemento).order('circle').then(({ data }) => setRituais(data ?? []))
    supabase.from('paranormal_powers').select('id, name, description').eq('elemento', elemento).order('name').then(({ data }) => setPoderes(data ?? []))
  }, [elemento])

  async function confirmElemento(key: string) {
    await supabase.from('characters').update({ afinidade_elemento: key }).eq('id', character.id)
    setElemento(key)
    setConfirming(null)
    onUpdated()
  }

  async function removeAfinidade() {
    await supabase.from('characters').update({ afinidade_elemento: null }).eq('id', character.id)
    setElemento(null)
    onUpdated()
  }

  function sortear() {
    const escolha = ELEMENTOS[Math.floor(Math.random() * ELEMENTOS.length)].key
    setSorteado(escolha)
    setCaminho('aleatorio')
  }

  if (!elemento && caminho === null) {
    return <AfinidadeEscolha onEscolher={(c) => (c === 'aleatorio' ? sortear() : setCaminho(c))} />
  }

  if (!elemento && aceito) {
    return (
      <AfinidadeFinal
        elemento={aceito}
        onFinalizar={() => confirmElemento(aceito)}
        onVoltar={() => setAceito(null)}
      />
    )
  }

  if (!elemento && caminho === 'escolher') {
    return <AfinidadeElementos onAceitar={setAceito} onVoltar={() => setCaminho(null)} />
  }

  if (!elemento && caminho === 'teste') {
    return (
      <div>
        <h2>Teste de Personalidade</h2>
        <p>As 30 perguntas ainda não foram escritas.</p>
        <button type="button" onClick={() => setCaminho(null)}>Voltar</button>
      </div>
    )
  }

  if (!elemento && caminho === 'aleatorio' && sorteado) {
    const sorte = ELEMENTOS.find((e) => e.key === sorteado)!
    return (
      <div>
        <h2>O caos escolheu: {sorte.name}</h2>
        <p>{sorte.description}</p>
        <button type="button" onClick={() => confirmElemento(sorte.key)}>Aceitar</button>
        <button type="button" onClick={sortear}>Sortear de novo</button>
        <button type="button" onClick={() => { setSorteado(null); setCaminho(null) }}>Voltar</button>
      </div>
    )
  }

  if (!elemento) {
    return (
      <div>
        <h2>Afinidade</h2>
        <button type="button" onClick={() => setCaminho(null)}>Voltar</button>
        <p>Escolha um elemento. Essa escolha é definitiva.</p>
        <ul>
          {ELEMENTOS.map((e) => (
            <li key={e.key}>
              <strong>{e.name}</strong>: {e.description}
              {confirming === e.key ? (
                <>
                  <span> Tem certeza? Essa escolha não pode ser desfeita.</span>
                  <button type="button" onClick={() => confirmElemento(e.key)}>Confirmar</button>
                  <button type="button" onClick={() => setConfirming(null)}>Cancelar</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirming(e.key)}>Escolher {e.name}</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const current = ELEMENTOS.find((e) => e.key === elemento)!

  return (
    <div>
      <h2>Afinidade: {current.name}</h2>
      <p>{current.description}</p>

      <section>
        <h3>Rituais de {current.name}</h3>
        {rituais.length === 0 ? <p>Nenhum cadastrado ainda.</p> : (
          <ul>{rituais.map((r) => <li key={r.id}>{r.circle}º — {r.name}</li>)}</ul>
        )}
      </section>

      <section>
        <h3>Poderes Paranormais de {current.name}</h3>
        {poderes.length === 0 ? <p>Nenhum cadastrado ainda.</p> : (
          <ul>{poderes.map((p) => <li key={p.id}><strong>{p.name}</strong>: {p.description}</li>)}</ul>
        )}
      </section>

      <button type="button" className="remove-afinidade-btn" onClick={removeAfinidade}>Remover Afinidade</button>
    </div>
  )
}
