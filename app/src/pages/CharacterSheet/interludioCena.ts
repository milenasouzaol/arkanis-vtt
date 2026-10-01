/*
 * Objetos clicaveis da cena do esconderijo (arte da Millie, 1672x941). Cada objeto e um
 * ou mais contornos rentes a silhueta, em pixels da imagem (tracados sobre a arte
 * ampliada com grade), e um ponto onde o nome aparece ao passar o mouse.
 */

export const LARGURA_CENA = 1672
export const ALTURA_CENA = 941

export type AcaoDaCena = 'alimentar' | 'dormir' | 'exercitar' | 'ler' | 'manutencao' | 'relaxar' | 'revisar_caso'

export type ObjetoDaCena = {
  acao: AcaoDaCena
  /** Cada contorno e "x,y x,y ..." no tamanho original da arte. */
  contornos: string[]
  /** Onde fica a etiqueta com o nome. */
  etiqueta: [number, number]
}

export const OBJETOS: ObjetoDaCena[] = [
  // Mesa com a garrafa termica, as tigelas, a caneca e a cadeira com o cobertor.
  {
    acao: 'alimentar',
    contornos: ['0,941 0,595 40,585 55,525 85,525 87,578 190,577 268,612 335,610 362,625 370,608 555,618 600,668 600,941'],
    etiqueta: [230, 640],
  },
  // Cama de campanha com a mochila em cima.
  {
    acao: 'dormir',
    contornos: ['112,478 155,460 205,443 245,449 270,466 310,469 360,474 420,467 425,445 470,438 500,445 497,490 497,520 480,540 455,572 295,572 290,545 110,545'],
    etiqueta: [300, 470],
  },
  // Saco de pancada (com a toalha) e os halteres no chao.
  {
    acao: 'exercitar',
    contornos: [
      '613,200 640,200 640,245 660,252 666,300 665,470 640,478 600,478 585,460 583,262 600,248 613,245',
      '561,560 575,530 600,520 640,518 650,525 680,535 688,560 686,585 660,595 600,594 570,590 561,575',
    ],
    etiqueta: [623, 250],
  },
  // Poltrona com a manta, o abajur e a pilha de livros.
  {
    acao: 'ler',
    contornos: ['760,475 787,415 815,405 885,408 917,422 930,382 975,382 988,428 965,440 965,475 1020,470 1022,595 915,595 770,575 758,560'],
    etiqueta: [890, 410],
  },
  // Bancada com o painel de ferramentas, a luminaria, as gavetas e o banco.
  {
    acao: 'manutencao',
    contornos: ['1018,364 1049,340 1049,274 1315,272 1330,300 1350,345 1352,415 1372,445 1370,465 1300,470 1260,470 1258,525 1196,525 1150,500 1140,560 1140,611 1052,611 1030,605 1025,470 1002,455 1002,438 1018,425'],
    etiqueta: [1200, 300],
  },
  // Sofa com a manta, a mesinha e o radio antigo.
  {
    acao: 'relaxar',
    contornos: ['1138,563 1150,550 1241,527 1356,490 1477,499 1577,513 1672,540 1672,860 1213,860 1163,775 1140,720'],
    etiqueta: [1330, 600],
  },
  // Quadro de investigacao com os fios vermelhos.
  {
    acao: 'revisar_caso',
    contornos: ['1404,160 1450,135 1495,100 1580,82 1601,50 1672,45 1672,480 1610,500 1570,520 1520,490 1440,470 1395,460 1392,330 1400,250'],
    etiqueta: [1530, 130],
  },
]

/** Centro da caixa que envolve o objeto: daqui sai o mini zoom. */
export function centroDe(objeto: ObjetoDaCena): [number, number] {
  const pontos = objeto.contornos.flatMap((c) => c.split(' ').map((p) => p.split(',').map(Number)))
  const xs = pontos.map(([x]) => x)
  const ys = pontos.map(([, y]) => y)
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
}
