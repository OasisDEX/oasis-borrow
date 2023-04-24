import { createAccount, CreateDPMAccount } from 'blockchain/calls/accountFactory'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { TxHelpers } from 'components/AppContext'
import {
  TransactionStateMachine,
  TransactionStateMachineResultEvents,
} from 'features/stateMachines/transaction'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators'
import { ActorRefFrom, AnyEventObject, assign, createMachine, sendParent, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'

export interface DMPAccountStateMachineContext {
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<CreateDPMAccount, UserDpmAccount>>
  error?: string | unknown
  gasData: HasGasEstimation
  result?: UserDpmAccount // transaction result from transactionStateMachine
}

export type DMPAccountStateMachineResultEvents = {
  type: 'DPM_ACCOUNT_CREATED'
  userDpmAccount: UserDpmAccount
}

export type DPMAccountStateMachineEvents =
  | TransactionStateMachineResultEvents<UserDpmAccount>
  | DMPAccountStateMachineResultEvents
  | { type: 'START' }
  | { type: 'RETRY' }
  | { type: 'CONTINUE' }
  | { type: 'GO_BACK' }
  | { type: 'GAS_COST_ESTIMATION'; gasData: HasGasEstimation }

export function createDPMAccountStateMachine(
  transactionStateMachine: TransactionStateMachine<CreateDPMAccount, UserDpmAccount>,
) {
  return createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./createDPMAccountStateMachine.typegen').Typegen0,
      id: 'createDPMAccount',
      initial: 'idle',
      context: {
        gasData: { gasEstimationStatus: GasEstimationStatus.calculating },
      },
      schema: {
        context: {} as DMPAccountStateMachineContext,
        events: {} as DPMAccountStateMachineEvents,
      },
      invoke: [
        {
          src: 'gasEstimation$',
          id: 'gasEstimation$',
        },
      ],
      on: {
        GAS_COST_ESTIMATION: {
          actions: ['updateContext'],
        },
      },
      states: {
        idle: {
          on: {
            START: 'txInProgress',
          },
        },
        txInProgress: {
          entry: ['spawnTransactionMachine'],
          on: {
            TRANSACTION_COMPLETED: {
              actions: ['updateContext'],
              target: 'txSuccess',
            },
            TRANSACTION_FAILED: {
              target: 'txFailure',
              actions: ['updateContext'],
            },
          },
        },
        txFailure: {
          entry: ['killTransactionMachine'],
          on: {
            RETRY: {
              target: 'txInProgress',
            },
          },
        },
        txSuccess: {
          entry: ['killTransactionMachine'],
          on: {
            CONTINUE: {
              actions: ['sendResultToParent'],
            },
          },
        },
      },
    },
    {
      actions: {
        updateContext: assign((context, event) => ({ ...event })),
        spawnTransactionMachine: assign((_) => ({
          refTransactionMachine: spawn(transactionStateMachine, 'transactionMachine'),
        })),
        killTransactionMachine: pure((context) => {
          if (context.refTransactionMachine && context.refTransactionMachine.stop) {
            context.refTransactionMachine.stop()
          }
          return undefined
        }),
        sendResultToParent: sendParent((context) => {
          return { type: 'DPM_ACCOUNT_CREATED', userDpmAccount: context.result }
        }),
      },
    },
  )
}

type DPMAccountStateMachineMissingServices =
  import('./createDPMAccountStateMachine.typegen').Typegen0['missingImplementations']['services']

export type DPMAccountStateMachineServices = Record<
  DPMAccountStateMachineMissingServices,
  (
    context: DMPAccountStateMachineContext,
    event: AnyEventObject,
  ) => Observable<DPMAccountStateMachineEvents>
>

export function getDPMAccountStateMachineServices(
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
): DPMAccountStateMachineServices {
  return {
    gasEstimation$: (_) => {
      return txHelpers$.pipe(
        switchMap((txHelpers) =>
          txHelpers.estimateGas(createAccount, { kind: TxMetaKind.createAccount }),
        ),
        switchMap((gas) => gasEstimation$(gas)),
        map((gasData) => ({ type: 'GAS_COST_ESTIMATION', gasData })),
        startWith({
          type: 'GAS_COST_ESTIMATION',
          gasData: { gasEstimationStatus: GasEstimationStatus.calculating },
        }),
        distinctUntilChanged(isEqual),
      )
    },
  }
}

export type DPMAccountStateMachine = ReturnType<
  ReturnType<typeof createDPMAccountStateMachine>['withConfig']
>
