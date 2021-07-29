import BigNumber from 'bignumber.js'
import { one } from 'helpers/zero'

const MULTIPLY_FEE = new BigNumber(0.01)
const LOAN_FEE = new BigNumber(0.009)
export function calculateParamsIncreaseMP(
  oraclePrice: BigNumber,
  marketPrice: BigNumber,
  OF: BigNumber,
  FF: BigNumber,
  currentColl: BigNumber,
  currentDebt: BigNumber,
  requiredCollRatio: BigNumber,
  slippage: BigNumber,
  depositDai = new BigNumber(0),
) {
  const marketPriceSlippage = marketPrice.times(one.plus(slippage))
  const debt = marketPriceSlippage
    .times(currentColl.times(oraclePrice).minus(requiredCollRatio.times(currentDebt)))
    .plus(oraclePrice.times(depositDai).minus(oraclePrice.times(depositDai).times(OF)))
    .div(
      marketPriceSlippage
        .times(requiredCollRatio)
        .times(one.plus(FF))
        .minus(oraclePrice.times(one.minus(OF))),
    )
  const collateral = debt.times(one.minus(OF)).div(marketPriceSlippage)
  return [debt, collateral]
}

export function calculateParamsDecreaseMP(
  oraclePrice: BigNumber,
  marketPrice: BigNumber,
  OF: BigNumber,
  FF: BigNumber,
  currentColl: BigNumber,
  currentDebt: BigNumber,
  requiredCollRatio: BigNumber,
  slippage: BigNumber,
  // depositDai: BigNumber = zero,
) {
  const marketPriceSlippage = marketPrice.times(one.minus(slippage))
  const debt = currentColl
    .times(oraclePrice)
    .times(marketPriceSlippage)
    .minus(requiredCollRatio.times(currentDebt).times(marketPriceSlippage))
    .div(
      oraclePrice
        .times(one.plus(FF).plus(OF).plus(OF.times(FF)))
        .minus(marketPriceSlippage.times(requiredCollRatio)),
    )
  const collateral = debt.times(one.plus(OF).plus(FF)).div(marketPriceSlippage)
  return [debt, collateral]
}

export interface MultiplyParams {
  buyingCollateral: BigNumber
  buyingCollateralUSD: BigNumber
  totalExposure: BigNumber
  totalExposureUSD: BigNumber
  multiply: BigNumber
  loanFee: BigNumber
  oazoFee: BigNumber
}

// TODO: finish generic function
export function getMultiplyParams(
  oraclePrice: BigNumber,
  marketPrice: BigNumber,
  slippage: BigNumber,

  currentDebt: BigNumber,
  currentCollateral: BigNumber,
  currentCollRatio: BigNumber, // calculate

  requiredCollRatio: BigNumber,

  providedCollateral: BigNumber,
  providedDai: BigNumber,
  withdrawDai: BigNumber,
  withdrawColl: BigNumber,

  LF: BigNumber = LOAN_FEE,
  OF: BigNumber = MULTIPLY_FEE,
) {
  const afterCollateral = currentCollateral.plus(providedCollateral).minus(withdrawColl)
  const afterDebt = currentDebt.plus(withdrawDai)
  // Increase coll ratio
  if (currentCollRatio.lt(requiredCollRatio)) {
    return calculateParamsIncreaseMP(
      oraclePrice,
      marketPrice,
      OF,
      LF,
      afterCollateral,
      afterDebt,
      slippage,
      providedDai,
    )
  } else {
    return calculateParamsDecreaseMP(
      oraclePrice,
      marketPrice,
      OF,
      LF,
      afterCollateral,
      afterDebt,
      slippage,
      providedDai,
    )
  }
}
