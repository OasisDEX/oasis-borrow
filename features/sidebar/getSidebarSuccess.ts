import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'

export function getSidebarSuccess({
  stage,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  etherscan,
  safeConfirmations,
  token,
  id,
}: OpenVaultState): TxStatusCardProgressProps | undefined {
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
