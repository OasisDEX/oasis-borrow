import { IPositionTransition } from '@oasisdex/oasis-actions'
import { storiesOf } from '@storybook/react'
import { useMachine } from '@xstate/react'
import React from 'react'
import { interval, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import { Button, Grid } from 'theme-ui'
import { mock } from 'ts-mockito'

import { TxHelpers } from '../../../components/AppContext'
import { HasGasEstimation } from '../../../helpers/form'
import {
  BaseTransactionParameters,
  createTransactionParametersStateMachine,
  LibraryCallReturn,
} from './transactionParametersStateMachine'

const stories = storiesOf('Xstate Machines/Transaction Parameters (Libarary calls)', module)

interface MockParameters extends BaseTransactionParameters {}
async function libraryCall(parameters: MockParameters): Promise<LibraryCallReturn> {
  if (parameters === undefined) {
    throw new Error('parameters is undefined')
  }

  return {
    strategy: mock<IPositionTransition>(),
    operationName: 'mockOperationName',
  }
}

const txHelpers$: Observable<TxHelpers> = of({
  ...mock<TxHelpers>(),
  estimateGas: () => of(100000),
})

function gasPriceEstimation$() {
  return interval(1000).pipe(map(() => mock<HasGasEstimation>()))
}

const machine = createTransactionParametersStateMachine(
  txHelpers$,
  gasPriceEstimation$,
  libraryCall,
)

const Machine = () => {
  const [, send] = useMachine(machine, { devTools: true })

  return (
    <Grid columns={1} gap={10} sx={{ width: '75%' }}>
      <Button onClick={() => send({ type: 'VARIABLES_RECEIVED', parameters: mock() })}>
        SEND PARAMETERS
      </Button>
    </Grid>
  )
}

stories.add('Simple Machine', () => <Machine />, {
  xstate: true,
  xstateInspectOptions: {
    url: 'https://statecharts.io/inspect',
  },
})
