import type { BigNumber } from 'bignumber.js'

export interface OpenMultiplyVaultCalculations {
  afterLiquidationPrice: BigNumber
  afterBuyingPower: BigNumber
  afterBuyingPowerUSD: BigNumber
  afterNetValue: BigNumber
  afterNetValueUSD: BigNumber
  buyingCollateral: BigNumber
  buyingCollateralUSD: BigNumber
  totalExposure: BigNumber
  totalExposureUSD?: BigNumber
  impact: BigNumber
  multiply: BigNumber
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
  skipFL: boolean
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
