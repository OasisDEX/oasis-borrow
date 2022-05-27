import BigNumber from 'bignumber.js'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { PrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

const flowsWithoutProxy = ['adjustSl', 'addSl']

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
    case 'manageBorrow':
      return 'confirm'
    case 'addSl':
      return 'add-stop-loss'
    case 'adjustSl':
      return 'update-stop-loss'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getPrimaryButtonLabelTxInProgressTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'creating-vault'
    case 'addSl':
      return 'add-stop-loss'
    case 'adjustSl':
      return 'update-stop-loss'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getPrimaryButtonLabelTxSuccessData({ flow, id }: { flow: SidebarFlow; id?: BigNumber }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return { key: 'go-to-vault', id }
    case 'addSl':
    case 'adjustSl':
      return { key: 'back-to-vault-overview' }
    default:
      throw new UnreachableCaseError(flow)
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
        flow
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
      const txInProgressKey = getPrimaryButtonLabelTxInProgressTranslationKey({ flow })

      return t(txInProgressKey)
    case 'txSuccess':
      const txSuccessKey = getPrimaryButtonLabelTxSuccessData({ flow, id })

      return t(txSuccessKey.key, txSuccessKey.id && { id: txSuccessKey.id.toString() })
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
