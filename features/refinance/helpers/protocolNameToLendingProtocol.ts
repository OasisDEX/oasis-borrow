import { LendingProtocol } from 'lendingProtocols'
import { ProtocolName } from 'summerfi-sdk-common'

export function protocolNameToLendingProtocol(name: ProtocolName) {
  return {
    [ProtocolName.Spark]: LendingProtocol.SparkV3,
    [ProtocolName.Maker]: LendingProtocol.Maker,
    [ProtocolName.AAVEv2]: LendingProtocol.AaveV2,
    [ProtocolName.AAVEv3]: LendingProtocol.AaveV3,
    [ProtocolName.Ajna]: LendingProtocol.Ajna,
    [ProtocolName.MorphoBlue]: LendingProtocol.MorphoBlue,
  }[name]
}
