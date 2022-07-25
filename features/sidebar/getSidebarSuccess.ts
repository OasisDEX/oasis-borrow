import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { SidebarTxData } from 'helpers/extractSidebarHelpers'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

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
  flow,
}: SidebarTxData & { flow: SidebarFlow }): TxStatusCardProgressProps | undefined {
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
      const txSuccessKey = getSidebarSuccessTxSuccessData({ flow })

      return {
        text: t(txSuccessKey, { id }),
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
