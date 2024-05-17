import { MakerPositionId } from 'summerfi-sdk-client'

export const getMakerPositionId = (id: string, vaultId: string) => {
  return MakerPositionId.createFrom({
    id,
    vaultId,
  })
}
