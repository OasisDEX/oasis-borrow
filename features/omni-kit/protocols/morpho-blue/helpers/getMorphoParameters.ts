import type {
  MorphoAdjustMultiplyPayload,
  MorphoBlueCommonDependencies,
  MorphoblueDepositBorrowPayload,
  MorphoBluePosition,
  MorphoMultiplyDependencies,
  MorphoOpenMultiplyPayload,
  Network,
} from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ethers } from 'ethers'
import { omniNetworkMap, omniSwapVersionMap } from 'features/omni-kit/constants'
import {
  getMaxIncreasedOrDecreasedValue,
  MaxValueResolverMode,
} from 'features/omni-kit/protocols/ajna/helpers'
import {
  morphoActionDepositBorrow,
  morphoActionOpenBorrow,
  morphoActionPaybackWithdraw,
} from 'features/omni-kit/protocols/morpho-blue/actions/borrow'
import {
  morphoActionAdjust,
  morphoActionOpenMultiply,
} from 'features/omni-kit/protocols/morpho-blue/actions/multiply'
import { getMorphoCumulatives } from 'features/omni-kit/protocols/morpho-blue/helpers/getMorphoCumulatives'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniFormState, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniBorrowFormAction, OmniMultiplyFormAction } from 'features/omni-kit/types'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'

export const getMorphoParameters = async ({
  state,
  rpcProvider,
  networkId,
  isFormValid,
  walletAddress,
  quoteBalance,
  position,
  collateralPrecision,
  collateralPrice,
  quotePrecision,
  quotePrice,
  slippage,
}: {
  state: OmniFormState
  rpcProvider: ethers.providers.Provider
  networkId: OmniSupportedNetworkIds
  isFormValid: boolean
  walletAddress?: string
  quoteBalance: BigNumber
  position: MorphoBluePosition
  collateralPrecision: number
  collateralPrice: BigNumber
  quotePrice: BigNumber
  quotePrecision: number
  slippage: BigNumber
}) => {
  const defaultPromise = Promise.resolve(undefined)

  const { action, dpmAddress } = state

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }

  const addressesConfig = getNetworkContracts(networkId)

  const commonPayload: MorphoblueDepositBorrowPayload = {
    quoteAmount: position.debtAmount,
    collateralAmount: position.collateralAmount,
    collateralPrecision,
    collateralPrice,
    quotePrice,
    quotePrecision,
    morphoBlueMarket: position.marketParams.id,
    proxyAddress: dpmAddress,
    user: walletAddress,
  }

  const commonTokenAddresses = {
    WETH: addressesConfig.tokens.WETH.address,
    DAI: addressesConfig.tokens.DAI.address,
    ETH: addressesConfig.tokens.ETH_ACTUAL.address,
    USDC: addressesConfig.tokens.USDC.address,
    USDT: addressesConfig.tokens.USDT.address,
    WBTC: addressesConfig.tokens.WBTC.address,
    WSTETH: addressesConfig.tokens.WSTETH.address,
  }

  const commonDependencies = {
    provider: rpcProvider,
    operationExecutor: addressesConfig.operationExecutor.address,
    getCumulatives: getMorphoCumulatives(networkId),
    network: omniNetworkMap[networkId] as Network,
  }

  const dependencies: MorphoBlueCommonDependencies = {
    ...commonDependencies,
    addresses: {
      morphoblue: addressesConfig.morphoBlue.address,
      operationExecutor: addressesConfig.operationExecutor.address,
      tokens: commonTokenAddresses,
    },
  }

  const multiplyDependencies: MorphoMultiplyDependencies = {
    ...commonDependencies,
    getSwapData: getOneInchCall(
      getNetworkContracts(networkId).swapAddress,
      networkId,
      omniSwapVersionMap[networkId],
    ),
    morphoAddress: addressesConfig.morphoBlue.address,
    addresses: commonTokenAddresses,
  }

  const commonMultiplyPayload = {
    riskRatio: new RiskRatio(
      (state as OmniMultiplyFormState)?.loanToValue || zero,
      RiskRatio.TYPE.LTV,
    ),
    collateralAmount: state.depositAmount || zero,
    slippage,
    collateralTokenPrecision: collateralPrecision,
    quoteTokenPrecision: quotePrecision,
    user: walletAddress,
    dpmProxyAddress: dpmAddress,
  }

  const openMultiplyPayload: MorphoOpenMultiplyPayload = {
    ...commonMultiplyPayload,
    collateralPriceUSD: collateralPrice,
    quotePriceUSD: quotePrice,
    marketId: position.marketParams.id,
  }

  const adjustMultiplyPayload: MorphoAdjustMultiplyPayload = {
    ...commonMultiplyPayload,
    position,
  }

  switch (action) {
    case OmniBorrowFormAction.OpenBorrow: {
      return morphoActionOpenBorrow({
        state: {
          ...state,
          generateAmount:
            state.generateAmount && state.generateAmountMax
              ? getMaxIncreasedOrDecreasedValue({
                  value: state.generateAmount,
                  apy: position.borrowRate,
                  mode: MaxValueResolverMode.DECREASED,
                  precision: quotePrecision,
                })
              : state.generateAmount,
        },
        commonPayload,
        dependencies,
      })
    }
    case OmniBorrowFormAction.DepositBorrow:
    case OmniBorrowFormAction.GenerateBorrow: {
      return morphoActionDepositBorrow({
        state: {
          ...state,
          generateAmount:
            state.generateAmount && state.generateAmountMax
              ? getMaxIncreasedOrDecreasedValue({
                  value: state.generateAmount,
                  apy: position.borrowRate,
                  mode: MaxValueResolverMode.DECREASED,
                  precision: quotePrecision,
                })
              : state.generateAmount,
        },
        commonPayload,
        dependencies,
      })
    }
    case OmniBorrowFormAction.PaybackBorrow:
    case OmniBorrowFormAction.WithdrawBorrow: {
      return morphoActionPaybackWithdraw({
        state: {
          ...state,
          // In general, we should use this mechanism do be able to payback all without leaving dust.
          // paybackAmount:
          //   state.paybackAmount && state.paybackAmountMax
          //     ? getMaxIncreasedOrDecreasedValue(state.paybackAmount, position.borrowRate)
          //     : state.paybackAmount,
          withdrawAmount:
            state.withdrawAmount && state.withdrawAmountMax && !position.debtAmount.isZero()
              ? getMaxIncreasedOrDecreasedValue({
                  value: state.withdrawAmount,
                  apy: position.borrowRate,
                  mode: MaxValueResolverMode.DECREASED,
                  precision: collateralPrecision,
                  customDayApy: 1.5,
                })
              : state.withdrawAmount,
        },
        commonPayload,
        dependencies,
        quoteBalance,
      })
    }
    case OmniMultiplyFormAction.OpenMultiply: {
      return morphoActionOpenMultiply({
        state,
        commonPayload: openMultiplyPayload,
        dependencies: multiplyDependencies,
      })
    }
    case OmniMultiplyFormAction.AdjustMultiply: {
      return morphoActionAdjust({
        commonPayload: adjustMultiplyPayload,
        dependencies: multiplyDependencies,
      })
    }
    default:
      return defaultPromise
  }
}
