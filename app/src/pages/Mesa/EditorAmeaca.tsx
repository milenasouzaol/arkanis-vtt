import { recortarImagem } from '../../components/RecortarImagem'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faImage, faPlus, faSkull, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../lib/supabase'
import Janela, { Campo } from './Janela'

// Ameaça Homebrew (KAN-50): o mestre cria do zero ou duplica uma do bestiário e edita.
// Os campos são os mesmos da Ficha de Ameaça, pra ela aparecer igual às do livro.
type Acao = { nome: string; tipo?: string; teste?: string; dano?: string; descricao?: string }

export type CriaturaEditavel = {
  id?: string
  name: string
  vd: number | null
  image_url: string | null
  tipo_criatura: string | null
  tamanho: string | null
  categoria: string
  descritores: string[]
  pv_maximo: number | null
  defesa: number | null
  deslocamento: string | null
  atributos: Record<string, number>
  percepcao: string | null
  iniciativa: string | null
  fortitude: string | null
  reflexos: string | null
  vontade: string | null
  pericias: string | null
  resistencias: string | null
  vulnerabilidades: string | null
  presenca_dt: number | null
  presenca_dano: string | null
  presenca_nex_imune: number | null
  acoes: Acao[]
  habilidades: Acao[]
  description: string | null
  enigma_medo: string | null
}

const CAMPOS = 'id, name, vd, image_url, tipo_criatura, tamanho, categoria, descritores, pv_maximo, defesa, deslocamento, atributos, percepcao, iniciativa, fortitude, reflexos, vontade, pericias, resistencias, vulnerabilidades, presenca_dt, presenca_dano, presenca_nex_imune, acoes, habilidades, description, enigma_medo, owner_id'

const ELEMENTOS = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo']
const ATRIBUTOS = ['agi', 'for', 'int', 'pre', 'vig']

export function criaturaVazia(): CriaturaEditavel {
  return {
    name: '', vd: null, image_url: null, tipo_criatura: null, tamanho: 'Médio', categoria: 'paranormal', descritores: [],
    pv_maximo: null, defesa: null, deslocamento: '9m', atributos: { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
    percepcao: null, iniciativa: null, fortitude: null, reflexos: null, vontade: null, pericias: null,
    resistencias: null, vulnerabilidades: null, presenca_dt: null, presenca_dano: null, presenca_nex_imune: null,
    acoes: [], habilidades: [], description: null, enigma_medo: null,
  }
}

// Ameaça do bestiário (ou outra homebrew) pra editar: Duplicar tira o id e põe "(cópia)".
export async function carregarParaEditar(id: string, duplicar: boolean): Promise<CriaturaEditavel | null> {
  const { data } = await supabase.from('creatures').select(CAMPOS).eq('id', id).maybeSingle()
  if (!data) return null
  const c = { ...criaturaVazia(), ...(data as Partial<CriaturaEditavel>) } as CriaturaEditavel & { owner_id?: string | null }
  c.acoes = c.acoes ?? []
  c.habilidades = c.habilidades ?? []
  c.descritores = c.descritores ?? []
  c.atributos = c.atributos ?? {}
  delete c.owner_id
  if (duplicar) {
    delete c.id
    c.name = `${c.name} (cópia)`
  }
  return c
}

async function salvarCriatura(userId: string, c: CriaturaEditavel): Promise<{ id: string } | { erro: string }> {
  const { data: fonte } = await supabase.from('sources').select('id').eq('slug', 'homebrew').single()
  if (!fonte) return { erro: 'Livro Homebrew não encontrado.' }
  const { id, ...campos } = c
  const linha = { ...campos, name: campos.name.trim(), owner_id: userId, source_id: fonte.id }
  const r = id
    ? await supabase.from('creatures').update(linha).eq('id', id).select('id').single()
    : await supabase.from('creatures').insert(linha).select('id').single()
  if (r.error || !r.data) return { erro: r.error?.message ?? 'Não deu pra salvar.' }
  return { id: r.data.id as string }
}

export default function EditorAmeaca({ userId, inicial, onSalvo, onEnviarImagem, onFechar }: {
  userId: string
  inicial: CriaturaEditavel
  onSalvo: (id: string) => void
  onEnviarImagem: (f: File) => Promise<string | null>
  onFechar: () => void
}) {
  const [c, setC] = useState<CriaturaEditavel>(inicial)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const mudar = <K extends keyof CriaturaEditavel>(k: K, v: CriaturaEditavel[K]) => setC((x) => ({ ...x, [k]: v }))
  const texto = (k: keyof CriaturaEditavel) => ({
    value: (c[k] as string | null) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => mudar(k, (e.target.value || null) as never),
  })
  const numero = (k: 'vd' | 'pv_maximo' | 'defesa' | 'presenca_dt' | 'presenca_nex_imune') => ({
    type: 'number',
    value: c[k] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => mudar(k, e.target.value === '' ? null : Number(e.target.value)),
  })

  function mudarLista(qual: 'acoes' | 'habilidades', i: number, campo: keyof Acao, v: string) {
    setC((x) => ({ ...x, [qual]: x[qual].map((a, j) => (j === i ? { ...a, [campo]: v || undefined } : a)) }))
  }

  async function salvar() {
    if (!c.name.trim()) {
      setErro('Dê um nome pra ameaça.')
      return
    }
    setSalvando(true)
    const r = await salvarCriatura(userId, {
      ...c,
      acoes: c.acoes.filter((a) => a.nome?.trim()),
      habilidades: c.habilidades.filter((a) => a.nome?.trim()),
    })
    setSalvando(false)
    if ('erro' in r) setErro(r.erro)
    else onSalvo(r.id)
  }

  const lista = (qual: 'acoes' | 'habilidades', titulo: string) => (
    <section className="editor-ameaca-lista">
      <h4 className="ficha-ameaca-titulo">{titulo}</h4>
      {c[qual].map((a, i) => (
        <div key={i} className="editor-ameaca-acao">
          <div className="editor-ameaca-linha">
            <input value={a.nome ?? ''} placeholder="Nome" aria-label="Nome" onChange={(e) => mudarLista(qual, i, 'nome', e.target.value)} />
            {qual === 'acoes' && <input value={a.tipo ?? ''} placeholder="Tipo (Padrão, Movimento…)" aria-label="Tipo" onChange={(e) => mudarLista(qual, i, 'tipo', e.target.value)} />}
            <button type="button" className="combate-icone" aria-label="Remover" onClick={() => setC((x) => ({ ...x, [qual]: x[qual].filter((_, j) => j !== i) }))}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
          {qual === 'acoes' && (
            <div className="editor-ameaca-linha">
              <input value={a.teste ?? ''} placeholder="Teste: +10 (2d20), crítico 19/x3" aria-label="Teste" onChange={(e) => mudarLista(qual, i, 'teste', e.target.value)} />
              <input value={a.dano ?? ''} placeholder="Dano: 1d8+5 corte" aria-label="Dano" onChange={(e) => mudarLista(qual, i, 'dano', e.target.value)} />
            </div>
          )}
          <textarea value={a.descricao ?? ''} placeholder="Descrição" aria-label="Descrição" rows={2} onChange={(e) => mudarLista(qual, i, 'descricao', e.target.value)} />
        </div>
      ))}
      <button type="button" className="mesa-botao" onClick={() => setC((x) => ({ ...x, [qual]: [...x[qual], { nome: '' }] }))}>
        <FontAwesomeIcon icon={faPlus} /> {qual === 'acoes' ? 'Adicionar ação' : 'Adicionar poder'}
      </button>
    </section>
  )

  return (
    <div onPointerDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>
      <Janela titulo={c.id ? `Editar Ameaça: ${c.name}` : 'Criar Ameaça'} icone={faSkull} largura={620} altura={720} onFechar={onFechar}>
        <div className="janela-form editor-ameaca">
          <div className="editor-ameaca-topo">
            <label className="editor-ameaca-foto" title="Imagem">
              {c.image_url ? <img src={c.image_url} alt="" /> : <FontAwesomeIcon icon={faImage} />}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const escolhido = e.target.files?.[0]
                  e.target.value = ''
                  const f = escolhido ? await recortarImagem(escolhido, { proporcao: 'quadrado', titulo: 'Imagem da ameaça' }) : null
                  if (!f) return
                  const url = await onEnviarImagem(f)
                  if (url) mudar('image_url', url)
                  else setErro('Não deu pra enviar a imagem.')
                }}
              />
            </label>
            <div className="editor-ameaca-grade">
              <Campo rotulo="Nome*"><input autoFocus value={c.name} aria-label="Nome" onChange={(e) => mudar('name', e.target.value)} /></Campo>
              <Campo rotulo="VD"><input {...numero('vd')} aria-label="VD" /></Campo>
              <Campo rotulo="Tipo"><input {...texto('tipo_criatura')} placeholder="Criatura de Sangue" aria-label="Tipo" /></Campo>
              <Campo rotulo="Tamanho"><input {...texto('tamanho')} aria-label="Tamanho" /></Campo>
            </div>
          </div>

          <div className="editor-ameaca-grade">
            <Campo rotulo="Categoria">
              <select value={c.categoria} aria-label="Categoria" onChange={(e) => mudar('categoria', e.target.value)}>
                <option value="paranormal">Paranormal</option>
                <option value="mundana">Mundana (Realidade)</option>
              </select>
            </Campo>
            <Campo rotulo="Elementos">
              <div className="editor-ameaca-elementos">
                {ELEMENTOS.map((el) => (
                  <label key={el}>
                    <input
                      type="checkbox"
                      checked={c.descritores.includes(el)}
                      onChange={(e) => mudar('descritores', e.target.checked ? [...c.descritores, el] : c.descritores.filter((x) => x !== el))}
                    />
                    {el}
                  </label>
                ))}
              </div>
            </Campo>
            <Campo rotulo="Vida (PV)"><input {...numero('pv_maximo')} aria-label="Vida" /></Campo>
            <Campo rotulo="Defesa"><input {...numero('defesa')} aria-label="Defesa" /></Campo>
            <Campo rotulo="Deslocamento"><input {...texto('deslocamento')} aria-label="Deslocamento" /></Campo>
          </div>

          <div className="ficha-ameaca-atributos">
            {ATRIBUTOS.map((k) => (
              <label key={k} className="ficha-ameaca-atributo">
                <span>{k.toUpperCase()}</span>
                <input
                  type="number"
                  value={c.atributos[k] ?? 0}
                  aria-label={k.toUpperCase()}
                  onChange={(e) => mudar('atributos', { ...c.atributos, [k]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>

          <div className="editor-ameaca-grade">
            <Campo rotulo="Percepção"><input {...texto('percepcao')} placeholder="+5 (2d20)" aria-label="Percepção" /></Campo>
            <Campo rotulo="Iniciativa"><input {...texto('iniciativa')} placeholder="+5 (2d20)" aria-label="Iniciativa" /></Campo>
            <Campo rotulo="Fortitude"><input {...texto('fortitude')} aria-label="Fortitude" /></Campo>
            <Campo rotulo="Reflexos"><input {...texto('reflexos')} aria-label="Reflexos" /></Campo>
            <Campo rotulo="Vontade"><input {...texto('vontade')} aria-label="Vontade" /></Campo>
          </div>
          <Campo rotulo="Outras perícias"><input {...texto('pericias')} placeholder="Crime +5 (2d20), Furtividade +5 (2d20)" aria-label="Outras perícias" /></Campo>
          <Campo rotulo="Resistências"><input {...texto('resistencias')} placeholder="Balístico, impacto e perfuração 10, Sangue 20; imune a fogo" aria-label="Resistências" /></Campo>
          <Campo rotulo="Vulnerabilidades"><input {...texto('vulnerabilidades')} placeholder="Morte" aria-label="Vulnerabilidades" /></Campo>

          <div className="editor-ameaca-grade">
            <Campo rotulo="Presença Perturbadora (DT)"><input {...numero('presenca_dt')} aria-label="Presença DT" /></Campo>
            <Campo rotulo="Dano da Presença"><input {...texto('presenca_dano')} placeholder="2d6 mental" aria-label="Dano da Presença" /></Campo>
            <Campo rotulo="NEX imune"><input {...numero('presenca_nex_imune')} aria-label="NEX imune" /></Campo>
          </div>

          {lista('acoes', 'Ações')}
          {lista('habilidades', 'Poderes')}

          <Campo rotulo="Descrição"><textarea {...texto('description')} rows={4} aria-label="Descrição" /></Campo>
          <Campo rotulo="Enigma do Medo"><textarea {...texto('enigma_medo')} rows={2} aria-label="Enigma do Medo" /></Campo>

          {erro && <p className="janela-aviso">{erro}</p>}
          <div className="criar-combate-acoes">
            <button type="button" className="janela-botao" onClick={onFechar}><FontAwesomeIcon icon={faXmark} /> Sair sem salvar</button>
            <button type="button" className="janela-botao" disabled={salvando} onClick={salvar}><FontAwesomeIcon icon={faFloppyDisk} /> Salvar</button>
          </div>
        </div>
      </Janela>
    </div>
  )
}
