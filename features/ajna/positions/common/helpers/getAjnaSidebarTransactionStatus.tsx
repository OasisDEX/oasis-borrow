import { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { TxDetails } from 'helpers/handleTransaction'

export function getAjnaSidebarTransactionStatus({
  etherscan = '',
  isTxSuccess,
  isTxInProgress,
  txDetails,
}: {
  etherscan?: string
  isTxSuccess: boolean
  isTxInProgress: boolean
  txDetails?: TxDetails
}): SidebarSectionStatusProps[] | undefined {
  return txDetails && (isTxInProgress || isTxSuccess)
    ? [
        {
          etherscan,
          text: 'text',
          txHash: txDetails.txHash,
          type: isTxInProgress ? 'progress' : 'success',
        },
      ]
    : undefined
}

// SidebarSectionStatusProps
