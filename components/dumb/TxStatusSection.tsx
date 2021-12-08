import { TxState } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import React from 'react'

import { TxStatusCardProgress } from '../vault/TxStatusCard'

//TODO: Decouple by using generics
export interface TxStatusSectionProps {
  txState: TxState<AutomationBotAddTriggerData> | undefined
}

export function TxStatusSection(props: TxStatusSectionProps) {
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
