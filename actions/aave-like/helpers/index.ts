import type { AaveLikeStrategyAddresses, IPosition, Network, Tokens } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { getLocalAppConfig } from 'helpers/config'
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
  const flashloanTokensConfig = getLocalAppConfig('parameters').aaveLike.flashLoanTokens
  const aaveV3FlashLoanTokenMap = {
    [NetworkIds.OPTIMISMMAINNET]: flashloanTokensConfig.OPTIMISMMAINNET,
    [NetworkIds.BASEMAINNET]: flashloanTokensConfig.BASEMAINNET,
  } as Record<Partial<NetworkIds>, keyof AaveLikeStrategyAddresses['tokens']>
  const flashloanToken = aaveV3FlashLoanTokenMap[networkId]
  const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)

  if (flashloanToken) {
    const tokenAddress = addressesV3.tokens[flashloanToken]
    if (tokenAddress === undefined)
      throw new Error(`Flashloan Token ${flashloanToken} address is undefined`)
    return {
      token: {
        symbol: flashloanToken,
        address: tokenAddress,
        precision: getToken(flashloanToken).precision,
      },
    }
  }
  return undefined
}
