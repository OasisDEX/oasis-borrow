import { BigNumber } from 'bignumber.js'
import { calculateParamsIncreaseMP } from 'helpers/multiply/calculations'
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
  multiplyFee: BigNumber
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
  multiplyFee: zero,
  totalExposureUSD: zero,
}

function getCollRatioByDebt(
  requiredDebt: BigNumber,
  depositAmount: BigNumber,
  oraclePrice: BigNumber,
  marketPriceMaxSlippage: BigNumber, // market price in worst case (marketPrice * slippage)
  loanFee: BigNumber = LOAN_FEE,
  multiplyFee: BigNumber = MULTIPLY_FEE,
) {
  return new BigNumber(
    depositAmount.times(oraclePrice).times(marketPriceMaxSlippage).div(requiredDebt),
  )
    .plus(oraclePrice)
    .minus(oraclePrice.times(multiplyFee))
    .div(marketPriceMaxSlippage.plus(marketPriceMaxSlippage.times(loanFee)))
}

export function sliderToCollRatio(
  maxCollRatio: BigNumber,
  liquidationRatio: BigNumber,
  slider: BigNumber,
) {
  return liquidationRatio.minus(maxCollRatio).times(slider).plus(maxCollRatio)
}

export function collRatioToSlider(
  maxCollRatio: BigNumber,
  liquidationRatio: BigNumber,
  requiredCollRatio: BigNumber,
) {
  return requiredCollRatio.minus(maxCollRatio).div(liquidationRatio.minus(maxCollRatio)).times(100)
}

export function applyOpenMultiplyVaultCalculations(
  state: OpenMultiplyVaultState,
): OpenMultiplyVaultState {
  const {
    depositAmount,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    ilkData: { liquidationRatio, debtFloor },
    slider,
    quote,
    swap,
    slippage,
  } = state

  const quotePrice = quote?.status === 'SUCCESS' ? quote.tokenPrice : undefined
  const swapPrice = swap?.status === 'SUCCESS' ? swap.tokenPrice : undefined
  const marketPrice = swapPrice || quotePrice

  if (depositAmount === undefined) {
    return { ...state, ...defaultOpenVaultStateCalculations, marketPrice }
  }

  const oraclePrice = BigNumber.min(currentCollateralPrice, nextCollateralPrice)
  const marketPriceMaxSlippage = marketPrice ? marketPrice.times(slippage.plus(1)) : undefined

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const maxPossibleCollRatio =
    depositAmount && marketPriceMaxSlippage
      ? getCollRatioByDebt(debtFloor, depositAmount, oraclePrice, marketPriceMaxSlippage)
      : MAX_COLL_RATIO

  const maxCollRatio = BigNumber.max(
    BigNumber.min(maxPossibleCollRatio, MAX_COLL_RATIO),
    liquidationRatio,
  ).integerValue(BigNumber.ROUND_DOWN)

  const requiredCollRatio =
    maxPossibleCollRatio &&
    slider &&
    sliderToCollRatio(maxCollRatio, liquidationRatio, slider.div(100))

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

  const totalExposureUSD =
    afterOutstandingDebt.gt(0) && requiredCollRatio
      ? afterOutstandingDebt.times(requiredCollRatio)
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
    multiplyFee,
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
