import { useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faFloppyDisk, faPlus, faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons'
import Janela, { Campo } from './Janela'
import {
  BIOMAS, CUSTOM_PADRAO, ESTACOES_PADRAO, nomeDoMes, tempoCompleto, tempoPadrao, type Bioma, type ConfigTempo,
} from './tempo'

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="janela-grupo">
      <legend>{titulo}</legend>
      {children}
    </fieldset>
  )
}

const num = (v: string, min: number, max = Infinity) => Math.min(max, Math.max(min, Math.round(Number(v)) || min))

// Tempo e Calendário (pedido da Millie, 07/10): o mestre liga relógio e/ou calendário, escolhe
// quem vê, o modo (tradicional ou personalizado), onde começa e o que aparece (lua, estação, clima).
export function ConfigurarTempo({ tempo, ativo, onSalvar, onDesligar, onFechar }: {
  tempo: ConfigTempo
  ativo: boolean
  onSalvar: (t: ConfigTempo) => Promise<boolean>
  onDesligar: () => Promise<boolean>
  onFechar: () => void
}) {
  const [t, setT] = useState<ConfigTempo>(ativo ? tempo : { ...tempoPadrao(), ...tempo, relogio: true, calendario: true })
  const [salvando, setSalvando] = useState(false)
  const c = t.custom
  const mudar = (x: Partial<ConfigTempo>) => setT((a) => ({ ...a, ...x }))
  const mudarCustom = (x: Partial<ConfigTempo['custom']>) => setT((a) => ({ ...a, custom: { ...a.custom, ...x } }))
  const qtdMeses = t.modo === 'custom' ? c.meses.length : 12

  async function salvar() {
    setSalvando(true)
    // Mudar o começo não mexe no tempo que já passou.
    const ok = await onSalvar(tempoCompleto(t))
    setSalvando(false)
    if (ok) onFechar()
  }

  return (
    <Janela titulo="Tempo e Calendário" icone={faClock} largura={560} altura={680} onFechar={onFechar}>
      <div className="janela-form janela-rolagem config-tempo">
        <Grupo titulo="O que ligar">
          <label className="janela-check"><input type="checkbox" checked={t.relogio} onChange={(e) => mudar({ relogio: e.target.checked })} /> Relógio (a hora do dia)</label>
          <label className="janela-check"><input type="checkbox" checked={t.calendario} onChange={(e) => mudar({ calendario: e.target.checked })} /> Calendário (sem ele, aparece Dia 1, Dia 2…)</label>
          <label className="janela-check"><input type="checkbox" checked={t.jogadoresVeem} onChange={(e) => mudar({ jogadoresVeem: e.target.checked })} /> Os jogadores veem</label>
        </Grupo>

        <Grupo titulo="Calendário">
          <div className="criar-personagem-tipos" role="radiogroup" aria-label="Modo">
            {(['tradicional', 'custom'] as const).map((modo) => (
              <label key={modo} className={`criar-personagem-tipo${t.modo === modo ? ' ativo' : ''}`}>
                <input type="radio" checked={t.modo === modo} onChange={() => mudar({ modo })} /> {modo === 'tradicional' ? 'Tradicional' : 'Personalizado'}
              </label>
            ))}
          </div>
          <p className="janela-dica">{t.modo === 'tradicional' ? '365 dias, 24 horas de 60 minutos, de domingo a sábado, de janeiro a dezembro.' : 'Você escolhe as horas, a semana, os meses e o nome do ano.'}</p>
          {t.modo === 'custom' && (
            <>
              <div className="config-tempo-par">
                <Campo rotulo="Horas no dia"><input type="number" min={1} value={c.horasNoDia} onChange={(e) => mudarCustom({ horasNoDia: num(e.target.value, 1, 100) })} /></Campo>
                <Campo rotulo="Minutos na hora"><input type="number" min={1} value={c.minutosNaHora} onChange={(e) => mudarCustom({ minutosNaHora: num(e.target.value, 1, 1000) })} /></Campo>
              </div>
              <Campo rotulo="Nome do ano" dica="Aparece depois do número (ex.: 312 d.R.). Vazio = só o número.">
                <input value={c.sufixoAno} placeholder="d.R." onChange={(e) => mudarCustom({ sufixoAno: e.target.value })} />
              </Campo>
              <Campo rotulo="Dias da semana" dica="Um por linha, na ordem.">
                <textarea rows={4} value={c.diasDaSemana.join('\n')} onChange={(e) => mudarCustom({ diasDaSemana: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} />
              </Campo>
              <div className="config-tempo-meses">
                <span className="janela-rotulo">Meses</span>
                {c.meses.map((mes, i) => (
                  <div key={i} className="config-tempo-mes">
                    <input value={mes.nome} aria-label={`Nome do mês ${i + 1}`} onChange={(e) => mudarCustom({ meses: c.meses.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) })} />
                    <input type="number" min={1} value={mes.dias} aria-label={`Dias do mês ${i + 1}`} onChange={(e) => mudarCustom({ meses: c.meses.map((x, j) => (j === i ? { ...x, dias: num(e.target.value, 1, 1000) } : x)) })} />
                    <span>dias</span>
                    <button type="button" className="cal-btn" aria-label="Tirar mês" disabled={c.meses.length <= 1} onClick={() => mudarCustom({ meses: c.meses.filter((_, j) => j !== i) })}><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                ))}
                <button type="button" className="mesa-botao" onClick={() => mudarCustom({ meses: [...c.meses, { nome: `Mês ${c.meses.length + 1}`, dias: 30 }] })}><FontAwesomeIcon icon={faPlus} /> Mês</button>
                <p className="janela-dica">{c.meses.reduce((s, x) => s + x.dias, 0)} dias no ano.</p>
              </div>
            </>
          )}
        </Grupo>

        <Grupo titulo="Começo da campanha">
          <div className="config-tempo-par">
            <Campo rotulo="Dia"><input type="number" min={1} value={t.inicio.dia} onChange={(e) => mudar({ inicio: { ...t.inicio, dia: num(e.target.value, 1, 1000) } })} /></Campo>
            <Campo rotulo="Mês">
              <select value={t.inicio.mes} onChange={(e) => mudar({ inicio: { ...t.inicio, mes: Number(e.target.value) } })}>
                {Array.from({ length: qtdMeses }, (_, i) => <option key={i} value={i + 1}>{nomeDoMes(t, i + 1)}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Ano"><input type="number" value={t.inicio.ano} onChange={(e) => mudar({ inicio: { ...t.inicio, ano: Math.round(Number(e.target.value)) || 0 } })} /></Campo>
          </div>
          <div className="config-tempo-par">
            <Campo rotulo="Hora"><input type="number" min={0} value={t.inicio.hora} onChange={(e) => mudar({ inicio: { ...t.inicio, hora: num(e.target.value, 0, 99) } })} /></Campo>
            <Campo rotulo="Minuto"><input type="number" min={0} value={t.inicio.minuto} onChange={(e) => mudar({ inicio: { ...t.inicio, minuto: num(e.target.value, 0, 999) } })} /></Campo>
          </div>
          <button type="button" className="mesa-botao" onClick={() => mudar({ minutos: 0, rodando: null })}><FontAwesomeIcon icon={faRotateLeft} /> Voltar o tempo pro começo</button>
        </Grupo>

        <Grupo titulo="Relógio">
          <div className="config-tempo-par">
            <Campo rotulo="Formato">
              <select value={t.formato} onChange={(e) => mudar({ formato: e.target.value as ConfigTempo['formato'] })}>
                <option value="24h">24 horas (14:30)</option>
                <option value="12h">12 horas (2:30 PM)</option>
              </select>
            </Campo>
            <Campo rotulo="Velocidade do ▶" dica="Minutos de jogo por minuto real.">
              <input type="number" min={0.1} step={0.5} value={t.velocidade} onChange={(e) => mudar({ velocidade: Math.max(0.1, Number(e.target.value) || 1) })} />
            </Campo>
          </div>
          <label className="janela-check"><input type="checkbox" checked={t.segundos} onChange={(e) => mudar({ segundos: e.target.checked })} /> Mostrar os segundos</label>
          <div className="config-tempo-par">
            <Campo rotulo="Amanhecer (hora)"><input type="number" min={0} value={t.amanhecer} onChange={(e) => mudar({ amanhecer: num(e.target.value, 0, 99) })} /></Campo>
            <Campo rotulo="Pôr do sol (hora)"><input type="number" min={0} value={t.anoitecer} onChange={(e) => mudar({ anoitecer: num(e.target.value, 0, 99) })} /></Campo>
          </div>
          <label className="janela-check"><input type="checkbox" checked={t.tomDaCena} onChange={(e) => mudar({ tomDaCena: e.target.checked })} /> Tom da cena pela hora (a noite escurece o mapa, o amanhecer e o pôr do sol esquentam)</label>
        </Grupo>

        <Grupo titulo="Lua">
          <label className="janela-check"><input type="checkbox" checked={t.mostrarLua} onChange={(e) => mudar({ mostrarLua: e.target.checked })} /> Mostrar a fase da lua</label>
          {t.modo === 'custom' && (
            <Campo rotulo="Ciclo da lua (dias)"><input type="number" min={1} step={0.5} value={t.cicloLua} onChange={(e) => mudar({ cicloLua: Math.max(1, Number(e.target.value) || 29.5) })} /></Campo>
          )}
        </Grupo>

        <Grupo titulo="Estações">
          <label className="janela-check"><input type="checkbox" checked={t.mostrarEstacao} onChange={(e) => mudar({ mostrarEstacao: e.target.checked })} /> Mostrar a estação (a barra de cima fica com as cores dela; sem estação, a cor da mesa)</label>
          {t.mostrarEstacao && (
            <>
              {t.estacoes.map((e, i) => (
                <div key={i} className="config-tempo-estacao">
                  <span className="config-tempo-amostra" style={{ background: `linear-gradient(90deg, ${e.cor}, ${e.cor2})` }} />
                  <input value={e.nome} aria-label="Nome da estação" onChange={(ev) => mudar({ estacoes: t.estacoes.map((x, j) => (j === i ? { ...x, nome: ev.target.value } : x)) })} />
                  <span>começa</span>
                  <input type="number" min={1} value={e.dia} aria-label="Dia" onChange={(ev) => mudar({ estacoes: t.estacoes.map((x, j) => (j === i ? { ...x, dia: num(ev.target.value, 1, 1000) } : x)) })} />
                  <select value={e.mes} aria-label="Mês" onChange={(ev) => mudar({ estacoes: t.estacoes.map((x, j) => (j === i ? { ...x, mes: Number(ev.target.value) } : x)) })}>
                    {Array.from({ length: qtdMeses }, (_, k) => <option key={k} value={k + 1}>{nomeDoMes(t, k + 1)}</option>)}
                  </select>
                  <input type="color" className="config-tempo-cor" aria-label="Cor 1" title="Cor 1 da barra" value={e.cor} onChange={(ev) => mudar({ estacoes: t.estacoes.map((x, j) => (j === i ? { ...x, cor: ev.target.value } : x)) })} />
                  <input type="color" className="config-tempo-cor" aria-label="Cor 2" title="Cor 2 da barra" value={e.cor2} onChange={(ev) => mudar({ estacoes: t.estacoes.map((x, j) => (j === i ? { ...x, cor2: ev.target.value } : x)) })} />
                  <button type="button" className="cal-btn" aria-label="Tirar estação" onClick={() => mudar({ estacoes: t.estacoes.filter((_, j) => j !== i) })}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              ))}
              <div className="config-rodape">
                <button type="button" className="mesa-botao" onClick={() => mudar({ estacoes: [...t.estacoes, { nome: 'Nova estação', mes: 1, dia: 1, cor: '#888888', cor2: '#444444' }] })}><FontAwesomeIcon icon={faPlus} /> Estação</button>
                <button type="button" className="mesa-botao" onClick={() => mudar({ estacoes: ESTACOES_PADRAO })}><FontAwesomeIcon icon={faRotateLeft} /> As quatro de sempre</button>
              </div>
            </>
          )}
        </Grupo>

        <Grupo titulo="Clima">
          <label className="janela-check"><input type="checkbox" checked={t.mostrarClima} onChange={(e) => mudar({ mostrarClima: e.target.checked })} /> Mostrar o clima do dia (sorteado pelo bioma e pela estação; você troca o de qualquer dia clicando nele no calendário)</label>
          {t.mostrarClima && (
            <Campo rotulo="Bioma">
              <select value={t.bioma} onChange={(e) => mudar({ bioma: e.target.value as Bioma })}>
                {BIOMAS.map((b) => <option key={b.id} value={b.id}>{b.rotulo}</option>)}
              </select>
            </Campo>
          )}
        </Grupo>

        <div className="config-rodape">
          <button type="button" className="janela-botao" onClick={() => setT({ ...tempoPadrao(), custom: CUSTOM_PADRAO })}><FontAwesomeIcon icon={faRotateLeft} /> Redefinir</button>
          {ativo && (
            <button type="button" className="janela-botao" onClick={async () => { if (await onDesligar()) onFechar() }}>Desligar</button>
          )}
          <button type="button" className="janela-botao" disabled={salvando || (!t.relogio && !t.calendario)} onClick={salvar}>
            <FontAwesomeIcon icon={faFloppyDisk} /> {salvando ? 'Salvando…' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </Janela>
  )
}

