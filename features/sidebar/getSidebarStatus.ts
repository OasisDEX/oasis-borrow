import { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { SidebarTxData } from 'helpers/extractSidebarHelpers'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

function getSidebarProgressTxInProgressKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'creating-your-vault'
    case 'addSl':
    case 'adjustSl':
      return 'protection.setting-downside-protection'
    case 'cancelSl':
      return 'protection.cancelling-downside-protection'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarSuccessTxSuccessData({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
    case 'openGuni':
      return 'creating-your-vault'
    case 'addSl':
    case 'adjustSl':
    case 'cancelSl':
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
  etherscan,
  proxyConfirmations,
  safeConfirmations,
  token,
  flow,
}: SidebarTxData & { flow: SidebarFlow }): SidebarSectionStatusProps | undefined {
  const { t } = useTranslation()

  const txData = {
    txHash: (txHash || openTxHash || manageTxHash || allowanceTxHash || proxyTxHash)!,
    etherscan: etherscan!,
  }

  switch (stage) {
    case 'proxyInProgress':
      return {
        text: t('proxy-deployment-confirming', {
          proxyConfirmations: proxyConfirmations || 0,
          safeConfirmations,
        }),
        type: 'progress',
        ...txData,
      }
    case 'collateralAllowanceInProgress':
    case 'daiAllowanceInProgress':
    case 'allowanceInProgress':
      return {
        text: t('setting-allowance-for', { token }),
        type: 'progress',
        ...txData,
      }
    case 'txInProgress':
      const txInProgressKey = getSidebarProgressTxInProgressKey({ flow })

      return {
        text: t(txInProgressKey),
        type: 'progress',
        ...txData,
      }
    case 'manageInProgress':
      return {
        text: t('changing-vault'),
        type: 'progress',
        ...txData,
      }
    case 'proxySuccess':
      return {
        text: t('proxy-deployment-confirming', {
          proxyConfirmations: safeConfirmations,
          safeConfirmations,
        }),
        type: 'success',
        ...txData,
      }
    case 'collateralAllowanceSuccess':
    case 'daiAllowanceSuccess':
    case 'allowanceSuccess':
      return {
        text: t('setting-allowance-for', { token }),
        type: 'success',
        ...txData,
      }
    case 'txSuccess':
      const txSuccessKey = getSidebarSuccessTxSuccessData({ flow })

      return {
        text: t(txSuccessKey, { id }),
        type: 'success',
        ...txData,
      }
    case 'manageSuccess':
      return {
        text: t('vault-changed'),
        type: 'success',
        ...txData,
      }
    default:
      return undefined
  }
}
