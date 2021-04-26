import { zero } from 'helpers/zero'
import { generate } from 'rxjs'
import { OpenVaultStage, OpenVaultState } from './openVault'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

function categoriseOpenVaultStage(stage: OpenVaultStage) {
  switch (stage) {
    case 'editing':
      return {
        ...defaultOpenVaultStageCategories,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isProxyStage: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isAllowanceStage: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openSuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isOpenStage: true,
      }
  }
}

export interface OpenVaultConditions {
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean

  vaultWillBeUnderCollateralized: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean

  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateral: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: boolean
  generateAmountExceedsDebtCeiling: boolean
  generateAmountLessThanDebtFloor: boolean

  isLoadingStage: boolean
  flowProgressionDisabled: boolean
}

export const defaultOpenVaultConditions: OpenVaultConditions = {
  ...defaultOpenVaultStageCategories,

  vaultWillBeUnderCollateralized: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  generateAmountExceedsDaiYieldFromDepositingCollateral: false,
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountLessThanDebtFloor: false,

  isLoadingStage: false,
  flowProgressionDisabled: false,
}

export function applyOpenVaultConditions(state: OpenVaultState): OpenVaultState {
  const {
    stage,
    generateAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    ilkData,
    token,
    balanceInfo: { collateralBalance },
    depositAmount,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,
  } = state

  const vaultWillBeUnderCollateralized = !!(
    generateAmount?.gt(zero) &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()
  )

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !!(
      generateAmount?.gt(zero) &&
      afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
      !afterCollateralizationRatioAtNextPrice.isZero()
    )

  const depositingAllEthBalance = token === 'ETH' && !!depositAmount?.eq(collateralBalance)
  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const generateAmountExceedsDaiYieldFromDepositingCollateral = !!generateAmount?.gt(
    daiYieldFromDepositingCollateral,
  )

  const generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromDepositingCollateral &&
    !!generateAmount?.gt(daiYieldFromDepositingCollateralAtNextPrice)

  const generateAmountExceedsDebtCeiling = !!generateAmount?.gt(ilkData.ilkDebtAvailable)

  const generateAmountLessThanDebtFloor = !!(
    generateAmount &&
    !generateAmount.isZero() &&
    generateAmount.lt(ilkData.debtFloor)
  )

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'allowanceInProgress',
    'allowanceWaitingForApproval',
    'openInProgress',
    'openWaitingForApproval',
  ] as OpenVaultStage[]).some((s) => s === stage)

  const flowProgressionDisabled =
    isLoadingStage ||
    vaultWillBeUnderCollateralized ||
    vaultWillBeUnderCollateralizedAtNextPrice ||
    depositingAllEthBalance ||
    depositAmountExceedsCollateralBalance ||
    generateAmountExceedsDebtCeiling ||
    generateAmountLessThanDebtFloor

  return {
    ...state,
    ...categoriseOpenVaultStage(stage),

    vaultWillBeUnderCollateralized,
    vaultWillBeUnderCollateralizedAtNextPrice,
    depositingAllEthBalance,
    depositAmountExceedsCollateralBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,

    isLoadingStage,
    flowProgressionDisabled,
  }
}
