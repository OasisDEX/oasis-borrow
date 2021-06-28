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

  // const afterCollateralizationRatioAtNextPrice = zero // TODO

  // const afterFreeCollateral = zero // TODO

  const theoreticMaxMultiple = liquidationRatio.div(liquidationRatio.minus(1))
  const marketPriceMaxSlippage =
    quote?.status === 'SUCCESS' ? quote.tokenPrice.times(slippage.plus(1)) : currentCollateralPrice

  const maxDebt = depositAmount
    ? depositAmount.div(liquidationRatio).times(currentCollateralPrice)
    : undefined
  const minDebt = debtFloor

  const minPossibleCollRatio = depositAmount
    ? depositAmount.times(currentCollateralPrice).div(debtFloor)
    : undefined

  const requiredCollRatio =
    minPossibleCollRatio &&
    slider &&
    minPossibleCollRatio.minus(minPossibleCollRatio.minus(liquidationRatio).times(slider.div(100)))

  const debtToDraw =
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
      : undefined

  const totalExposureUSD = requiredCollRatio && debtToDraw?.times(requiredCollRatio)
  const totalExposure = depositAmount && totalExposureUSD?.div(currentCollateralPrice)
  const borrowedCollateral = depositAmount && totalExposure?.minus(depositAmount)

  console.log('max multiple:', theoreticMaxMultiple.toString())
  console.log('max debt:', maxDebt?.toString())
  console.log('min debt:', minDebt?.toString())
  console.log('minPossibleCollRatio:', minPossibleCollRatio?.toString())
  console.log('debt to draw:', debtToDraw?.toString())
  console.log('total coll usd', totalExposureUSD?.toString())
  console.log('borrowedCollateral', borrowedCollateral?.toString())
  console.log('required', requiredCollRatio?.toString())

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  const multiply =
    totalExposureUSD && debtToDraw && totalExposureUSD?.div(totalExposureUSD.minus(debtToDraw))

  const buyingCollateral =
    depositAmount && totalExposure ? totalExposure.minus(depositAmount) : zero // USE EXCHANGE PRICE

  const buyingCollateralUSD =
    quote?.status === 'SUCCESS' ? buyingCollateral.times(quote.tokenPrice) : zero

  const fees = buyingCollateralUSD.times(TOTAL_FEES) // USE FEES
  const afterOutstandingDebt = buyingCollateralUSD.plus(fees)

  const afterCollateralizationRatio =
    afterOutstandingDebt.gt(0) && totalExposureUSD
      ? totalExposureUSD.div(afterOutstandingDebt)
      : requiredCollRatio || zero

  const afterNetValueUSD = totalExposureUSD?.minus(afterOutstandingDebt) || zero
  const afterNetValue = afterNetValueUSD.div(currentCollateralPrice)

  const afterLiquidationPrice = afterCollateralizationRatio.gt(0)
    ? currentCollateralPrice.times(liquidationRatio).div(afterCollateralizationRatio)
    : zero

  const buyPrice = quote?.status === 'SUCCESS' ? quote.tokenPrice : undefined
  const sellPrice = quote?.status === 'SUCCESS' ? new BigNumber(1).div(quote.tokenPrice) : undefined
  const daiSwapped = quote?.status === 'SUCCESS' ? quote.daiAmount : undefined

  const impact =
    buyPrice && sellPrice && depositAmount?.gt(0) && daiSwapped
      ? depositAmount
          .times(buyPrice)
          .minus(daiSwapped.times(sellPrice))
          .div(depositAmount.times(buyPrice))
      : zero

  // console.log('buy price', buyPrice?.toString())
  // console.log('sell price', sellPrice?.toString())
  // console.log('impact', impact.toString())

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
