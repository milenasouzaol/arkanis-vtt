import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBorderAll, faCubes, faFileImage, faFloppyDisk, faImage, faMap, faSun } from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, CampoCor, CampoNumero, Deslizante } from './Janela'
import { camposDaCena, celulaDaGrade, colunasDoTamanho, linhasSugeridas, CLIMAS, type Cena, type CamposCena, type Clima, type EstiloGrade, type TipoGrade } from './cenas'

type Aba = 'basicos' | 'grade' | 'ambiente' | 'diversos'

// Só as abas que a spec manda ter (12.5); Andares e Visibilidade ficam de fora.
const ABAS: { id: Aba; rotulo: string; icone: typeof faImage }[] = [
  { id: 'basicos', rotulo: 'Básicos', icone: faImage },
  { id: 'grade', rotulo: 'Grade', icone: faBorderAll },
  { id: 'ambiente', rotulo: 'Ambiente', icone: faSun },
  { id: 'diversos', rotulo: 'Diversos', icone: faCubes },
]

const TIPOS_GRADE: { id: TipoGrade; rotulo: string }[] = [
  { id: 'quadrado', rotulo: 'Quadrada' },
  { id: 'hexagono', rotulo: 'Hexagonal' },
  { id: 'sem', rotulo: 'Sem grade' },
]

// Mapa sem imagem de fundo: o mesmo tamanho que a mesa usa.
const MAPA_PADRAO = { w: 4000, h: 3000 }

const ESTILOS_GRADE: { id: EstiloGrade; rotulo: string }[] = [
  { id: 'solida', rotulo: 'Linhas Sólidas' },
  { id: 'tracejada', rotulo: 'Linhas Tracejadas' },
  { id: 'pontilhada', rotulo: 'Linhas Pontilhadas' },
]

export default function EditorCena({ cena, jogadores, onSalvar, onImagem, onFechar }: {
  cena: Cena
  jogadores: { userId: string; rotulo: string }[]
  onSalvar: (campos: CamposCena) => Promise<boolean>
  onImagem: (arquivo: File) => Promise<string | null>
  onFechar: () => void
}) {
  const [aba, setAba] = useState<Aba>('basicos')
  const [rascunho, setRascunho] = useState<CamposCena>(() => camposDaCena(cena))
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const arquivoRef = useRef<HTMLInputElement>(null)
  // Tamanho real da imagem, pra grade cobrir ela inteira.
  const [mapa, setMapa] = useState(MAPA_PADRAO)
  useEffect(() => {
    if (!rascunho.background_url) {
      setMapa(MAPA_PADRAO)
      return
    }
    const img = new Image()
    img.onload = () => setMapa({ w: img.naturalWidth || MAPA_PADRAO.w, h: img.naturalHeight || MAPA_PADRAO.h })
    img.src = rascunho.background_url
  }, [rascunho.background_url])

  const mudar = <K extends keyof CamposCena>(k: K, v: CamposCena[K]) => setRascunho((r) => ({ ...r, [k]: v }))

  // Quem pode ver: Apenas Mestre / Todos Jogadores / um jogador específico.
  const quem = rascunho.visibility === 'jogadores' ? rascunho.visible_to[0] ?? 'todos' : rascunho.visibility
  function mudarQuem(v: string) {
    if (v === 'mestre' || v === 'todos') setRascunho((r) => ({ ...r, visibility: v, visible_to: [] }))
    else setRascunho((r) => ({ ...r, visibility: 'jogadores', visible_to: [v] }))
  }

  async function escolherImagem(arquivo: File | undefined) {
    if (!arquivo) return
    setAviso('Enviando imagem…')
    const url = await onImagem(arquivo)
    setAviso(url ? null : 'Não deu pra enviar a imagem.')
    if (url) mudar('background_url', url)
  }

  // Cena antiga (grade em pixels): mostra quantos quadrados isso dá.
  const colunas = rascunho.grid_colunas ?? colunasDoTamanho(rascunho.grid_size, mapa)
  const linhas = rascunho.grid_linhas ?? linhasSugeridas(colunas, mapa)
  const celula = celulaDaGrade({ ...rascunho, grid_colunas: colunas, grid_linhas: linhas }, mapa)

  function mudarColunas(c: number) {
    // As linhas acompanham pra os quadrados continuarem quadrados (dá pra mudar depois).
    setRascunho((r) => ({ ...r, grid_colunas: c, grid_linhas: linhasSugeridas(c, mapa) }))
  }

  async function salvar() {
    setSalvando(true)
    // O tamanho em pixels acompanha (tokens novos, setas do teclado e a régua usam ele).
    const comGrade = rascunho.grid_colunas || rascunho.grid_linhas
      ? { ...rascunho, grid_colunas: colunas, grid_linhas: linhas, grid_size: Math.max(1, Math.round(celula.w)) }
      : rascunho
    const ok = await onSalvar({ ...comGrade, name: rascunho.name.trim() || cena.name })
    setSalvando(false)
    setAviso(ok ? 'Alterações salvas.' : 'Não deu pra salvar.')
  }

  const campoGrade = (
    <>
      <Campo rotulo="Formato da Grade">
        <select value={rascunho.grid_type} aria-label="Formato da grade" onChange={(e) => mudar('grid_type', e.target.value as TipoGrade)}>
          {TIPOS_GRADE.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
        </select>
      </Campo>
      {rascunho.grid_type !== 'sem' && (
        <Campo
          rotulo="Quadrados"
          dica={`Quantos quadrados a grade tem de um lado ao outro da imagem. Ela cobre a imagem inteira, sem cortar. Cada quadrado fica com ${Math.round(celula.w)} × ${Math.round(celula.h)} pixels.`}
        >
          <div className="janela-linha">
            <CampoNumero className="janela-curto" rotulo="Quadrados na largura" min={1} max={400} valor={colunas} onMudar={mudarColunas} />
            <span className="janela-unidade">na largura</span>
            <CampoNumero className="janela-curto" rotulo="Quadrados na altura" min={1} max={400} valor={linhas} onMudar={(l) => setRascunho((r) => ({ ...r, grid_colunas: colunas, grid_linhas: l }))} />
            <span className="janela-unidade">na altura</span>
          </div>
        </Campo>
      )}
    </>
  )

  return (
    <Janela titulo={`Cena: ${cena.name}`} icone={faMap} largura={600} onFechar={onFechar}>
      <nav className="janela-abas" role="tablist">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={aba === a.id ? 'ativa' : undefined} onClick={() => setAba(a.id)}>
            <FontAwesomeIcon icon={a.icone} /> {a.rotulo}
          </button>
        ))}
      </nav>

      <div className="janela-rolagem">
        {aba === 'basicos' && (
          <>
            <fieldset className="janela-grupo">
              <legend>Apresentação</legend>
              <Campo rotulo="Nome da Cena">
                <input value={rascunho.name} aria-label="Nome da Cena" onChange={(e) => mudar('name', e.target.value)} />
              </Campo>
              <Campo rotulo="Permissões" dica="Com &quot;Mostrar na Navegação&quot;, a cena aparece na aba Cenas pra quem pode vê-la entrar nela.">
                <div className="janela-linha">
                  <label className="janela-check">
                    Mostrar na Navegação
                    <input type="checkbox" checked={rascunho.show_in_nav} onChange={(e) => mudar('show_in_nav', e.target.checked)} />
                  </label>
                  <select value={quem} aria-label="Quem pode ver" onChange={(e) => mudarQuem(e.target.value)}>
                    <option value="mestre">Apenas Mestre</option>
                    <option value="todos">Todos Jogadores</option>
                    {jogadores.map((j) => <option key={j.userId} value={j.userId}>{j.rotulo}</option>)}
                  </select>
                </div>
              </Campo>
            </fieldset>

            <fieldset className="janela-grupo">
              <legend>Imagem de Fundo</legend>
              <Campo rotulo="Imagem de Fundo" dica="Também dá pra arrastar uma imagem direto pra mesa.">
                <div className="janela-arquivo">
                  <input readOnly value={rascunho.background_url ? decodeURIComponent(rascunho.background_url.split('/').pop() ?? '') : ''} aria-label="Imagem de Fundo" placeholder="Nenhuma imagem" onClick={() => arquivoRef.current?.click()} />
                  <button type="button" aria-label="Escolher imagem" onClick={() => arquivoRef.current?.click()}>
                    <FontAwesomeIcon icon={faFileImage} />
                  </button>
                  {rascunho.background_url && (
                    <button type="button" className="janela-link" onClick={() => mudar('background_url', null)}>Tirar</button>
                  )}
                  <input ref={arquivoRef} type="file" accept="image/*" hidden onChange={(e) => { escolherImagem(e.target.files?.[0]); e.target.value = '' }} />
                </div>
              </Campo>
              <Campo rotulo="Cor de Fundo" dica="Aparece atrás da imagem, ou no lugar dela quando não há imagem.">
                <CampoCor rotulo="Cor de Fundo" valor={rascunho.background_color} onMudar={(v) => mudar('background_color', v)} />
              </Campo>
            </fieldset>

            {campoGrade}

            <Campo rotulo="Nível de Escuridão" dica="Escurece a cena pra dar clima: 0 é sem escurecer, 1 é bem escuro.">
              <Deslizante rotulo="Nível de Escuridão" min={0} max={1} valor={rascunho.darkness} onMudar={(v) => mudar('darkness', v)} />
            </Campo>

            <Campo rotulo="Efeito Climático" dica="Uma animação de clima por cima da cena.">
              <select value={rascunho.weather ?? ''} aria-label="Efeito Climático" onChange={(e) => mudar('weather', (e.target.value || null) as Clima | null)}>
                <option value="">Nenhum</option>
                {CLIMAS.map((c) => <option key={c.id} value={c.id}>{c.rotulo}</option>)}
              </select>
            </Campo>
          </>
        )}

        {aba === 'grade' && (
          <>
            <fieldset className="janela-grupo">
              <legend>Mecânicas</legend>
              {campoGrade}
              <Campo rotulo="Medidas" dica="A distância que cada espaço da grade representa. É o que a ferramenta Medir Distância usa.">
                <div className="janela-linha janela-linha-direita">
                  <span className="janela-unidade">Distância</span>
                  <CampoNumero className="janela-curto" rotulo="Distância" min={0.1} max={1000} passo={0.1} valor={rascunho.grid_distance} onMudar={(v) => mudar('grid_distance', v)} />
                  <span className="janela-unidade">Unidades</span>
                  <input className="janela-curto" value={rascunho.grid_units} aria-label="Unidades" onChange={(e) => mudar('grid_units', e.target.value.slice(0, 8))} />
                </div>
              </Campo>
            </fieldset>

            <fieldset className="janela-grupo">
              <legend>Aparência</legend>
              <p className="janela-dica">Configure a aparência das linhas da grade.</p>
              <Campo rotulo="Estilo da Grade">
                <div className="janela-linha">
                  <select value={rascunho.grid_style} aria-label="Estilo da Grade" onChange={(e) => mudar('grid_style', e.target.value as EstiloGrade)}>
                    {ESTILOS_GRADE.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
                  </select>
                  <CampoNumero className="janela-curto" rotulo="Espessura da linha" min={1} max={10} valor={rascunho.grid_thickness} onMudar={(v) => mudar('grid_thickness', v)} />
                  <span className="janela-unidade">px</span>
                </div>
              </Campo>
              <Campo rotulo="Cor da Grade">
                <CampoCor rotulo="Cor da Grade" valor={rascunho.grid_color} onMudar={(v) => mudar('grid_color', v)} />
              </Campo>
              <Campo rotulo="Opacidade da Grade">
                <Deslizante rotulo="Opacidade da Grade" min={0} max={1} valor={rascunho.grid_opacity} onMudar={(v) => mudar('grid_opacity', v)} />
              </Campo>
            </fieldset>
          </>
        )}

        {aba === 'ambiente' && (
          <fieldset className="janela-grupo">
            <legend>Ambiente</legend>
            <Campo rotulo="Luminosidade" dica="Mais alto deixa a cena clara como se uma luz a iluminasse; mais baixo, mais escura.">
              <Deslizante rotulo="Luminosidade" min={-1} max={1} valor={rascunho.luminosity} onMudar={(v) => mudar('luminosity', v)} />
            </Campo>
            <Campo rotulo="Saturação" dica="Acima de 0 as cores ficam mais intensas; abaixo, mais apagadas.">
              <Deslizante rotulo="Saturação" min={-1} max={1} valor={rascunho.saturation} onMudar={(v) => mudar('saturation', v)} />
            </Campo>
            <Campo rotulo="Sombras" dica="Aumentar deixa as sombras e as partes escuras da cena ainda mais escuras.">
              <Deslizante rotulo="Sombras" min={0} max={1} valor={rascunho.shadows} onMudar={(v) => mudar('shadows', v)} />
            </Campo>
          </fieldset>
        )}

        {aba === 'diversos' && (
          <fieldset className="janela-grupo">
            <legend>Áudio</legend>
            <Campo rotulo="Playlist da Cena" dica="Uma playlist que começa a tocar quando esta cena é ativada.">
              <select disabled aria-label="Playlist da Cena"><option>Chega com a Lista de Reprodução</option></select>
            </Campo>
            <Campo rotulo="Áudio da Playlist" dica="Um som específico da playlist pra tocar quando esta cena estiver ativa.">
              <select disabled aria-label="Áudio da Playlist"><option>Chega com a Lista de Reprodução</option></select>
            </Campo>
          </fieldset>
        )}
      </div>

      {aviso && <p className="janela-aviso">{aviso}</p>}
      <button type="button" className="janela-botao" disabled={salvando} onClick={salvar}>
        <FontAwesomeIcon icon={faFloppyDisk} /> {salvando ? 'Salvando…' : 'Salvar Alterações'}
      </button>
    </Janela>
  )
}
