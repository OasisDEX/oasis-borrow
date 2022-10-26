import { IStrategy, RiskRatio } from '@oasisdex/oasis-actions'
import { storiesOf } from '@storybook/react'
import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { interval } from 'rxjs'
import { first } from 'rxjs/operators'
import { Box, Button, Grid } from 'theme-ui'

import { HasGasEstimation } from '../../../../helpers/form'
import {
  createParametersStateMachine,
  ParametersStateMachineEvents,
} from './parametersStateMachine'

const stories = storiesOf('Xstate Machines/Sequence Machine for Opening AAVE Position', module)

function delay() {
  return interval(2000).pipe(first()).toPromise()
}

const machine = createParametersStateMachine.withConfig({
  actions: {
    assignEstimatedGas: () => {},
    assignReceivedParameters: () => {},
    logError: () => {},
    assignEstimatedGasPrice: () => {},
    notifyParent: () => {},
    assignTransactionParameters: () => {},
  },
  services: {
    estimateGas: async () => {
      await delay()
      return 10
    },
    getParameters: async () => {
      await delay()
      return {} as IStrategy
    },
    estimateGasPrice: async () => {
      await delay()
      return {} as HasGasEstimation
    },
  },
})

const View = () => {
  const [state, send] = useMachine(machine, { devTools: true })
  const SendButton = (event: ParametersStateMachineEvents) => (
    <Box
      sx={{
        width: '150px',
      }}
    >
      <Button onClick={() => send(event)}>{event.type}</Button>
    </Box>
  )

  return (
    <Box sx={{ width: '75%' }}>
      <Grid columns={2} gap={2}>
        <Box>Current State:</Box>
        <Box sx={{ fontWeight: '900' }}>{state.value}</Box>
        <Box>Send Variables To Machine:</Box>
        <Box>
          <SendButton
            type={'VARIABLES_RECEIVED'}
            amount={new BigNumber(100)}
            riskRatio={new RiskRatio(new BigNumber(2), RiskRatio.TYPE.MULITPLE)}
            token={'ETH'}
          />{' '}
        </Box>
      </Grid>
    </Box>
  )
}

stories.add('Simple Machine', () => <View />, {
  xstate: true,
  xstateInspectOptions: {
    url: 'https://statecharts.io/inspect',
  },
})
