import type { AaveLikeTokens, AjnaStrategy, IDepositBorrowStrategy } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import type BigNumber from 'bignumber.js'
import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { amountToWei } from 'blockchain/utils'
import type { ethers } from 'ethers'
import type { AaveSimpleSupplyPosition } from 'features/omni-kit/protocols/aave-like/types/AaveSimpleSupply'
import {
  OmniEarnFormAction,
  type OmniFormState,
  type OmniSupportedNetworkIds,
} from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { OperationExecutor } from 'types/ethers-contracts'

// TODO SIMPLE EARN: this all should be handled by the library
const mapPositionData =
  ({
    collateralToken,
    depositAmount,
    operationExecutor,
  }: {
    dpmAddress: string
    collateralToken: string
    depositAmount: BigNumber
    operationExecutor: OperationExecutor
  }) =>
  (position: IDepositBorrowStrategy) => {
    const data = operationExecutor.interface.encodeFunctionData('executeOp', [
      position.transaction.calls,
      position.transaction.operationName,
    ])
    const value = collateralToken === 'ETH' ? depositAmount.toString() : zero.toString()
    return {
      tx: {
        to: operationExecutor.address,
        data,
        value,
      },
      simulation: {
        position: position.simulation.position as unknown as AaveSimpleSupplyPosition,
        targetPosition: position as unknown as AaveSimpleSupplyPosition,
        swaps: [],
        errors: [],
        warnings: [],
        notices: [],
        successes: [],
      },
    } as AjnaStrategy<AaveSimpleSupplyPosition>
  }

export const getAaveLikeParameters = async ({
  signer,
  protocol,
  state,
  networkId,
  isFormValid,
  walletAddress,
  collateralPrecision,
  collateralToken,
  rpcProvider,
  slippage,
}: {
  signer?: ethers.Signer
  protocol: LendingProtocol
  state: OmniFormState
  networkId: OmniSupportedNetworkIds
  isFormValid: boolean
  walletAddress?: string
  quoteBalance: BigNumber
  collateralPrecision: number
  collateralToken: string
  rpcProvider: ethers.providers.Provider
  slippage: BigNumber
}): Promise<AjnaStrategy<AaveSimpleSupplyPosition> | undefined> => {
  const defaultPromise = Promise.resolve(undefined)

  const { action, dpmAddress, depositAmount } = state

  if (!isFormValid || !walletAddress || !depositAmount || !signer) {
    return defaultPromise
  }

  const aaveLikeOpenStrategyType = {
    [LendingProtocol.AaveV3]: strategies.aave.borrow.v3,
    [LendingProtocol.SparkV3]: strategies.spark.borrow,
  }[protocol as LendingProtocol.AaveV3 | LendingProtocol.SparkV3]

  type AaveLikeOpenStrategyArgs = Parameters<typeof aaveLikeOpenStrategyType.openDepositBorrow>[0]
  type AaveLikeOpenStrategyDeps = Parameters<typeof aaveLikeOpenStrategyType.openDepositBorrow>[1]

  const args: AaveLikeOpenStrategyArgs = {
    slippage,
    collateralToken: {
      symbol: collateralToken as AaveLikeTokens,
      precision: collateralPrecision,
    },
    debtToken: {
      symbol: collateralToken as AaveLikeTokens,
      precision: collateralPrecision,
    },
    entryToken: {
      symbol: collateralToken as AaveLikeTokens,
      precision: collateralPrecision,
    },
    amountCollateralToDepositInBaseUnit: amountToWei(depositAmount, collateralPrecision),
    amountDebtToBorrowInBaseUnit: zero,
  }

  const stratDeps: AaveLikeOpenStrategyDeps = {
    provider: rpcProvider,
    proxy: dpmAddress,
    user: walletAddress,
    network: networkIdToLibraryNetwork(networkId),
    positionType: 'Borrow',
    addresses: getAddresses(
      networkId,
      protocol as LendingProtocol.AaveV3 | LendingProtocol.SparkV3,
    ),
  }

  const { operationExecutor } = await validateParameters({
    signer,
    networkId,
    proxyAddress: dpmAddress,
  })

  switch (action) {
    // TODO SIMPLE EARN: more cases to come (not just simple earn)
    case OmniEarnFormAction.OpenEarn: {
      switch (protocol) {
        case LendingProtocol.AaveV3:
          return await strategies.aave.borrow.v3
            .openDepositBorrow(args, {
              ...stratDeps,
              addresses: getAddresses(networkId, LendingProtocol.AaveV3),
            })
            .then(
              mapPositionData({ dpmAddress, collateralToken, depositAmount, operationExecutor }),
            )
        case LendingProtocol.SparkV3:
          return await strategies.spark.borrow
            .openDepositBorrow(args, {
              ...stratDeps,
              addresses: getAddresses(networkId, LendingProtocol.SparkV3),
            })
            .then(
              mapPositionData({ dpmAddress, collateralToken, depositAmount, operationExecutor }),
            )
        default:
          throw new Error('GetAaveLikeParameters - Invalid protocol')
      }
    }
    default:
      return defaultPromise
  }
}
