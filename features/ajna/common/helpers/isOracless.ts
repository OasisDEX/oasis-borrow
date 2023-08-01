import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'

interface IsPoolOraclessParams {
  chainId?: NetworkIds
  collateralToken: string
  quoteToken: string
}

export function isPoolOracless({
  chainId,
  collateralToken,
  quoteToken,
}: IsPoolOraclessParams): boolean {
  const { ajnaPoolPairs } = getNetworkContracts(NetworkIds.MAINNET, chainId)

  return isAddress(collateralToken) && isAddress(quoteToken)
    ? true
    : !Object.keys(ajnaPoolPairs).includes(`${collateralToken}-${quoteToken}`)
}
