import type { IPosition } from '@oasisdex/dma-library'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { amountFromWei } from 'blockchain/utils'
import type { IStrategyConfig } from 'features/aave/types'
import type { ActorRefFrom } from 'xstate'
import { actions, createMachine, sendTo } from 'xstate'

import type { autoBuyTriggerAaveStateMachine, PositionLike } from './autoBuyTriggerAaveStateMachine'

const { assign } = actions

export type OptimizationAaveEvent =
  | { type: 'SHOW_AUTO_BUY' }
  | { type: 'POSITION_UPDATED'; position: IPosition }

export type OptimizationAaveContext = {
  readonly strategyConfig: IStrategyConfig
  readonly positionOwner: string
  position?: IPosition
  readonly dpm: UserDpmAccount
  currentView?: 'auto-buy' | undefined
  showAutoBuyBanner: boolean
  autoBuyTrigger: ActorRefFrom<typeof autoBuyTriggerAaveStateMachine>
}

function mapPositionToAutoBuyPosition({ position }: { position: IPosition }): PositionLike {
  return {
    ltv: position.riskRatio.loanToValue.times(100).toNumber(),
    collateral: {
      symbol: position.collateral.symbol,
      amount: amountFromWei(position.collateral.amount, position.collateral.precision),
    },
    debt: {
      symbol: position.debt.symbol,
      amount: amountFromWei(position.debt.amount, position.debt.precision),
    },
  }
}

export const optimizationAaveStateMachine = createMachine(
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./optimizationAaveStateMachine.typegen').Typegen0,
    schema: {
      context: {} as OptimizationAaveContext,
      events: {} as OptimizationAaveEvent,
    },
    preserveActionOrder: true,
    predictableActionArguments: true,
    entry: [],
    invoke: [],
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
          position: mapPositionToAutoBuyPosition(event),
        }),
      ),
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
  },
)

export type MigrateAaveStateMachine = typeof optimizationAaveStateMachine
