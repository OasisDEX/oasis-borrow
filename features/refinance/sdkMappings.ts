import { LendingProtocol } from 'lendingProtocols'
import { ProtocolName } from 'summerfi-sdk-common'

const ProtocolNameByLendingProtocol: Record<LendingProtocol, ProtocolName> = {
  [LendingProtocol.AaveV2]: ProtocolName.AAVEv2,
  [LendingProtocol.AaveV3]: ProtocolName.AAVEv3,
  [LendingProtocol.Ajna]: ProtocolName.Ajna,
  [LendingProtocol.MorphoBlue]: ProtocolName.MorphoBlue,
  [LendingProtocol.SparkV3]: ProtocolName.Spark,
  [LendingProtocol.Maker]: ProtocolName.Maker,
}

// get ProtocolName by LendingProtocol, throw error if not found
export function getProtocolNameByLendingProtocol(protocol: LendingProtocol): ProtocolName {
  const protocolName = ProtocolNameByLendingProtocol[protocol]
  if (!protocolName) {
    throw new Error(`ProtocolName not found for LendingProtocol: ${protocol}`)
  }
  return protocolName
}
