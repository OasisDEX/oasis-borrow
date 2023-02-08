import { storiesOf } from '@storybook/react'
import { useActor, useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'
import { ActorRefFrom } from 'xstate'

import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { GasEstimationStatus, HasGasEstimation } from '../../../../helpers/form'
import { ProxyEvent, ProxyStateMachine } from '../../../stateMachines/proxy/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import { OpenAaveParameters } from '../../oasisActionsLibWrapper'
import {
  createOpenAaveStateMachine,
  OpenAaveEvent,
  OpenAaveStateMachineServices,
} from './openAaveStateMachine'

const stories = storiesOf('Xstate Machines/Open Aave State Machine', module)

const emptyObject = {} as any

const hasGasEstimation: HasGasEstimation = {
  gasEstimationStatus: GasEstimationStatus.calculated,
  gasEstimation: 10,
}

const openAaveStateMachine = createOpenAaveStateMachine(
  emptyObject,
  emptyObject,
  emptyObject,
  emptyObject,
  emptyObject,
  emptyObject,
).withConfig({
  services: {
    ...({} as OpenAaveStateMachineServices),
  },
})

const ParametersView = ({
  parametersMachine,
}: {
  parametersMachine: ActorRefFrom<TransactionParametersStateMachine<OpenAaveParameters>>
}) => {
  const [state] = useActor(parametersMachine)

  return (
    <Box>
      <Grid columns={3} gap={10}>
        <Box>PARAMETERS MACHINE:</Box>
        <Box>Current State:</Box>
        <Box sx={{ fontWeight: '900' }}>{state.value}</Box>
      </Grid>
    </Box>
  )
}

const TransactionView = ({
  transactionMachine,
}: {
  transactionMachine: ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
}) => {
  const [state] = useActor(transactionMachine)

  return (
    <Box>
      <Grid columns={3} gap={10}>
        <Box>TRANSACTION MACHINE:</Box>
        <Box>Current State:</Box>
        <Box sx={{ fontWeight: '900' }}>{state.value}</Box>
      </Grid>
    </Box>
  )
}

const ProxyView = ({
  proxyStateMachine,
}: {
  proxyStateMachine: ActorRefFrom<ProxyStateMachine>
}) => {
  const [state, send] = useActor(proxyStateMachine)

  const ProxyButton = (event: ProxyEvent) => (
    <Box
      sx={{
        width: '150px',
      }}
    >
      <Button onClick={() => send(event)}>{event.type}</Button>
    </Box>
  )

  return (
    <Box>
      <Grid columns={3} gap={10}>
        <Box>PROXY MACHINE:</Box>
        <Box>Current State:</Box>
        <Box sx={{ fontWeight: '900' }}>{state.value}</Box>
        <ProxyButton type={'GAS_COST_ESTIMATION'} gasData={hasGasEstimation} />
        <ProxyButton type={'START'} />
        <ProxyButton type={'IN_PROGRESS'} proxyTxHash={'0x00000'} />
        <ProxyButton type={'CONFIRMED'} proxyConfirmations={1} />
        <ProxyButton type={'SUCCESS'} proxyAddress={'0x000000'} />
        <ProxyButton type={'FAILURE'} txError={'Error'} />
        <ProxyButton type={'RETRY'} />
      </Grid>
    </Box>
  )
}

const Machine = () => {
  const [state, send] = useMachine(openAaveStateMachine, { devTools: true })

  const OpenAaveButton = (event: OpenAaveEvent) => (
    <Box
      sx={{
        width: '150px',
      }}
    >
      <Button onClick={() => send(event)}>{event.type}</Button>
    </Box>
  )
  return (
    <Grid columns={1} gap={10} sx={{ width: '75%' }}>
      <Grid columns={3} gap={10}>
        <OpenAaveButton
          type={'SET_BALANCE'}
          balance={{
            collateral: { price: new BigNumber(1.5), balance: new BigNumber(100) },
            debt: { price: new BigNumber(1.5), balance: new BigNumber(100) },
            deposit: { price: new BigNumber(1.5), balance: new BigNumber(100) },
          }}
        />
        <OpenAaveButton type={'SET_AMOUNT'} amount={new BigNumber(100)} />
        <OpenAaveButton
          type={'CONNECTED_PROXY_ADDRESS_RECEIVED'}
          connectedProxyAddress={'0x00000'}
        />
        <OpenAaveButton type={'NEXT_STEP'} />
      </Grid>
      {state.context.refProxyMachine && (
        <ProxyView proxyStateMachine={state.context.refProxyMachine} />
      )}
      {state.context.refParametersMachine && (
        <ParametersView parametersMachine={state.context.refParametersMachine} />
      )}
      {state.context.refTransactionMachine && (
        <TransactionView transactionMachine={state.context.refTransactionMachine} />
      )}
    </Grid>
  )
}

stories.add('Simple Machine', () => <Machine />, {
  xstate: true,
  xstateInspectOptions: {
    url: 'https://statecharts.io/inspect',
  },
})
