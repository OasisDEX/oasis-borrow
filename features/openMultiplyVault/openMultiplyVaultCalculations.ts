import { BigNumber } from 'bignumber.js'
import {
  calculateParamsIncreaseMP,
  getMaxPossibleCollRatioOrMax,
} from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'

import { OpenMultiplyVaultState } from './openMultiplyVault'

const MULTIPLY_FEE = new BigNumber(0.01)
const LOAN_FEE = new BigNumber(0.0009)

export const MAX_COLL_RATIO = new BigNumber(5)

export interface OpenMultiplyVaultCalculations {
  afterLiquidationPrice: BigNumber
  afterBuyingPower: BigNumber // ??
  afterBuyingPowerUSD: BigNumber // ??
  afterNetValue: BigNumber // ??
  afterNetValueUSD: BigNumber // ??
  buyingCollateral: BigNumber
  buyingCollateralUSD: BigNumber
  totalExposure?: BigNumber
  totalExposureUSD?: BigNumber
  impact: BigNumber
  multiply?: BigNumber
  afterOutstandingDebt: BigNumber
  afterCollateralizationRatio: BigNumber
  txFees: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  afterCollateralBalance: BigNumber
  loanFees: BigNumber
  oazoFee: BigNumber
  maxCollRatio?: BigNumber
  marketPrice?: BigNumber

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
  oazoFee: zero,
  totalExposureUSD: zero,
}

export function applyOpenMultiplyVaultCalculations(
  state: OpenMultiplyVaultState,
): OpenMultiplyVaultState {
  const {
    depositAmount,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice },
    ilkData: { liquidationRatio, debtFloor },
    quote,
    // swap, TODO use swap price
    slippage,
    requiredCollRatio,
  } = state

  const marketPrice = quote?.status === 'SUCCESS' ? quote.tokenPrice : undefined
  const marketPriceMaxSlippage =
    quote?.status === 'SUCCESS' ? quote.tokenPrice.times(slippage.plus(1)) : undefined

  if (
    depositAmount === undefined ||
    marketPrice === undefined ||
    marketPriceMaxSlippage === undefined
  ) {
    return { ...state, ...defaultOpenVaultStateCalculations }
  }

  const oraclePrice = currentCollateralPrice

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const maxCollRatio = getMaxPossibleCollRatioOrMax(
    debtFloor,
    depositAmount,
    oraclePrice,
    marketPriceMaxSlippage,
    liquidationRatio,
    zero,
  )

  const requiredCollRatioSafe = requiredCollRatio || maxCollRatio

  const [afterOutstandingDebt, buyingCollateral] =
    depositAmount && marketPriceMaxSlippage && requiredCollRatio && marketPrice
      ? calculateParamsIncreaseMP(
          oraclePrice,
          marketPrice,
          MULTIPLY_FEE,
          LOAN_FEE,
          depositAmount,
          zero,
          requiredCollRatio,
          state.slippage,
          zero,
        )
      : [zero, zero]

  const totalExposureUSD = afterOutstandingDebt.gt(0)
    ? afterOutstandingDebt.times(requiredCollRatioSafe)
    : zero

  const totalExposure = depositAmount?.gt(0) ? totalExposureUSD.div(currentCollateralPrice) : zero

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  const multiply =
    totalExposureUSD && afterOutstandingDebt
      ? totalExposureUSD.div(totalExposureUSD.minus(afterOutstandingDebt))
      : zero

  const buyingCollateralUSD =
    marketPrice && buyingCollateral ? buyingCollateral.times(marketPrice) : zero

  const loanFees = buyingCollateralUSD.times(LOAN_FEE)
  const oazoFee = afterOutstandingDebt?.times(MULTIPLY_FEE)
  const fees = oazoFee?.plus(loanFees)

  const afterCollateralizationRatio =
    afterOutstandingDebt?.gt(0) && totalExposureUSD
      ? totalExposureUSD.div(afterOutstandingDebt)
      : requiredCollRatioSafe || zero

  const afterNetValueUSD =
    (afterOutstandingDebt && totalExposureUSD?.minus(afterOutstandingDebt)) || zero

  const afterNetValue = afterNetValueUSD.div(currentCollateralPrice)

  const afterLiquidationPrice = afterCollateralizationRatio.gt(0)
    ? currentCollateralPrice.times(liquidationRatio).div(afterCollateralizationRatio)
    : zero

  // TODO fix impact
  const impact = zero

  const [afterBuyingPowerUSD, afterBuyingPower] = marketPrice
    ? calculateParamsIncreaseMP(
        oraclePrice,
        marketPrice,
        MULTIPLY_FEE,
        LOAN_FEE,
        depositAmount,
        zero,
        liquidationRatio,
        state.slippage,
      )
    : [zero, zero]

  // const afterBuyingPower = marketPriceMaxSlippage
  //   ? afterBuyingPowerUSD.div(marketPriceMaxSlippage)
  //   : zero

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

    // maxGenerateAmount,
    // maxGenerateAmountCurrentPrice,
    // maxGenerateAmountNextPrice,
    // afterCollateralizationRatio,
    // afterCollateralizationRatioAtNextPrice,
    // daiYieldFromDepositingCollateral,
    // daiYieldFromDepositingCollateralAtNextPrice,
    // afterFreeCollateral,
  }
}
