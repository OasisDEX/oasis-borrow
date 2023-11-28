import type BigNumber from 'bignumber.js'
import { actions, createMachine } from 'xstate'

const { assign } = actions

export type AutoBuyTriggerAaveEvent =
  | { type: 'SET_EXECUTION_TRIGGER_LTV'; executionTriggerLTV: number }
  | { type: 'SET_TARGET_TRIGGER_LTV'; targetTriggerLTV: number }
  | { type: 'SET_MAX_BUY_PRICE'; price?: BigNumber }
  | { type: 'SET_USE_MAX_BUY_PRICE'; enabled: boolean }
  | { type: 'SET_MAX_GAS_FEE'; maxGasFee: number }
  | { type: 'CURRENT_TRIGGER_RECEIVED'; currentTrigger: BigNumber }
  | { type: 'UPDATE_DEFAULT_VALUES'; defaults: AutoBuyFormDefaults }
  | { type: 'UPDATE_POSITION_VALUE'; position: PositionLike }
  | { type: 'RESET' }

export type AutoBuyFormDefaults = {
  executionTriggerLTV: number
  targetTriggerLTV: number
  minSliderValue: number
  maxSliderValue: number
  maxGasFee: number
}

export type PositionLike = {
  ltv: number
  collateral: {
    symbol: string
    amount: BigNumber
  }
  debt: {
    symbol: string
    amount: BigNumber
  }
}

export type AutoBuyTriggerAaveContext = {
  defaults: AutoBuyFormDefaults
  position?: PositionLike
  executionTriggerLTV?: number
  targetTriggerLTV?: number
  maxBuyPrice?: BigNumber
  useMaxBuyPrice: boolean
  maxGasFee: number
  currentTrigger?: BigNumber
}

export const autoBuyTriggerAaveStateMachine = createMachine(
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./autoBuyTriggerAaveStateMachine.typegen').Typegen0,
    schema: {
      context: {} as AutoBuyTriggerAaveContext,
      events: {} as AutoBuyTriggerAaveEvent,
    },
    context: {
      defaults: {
        minSliderValue: 0,
        maxSliderValue: 100,
        executionTriggerLTV: 0,
        targetTriggerLTV: 0,
        maxGasFee: 300,
      },
      maxGasFee: 300,
      useMaxBuyPrice: true,
    },
    preserveActionOrder: true,
    predictableActionArguments: true,
    entry: [],
    id: 'autoBuyTriggerAaveMachine',
    initial: 'idle',
    states: {
      idle: {
        entry: ['setDefaultValues'],
        on: {
          SET_EXECUTION_TRIGGER_LTV: {
            target: 'editing',
            actions: ['setExecutionTriggerLTV'],
          },
          SET_TARGET_TRIGGER_LTV: {
            target: 'editing',
            actions: ['setTargetTriggerLTV'],
          },
          SET_MAX_BUY_PRICE: {
            target: 'editing',
            actions: ['setMaxBuyPrice'],
          },
          SET_USE_MAX_BUY_PRICE: {
            target: 'editing',
            actions: ['setUseMaxBuyPrice'],
          },
          SET_MAX_GAS_FEE: {
            target: 'editing',
            actions: ['setMaxGasFee'],
          },
          UPDATE_DEFAULT_VALUES: {
            actions: ['updateDefaultValues', 'setDefaultValues'],
          },
        },
      },
      editing: {
        on: {
          RESET: {
            target: 'idle',
          },
          SET_EXECUTION_TRIGGER_LTV: {
            actions: ['setExecutionTriggerLTV'],
          },
          SET_TARGET_TRIGGER_LTV: {
            actions: ['setTargetTriggerLTV'],
          },
          SET_MAX_BUY_PRICE: {
            actions: ['setMaxBuyPrice'],
          },
          SET_USE_MAX_BUY_PRICE: {
            actions: ['setUseMaxBuyPrice'],
          },
          SET_MAX_GAS_FEE: {
            actions: ['setMaxGasFee'],
          },
        },
      },
    },
    on: {
      UPDATE_DEFAULT_VALUES: {
        actions: ['updateDefaultValues'],
      },
      UPDATE_POSITION_VALUE: {
        actions: ['updatePositionValue'],
      },
    },
  },
  {
    actions: {
      setDefaultValues: assign((context) => ({
        maxGasFee: 300,
        useMaxBuyPrice: true,
        executionTriggerLTV: context.defaults.executionTriggerLTV,
        targetTriggerLTV: context.defaults.targetTriggerLTV,
        minSliderValue: context.defaults.minSliderValue,
        maxSliderValue: context.defaults.maxSliderValue,
        maxBuyPrice: undefined,
      })),
      updateDefaultValues: assign((_, event) => ({
        defaults: event.defaults,
      })),
      updatePositionValue: assign((_, event) => ({
        position: event.position,
      })),
      setExecutionTriggerLTV: assign((_, event) => ({
        executionTriggerLTV: event.executionTriggerLTV,
      })),
      setTargetTriggerLTV: assign((_, event) => ({
        targetTriggerLTV: event.targetTriggerLTV,
      })),
      setMaxBuyPrice: assign((_, event) => ({
        maxBuyPrice: event.price,
      })),
      setUseMaxBuyPrice: assign((_, event) => ({
        useMaxBuyPrice: event.enabled,
      })),
      setMaxGasFee: assign((_, event) => ({
        maxGasFee: event.maxGasFee,
      })),
    },
  },
)
