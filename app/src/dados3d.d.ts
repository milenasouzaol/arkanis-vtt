// Biblioteca de dados 3D (MIT, https://github.com/3d-dice/dice-box-threejs): não vem com tipos.
declare module '@3d-dice/dice-box-threejs' {
  const DiceBox: new (seletor: string, config?: Record<string, unknown>) => unknown
  export default DiceBox
}
