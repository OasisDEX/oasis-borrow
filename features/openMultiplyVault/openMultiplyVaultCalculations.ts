import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { OpenMultiplyVaultState } from './openMultiplyVault'

const MULTIPLY_FEE = new BigNumber(0.01)
const LOAN_FEE = new BigNumber(0.009)
const TOTAL_FEES = MULTIPLY_FEE.plus(LOAN_FEE)

export interface OpenMultiplyVaultCalculations {
  afterLiquidationPrice: BigNumber
  afterBuyingPower: BigNumber // ??
  afterBuyingPowerUSD: BigNumber // ??
  afterNetValue: BigNumber // ??
  afterNetValueUSD: BigNumber // ??
  buyingCollateral: BigNumber
  buyingCollateralUSD: BigNumber
  totalExposure?: BigNumber
  impact: BigNumber
  multiply?: BigNumber
  afterOutstandingDebt: BigNumber
  afterCollateralizationRatio: BigNumber
  txFees: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  afterCollateralBalance: BigNumber
  loanFees: BigNumber
  multiplyFee: BigNumber

  // afterCollateralizationRatioAtNextPrice: BigNumber
  // daiYieldFromDepositingCollateral: BigNumber
  // daiYieldFromDepositingCollateralAtNextPrice: BigNumber
  // afterFreeCollateral: BigNumber
}

export const defaultOpenVaultStateCalculations: OpenMultiplyVaultCalculations = {
  afterLiquidationPrice: zero,
  afterBuyingPower: zero,
  afterBuyingPowerUSD: zero,
  afterNetValue: zero,
  afterNetValueUSD: zero,
  buyingCollateral: zero,
  buyingCollateralUSD: zero,
  totalExposure: zero,
  impact: zero,
  multiply: zero,
  afterOutstandingDebt: zero,
  txFees: zero,
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  afterCollateralBalance: zero,
  afterCollateralizationRatio: zero,
  loanFees: zero,
  multiplyFee: zero,
}

export function applyOpenVaultCalculations(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    depositAmount,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice },
    ilkData: { liquidationRatio, debtFloor },
    slider,
    quote,
    slippage,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const marketPriceMaxSlippage =
    quote?.status === 'SUCCESS' ? quote.tokenPrice.times(slippage.plus(1)) : currentCollateralPrice

  const minPossibleCollRatio = depositAmount
    ? depositAmount.times(currentCollateralPrice).div(debtFloor)
    : undefined

  const requiredCollRatio =
    minPossibleCollRatio &&
    slider &&
    minPossibleCollRatio.minus(minPossibleCollRatio.minus(liquidationRatio).times(slider.div(100)))

  const afterOutstandingDebt =
    depositAmount && marketPriceMaxSlippage && requiredCollRatio
      ? depositAmount
          .times(currentCollateralPrice)
          .times(marketPriceMaxSlippage)
          .div(
            requiredCollRatio
              .times(marketPriceMaxSlippage)
              .plus(requiredCollRatio.times(marketPriceMaxSlippage).times(LOAN_FEE))
              .minus(currentCollateralPrice)
              .plus(currentCollateralPrice.times(MULTIPLY_FEE)),
          )
      : zero

  const totalExposureUSD =
    afterOutstandingDebt.gt(0) && requiredCollRatio
      ? afterOutstandingDebt.times(requiredCollRatio)
      : zero
  const totalExposure = depositAmount?.gt(0) ? totalExposureUSD.div(currentCollateralPrice) : zero
  const buyingCollateral =
    depositAmount && totalExposure ? totalExposure.minus(depositAmount) : zero

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  const multiply =
    totalExposureUSD && afterOutstandingDebt
      ? totalExposureUSD.div(totalExposureUSD.minus(afterOutstandingDebt))
      : zero

  const buyingCollateralUSD =
    quote?.status === 'SUCCESS' && buyingCollateral
      ? buyingCollateral.times(quote.tokenPrice)
      : zero

  const loanFees = buyingCollateralUSD.times(LOAN_FEE)
  const multiplyFee = afterOutstandingDebt?.times(MULTIPLY_FEE)
  const fees = multiplyFee?.plus(loanFees)

  const afterCollateralizationRatio =
    afterOutstandingDebt?.gt(0) && totalExposureUSD
      ? totalExposureUSD.div(afterOutstandingDebt)
      : requiredCollRatio || zero

  const afterNetValueUSD =
    (afterOutstandingDebt && totalExposureUSD?.minus(afterOutstandingDebt)) || zero

  const afterNetValue = afterNetValueUSD.div(currentCollateralPrice)

  const afterLiquidationPrice = afterCollateralizationRatio.gt(0)
    ? currentCollateralPrice.times(liquidationRatio).div(afterCollateralizationRatio)
    : zero

  const impact =
    quote?.status === 'SUCCESS'
      ? new BigNumber(quote.daiAmount.minus(quote.collateralAmount)).div(quote.daiAmount)
      : zero

  const afterBuyingPowerUSD =
    depositAmount && marketPriceMaxSlippage
      ? depositAmount
          .times(currentCollateralPrice)
          .times(marketPriceMaxSlippage)
          .div(
            liquidationRatio
              .times(marketPriceMaxSlippage)
              .plus(liquidationRatio.times(marketPriceMaxSlippage).times(LOAN_FEE))
              .minus(currentCollateralPrice)
              .plus(currentCollateralPrice.times(MULTIPLY_FEE)),
          )
      : zero

  const afterBuyingPower =
    quote?.status === 'SUCCESS' ? afterBuyingPowerUSD.div(quote.tokenPrice) : zero

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
    loanFees,
    multiplyFee,
    afterBuyingPower,
    afterBuyingPowerUSD,

    // maxDepositAmount,
    // maxDepositAmountUSD,
    // maxGenerateAmount,
    // maxGenerateAmountCurrentPrice,
    // maxGenerateAmountNextPrice,
    // afterCollateralizationRatio,
    // afterCollateralizationRatioAtNextPrice,
    // daiYieldFromDepositingCollateral,
    // daiYieldFromDepositingCollateralAtNextPrice,
    // afterLiquidationPrice,
    // afterFreeCollateral,
  }
}
