import { MorphoPositionId } from 'summerfi-sdk-client'

export const getMorphoPositionId = (vaultId: string) => {
  return MorphoPositionId.createFrom({
    id: vaultId,
  })
}
