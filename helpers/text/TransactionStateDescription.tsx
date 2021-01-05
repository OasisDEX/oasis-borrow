import * as React from 'react'

import { Timer } from '../../components/Timer'
import { ProgressStage } from '../form'

export const TransactionStateDescription = ({ progress }: { progress: ProgressStage } | any) => {
  return (
    <span>
      {progress === ProgressStage.waitingForApproval && 'Sign on Client'}
      {progress === ProgressStage.waitingForConfirmation && (
        <span>
          Unconfirmed <Timer start={new Date()} />
        </span>
      )}
      {progress === ProgressStage.done && 'Confirmed'}
      {progress === ProgressStage.canceled && 'Cancelled'}
      {progress === ProgressStage.fiasco && 'Failure'}
    </span>
  )
}
