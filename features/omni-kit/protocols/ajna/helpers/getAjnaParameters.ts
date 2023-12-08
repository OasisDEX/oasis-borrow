import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaStrategy } from '@oasisdex/dma-library'
import { Network } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ethers } from 'ethers'
import {
  ajnaActionDepositGenerateBorrow,
  ajnaActionOpenBorrow,
  ajnaActionPaybackWithdrawBorrow,
} from 'features/omni-kit/protocols/ajna/actions/borrow'
import { ajnaActionAdjust, ajnaActionClose } from 'features/omni-kit/protocols/ajna/actions/common'
import {
  ajnaActionDepositEarn,
  ajnaActionOpenEarn,
  ajnaActionWithdrawEarn,
  ajnaClaimEarn,
} from 'features/omni-kit/protocols/ajna/actions/earn'
import { ajnaActionOpenMultiply } from 'features/omni-kit/protocols/ajna/actions/multiply'
import {
  getAjnaCumulatives,
  getAjnaPoolAddress,
  getAjnaPoolData,
  getMaxIncreasedValue,
} from 'features/omni-kit/protocols/ajna/helpers'
import type {
  AjnaGenericPosition,
  AjnaSupportedNetworksIds,
} from 'features/omni-kit/protocols/ajna/types'
import type { OmniFormState, OmniGenericPosition } from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniEarnFormAction,
  OmniMultiplyFormAction,
} from 'features/omni-kit/types'

interface AjnaTxHandlerInput {
  networkId: AjnaSupportedNetworksIds
  collateralAddress: string
  collateralPrecision: number
  collateralPrice: BigNumber
  collateralToken: string
  isFormValid: boolean
  position: AjnaGenericPosition
  price?: BigNumber
  quoteAddress: string
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  quoteBalance: BigNumber
  rpcProvider: ethers.providers.Provider
  simulation?: AjnaGenericPosition
  slippage: BigNumber
  state: OmniFormState
  walletAddress?: string
}

export async function getAjnaParameters({
  networkId,
  collateralAddress,
  collateralPrecision,
  collateralPrice,
  collateralToken,
  isFormValid,
  position,
  price,
  quoteAddress,
  quotePrecision,
  quotePrice,
  quoteToken,
  quoteBalance,
  rpcProvider,
  simulation,
  slippage,
  state,
  walletAddress,
}: AjnaTxHandlerInput): Promise<AjnaStrategy<OmniGenericPosition> | undefined> {
  const defaultPromise = Promise.resolve(undefined)

  const { action, dpmAddress } = state
  const addressesConfig = getNetworkContracts(networkId)
  const poolAddress = await getAjnaPoolAddress(collateralAddress, quoteAddress, networkId)

  const dependencies: AjnaCommonDependencies = {
    ajnaProxyActions: addressesConfig.ajnaProxyActions.address,
    poolInfoAddress: addressesConfig.ajnaPoolInfo.address,
    provider: rpcProvider,
    WETH: addressesConfig.tokens.ETH.address,
    getPoolData: getAjnaPoolData(networkId),
    getCumulatives: getAjnaCumulatives(networkId),
    network: Network.MAINNET,
  }

  const commonPayload: AjnaCommonPayload = {
    collateralTokenPrecision: collateralPrecision,
    dpmProxyAddress: dpmAddress,
    poolAddress,
    quoteTokenPrecision: quotePrecision,
    collateralPrice,
    quotePrice,
  }

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }

  switch (action) {
    case OmniBorrowFormAction.OpenBorrow: {
      return ajnaActionOpenBorrow({ state, commonPayload, dependencies })
    }
    case OmniBorrowFormAction.DepositBorrow:
    case OmniBorrowFormAction.GenerateBorrow: {
      return ajnaActionDepositGenerateBorrow({
        state,
        commonPayload,
        dependencies,
        position,
        simulation,
      })
    }
    case OmniBorrowFormAction.PaybackBorrow:
    case OmniBorrowFormAction.WithdrawBorrow: {
      return ajnaActionPaybackWithdrawBorrow({
        state: {
          ...state,
          paybackAmount:
            state.paybackAmount && state.paybackAmountMax
              ? getMaxIncreasedValue(state.paybackAmount, position.pool.interestRate)
              : state.paybackAmount,
        },
        commonPayload,
        dependencies,
        position,
        simulation,
        quoteBalance,
      })
    }

    case OmniEarnFormAction.OpenEarn: {
      return ajnaActionOpenEarn({ state, commonPayload, dependencies, networkId, price })
    }
    case OmniEarnFormAction.DepositEarn: {
      return ajnaActionDepositEarn({ state, commonPayload, dependencies, position, price })
    }
    case OmniEarnFormAction.WithdrawEarn: {
      return ajnaActionWithdrawEarn({ state, commonPayload, dependencies, position, price })
    }
    case OmniEarnFormAction.ClaimEarn: {
      return ajnaClaimEarn({ commonPayload, dependencies, position, price })
    }

    case OmniMultiplyFormAction.OpenMultiply: {
      return ajnaActionOpenMultiply({
        state,
        commonPayload,
        dependencies,
        networkId,
        collateralToken,
        quoteToken,
        walletAddress,
        pool: position.pool,
        slippage,
      })
    }
    case OmniBorrowFormAction.AdjustBorrow:
    case OmniMultiplyFormAction.AdjustMultiply: {
      return ajnaActionAdjust({
        state,
        commonPayload,
        dependencies,
        position,
        slippage,
        collateralToken,
        quoteToken,
      })
    }
    case OmniMultiplyFormAction.GenerateMultiply:
    case OmniMultiplyFormAction.DepositCollateralMultiply: {
      const { loanToValue } = state

      if (loanToValue) {
        return ajnaActionAdjust({
          state,
          commonPayload,
          dependencies,
          position,
          slippage,
          collateralToken,
          quoteToken,
        })
      }

      return ajnaActionDepositGenerateBorrow({
        state,
        commonPayload,
        dependencies,
        position,
        simulation,
      })
    }
    case OmniMultiplyFormAction.PaybackMultiply:
    case OmniMultiplyFormAction.WithdrawMultiply: {
      const { loanToValue } = state
      const resolvedState = {
        ...state,
        paybackAmount:
          state.paybackAmount && state.paybackAmountMax
            ? getMaxIncreasedValue(state.paybackAmount, position.pool.interestRate)
            : state.paybackAmount,
      }

      if (loanToValue) {
        return ajnaActionAdjust({
          state: resolvedState,
          commonPayload,
          dependencies,
          position,
          slippage,
          collateralToken,
          quoteToken,
        })
      }

      return ajnaActionPaybackWithdrawBorrow({
        state: resolvedState,
        commonPayload,
        dependencies,
        position,
        simulation,
        quoteBalance,
      })
    }
    case OmniMultiplyFormAction.DepositQuoteMultiply: {
      // TODO here handling for complex action once available
      return defaultPromise
    }
    case OmniBorrowFormAction.CloseBorrow:
    case OmniMultiplyFormAction.CloseMultiply: {
      return ajnaActionClose({
        state,
        commonPayload,
        dependencies,
        position,
        collateralToken,
        quoteToken,
        slippage,
      })
    }
    default:
      return defaultPromise
  }
}
