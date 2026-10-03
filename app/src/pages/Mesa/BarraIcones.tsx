// Coluna vertical de ícones da mesa (12.2): esmaecidos por padrão, acendem no hover
// mostrando o rótulo, e clicar abre a aba. Os ícones de verdade dependem das referências
// da Millie — até lá cada botão mostra a sigla da aba.
export default function BarraIcones<T extends string>({ lado, itens, ativo, onEscolher }: {
  lado: 'esquerda' | 'direita'
  itens: { id: T; rotulo: string; sigla: string }[]
  ativo: T | null
  onEscolher: (id: T) => void
}) {
  return (
    <nav className={`mesa-barra mesa-barra-${lado}`} aria-label={lado === 'direita' ? 'Abas da mesa' : 'Ferramentas de cena'}>
      {itens.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mesa-icone${ativo === item.id ? ' ativo' : ''}`}
          aria-label={item.rotulo}
          aria-pressed={ativo === item.id}
          onClick={() => onEscolher(item.id)}
        >
          <span className="mesa-icone-sigla" aria-hidden>{item.sigla}</span>
          <span className="mesa-icone-rotulo" role="tooltip">{item.rotulo}</span>
        </button>
      ))}
    </nav>
  )
}
