import { IMultiplyStrategy, strategies, Tokens } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import { CloseAaveParameters } from 'actions/aave-like/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

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
}: CloseAaveParameters): Promise<IMultiplyStrategy> {
  const collateralToken = {
    symbol: currentPosition.collateral.symbol as Tokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as Tokens,
    precision: currentPosition.debt.precision,
  }

  const aaveLikeCloseStrategyType = {
    [LendingProtocol.AaveV2]: strategies.aave.multiply.v2,
    [LendingProtocol.AaveV3]: strategies.aave.multiply.v3,
    [LendingProtocol.SparkV3]: strategies.spark.multiply,
  }[protocol as AaveLendingProtocol]

  type AaveLikeCloseStrategyArgs = Parameters<typeof aaveLikeCloseStrategyType.close>[0]
  type AaveLikeCloseStrategyDeps = Parameters<typeof aaveLikeCloseStrategyType.close>[1]

  const stratArgs: AaveLikeCloseStrategyArgs = {
    slippage,
    debtToken,
    collateralToken,
    shouldCloseToCollateral,
  }

  const stratDeps: Omit<AaveLikeCloseStrategyDeps, 'addresses' | 'getSwapData'> = {
    currentPosition,
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network: networkIdToLibraryNetwork(networkId),
    positionType,
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
      const addressesSpark = getAddresses(networkId, LendingProtocol.AaveV3)
      return strategies.spark.multiply.close(stratArgs, {
        ...stratDeps,
        addresses: addressesSpark,
        getSwapData: swapCall(addressesSpark, networkId),
      })
    default:
      throw new Error('Invalid protocol')
  }
}
