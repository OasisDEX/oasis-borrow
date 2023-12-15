import type { AaveLikePosition } from '@oasisdex/dma-library'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { amountFromWei } from 'blockchain/utils'
import type { IStrategyConfig } from 'features/aave/types'
import type { GetTriggersResponse } from 'helpers/triggers'
import { getTriggersRequest } from 'helpers/triggers'
import type { ActorRefFrom } from 'xstate'
import { actions, createMachine, sendTo } from 'xstate'

import type { autoBuyTriggerAaveStateMachine, PositionLike } from './autoBuyTriggerAaveStateMachine'

const { assign } = actions

export type OptimizationAaveEvent =
  | { type: 'SHOW_AUTO_BUY' }
  | { type: 'POSITION_UPDATED'; position: AaveLikePosition }
  | { type: 'TRIGGERS_UPDATED'; currentTriggers: GetTriggersResponse }

export type OptimizationAaveContext = {
  readonly strategyConfig: IStrategyConfig
  readonly positionOwner: string
  position?: AaveLikePosition
  readonly dpm: UserDpmAccount
  currentView?: 'auto-buy' | undefined
  showAutoBuyBanner: boolean
  currentTriggers: GetTriggersResponse
  autoBuyTrigger: ActorRefFrom<typeof autoBuyTriggerAaveStateMachine>
}

function mapPositionToAutoBuyPosition({
  position,
  dpm,
}: {
  position: AaveLikePosition
  dpm: UserDpmAccount
}): PositionLike {
  return {
    ltv: position.riskRatio.loanToValue.times(100).toNumber(),
    collateral: {
      token: {
        symbol: position.collateral.symbol,
        address: position.collateral.address,
        decimals: position.collateral.precision,
      },
      amount: amountFromWei(position.collateral.amount, position.collateral.precision),
    },
    debt: {
      token: {
        symbol: position.debt.symbol,
        address: position.debt.address,
        decimals: position.debt.precision,
      },
      amount: amountFromWei(position.debt.amount, position.debt.precision),
    },
    dpm: dpm.proxy,
  }
}

export const optimizationAaveStateMachine = createMachine(
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./optimizationAaveStateMachine.typegen').Typegen0,
    schema: {
      context: {} as OptimizationAaveContext,
      events: {} as OptimizationAaveEvent,
      services: {} as {
        getTriggers: {
          data: GetTriggersResponse
        }
      },
    },
    preserveActionOrder: true,
    predictableActionArguments: true,
    entry: [],
    invoke: [
      {
        src: 'getTriggers',
        id: 'getTriggers',
        onDone: {
          actions: ['updateTriggers'],
        },
      },
    ],
    id: 'optimizationAaveMachine',
    initial: 'idle',
    states: {
      idle: {
        on: {
          SHOW_AUTO_BUY: {
            actions: ['setAutoBuyView'],
          },
        },
      },
      dpm: {
        on: {},
        exit: [],
      },
      migration: {
        on: {},
      },
      success: {
        type: 'final',
      },
      failure: {
        on: {},
      },
    },
    on: {
      POSITION_UPDATED: {
        actions: ['updatePosition', 'updateAutoBuyPosition', 'updateAutoBuyDefaults'],
      },
    },
  },
  {
    guards: {},
    actions: {
      setAutoBuyView: assign(() => ({
        currentView: 'auto-buy' as const,
        showAutoBuyBanner: false,
      })),
      updatePosition: assign((context, event) => ({
        position: event.position,
      })),
      updateAutoBuyPosition: sendTo(
        (context) => {
          return context.autoBuyTrigger
        },
        (context, event) => ({
          type: 'UPDATE_POSITION_VALUE',
          position: mapPositionToAutoBuyPosition({ ...event, ...context }),
        }),
      ),
      updateTriggers: assign((context, event) => ({
        currentTriggers: event.data,
      })),
      updateAutoBuyDefaults: sendTo(
        (context) => {
          return context.autoBuyTrigger
        },
        (context, event) => {
          const ltv = parseInt(event.position.riskRatio.loanToValue.times(100).toFixed(2))
          const maxLtv = parseInt(event.position.category.maxLoanToValue.times(100).toFixed(2))
          return {
            type: 'UPDATE_DEFAULT_VALUES',
            defaults: {
              executionTriggerLTV: ltv - 5,
              targetTriggerLTV: ltv,
              minSliderValue: 1,
              maxSliderValue: maxLtv,
              maxGasFee: 300,
            },
          }
        },
      ),
    },
    services: {
      getTriggers: async (context) => {
        const { dpm, strategyConfig } = context
        return await getTriggersRequest({ dpm, networkId: strategyConfig.networkId })
      },
    },
  },
)

export type MigrateAaveStateMachine = typeof optimizationAaveStateMachine
