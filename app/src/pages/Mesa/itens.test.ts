import { describe, expect, it } from 'vitest'
import { atividadeCompleta, copiaDoItem, itemDoCompendio, semAtividade, duplicarAtividade, etiquetasDoItem, nivelNoItem, novaAtividade, ordenarItens, rotuloDaAtivacao, textoDeUsos, type ItemMesa } from './itens'

const item = (c: Partial<ItemMesa> = {}): ItemMesa => ({
  id: 'i', campaign_id: 'c', folder_id: null, name: 'Espada', categoria: 'lootavel', image_url: null, raridade: null, quantidade: 1, carga: 1,
  descricao: null, detalhes: {}, atividades: [], efeitos: {}, conteudo: [], compendio_id: null, acesso_padrao: 'nenhum', acesso_jogadores: {}, mostrar_mestres: true, sort: 0, created_at: '2026-10-06T10:00:00Z',
  ...c,
})

describe('itens da mesa', () => {
  it('cada atividade nasce com o efeito dela e o nome do tipo', () => {
    const a = novaAtividade('checar', 'x')
    expect(a.nome).toBe('Checar')
    expect(a.checar).toEqual({ pericia: '', atributo: '', dt: null })
    expect(novaAtividade('ataque').ataque?.alcance).toBe('corpo')
    expect(novaAtividade('sumonar').sumonar?.quantidade).toBe(1)
  })
  it('atividade antiga sem campo é completada', () => {
    const a = atividadeCompleta({ id: 'x', tipo: 'dano', nome: 'Explosão' })
    expect(a.nome).toBe('Explosão')
    expect(a.ativacao.quando).toBe('clicar')
    expect(a.dano?.tipoDano).toBe('impacto')
  })
  it('duplicar e rótulos da lista', () => {
    const a = novaAtividade('cura', 'x')
    const d = duplicarAtividade(a, 'y')
    expect(d.id).toBe('y')
    expect(d.nome).toBe('Cura (Cópia)')
    expect(rotuloDaAtivacao(a)).toBe('Ao Clicar')
    expect(textoDeUsos({ gastos: 1, max: 3 })).toBe('2/3')
    expect(textoDeUsos({ gastos: 0, max: null })).toBe('—')
  })
  it('acesso: mestre é dono; jogador pelo individual ou o padrão', () => {
    const i = item({ acesso_padrao: 'limitado', acesso_jogadores: { j1: 'dono' } })
    expect(nivelNoItem(i, 'x', true)).toBe('dono')
    expect(nivelNoItem(i, 'j1', false)).toBe('dono')
    expect(nivelNoItem(i, 'j2', false)).toBe('limitado')
  })
  it('cópia do item e ordem da lista', () => {
    const i = item({ atividades: [novaAtividade('checar', 'a1')] })
    const c = copiaDoItem(i)
    expect(c.name).toBe('Espada (Cópia)')
    expect(c.atividades[0].id).not.toBe('a1')
    const lista = [item({ name: 'b', created_at: '1' }), item({ name: 'A', created_at: '2' })]
    expect(ordenarItens(lista, 'alfabetica').map((x) => x.name)).toEqual(['A', 'b'])
    expect(ordenarItens(lista, 'criacao').map((x) => x.name)).toEqual(['b', 'A'])
  })
  it('encadeamento: tirar uma atividade e copiar o item mantêm os elos certos', () => {
    const a = { ...novaAtividade('checar', 'a'), seSim: ['b'], seNao: ['c'] }
    const lista = [a, novaAtividade('conteiner', 'b'), novaAtividade('dano', 'c')]
    expect(semAtividade(lista, 'c')[0].seNao).toEqual([])
    const c = copiaDoItem(item({ atividades: lista }))
    const [nA, nB] = c.atividades
    expect(nA.seSim).toEqual([nB.id])
    expect(nA.id).not.toBe('a')
  })
  it('item do compêndio já vem preenchido e ligado ao equipamento', () => {
    const i = itemDoCompendio({ id: 'e1', nome: 'Arco', tipo: 'arma', categoria: 'I', carga: 2, descricao: 'Arma <simples>.\n\nDisparo.', imagem: null })
    expect(i).toMatchObject({ name: 'Arco', categoria: 'lootavel', carga: 2, compendio_id: 'e1', detalhes: { tipo: 'arma', categoriaSistema: 'I' } })
    expect(i.descricao).toBe('<p>Arma &lt;simples&gt;.</p><p>Disparo.</p>')
    expect(itemDoCompendio({ id: 'e2', nome: 'x', tipo: 'outro', categoria: '0', carga: 0, descricao: '', imagem: null }).detalhes.tipo).toBeUndefined()
  })
  it('etiquetas', () => {
    expect(etiquetasDoItem(item({ detalhes: { tipo: 'arma' }, raridade: 'raro' }))).toEqual(['Item Lootável', 'Arma', 'Raro'])
    expect(etiquetasDoItem(item({ categoria: 'armadilha', detalhes: { tipo: 'arma' } }))).toEqual(['Armadilha'])
  })
})
