import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import type {
  AutomationSidebarCopiesParams,
  SidebarAutomationFlow,
} from 'features/automation/common/types'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

function getSidebarTitleEditingTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addAutoSell':
    case 'addAutoBuy':
    case 'addAutoTakeProfit':
      return 'automation.setup'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editAutoTakeProfit':
      return 'automation.edit-trigger'
    case 'cancelSl':
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelAutoTakeProfit':
      return 'automation.cancel-trigger'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxInProgressTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addAutoSell':
    case 'addAutoBuy':
    case 'addAutoTakeProfit':
      return 'automation.setting'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editAutoTakeProfit':
      return 'automation.updating'
    case 'cancelSl':
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelAutoTakeProfit':
      return 'automation.cancelling'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxFailureTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'editSl':
      return 'protection.set-downside-protection'
    case 'cancelSl':
      return 'protection.cancel-downside-protection'
    case 'addAutoSell':
    case 'editAutoSell':
      return 'auto-sell.setting-form-title'
    case 'cancelAutoSell':
      return 'auto-sell.cancelling-form-title'
    case 'addAutoBuy':
    case 'editAutoBuy':
      return 'auto-buy.setting-form-title'
    case 'cancelAutoBuy':
      return 'auto-buy.cancelling-form-title'
    case 'addAutoTakeProfit':
    case 'editAutoTakeProfit':
      return 'auto-take-profit.setting-form-title'
    case 'cancelAutoTakeProfit':
      return 'auto-take-profit.cancelling-form-title'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxSuccessTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addAutoSell':
    case 'addAutoBuy':
    case 'addAutoTakeProfit':
      return 'automation.trigger-added'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editAutoTakeProfit':
      return 'automation.trigger-updated'
    case 'cancelSl':
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelAutoTakeProfit':
      return 'automation.trigger-cancelled'

    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getAutomationFormTitle({ flow, stage, feature }: AutomationSidebarCopiesParams) {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
    case 'stopLossEditing':
      const editingKey = getSidebarTitleEditingTranslationKey({ flow })

      return t(editingKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) })
    case 'txInProgress':
      const txInProgressKey = getSidebarTitleTxInProgressTranslationKey({
        flow,
      })

      return t(txInProgressKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) })
    case 'txFailure':
      const txFailureKey = getSidebarTitleTxFailureTranslationKey({ flow })

      return t(txFailureKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) })
    case 'txSuccess':
      const txSuccessKey = getSidebarTitleTxSuccessTranslationKey({ flow })

      return t(txSuccessKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) })
    default:
      throw new UnreachableCaseError(stage)
  }
}
