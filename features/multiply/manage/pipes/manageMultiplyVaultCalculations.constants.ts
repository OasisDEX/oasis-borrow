import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import type { ManageVaultCalculations } from './manageMultiplyVaultCalculations.types'

// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)

export const PAYBACK_ALL_BOUND = new BigNumber('0.01')
export const MAX_COLL_RATIO = new BigNumber(5)
export const defaultManageMultiplyVaultCalculations: ManageVaultCalculations = {
  maxBuyAmount: zero,
  maxBuyAmountUSD: zero,

  maxSellAmount: zero,
  maxSellAmountUSD: zero,

  maxDepositAmount: zero,
  maxDepositDaiAmount: zero,
  maxDepositAmountUSD: zero,

  maxPaybackAmount: zero,

  maxWithdrawAmountAtCurrentPrice: zero,
  maxWithdrawAmountAtNextPrice: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,

  maxGenerateAmountAtCurrentPrice: zero,
  maxGenerateAmountAtNextPrice: zero,
  maxGenerateAmount: zero,

  maxLegalCollateralizationRatio: MAX_COLL_RATIO,

  afterDebt: zero,
  afterCollateralizationRatio: zero,
  collateralizationRatioAtNextPrice: zero,
  afterCollateralizationRatioAtNextPrice: zero,
  afterLiquidationPrice: zero,
  afterFreeCollateral: zero,
  afterFreeCollateralAtNextPrice: zero,
  afterBackingCollateral: zero,
  afterBackingCollateralAtNextPrice: zero,
  afterLockedCollateral: zero,
  afterLockedCollateralUSD: zero,
  afterCollateralBalance: zero,
  daiYieldFromTotalCollateral: zero,
  daiYieldFromTotalCollateralAtNextPrice: zero,
  shouldPaybackAll: false,

  impact: zero,
  multiply: zero,
  afterMultiply: zero,

  maxCollRatio: MAX_COLL_RATIO,
  minCollRatio: zero,
  liquidationPriceCurrentPriceDifference: undefined,

  loanFee: zero,
  skipFL: false,
  oazoFee: zero,
  fees: zero,

  buyingPower: zero,
  buyingPowerUSD: zero,
  netValueUSD: zero,
  afterBuyingPower: zero,
  afterBuyingPowerUSD: zero,
  afterNetValueUSD: zero,
  oneInchAmount: zero,

  closeToDaiParams: {
    fromTokenAmount: zero,
    toTokenAmount: zero,
    minToTokenAmount: zero,
    borrowCollateral: zero,
    requiredDebt: zero,
    withdrawCollateral: zero,
    oazoFee: zero,
    loanFee: zero,
    skipFL: false,
  },

  closeToCollateralParams: {
    fromTokenAmount: zero,
    toTokenAmount: zero,
    minToTokenAmount: zero,
    borrowCollateral: zero,
    requiredDebt: zero,
    withdrawCollateral: zero,
    oazoFee: zero,
    loanFee: zero,
    skipFL: false,
  },

  afterCloseToDai: zero,
  afterCloseToCollateral: zero,
  afterCloseToCollateralUSD: zero,
  currentPnL: zero,
  totalGasSpentUSD: zero,
}
