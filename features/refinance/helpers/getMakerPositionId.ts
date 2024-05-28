import { MakerPositionId } from 'summerfi-sdk-client'

export const getMakerPositionId = (vaultId: string) => {
  return MakerPositionId.createFrom({
    id: vaultId,
    vaultId,
  })
}
