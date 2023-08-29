import { AAVETokens, IRiskRatio, PositionTransition, strategies } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave-like/get-token-addresses'
import { assertProtocol } from 'actions/aave-like/guards'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import { OpenMultiplyAaveParameters } from 'actions/aave-like/types'
import BigNumber from 'bignumber.js'
import { ethNullAddress, getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

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
  protocol: AaveLendingProtocol,
) {
  assertProtocol(protocol)

  const network = networkIdToLibraryNetwork(networkId)

  const args: Parameters<typeof strategies.aave.v2.open>[0] &
    Parameters<typeof strategies.aave.v3.open>[0] = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    depositedByUser,
    positionType: positionType,
  }

  const addresses = getTokenAddresses(networkId)

  const dependencies: Parameters<typeof strategies.aave.v2.open>[1] &
    Parameters<typeof strategies.aave.v3.open>[1] = {
    addresses,
    provider: getRpcProvider(networkId),
    getSwapData: swapCall(addresses, networkId),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? userAddress : ethNullAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      return await strategies.aave.v2.open(args, dependencies)
    case LendingProtocol.AaveV3:
      return await strategies.aave.v3.open(args, dependencies)
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
