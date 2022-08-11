import { storiesOf } from '@storybook/react'
import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { interval } from 'rxjs'
import { first } from 'rxjs/operators'
import { Box, Button, Grid } from 'theme-ui'

import { HasGasEstimation } from '../../../../../helpers/form'
import { OpenPositionResult } from '../../../../aave'
import {
  machineConfig,
  openAaveParametersStateMachine,
  OpenAaveParametersStateMachineEvents,
} from './openAaveParametersStateMachine'

const stories = storiesOf('Xstate Machines/Sequence Machine for Opening AAVE Position', module)

function delay() {
  return interval(2000).pipe(first()).toPromise()
}

const machine = openAaveParametersStateMachine.withConfig({
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

const View = () => {
  const [state, send] = useMachine(machine, { devTools: true })
  const SendButton = (event: OpenAaveParametersStateMachineEvents) => (
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
            multiply={2}
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
