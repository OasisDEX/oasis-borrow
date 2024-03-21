import type { AaveLikePosition, IPosition, Strategy, Tx } from '@oasisdex/dma-library'
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
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import type { ActorRefFrom } from 'xstate'
import { assign, createMachine, sendTo, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import type { MachineOptionsFrom } from 'xstate/lib/types'

export interface MigrateAaveContext {
  refDpmAccountMachine?: ActorRefFrom<ReturnType<typeof createDPMAccountStateMachine>>
  refTransactionMachine?: RefTransactionMachine
  refParametersMachine?: ActorRefFrom<
    TransactionParametersV2StateMachine<MigrateAaveLikeParameters>
  >
  strategyConfig: IStrategyConfig
  positionOwner: string
  positionAddress: string
  currentPosition?: AaveLikePosition

  strategy?: Strategy<IPosition>
  approval?: Tx
  estimatedGasPrice?: HasGasEstimation
  allowanceForProtocolToken?: BigNumber
  web3Context?: Context
  userSettings?: UserSettingsState
  error?: string | unknown
  userDpmAccount?: UserDpmAccount
  refAllowanceStateMachine?: ActorRefFrom<AllowanceStateMachine>
  reserveData?: ReserveData
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
          initial: 'loading',
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
                  },
                  {
                    target: 'allowanceReview',
                    cond: 'isAllowanceNeeded',
                  },
                  {
                    target: 'review',
                    cond: 'canMigrate',
                  },
                ],
              },
            },
            review: {
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
                  actions: ['updateContext'],
                  target: 'allowanceReview',
                },
              },
            },
            allowanceReview: {
              on: {
                NEXT_STEP: {
                  target: 'allowanceSetting',
                },
              },
            },
            allowanceSetting: {
              entry: [''],
              invoke: {
                src: 'runEthersApprovalTransaction',
                id: 'runEthersApprovalTransaction',
                onError: {
                  target: 'allowanceFailure',
                },
              },
              on: {
                TRANSACTION_COMPLETED: {
                  target: 'review',
                },
                TRANSACTION_FAILED: {
                  target: 'allowanceFailure',
                  actions: ['updateContext'],
                },
              },
            },
            allowanceFailure: {
              on: {
                RETRY: {
                  target: 'allowanceSetting',
                },
                BACK_TO_EDITING: {
                  target: 'allowanceReview',
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
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        DPM_PROXY_RECEIVED: {
          actions: ['updateContext', 'requestParameters'],
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
          return context.approval !== undefined
        },
        canMigrate: (context) => context.strategy !== undefined,
      },
      actions: {
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
                dpmAccount: context.userDpmAccount?.proxy ?? ethNullAddress,
                sourceAddress: context.positionAddress,
                networkId: context.strategyConfig.networkId,
              },
            }
          },
        ),
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
