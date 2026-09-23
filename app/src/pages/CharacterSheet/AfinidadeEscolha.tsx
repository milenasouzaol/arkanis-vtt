import escolherSimbolo from '../../assets/afinidade/escolher-simbolo.webp'
import testeSimbolo from '../../assets/afinidade/teste-simbolo.webp'
import aleatorioSimbolo from '../../assets/afinidade/aleatorio-simbolo.webp'

export type Caminho = 'escolher' | 'teste' | 'aleatorio'

export const CAMINHOS = [
  {
    key: 'escolher' as const,
    rotulo: 'Liberdade',
    titulo: ['Escolha', 'seu Elemento'],
    detalhe: 'Seleção direta | Sem julgamento',
    simbolo: escolherSimbolo,
  },
  {
    key: 'teste' as const,
    rotulo: 'Destino',
    titulo: ['Teste de', 'Personalidade'],
    detalhe: '30 perguntas | Revelação completa',
    simbolo: testeSimbolo,
  },
  {
    key: 'aleatorio' as const,
    rotulo: 'Premonição',
    titulo: ['Escolha', 'por Mim'],
    detalhe: 'Caos | Aleatoriedade completa',
    simbolo: aleatorioSimbolo,
  },
]

export default function AfinidadeEscolha({ onEscolher }: { onEscolher: (c: Caminho) => void }) {
  return (
    <div className="afin-escolha">
      <div className="afin-cartoes">
        {CAMINHOS.map((c) => (
          <button key={c.key} type="button" className="afin-cartao" onClick={() => onEscolher(c.key)}>
            <span className="afin-cartao-rotulo">{c.rotulo}</span>
            <img className="afin-cartao-simbolo" src={c.simbolo} alt="" />
            <span className="afin-cartao-titulo">
              {c.titulo.map((linha) => <span key={linha}>{linha}</span>)}
            </span>
            <span className="afin-cartao-detalhe">{c.detalhe}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
