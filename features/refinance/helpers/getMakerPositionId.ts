import { MakerPositionId } from '@summer_fi/summerfi-sdk-client'

export const getMakerPositionId = (vaultId: string) => {
  return MakerPositionId.createFrom({
    id: vaultId,
    vaultId,
  })
}
