import { MakerLendingPositionId } from '@summer_fi/summerfi-sdk-client'

export const getMakerPositionId = (vaultId: string) => {
  return MakerLendingPositionId.createFrom({
    id: vaultId,
    vaultId,
  })
}
