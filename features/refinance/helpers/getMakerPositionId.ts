import { MakerLendingPositionId } from '@summer_fi/summerfi-protocol-plugins'

export const getMakerPositionId = (vaultId: string) => {
  return MakerLendingPositionId.createFrom({
    id: vaultId,
    vaultId,
  })
}
