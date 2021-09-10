import { BigNumber } from 'bignumber.js'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import {
  calculateParamsIncreaseMP,
  getMaxPossibleCollRatioOrMax,
  LOAN_FEE,
  OAZO_FEE,
} from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'

import { OpenMultiplyVaultState } from './openMultiplyVault'

export const MAX_COLL_RATIO = new BigNumber(5)

export interface OpenMultiplyVaultCalculations {
  afterLiquidationPrice: BigNumber
  afterBuyingPower: BigNumber
  afterBuyingPowerUSD: BigNumber
  afterNetValue: BigNumber
  afterNetValueUSD: BigNumber
  buyingCollateral: BigNumber
  buyingCollateralUSD: BigNumber
  totalExposure?: BigNumber
  totalExposureUSD?: BigNumber
  impact: BigNumber
  multiply?: BigNumber
  afterOutstandingDebt: BigNumber
  afterCollateralizationRatio: BigNumber
  afterCollateralizationRatioAtNextPrice: BigNumber
  txFees: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  maxGenerateAmount: BigNumber
  afterCollateralBalance: BigNumber
  loanFees: BigNumber
  oazoFee: BigNumber
  maxCollRatio?: BigNumber
  marketPrice?: BigNumber
  marketPriceMaxSlippage?: BigNumber
  daiYieldFromDepositingCollateral: BigNumber
  daiYieldFromDepositingCollateralAtNextPrice: BigNumber
  toTokenAmount: BigNumber
  toTokenAmountUSD: BigNumber
  fromTokenAmount: BigNumber
  borrowedDaiAmount: BigNumber
  oneInchAmount: BigNumber
}

export const defaultOpenMultiplyVaultStateCalculations: OpenMultiplyVaultCalculations = {
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
  maxGenerateAmount: zero,
  afterCollateralBalance: zero,
  afterCollateralizationRatio: zero,
  afterCollateralizationRatioAtNextPrice: zero,
  loanFees: zero,
  oazoFee: zero,
  totalExposureUSD: zero,
  daiYieldFromDepositingCollateral: zero,
  daiYieldFromDepositingCollateralAtNextPrice: zero,
  toTokenAmount: zero,
  toTokenAmountUSD: zero,
  fromTokenAmount: zero,
  borrowedDaiAmount: zero,
  oneInchAmount: zero,
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
  } = state

  const marketPrice =
    swap?.status === 'SUCCESS'
      ? swap.tokenPrice
      : quote?.status === 'SUCCESS'
      ? quote.tokenPrice
      : undefined
  const marketPriceMaxSlippage = marketPrice ? marketPrice.times(slippage.plus(1)) : undefined

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

  const [borrowedDaiAmount, buyingCollateral] =
    depositAmount && marketPriceMaxSlippage && requiredCollRatioSafe && marketPrice
      ? calculateParamsIncreaseMP(
          oraclePrice,
          marketPrice,
          OAZO_FEE,
          LOAN_FEE,
          depositAmount,
          zero,
          requiredCollRatioSafe,
          state.slippage,
          zero,
        )
      : [zero, zero]

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

  const loanFees = borrowedDaiAmount.times(LOAN_FEE)
  const oazoFee = afterOutstandingDebt?.times(OAZO_FEE)
  const fees = oazoFee?.plus(loanFees)

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

  const [afterBuyingPowerUSD, afterBuyingPower] = marketPrice
    ? calculateParamsIncreaseMP(
        oraclePrice,
        marketPrice,
        OAZO_FEE,
        LOAN_FEE,
        depositAmount,
        zero,
        liquidationRatio,
        state.slippage,
      )
    : [zero, zero]

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
    oazoFee,
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
  }
}
