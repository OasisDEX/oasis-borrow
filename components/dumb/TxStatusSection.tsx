import { TxStatus } from '@oasisdex/transactions'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { progressStatuses } from '../../features/automation/common/txStatues'
import { TxStatusCardProgress, TxStatusCardSuccess } from '../vault/TxStatusCard'

export interface TxStatusSectionProps {
  txStatus?: TxStatus
  etherscan: string
  txHash: string | undefined
}

export function TxStatusSection(props: TxStatusSectionProps) {
  const { t } = useTranslation()

  if (props.txStatus) {
    const txStatus = props.txStatus
    const txHash =
      txStatus === TxStatus.Propagating ||
      txStatus === TxStatus.WaitingForConfirmation ||
      txStatus === TxStatus.Success
        ? props.txHash
        : ''

    return (
      <>
        {txStatus && txHash && progressStatuses.includes(txStatus) && (
          <TxStatusCardProgress
            text={t('waiting-confirmation')}
            etherscan={props.etherscan}
            txHash={txHash}
          />
        )}
        {txStatus === TxStatus.Success && txHash && (
          <TxStatusCardSuccess
            text={t('vault-changed')}
            etherscan={props.etherscan}
            txHash={txHash}
          />
        )}
      </>
    )
  }

  return null
}
