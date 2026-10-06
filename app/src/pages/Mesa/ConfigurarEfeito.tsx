import { useState } from 'react'
import { faFire } from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo, CampoCor, Deslizante } from './Janela'
import type { ObjetoCena } from './cenas'
import { efeitoCompleto, efeitoPadrao, TIPOS_EFEITO, type Efeito, type TipoEfeito } from './efeitos'

// Configurar Efeito (pedido da Millie, 06/10): fogo, fumaça, água, nuvem, veneno, faíscas. O
// mestre mexe e vê na hora no mapa; Salvar grava, fechar sem salvar volta como estava.
export default function ConfigurarEfeito({ objeto, onPrevia, onSalvar, onFechar }: {
  objeto: ObjetoCena
  onPrevia: (e: Efeito) => void
  onSalvar: (e: Efeito) => void
  onFechar: () => void
}) {
  const [efeito, setEfeito] = useState<Efeito>(() => efeitoCompleto(objeto.efeito) ?? efeitoPadrao('fogo'))
  const mudar = (campos: Partial<Efeito>) => {
    const n = { ...efeito, ...campos }
    setEfeito(n)
    onPrevia(n)
  }
  // Trocar o tipo traz a cor e o jeito padrão dele (fogo laranja pra cima, água azul de lado…).
  const trocarTipo = (tipo: TipoEfeito) => {
    const n = efeitoPadrao(tipo)
    setEfeito(n)
    onPrevia(n)
  }
  return (
    <div onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <Janela titulo={`Configurar Efeito: ${objeto.name || 'Efeito'}`} icone={faFire} largura={440} onFechar={onFechar}>
        <form
          className="janela-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSalvar(efeito)
          }}
        >
          <Campo rotulo="Efeito">
            <div className="efeito-tipos" role="radiogroup" aria-label="Efeito">
              {TIPOS_EFEITO.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={efeito.tipo === t.id} className={`janela-botao${efeito.tipo === t.id ? ' janela-botao-destaque' : ''}`} onClick={() => trocarTipo(t.id)}>
                  {t.rotulo}
                </button>
              ))}
            </div>
          </Campo>
          <Campo rotulo="Cor" dica="Escura (ex.: preto) pinta por cima; clara brilha, como fogo de verdade.">
            <CampoCor rotulo="Cor do efeito" valor={efeito.cor} onMudar={(v) => mudar({ cor: v })} />
          </Campo>
          <Campo rotulo="Tamanho (quadrados)" dica="Até onde o efeito chega.">
            <Deslizante rotulo="Tamanho (quadrados)" valor={efeito.tamanho} min={0.5} max={10} passo={0.5} onMudar={(v) => mudar({ tamanho: v })} />
          </Campo>
          <Campo rotulo="Quantidade">
            <Deslizante rotulo="Quantidade" valor={efeito.quantidade} min={0.2} max={2} passo={0.1} onMudar={(v) => mudar({ quantidade: v })} />
          </Campo>
          <Campo rotulo="Velocidade">
            <Deslizante rotulo="Velocidade" valor={efeito.velocidade} min={0.3} max={2} passo={0.1} onMudar={(v) => mudar({ velocidade: v })} />
          </Campo>
          <Campo rotulo="Direção (graus)" dica="-90 = pra cima, 0 = direita, 90 = pra baixo. Gira junto com o objeto.">
            <Deslizante rotulo="Direção (graus)" valor={efeito.direcao} min={-180} max={180} passo={5} onMudar={(v) => mudar({ direcao: v })} />
          </Campo>
          <Campo rotulo="Abertura (graus)" dica="Quanto espalha: pouco = jato fino; 360 = pra todo lado.">
            <Deslizante rotulo="Abertura (graus)" valor={efeito.abertura} min={0} max={360} passo={5} onMudar={(v) => mudar({ abertura: v })} />
          </Campo>
          <button type="submit" className="janela-botao">Salvar Alterações</button>
        </form>
      </Janela>
    </div>
  )
}
