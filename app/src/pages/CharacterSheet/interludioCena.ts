/*
 * Objetos clicaveis da cena do esconderijo (arte da Millie, 1672x941). Cada objeto e um
 * contorno em pixels da imagem e um ponto onde o nome aparece ao passar o mouse.
 */

export const LARGURA_CENA = 1672
export const ALTURA_CENA = 941

export type AcaoDaCena = 'alimentar' | 'dormir' | 'exercitar' | 'ler' | 'manutencao' | 'relaxar' | 'revisar_caso'

export type ObjetoDaCena = {
  acao: AcaoDaCena
  /** "x,y x,y ..." no tamanho original da arte. */
  contorno: string
  /** Onde fica a etiqueta com o nome. */
  etiqueta: [number, number]
}

export const OBJETOS: ObjetoDaCena[] = [
  // Mesa com a refeicao, a chaleira e a cadeira com o cobertor.
  { acao: 'alimentar', contorno: '0,560 120,545 300,590 460,640 600,700 600,941 0,941', etiqueta: [230, 640] },
  // Cama de campanha.
  { acao: 'dormir', contorno: '100,470 230,440 470,445 500,500 495,585 110,595', etiqueta: [300, 470] },
  // Saco de pancada, halteres e a corda no chao.
  { acao: 'exercitar', contorno: '578,225 668,225 668,475 700,510 790,585 780,615 545,615 548,515 578,475', etiqueta: [623, 250] },
  // Poltrona, abajur e a pilha de livros.
  { acao: 'ler', contorno: '760,420 840,385 915,385 925,380 990,385 1020,470 1020,585 760,585', etiqueta: [890, 410] },
  // Bancada de ferramentas com a lanterna desmontada.
  { acao: 'manutencao', contorno: '1015,345 1060,270 1385,250 1388,470 1300,600 1015,600', etiqueta: [1200, 300] },
  // Sofa, a mesinha e o radio antigo.
  { acao: 'relaxar', contorno: '1135,560 1240,520 1360,490 1500,540 1672,520 1672,800 1520,720 1360,840 1200,790 1135,700', etiqueta: [1330, 600] },
  // Quadro de investigacao com os fios vermelhos.
  { acao: 'revisar_caso', contorno: '1390,70 1672,0 1672,505 1560,515 1395,490', etiqueta: [1530, 130] },
]
