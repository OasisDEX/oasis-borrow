import { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { SidebarTxData } from 'helpers/extractSidebarHelpers'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

function getSidebarProgressTxInProgressKey({
  flow,
  openFlowWithStopLoss,
}: {
  flow: SidebarFlow
  openFlowWithStopLoss: boolean
}) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return !openFlowWithStopLoss ? 'creating-your-vault' : 'open-vault-deployment-confirming'
    case 'openGuni':
      return 'creating-your-vault'
    case 'addSl':
    case 'adjustSl':
      return 'protection.setting-downside-protection'
    case 'cancelSl':
      return 'protection.cancelling-downside-protection'
    case 'addBasicSell':
    case 'editBasicSell':
      return 'protection.setting-auto-sell'
    case 'cancelBasicSell':
      return 'protection.cancelling-auto-sell'
    case 'cancelBasicBuy':
      return 'auto-buy.cancelling-auto-buy'
    case 'addBasicBuy':
    case 'editBasicBuy':
      return 'auto-buy.setting-auto-buy'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarSuccessTxSuccessData({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'vault-creation-confirmed'
    case 'addSl':
    case 'adjustSl':
    case 'cancelSl':
    case 'addBasicSell':
    case 'editBasicSell':
    case 'cancelBasicSell':
    case 'addBasicBuy':
    case 'editBasicBuy':
    case 'cancelBasicBuy':
      return 'vault-changed'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getSidebarStatus({
  stage,
  id,
  txHash,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  manageTxHash,
  stopLossTxHash,
  etherscan,
  proxyConfirmations,
  openVaultConfirmations,
  safeConfirmations,
  openVaultSafeConfirmations,
  token,
  flow,
  openFlowWithStopLoss = false,
}: SidebarTxData & { flow: SidebarFlow }): SidebarSectionStatusProps[] | undefined {
  const { t } = useTranslation()

  const txData = {
    txHash: (txHash ||
      stopLossTxHash ||
      openTxHash ||
      manageTxHash ||
      allowanceTxHash ||
      proxyTxHash)!,
    etherscan: etherscan!,
  }

  switch (stage) {
    case 'proxyInProgress':
      return [
        {
          text: t('proxy-deployment-confirming', {
            proxyConfirmations: proxyConfirmations || 0,
            safeConfirmations,
          }),
          type: 'progress',
          ...txData,
        },
      ]
    case 'collateralAllowanceInProgress':
    case 'daiAllowanceInProgress':
    case 'allowanceInProgress':
      return [
        {
          text: t('setting-allowance-for', { token }),
          type: 'progress',
          ...txData,
        },
      ]
    case 'txInProgress':
      const txInProgressKey = getSidebarProgressTxInProgressKey({ flow, openFlowWithStopLoss })

      const statusArrayTxInProgress: SidebarSectionStatusProps[] = [
        {
          text: t(txInProgressKey, {
            openVaultConfirmations: openVaultConfirmations || 0,
            safeConfirmations: openVaultSafeConfirmations,
          }),
          type: 'progress',
          ...txData,
          txHash: openTxHash! || txHash!,
        },
      ]

      if (openFlowWithStopLoss) {
        statusArrayTxInProgress.push({
          text: t('open-vault-sl-second-status-title'),
          description: t('open-vault-sl-second-status-not-started-desc'),
          type: 'waiting',
          ...txData,
          txHash: '',
        })
      }

      return statusArrayTxInProgress
    case 'stopLossTxInProgress':
      return [
        {
          text: t('vault-creation-confirmed'),
          type: 'waiting',
          ...txData,
          txHash: openTxHash!,
        },
        {
          text: `${t('open-vault-sl-second-status-title')} ${t('in-progress')}`,
          type: 'progress',
          ...txData,
          txHash: stopLossTxHash!,
        },
      ]

    case 'stopLossTxSuccess':
      return [
        {
          text: t('vault-creation-confirmed'),
          type: 'waiting',
          icon: 'checkmark',
          ...txData,
          txHash: openTxHash!,
        },
        {
          text: t('vault-changed'),
          type: 'success',
          ...txData,
          txHash: stopLossTxHash!,
        },
      ]

    case 'stopLossTxWaitingForConfirmation':
    case 'stopLossTxWaitingForApproval':
      return [
        {
          text: t('vault-creation-confirmed'),
          type: 'success',
          icon: 'checkmark',
          ...txData,
          txHash: openTxHash!,
        },
        {
          text: `${t('open-vault-sl-second-status-title')} ${t('not-started')}`,
          description: t('open-vault-sl-second-status-not-started-desc'),
          type: 'waiting',
          ...txData,
          txHash: '',
        },
      ]
    case 'manageInProgress':
      return [
        {
          text: t('changing-vault'),
          type: 'progress',
          ...txData,
        },
      ]
    case 'proxySuccess':
      return [
        {
          text: t('proxy-deployment-confirming', {
            proxyConfirmations: safeConfirmations,
            safeConfirmations,
          }),
          type: 'success',
          ...txData,
        },
      ]
    case 'collateralAllowanceSuccess':
    case 'daiAllowanceSuccess':
    case 'allowanceSuccess':
      return [
        {
          text: t('setting-allowance-for', { token }),
          type: 'success',
          ...txData,
        },
      ]
    case 'txSuccess':
      const txSuccessKey = getSidebarSuccessTxSuccessData({ flow })

      return [
        {
          text: t(txSuccessKey, { id }),
          type: 'success',
          ...txData,
        },
      ]
    case 'manageSuccess':
      return [
        {
          text: t('vault-changed'),
          type: 'success',
          ...txData,
        },
      ]
    default:
      return []
  }
}
