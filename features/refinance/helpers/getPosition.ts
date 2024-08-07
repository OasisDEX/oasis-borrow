import {
  AaveV3LendingPosition,
  MakerLendingPosition,
  MorphoLendingPosition,
  SparkLendingPosition,
} from '@summer_fi/summerfi-sdk-client'
import {
  type ILendingPosition,
  type PositionParameters,
  ProtocolName,
} from '@summer_fi/summerfi-sdk-common'

export const getPosition = (
  protocolName: ProtocolName,
  position: PositionParameters,
): ILendingPosition => {
  switch (protocolName) {
    case ProtocolName.Maker:
      return MakerLendingPosition.createFrom(position)
    case ProtocolName.Spark:
      return SparkLendingPosition.createFrom(position)
    case ProtocolName.AaveV3:
      return AaveV3LendingPosition.createFrom(position)
    case ProtocolName.AaveV2:
      throw new Error('AAVEv2 is not supported')
    case ProtocolName.MorphoBlue:
      return MorphoLendingPosition.createFrom(position)

    default:
      throw new Error(`Unsupported protocol name: ${protocolName}`)
  }
}
