import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { elementoPorChave } from './elementosParanormais'
import morteFundo from '../../assets/afinidade/morte/fundo.webp'
import morteTitulo from '../../assets/afinidade/morte/titulo.webp'
import morteFigura from '../../assets/afinidade/morte/aeternus.webp'
import sangueTitulo from '../../assets/afinidade/sangue/titulo.webp'
import sangueSimbolo from '../../assets/afinidade/sangue/simbolo.webp'
import conhecimentoTitulo from '../../assets/afinidade/conhecimento/titulo.webp'
import conhecimentoSimbolo from '../../assets/afinidade/conhecimento/simbolo.webp'
import medoTitulo from '../../assets/afinidade/medo/titulo.webp'
import medoSimbolo from '../../assets/afinidade/medo/simbolo.webp'
import bgSangue from '../../assets/backgrounds/bg-sangue.webp'
import bgConhecimento from '../../assets/backgrounds/bg-conhecimento.webp'
import bgMedo from '../../assets/backgrounds/bg-medo.webp'
import bgEnergia from '../../assets/backgrounds/bg-energia.webp'
import energiaTitulo from '../../assets/afinidade/energia/titulo.webp'
import energiaFigura from '../../assets/afinidade/energia/figura.webp'
import energiaFiguraDireita from '../../assets/afinidade/energia/figura-direita.webp'
import energiaSigilo from '../../assets/afinidade/energia/sigilo.webp'

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
  figura: string
  figuraEhSimbolo?: boolean
  /** Segunda figura, do outro lado das tabelas. */
  figuraDireita?: string
  /** Sigilo grande e apagado atras da pagina, no lugar de um fundo proprio. */
  sigilo?: string
}

/**
 * Arte propria de cada elemento. Morte tem fundo e figura proprios; Sangue, Conhecimento e
 * Medo usam o fundo que a ficha ja tem e o simbolo no lugar da figura; Energia tem duas
 * figuras, uma de cada lado, e o sigilo atras.
 */
export const ARTES: Record<string, Arte> = {
  morte: { fundo: morteFundo, titulo: morteTitulo, figura: morteFigura },
  sangue: { fundo: bgSangue, titulo: sangueTitulo, figura: sangueSimbolo, figuraEhSimbolo: true },
  conhecimento: { fundo: bgConhecimento, titulo: conhecimentoTitulo, figura: conhecimentoSimbolo, figuraEhSimbolo: true },
  medo: { fundo: bgMedo, titulo: medoTitulo, figura: medoSimbolo, figuraEhSimbolo: true },
  energia: { fundo: bgEnergia, titulo: energiaTitulo, figura: energiaFigura, figuraDireita: energiaFiguraDireita, sigilo: energiaSigilo },
}

// Medo nao esta na roda de escolha, entao nao tem entrada em elementosParanormais.
const NOMES_EXTRAS: Record<string, string> = { medo: 'Medo' }
// Cor dos paineis. Os quatro da roda usam a cor do brilho deles; Medo, cinza neutro.
const CORES_EXTRAS: Record<string, string> = { medo: '#9a9a9a' }

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

  return (
    <div
      className="afin-pag"
      style={{
        ...(arte ? { '--afin-pag-fundo': `url(${arte.fundo})` } : {}),
        '--afin-pag-cor': info?.cor ?? CORES_EXTRAS[elemento] ?? '#9a9a9a',
      } as React.CSSProperties}
    >
      {arte?.sigilo && <img className="afin-pag-sigilo" src={arte.sigilo} alt="" />}

      <header className="afin-pag-topo">
        {arte ? <img className="afin-pag-titulo-img" src={arte.titulo} alt={nome} /> : <h1 className="afin-pag-titulo">{nome}</h1>}
        {info && <p className="afin-pag-lema">{info.frase}</p>}
      </header>

      <div className="afin-pag-corpo">
        {arte && (
          <aside className={`afin-pag-figura${arte.figuraEhSimbolo ? ' simbolo' : ''}`}>
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

        {arte?.figuraDireita && (
          <aside className="afin-pag-figura direita">
            <img src={arte.figuraDireita} alt="" />
          </aside>
        )}
      </div>
    </div>
  )
}
