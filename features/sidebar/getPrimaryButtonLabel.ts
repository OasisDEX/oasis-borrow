import { PrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

function getPrimaryButtonLabelEditingTranslationKey({
  proxyAddress,
  insufficientCollateralAllowance,
  insufficientDaiAllowance,
  insufficientAllowance,
}: {
  proxyAddress?: string
  insufficientCollateralAllowance?: boolean
  insufficientDaiAllowance?: boolean
  insufficientAllowance?: boolean
}) {
  if (!proxyAddress) return 'setup-proxy'
  else if (insufficientCollateralAllowance || insufficientDaiAllowance || insufficientAllowance)
    return 'set-token-allowance'
  else return 'confirm'
}

export function getPrimaryButtonLabel({
  stage,
  id,
  token,
  proxyAddress,
  insufficientCollateralAllowance,
  insufficientDaiAllowance,
  insufficientAllowance,
  canTransition,
}: PrimaryButtonLabelParams): string {
  const { t } = useTranslation()
  const allowanceToken = insufficientDaiAllowance ? 'DAI' : token

  switch (stage) {
    case 'editing':
    case 'collateralEditing':
    case 'daiEditing':
    case 'manageWaitingForConfirmation':
      const translationKey = getPrimaryButtonLabelEditingTranslationKey({
        proxyAddress,
        insufficientCollateralAllowance,
        insufficientDaiAllowance,
        insufficientAllowance,
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
    case 'manageFailure':
      return t('retry')
    case 'manageSuccess':
      return t('ok')
    case 'txInProgress':
      return t('creating-vault')
    case 'txSuccess':
      return t('go-to-vault', { id })
    case 'txWaitingForApproval':
    case 'txWaitingForConfirmation':
      return t('create-vault')
    case 'manageWaitingForApproval':
    case 'manageInProgress':
      return t('changing-vault')
    case 'multiplyTransitionEditing':
      return canTransition
        ? t('borrow-to-multiply.button-start')
        : t('borrow-to-multiply.button-not-supported', { token })
    case 'multiplyTransitionWaitingForConfirmation':
      return t('borrow-to-multiply.button-confirm')
    case 'multiplyTransitionInProgress':
      return t('borrow-to-multiply.button-progress')
    case 'multiplyTransitionFailure':
      return t('borrow-to-multiply.button-failure')
    case 'multiplyTransitionSuccess':
      return t('borrow-to-multiply.button-success')
    default:
      throw new UnreachableCaseError(stage)
  }
}
