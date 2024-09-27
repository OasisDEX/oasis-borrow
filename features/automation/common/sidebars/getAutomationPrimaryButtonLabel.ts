import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import type {
  AutomationSidebarCopiesParams,
  SidebarAutomationFlow,
} from 'features/automation/common/types'
import { calculateStepNumber } from 'features/automation/protection/stopLoss/helpers'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

function getPrimaryButtonLabelEditingTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addAutoSell':
    case 'addAutoBuy':
    case 'addAutoTakeProfit':
      return 'automation.add-trigger'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editAutoTakeProfit':
      return 'automation.update-trigger'
    case 'cancelSl':
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelAutoTakeProfit':
      return 'automation.cancel-trigger'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getPrimaryButtonLabelTxInProgressTranslationKey({
  flow,
}: {
  flow: SidebarAutomationFlow
}) {
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

function getPrimaryButtonLabelTxSuccessData({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'editSl':
    case 'cancelSl':
    case 'addAutoSell':
    case 'cancelAutoSell':
    case 'addAutoBuy':
    case 'cancelAutoBuy':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'addAutoTakeProfit':
    case 'cancelAutoTakeProfit':
    case 'editAutoTakeProfit':
      return 'finished'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function generateAutomationPrimaryButtonLabelTtext({
  stage,
  flow,
  feature,
  isAwaitingConfirmation,
}: AutomationSidebarCopiesParams) {
  const { t } = useTranslation()

  if (isAwaitingConfirmation && stage !== 'txSuccess') return t('protection.confirm')

  switch (stage) {
    case 'editing':
    case 'stopLossEditing':
      const translationKey = getPrimaryButtonLabelEditingTranslationKey({
        flow,
      })

      return t(translationKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) })
    case 'txFailure':
      return t('retry')
    case 'txInProgress':
      const txInProgressKey = getPrimaryButtonLabelTxInProgressTranslationKey({ flow })

      return t(txInProgressKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) })
    case 'txSuccess':
      const txSuccessKey = getPrimaryButtonLabelTxSuccessData({ flow })

      return t(txSuccessKey)
    default:
      throw new UnreachableCaseError(stage as never)
  }
}

export function getAutomationPrimaryButtonLabel({
  stage,
  flow,
  feature,
  isAwaitingConfirmation,
  isRemoveForm,
}: AutomationSidebarCopiesParams) {
  return `${generateAutomationPrimaryButtonLabelTtext({
    stage,
    flow,
    feature,
    isAwaitingConfirmation,
  })} ${isRemoveForm ? '' : calculateStepNumber(isAwaitingConfirmation || false, stage)}`
}
