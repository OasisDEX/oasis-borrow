export enum LendingProtocol {
  AaveV2 = 'AaveV2',
  AaveV3 = 'AaveV3',
  Ajna = 'Ajna',
  Maker = 'Maker',
}

export type AaveLendingProtocol = LendingProtocol.AaveV2 | LendingProtocol.AaveV3

export const checkIfAave = (protocol: LendingProtocol): protocol is AaveLendingProtocol => {
  return protocol === LendingProtocol.AaveV2 || protocol === LendingProtocol.AaveV3
}
