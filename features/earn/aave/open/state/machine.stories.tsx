import { createProxyStateMachine, ProxyEvent } from '@oasis-borrow/proxy/state'
import { storiesOf } from '@storybook/react'
import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'

import { GasEstimationStatus, HasGasEstimation } from '../../../../../helpers/form'
import { preTransactionSequenceMachine } from '../../transaction/preTransactionSequenceMachine'
import { createOpenAaveStateMachine } from './machine'
import { services } from './services'
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

const openAaveServices: typeof services = {
  getProxyAddress: (() => {}) as any,
  getBalance: (() => {}) as any,
  createPosition: (() => {}) as any,
  initMachine: (() => {}) as any,
  getTransactionParameters: (() => {}) as any,
  invokeProxyMachine: () => proxyStateMachine,
  estimateGas: (() => {}) as any,
}

const openAaveStateMachine = createOpenAaveStateMachine(
  undefined as any,
  {} as any,
  {} as any,
  () => proxyStateMachine,
  {} as any,
  preTransactionSequenceMachine,
).withConfig({
  services: openAaveServices,
})

const Machine = () => {
  const [state, send] = useMachine(openAaveStateMachine, { devTools: true })
  const [, proxySend] = state.context.proxyStateMachine
    ? useMachine(state.context.proxyStateMachine, { devTools: true })
    : [undefined, undefined]
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
    </>
  )
}

stories.add('Simple Machine', () => <Machine />, {
  xstate: true,
  xstateInspectOptions: {
    url: 'https://statecharts.io/inspect',
  },
})
