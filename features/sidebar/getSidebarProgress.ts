import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'

export function getSidebarProgress({
  stage,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  etherscan,
  proxyConfirmations,
  safeConfirmations,
  token,
}: OpenVaultState): TxStatusCardProgressProps | undefined {
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
    case 'allowanceInProgress':
      return {
        text: t('setting-allowance-for', { token }),
        txHash: allowanceTxHash!,
        etherscan: etherscan!,
      }
    case 'txInProgress':
      return {
        text: t('creating-your-vault'),
        txHash: openTxHash!,
        etherscan: etherscan!,
      }
    default:
      return undefined
  }
}
