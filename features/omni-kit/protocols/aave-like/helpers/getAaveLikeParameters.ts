import { ADDRESS_ZERO } from '@oasisdex/addresses'
import type { AaveLikePositionV2, AaveLikeTokens, PositionType } from '@oasisdex/dma-library'
import { AaveLikeProtocolEnum, RiskRatio } from '@oasisdex/dma-library'
import { getOnChainPosition } from 'actions/aave-like'
import { getAddresses } from 'actions/aave-like/get-addresses'
import {
  getAaveV3FlashLoanToken,
  networkIdToLibraryNetwork,
  swapCall,
} from 'actions/aave-like/helpers'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ethers } from 'ethers'
import { getEmptyAaveLikePosition } from 'features/aave/helpers/getEmptyAaveLikePosition'
import {
  aaveActionDepositBorrow,
  aaveActionOpenDepositBorrow,
  aaveActionPaybackWithdraw,
} from 'features/omni-kit/protocols/aave/actions/borrow'
import {
  aaveActionAdjust,
  aaveActionClose,
  aaveActionOpen,
} from 'features/omni-kit/protocols/aave/actions/multiply'
import {
  sparkActionDepositBorrow,
  sparkActionOpenDepositBorrow,
  sparkActionPaybackWithdraw,
} from 'features/omni-kit/protocols/spark/actions/borrow'
import {
  sparkActionAdjust,
  sparkActionClose,
  sparkActionOpen,
} from 'features/omni-kit/protocols/spark/actions/multiply'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type {
  OmniEntryToken,
  OmniFormState,
  OmniSupportedNetworkIds,
} from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
} from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

const protocolTypeMap = {
  [LendingProtocol.SparkV3]: AaveLikeProtocolEnum.Spark,
  [LendingProtocol.AaveV2]: AaveLikeProtocolEnum.AAVE,
  [LendingProtocol.AaveV3]: AaveLikeProtocolEnum.AAVE_V3,
}

export const getAaveLikeParameters = async ({
  state,
  rpcProvider,
  networkId,
  isFormValid,
  walletAddress,
  position,
  collateralPrecision,
  quotePrecision,
  slippage,
  collateralToken,
  quoteToken,
  protocol,
  protocolVersion,
  entryToken,
}: {
  state: OmniFormState
  rpcProvider: ethers.providers.Provider
  networkId: OmniSupportedNetworkIds
  isFormValid: boolean
  walletAddress?: string
  quoteBalance: BigNumber
  position: AaveLikePositionV2
  collateralPrecision: number
  collateralPrice: BigNumber
  quotePrice: BigNumber
  quotePrecision: number
  slippage: BigNumber
  protocol: AaveLikeLendingProtocol
  collateralToken: string
  quoteToken: string
  protocolVersion?: string
  entryToken: OmniEntryToken
}) => {
  const defaultPromise = Promise.resolve(undefined)

  const { action, dpmAddress } = state

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }
  const addressesConfig = getNetworkContracts(networkId)

  const addresses = getAddresses(networkId, protocol)
  const currentPosition =
    dpmAddress === ADDRESS_ZERO
      ? getEmptyAaveLikePosition({
          debtToken: quoteToken,
          collateralToken,
          collateralTokenAddress: addressesConfig.tokens[collateralToken]?.address,
          debtTokenAddress: addressesConfig.tokens[quoteToken]?.address,
        })
      : await getOnChainPosition({
          networkId,
          proxyAddress: dpmAddress,
          collateralToken,
          debtToken: quoteToken,
          protocol,
        })

  const commonDependencies = {
    operationExecutor: addressesConfig.operationExecutor.address,
    currentPosition,
    provider: rpcProvider,
    proxy: dpmAddress,
    user: walletAddress,
    isDPMProxy: true,
    network: networkIdToLibraryNetwork(networkId),
    addresses,
    protocolType: protocolTypeMap[protocol],
  }

  const multiplyDependencies = {
    ...commonDependencies,
    positionType: 'Multiply' as PositionType,
    getSwapData: swapCall(addresses, networkId, walletAddress),
  }

  const borrowDependencies = {
    ...commonDependencies,
    positionType: 'Borrow' as PositionType,
  }

  // entry token different from collateral token applies only for multiply (if defined)
  const resolvedEntryToken =
    state.productType === OmniProductType.Multiply
      ? {
          symbol: entryToken.symbol as AaveLikeTokens,
          precision: entryToken.precision,
        }
      : {
          symbol: collateralToken as AaveLikeTokens,
          precision: collateralPrecision,
        }

  const adjustMultiplyPayload = {
    entryToken: resolvedEntryToken,
    position,
    slippage,
    debtToken: {
      symbol: quoteToken as AaveLikeTokens,
      precision: quotePrecision,
    },
    collateralToken: {
      symbol: collateralToken as AaveLikeTokens,
      precision: collateralPrecision,
    },
    flashloan: getAaveV3FlashLoanToken(networkId, protocol, collateralToken),
  }

  switch (action) {
    case OmniBorrowFormAction.OpenBorrow: {
      const data = {
        commonPayload: {
          ...adjustMultiplyPayload,
          amountCollateralToDepositInBaseUnit:
            state.depositAmount?.shiftedBy(collateralPrecision) || zero,
          amountDebtToBorrowInBaseUnit: state.generateAmount?.shiftedBy(quotePrecision) || zero,
        },
        dependencies: borrowDependencies,
      }

      return protocol === LendingProtocol.SparkV3
        ? sparkActionOpenDepositBorrow(data)
        : aaveActionOpenDepositBorrow({ ...data, protocolVersion })
    }
    case OmniMultiplyFormAction.OpenMultiply: {
      const data = {
        commonPayload: {
          ...adjustMultiplyPayload,
          multiple: new RiskRatio(
            (state as OmniMultiplyFormState)?.loanToValue || zero,
            RiskRatio.TYPE.LTV,
          ),
          depositedByUser:
            entryToken.symbol === quoteToken
              ? {
                  collateralInWei: zero,
                  debtInWei: state.depositAmount?.shiftedBy(entryToken.precision) || zero,
                }
              : {
                  collateralInWei: state.depositAmount?.shiftedBy(entryToken.precision) || zero,
                  debtInWei: zero,
                },
        },
        dependencies: multiplyDependencies,
      }

      return protocol === LendingProtocol.SparkV3
        ? sparkActionOpen(data)
        : aaveActionOpen({ ...data, protocolVersion })
    }
    case OmniMultiplyFormAction.AdjustMultiply: {
      const data = {
        commonPayload: {
          ...adjustMultiplyPayload,
          multiple: new RiskRatio(
            (state as OmniMultiplyFormState)?.loanToValue || zero,
            RiskRatio.TYPE.LTV,
          ),
        },
        dependencies: multiplyDependencies,
      }
      return protocol === LendingProtocol.SparkV3
        ? sparkActionAdjust(data)
        : aaveActionAdjust({ ...data, protocolVersion })
    }
    case OmniBorrowFormAction.CloseBorrow:
    case OmniMultiplyFormAction.CloseMultiply: {
      const data = {
        commonPayload: {
          ...adjustMultiplyPayload,
          shouldCloseToCollateral: (state as OmniMultiplyFormState).closeTo === 'collateral',
        },
        dependencies: multiplyDependencies,
      }
      return protocol === LendingProtocol.SparkV3
        ? sparkActionClose(data)
        : aaveActionClose({ ...data, protocolVersion })
    }
    case OmniBorrowFormAction.DepositBorrow:
    case OmniBorrowFormAction.GenerateBorrow:
    case OmniMultiplyFormAction.GenerateMultiply:
    case OmniMultiplyFormAction.DepositCollateralMultiply: {
      const data = {
        commonPayload: {
          ...adjustMultiplyPayload,
          amountCollateralToDepositInBaseUnit:
            state.depositAmount?.shiftedBy(collateralPrecision) || zero,
          amountDebtToBorrowInBaseUnit: state.generateAmount?.shiftedBy(quotePrecision) || zero,
        },
        dependencies: borrowDependencies,
      }

      return protocol === LendingProtocol.SparkV3
        ? sparkActionDepositBorrow(data)
        : aaveActionDepositBorrow({
            ...data,
            protocolVersion,
          })
    }
    case OmniBorrowFormAction.PaybackBorrow:
    case OmniBorrowFormAction.WithdrawBorrow:
    case OmniMultiplyFormAction.PaybackMultiply:
    case OmniMultiplyFormAction.WithdrawMultiply: {
      const data = {
        commonPayload: {
          ...adjustMultiplyPayload,
          amountCollateralToWithdrawInBaseUnit:
            state.withdrawAmount?.shiftedBy(collateralPrecision) || zero,
          amountDebtToPaybackInBaseUnit: state.paybackAmount?.shiftedBy(quotePrecision) || zero,
        },
        dependencies: borrowDependencies,
      }
      return protocol === LendingProtocol.SparkV3
        ? sparkActionPaybackWithdraw(data)
        : aaveActionPaybackWithdraw({ ...data, protocolVersion })
    }
    default:
      return defaultPromise
  }
}
