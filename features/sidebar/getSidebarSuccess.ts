import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'

import { HasSidebarTxData } from '../../helpers/extractSidebarHelpers'

export function getSidebarSuccess({
  stage,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  etherscan,
  safeConfirmations,
  token,
  id,
}: HasSidebarTxData): TxStatusCardProgressProps | undefined {
  const { t } = useTranslation()

  switch (stage) {
    case 'proxySuccess':
      return {
        text: t('proxy-deployment-confirming', {
          proxyConfirmations: safeConfirmations,
          safeConfirmations,
        }),
        txHash: proxyTxHash!,
        etherscan: etherscan!,
      }
    case 'allowanceSuccess':
      return {
        text: t('setting-allowance-for', { token }),
        txHash: allowanceTxHash!,
        etherscan: etherscan!,
      }
    case 'txSuccess':
      return {
        text: t('vault-created', { id: id?.toString() }),
        txHash: openTxHash!,
        etherscan: etherscan!,
      }
    default:
      return undefined
  }
}
