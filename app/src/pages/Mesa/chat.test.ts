import { describe, expect, it } from 'vitest'
import {
  aplicarFormato,
  resumoDaMensagem,
  alternarEmLinha,
  autoria,
  estiloDoCampo,
  FORMATO_PADRAO,
  formatoVazio,
  type EmLinha,
  destinatario,
  ehPrivada,
  exportarRegistro,
  formulaDaRolagem,
  juntarMensagem,
  linkificar,
  sanitizarHtml,
  tempoRelativo,
  vazio,
  type Mensagem,
} from './chat'

function msg(p: Partial<Mensagem>): Mensagem {
  return {
    id: 'x', campaign_id: 'c', user_id: 'u', character_id: null, modo: 'publico_usuario',
    autor_nome: 'Millie', autor_foto: null, conteudo: null, rolagem: null,
    destacada: false, revelada: false, created_at: '2026-10-02T10:00:00Z', ...p,
  }
}

describe('privacidade', () => {
  it('privado, cego e somente para si são privados até revelar', () => {
    expect(ehPrivada(msg({ modo: 'privado_mestres' }))).toBe(true)
    expect(ehPrivada(msg({ modo: 'cego_mestres' }))).toBe(true)
    expect(ehPrivada(msg({ modo: 'somente_si' }))).toBe(true)
    expect(ehPrivada(msg({ modo: 'privado_mestres', revelada: true }))).toBe(false)
    expect(ehPrivada(msg({ modo: 'publico_personagem' }))).toBe(false)
  })

  it('mostra o destinatário certo', () => {
    expect(destinatario(msg({ modo: 'privado_mestres' }), 'Millie', 'Pedro')).toBe('Millie')
    expect(destinatario(msg({ modo: 'cego_mestres' }), 'Millie', 'Pedro')).toBe('Jogadores')
    expect(destinatario(msg({ modo: 'somente_si' }), 'Millie', 'Pedro')).toBe('Pedro')
    expect(destinatario(msg({ modo: 'publico_usuario' }), 'Millie', 'Pedro')).toBeNull()
  })
})

describe('autoria', () => {
  const conta = { nome: 'Pedro', foto: 'conta.png' }
  const personagem = { nome: 'Arthur', foto: 'arthur.png' }

  it('como usuário fala a conta', () => {
    expect(autoria('publico_usuario', conta, personagem)).toEqual(conta)
  })

  it('nos outros modos fala o personagem', () => {
    expect(autoria('publico_personagem', conta, personagem)).toEqual(personagem)
    expect(autoria('privado_mestres', conta, personagem)).toEqual(personagem)
  })

  it('sem personagem cai na conta', () => {
    expect(autoria('publico_personagem', conta, null)).toEqual(conta)
    expect(autoria('publico_personagem', conta, { nome: ' ', foto: null })).toEqual(conta)
  })
})

describe('tempoRelativo', () => {
  const agora = new Date('2026-10-10T12:00:00Z')
  const antes = (min: number) => new Date(agora.getTime() - min * 60000).toISOString()

  it('escreve como na referência', () => {
    expect(tempoRelativo(antes(0), agora)).toBe('agora')
    expect(tempoRelativo(antes(5), agora)).toBe('5 min atrás')
    expect(tempoRelativo(antes(60), agora)).toBe('1h atrás')
    expect(tempoRelativo(antes(192), agora)).toBe('3h 12min atrás')
    expect(tempoRelativo(antes((4 * 24 + 18) * 60), agora)).toBe('4 dias 18h atrás')
    expect(tempoRelativo(antes(24 * 60), agora)).toBe('1 dia atrás')
    expect(tempoRelativo(antes(33 * 24 * 60), agora)).toBe('1 mês 3 dias atrás')
  })
})

describe('sanitizarHtml', () => {
  it('mantém a formatação do chat', () => {
    const html = '<b>a</b><i>b</i><u>c</u><s>d</s><sup>e</sup><sub>f</sub><code>g</code><hr><span style="color: rgb(255, 0, 0); font-size: 20px">h</span>'
    expect(sanitizarHtml(html)).toBe(html)
  })

  it('tira scripts, eventos e links perigosos', () => {
    expect(sanitizarHtml('<img src="x" onerror="alert(1)">oi<script>alert(1)</script>')).toBe('oi')
    expect(sanitizarHtml('<a href="javascript:alert(1)">clique</a>')).toBe('clique')
    expect(sanitizarHtml('<span style="background: url(x); color: red" onclick="x()">a</span>')).toBe('<span style="color: red">a</span>')
  })

  it('tira a tag desconhecida mas mantém o texto', () => {
    expect(sanitizarHtml('<h1>titulo</h1><table><tr><td>x</td></tr></table>')).toBe('titulox')
  })

  it('links e imagens válidos saem seguros', () => {
    expect(sanitizarHtml('<a href="https://youtu.be/x">v</a>')).toBe('<a href="https://youtu.be/x" target="_blank" rel="noopener noreferrer">v</a>')
    expect(sanitizarHtml('<img src="https://a.co/i.png">')).toBe('<img src="https://a.co/i.png" alt="">')
  })
})

describe('linkificar', () => {
  it('URL no texto vira link', () => {
    expect(linkificar('olha https://youtu.be/abc aqui')).toBe('olha <a href="https://youtu.be/abc">https://youtu.be/abc</a> aqui')
  })

  it('não mexe em link que já existe nem em código', () => {
    expect(linkificar('<a href="https://a.co">https://a.co</a>')).toBe('<a href="https://a.co">https://a.co</a>')
    expect(linkificar('<code>https://a.co</code>')).toBe('<code>https://a.co</code>')
  })
})

it('não envia mensagem vazia', () => {
  expect(vazio('<div><br></div>&nbsp; ')).toBe(true)
  expect(vazio('<hr>')).toBe(false)
  expect(vazio('<img src="https://a.co/i.png">')).toBe(false)
  expect(vazio('oi')).toBe(false)
})

it('exporta o registro em texto', () => {
  const texto = exportarRegistro([
    msg({ conteudo: '<b>oi</b><br>tudo bem?' }),
    msg({ autor_nome: 'Arthur', rolagem: { label: 'Luta', total: 17, detail: 'd20: 14', dice: null, bonus: 3 } }),
  ], 'Campanha')
  expect(texto).toContain('Registro de chat — Campanha')
  expect(texto).toContain('oi\ntudo bem?')
  expect(texto).toContain('Arthur')
  expect(texto).toContain('Luta: 17 (d20: 14)')
})

it('junta mensagem nova em ordem e sem duplicar', () => {
  const a = msg({ id: 'a', created_at: '2026-10-02T10:00:00Z' })
  const b = msg({ id: 'b', created_at: '2026-10-02T11:00:00Z' })
  expect(juntarMensagem([b], a).map((m) => m.id)).toEqual(['a', 'b'])
  expect(juntarMensagem([a, b], { ...a, revelada: true })).toHaveLength(2)
})

describe('formulaDaRolagem', () => {
  it('agrupa os dados e soma o bônus', () => {
    expect(formulaDaRolagem({ label: '', total: 0, detail: '', bonus: 3, dice: [{ sides: 20, value: 4 }, { sides: 20, value: 9, discarded: true }, { sides: 6, value: 2 }] })).toBe('2d20 + 1d6 + 3')
    expect(formulaDaRolagem({ label: '', total: 0, detail: '', bonus: -2, dice: [{ sides: 20, value: 4 }] })).toBe('1d20 − 2')
    expect(formulaDaRolagem({ label: '', total: 0, detail: '', bonus: 0, dice: [{ sides: 20, value: 4 }] })).toBe('1d20')
  })

  it('sem dados usa o detalhe', () => {
    expect(formulaDaRolagem({ label: '', total: 5, detail: 'd20: 5', bonus: 0, dice: null })).toBe('d20: 5')
  })
})

describe('formato que fica marcado', () => {
  it('liga e desliga, e sobrescrito tira subscrito', () => {
    let f = alternarEmLinha(FORMATO_PADRAO, 'negrito')
    expect(f.emLinha).toEqual(['negrito'])
    f = alternarEmLinha(f, 'subscrito')
    f = alternarEmLinha(f, 'sobrescrito')
    expect(f.emLinha).toEqual(['negrito', 'sobrescrito'])
    f = alternarEmLinha(f, 'negrito')
    expect(f.emLinha).toEqual(['sobrescrito'])
  })

  it('envolve a mensagem no formato marcado', () => {
    const f = { emLinha: ['italico', 'negrito'] as EmLinha[], fonte: 'Roboto Slab', tamanho: 20, cor: '#ff0000' }
    expect(aplicarFormato('oi', f)).toBe('<span style="font-family: \'Roboto Slab\'; font-size: 20px; color: #ff0000"><b><i>oi</i></b></span>')
    expect(aplicarFormato('oi', FORMATO_PADRAO)).toBe('oi')
  })

  it('o que sai continua passando no filtro', () => {
    const html = aplicarFormato('oi', { emLinha: ['codigo', 'sublinhado'], fonte: null, tamanho: 12, cor: null })
    expect(sanitizarHtml(html)).toBe('<span style="font-size: 12px"><u><code>oi</code></u></span>')
  })

  it('não deixa injetar nada pela fonte ou pela cor', () => {
    const html = aplicarFormato('oi', { emLinha: [], fonte: `x'"><script>`, tamanho: null, cor: 'red;background:url(x)' })
    expect(html).toBe(`<span style="font-family: 'xscript'">oi</span>`)
  })

  it('mostra o formato no campo', () => {
    expect(estiloDoCampo({ emLinha: ['negrito', 'sublinhado', 'tachado'], fonte: null, tamanho: 28, cor: '#00ff00' })).toEqual({
      fontWeight: '700', textDecoration: 'underline line-through', fontSize: '28px', color: '#00ff00',
    })
    expect(formatoVazio(FORMATO_PADRAO)).toBe(true)
  })
})

describe('resumo pra notificação', () => {
  it('tira a formatação e corta', () => {
    expect(resumoDaMensagem({ conteudo: '<p><b>Oi</b>&nbsp;gente<br>tudo bem?</p>', rolagem: null })).toBe('Oi gente tudo bem?')
    expect(resumoDaMensagem({ conteudo: '<img src="x">', rolagem: null })).toBe('[imagem]')
    expect(resumoDaMensagem({ conteudo: 'a'.repeat(200), rolagem: null }, 10)).toBe('aaaaaaaaa…')
  })
  it('rolagem e ação', () => {
    expect(resumoDaMensagem({ conteudo: null, rolagem: { label: 'Teste de Luta', total: 17, detail: '', dice: null, bonus: 0 } })).toBe('Teste de Luta: 17')
    expect(resumoDaMensagem({ conteudo: null, rolagem: null, acao: { tipo: 'ataque', atacante: 'A', ataque: {} as never, alvos: [{ token_id: '1', nome: 'Maria' }], estado: {} } })).toBe('está atacando Maria')
  })
})
