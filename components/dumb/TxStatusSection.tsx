import { TxMeta, TxState } from '@oasisdex/transactions'
import React from 'react'

import { TxStatusCardProgress } from '../vault/TxStatusCard'

export interface TxStatusSectionProps<A extends TxMeta> {
  txState: TxState<A> | undefined
}

export function TxStatusSection<A extends TxMeta>(props: TxStatusSectionProps<A>) {
  return (
    <>
      {!props.txState ? (
        <></>
      ) : (
        <TxStatusCardProgress
          text={`Transaction is processing ${props.txState?.status.toString()}`}
          etherscan={''}
          txHash={(props.txState as any).txHash}
        />
      )}
    </>
  )
}
