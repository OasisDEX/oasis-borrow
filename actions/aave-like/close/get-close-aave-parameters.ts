import { AAVETokens, PositionTransition, strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import { CloseAaveParameters } from 'actions/aave-like/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import { LendingProtocol } from 'lendingProtocols'

export async function getCloseAaveParameters({
  proxyAddress,
  userAddress,
  slippage,
  currentPosition,
  proxyType,
  shouldCloseToCollateral,
  protocol,
  networkId,
  positionType,
}: CloseAaveParameters): Promise<PositionTransition> {
  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  type closeParameters =
    | Parameters<typeof strategies.aave.multiply.v2.close>
    | Parameters<typeof strategies.aave.multiply.v3.close>
  /*| Parameters<typeof strategies.spark.close>*/
  const stratArgs: closeParameters[0] = {
    slippage,
    debtToken,
    collateralToken,
    positionType,
    shouldCloseToCollateral,
  }

  const stratDeps: Omit<closeParameters[1], 'addresses' | 'getSwapData'> = {
    // addresses,
    currentPosition,
    provider: getRpcProvider(networkId),
    // getSwapData: swapCall(addresses, networkId),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network: networkIdToLibraryNetwork(networkId),
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
      return strategies.aave.multiply.v2.close(stratArgs, {
        ...stratDeps,
        addresses: addressesV2,
        getSwapData: swapCall(addressesV2, networkId),
      })
    case LendingProtocol.AaveV3:
      const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
      return strategies.aave.multiply.v3.close(stratArgs, {
        ...stratDeps,
        addresses: addressesV3,
        getSwapData: swapCall(addressesV3, networkId),
      })
    case LendingProtocol.SparkV3:
      throw new Error('SparkV3 not implemented')
    default:
      throw new Error('Invalid protocol')
  }
}
