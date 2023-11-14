import { ADDRESSES } from '@oasisdex/addresses'
import { NetworkIds } from 'blockchain/networks'
import type { DpmSupportedNetworks } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import { memoize } from 'lodash'

const tokenAddressesForNetwork = {
  [NetworkIds.MAINNET]: ADDRESSES.mainnet.common,
  [NetworkIds.ARBITRUMMAINNET]: ADDRESSES.arbitrum.common,
  [NetworkIds.OPTIMISMMAINNET]: ADDRESSES.optimism.common,
  [NetworkIds.BASEMAINNET]: ADDRESSES.base.common,
}

export const getTokenName = memoize(
  (networkId: DpmSupportedNetworks, tokenAddress: string) => {
    const addressesNetworkSet = tokenAddressesForNetwork[networkId]
    if (!addressesNetworkSet) {
      throw new Error(
        `No token addresses for network ${networkId} and tokenAddress ${tokenAddress}`,
      )
    }
    const tokenName = Object.keys(addressesNetworkSet).find(
      (key) =>
        addressesNetworkSet[key as keyof typeof addressesNetworkSet].toLowerCase() ===
        tokenAddress.toLowerCase(),
    )
    if (!tokenName) {
      throw new Error(
        `No token name for network ${networkId} and tokenAddress ${tokenAddress} in addressesNetworkSet ${JSON.stringify(
          addressesNetworkSet,
        )}`,
      )
    }

    return tokenName === 'WETH' ? 'ETH' : tokenName
  },
  (networkId, tokenAddress) => JSON.stringify({ networkId, tokenAddress }),
)
