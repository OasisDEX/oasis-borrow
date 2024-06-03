import { AaveV3PositionId, SparkPositionId } from '@summer_fi/summerfi-sdk-client'
import { LendingProtocol } from 'lendingProtocols'

export const getAaveLikePositionId = (lendingProtocol: LendingProtocol, vaultId: string) => {
  switch (lendingProtocol) {
    case LendingProtocol.AaveV3:
      return AaveV3PositionId.createFrom({
        id: vaultId,
      })
    case LendingProtocol.SparkV3:
      return SparkPositionId.createFrom({
        id: vaultId,
      })
    default:
      throw new Error(`Unsupported lending protocol: ${lendingProtocol}`)
  }
}
