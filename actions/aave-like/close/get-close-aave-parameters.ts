import type { IMultiplyStrategy } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import {
  getAaveV3FlashLoanToken,
  getCurrentPositionLibCallData,
  networkIdToLibraryNetwork,
  swapCall,
} from 'actions/aave-like/helpers'
import type { CloseAaveParameters } from 'actions/aave-like/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import type { AaveLendingProtocol } from 'lendingProtocols'
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
}: CloseAaveParameters): Promise<IMultiplyStrategy> {
  const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)

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
    flashloan: getAaveV3FlashLoanToken(networkId, protocol, collateralToken.symbol),
  }

  const stratDeps: Omit<AaveLikeCloseStrategyDeps, 'addresses' | 'getSwapData'> = {
    currentPosition,
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network: networkIdToLibraryNetwork(networkId),
    positionType: 'Multiply', // this needs to be multiply even if we use this for closing borrow
    // from the lib perspective close is a multiply based operation
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
      return strategies.aave.multiply.v2.close(stratArgs, {
        ...stratDeps,
        addresses: addressesV2,
        getSwapData: swapCall(addressesV2, networkId, userAddress),
      })
    case LendingProtocol.AaveV3:
      const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
      return strategies.aave.multiply.v3.close(stratArgs, {
        ...stratDeps,
        addresses: addressesV3,
        getSwapData: swapCall(addressesV3, networkId, userAddress),
      })
    case LendingProtocol.SparkV3:
      const addressesSpark = getAddresses(networkId, LendingProtocol.SparkV3)
      return strategies.spark.multiply.close(stratArgs, {
        ...stratDeps,
        addresses: addressesSpark,
        getSwapData: swapCall(addressesSpark, networkId, userAddress),
      })
    default:
      throw new Error('Invalid protocol')
  }
}
