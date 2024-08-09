import {
  AaveV3LendingPositionId,
  SparkLendingPositionId,
} from '@summer_fi/summerfi-protocol-plugins'
import { LendingProtocol } from 'lendingProtocols'

export const getAaveLikePositionId = (lendingProtocol: LendingProtocol, vaultId: string) => {
  switch (lendingProtocol) {
    case LendingProtocol.AaveV3:
      return AaveV3LendingPositionId.createFrom({
        id: vaultId,
      })
    case LendingProtocol.SparkV3:
      return SparkLendingPositionId.createFrom({
        id: vaultId,
      })
    default:
      throw new Error(`Unsupported lending protocol: ${lendingProtocol}`)
  }
}
