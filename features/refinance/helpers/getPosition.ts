import { AaveV3Position, MakerPosition, MorphoPosition, SparkPosition } from 'summerfi-sdk-client'
import { type IPosition, ProtocolName } from 'summerfi-sdk-common'

export const getPosition = (protocolName: ProtocolName, position: IPosition): IPosition => {
  switch (protocolName) {
    case ProtocolName.Maker:
      return MakerPosition.createFrom(position)
    case ProtocolName.Spark:
      return SparkPosition.createFrom(position)
    case ProtocolName.AAVEv3:
      return AaveV3Position.createFrom(position)
    case ProtocolName.AAVEv2:
      throw new Error('AAVEv2 is not supported')
    case ProtocolName.Morpho:
      return MorphoPosition.createFrom(position)

    default:
      throw new Error(`Unsupported protocol name: ${protocolName}`)
  }
}
