import type { IPosition, Network, Tokens } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { NetworkIds } from 'blockchain/networks'
import { getOneInchCall } from 'helpers/swap'
import { LendingProtocol } from 'lendingProtocols'

// enum Network {
//   MAINNET = "mainnet",
//   GOERLI = "goerli",
//   HARDHAT = "hardhat",
//   OPTIMISM = "optimism",
//   ARBITRUM = "arbitrum",
//   LOCAL = "local"
// }

export function networkIdToLibraryNetwork(networkId: NetworkIds): Network {
  switch (networkId) {
    case NetworkIds.MAINNET:
      return 'mainnet' as Network
    case NetworkIds.GOERLI:
      return 'goerli' as Network
    case NetworkIds.OPTIMISMMAINNET:
      return 'optimism' as Network
    case NetworkIds.ARBITRUMMAINNET:
      return 'arbitrum' as Network
    case NetworkIds.BASEMAINNET:
      return 'base' as Network
    default:
      throw new Error(`Can't convert networkId ${networkId} to library network`)
  }
}

export function swapCall(
  { swapAddress }: Pick<ReturnType<typeof getAddresses>, 'swapAddress'>,
  network: NetworkIds,
) {
  const oneInchVersion = [
    NetworkIds.OPTIMISMMAINNET,
    NetworkIds.ARBITRUMMAINNET,
    NetworkIds.BASEMAINNET,
  ].includes(network)
    ? 'v5.0'
    : 'v4.0'
  return getOneInchCall(swapAddress, network, oneInchVersion)
}

export const getCurrentPositionLibCallData = (currentPosition: IPosition) => [
  {
    symbol: currentPosition.collateral.symbol as Tokens,
    precision: currentPosition.collateral.precision,
  },
  {
    symbol: currentPosition.debt.symbol as Tokens,
    precision: currentPosition.debt.precision,
  },
]

export const getAaveV3FlashLoanToken = (
  networkId: NetworkIds,
  lendingProtocol: LendingProtocol,
) => {
  if (lendingProtocol !== LendingProtocol.AaveV3) {
    return undefined
  }
  const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
  if (networkId === NetworkIds.OPTIMISMMAINNET) {
    const tokenAddress = addressesV3.tokens['WETH']
    if (tokenAddress === undefined) throw new Error('WETH address is undefined')
    return {
      token: {
        symbol: 'WETH',
        address: tokenAddress,
        precision: 18,
      },
    }
  }
  if (networkId === NetworkIds.BASEMAINNET) {
    const tokenAddress = addressesV3.tokens['USDBC']
    if (tokenAddress === undefined) throw new Error('USDBC address is undefined')
    return {
      token: {
        symbol: 'USDBC',
        address: tokenAddress,
        precision: 6,
      },
    }
  }
  return undefined
}
