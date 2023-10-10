import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import type { ManageVaultCalculations } from './manageVaultCalculations.types'

// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)

export const PAYBACK_ALL_BOUND = new BigNumber('0.01')
export const defaultManageVaultCalculations: ManageVaultCalculations = {
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  maxWithdrawAmountAtCurrentPrice: zero,
  maxWithdrawAmountAtNextPrice: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,
  maxGenerateAmount: zero,
  maxGenerateAmountAtCurrentPrice: zero,
  maxGenerateAmountAtNextPrice: zero,
  maxPaybackAmount: zero,
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
  liquidationPriceCurrentPriceDifference: undefined,
  daiYieldFromTotalCollateralWithoutDebt: zero,
}
