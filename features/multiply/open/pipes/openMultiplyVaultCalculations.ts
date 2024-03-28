import { getMultiplyParams } from '@oasisdex/multiply'
import { BigNumber } from 'bignumber.js'
import { openFlowInitialStopLossLevel } from 'features/automation/common/openFlowInitialStopLossLevel'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations.constants'
import { one, zero } from 'helpers/zero'

import type { OpenMultiplyVaultState } from './openMultiplyVault.types'
import {
  defaultOpenMultiplyVaultStateCalculations,
  MAX_COLL_RATIO,
} from './openMultiplyVaultCalculations.constants'

function getCollRatioByDebt(
  requiredDebt: BigNumber,
  depositAmount: BigNumber,
  oraclePrice: BigNumber,
  marketPriceMaxSlippage: BigNumber, // market price in worst case (marketPrice * slippage)
  loanFee: BigNumber = LOAN_FEE,
  multiplyFee: BigNumber = OAZO_FEE,
) {
  return new BigNumber(
    depositAmount.times(oraclePrice).times(marketPriceMaxSlippage).div(requiredDebt),
  )
    .plus(oraclePrice)
    .minus(oraclePrice.times(multiplyFee))
    .div(marketPriceMaxSlippage.plus(marketPriceMaxSlippage.times(loanFee)))
}

export function getMaxPossibleCollRatioOrMax(
  debtFloor: BigNumber,
  depositAmount: BigNumber,
  oraclePrice: BigNumber,
  marketPriceMaxSlippage: BigNumber,
  liquidationRatio: BigNumber,
  currentCollRatio: BigNumber,
) {
  const maxPossibleCollRatio = getCollRatioByDebt(
    debtFloor,
    depositAmount,
    oraclePrice,
    marketPriceMaxSlippage,
  )

  const maxCollRatioPrecise = BigNumber.max(
    BigNumber.min(maxPossibleCollRatio, MAX_COLL_RATIO),
    liquidationRatio,
    currentCollRatio,
  )
    .times(100)
    .integerValue(BigNumber.ROUND_DOWN)
    .div(100)

  return maxCollRatioPrecise.minus(maxCollRatioPrecise.times(100).mod(5).div(100))
}

export function applyOpenMultiplyVaultCalculations(
  state: OpenMultiplyVaultState,
): OpenMultiplyVaultState {
  const {
    depositAmount,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    ilkData: { liquidationRatio, debtFloor, ilkDebtAvailable },
    quote,
    swap,
    slippage,
    requiredCollRatio,
    stopLossLevel,
  } = state

  const marketPrice =
    swap?.status === 'SUCCESS'
      ? swap.tokenPrice
      : quote?.status === 'SUCCESS'
        ? quote.tokenPrice
        : undefined

  const marketPriceMaxSlippage = marketPrice ? marketPrice.div(one.minus(slippage)) : undefined

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  if (
    depositAmount === undefined ||
    marketPrice === undefined ||
    marketPriceMaxSlippage === undefined
  ) {
    return {
      ...state,
      ...defaultOpenMultiplyVaultStateCalculations,
      maxDepositAmount,
      maxDepositAmountUSD,
    }
  }

  const oraclePrice = currentCollateralPrice

  const maxCollRatio = getMaxPossibleCollRatioOrMax(
    debtFloor,
    depositAmount,
    oraclePrice,
    marketPriceMaxSlippage,
    liquidationRatio,
    zero,
  )

  const requiredCollRatioSafe = requiredCollRatio || maxCollRatio

  const {
    debtDelta: borrowedDaiAmount,
    collateralDelta: buyingCollateral,
    loanFee,
    oazoFee,
    skipFL,
  } = depositAmount && marketPriceMaxSlippage && requiredCollRatioSafe && marketPrice
    ? getMultiplyParams(
        // Market params
        {
          oraclePrice,
          marketPrice,
          OF: OAZO_FEE,
          FF: LOAN_FEE,
          slippage: state.slippage,
        },
        // Vault info
        {
          currentDebt: zero,
          currentCollateral: zero,
          minCollRatio: zero,
        },
        // Desired CDP state
        {
          requiredCollRatio: requiredCollRatioSafe,
          providedCollateral: depositAmount,
          providedDai: zero,
          withdrawDai: zero,
          withdrawColl: zero,
        },
      )
    : { debtDelta: zero, collateralDelta: zero, loanFee: zero, oazoFee: zero, skipFL: false }

  const afterOutstandingDebt = borrowedDaiAmount.times(one.plus(LOAN_FEE))

  const toTokenAmount = buyingCollateral.times(one.plus(slippage))
  const toTokenAmountUSD = buyingCollateral.times(marketPriceMaxSlippage)

  const fromTokenAmount = borrowedDaiAmount

  const oneInchAmount = afterOutstandingDebt.times(one.minus(OAZO_FEE)).div(one.plus(LOAN_FEE))

  const totalExposure = buyingCollateral?.gt(0) ? buyingCollateral.plus(depositAmount) : zero
  const totalExposureUSD = totalExposure.gt(0) ? totalExposure.times(marketPriceMaxSlippage) : zero

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  const multiply =
    totalExposureUSD && afterOutstandingDebt
      ? totalExposureUSD.div(totalExposureUSD.minus(afterOutstandingDebt))
      : zero

  const buyingCollateralUSD =
    marketPriceMaxSlippage && buyingCollateral
      ? buyingCollateral.times(marketPriceMaxSlippage)
      : zero

  const fees = oazoFee?.plus(loanFee)

  const afterCollateralizationRatio = buyingCollateral
    .plus(depositAmount)
    .times(oraclePrice)
    .div(afterOutstandingDebt)

  const afterCollateralizationRatioAtNextPrice = buyingCollateral
    .plus(depositAmount)
    .times(nextCollateralPrice)
    .div(afterOutstandingDebt)

  const afterNetValueUSD =
    (afterOutstandingDebt && totalExposureUSD?.minus(afterOutstandingDebt)) || zero

  const afterNetValue = afterNetValueUSD.div(currentCollateralPrice)

  const afterLiquidationPrice = afterCollateralizationRatio.gt(0)
    ? currentCollateralPrice.times(liquidationRatio).div(afterCollateralizationRatio)
    : zero

  const impact =
    quote?.status === 'SUCCESS' && marketPrice
      ? calculatePriceImpact(quote.tokenPrice, marketPrice)
      : zero

  const { debtDelta: afterBuyingPowerUSD, collateralDelta: afterBuyingPower } = marketPrice
    ? getMultiplyParams(
        // Market params
        {
          oraclePrice,
          marketPrice,
          OF: OAZO_FEE,
          FF: LOAN_FEE,
          slippage: state.slippage,
        },
        // Vault info
        {
          currentDebt: zero,
          currentCollateral: zero,
          minCollRatio: zero,
        },
        // Desired CDP state
        {
          requiredCollRatio: liquidationRatio,
          providedCollateral: depositAmount,
          providedDai: zero,
          withdrawDai: zero,
          withdrawColl: zero,
        },
      )
    : { debtDelta: zero, collateralDelta: zero }

  const daiYieldFromDepositingCollateral = totalExposure
    ? totalExposure.times(currentCollateralPrice).div(liquidationRatio)
    : zero

  const daiYieldFromDepositingCollateralAtNextPrice = totalExposure
    ? totalExposure.times(nextCollateralPrice).div(liquidationRatio)
    : zero

  const maxGenerateAmountCurrentPrice = daiYieldFromDepositingCollateral.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : daiYieldFromDepositingCollateral

  const maxGenerateAmountNextPrice = daiYieldFromDepositingCollateralAtNextPrice.gt(
    ilkDebtAvailable,
  )
    ? ilkDebtAvailable
    : daiYieldFromDepositingCollateralAtNextPrice

  const maxGenerateAmount = BigNumber.minimum(
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
  )

  const resolvedStopLossLevel = stopLossLevel.isZero()
    ? openFlowInitialStopLossLevel({ liquidationRatio })
    : stopLossLevel

  return {
    ...state,
    maxDepositAmount,
    maxDepositAmountUSD,
    afterCollateralBalance,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    buyingCollateral,
    buyingCollateralUSD,
    multiply,
    totalExposure,
    afterOutstandingDebt,
    afterNetValueUSD,
    afterNetValue,
    txFees: fees,
    impact,
    loanFees: loanFee,
    oazoFee,
    skipFL,
    afterBuyingPower,
    afterBuyingPowerUSD,
    maxCollRatio,
    totalExposureUSD,
    marketPrice,
    marketPriceMaxSlippage,
    toTokenAmount,
    toTokenAmountUSD,

    maxGenerateAmount,
    fromTokenAmount,
    // maxGenerateAmountCurrentPrice,
    // maxGenerateAmountNextPrice,
    // afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,
    // afterFreeCollateral,
    borrowedDaiAmount,
    oneInchAmount,
    stopLossLevel: resolvedStopLossLevel,
  }
}
