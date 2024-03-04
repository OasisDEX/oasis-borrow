import { LendingProtocol } from 'lendingProtocols'

export const getOmniProtocolUrlMap = (protocol: LendingProtocol) => {
  const protocolUrlMap = {
    [LendingProtocol.AaveV2]: 'aave/v2',
    [LendingProtocol.AaveV3]: 'aave/v3',
    [LendingProtocol.SparkV3]: 'spark',
    [LendingProtocol.Ajna]: protocol,
    [LendingProtocol.MorphoBlue]: protocol,
    [LendingProtocol.Maker]: protocol,
  }

  return protocolUrlMap[protocol]
}
