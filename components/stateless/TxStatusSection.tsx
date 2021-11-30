import { TxState } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'

export interface TxStatusSectionProps {
  txState: TxState<AutomationBotAddTriggerData> | undefined
}

export function TxStatusSection(props: TxStatusSectionProps) {
  console.log(props)
  const isUndefined = props.txState === undefined
  return (
    <>
      {isUndefined ? (
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
