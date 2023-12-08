import type { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import type { TxDetails } from 'helpers/handleTransaction'

export function getOmniSidebarTransactionStatus({
  etherscan = '',
  etherscanName,
  isTxInProgress,
  isTxSuccess,
  text,
  txDetails,
}: {
  etherscan?: string
  etherscanName?: string
  isTxInProgress: boolean
  isTxSuccess: boolean
  text: string
  txDetails?: TxDetails
}): SidebarSectionStatusProps[] | undefined {
  return txDetails && (isTxInProgress || isTxSuccess)
    ? [
        {
          etherscan,
          etherscanName,
          text,
          txHash: txDetails.txHash,
          type: isTxInProgress ? 'progress' : 'success',
        },
      ]
    : undefined
}
