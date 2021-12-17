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
}

export function getCloseToDaiParams(
  marketParams: MarketParams,
  vaultInfo: VaultInfo,
): {
  fromTokenAmount: BigNumber
  toTokenAmount: BigNumber
  minToTokenAmount: BigNumber
  borrowCollateral: BigNumber
  requiredDebt: BigNumber
  withdrawCollateral: BigNumber
  loanFee: BigNumber
  oazoFee: BigNumber
  skipFL: boolean
} {
  const _skipFL = false
  const maxCollNeeded = vaultInfo.currentDebt
    .times(1.00001 /* to account for not up to date value here */)
    .dividedBy(
      marketParams.marketPrice
        .times(one.minus(marketParams.slippage))
        .times(one.plus(marketParams.OF)),
    )
    .times(one.plus(marketParams.FF))

  const _toTokenAmount = vaultInfo.currentDebt
    .times(one.minus(marketParams.OF))
    .times(marketParams.marketPrice)

  const _requiredDebt = new BigNumber(0)
  const oazoFee = vaultInfo.currentDebt.times(marketParams.marketPrice).minus(_toTokenAmount)
  const loanFee = maxCollNeeded.times(marketParams.FF).dividedBy(one.plus(marketParams.FF))

  return {
    fromTokenAmount: vaultInfo.currentCollateral,
    toTokenAmount: _toTokenAmount,
    minToTokenAmount: _toTokenAmount.times(one.minus(marketParams.slippage)),
    borrowCollateral: vaultInfo.currentCollateral,
    requiredDebt: _requiredDebt,
    withdrawCollateral: new BigNumber(0),
    skipFL: _skipFL,
    loanFee: loanFee,
    oazoFee: oazoFee,
  }
}

export function getCloseToCollateralParams(
  marketParams: MarketParams,
  vaultInfo: VaultInfo,
): {
  fromTokenAmount: BigNumber
  toTokenAmount: BigNumber
  minToTokenAmount: BigNumber
  borrowCollateral: BigNumber
  requiredDebt: BigNumber
  withdrawCollateral: BigNumber
  loanFee: BigNumber
  oazoFee: BigNumber
  skipFL: boolean
} {
  const _requiredAmount = vaultInfo.currentDebt
    .times(1.00001 /* to account for not up to date value here */)
    .times(one.plus(marketParams.OF))
    .times(one.plus(marketParams.FF))
  let _skipFL = false
  const maxCollNeeded = _requiredAmount.dividedBy(
    marketParams.marketPrice.times(one.plus(marketParams.slippage)),
  )

  if (
    !vaultInfo.minCollRatio.isZero() &&
    vaultInfo.currentCollateral.dividedBy(vaultInfo.minCollRatio).gt(maxCollNeeded)
  ) {
    _skipFL = true
  }

  const oazoFee = _requiredAmount.multipliedBy(marketParams.OF)
  const loanFee = _requiredAmount.times(marketParams.FF)

  return {
    fromTokenAmount: maxCollNeeded,
    toTokenAmount: _requiredAmount.dividedBy(one.minus(marketParams.slippage)),
    minToTokenAmount: _requiredAmount,
    borrowCollateral: new BigNumber(0),
    requiredDebt: _skipFL ? new BigNumber(0) : _requiredAmount,
    withdrawCollateral: vaultInfo.currentCollateral.minus(maxCollNeeded),
    skipFL: _skipFL,
    loanFee,
    oazoFee,
  }
}
