import { BigNumber } from 'bignumber.js'
import { openFlowInitialStopLossLevel } from 'features/automation/common/openFlowInitialStopLossLevel'
import { zero } from 'helpers/zero'

import type { OpenVaultState } from './openVault.types'

export function applyOpenVaultCalculations(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    depositAmountUSD,
    generateAmount,
    balanceInfo: { collateralBalance },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    ilkData: { ilkDebtAvailable, liquidationRatio },
    stopLossLevel,
  } = state

  const depositAmountUSDAtNextPrice = depositAmount
    ? depositAmount.times(nextCollateralPrice)
    : zero

  const afterBackingCollateral = generateAmount
    ? generateAmount.times(liquidationRatio).div(currentCollateralPrice)
    : zero

  const afterFreeCollateral = depositAmount ? depositAmount.minus(afterBackingCollateral) : zero

  const maxDepositAmount = collateralBalance // form values
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice) // form values

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

  const afterCollateralizationRatio =
    generateAmount && depositAmountUSD && !generateAmount.isZero()
      ? depositAmountUSD.div(generateAmount)
      : zero

  const afterCollateralizationRatioAtNextPrice =
    generateAmount && !generateAmount.isZero()
      ? depositAmountUSDAtNextPrice.div(generateAmount)
      : zero

  const afterLiquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? generateAmount.times(liquidationRatio).div(depositAmount)
      : zero

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : collateralBalance

  const resolvedStopLossLevel = stopLossLevel.isZero()
    ? openFlowInitialStopLossLevel({ liquidationRatio })
    : stopLossLevel

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
    stopLossLevel: resolvedStopLossLevel,
  }
}
