import { LendingProtocol } from 'lendingProtocols'

const raysProtocolMap = {
  [LendingProtocol.AaveV2]: ['aave_v2'],
  [LendingProtocol.AaveV3]: ['aave_v3'],
  [LendingProtocol.SparkV3]: ['spark'],
  [LendingProtocol.Ajna]: [LendingProtocol.Ajna],
  [LendingProtocol.Maker]: [LendingProtocol.Maker],
  [LendingProtocol.MorphoBlue]: [LendingProtocol.MorphoBlue, 'erc4626'],
} as Record<string, string[]>

export const getRaysMappedProtocol = (protocol: LendingProtocol) => raysProtocolMap[protocol]
