import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'

import { SidebarTxData } from '../../helpers/extractSidebarHelpers'

export function getSidebarSuccess({
  stage,
  id,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  manageTxHash,
  etherscan,
  safeConfirmations,
  token,
}: SidebarTxData): TxStatusCardProgressProps | undefined {
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
    case 'collateralAllowanceSuccess':
    case 'daiAllowanceSuccess':
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
    case 'manageSuccess':
      return {
        text: t('vault-changed'),
        txHash: manageTxHash!,
        etherscan: etherscan!,
      }
    default:
      return undefined
  }
}
