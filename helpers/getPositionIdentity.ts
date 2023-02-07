import { getAddress } from 'ethers/lib/utils'

function safeGetAddress(address: string) {
  try {
    return getAddress(address)
  } catch (e) {
    return undefined
  }
}

export function getPositionIdentity(id: string) {
  const walletAddress = safeGetAddress(id)

  return {
    walletAddress,
    vaultId: walletAddress !== undefined ? undefined : isNaN(Number(id)) ? undefined : Number(id),
  }
}
