import { createProxyStateMachine, ProxyEvent } from '@oasis-borrow/proxy/state'
import { storiesOf } from '@storybook/react'
import { useActor, useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { interval } from 'rxjs'
import { first } from 'rxjs/operators'
import { Box, Button, Grid } from 'theme-ui'
import { ActorRefFrom } from 'xstate'

import { GasEstimationStatus, HasGasEstimation } from '../../../../../helpers/form'
import { OpenPositionResult } from '../../../../aave'
import { openAaveParametersStateMachine, OpenAaveParametersStateMachineType } from '../transaction'
import { machineConfig } from '../transaction/openAaveParametersStateMachine'
import { createOpenAaveStateMachine } from './machine'
import { OpenAaveStateMachineServices, services } from './services'
import { OpenAaveEvent } from './types'

const stories = storiesOf('Open Aave State Machine', module)

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

const openAaveServices: OpenAaveStateMachineServices = {
  [services.getProxyAddress]: (() => {}) as any,
  [services.getBalance]: (() => {}) as any,
  [services.createPosition]: (() => {}) as any,
  // [services.invokeGetTransactionParametersMachine]: () => parametersMachine,
  [services.invokeProxyMachine]: () => proxyStateMachine,
}

const openAaveStateMachine = createOpenAaveStateMachine
  .withConfig({
    services: openAaveServices,
  })
  .withContext({
    dependencies: {
      parametersStateMachine: parametersMachine.withContext({ hasParent: true }),
      proxyStateMachine: proxyStateMachine,
    },
    token: 'ETH',
    multiply: 2,
  })

const ActorView = ({
  parametersMachine,
}: {
  parametersMachine: ActorRefFrom<OpenAaveParametersStateMachineType>
}) => {
  const [state] = useActor(parametersMachine)

  return (
    <Box sx={{ width: '75%' }}>
      <Grid columns={2} gap={2}>
        <Box>Current State:</Box>
        <Box sx={{ fontWeight: '900' }}>{state.value}</Box>
      </Grid>
    </Box>
  )
}

const Machine = () => {
  const [state, send] = useMachine(openAaveStateMachine, { devTools: true })
  const [, proxySend] = useMachine(state.context.dependencies.proxyStateMachine, { devTools: true })

  const ProxyButton = (event: ProxyEvent) => (
    <Box
      sx={{
        width: '150px',
      }}
    >
      <Button onClick={() => proxySend && proxySend(event)}>{event.type}</Button>
    </Box>
  )
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
    <>
      <Grid columns={3} gap={2}>
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
      <Grid columns={3} gap={2}>
        <ProxyButton type={'GAS_COST_ESTIMATION'} gasData={hasGasEstimation} />
        <ProxyButton type={'START'} />
        <ProxyButton type={'IN_PROGRESS'} proxyTxHash={'0x00000'} />
        <ProxyButton type={'CONFIRMED'} proxyConfirmations={1} />
        <ProxyButton type={'SUCCESS'} proxyAddress={'0x000000'} />
        <ProxyButton type={'FAILURE'} txError={'Error'} />
        <ProxyButton type={'RETRY'} />
      </Grid>
      {state.context.refParametersStateMachine && (
        <ActorView parametersMachine={state.context.refParametersStateMachine} />
      )}
    </>
  )
}

stories.add('Simple Machine', () => <Machine />, {
  xstate: true,
  xstateInspectOptions: {
    url: 'https://statecharts.io/inspect',
  },
})
