import { ProtocolName } from '@summer_fi/summerfi-sdk-common'
import { LendingProtocol } from 'lendingProtocols'

export function getLendingProtocolByProtocolName(name: ProtocolName) {
  const val = {
    [ProtocolName.Spark]: LendingProtocol.SparkV3,
    [ProtocolName.Maker]: LendingProtocol.Maker,
    [ProtocolName.AaveV2]: LendingProtocol.AaveV2,
    [ProtocolName.AaveV3]: LendingProtocol.AaveV3,
    [ProtocolName.Ajna]: LendingProtocol.Ajna,
    [ProtocolName.MorphoBlue]: LendingProtocol.MorphoBlue,
    [ProtocolName.Armada]: null,
  }[name]

  if (val === null) {
    throw new Error(`Unsupported lending protocol: ${name}`)
  }
  return val
}
