import type { IMultiplyStrategy } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import {
  getAaveV3FlashLoanToken,
  getCurrentPositionLibCallData,
  networkIdToLibraryNetwork,
  swapCall,
} from 'actions/aave-like/helpers'
import type { AdjustAaveParameters } from 'actions/aave-like/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import type { AaveLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

export async function getAdjustPositionParameters({
  userAddress,
  proxyAddress,
  slippage,
  riskRatio,
  currentPosition,
  proxyType,
  positionType: _positionType,
  protocol,
  networkId,
}: AdjustAaveParameters): Promise<IMultiplyStrategy> {
  try {
    const provider = getRpcProvider(networkId)

    const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)

    const aaveLikeAjdustStrategyType = {
      [LendingProtocol.AaveV2]: strategies.aave.multiply.v2,
      [LendingProtocol.AaveV3]: strategies.aave.multiply.v3,
      [LendingProtocol.SparkV3]: strategies.spark.multiply,
    }[protocol as AaveLendingProtocol]

    type AaveLikeAdjustStrategyArgs = Parameters<typeof aaveLikeAjdustStrategyType.adjust>[0]
    type AaveLikeAdjustStrategyDeps = Parameters<typeof aaveLikeAjdustStrategyType.adjust>[1]

    const args: AaveLikeAdjustStrategyArgs = {
      slippage,
      multiple: riskRatio,
      debtToken: debtToken,
      collateralToken: collateralToken,
      flashloan: getAaveV3FlashLoanToken(networkId, protocol),
    }

    const stratDeps: Omit<AaveLikeAdjustStrategyDeps, 'addresses' | 'getSwapData'> = {
      currentPosition,
      provider: provider,
      proxy: proxyAddress,
      user: userAddress,
      isDPMProxy: proxyType === ProxyType.DpmProxy,
      network: networkIdToLibraryNetwork(networkId),
      positionType: 'Multiply', // this needs to be multiply even if we use this for adjusting borrow
      // from the lib perspective borrow and multiply are the same
    }

    switch (protocol) {
      case LendingProtocol.AaveV2:
        const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
        return await strategies.aave.multiply.v2.adjust(args, {
          ...stratDeps,
          addresses: addressesV2,
          getSwapData: swapCall(addressesV2, networkId),
        })
      case LendingProtocol.AaveV3:
        const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
        return await strategies.aave.multiply.v3.adjust(args, {
          ...stratDeps,
          addresses: addressesV3,
          getSwapData: swapCall(addressesV3, networkId),
        })
      case LendingProtocol.SparkV3:
        const addressesSparkV3 = getAddresses(networkId, LendingProtocol.SparkV3)
        return await strategies.spark.multiply.adjust(args, {
          ...stratDeps,
          addresses: addressesSparkV3,
          getSwapData: swapCall(addressesSparkV3, networkId),
        })
      default:
        throw new Error('Invalid protocol')
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
