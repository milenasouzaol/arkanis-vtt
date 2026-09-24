import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { elementoPorChave } from './elementosParanormais'
import morteFundo from '../../assets/afinidade/morte/fundo.webp'
import morteTitulo from '../../assets/afinidade/morte/titulo.webp'
import morteFigura from '../../assets/afinidade/morte/aeternus.webp'

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

/** Arte propria de cada elemento. So Morte tem por enquanto; os outros caem no titulo em texto. */
const ARTES: Record<string, { fundo: string; titulo: string; figura: string }> = {
  morte: { fundo: morteFundo, titulo: morteTitulo, figura: morteFigura },
}

export function porCirculo(rituais: RitualDaAfinidade[]) {
  const grupos = new Map<number, RitualDaAfinidade[]>()
  for (const r of rituais) grupos.set(r.circle, [...(grupos.get(r.circle) ?? []), r])
  return [...grupos.entries()].sort(([a], [b]) => a - b)
}

export default function AfinidadePagina({ elemento, onRemover }: { elemento: string; onRemover: () => void }) {
  const [rituais, setRituais] = useState<RitualDaAfinidade[]>([])
  const [poderes, setPoderes] = useState<PoderDaAfinidade[]>([])
  const info = elementoPorChave(elemento)
  const arte = ARTES[elemento]
  const nome = info?.nome ?? elemento

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

  return (
    <div className="afin-pag" style={arte ? ({ '--afin-pag-fundo': `url(${arte.fundo})` } as React.CSSProperties) : undefined}>
      <header className="afin-pag-topo">
        {arte ? <img className="afin-pag-titulo-img" src={arte.titulo} alt={nome} /> : <h1 className="afin-pag-titulo">{nome}</h1>}
        {info && <p className="afin-pag-lema">{info.frase}</p>}
      </header>

      <div className="afin-pag-corpo">
        {arte && (
          <aside className="afin-pag-figura">
            <img src={arte.figura} alt="" />
          </aside>
        )}

        <div className="afin-pag-conteudo">
          <section className="afin-pag-painel">
            <h2 className="afin-pag-painel-titulo">Rituais de {nome}</h2>
            {rituais.length === 0 ? (
              <p className="afin-pag-vazio">Nenhum ritual cadastrado.</p>
            ) : (
              porCirculo(rituais).map(([circulo, lista]) => (
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
          </section>

          <section className="afin-pag-painel">
            <h2 className="afin-pag-painel-titulo">Poderes Paranormais de {nome}</h2>
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
          </section>

          <div className="afin-pag-rodape">
            <button type="button" className="afin-pag-remover" onClick={onRemover}>Remover afinidade</button>
          </div>
        </div>
      </div>
    </div>
  )
}
