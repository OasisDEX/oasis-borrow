import BigNumber from 'bignumber.js'
import { TxStatusCardProgressProps } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'

import { HasSidebarTxData } from '../../helpers/extractSidebarHelpers'
import { UnreachableCaseError } from '../../helpers/UnreachableCaseError'
import { SidebarFlow } from '../types/vaults/sidebarLabels'

function getSidebarSuccessTxSuccessData({ flow, id }: { flow: SidebarFlow; id?: BigNumber }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return { key: 'creating-your-vault', id }
    case 'addSl':
    case 'adjustSl':
      return { key: 'vault-changed' }
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getSidebarSuccess({
  stage,
  proxyTxHash,
  allowanceTxHash,
  openTxHash,
  etherscan,
  safeConfirmations,
  token,
  id,
  flow,
}: HasSidebarTxData & { flow: SidebarFlow }): TxStatusCardProgressProps | undefined {
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
      const txSuccessData = getSidebarSuccessTxSuccessData({ flow, id })

      return {
        text: t(txSuccessData.key, txSuccessData.id && { id: txSuccessData.id.toString() }),
        txHash: openTxHash!,
        etherscan: etherscan!,
      }
    default:
      return undefined
  }
}
