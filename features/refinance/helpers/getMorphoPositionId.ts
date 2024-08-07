import { MorphoLendingPositionId } from '@summer_fi/summerfi-sdk-client'

export const getMorphoPositionId = (vaultId: string) => {
  return MorphoLendingPositionId.createFrom({
    id: vaultId,
  })
}
