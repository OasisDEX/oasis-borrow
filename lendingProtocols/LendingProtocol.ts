export enum LendingProtocol {
  AaveV2 = 'aavev2',
  AaveV3 = 'aavev3',
  Ajna = 'ajna',
  Maker = 'maker',
  MorphoBlue = 'morphoblue',
  SparkV3 = 'sparkv3',
  Sky = 'sky',
}

export enum LendingProtocolLabel {
  aavev2 = 'Aave V2',
  aavev3 = 'Aave V3',
  ajna = 'Ajna',
  maker = 'Maker',
  morphoblue = 'Morpho',
  sparkv3 = 'Spark',
  sky = 'Sky',
}

export type AaveLendingProtocol = LendingProtocol.AaveV2 | LendingProtocol.AaveV3
export type SparkLendingProtocol = LendingProtocol.SparkV3
export type AaveLikeLendingProtocol = AaveLendingProtocol | SparkLendingProtocol

export const checkIfAave = (
  protocol: string | LendingProtocol,
): protocol is AaveLendingProtocol => {
  return (
    isLendingProtocol(protocol) &&
    (protocol === LendingProtocol.AaveV2 || protocol === LendingProtocol.AaveV3)
  )
}
export const checkIfSpark = (
  protocol: string | LendingProtocol,
): protocol is SparkLendingProtocol => {
  return isLendingProtocol(protocol) && protocol === LendingProtocol.SparkV3
}

export const isAaveLikeLendingProtocol = (
  protocol: string | LendingProtocol,
): protocol is AaveLikeLendingProtocol => {
  return checkIfAave(protocol) || checkIfSpark(protocol)
}

export const isLendingProtocol = (value: string): value is LendingProtocol => {
  return Object.values<string>(LendingProtocol).includes(value)
}
