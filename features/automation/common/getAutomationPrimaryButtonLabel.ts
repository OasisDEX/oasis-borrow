import {
  AutomationSidebarCopiesParams,
  SidebarAutomationFlow,
} from 'features/automation/common/types'
import { useTranslation } from 'next-i18next'
import { UnreachableCaseError } from 'ts-essentials'

function getPrimaryButtonLabelEditingTranslationKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addBasicSell':
    case 'addBasicBuy':
    case 'addConstantMultiple':
      return 'automation.add-trigger'
    case 'adjustSl':
    case 'editBasicSell':
    case 'editBasicBuy':
    case 'editConstantMultiple':
      return 'automation.update-trigger'
    case 'cancelSl':
    case 'cancelBasicSell':
    case 'cancelBasicBuy':
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
    case 'addBasicSell':
    case 'addBasicBuy':
    case 'addConstantMultiple':
      return 'automation.setting'
    case 'adjustSl':
    case 'editBasicSell':
    case 'editBasicBuy':
    case 'editConstantMultiple':
      return 'automation.updating'
    case 'cancelBasicSell':
    case 'cancelBasicBuy':
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
    case 'adjustSl':
    case 'cancelSl':
      return 'back-to-vault-overview'
    case 'addBasicSell':
    case 'cancelBasicSell':
    case 'addBasicBuy':
    case 'cancelBasicBuy':
    case 'editBasicSell':
    case 'editBasicBuy':
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
