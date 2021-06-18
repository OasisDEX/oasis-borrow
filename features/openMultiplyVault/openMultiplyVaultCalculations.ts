import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { OpenMultiplyVaultState } from './openMultiplyVault'

const MULTIPLY_FEE = new BigNumber(0.01)
const LOAN_FEE = new BigNumber(0.009)
const TOTAL_FEES = MULTIPLY_FEE.plus(LOAN_FEE)

const MAX_MULTIPLY = new BigNumber(2)

export interface OpenMultiplyVaultCalculations {
  afterLiquidationPrice: BigNumber
  afterBuyingPower: BigNumber // ??
  afterBuyingPowerUSD: BigNumber // ??
  afterNetValue: BigNumber // ??
  afterNetValueUSD: BigNumber // ??
  buyingCollateral: BigNumber
  buyingCollateralUSD: BigNumber
  totalExposure?: BigNumber
  impact: BigNumber // ??
  slippage: BigNumber // ??
  multiply?: BigNumber
  afterOutstandingDebt: BigNumber
  afterCollateralizationRatio: BigNumber
  txFees: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  afterCollateralBalance: BigNumber

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
  slippage: zero,
  impact: zero, // ??
  multiply: zero,
  afterOutstandingDebt: zero,
  txFees: zero,
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  afterCollateralBalance: zero,
  afterCollateralizationRatio: zero,
}

export function applyOpenVaultCalculations(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    depositAmount,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice },
    ilkData: { liquidationRatio },
    multiply,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  // const afterCollateralizationRatioAtNextPrice = zero // TODO

  // const afterFreeCollateral = zero // TODO

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  const multiplyCalc = multiply ? multiply.div(100).times(MAX_MULTIPLY.minus(1)).plus(1) : undefined
  const totalExposure =
    multiplyCalc && depositAmount ? multiplyCalc.times(depositAmount) : undefined

  const buyingCollateral =
    depositAmount && totalExposure ? totalExposure.minus(depositAmount) : zero // USE EXCHANGE PRICE
  const buyingCollateralUSD = buyingCollateral.times(currentCollateralPrice)

  const fees = buyingCollateralUSD.times(TOTAL_FEES) // USE FEES
  const afterOutstandingDebt = buyingCollateralUSD.plus(fees)
  const totalExposureUSD = totalExposure?.times(currentCollateralPrice)

  const afterCollateralizationRatio =
    afterOutstandingDebt.gt(0) && totalExposureUSD
      ? totalExposureUSD.div(afterOutstandingDebt)
      : zero

  const afterNetValueUSD = totalExposureUSD?.minus(afterOutstandingDebt) || zero
  const afterNetValue = afterNetValueUSD.div(currentCollateralPrice)

  const afterLiquidationPrice = afterCollateralizationRatio.gt(0)
    ? currentCollateralPrice.times(liquidationRatio).div(afterCollateralizationRatio)
    : zero

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
