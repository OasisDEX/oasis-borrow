import type {
  AaveLikeStrategyAddresses,
  IPosition,
  Network,
  SystemKeys,
  Tokens,
} from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { getLocalAppConfig } from 'helpers/config'
import { getOneInchCall } from 'helpers/swap'
import { LendingProtocol } from 'lendingProtocols'

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

export function lendingProtocolToSystemKeys(protocol: LendingProtocol): SystemKeys {
  try {
    switch (protocol) {
      case LendingProtocol.AaveV2:
        throw new Error('Aave V2 is not supported')
      case LendingProtocol.AaveV3:
        return 'aave' as SystemKeys
      case LendingProtocol.Ajna:
        return 'ajna' as SystemKeys
      case LendingProtocol.SparkV3:
        return 'spark' as SystemKeys
      case LendingProtocol.MorphoBlue:
        return 'morphoblue' as SystemKeys
      case LendingProtocol.Maker:
        return 'maker' as SystemKeys
      default:
        throw new Error('Lending protocol not supported')
    }
  } catch (error) {
    console.error(error)
    throw new Error('Error converting lending protocol to system keys')
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
    : 'v4.1'
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
  collateralToken: string,
) => {
  if (lendingProtocol !== LendingProtocol.AaveV3) {
    return undefined
  }
  const flashloanTokensConfig = getLocalAppConfig('parameters').aaveLike.flashLoanTokens
  const isolatedCollateralTokensConfig =
    getLocalAppConfig('parameters').aaveLike.isolatedCollateralTokens
  const aaveV3FlashLoanTokenMap = {
    [NetworkIds.OPTIMISMMAINNET]: flashloanTokensConfig.OPTIMISMMAINNET,
    [NetworkIds.BASEMAINNET]: flashloanTokensConfig.BASEMAINNET,
  } as Record<Partial<NetworkIds>, keyof AaveLikeStrategyAddresses['tokens']>
  const flashloanToken = aaveV3FlashLoanTokenMap[networkId]
  const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)

  // isolated collaterals does not allow to deposit other tokens (from FL) as collateral
  // therefore we need to use isolated collateral as FL token
  const isIsolatedCollateral = isolatedCollateralTokensConfig.includes(
    collateralToken.toUpperCase(),
  )

  const resolvedFlashLoanToken = (
    isIsolatedCollateral ? collateralToken.toUpperCase() : flashloanToken
  ) as keyof AaveLikeStrategyAddresses['tokens']

  if (resolvedFlashLoanToken) {
    const tokenAddress = addressesV3.tokens[resolvedFlashLoanToken]
    if (tokenAddress === undefined)
      throw new Error(`Flashloan Token ${resolvedFlashLoanToken} address is undefined`)

    return {
      token: {
        symbol: resolvedFlashLoanToken,
        address: tokenAddress,
        precision: getToken(resolvedFlashLoanToken).precision,
      },
    }
  }
  return undefined
}
