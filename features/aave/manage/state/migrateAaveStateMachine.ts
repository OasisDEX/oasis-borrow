import type { AaveLikePosition, IPosition, Strategy } from '@oasisdex/dma-library-migration'
import type { MigrateAaveLikeParameters } from 'actions/aave-like'
import type BigNumber from 'bignumber.js'
import type { Context, ContextConnected } from 'blockchain/network.types'
import { ethNullAddress } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { IStrategyConfig, RefTransactionMachine, ReserveData } from 'features/aave/types'
import type {
  AllowanceStateMachine,
  AllowanceStateMachineResponseEvent,
} from 'features/stateMachines/allowance'
import type { createDPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import type {
  DMPAccountStateMachineResultEvents,
  DPMAccountStateMachine,
} from 'features/stateMachines/dpmAccount/'
import type { TransactionStateMachineResultEvents } from 'features/stateMachines/transaction'
import type {
  TransactionParametersV2StateMachine,
  TransactionParametersV2StateMachineResponseEvent,
} from 'features/stateMachines/transactionParameters'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { allDefined } from 'helpers/allDefined'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import type { ActorRefFrom } from 'xstate'
import { assign, createMachine, sendTo, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import type { MachineOptionsFrom } from 'xstate/lib/types'

export const totalStepsMap = {
  base: 2,
  proxySteps: (needCreateProxy: boolean) => (needCreateProxy ? 2 : 0),
  allowanceSteps: (needAllowance: boolean) => (needAllowance ? 1 : 0),
}

export interface MigrateAaveContext {
  refDpmAccountMachine?: ActorRefFrom<ReturnType<typeof createDPMAccountStateMachine>>
  refTransactionMachine?: RefTransactionMachine
  refParametersMachine?: ActorRefFrom<
    TransactionParametersV2StateMachine<MigrateAaveLikeParameters>
  >
  strategyConfig: IStrategyConfig
  positionOwner: string
  currentPosition?: AaveLikePosition

  currentStep: number
  totalSteps: number

  strategy?: Strategy<IPosition>
  estimatedGasPrice?: HasGasEstimation
  allowanceForProtocolToken?: BigNumber
  web3Context?: Context
  userSettings?: UserSettingsState
  error?: string | unknown
  userDpmAccount?: UserDpmAccount
  refAllowanceStateMachine?: ActorRefFrom<AllowanceStateMachine>
  reserveData?: ReserveData
}

/**
 * To transfer all collateral from the position, we need to have a slightly higher allowance for the protocol token. However, the wallets show warnings about the allowance being too high.
 * @param position
 */
export const allowanceAmount = (position: AaveLikePosition): BigNumber => {
  return position.collateral.amount.times(1.01).integerValue()
}

export type MigrateAaveEvent =
  | { type: 'BACK_TO_EDITING' }
  | { type: 'RETRY' }
  | { type: 'SET_AMOUNT'; amount?: BigNumber }
  | { type: 'NEXT_STEP' }
  | { type: 'WEB3_CONTEXT_CHANGED'; web3Context: Context }
  | { type: 'DPM_PROXY_RECEIVED'; userDpmAccount: UserDpmAccount }
  | { type: 'CREATED_MACHINE'; refTransactionMachine: RefTransactionMachine }
  | { type: 'UPDATE_RESERVE_DATA'; reserveData: ReserveData }
  | { type: 'USER_SETTINGS_CHANGED'; userSettings: UserSettingsState }
  | { type: 'UPDATE_ALLOWANCE'; allowanceForProtocolToken: BigNumber }
  | { type: 'CURRENT_POSITION_CHANGED'; currentPosition: AaveLikePosition }
  | TransactionParametersV2StateMachineResponseEvent
  | DMPAccountStateMachineResultEvents
  | AllowanceStateMachineResponseEvent
  | TransactionStateMachineResultEvents

export function createMigrateAaveStateMachine(
  migratePositionStateMachine: TransactionParametersV2StateMachine<MigrateAaveLikeParameters>,
  dmpAccountStateMachine: DPMAccountStateMachine,
  allowanceStateMachine: AllowanceStateMachine,
) {
  return createMachine(
    {
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./migrateAaveStateMachine.typegen').Typegen0,
      schema: { context: {} as MigrateAaveContext, events: {} as MigrateAaveEvent },
      preserveActionOrder: true,
      predictableActionArguments: true,
      entry: ['spawnParametersMachine'],
      invoke: [
        {
          src: 'dpmProxy$',
          id: 'dpmProxy$',
        },
        {
          src: 'context$',
          id: 'context$',
        },
        {
          src: 'userSettings$',
          id: 'userSettings$',
        },
        {
          src: 'allowance$',
          id: 'allowance$',
        },
        {
          src: 'aaveReserveConfiguration$',
          id: 'aaveReserveConfiguration$',
        },
        {
          src: 'reserveData$',
          id: 'reserveData$',
        },
        {
          src: 'currentPosition$',
          id: 'currentPosition$',
        },
      ],
      id: 'migrateAaveStateMachine',
      type: 'parallel',
      states: {
        background: {
          initial: 'idle',
          states: {
            idle: {},
            debouncing: {
              after: {
                500: 'loading',
              },
            },
            loading: {
              entry: ['requestParameters'],
              on: {
                STRATEGY_RECEIVED: {
                  target: 'idle',
                  actions: ['updateContext'],
                },
                ERROR_GETTING_STRATEGY: {
                  target: 'idle',
                },
              },
            },
          },
          on: {
            NEXT_STEP: {
              target: '.loading',
            },
            ALLOWANCE_SUCCESS: {
              target: '.loading',
            },
            DPM_ACCOUNT_CREATED: {
              target: '.loading',
            },
          },
        },
        frontend: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                NEXT_STEP: [
                  {
                    target: 'dpmProxyCreating',
                    cond: 'shouldCreateDpmProxy',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'allowanceSetting',
                    cond: 'isAllowanceNeeded',
                    actions: 'incrementCurrentStep',
                  },
                  {
                    target: 'review',
                    cond: 'canMigrate',
                  },
                ],
              },
            },
            review: {
              entry: ['resetCurrentStep', 'setTotalSteps'],
              on: {
                NEXT_STEP: [
                  {
                    target: 'txInProgressEthers',
                  },
                ],
              },
            },
            dpmProxyCreating: {
              entry: ['spawnDpmProxyMachine'],
              exit: ['killDpmProxyMachine'],
              on: {
                DPM_ACCOUNT_CREATED: {
                  actions: ['updateContext', 'setTotalSteps'],
                  target: 'allowanceSetting',
                },
              },
            },
            allowanceSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  actions: ['updateAllowance'],
                  target: 'review',
                },
              },
            },
            txInProgressEthers: {
              entry: [],
              invoke: {
                src: 'runEthersTransaction',
                id: 'runEthersTransaction',
                onError: {
                  target: 'txFailure',
                },
              },
              on: {
                CREATED_MACHINE: {
                  actions: ['updateContext'],
                },
                TRANSACTION_COMPLETED: [
                  {
                    target: 'txSuccess',
                  },
                ],
                TRANSACTION_FAILED: {
                  target: 'txFailure',
                  actions: ['updateContext'],
                },
              },
            },
            txFailure: {
              entry: [],
              on: {
                RETRY: {
                  target: 'txInProgressEthers',
                },
                BACK_TO_EDITING: {
                  target: 'review',
                },
              },
            },
            txSuccess: {
              entry: [],
            },
            finalized: {
              type: 'final',
            },
          },
        },
      },
      on: {
        USER_SETTINGS_CHANGED: {
          actions: 'updateContext',
        },
        WEB3_CONTEXT_CHANGED: {
          actions: ['updateContext', 'sendSigner'],
        },
        // UPDATE_META_INFO: {
        //   actions: 'updateContext',
        // },
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        DPM_PROXY_RECEIVED: {
          actions: ['updateContext', 'setTotalSteps', 'requestParameters'],
        },
        UPDATE_RESERVE_DATA: {
          actions: ['updateContext', 'requestParameters'],
        },
        CURRENT_POSITION_CHANGED: {
          actions: ['updateContext'],
        },
        GAS_PRICE_ESTIMATION_RECEIVED: {
          actions: ['updateContext'],
        },
      },
    },
    {
      guards: {
        shouldCreateDpmProxy: (context) => context.userDpmAccount === undefined,
        isAllowanceNeeded: (context) => {
          if (context.allowanceForProtocolToken === undefined) {
            return true
          }

          return context.allowanceForProtocolToken.lt(allowanceAmount(context.currentPosition!))
        },
        canMigrate: (context) => context.strategy !== undefined,
      },
      actions: {
        setTotalSteps: assign((context) => {
          const allowance = true
          const proxy = !allDefined(context.userDpmAccount?.proxy)

          const totalSteps =
            totalStepsMap.base +
            totalStepsMap.proxySteps(proxy) +
            totalStepsMap.allowanceSteps(allowance)

          return {
            totalSteps: totalSteps,
          }
        }),
        resetCurrentStep: assign((_) => ({
          currentStep: 1,
        })),
        incrementCurrentStep: assign((context) => ({
          currentStep: context.currentStep + 1,
        })),
        // decrementCurrentStep: assign((context) => ({
        //   currentStep: context.currentStep - 1,
        //   stopLossSkipped: false,
        // })),
        updateContext: assign((_, event) => ({
          ...event,
        })),
        spawnDpmProxyMachine: assign((context) => ({
          refDpmAccountMachine: spawn(
            dmpAccountStateMachine.withContext({
              ...dmpAccountStateMachine.context,
              runWithEthers: context.strategyConfig.executeTransactionWith === 'ethers',
              networkId: context.strategyConfig.networkId,
              signer: (context.web3Context as ContextConnected).transactionProvider,
            }),
            'dmpAccountStateMachine',
          ),
        })),
        killDpmProxyMachine: pure((context) => {
          if (context.refDpmAccountMachine && context.refDpmAccountMachine.stop) {
            context.refDpmAccountMachine.stop()
          }
          return undefined
        }),
        spawnParametersMachine: assign((context) => {
          return {
            refParametersMachine: spawn(
              migratePositionStateMachine.withContext({
                ...migratePositionStateMachine.context,
                signer: (context.web3Context as ContextConnected)?.transactionProvider,
              }),
              'transactionParameters',
            ),
          }
        }),
        requestParameters: sendTo(
          (context) => context.refParametersMachine!,
          (context) => {
            return {
              type: 'VARIABLES_RECEIVED',
              parameters: {
                position: context.currentPosition!,
                userAddress: context.positionOwner,
                protocol: context.strategyConfig.protocol,
                reserveData: context.reserveData!,
                proxyAddress: context.userDpmAccount?.proxy ?? ethNullAddress,
                networkId: context.strategyConfig.networkId,
              },
            }
          },
        ),
        killAllowanceMachine: pure((context) => {
          if (context.refAllowanceStateMachine && context.refAllowanceStateMachine.stop) {
            context.refAllowanceStateMachine.stop()
          }
          return undefined
        }),
        spawnAllowanceMachine: assign((context) => {
          return {
            refAllowanceStateMachine: spawn(
              allowanceStateMachine.withContext({
                token: context.reserveData!.collateral.tokenAddress,
                spender: context.userDpmAccount?.proxy!,
                allowanceType: 'unlimited',
                minimumAmount: allowanceAmount(context.currentPosition!),
                runWithEthers: true,
                signer: (context.web3Context as ContextConnected)?.transactionProvider,
                networkId: context.strategyConfig.networkId,
              }),
              'allowanceMachine',
            ),
          }
        }),
        updateAllowance: assign((context, event) => {
          return {
            allowanceForProtocolToken: event.amount,
          }
        }),
        sendSigner: sendTo(
          (context) => context.refParametersMachine!,
          (context) => {
            return {
              type: 'SIGNER_CHANGED',
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
            }
          },
        ),
      },
    },
  )
}

export type MigrateAaveStateMachineWithoutConfiguration = ReturnType<
  typeof createMigrateAaveStateMachine
>
export type MigrateAaveStateMachine = ReturnType<
  MigrateAaveStateMachineWithoutConfiguration['withConfig']
>

export type MigrateAaveStateMachineServices = MachineOptionsFrom<
  MigrateAaveStateMachineWithoutConfiguration,
  true
>['services']
