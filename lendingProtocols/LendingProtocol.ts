export enum LendingProtocol {
  AaveV2 = 'aavev2',
  AaveV3 = 'aavev3',
  Ajna = 'ajna',
  Maker = 'maker',
  SparkV3 = 'sparkv3',
}

export enum LendingProtocolLabel {
  aavev2 = 'Aave V2',
  aavev3 = 'Aave V3',
  ajna = 'Ajna',
  maker = 'Maker',
  sparkv3 = 'Spark V3',
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
  return Object.values<string>(LendingProtocol).includes(value)
}
