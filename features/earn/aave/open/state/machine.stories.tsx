import { TxMeta } from '@oasisdex/transactions'
import { storiesOf } from '@storybook/react'
import { useActor, useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { interval, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Box, Button, Grid } from 'theme-ui'
import { ActorRefFrom } from 'xstate'

import { ContextConnected } from '../../../../../blockchain/network'
import { protoTxHelpers } from '../../../../../components/AppContext'
import { GasEstimationStatus, HasGasEstimation } from '../../../../../helpers/form'
import { mockTxState } from '../../../../../helpers/mocks/txHelpers.mock'
import { OpenPositionResult } from '../../../../aave'
import { createProxyStateMachine, ProxyEvent, ProxyStateMachine } from '../../../../proxyNew/state'
import {
  createTransactionServices,
  createTransactionStateMachine,
  TransactionStateMachine,
} from '../../../../stateMachines/transaction'
import { openAavePosition, OpenAavePositionData } from '../pipelines/openAavePosition'
import { openAaveParametersStateMachine, OpenAaveParametersStateMachineType } from '../transaction'
import { machineConfig } from '../transaction/openAaveParametersStateMachine'
import { createOpenAaveStateMachine } from './machine'
import { OpenAaveStateMachineServices, services } from './services'
import { OpenAaveEvent } from './types'

const stories = storiesOf('Xstate Machines/Open Aave State Machine', module)

const hasGasEstimation: HasGasEstimation = {
  gasEstimationStatus: GasEstimationStatus.calculated,
  gasEstimation: 10,
}

const proxyStateMachine = createProxyStateMachine(
  undefined as any,
  undefined as any,
  undefined as any,
  10,
).withConfig({
  services: {
    estimateGas: (() => {}) as any,
    createProxy: (() => {}) as any,
  },
})

function delay() {
  return interval(2000).pipe(first()).toPromise()
}

const parametersMachine = openAaveParametersStateMachine.withConfig({
  services: {
    [machineConfig.services.getParameters]: async () => {
      await delay()
      return {} as OpenPositionResult
    },
    [machineConfig.services.estimateGas]: async () => {
      await delay()
      return 10
    },
    [machineConfig.services.estimateGasPrice]: async () => {
      await delay()
      return {} as HasGasEstimation
    },
  },
})

const mockContext$ = of(({ safeConfirmations: 10 } as any) as ContextConnected)
const mockTxHelpers$ = of({
  ...protoTxHelpers,
  sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
})

const transactionMachine = createTransactionStateMachine(openAavePosition, true).withConfig({
  services: {
    ...createTransactionServices<OpenAavePositionData>(mockTxHelpers$, mockContext$),
  },
})

const openAaveServices: OpenAaveStateMachineServices = {
  [services.getProxyAddress]: (() => {}) as any,
  [services.getBalance]: (() => {}) as any,
}

const openAaveStateMachine = createOpenAaveStateMachine
  .withConfig({
    services: openAaveServices,
  })
  .withContext({
    dependencies: {
      parametersStateMachine: parametersMachine.withContext({ hasParent: true }),
      proxyStateMachine: proxyStateMachine,
      transactionStateMachine: transactionMachine,
    },
    token: 'ETH',
    multiply: 2,
  })

const ParametersView = ({
  parametersMachine,
}: {
  parametersMachine: ActorRefFrom<OpenAaveParametersStateMachineType>
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
  transactionMachine: ActorRefFrom<TransactionStateMachine<OpenAavePositionData>>
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
          balance={new BigNumber(1000)}
          tokenPrice={new BigNumber(100)}
        />
        <OpenAaveButton type={'SET_AMOUNT'} amount={new BigNumber(100)} />
        <OpenAaveButton type={'PROXY_ADDRESS_RECEIVED'} proxyAddress={'0x00000'} />
        <OpenAaveButton type={'CREATE_PROXY'} />
        <OpenAaveButton type={'CONFIRM_DEPOSIT'} />
        <OpenAaveButton type={'START_CREATING_POSITION'} />
      </Grid>
      {state.context.refProxyStateMachine && (
        <ProxyView proxyStateMachine={state.context.refProxyStateMachine} />
      )}
      {state.context.refParametersStateMachine && (
        <ParametersView parametersMachine={state.context.refParametersStateMachine} />
      )}
      {state.context.refTransactionStateMachine && (
        <TransactionView transactionMachine={state.context.refTransactionStateMachine} />
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
