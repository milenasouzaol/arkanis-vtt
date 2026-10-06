import { useState } from 'react'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, CampoCor, Deslizante } from './Janela'
import type { ObjetoCena } from './cenas'
import { ANIMACOES_LUZ, luzCompleta, type AnimacaoLuz, type LuzAmbiente } from './luz'

// Configurar Luz (Luz Ambiente, pedido da Millie, 06/10): o mestre mexe e vê na hora no mapa;
// Salvar grava, fechar sem salvar volta como estava.
export default function ConfigurarLuz({ objeto, onPrevia, onSalvar, onFechar }: {
  objeto: ObjetoCena
  onPrevia: (l: LuzAmbiente) => void
  onSalvar: (l: LuzAmbiente) => void
  onFechar: () => void
}) {
  const [luz, setLuz] = useState<LuzAmbiente>(() => luzCompleta(objeto.luz_ajuste ?? (objeto.luz ? null : { raio: 4 })))
  const mudar = (campos: Partial<LuzAmbiente>) => {
    const n = { ...luz, ...campos }
    setLuz(n)
    onPrevia(n)
  }
  return (
    <div onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <Janela titulo={`Configurar Luz: ${objeto.name || 'Luz Ambiente'}`} icone={faLightbulb} largura={440} onFechar={onFechar}>
        <form
          className="janela-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSalvar(luz)
          }}
        >
          <label className="janela-check">
            <input type="checkbox" checked={luz.ligada} onChange={(e) => mudar({ ligada: e.target.checked })} />
            Luz acesa
          </label>
          <Campo rotulo="Raio (quadrados)" dica="Até onde a luz chega. Vazio = metade do tamanho do objeto.">
            <input
              type="number"
              min={0}
              step={0.5}
              aria-label="Raio (quadrados)"
              value={luz.raio ?? ''}
              placeholder="Tamanho do objeto"
              onChange={(e) => mudar({ raio: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
            />
          </Campo>
          <Campo rotulo="Luz forte" dica="Parte do raio com luz cheia; o resto vai apagando até a borda.">
            <Deslizante rotulo="Luz forte" valor={luz.forte} min={0} max={0.95} onMudar={(v) => mudar({ forte: v })} />
          </Campo>
          <Campo rotulo="Intensidade" dica="Quanto clareia a escuridão e quanto brilha.">
            <Deslizante rotulo="Intensidade" valor={luz.intensidade} min={0.05} max={1} onMudar={(v) => mudar({ intensidade: v })} />
          </Campo>
          <Campo rotulo="Cor">
            <CampoCor rotulo="Cor da luz" valor={luz.cor} onMudar={(v) => mudar({ cor: v })} />
          </Campo>
          <Campo rotulo="Abertura (graus)" dica="360 = em volta toda; menos que isso vira um cone (holofote, poste virado).">
            <Deslizante rotulo="Abertura (graus)" valor={luz.angulo} min={10} max={360} passo={5} onMudar={(v) => mudar({ angulo: v })} />
          </Campo>
          {luz.angulo < 360 && (
            <Campo rotulo="Direção (graus)" dica="0 = pra direita, 90 = pra baixo. Gira junto com o objeto.">
              <Deslizante rotulo="Direção (graus)" valor={luz.direcao} min={0} max={355} passo={5} onMudar={(v) => mudar({ direcao: v })} />
            </Campo>
          )}
          <Campo rotulo="Animação">
            <select value={luz.animacao} aria-label="Animação" onChange={(e) => mudar({ animacao: e.target.value as AnimacaoLuz })}>
              {ANIMACOES_LUZ.map((a) => <option key={a.id} value={a.id}>{a.rotulo}</option>)}
            </select>
          </Campo>
          <button type="submit" className="janela-botao">Salvar Alterações</button>
        </form>
      </Janela>
    </div>
  )
}
