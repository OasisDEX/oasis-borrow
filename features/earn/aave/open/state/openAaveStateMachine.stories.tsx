import { IStrategy } from '@oasisdex/oasis-actions'
import { TxMeta } from '@oasisdex/transactions'
import { storiesOf } from '@storybook/react'
import { useActor, useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import React from 'react'
import { interval, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Box, Button, Grid } from 'theme-ui'
import { ActorRefFrom, assign, sendParent, spawn } from 'xstate'

import {
  callOperationExecutor,
  OperationExecutorTxMeta,
} from '../../../../../blockchain/calls/operationExecutor'
import { ContextConnected } from '../../../../../blockchain/network'
import { protoTxHelpers } from '../../../../../components/AppContext'
import { GasEstimationStatus, HasGasEstimation } from '../../../../../helpers/form'
import { mockTxState } from '../../../../../helpers/mocks/txHelpers.mock'
import {
  createProxyStateMachine,
  ProxyContext,
  ProxyEvent,
  ProxyStateMachine,
} from '../../../../proxyNew/state'
import {
  createTransactionStateMachine,
  startTransactionService,
  TransactionStateMachine,
} from '../../../../stateMachines/transaction'
import { contextToTransactionParameters } from '../services'
import { aaveStEthSimulateStateMachine } from './aaveStEthSimulateStateMachine'
import { createOpenAaveStateMachine, OpenAaveEvent } from './openAaveStateMachine'
import { createParametersStateMachine, ParametersStateMachine } from './parametersStateMachine'

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

const parametersMachine = createParametersStateMachine.withConfig({
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

const mockContext$ = of(({ safeConfirmations: 10 } as any) as ContextConnected)
const mockTxHelpers$ = of({
  ...protoTxHelpers,
  sendWithGasEstimation: <B extends TxMeta>(_proxy: any, meta: B) => mockTxState(meta),
})

const transactionMachine = createTransactionStateMachine(callOperationExecutor).withConfig({
  actions: {
    notifyParent: () => {},
    raiseError: () => {},
  },
  services: {
    startTransaction: startTransactionService(mockTxHelpers$, mockContext$),
  },
})

const simulationMachine = aaveStEthSimulateStateMachine.withConfig({
  actions: {},
  services: {
    getYields: async () => {
      return {} as any
    },
    calculate: async () => {
      return {} as any
    },
  },
})

const openAaveStateMachine = createOpenAaveStateMachine.withConfig({
  actions: {
    spawnSimulationMachine: assign((_) => ({
      refSimulationMachine: spawn(simulationMachine, { name: 'simulationMachine' }),
    })),
    spawnParametersMachine: assign((_) => ({
      refParametersStateMachine: spawn(
        parametersMachine.withConfig({
          actions: {
            notifyParent: sendParent(
              (context): OpenAaveEvent => ({
                type: 'TRANSACTION_PARAMETERS_RECEIVED',
                parameters: context.transactionParameters!,
                estimatedGasPrice: context.gasPriceEstimation!,
              }),
            ),
          },
        }),
        { name: 'parametersMachine' },
      ),
    })),
    spawnProxyMachine: assign((_) => ({
      refProxyMachine: spawn(
        proxyStateMachine.withConfig({
          actions: {
            raiseSuccess: sendParent(
              (context: ProxyContext): OpenAaveEvent => ({
                type: 'PROXY_CREATED',
                proxyAddress: context.proxyAddress!,
              }),
            ),
          },
        }),
        { name: 'proxyMachine' },
      ),
    })),
    spawnTransactionMachine: assign((context) => ({
      refTransactionMachine: spawn(
        transactionMachine
          .withConfig({
            actions: {
              notifyParent: sendParent(
                (_): OpenAaveEvent => ({
                  type: 'POSITION_OPENED',
                }),
              ),
            },
          })
          .withContext({
            ...transactionMachine.context,
            transactionParameters: contextToTransactionParameters(context),
          }),
        {
          name: 'transactionMachine',
        },
      ),
    })),
  },
  services: {
    getBalance: (() => {}) as any,
    getProxyAddress: (() => {}) as any,
    getStrategyInfo: (() => {}) as any,
    getHasOtherAssets: (() => {}) as any,
  },
})

const ParametersView = ({
  parametersMachine,
}: {
  parametersMachine: ActorRefFrom<ParametersStateMachine>
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
          balance={new BigNumber(1000)}
          tokenPrice={new BigNumber(100)}
        />
        <OpenAaveButton type={'SET_AMOUNT'} amount={new BigNumber(100)} />
        <OpenAaveButton type={'PROXY_ADDRESS_RECEIVED'} proxyAddress={'0x00000'} />
        <OpenAaveButton type={'NEXT_STEP'} />
      </Grid>
      {state.context.refProxyMachine && (
        <ProxyView proxyStateMachine={state.context.refProxyMachine} />
      )}
      {state.context.refParametersStateMachine && (
        <ParametersView parametersMachine={state.context.refParametersStateMachine} />
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
