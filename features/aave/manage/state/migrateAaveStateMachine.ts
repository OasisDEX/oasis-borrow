import type { AaveLikePosition, IPosition, Strategy } from '@oasisdex/dma-library'
import type { MigrateAaveLikeParameters } from 'actions/aave-like'
import type BigNumber from 'bignumber.js'
import type { Context, ContextConnected } from 'blockchain/network.types'
import { ethNullAddress } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import type { IStrategyConfig, RefTransactionMachine, ReserveData } from 'features/aave/types'
import { ProxyType } from 'features/aave/types'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
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
  TransactionParametersStateMachineEvent,
  TransactionParametersV2StateMachine,
  TransactionParametersV2StateMachineResponseEvent,
} from 'features/stateMachines/transactionParameters'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { allDefined } from 'helpers/allDefined'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import type { ActorRefFrom } from 'xstate'
import { assign, createMachine, send, sendTo, spawn } from 'xstate'
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
  // hasOpenedPosition?: boolean
  // positionRelativeAddress?: string
  // blockSettingCalculatedAddresses?: boolean
  // reserveConfig?: AaveV2ReserveConfigurationData
  strategyConfig: IStrategyConfig
  currentPosition?: AaveLikePosition

  currentStep: number
  totalSteps: number

  strategy?: Strategy<IPosition>
  allowanceForProtocolToken?: BigNumber
  web3Context?: Context
  userSettings?: UserSettingsState
  error?: string | unknown
  userDpmAccount?: UserDpmAccount
  effectiveProxyAddress?: string
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
          src: 'connectedProxyAddress$',
          id: 'connectedProxyAddress$',
        },
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
          src: 'getHasOpenedPosition$',
          id: 'getHasOpenedPosition$',
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
          },
        },
        frontend: {
          initial: 'editing',
          states: {
            editing: {
              entry: ['resetCurrentStep', 'setTotalSteps', 'calculateEffectiveProxyAddress'],
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
                  target: 'editing',
                },
              },
            },
            allowanceSetting: {
              entry: ['spawnAllowanceMachine'],
              exit: ['killAllowanceMachine'],
              on: {
                ALLOWANCE_SUCCESS: {
                  actions: ['updateAllowance'],
                  target: 'editing',
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
                  target: 'editing',
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
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'sendSigner'],
        },
        // UPDATE_META_INFO: {
        //   actions: 'updateContext',
        // },
        UPDATE_ALLOWANCE: {
          actions: 'updateContext',
        },
        DPM_PROXY_RECEIVED: {
          actions: ['updateContext', 'calculateEffectiveProxyAddress', 'setTotalSteps'],
        },
        UPDATE_RESERVE_DATA: {
          actions: 'updateContext',
        },
      },
    },
    {
      guards: {
        shouldCreateDpmProxy: (context) =>
          context.strategyConfig.proxyType === ProxyType.DpmProxy && !context.userDpmAccount,
        isAllowanceNeeded: (context) => {
          if (context.allowanceForProtocolToken === undefined) {
            return true
          }

          return context.allowanceForProtocolToken.lt(context.currentPosition!.collateral.amount)
        },
      },
      actions: {
        setTotalSteps: assign((context) => {
          const allowance = true
          const proxy = !allDefined(context.effectiveProxyAddress)
          const optionalStopLoss =
            getLocalAppConfig('features').AaveV3ProtectionWrite &&
            supportsAaveStopLoss(
              context.strategyConfig.protocol,
              context.strategyConfig.networkId,
            ) &&
            isSupportedAaveAutomationTokenPair(
              context.strategyConfig.tokens.collateral,
              context.strategyConfig.tokens.debt,
            ) &&
            context.strategyConfig.type === 'Multiply'
              ? 1
              : 0

          const totalSteps =
            totalStepsMap.base +
            totalStepsMap.proxySteps(proxy) +
            totalStepsMap.allowanceSteps(allowance) +
            optionalStopLoss
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
        requestParameters: send(
          (context): TransactionParametersStateMachineEvent<MigrateAaveLikeParameters> => {
            return {
              type: 'VARIABLES_RECEIVED',
              parameters: {
                position: context.currentPosition!,
                userAddress: context.web3Context?.account ?? ethNullAddress,
                protocol: context.strategyConfig.protocol,
                reserveData: context.reserveData!,
                proxyAddress: context.effectiveProxyAddress ?? ethNullAddress,
                networkId: context.strategyConfig.networkId,
              },
            }
          },
          { to: (context) => context.refParametersMachine! },
        ),
        killAllowanceMachine: pure((context) => {
          if (context.refAllowanceStateMachine && context.refAllowanceStateMachine.stop) {
            context.refAllowanceStateMachine.stop()
          }
          return undefined
        }),
        spawnAllowanceMachine: assign((context) => ({
          refAllowanceStateMachine: spawn(
            allowanceStateMachine.withContext({
              token: context.reserveData!.collateral.tokenAddress,
              spender: context.effectiveProxyAddress!,
              allowanceType: 'unlimited',
              minimumAmount: context.currentPosition!.collateral.amount,
              runWithEthers: true,
              signer: (context.web3Context as ContextConnected)?.transactionProvider,
              networkId: context.strategyConfig.networkId,
            }),
            'allowanceMachine',
          ),
        })),
        calculateEffectiveProxyAddress: assign((context) => {
          const proxyAddressToUse = context.userDpmAccount?.proxy

          const protocolVersion = {
            [LendingProtocol.AaveV2]: 'v2',
            [LendingProtocol.AaveV3]: 'v3',
            [LendingProtocol.SparkV3]: 'v3',
          }[context.strategyConfig.protocol]

          const protocolName = {
            [LendingProtocol.AaveV2]: 'aave',
            [LendingProtocol.AaveV3]: 'aave',
            [LendingProtocol.SparkV3]: 'spark',
          }[context.strategyConfig.protocol]

          const address = `/${context.strategyConfig.network}/${protocolName}/${protocolVersion}/${context.userDpmAccount?.vaultId}`

          return {
            effectiveProxyAddress: proxyAddressToUse,
            positionRelativeAddress: address,
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
