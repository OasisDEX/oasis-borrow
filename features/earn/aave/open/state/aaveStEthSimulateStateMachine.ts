import { IRiskRatio } from '@oasisdex/oasis-actions'
import { trackingEvents } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { assign, createMachine } from 'xstate'
import { log } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

import { AaveStEthYieldsResponse, CalculateSimulationResult } from '../services'

interface AaveStEthSimulateStateMachineContext {
  yieldsMin?: AaveStEthYieldsResponse
  yieldsMax?: AaveStEthYieldsResponse
  token?: string
  amount?: BigNumber
  riskRatio?: IRiskRatio
  riskRatioMax?: IRiskRatio
  transactionFee?: BigNumber
  fee?: BigNumber
  simulation?: CalculateSimulationResult
}

export type AaveStEthSimulateStateMachineEvents =
  | {
      type: 'USER_PARAMETERS_CHANGED'
      token: string
      amount: BigNumber
      riskRatio: IRiskRatio
    }
  | { type: 'FEE_CHANGED'; fee: BigNumber }

export const aaveStEthSimulateStateMachine = createMachine(
  {
    predictableActionArguments: true,
    tsTypes: {} as import('./aaveStEthSimulateStateMachine.typegen').Typegen0,
    key: 'aaveStEthSimulate',
    initial: 'loading',
    context: {},
    schema: {
      context: {} as AaveStEthSimulateStateMachineContext,
      services: {} as {
        getYields: {
          data: {
            yieldsMin: AaveStEthYieldsResponse
            yieldsMax: AaveStEthYieldsResponse
          }
        }
        calculate: {
          data: CalculateSimulationResult
        }
      },
      events: {} as AaveStEthSimulateStateMachineEvents,
    },
    states: {
      idle: {},
      loading: {
        invoke: {
          src: 'getYields',
          id: 'getYields',
          onDone: {
            actions: ['assignYields'],
            target: 'calculating',
          },
          onError: {
            actions: ['logError'],
          },
        },
        on: {
          USER_PARAMETERS_CHANGED: {
            actions: ['assignUserParameters'],
            target: 'loading',
          },
          FEE_CHANGED: {
            actions: ['assignFees'],
          },
        },
      },
      calculating: {
        invoke: {
          src: 'calculate',
          id: 'calculate',
          onDone: {
            target: 'idle',
            actions: ['assignResult'],
          },
        },
      },
    },
    on: {
      USER_PARAMETERS_CHANGED: {
        target: 'loading',
        actions: ['assignUserParameters'],
      },
      FEE_CHANGED: {
        target: 'calculating',
        actions: ['assignFees'],
      },
    },
  },
  {
    actions: {
      assignYields: assign((context, event) => ({
        yieldsMin: event.data.yieldsMin,
        yieldsMax: event.data.yieldsMax,
      })),
      assignUserParameters: assign((context, event) => {
        // reporting the event here ensures that the data is
        // final(-ish) - for example when inputting '123' it
        // sends '123' and not '1', '12', and '123'
        context.amount !== event.amount &&
          event.amount &&
          trackingEvents.earn.stETHOpenPositionDepositAmount(event.amount)

        event.amount &&
          context.riskRatio !== event.riskRatio &&
          trackingEvents.earn.stETHOpenPositionMoveSlider(
            event.amount!,
            event.riskRatio!.loanToValue,
          )
        return {
          token: event.token,
          amount: event.amount,
          riskRatio: event.riskRatio,
        }
      }),
      assignFees: assign((context, event) => ({
        fee: event.fee,
      })),
      assignResult: assign((context, event) => ({ simulation: event.data })),
      logError: log((context, event) => event.data),
    },
  },
)

class AaveStEthSimulateStateMachineTypes {
  needsConfiguration() {
    return aaveStEthSimulateStateMachine
  }
  withConfig() {
    // @ts-ignore
    return aaveStEthSimulateStateMachine.withConfig({})
  }
}

export type AaveStEthSimulateStateMachineWithoutConfiguration = ReturnType<
  AaveStEthSimulateStateMachineTypes['needsConfiguration']
>
export type AaveStEthSimulateStateMachine = ReturnType<
  AaveStEthSimulateStateMachineTypes['withConfig']
>
export type AaveStEthSimulateStateMachineServices = MachineOptionsFrom<
  AaveStEthSimulateStateMachineWithoutConfiguration,
  true
>['services']
