import { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import {
  AutomationSidebarStatusParams,
  SidebarAutomationFlow,
} from 'features/automation/common/types'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

function getSidebarProgressTxInProgressKey({ flow }: { flow: SidebarAutomationFlow }) {
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
    case 'cancelSl':
    case 'cancelBasicSell':
    case 'cancelBasicBuy':
    case 'cancelConstantMultiple':
      return 'automation.cancelling'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarSuccessTxSuccessData({ flow }: { flow: SidebarAutomationFlow }) {
  switch (flow) {
    case 'addSl':
    case 'adjustSl':
    case 'cancelSl':
    case 'addBasicSell':
    case 'editBasicSell':
    case 'cancelBasicSell':
    case 'addBasicBuy':
    case 'editBasicBuy':
    case 'cancelBasicBuy':
    case 'addConstantMultiple':
    case 'editConstantMultiple':
    case 'cancelConstantMultiple':
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
          text: t(txInProgressKey, { feature }),
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
