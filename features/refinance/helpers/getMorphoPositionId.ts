import { MorphoPositionId } from '@summer_fi/summerfi-sdk-client'

export const getMorphoPositionId = (vaultId: string) => {
  return MorphoPositionId.createFrom({
    id: vaultId,
  })
}
