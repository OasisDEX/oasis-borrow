import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { progressStatuses } from '../../features/automation/common/consts/txStatues'
import { TxStatusCardProgress, TxStatusCardSuccess } from '../vault/TxStatusCard'

export interface TxStatusSectionProps<A extends TxMeta> {
  txState?: TxState<A>
  etherscan: string
}

export function TxStatusSection<A extends TxMeta>(props: TxStatusSectionProps<A>) {
  const { t } = useTranslation()

  if (props.txState) {
    const txStatus = props.txState.status
    const txHash =
      txStatus === TxStatus.Propagating ||
      txStatus === TxStatus.WaitingForConfirmation ||
      txStatus === TxStatus.Success
        ? props.txState.txHash
        : ''

    return (
      <>
        {txStatus && progressStatuses.includes(txStatus) && (
          <TxStatusCardProgress text={t('waiting-confirmation')} etherscan={''} txHash={txHash} />
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
