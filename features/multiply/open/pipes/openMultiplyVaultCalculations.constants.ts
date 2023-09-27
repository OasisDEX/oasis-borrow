import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import type { OpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations.types'

export const MAX_COLL_RATIO = new BigNumber(5)

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
  skipFL: false,
  totalExposureUSD: zero,
  daiYieldFromDepositingCollateral: zero,
  daiYieldFromDepositingCollateralAtNextPrice: zero,
  toTokenAmount: zero,
  toTokenAmountUSD: zero,
  fromTokenAmount: zero,
  borrowedDaiAmount: zero,
  oneInchAmount: zero,
}
