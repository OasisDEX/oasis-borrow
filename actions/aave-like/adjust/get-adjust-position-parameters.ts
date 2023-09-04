import {
  AaveLikeProtocol as AaveLikeLibProtocol,
  IPositionTransitionParams,
  strategies,
  Tokens,
} from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave-like/helpers'
import { AdjustAaveParameters } from 'actions/aave-like/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

export async function getAdjustPositionParameters({
  userAddress,
  proxyAddress,
  slippage,
  riskRatio,
  currentPosition,
  proxyType,
  positionType,
  protocol,
  networkId,
}: AdjustAaveParameters): Promise<IPositionTransitionParams> {
  try {
    const provider = getRpcProvider(networkId)

    const collateralToken = {
      symbol: currentPosition.collateral.symbol as Tokens,
      precision: currentPosition.collateral.precision,
    }

    const debtToken = {
      symbol: currentPosition.debt.symbol as Tokens,
      precision: currentPosition.debt.precision,
    }

    const aaveLikeAjdustStrategyType = {
      [LendingProtocol.AaveV2]: strategies.aave.multiply.v2,
      [LendingProtocol.AaveV3]: strategies.aave.multiply.v3,
      // [LendingProtocol.SparkV3]: strategies.spark.multiply,
    }[protocol as AaveLendingProtocol] // to be AaveLikeLendingProtocol when SparkV3 is added

    type AaveLikeAdjustStrategyArgs = Parameters<typeof aaveLikeAjdustStrategyType.adjust>[0]
    type AaveLikeAdjustStrategyDeps = Parameters<typeof aaveLikeAjdustStrategyType.adjust>[1]

    const args: AaveLikeAdjustStrategyArgs = {
      slippage,
      multiple: riskRatio,
      debtToken: debtToken,
      collateralToken: collateralToken,
    }

    const stratDeps: Omit<AaveLikeAdjustStrategyDeps, 'addresses' | 'getSwapData'> = {
      currentPosition,
      provider: provider,
      proxy: proxyAddress,
      user: userAddress,
      isDPMProxy: proxyType === ProxyType.DpmProxy,
      network: networkIdToLibraryNetwork(networkId),
      positionType,
      protocolType: {
        [LendingProtocol.AaveV2]: 'AAVE',
        [LendingProtocol.AaveV3]: 'AAVE_V3',
        [LendingProtocol.SparkV3]: 'Spark',
      }[protocol] as AaveLikeLibProtocol,
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
        throw new Error('SparkV3 not implemented')
      default:
        throw new Error('Invalid protocol')
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
