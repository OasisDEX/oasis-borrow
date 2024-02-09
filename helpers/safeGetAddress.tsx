import { getAddress } from 'ethers/lib/utils'

export function safeGetAddress(address: string | undefined) {
  if (address) {
    try {
      return getAddress(address)
    } catch (e) {
      return undefined
    }
  }
  return undefined
}
