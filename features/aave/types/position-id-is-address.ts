import { getAddress } from 'ethers/lib/utils'

export function positionIdIsAddress(positionId: string) {
  try {
    getAddress(positionId)
    return true
  } catch (e) {
    return false
  }
}
