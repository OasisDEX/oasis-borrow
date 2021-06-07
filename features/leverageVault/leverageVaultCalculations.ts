import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { LeverageVaultState } from './leverageVault'

export interface LeverageVaultCalculations {
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber
  afterCollateralizationRatioAtNextPrice: BigNumber
  daiYieldFromDepositingCollateral: BigNumber
  daiYieldFromDepositingCollateralAtNextPrice: BigNumber
  afterFreeCollateral: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  maxGenerateAmount: BigNumber
  maxGenerateAmountCurrentPrice: BigNumber
  maxGenerateAmountNextPrice: BigNumber
  afterCollateralBalance: BigNumber
}

export const defaultOpenVaultStateCalculations: LeverageVaultCalculations = {
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  maxGenerateAmount: zero,
  maxGenerateAmountCurrentPrice: zero,
  maxGenerateAmountNextPrice: zero,
  afterCollateralizationRatio: zero,
  afterCollateralizationRatioAtNextPrice: zero,
  daiYieldFromDepositingCollateral: zero,
  daiYieldFromDepositingCollateralAtNextPrice: zero,
  afterLiquidationPrice: zero,
  afterFreeCollateral: zero,
  afterCollateralBalance: zero,
}

export function applyOpenVaultCalculations(state: LeverageVaultState): LeverageVaultState {
  const {
    depositAmount,
    depositAmountUSD,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    ilkData: { ilkDebtAvailable, liquidationRatio },
  } = state

  const depositAmountUSDAtNextPrice = depositAmount
    ? depositAmount.times(nextCollateralPrice)
    : zero

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const daiYieldFromDepositingCollateral = depositAmount
    ? depositAmount.times(currentCollateralPrice).div(liquidationRatio)
    : zero

  const daiYieldFromDepositingCollateralAtNextPrice = depositAmount
    ? depositAmount.times(nextCollateralPrice).div(liquidationRatio)
    : zero

  const maxGenerateAmountCurrentPrice = daiYieldFromDepositingCollateral.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : daiYieldFromDepositingCollateral

  const maxGenerateAmountNextPrice = daiYieldFromDepositingCollateralAtNextPrice.gt(
    ilkDebtAvailable,
  )
    ? ilkDebtAvailable
    : daiYieldFromDepositingCollateralAtNextPrice

  const maxGenerateAmount = BigNumber.minimum(
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
  )

  const afterCollateralizationRatio = zero // TODO

  const afterCollateralizationRatioAtNextPrice = zero // TODO

  const afterLiquidationPrice = zero // TODO

  const afterFreeCollateral = zero // TODO

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  return {
    ...state,
    maxDepositAmount,
    maxDepositAmountUSD,
    maxGenerateAmount,
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,
    afterLiquidationPrice,
    afterFreeCollateral,
    afterCollateralBalance,
  }
}
