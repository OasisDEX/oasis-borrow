import { TxState } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import React from 'react'

export interface TxStatusSectionProps {
  txState: TxState<AutomationBotAddTriggerData> | undefined
}

export function TxStatusSection(props: TxStatusSectionProps) {
  return (
    <>
      {!props.txState ? (
        <></>
      ) : (
        <p>
          Transaction is processing {(props.txState as any).txHash},{' '}
          {props.txState?.status.toString()}
        </p>
      )}
    </>
  )
}
