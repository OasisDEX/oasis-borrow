import { NetworkIds } from 'blockchain/networks'
import type { NetworkIdsWithValues, OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface IsPoolSupportingMultiplyParams {
  collateralToken: string
  networkId: OmniSupportedNetworkIds
  quoteToken: string
}

const tokensWithMultiplyEthereum = [
  'CBETH',
  'DAI',
  'ETH',
  'GHO',
  'RETH',
  'SDAI',
  'USDC',
  'WBTC',
  'WSTETH',
  'YFI',
]
const tokensWithMultiplyBase = ['CBETH', 'ETH', 'USDC', 'USDBC', 'WSTETH']

const tokensWithMultiply: NetworkIdsWithValues<string[]> = {
  [NetworkIds.MAINNET]: tokensWithMultiplyEthereum,
  [NetworkIds.GOERLI]: tokensWithMultiplyEthereum,
  [NetworkIds.BASEMAINNET]: tokensWithMultiplyBase,
}

export function isPoolSupportingMultiply({
  collateralToken,
  networkId,
  quoteToken,
}: IsPoolSupportingMultiplyParams): boolean {
  return !!(
    tokensWithMultiply[networkId]?.includes(collateralToken) &&
    tokensWithMultiply[networkId]?.includes(quoteToken)
  )
}
