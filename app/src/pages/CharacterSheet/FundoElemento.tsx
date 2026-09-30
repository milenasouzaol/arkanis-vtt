import type { ChaveElemento } from './elementosParanormais'

/*
 * Tons do marmore dourado, medidos no print da referencia de Conhecimento: o marrom das
 * sombras, o meio, o dourado e o brilho dos veios. Cada lista e um canal (R, G ou B) e
 * percorre as faixas escuro > meio > dourado > ... pra desenhar os veios do marmore.
 */
const ESCURO = [0.31, 0.2, 0.06]
const MEIO = [0.43, 0.32, 0.14]
const OURO = [0.55, 0.41, 0.16]
const BRILHO = [0.69, 0.55, 0.24]
const FAIXAS = [ESCURO, MEIO, OURO, MEIO, ESCURO, MEIO, BRILHO, OURO, MEIO, ESCURO, MEIO, OURO]
const canal = (i: number) => FAIXAS.map((c) => c[i]).join(' ')

/** Ouro derretido: marmore gerado no navegador, que escorre devagar. */
function Ouro() {
  return (
    <div className="afin-fundo-ouro" aria-hidden>
      {[0, 1].map((camada) => (
        <svg key={camada} className={`afin-ouro-camada c${camada}`} preserveAspectRatio="none" viewBox="0 0 800 450">
          {/* sRGB: o padrao dos filtros e o espaco linear, que clareia tudo e tirava o tom de ouro. */}
          <filter id={`afin-ouro-${camada}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency={camada ? '0.006 0.0045' : '0.0045 0.0075'} numOctaves="4" seed={camada ? 23 : 7} result="base" />
            {/* Um segundo ruido, bem largo, entorta o primeiro: os veios viram redemoinhos
                em vez de manchas, que e o que da a cara de metal escorrendo. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.0022" numOctaves="2" seed={camada ? 41 : 3} result="torcao" />
            <feDisplacementMap in="base" in2="torcao" scale="160" xChannelSelector="R" yChannelSelector="G" />
            {/* O ruido vira uma luminancia so, esticada pra usar as faixas todas. */}
            <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="2.4" intercept="-0.7" />
              <feFuncG type="linear" slope="2.4" intercept="-0.7" />
              <feFuncB type="linear" slope="2.4" intercept="-0.7" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="table" tableValues={canal(0)} />
              <feFuncG type="table" tableValues={canal(1)} />
              <feFuncB type="table" tableValues={canal(2)} />
            </feComponentTransfer>
          </filter>
          <rect width="800" height="450" filter={`url(#afin-ouro-${camada})`} />
        </svg>
      ))}
    </div>
  )
}

/**
 * Fundo das telas cheias da Afinidade. Conhecimento tem o ouro derretido; os outros usam
 * o fundo do elemento borrado com a correnteza escura por cima.
 */
export default function FundoElemento({ elemento }: { elemento: ChaveElemento }) {
  if (elemento === 'conhecimento') return <Ouro />
  return (
    <>
      <div className="afin-final-fundo" />
      <div className="afin-final-correnteza" />
    </>
  )
}
