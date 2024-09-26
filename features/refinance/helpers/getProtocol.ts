import {
  AaveV3Protocol,
  MakerProtocol,
  MorphoProtocol,
  SparkProtocol,
} from '@summer_fi/summerfi-sdk-client'
import type { ChainInfo, IProtocol } from '@summer_fi/summerfi-sdk-common'
import { ProtocolName } from '@summer_fi/summerfi-sdk-common'

export const getProtocol = ({
  chainInfo,
  protocolName,
}: {
  protocolName: ProtocolName
  chainInfo: ChainInfo
}): IProtocol => {
  switch (protocolName) {
    case ProtocolName.Maker:
      return MakerProtocol.createFrom({
        chainInfo: chainInfo,
      }) as any as IProtocol
    case ProtocolName.AaveV3:
      return AaveV3Protocol.createFrom({
        chainInfo: chainInfo,
      }) as any as IProtocol
    case ProtocolName.Spark:
      return SparkProtocol.createFrom({
        chainInfo: chainInfo,
      }) as any as IProtocol
    case ProtocolName.MorphoBlue:
      return MorphoProtocol.createFrom({
        chainInfo: chainInfo,
      }) as any as IProtocol
    default:
      throw new Error(`Protocol ${protocolName} is not found`)
  }
}
