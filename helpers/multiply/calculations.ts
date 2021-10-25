import BigNumber from 'bignumber.js'
import { MAX_COLL_RATIO } from 'features/openMultiplyVault/openMultiplyVaultCalculations'
import { one, zero } from 'helpers/zero'

export const OAZO_FEE = new BigNumber(0.002)
export const LOAN_FEE = new BigNumber(0.0)
export const SLIPPAGE = new BigNumber(0.005)

export function calculateParamsIncreaseMP(
  oraclePrice: BigNumber,
  marketPrice: BigNumber,
  OF: BigNumber,
  FF: BigNumber,
  currentCollateral: BigNumber,
  currentDebt: BigNumber,
  requiredCollRatio: BigNumber,
  slippage: BigNumber,
  depositDai = new BigNumber(0),
) {
  const marketPriceSlippage = marketPrice.times(one.plus(slippage))
  const debt = marketPriceSlippage
    .times(currentCollateral.times(oraclePrice).minus(requiredCollRatio.times(currentDebt)))
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
  currentCollateral: BigNumber,
  currentDebt: BigNumber,
  requiredCollRatio: BigNumber,
  slippage: BigNumber,
  // depositDai: BigNumber = zero,
) {
  const marketPriceSlippage = marketPrice.times(one.minus(slippage))
  const debt = currentCollateral
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

export function getMultiplyParams(
  oraclePrice: BigNumber,
  marketPrice: BigNumber,
  slippage: BigNumber,

  currentDebt: BigNumber,
  currentCollateral: BigNumber,

  requiredCollRatio: BigNumber,

  providedCollateral: BigNumber,
  providedDai: BigNumber,
  withdrawDai: BigNumber,
  withdrawColl: BigNumber,

  FF: BigNumber,
  OF: BigNumber,

  useFlashLoan: boolean = true,
) {
  const afterCollateral = currentCollateral.plus(providedCollateral).minus(withdrawColl)
  const afterDebt = currentDebt.plus(withdrawDai).minus(providedDai)
  const currentCollateralizationRatio = currentCollateral.times(oraclePrice).div(currentDebt)

  const isIncreasingMultiple =
    providedCollateral.gt(0) ||
    providedDai.gt(0) ||
    currentCollateralizationRatio.gt(requiredCollRatio)

  if (isIncreasingMultiple) {
    const [debtDelta, collateralDelta] = calculateParamsIncreaseMP(
      oraclePrice,
      marketPrice,
      OF,
      FF,
      afterCollateral,
      afterDebt,
      requiredCollRatio,
      slippage,
      providedDai,
    )
    return {
      debtDelta,
      collateralDelta,
      loanFee: useFlashLoan ? debtDelta.times(FF) : zero,
      oazoFee: debtDelta.times(OF),
    }
  } else {
    const [debtDelta, collateralDelta] = calculateParamsDecreaseMP(
      oraclePrice,
      marketPrice,
      OF,
      FF,
      afterCollateral,
      afterDebt,
      requiredCollRatio,
      slippage,
    )

    return {
      debtDelta: debtDelta.negated(),
      collateralDelta: collateralDelta.negated(),
      loanFee: useFlashLoan ? debtDelta.times(FF) : zero,
      oazoFee: debtDelta.div(one.minus(slippage)).times(OF),
    }
  }
}

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

export type CloseToParams = {
  fromTokenAmount: BigNumber
  toTokenAmount: BigNumber
  minToTokenAmount: BigNumber
  oazoFee: BigNumber
  loanFee: BigNumber
}

export function calculateCloseToDaiParams(
  marketPrice: BigNumber,
  OF: BigNumber,
  FF: BigNumber,
  currentCollateral: BigNumber,
  slippage: BigNumber,
  currentDebt: BigNumber,
): CloseToParams {
  const fromTokenAmount = currentCollateral
  const toTokenAmount = currentCollateral.times(marketPrice).times(one.minus(OF))
  const minToTokenAmount = currentCollateral
    .times(marketPrice)
    .times(one.minus(OF))
    .times(one.minus(slippage))

  return {
    fromTokenAmount,
    toTokenAmount,
    minToTokenAmount,
    oazoFee: currentCollateral.times(marketPrice).times(OF),
    loanFee: currentDebt.times(FF),
  }
}

export function calculateCloseToCollateralParams(
  marketPrice: BigNumber,
  OF: BigNumber,
  FF: BigNumber,
  currentDebt: BigNumber,
  slippage: BigNumber,
): CloseToParams {
  const expectedFinalDebt = currentDebt.times(one.plus(FF)).times(one.plus(OF))

  const fromTokenAmount = expectedFinalDebt.div(marketPrice.times(one.minus(slippage)))

  const toTokenAmount = expectedFinalDebt.times(one.plus(slippage))

  const minToTokenAmount = expectedFinalDebt

  return {
    fromTokenAmount,
    toTokenAmount,
    minToTokenAmount,
    oazoFee: currentDebt.times(one.plus(FF)).times(OF),
    loanFee: currentDebt.times(FF),
  }
}
