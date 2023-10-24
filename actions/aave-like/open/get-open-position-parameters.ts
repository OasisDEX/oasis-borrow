import type { IMultiplyStrategy, IRiskRatio, Tokens } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { assertProtocol } from 'actions/aave-like/guards'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import type { OpenMultiplyAaveParameters } from 'actions/aave-like/types'
import type BigNumber from 'bignumber.js'
import { ethNullAddress, getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ProxyType } from 'features/aave/types'
import type { AaveLendingProtocol, AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

async function openPosition(
  slippage: BigNumber,
  riskRatio: IRiskRatio,
  debtToken: { symbol: Tokens; precision: number },
  collateralToken: {
    symbol: Tokens
    precision: number
  },
  depositedByUser: {
    collateralToken?: { amountInBaseUnit: BigNumber }
    debtToken?: { amountInBaseUnit: BigNumber }
  },
  positionType: 'Multiply' | 'Earn' | 'Borrow',
  networkId: NetworkIds,
  proxyAddress: string,
  userAddress: string,
  proxyType: ProxyType,
  protocol: AaveLikeLendingProtocol,
) {
  assertProtocol(protocol)

  const network = networkIdToLibraryNetwork(networkId)

  const aaveLikeOpenStrategyType = {
    [LendingProtocol.AaveV2]: strategies.aave.multiply.v2,
    [LendingProtocol.AaveV3]: strategies.aave.multiply.v3,
    [LendingProtocol.SparkV3]: strategies.spark.multiply,
  }[protocol as AaveLendingProtocol]

  type AaveLikeOpenStrategyArgs = Parameters<typeof aaveLikeOpenStrategyType.open>[0]
  type AaveLikeOpenStrategyDeps = Parameters<typeof aaveLikeOpenStrategyType.open>[1]

  const args: AaveLikeOpenStrategyArgs = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    depositedByUser: {
      collateralInWei: depositedByUser.collateralToken?.amountInBaseUnit,
      debtInWei: depositedByUser.debtToken?.amountInBaseUnit,
    },
  }

  type SharedAaveLikeDependencies = Omit<AaveLikeOpenStrategyDeps, 'addresses' | 'getSwapData'>
  const sharedDependencies: SharedAaveLikeDependencies = {
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? userAddress : ethNullAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network,
    positionType,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      const aavev2Addresses = getAddresses(networkId, LendingProtocol.AaveV2)
      const dependenciesAaveV2 = {
        ...sharedDependencies,
        addresses: aavev2Addresses,
        getSwapData: swapCall(aavev2Addresses, networkId),
      }
      return await strategies.aave.multiply.v2.open(args, dependenciesAaveV2)
    case LendingProtocol.AaveV3:
      const aavev3Addresses = getAddresses(networkId, LendingProtocol.AaveV3)
      const dependenciesAaveV3 = {
        ...sharedDependencies,
        addresses: aavev3Addresses,
        getSwapData: swapCall(aavev3Addresses, networkId),
      }

      if (networkId === NetworkIds.BASEMAINNET) {
        const tokenAddress = aavev3Addresses.tokens['USDBC']
        if (tokenAddress === undefined) throw new Error('USDBC address is undefined')
        args.flashloan = {
          token: {
            symbol: 'USDBC',
            address: tokenAddress,
            precision: 6,
          },
        }
      }

      if (networkId === NetworkIds.OPTIMISMMAINNET) {
        args.flashloan = {
          token: {
            symbol: 'WETH',
            address: aavev3Addresses.tokens['WETH'],
            precision: 18,
          },
        }
      }
      return await strategies.aave.multiply.v3.open(args, dependenciesAaveV3)
    case LendingProtocol.SparkV3:
      const sparkV3Addresses = getAddresses(networkId, LendingProtocol.SparkV3)
      const dependenciesSparkV3 = {
        ...sharedDependencies,
        addresses: sparkV3Addresses,
        getSwapData: swapCall(sparkV3Addresses, networkId),
      }
      return await strategies.spark.multiply.open(args, dependenciesSparkV3)
    default:
      throw new Error('Unsupported protocol')
  }
}

export async function getOpenPositionParameters({
  amount,
  collateralToken,
  debtToken,
  depositToken,
  riskRatio,
  slippage,
  proxyAddress,
  userAddress,
  proxyType,
  positionType,
  protocol,
  networkId,
}: OpenMultiplyAaveParameters): Promise<IMultiplyStrategy> {
  const _collateralToken = {
    symbol: collateralToken as Tokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as Tokens,
    precision: getToken(debtToken).precision,
  }

  let depositedByUser: {
    collateralToken?: {
      amountInBaseUnit: BigNumber
    }
    debtToken?: { amountInBaseUnit: BigNumber }
  }

  if (depositToken === debtToken) {
    depositedByUser = {
      debtToken: {
        amountInBaseUnit: amountToWei(amount, debtToken),
      },
    }
  } else if (depositToken === collateralToken) {
    depositedByUser = {
      collateralToken: {
        amountInBaseUnit: amountToWei(amount, collateralToken),
      },
    }
  } else {
    throw new Error('Token is neither collateral nor debt')
  }
  return openPosition(
    slippage,
    riskRatio,
    _debtToken,
    _collateralToken,
    depositedByUser,
    positionType,
    networkId,
    proxyAddress,
    userAddress,
    proxyType,
    protocol,
  )
}
