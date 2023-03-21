import { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { TxDetails } from 'helpers/handleTransaction'

export function getAjnaSidebarTransactionStatus({
  etherscan = '',
  isTxInProgress,
  isTxSuccess,
  text,
  txDetails,
}: {
  etherscan?: string
  isTxInProgress: boolean
  isTxSuccess: boolean
  text: string
  txDetails?: TxDetails
}): SidebarSectionStatusProps[] | undefined {
  return txDetails && (isTxInProgress || isTxSuccess)
    ? [
        {
          etherscan,
          text,
          txHash: txDetails.txHash,
          type: isTxInProgress ? 'progress' : 'success',
        },
      ]
    : undefined
}

// SidebarSectionStatusProps
