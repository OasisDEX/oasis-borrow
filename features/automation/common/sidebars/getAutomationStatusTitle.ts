import type { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import type {
  AutomationSidebarStatusParams,
  SidebarAutomationFlow,
} from 'features/automation/common/types'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

function getSidebarProgressTxInProgressKey({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'addAutoSell':
    case 'addAutoBuy':
    case 'addConstantMultiple':
    case 'addAutoTakeProfit':
      return 'automation.setting'
    case 'editSl':
    case 'editAutoSell':
    case 'editAutoBuy':
    case 'editConstantMultiple':
    case 'editAutoTakeProfit':
      return 'automation.updating'
    case 'cancelSl':
    case 'cancelAutoSell':
    case 'cancelAutoBuy':
    case 'cancelConstantMultiple':
    case 'cancelAutoTakeProfit':
      return 'automation.cancelling'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarSuccessTxSuccessData({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'editSl':
    case 'cancelSl':
    case 'addAutoSell':
    case 'editAutoSell':
    case 'cancelAutoSell':
    case 'addAutoBuy':
    case 'editAutoBuy':
    case 'cancelAutoBuy':
    case 'addConstantMultiple':
    case 'editConstantMultiple':
    case 'cancelConstantMultiple':
    case 'addAutoTakeProfit':
    case 'cancelAutoTakeProfit':
    case 'editAutoTakeProfit':
      return 'vault-changed'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getAutomationStatusTitle({
  stage,
  txHash,
  etherscan,
  flow,
  feature,
}: AutomationSidebarStatusParams): SidebarSectionStatusProps[] {
  const { t } = useTranslation()

  const txData = {
    txHash: txHash!,
    etherscan: etherscan!,
  }

  switch (stage) {
    case 'txInProgress':
      const txInProgressKey = getSidebarProgressTxInProgressKey({ flow })

      return [
        {
          text: t(txInProgressKey, { feature: t(sidebarAutomationFeatureCopyMap[feature]) }),
          type: 'progress',
          ...txData,
        },
      ]

    case 'txSuccess':
      const txSuccessKey = getSidebarSuccessTxSuccessData({ flow })

      return [
        {
          text: t(txSuccessKey),
          type: 'success',
          ...txData,
        },
      ]
    default:
      return []
  }
}
