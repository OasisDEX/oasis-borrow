import { ProtocolName } from '@summer_fi/summerfi-sdk-common'
import { LendingProtocol } from 'lendingProtocols'

const ProtocolNameByLendingProtocol: Record<LendingProtocol, ProtocolName> = {
  [LendingProtocol.AaveV2]: ProtocolName.AaveV2,
  [LendingProtocol.AaveV3]: ProtocolName.AaveV3,
  [LendingProtocol.Ajna]: ProtocolName.Ajna,
  [LendingProtocol.MorphoBlue]: ProtocolName.MorphoBlue,
  [LendingProtocol.SparkV3]: ProtocolName.Spark,
  [LendingProtocol.Maker]: ProtocolName.Maker,
  [LendingProtocol.Sky]: 'Sky' as ProtocolName,
}

// get ProtocolName by LendingProtocol, throw error if not found
export function getProtocolNameByLendingProtocol(protocol: LendingProtocol): ProtocolName {
  const protocolName = ProtocolNameByLendingProtocol[protocol]
  if (!protocolName) {
    throw new Error(`ProtocolName not found for LendingProtocol: ${protocol}`)
  }
  return protocolName
}
