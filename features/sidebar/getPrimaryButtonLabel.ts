import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { PrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

const flowsWithoutProxy = [
  'adjustSl',
  'addSl',
  'cancelSl',
  'addBasicSell',
  'cancelBasicSell',
  'addBasicBuy',
  'cancelBasicBuy',
  'editBasicSell',
  'editBasicBuy',
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
    case 'addBasicSell':
    case 'cancelBasicSell':
    case 'addBasicBuy':
    case 'cancelBasicBuy':
    case 'editBasicSell':
    case 'editBasicBuy':
      return 'confirm'
    case 'manageGuni':
      return 'close-vault'
    case 'addSl':
      return 'add-stop-loss'
    case 'adjustSl':
      return 'update-stop-loss'
    case 'cancelSl':
      return 'cancel-stop-loss'
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
    case 'addSl':
      return 'add-stop-loss'
    case 'adjustSl':
      return 'update-stop-loss'
    case 'cancelSl':
      return 'cancel-stop-loss'
    case 'addBasicSell':
      return 'adding-auto-sell'
    case 'cancelBasicSell':
      return 'cancelling-auto-sell'
    case 'editBasicSell':
      return 'adding-auto-sell'
    case 'addBasicBuy':
    case 'editBasicBuy':
      return 'adding-auto-buy'
    case 'cancelBasicBuy':
      return 'cancelling-auto-buy'
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
    case 'addSl':
    case 'adjustSl':
    case 'cancelSl':
      return 'back-to-vault-overview'
    case 'addBasicSell':
    case 'cancelBasicSell':
    case 'addBasicBuy':
    case 'cancelBasicBuy':
    case 'editBasicSell':
    case 'editBasicBuy':
      return 'finished'
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
  isSLPanelVisible = false,
}: PrimaryButtonLabelParams & { flow: SidebarFlow }): string {
  const { t } = useTranslation()
  const allowanceToken =
    insufficientDaiAllowance || flow === 'openGuni' ? 'DAI' : token?.toUpperCase()

  if (isSLPanelVisible) return t('protection.reopen-position')

  switch (stage) {
    case 'editing':
    case 'stopLossEditing':
    case 'collateralEditing':
    case 'daiEditing':
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
    case 'multiplyTransitionEditing':
      return canTransition
        ? t('borrow-to-multiply.button-start')
        : t('borrow-to-multiply.button-not-supported', { token: token?.toUpperCase() })
    case 'multiplyTransitionWaitingForConfirmation':
      return t('borrow-to-multiply.button-confirm')
    case 'multiplyTransitionInProgress':
      return t('borrow-to-multiply.button-progress')
    case 'multiplyTransitionFailure':
      return t('borrow-to-multiply.button-failure')
    case 'multiplyTransitionSuccess':
      return t('borrow-to-multiply.button-success')
    case 'borrowTransitionEditing':
      return canTransition
        ? t('multiply-to-borrow.button-start')
        : t('multiply-to-borrow.button-not-supported', { token: token?.toUpperCase() })
    case 'borrowTransitionWaitingForConfirmation':
      return t('multiply-to-borrow.button-confirm')
    case 'borrowTransitionInProgress':
      return t('multiply-to-borrow.button-progress')
    case 'borrowTransitionFailure':
      return t('multiply-to-borrow.button-failure')
    case 'borrowTransitionSuccess':
      return t('multiply-to-borrow.button-success')
    default:
      throw new UnreachableCaseError(stage)
  }
}
