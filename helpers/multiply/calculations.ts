import { MarketParams, VaultInfo } from '@oasisdex/multiply'
import BigNumber from 'bignumber.js'
import { MAX_COLL_RATIO } from 'features/openMultiplyVault/openMultiplyVaultCalculations'
import { one } from 'helpers/zero'

export const OAZO_FEE = new BigNumber(0.002)
export const LOAN_FEE = new BigNumber(0.0009)
export const SLIPPAGE = new BigNumber(0.005)

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
  skipFL: boolean
}

export function getCloseToDaiParams(
  marketPrice: BigNumber,
  OF: BigNumber, // Oazo fee
  FF: BigNumber, // Flash loan fee
  currentCollateral: BigNumber,
  slippage: BigNumber,
  currentDebt: BigNumber,
): CloseToParams {
  const fromTokenAmount = currentCollateral;
  const toTokenAmount = currentCollateral.times(marketPrice).times(one.minus(OF));
  const minToTokenAmount = currentCollateral
    .times(marketPrice)
    .times(one.minus(OF))
    .times(one.minus(slippage));

  return {
    fromTokenAmount,
    toTokenAmount,
    minToTokenAmount,
    oazoFee: currentCollateral.times(marketPrice).times(OF),
    loanFee: currentDebt.times(FF),
    skipFL: false,
  };
}

export function getCloseToCollateralParams(
  marketPrice: BigNumber,
  OF: BigNumber, // Oazo fee
  FF: BigNumber, // Flash loan fee
  currentDebt: BigNumber,
  slippage: BigNumber,
  currentCollateral: BigNumber,
  minCollRatio: BigNumber,
): CloseToParams {
  const expectedFinalDebt = currentDebt.times(one.plus(FF)).times(one.plus(OF));

  const fromTokenAmount = expectedFinalDebt.div(marketPrice.times(one.minus(slippage)));

  const toTokenAmount = expectedFinalDebt.times(one.plus(slippage));

  const minToTokenAmount = expectedFinalDebt

  const skipFL = (() => {
    const requiredAmount = currentDebt
      .times(1.00001 /* to account for not up to date value here */)
      .times(one.plus(OF))
      .times(one.plus(FF));
    const maxCollNeeded = requiredAmount.dividedBy(
      marketPrice.times(one.plus(slippage)),
    );
    if (currentCollateral.dividedBy(minCollRatio).gt(maxCollNeeded)) {
      return true;
    }
    return false;
  })()

  return {
    fromTokenAmount,
    toTokenAmount,
    minToTokenAmount,
    oazoFee: currentDebt.times(one.plus(FF)).times(OF),
    loanFee: currentDebt.times(FF),
    skipFL
  }
}