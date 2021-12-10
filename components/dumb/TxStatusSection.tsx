import { TxMeta, TxState } from '@oasisdex/transactions'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { TxStatusCardProgress } from '../vault/TxStatusCard'

export interface TxStatusSectionProps<A extends TxMeta> {
  txState: TxState<A> | undefined
}

export function TxStatusSection<A extends TxMeta>(props: TxStatusSectionProps<A>) {
  const { t } = useTranslation()
  return (
    <>
      {!props.txState ? (
        <></>
      ) : (
        <TxStatusCardProgress
          text={t('waiting-confirmation')}
          etherscan={''}
          txHash={(props.txState as any).txHash}
        />
      )}
    </>
  )
}
