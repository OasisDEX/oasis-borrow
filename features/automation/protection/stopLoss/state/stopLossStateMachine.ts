import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationContext } from 'components/AutomationContextProvider'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { errorsStopLossValidation } from 'features/automation/protection/stopLoss/validators'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { TxError } from 'helpers/types'
import { assign, createMachine } from 'xstate'

function canSubmit(context: StopLossStateMachineContext) {
  const errors = errorsStopLossValidation({
    txError: context.txDetails?.txError,
    debt: context.commonData.debt,
    stopLossLevel: context.triggerLevel,
    autoBuyTriggerData: context.automationContext.autoBuyTriggerData,
  })
  return errors.length === 0
}

function txSucceed(context: StopLossStateMachineContext) {
  return context.txDetails?.txStatus === TxStatus.Success
}

export type TxDetails = {
  txStatus?: TxStatus
  txError?: TxError
  txHash?: string
  txCost?: BigNumber
}
interface CommonData {
  debt: BigNumber
}

export interface StopLossStateMachineContext {
  // automationContext & commonData most likely should be injected somehow
  automationContext: AutomationContext
  commonData: CommonData
  triggerLevel: BigNumber
  closeTo: CloseVaultTo
  currentForm: AutomationFormType
  txDetails: TxDetails
}

export const stopLossStateMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUAuB7ADgGXbWAdAGboBOAtmgIYwDEANulRAIICuG5VqAlugHYARblQDaABgC6iUJjw9eAmSAAeiAMwAmcQQCc63boDs+owFYjAFksA2ADQgAnojOX1BAIzHxxzbo82AWYAvsEOaFi4+MRklKg0YLSwbABG5AoS0kggcrAKfPzKagg2AByanqVGVR5mFn6lHg7OCJpGHgSlNuIe7YZlHqXqoeEYOHiEJBTUdADGjLBgACroAMIAFlT8MJnKuflK2cVaZgSWHoPWZppePpbNiAC0HuqnuuXqXUPiZuLiNiMQBFxtEpnEErRSHAwKhdtl9opCkcNJpTppSo0bK8jOJNJYzPYnE9LKU9B50SSXqj9KVdIDgVFJrEZolYPQeBAwKQNlsdlI9vJEUUUUYziYbJZxEZNHjzA8EJ8CCY7mUjJ9zrZ6WNGTFpvE6LAAO4KWbrABisThskFBWFCs0Nk8+NxXXUrwltXl5MsSq0OJJll0FnU4mGYSB2omuvBdEYzFW6HI5AEwniVpyNsOoGOmnclnM0tKFhJ1LM8vxaMDMrqeLK4ksWsiUdQKgAkvwAAqkdBQKH4WgtgCipG7pHTCNtyIQRnMYtsDqDHnEpXxXrMeaGZSLNmqEqMAPDDObbc73d7cFgtDYmAg3GWKkEMKoPHosHHmaR2cQS-xBHR9fUHddDaLwjHLGVPA8Cshi6G590bEFCBbdsux7PtL2SWZZgvd88iFKcLiGAhAPKADgJ3UN5RAzpunJQtzi8F4EJ1ZDTzQi8GCYVgOETbgClTMR+XhD87XeH1bHaGwQMCf5dHlMwLgIGwsTcExrnrVwD1GJtohbZA2CwjiUioWYAGsVgtChcIOT9VEQLpHSxXRbCDco1Wc+Vnl-IZXD+dRAwMXxQnDfh0E5eBsiPUFmX1MABTwycvwQFzPDMFd-gUtV1Cgqj2k6fNyX+AqXn85jjxQs90Pimy7SXZcCFDF43ClKTJTkolWjyld2m0PcLjdBtD0jXSVH0wz8Gq-CkqgwD8tcINgxlMpco6brCr6krBu0xDJsSuzOoqfRDBMdQC2sQkWkeXMfRMWlenKXNzGC4IgA */
  createMachine(
    {
      tsTypes: {} as import('./stopLossStateMachine.typegen').Typegen0,
      schema: {
        context: {} as StopLossStateMachineContext,
        services: {} as {
          getTriggerData: {
            data: AutomationContext
          }
        },
        events: {} as
          | { type: 'submit' }
          | { type: 'sliderChange'; value: BigNumber }
          | { type: 'closeToChange'; value: CloseVaultTo }
          | { type: 'switchForm'; value: 'add' | 'remove' }
          | { type: 'reset' }
          | { type: 'backToForm' }
          | { type: 'success' }
          | { type: 'retry' }
          | { type: 'txError' }
          | { type: 'loadAutomationData'; data: AutomationContext }
          | { type: 'loadCommonData'; data: CommonData }
          | { type: 'updateTxDetails'; value: TxDetails },
      },
      predictableActionArguments: true,
      initial: 'formStage',
      states: {
        formStage: {
          on: {
            loadAutomationData: {
              actions: 'assignAutomationContext',
            },
            submit: {
              target: 'txInProgress',
              cond: 'canSubmit',
            },
            closeToChange: {
              actions: 'assignCloseTo',
            },
            reset: {
              actions: 'assignDefaults',
            },
            sliderChange: {
              actions: 'assignTriggerLevel',
            },
            switchForm: {
              actions: 'assignCurrentForm',
            },
            loadCommonData: {
              actions: 'assignCommonData',
            },
          },
        },
        txInProgress: {
          on: {
            txError: {
              target: 'formStage',
            },
            success: {
              target: 'txSuccess',
              cond: 'txSucceed',
            },
            loadAutomationData: {
              actions: 'assignAutomationContext',
            },
            updateTxDetails: {
              actions: 'assignTxDetails',
            },
          },
        },
        txSuccess: {
          on: {
            backToForm: {
              target: 'formStage',
            },
          },
        },
      },
      id: 'StopLoss',
    },
    {
      actions: {
        assignAutomationContext: assign((_, event) => ({
          automationContext: event.data,
          triggerLevel: event.data.stopLossTriggerData.stopLossLevel,
          closeTo: (event.data.stopLossTriggerData.isToCollateral
            ? 'collateral'
            : 'dai') as CloseVaultTo,
          currentForm: 'add' as AutomationFormType,
        })),
        assignCommonData: assign((_, event) => ({
          commonData: event.data,
        })),
        assignCloseTo: assign((_, event) => ({
          closeTo: event.value,
        })),
        assignTriggerLevel: assign((_, event) => ({
          triggerLevel: event.value,
        })),
        assignDefaults: assign((context) => ({
          triggerLevel: context.automationContext.stopLossTriggerData.stopLossLevel,
          closeTo: (context.automationContext.stopLossTriggerData.isToCollateral
            ? 'collateral'
            : 'dai') as CloseVaultTo,
          currentForm: 'add' as AutomationFormType,
        })),
        assignCurrentForm: assign((_, event) => ({
          currentForm: event.value,
        })),
        assignTxDetails: assign((_, event) => ({
          txDetails: event.value,
        })),
      },
      guards: {
        canSubmit,
        txSucceed,
      },
    },
  )

export type StopLossStateMachine = typeof stopLossStateMachine
