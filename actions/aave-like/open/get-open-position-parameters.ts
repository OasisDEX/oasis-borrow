import { AAVETokens, IRiskRatio, PositionTransition, strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { assertProtocol } from 'actions/aave-like/guards'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import { OpenMultiplyAaveParameters } from 'actions/aave-like/types'
import BigNumber from 'bignumber.js'
import { ethNullAddress, getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ProxyType } from 'features/aave/types'
import { AaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

async function openPosition(
  slippage: BigNumber,
  riskRatio: IRiskRatio,
  debtToken: { symbol: AAVETokens; precision: number },
  collateralToken: {
    symbol: AAVETokens
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

  type OpenAaveLikeMultiplyPositionParams = Parameters<typeof strategies.aave.multiply.v2.open> &
    Parameters<
      typeof strategies.aave.multiply.v3.open
    > /*& Parameters<typeof strategies.spark.multiply.open> */

  const args: OpenAaveLikeMultiplyPositionParams[0] = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    depositedByUser,
    positionType: positionType,
  }

  type SharedAaveLikeDependencies = Omit<
    OpenAaveLikeMultiplyPositionParams[1],
    'addresses' | 'getSwapData'
  >
  const sharedDependencies: SharedAaveLikeDependencies = {
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? userAddress : ethNullAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network,
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
      return await strategies.aave.multiply.v3.open(args, dependenciesAaveV3)
    case LendingProtocol.SparkV3:
      throw new Error('SparkV3 is not supported yet')
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
}: OpenMultiplyAaveParameters): Promise<PositionTransition> {
  const _collateralToken = {
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
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
