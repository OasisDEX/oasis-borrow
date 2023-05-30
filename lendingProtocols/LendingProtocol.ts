export enum LendingProtocol {
  AaveV2 = 'aavev2',
  AaveV3 = 'aavev3',
  Ajna = 'ajna',
  Maker = 'maker',
}

export enum LendingProtocolLabel {
  AaveV2 = 'Aave V2',
  AaveV3 = 'Aave V3',
  Ajna = 'Ajna',
  Maker = 'Maker',
}

export type AaveLendingProtocol = LendingProtocol.AaveV2 | LendingProtocol.AaveV3

export const checkIfAave = (
  protocol: string | LendingProtocol,
): protocol is AaveLendingProtocol => {
  return (
    isLendingProtocol(protocol) &&
    (protocol === LendingProtocol.AaveV2 || protocol === LendingProtocol.AaveV3)
  )
}

export const isLendingProtocol = (value: string): value is LendingProtocol => {
  return value in LendingProtocol
}
