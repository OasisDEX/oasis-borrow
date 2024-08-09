import {
  AaveV3LendingPosition,
  MakerLendingPosition,
  MorphoLendingPosition,
  SparkLendingPosition,
} from '@summer_fi/summerfi-protocol-plugins'
import { type ILendingPosition, ProtocolName } from '@summer_fi/summerfi-sdk-common'

export const getPosition = (
  protocolName: ProtocolName,
  position: { id: any; type: any; subtype: any; debtAmount: any; collateralAmount: any; pool: any },
): ILendingPosition => {
  switch (protocolName) {
    case ProtocolName.Maker:
      return MakerLendingPosition.createFrom(position) as any as ILendingPosition
    case ProtocolName.Spark:
      return SparkLendingPosition.createFrom(position) as any as ILendingPosition
    case ProtocolName.AaveV3:
      return AaveV3LendingPosition.createFrom(position) as any as ILendingPosition
    case ProtocolName.AaveV2:
      throw new Error('AAVEv2 is not supported')
    case ProtocolName.MorphoBlue:
      return MorphoLendingPosition.createFrom(position) as any as ILendingPosition

    default:
      throw new Error(`Unsupported protocol name: ${protocolName}`)
  }
}
