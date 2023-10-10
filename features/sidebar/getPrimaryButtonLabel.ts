import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import type { PrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

const flowsWithoutProxy = [
  'editSl',
  'addSl',
  'cancelSl',
  'addAutoSell',
  'cancelAutoSell',
  'addAutoBuy',
  'cancelAutoBuy',
  'editAutoSell',
  'editAutoBuy',
  'addConstantMultiple',
  'cancelConstantMultiple',
  'editConstantMultiple',
]
const UNREACHABLE_CASE_MESSAGE = ''

function getPrimaryButtonLabelEditingTranslationKey({
  flow,
  proxyAddress,
  insufficientCollateralAllowance,
  insufficientDaiAllowance,
  insufficientAllowance,
}: {
  flow: SidebarFlow
  proxyAddress?: string
  insufficientCollateralAllowance?: boolean
  insufficientDaiAllowance?: boolean
  insufficientAllowance?: boolean
}) {
  if (!proxyAddress && !flowsWithoutProxy.includes(flow)) return 'setup-proxy'
  else if (insufficientCollateralAllowance || insufficientDaiAllowance || insufficientAllowance)
    return 'set-token-allowance'

  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
    case 'manageBorrow':
    case 'manageMultiply':
      return 'confirm'
    case 'manageGuni':
      return 'close-vault'
    case 'addSl':
      return 'add-stop-loss'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getPrimaryButtonLabelTxInProgressTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'creating-vault'
    default:
      return UNREACHABLE_CASE_MESSAGE
  }
}

function getPrimaryButtonLabelTxSuccessData({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'go-to-vault'
    default:
      return UNREACHABLE_CASE_MESSAGE
  }
}

export function getPrimaryButtonLabel({
  stage,
  id,
  token,
  proxyAddress,
  insufficientCollateralAllowance,
  insufficientDaiAllowance,
  insufficientAllowance,
  flow,
  canTransition = true,
  isClosedVaultPanelVisible = false,
  vaultType,
}: PrimaryButtonLabelParams & { flow: SidebarFlow; vaultType: VaultType }): string {
  const { t } = useTranslation()
  const allowanceToken =
    insufficientDaiAllowance || flow === 'openGuni' ? 'DAI' : token?.toUpperCase()

  if (isClosedVaultPanelVisible) return t('protection.reopen-position')

  switch (stage) {
    case 'editing':
    case 'stopLossEditing':
    case 'adjustPosition':
    case 'otherActions':
    case 'manageWaitingForConfirmation':
      const translationKey = getPrimaryButtonLabelEditingTranslationKey({
        proxyAddress,
        insufficientCollateralAllowance,
        insufficientDaiAllowance,
        insufficientAllowance,
        flow,
      })
      return t(translationKey, { token: allowanceToken })
    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxySuccess':
      return insufficientCollateralAllowance || insufficientDaiAllowance || insufficientAllowance
        ? t('set-token-allowance', { token: allowanceToken })
        : t('continue')
    case 'collateralAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForConfirmation':
    case 'allowanceWaitingForConfirmation':
      return t('set-token-allowance', { token: allowanceToken })
    case 'collateralAllowanceWaitingForApproval':
    case 'daiAllowanceWaitingForApproval':
    case 'allowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'daiAllowanceInProgress':
    case 'allowanceInProgress':
      return t('approving-allowance')
    case 'collateralAllowanceFailure':
    case 'daiAllowanceFailure':
    case 'allowanceFailure':
      return t('retry-allowance-approval')
    case 'collateralAllowanceSuccess':
      return insufficientDaiAllowance
        ? t('set-token-allowance', { token: allowanceToken })
        : t('continue')
    case 'daiAllowanceSuccess':
    case 'allowanceSuccess':
      return t('continue')
    case 'txFailure':
    case 'stopLossTxFailure':
    case 'manageFailure':
      return t('retry')
    case 'manageSuccess':
      return t('ok')
    case 'txInProgress':
      const txInProgressKey = getPrimaryButtonLabelTxInProgressTranslationKey({ flow })

      return t(txInProgressKey)
    case 'txSuccess':
    case 'stopLossTxSuccess':
      const txSuccessKey = getPrimaryButtonLabelTxSuccessData({ flow })

      return t(txSuccessKey, { id })
    case 'txWaitingForApproval':
    case 'txWaitingForConfirmation':
      return t('create-vault')
    case 'stopLossTxWaitingForApproval':
    case 'stopLossTxWaitingForConfirmation':
    case 'stopLossTxInProgress':
      return t('set-up-stop-loss-tx')
    case 'manageWaitingForApproval':
    case 'manageInProgress':
      return t('changing-vault')
    case 'borrowTransitionEditing':
      if (vaultType === VaultType.Borrow) {
        return canTransition
          ? t('borrow-to-multiply.button-start')
          : t('borrow-to-multiply.button-not-supported', { token: token?.toUpperCase() })
      }
      return canTransition
        ? t('multiply-to-borrow.button-start')
        : t('multiply-to-borrow.button-not-supported', { token: token?.toUpperCase() })
    case 'borrowTransitionWaitingForConfirmation':
      if (vaultType === VaultType.Borrow) {
        return t('borrow-to-multiply.button-confirm')
      }
      return t('multiply-to-borrow.button-confirm')
    case 'borrowTransitionInProgress':
      if (vaultType === VaultType.Borrow) {
        return t('borrow-to-multiply.button-progress')
      }
      return t('multiply-to-borrow.button-progress')
    case 'borrowTransitionFailure':
      if (vaultType === VaultType.Borrow) {
        return t('borrow-to-multiply.button-failure')
      }
      return t('multiply-to-borrow.button-failure')
    case 'borrowTransitionSuccess':
      if (vaultType === VaultType.Borrow) {
        return t('borrow-to-multiply.button-success')
      }
      return t('multiply-to-borrow.button-success')
    default:
      throw new UnreachableCaseError(stage)
  }
}
