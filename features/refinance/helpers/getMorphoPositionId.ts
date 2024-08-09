import { MorphoLendingPositionId } from '@summer_fi/summerfi-protocol-plugins'

export const getMorphoPositionId = (vaultId: string) => {
  return MorphoLendingPositionId.createFrom({
    id: vaultId,
  })
}
