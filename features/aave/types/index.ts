import { getAddress } from 'ethers/lib/utils'

export type PositionId = { vaultId?: number; walletAddress?: string }
export function positionIdIsAddress (positionId: string) {
  try {
    getAddress(positionId)
    return true
  } catch(e){
    return false
  }
}
