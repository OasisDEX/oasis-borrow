import {
  AutomationSidebarCopiesParams,
  SidebarAutomationFlow,
} from 'features/automation/common/types'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

function getPrimaryButtonLabelEditingTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addAutoSell':
    case 'addAutoBuy':
    case 'addConstantMultiple':
      return 'automation.add-trigger'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editConstantMultiple':
      return 'automation.update-trigger'
    case 'cancelSl':
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelConstantMultiple':
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
    case 'addConstantMultiple':
      return 'automation.setting'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editConstantMultiple':
      return 'automation.updating'
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelConstantMultiple':
    case 'cancelSl':
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
      return 'back-to-vault-overview'
    case 'addAutoSell':
    case 'cancelAutoSell':
    case 'addAutoBuy':
    case 'cancelAutoBuy':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'addConstantMultiple':
    case 'cancelConstantMultiple':
    case 'editConstantMultiple':
      return 'finished'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getAutomationPrimaryButtonLabel({
  stage,
  flow,
  feature,
}: AutomationSidebarCopiesParams) {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
    case 'stopLossEditing':
      const translationKey = getPrimaryButtonLabelEditingTranslationKey({
        flow,
      })

      return t(translationKey, { feature })
    case 'txFailure':
      return t('retry')
    case 'txInProgress':
      const txInProgressKey = getPrimaryButtonLabelTxInProgressTranslationKey({ flow })

      return t(txInProgressKey, { feature })
    case 'txSuccess':
      const txSuccessKey = getPrimaryButtonLabelTxSuccessData({ flow })

      return t(txSuccessKey)
    default:
      throw new UnreachableCaseError(stage)
  }
}
