import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { elementoPorChave } from './elementosParanormais'
import morteFundo from '../../assets/afinidade/morte/fundo.webp'
import morteTitulo from '../../assets/afinidade/morte/titulo.webp'
import morteSimbolo from '../../assets/afinidade/morte-simbolo.webp'
import sangueTitulo from '../../assets/afinidade/sangue/titulo.webp'
import sangueSimbolo from '../../assets/afinidade/sangue/simbolo.webp'
import conhecimentoTitulo from '../../assets/afinidade/conhecimento/titulo.webp'
import conhecimentoSimbolo from '../../assets/afinidade/conhecimento/simbolo.webp'
import medoTitulo from '../../assets/afinidade/medo/titulo.webp'
import medoSimbolo from '../../assets/afinidade/medo/simbolo.webp'
import energiaTitulo from '../../assets/afinidade/energia/titulo.webp'
import energiaSimbolo from '../../assets/afinidade/energia/sigilo.webp'
import bgSangue from '../../assets/backgrounds/bg-sangue.webp'
import bgConhecimento from '../../assets/backgrounds/bg-conhecimento.webp'
import bgMedo from '../../assets/backgrounds/bg-medo.webp'
import bgEnergia from '../../assets/backgrounds/bg-energia.webp'

export type RitualDaAfinidade = {
  id: string
  name: string
  circle: number
  execution: string | null
  range: string | null
  duration: string | null
  resistance: string | null
}

export type PoderDaAfinidade = {
  id: string
  name: string
  description: string
  affinity_description: string | null
  prerequisites: string | null
}

type Arte = {
  fundo: string
  titulo: string
  /** Simbolo do elemento, que fica atras do titulo. */
  simbolo: string
}

/**
 * Arte de cada elemento. Morte tem fundo proprio; os outros usam o fundo que a ficha ja
 * tem. O simbolo de Morte e o da roda de escolha, e o de Energia e o sigilo roxo.
 */
export const ARTES: Record<string, Arte> = {
  morte: { fundo: morteFundo, titulo: morteTitulo, simbolo: morteSimbolo },
  sangue: { fundo: bgSangue, titulo: sangueTitulo, simbolo: sangueSimbolo },
  conhecimento: { fundo: bgConhecimento, titulo: conhecimentoTitulo, simbolo: conhecimentoSimbolo },
  medo: { fundo: bgMedo, titulo: medoTitulo, simbolo: medoSimbolo },
  energia: { fundo: bgEnergia, titulo: energiaTitulo, simbolo: energiaSimbolo },
}

// Medo nao esta na roda de escolha, entao nao tem entrada em elementosParanormais.
const NOMES_EXTRAS: Record<string, string> = { medo: 'Medo' }
// Cor dos paineis. Os quatro da roda usam a cor do brilho deles; Medo, cinza neutro.
const CORES_EXTRAS: Record<string, string> = { medo: '#9a9a9a' }

export const CIRCULOS = [1, 2, 3, 4] as const
export const ROMANO: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }

export function porCirculo(rituais: RitualDaAfinidade[]) {
  const grupos = new Map<number, RitualDaAfinidade[]>()
  for (const r of rituais) grupos.set(r.circle, [...(grupos.get(r.circle) ?? []), r])
  return [...grupos.entries()].sort(([a], [b]) => a - b)
}

/** Mesmo filtro da aba de adicionar rituais: nenhum circulo marcado = todos. */
export function filtrarPorCirculo(rituais: RitualDaAfinidade[], marcados: number[]) {
  return marcados.length === 0 ? rituais : rituais.filter((r) => marcados.includes(r.circle))
}

export default function AfinidadePagina({ elemento, onRemover }: { elemento: string; onRemover: () => void }) {
  const [rituais, setRituais] = useState<RitualDaAfinidade[]>([])
  const [poderes, setPoderes] = useState<PoderDaAfinidade[]>([])
  const [circulos, setCirculos] = useState<number[]>([])
  const info = elementoPorChave(elemento)
  const arte = ARTES[elemento]
  const nome = info?.nome ?? NOMES_EXTRAS[elemento] ?? elemento

  useEffect(() => {
    supabase
      .from('rituals')
      .select('id, name, circle, execution, range, duration, resistance')
      .eq('elemento', elemento)
      .order('circle')
      .order('name')
      .then(({ data }) => setRituais(data ?? []))
    supabase
      .from('paranormal_powers')
      .select('id, name, description, affinity_description, prerequisites')
      .eq('elemento', elemento)
      .order('name')
      .then(({ data }) => setPoderes(data ?? []))
  }, [elemento])

  function alternar(c: number) {
    setCirculos((lista) => (lista.includes(c) ? lista.filter((x) => x !== c) : [...lista, c]))
  }

  const visiveis = filtrarPorCirculo(rituais, circulos)

  return (
    <div
      className="afin-pag aba-travada"
      style={{
        ...(arte ? { '--afin-pag-fundo': `url(${arte.fundo})` } : {}),
        '--afin-pag-cor': info?.cor ?? CORES_EXTRAS[elemento] ?? '#9a9a9a',
      } as React.CSSProperties}
    >
      <header className="afin-pag-topo">
        <div className="afin-pag-titulo-caixa">
          {arte && <img className="afin-pag-simbolo" src={arte.simbolo} alt="" />}
          {arte ? <img className="afin-pag-titulo-img" src={arte.titulo} alt={nome} /> : <h1 className="afin-pag-titulo">{nome}</h1>}
        </div>
        {info && <p className="afin-pag-lema">{info.frase}</p>}
      </header>

      <div className="afin-pag-corpo">
        <nav className="afin-pag-circulos" aria-label="Filtrar por círculo">
          {CIRCULOS.map((c) => (
            <button
              key={c}
              type="button"
              className={`ritual-circle-sq${circulos.includes(c) ? ' active' : ''}`}
              onClick={() => alternar(c)}
              aria-pressed={circulos.includes(c)}
              title={`${c}º círculo`}
            >
              {ROMANO[c]}
            </button>
          ))}
        </nav>

        <section className="afin-pag-painel">
          <h2 className="afin-pag-painel-titulo">Rituais de {nome}</h2>
          <div className="afin-pag-rolagem">
            {visiveis.length === 0 ? (
              <p className="afin-pag-vazio">{rituais.length === 0 ? 'Nenhum ritual cadastrado.' : 'Nenhum ritual nesse círculo.'}</p>
            ) : (
              porCirculo(visiveis).map(([circulo, lista]) => (
                <div key={circulo} className="afin-pag-grupo">
                  <div className="afin-pag-grupo-titulo">{circulo}º Círculo</div>
                  <table className="afin-pag-tabela">
                    <thead>
                      <tr>
                        <th>Ritual</th>
                        <th>Execução</th>
                        <th>Alcance</th>
                        <th>Duração</th>
                        <th>Resistência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((r) => (
                        <tr key={r.id}>
                          <td className="afin-pag-nome">{r.name}</td>
                          <td>{r.execution ?? '—'}</td>
                          <td>{r.range ?? '—'}</td>
                          <td>{r.duration ?? '—'}</td>
                          <td>{r.resistance ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="afin-pag-painel">
          <h2 className="afin-pag-painel-titulo">Poderes Paranormais de {nome}</h2>
          <div className="afin-pag-rolagem">
            {poderes.length === 0 ? (
              <p className="afin-pag-vazio">Nenhum poder cadastrado.</p>
            ) : (
              <table className="afin-pag-tabela afin-pag-tabela-poderes">
                <thead>
                  <tr>
                    <th>Poder</th>
                    <th>Efeito</th>
                    <th>Com afinidade</th>
                  </tr>
                </thead>
                <tbody>
                  {poderes.map((p) => (
                    <tr key={p.id}>
                      <td className="afin-pag-nome">
                        {p.name}
                        {p.prerequisites && <span className="afin-pag-prereq">{p.prerequisites}</span>}
                      </td>
                      <td>{p.description}</td>
                      <td>{p.affinity_description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <div className="afin-pag-rodape">
        <button type="button" className="afin-pag-remover" onClick={onRemover}>Remover afinidade</button>
      </div>
    </div>
  )
}
