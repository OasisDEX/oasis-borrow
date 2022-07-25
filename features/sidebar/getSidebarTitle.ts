import BigNumber from 'bignumber.js'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

interface GetSidebarTitleParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  token: string
  isSLPanelVisible?: boolean
  openFlowWithStopLoss?: boolean
  isStopLossEnabled?: boolean
}

function getSidebarTitleEditingTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'vault-form.header.edit'
    case 'openGuni':
      return 'vault-form.header.editWithToken'
    case 'addSl':
    case 'adjustSl':
      return 'protection.set-downside-protection'
    case 'cancelSl':
      return 'protection.cancel-downside-protection'
    case 'addBasicSell':
      return 'auto-sell.add-form-title'
    case 'cancelBasicSell':
      return 'auto-sell.cancel-form-title'
    case 'editBasicSell':
      return 'auto-sell.edit-form-title'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxSuccessTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'vault-form.header.success'
    case 'addSl':
      return 'protection.downside-protection-complete'
    case 'adjustSl':
      return 'protection.downside-protection-updated'
    case 'cancelSl':
      return 'protection.cancel-protection-complete'
    case 'addBasicSell':
      return 'auto-sell.trigger-added'
    case 'editBasicSell':
      return 'auto-sell.trigger-updated'
    case 'cancelBasicSell':
      return 'auto-sell.trigger-cancelled'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxInProgressTranslationKey({
  flow,
  openFlowWithStopLoss,
}: {
  flow: SidebarFlow
  openFlowWithStopLoss: boolean
}) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return !openFlowWithStopLoss
        ? 'vault-form.header.confirm-in-progress'
        : 'open-vault-two-tx-first-step-title'
    case 'openGuni':
      return 'vault-form.header.confirm-in-progress'
    case 'addSl':
    case 'adjustSl':
      return 'protection.setting-downside-protection'
    case 'addBasicSell':
    case 'editBasicSell':
      return 'auto-sell.setting-form-title'
    case 'cancelBasicSell':
      return 'auto-sell.cancelling-form-title'
    case 'cancelSl':
      return 'protection.cancelling-downside-protection'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxFailureTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'vault-form.header.confirm'
    case 'addSl':
    case 'adjustSl':
      return 'protection.set-downside-protection'
    case 'cancelSl':
      return 'protection.cancel-downside-protection'
    case 'addBasicSell':
    case 'editBasicSell':
      return 'auto-sell.setting-form-title'
    case 'cancelBasicSell':
      return 'auto-sell.cancelling-form-title'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleStopLossEditingKey({
  isStopLossEnabled,
}: {
  debt?: BigNumber
  isStopLossEnabled: boolean
}) {
  if (isStopLossEnabled) {
    return 'protection.edit-stop-loss'
  } else {
    return 'protection.enable-stop-loss'
  }
}

export function getSidebarTitle({
  flow,
  stage,
  token,
  isSLPanelVisible = false,
  openFlowWithStopLoss = false,
  isStopLossEnabled = false,
}: GetSidebarTitleParams) {
  const { t } = useTranslation()
  const allowanceToken = flow === 'openGuni' ? 'DAI' : token?.toUpperCase()

  if (isSLPanelVisible) return t('protection.your-stop-loss-triggered')

  switch (stage) {
    case 'editing':
      const editingKey = getSidebarTitleEditingTranslationKey({ flow })

      return t(editingKey, { token: token.toUpperCase() })
    case 'stopLossEditing':
      const stopLossEditingKey = getSidebarTitleStopLossEditingKey({ isStopLossEnabled })

      return t(stopLossEditingKey)
    case 'proxyInProgress':
      return t('vault-form.header.proxy-in-progress')
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyFailure':
      return t('vault-form.header.proxy')
    case 'proxySuccess':
      return t('vault-form.header.proxy-success')
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return t('vault-form.header.allowance', { token: allowanceToken })
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return t('vault-form.header.allowance', { token: 'DAI' })
    case 'txInProgress':
      const txInProgressKey = getSidebarTitleTxInProgressTranslationKey({
        flow,
        openFlowWithStopLoss,
      })

      return t(txInProgressKey)
    case 'txWaitingForConfirmation':
    case 'txWaitingForApproval':
    case 'txFailure':
      const txFailureKey = getSidebarTitleTxFailureTranslationKey({ flow })

      return t(txFailureKey)
    case 'stopLossTxInProgress':
    case 'stopLossTxWaitingForConfirmation':
    case 'stopLossTxWaitingForApproval':
    case 'stopLossTxFailure':
    case 'stopLossTxSuccess':
      return t('open-vault-two-tx-second-step-title')
    case 'txSuccess':
      const txSuccessKey = getSidebarTitleTxSuccessTranslationKey({ flow })

      return t(txSuccessKey)
    case 'collateralEditing':
    case 'daiEditing':
    case 'adjustPosition':
    case 'otherActions':
    case 'multiplyTransitionEditing':
    case 'multiplyTransitionWaitingForConfirmation':
    case 'multiplyTransitionInProgress':
    case 'multiplyTransitionFailure':
    case 'multiplyTransitionSuccess':
    case 'borrowTransitionEditing':
    case 'borrowTransitionWaitingForConfirmation':
    case 'borrowTransitionInProgress':
    case 'borrowTransitionFailure':
    case 'borrowTransitionSuccess':
      return t('vault-form.header.manage')
    case 'manageInProgress':
      return t('vault-form.header.modified')
    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageFailure':
      return t('vault-form.header.confirm-manage')
    case 'manageSuccess':
      return t('vault-form.header.success-manage')
    default:
      throw new UnreachableCaseError(stage)
  }
}
