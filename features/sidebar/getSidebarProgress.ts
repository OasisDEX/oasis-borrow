import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

import { SidebarTxData } from '../../helpers/extractSidebarHelpers'

function getSidebarProgressTxInProgressKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'creating-your-vault'
    case 'addSl':
    case 'adjustSl':
      return 'protection.setting-downside-protection'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getSidebarProgress({
  stage,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  manageTxHash,
  etherscan,
  proxyConfirmations,
  safeConfirmations,
  token,
  flow,
}: SidebarTxData & { flow: SidebarFlow }): TxStatusCardProgressProps | undefined {
  const { t } = useTranslation()

  switch (stage) {
    case 'proxyInProgress':
      return {
        text: t('proxy-deployment-confirming', {
          proxyConfirmations: proxyConfirmations || 0,
          safeConfirmations,
        }),
        txHash: proxyTxHash!,
        etherscan: etherscan!,
      }
    case 'collateralAllowanceInProgress':
    case 'daiAllowanceInProgress':
    case 'allowanceInProgress':
      return {
        text: t('setting-allowance-for', { token }),
        txHash: allowanceTxHash!,
        etherscan: etherscan!,
      }
    case 'txInProgress':
      const txInProgressKey = getSidebarProgressTxInProgressKey({ flow })
      return {
        text: t(txInProgressKey),
        txHash: openTxHash!,
        etherscan: etherscan!,
      }
    case 'manageInProgress':
      return {
        text: t('changing-vault'),
        txHash: manageTxHash!,
        etherscan: etherscan!,
      }
    default:
      return undefined
  }
}
