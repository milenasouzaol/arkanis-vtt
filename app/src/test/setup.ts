// Registra os matchers do jest-dom (toBeInTheDocument, toHaveTextContent...) no expect
// do Vitest, e limpa o DOM entre um teste e outro pra um teste nao enxergar o que o
// anterior renderizou.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
