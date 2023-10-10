import type { CloseToParams } from '@oasisdex/multiply'
import type { BigNumber } from 'bignumber.js'
import type { ExchangeAction } from 'features/exchange/exchange'

export interface ManageVaultCalculations {
  maxBuyAmount: BigNumber
  maxBuyAmountUSD: BigNumber

  maxSellAmount: BigNumber
  maxSellAmountUSD: BigNumber

  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  maxDepositDaiAmount: BigNumber

  maxPaybackAmount: BigNumber

  maxWithdrawAmountAtCurrentPrice: BigNumber
  maxWithdrawAmountAtNextPrice: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber

  maxGenerateAmountAtCurrentPrice: BigNumber
  maxGenerateAmountAtNextPrice: BigNumber
  maxGenerateAmount: BigNumber

  maxLegalCollateralizationRatio: BigNumber

  daiYieldFromTotalCollateral: BigNumber
  daiYieldFromTotalCollateralAtNextPrice: BigNumber
  exchangeAction?: ExchangeAction
  afterDebt: BigNumber
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  afterCollateralizationRatioAtNextPrice: BigNumber
  afterFreeCollateral: BigNumber
  afterFreeCollateralAtNextPrice: BigNumber
  afterBackingCollateral: BigNumber
  afterBackingCollateralAtNextPrice: BigNumber
  afterLockedCollateral: BigNumber
  afterLockedCollateralUSD: BigNumber
  afterCollateralBalance: BigNumber
  shouldPaybackAll: boolean

  impact: BigNumber
  multiply: BigNumber
  afterMultiply: BigNumber

  maxCollRatio: BigNumber
  minCollRatio: BigNumber
  liquidationPriceCurrentPriceDifference: BigNumber | undefined
  loanFee: BigNumber
  skipFL: boolean
  oazoFee: BigNumber
  fees: BigNumber
  netValueUSD: BigNumber
  afterNetValueUSD: BigNumber
  buyingPower: BigNumber
  buyingPowerUSD: BigNumber
  afterBuyingPower: BigNumber
  afterBuyingPowerUSD: BigNumber

  debtDelta?: BigNumber
  collateralDelta?: BigNumber
  collateralDeltaUSD?: BigNumber

  marketPrice?: BigNumber
  marketPriceMaxSlippage?: BigNumber

  closeToDaiParams: CloseToParams
  closeToCollateralParams: CloseToParams

  afterCloseToDai: BigNumber
  afterCloseToCollateral: BigNumber
  afterCloseToCollateralUSD: BigNumber
  oneInchAmount: BigNumber
  currentPnL: BigNumber
  totalGasSpentUSD: BigNumber
}
