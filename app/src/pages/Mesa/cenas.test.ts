import { describe, expect, it } from 'vitest'
import { ajustarVista, celulaDaGrade, colunasDoTamanho, copiaDaCena, linhasSugeridas, imagemDoArrasto, redimensionarProporcional, tamanhoInicial, telaParaMapa, distanciaEmUnidades, filtroAmbiente, ladrilhoHex, montarArvore, pastasEmLista, tracoDaGrade, zoomEm, type Cena, type Pasta } from './cenas'

function pasta(p: Partial<Pasta>): Pasta {
  return { id: 'p', campaign_id: 'c', parent_id: null, name: 'Pasta', color: null, sort_mode: 'alfabetica', sort: 0, created_at: '2026-10-03T00:00:00Z', ...p }
}

function cena(p: Partial<Cena>): Cena {
  return {
    id: 's', campaign_id: 'c', folder_id: null, name: 'Cena', sort: 0, show_in_nav: false, visibility: 'todos', visible_to: [],
    background_url: null, background_color: '#000000', grid_type: 'quadrado', grid_size: 100, grid_colunas: null, grid_linhas: null, grid_distance: 1.5, grid_units: 'm',
    grid_style: 'solida', grid_thickness: 1, grid_color: '#000000', grid_opacity: 0.25, darkness: 0, weather: null, weather_cor: null, filtro_cor: null, filtro_intensidade: 0.3,
    luminosity: 0, saturation: 0, shadows: 0, created_at: '2026-10-03T00:00:00Z', ...p,
  }
}

describe('montarArvore', () => {
  const pastas = [
    pasta({ id: 'br', name: 'Brasil' }),
    pasta({ id: 'rj', name: 'Rio de Janeiro', parent_id: 'br' }),
    pasta({ id: 'ar', name: 'Argentina' }),
  ]
  const cenas = [
    cena({ id: '1', name: 'Zona Sul', folder_id: 'rj' }),
    cena({ id: '2', name: 'Copacabana', folder_id: 'rj' }),
    cena({ id: '3', name: 'Solta', folder_id: null }),
    cena({ id: '4', name: 'Órfã', folder_id: 'apagada' }),
  ]

  it('monta pastas, subpastas e cenas soltas em ordem alfabética', () => {
    const a = montarArvore(pastas, cenas)
    expect(a.pastas.map((n) => n.pasta.name)).toEqual(['Argentina', 'Brasil'])
    expect(a.pastas[1].pastas[0].pasta.name).toBe('Rio de Janeiro')
    expect(a.pastas[1].pastas[0].cenas.map((c) => c.name)).toEqual(['Copacabana', 'Zona Sul'])
    expect(a.cenas.map((c) => c.name)).toEqual(['Órfã', 'Solta'])
  })

  it('pasta manual segue a ordem definida', () => {
    const manual = [pasta({ id: 'm', name: 'M', sort_mode: 'manual' })]
    const a = montarArvore(manual, [cena({ id: 'a', name: 'A', folder_id: 'm', sort: 2 }), cena({ id: 'b', name: 'B', folder_id: 'm', sort: 1 })])
    expect(a.pastas[0].cenas.map((c) => c.name)).toEqual(['B', 'A'])
  })

  it('busca deixa só o caminho até as cenas que batem, sem ligar pra acento', () => {
    const a = montarArvore(pastas, cenas, 'copa')
    expect(a.pastas.map((n) => n.pasta.name)).toEqual(['Brasil'])
    expect(a.pastas[0].pastas[0].cenas.map((c) => c.name)).toEqual(['Copacabana'])
    expect(a.cenas).toEqual([])
    expect(montarArvore(pastas, cenas, 'orfa').cenas.map((c) => c.name)).toEqual(['Órfã'])
  })

  it('não trava com pasta dentro dela mesma', () => {
    const ciclo = [pasta({ id: 'x', name: 'X', parent_id: 'y' }), pasta({ id: 'y', name: 'Y', parent_id: 'x' })]
    expect(() => montarArvore(ciclo, [])).not.toThrow()
  })
})

it('lista as pastas com recuo pro seletor', () => {
  const lista = pastasEmLista([pasta({ id: 'br', name: 'Brasil' }), pasta({ id: 'rj', name: 'Rio', parent_id: 'br' })])
  expect(lista).toEqual([{ id: 'br', rotulo: 'Brasil' }, { id: 'rj', rotulo: '— Rio' }])
})

it('duplicar copia tudo e marca o nome', () => {
  const c = copiaDaCena(cena({ name: 'Floresta', darkness: 0.5, weather: 'chuva' }))
  expect(c.name).toBe('Floresta (cópia)')
  expect(c.darkness).toBe(0.5)
  expect(c.weather).toBe('chuva')
  expect('id' in c).toBe(false)
})

describe('vista do mapa', () => {
  it('ajusta a imagem à tela, centralizada', () => {
    expect(ajustarVista(2000, 1000, 1000, 800)).toEqual({ escala: 0.5, x: 0, y: 150 })
  })

  it('zoom mantém o ponto do mouse no lugar', () => {
    const v = zoomEm({ x: 0, y: 0, escala: 1 }, 2, 100, 50)
    expect(v).toEqual({ escala: 2, x: -100, y: -50 })
    // o ponto do mapa (100, 50) continua debaixo do mouse
    expect(100 * v.escala + v.x).toBe(100)
  })

  it('zoom tem limite', () => {
    expect(zoomEm({ x: 0, y: 0, escala: 4 }, 10, 0, 0).escala).toBe(5)
    expect(zoomEm({ x: 0, y: 0, escala: 0.2 }, 0.1, 0, 0).escala).toBe(0.1)
  })
})

describe('ambiente', () => {
  it('neutro não filtra', () => {
    expect(filtroAmbiente(0, 0, 0)).toBe('none')
  })

  it('luz, saturação e sombras viram filtro', () => {
    expect(filtroAmbiente(0.5, -1, 0)).toBe('brightness(1.4) saturate(0)')
    expect(filtroAmbiente(0, 0, 1)).toBe('contrast(1.7) brightness(0.75)')
  })
})

describe('grade', () => {
  it('traço da linha', () => {
    expect(tracoDaGrade('solida', 2)).toBeUndefined()
    expect(tracoDaGrade('tracejada', 2)).toBe('12 8')
    expect(tracoDaGrade('pontilhada', 2)).toBe('2 6')
  })

  it('ladrilho hexagonal encaixa', () => {
    const l = ladrilhoHex(100)
    expect(l.largura).toBe(100)
    expect(l.altura).toBeCloseTo(173.205, 2)
    expect(l.caminho.match(/M/g)).toHaveLength(3)
  })

  it('distância na unidade da cena', () => {
    expect(distanciaEmUnidades(3, { grid_distance: 1.5, grid_units: 'm' })).toBe('4,5 m')
  })
})

describe('imagemDoArrasto', () => {
  const arquivo = new File(['x'], 'mapa.png', { type: 'image/png' })

  it('arquivo do computador vem primeiro', () => {
    expect(imagemDoArrasto({ arquivos: [arquivo], html: '', uris: '' })).toBe(arquivo)
  })

  it('imagem dentro de link: usa o src da imagem, não o link da página', () => {
    const html = '<a href="https://site.com/pagina"><img src="https://cdn.site.com/foto.jpg?w=800&amp;h=600"></a>'
    expect(imagemDoArrasto({ arquivos: [], html, uris: 'https://site.com/pagina' })).toBe('https://cdn.site.com/foto.jpg?w=800&h=600')
  })

  it('link de página sem imagem não serve', () => {
    expect(imagemDoArrasto({ arquivos: [], html: '', uris: 'https://site.com/pagina' })).toBeNull()
  })

  it('endereço direto de imagem serve', () => {
    expect(imagemDoArrasto({ arquivos: [], html: '', uris: 'https://site.com/mapa.webp' })).toBe('https://site.com/mapa.webp')
  })

  it('arquivo que não é imagem não serve', () => {
    expect(imagemDoArrasto({ arquivos: [new File(['x'], 'a.pdf', { type: 'application/pdf' })], html: '', uris: '' })).toBeNull()
  })
})

describe('objetos por cima do mapa', () => {
  it('converte o ponto da tela pro mapa', () => {
    expect(telaParaMapa(150, 100, { x: 50, y: 0, escala: 0.5 })).toEqual({ x: 200, y: 200 })
  })

  it('imagem grande entra com no máximo 40% do mapa, mantendo a proporção', () => {
    expect(tamanhoInicial(4000, 2000, 4000, 3000)).toEqual({ width: 1600, height: 800 })
    expect(tamanhoInicial(300, 200, 4000, 3000)).toEqual({ width: 300, height: 200 })
  })

  it('redimensiona sem distorcer', () => {
    expect(redimensionarProporcional({ width: 200, height: 100 }, 100, 0)).toEqual({ width: 300, height: 150 })
    expect(redimensionarProporcional({ width: 200, height: 100 }, 0, 50)).toEqual({ width: 300, height: 150 })
    expect(redimensionarProporcional({ width: 200, height: 100 }, -500, 0)).toEqual({ width: 10, height: 5 })
  })
})

describe('grade pela quantidade de quadrados', () => {
  it('cobre a imagem inteira', () => {
    expect(celulaDaGrade({ grid_size: 100, grid_colunas: 16, grid_linhas: 11 }, { w: 1600, h: 1150 })).toEqual({ w: 100, h: 1150 / 11 })
    expect(celulaDaGrade({ grid_size: 100, grid_colunas: null, grid_linhas: null }, { w: 1600, h: 1150 })).toEqual({ w: 100, h: 100 })
  })
  it('linhas que deixam o quadrado mais quadrado', () => {
    expect(linhasSugeridas(16, { w: 1600, h: 1150 })).toBe(12)
    expect(linhasSugeridas(10, { w: 1000, h: 1000 })).toBe(10)
    expect(colunasDoTamanho(100, { w: 1600 })).toBe(16)
  })
})
