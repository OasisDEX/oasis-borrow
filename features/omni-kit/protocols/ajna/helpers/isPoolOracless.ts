import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'

interface IsPoolOraclessParams {
  collateralToken: string
  networkId?: NetworkIds
  quoteToken: string
}

export function isPoolOracless({
  collateralToken,
  networkId,
  quoteToken,
}: IsPoolOraclessParams): boolean {
  const { ajnaPoolPairs } = getNetworkContracts(NetworkIds.MAINNET, networkId)

  return isAddress(collateralToken) && isAddress(quoteToken)
    ? true
    : !Object.keys(ajnaPoolPairs).includes(`${collateralToken}-${quoteToken}`)
}
