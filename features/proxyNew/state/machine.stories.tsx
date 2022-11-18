import { storiesOf } from '@storybook/react'
import { useMachine } from '@xstate/react'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'

import { GasEstimationStatus, HasGasEstimation } from '../../../helpers/form'
import { createProxyStateMachine } from './machine'
import { ProxyEvent } from './types'

const stories = storiesOf('Xstate Machines/Proxy State Machine', module)

const hasGasEstimation: HasGasEstimation = {
  gasEstimationStatus: GasEstimationStatus.calculated,
  gasEstimation: 10,
}

const getProxyStateMachine = createProxyStateMachine(
  undefined as any,
  undefined as any,
  undefined as any,
  undefined as any,
).withConfig({
  services: {
    estimateGas: (() => {}) as any,
    createProxy: (() => {}) as any,
  },
})

const Machine = () => {
  const [, send] = useMachine(getProxyStateMachine, { devTools: true })
  const Btn = (event: ProxyEvent) => (
    <Box
      sx={{
        width: '150px',
      }}
    >
      <Button onClick={() => send(event)}>{event.type}</Button>
    </Box>
  )
  return (
    <Grid columns={3} gap={2}>
      <Btn type={'GAS_COST_ESTIMATION'} gasData={hasGasEstimation} />
      <Btn type={'START'} />
      <Btn type={'IN_PROGRESS'} proxyTxHash={'0x00000'} />
      <Btn type={'CONFIRMED'} proxyConfirmations={1} />
      <Btn type={'SUCCESS'} proxyAddress={'0x000000'} />
      <Btn type={'FAILURE'} txError={'Error'} />
      <Btn type={'RETRY'} />
    </Grid>
  )
}

stories.add('Simple Machine', () => <Machine />, {
  xstate: true,
  xstateInspectOptions: {
    url: 'https://statecharts.io/inspect',
  },
})
