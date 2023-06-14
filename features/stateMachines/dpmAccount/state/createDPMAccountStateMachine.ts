import {
  CreateAccountParameters,
  createCreateAccountTransaction,
  estimateGasCreateAccount,
  extractResultFromContractReceipt,
} from 'blockchain/better-calls/account-factory'
import { createAccount, CreateDPMAccount } from 'blockchain/calls/accountFactory'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { Context, ContextConnected } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { TxHelpers } from 'components/AppContext'
import { ethers } from 'ethers'
import {
  createEthersTransactionStateMachine,
  EthersTransactionStateMachine,
  TransactionStateMachine,
  TransactionStateMachineResultEvents,
} from 'features/stateMachines/transaction'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { ActorRefFrom, assign, createMachine, interpret, sendParent, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import { MachineOptionsFrom } from 'xstate/lib/types'

type RefTransactionMachine =
  | ActorRefFrom<TransactionStateMachine<CreateDPMAccount, UserDpmAccount>>
  | ActorRefFrom<EthersTransactionStateMachine<CreateAccountParameters, UserDpmAccount>>

export interface DMPAccountStateMachineContext {
  refTransactionMachine?: RefTransactionMachine
  error?: string | unknown
  gasData: HasGasEstimation
  result?: UserDpmAccount // transaction result from transactionStateMachine
  runWithEthers: boolean
  networkId?: NetworkIds
  signer?: ethers.Signer
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
  | { type: 'CREATED_MACHINE'; refTransactionMachine: RefTransactionMachine }

export function createDPMAccountStateMachine(
  transactionStateMachine: TransactionStateMachine<CreateDPMAccount, UserDpmAccount>,
  runWithEthers: boolean = false,
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
        runWithEthers,
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
            START: [
              {
                cond: 'runWithEthers',
                target: 'txInProgressEthers',
              },
              {
                target: 'txInProgress',
              },
            ],
          },
        },
        txInProgressEthers: {
          invoke: {
            src: 'runTransaction',
            id: 'runTransaction',
          },
          on: {
            CREATED_MACHINE: {
              actions: ['updateContext'],
            },
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
            RETRY: [
              {
                cond: 'runWithEthers',
                target: 'txInProgressEthers',
              },
              {
                target: 'txInProgress',
              },
            ],
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
      guards: {
        runWithEthers: (context) => context.runWithEthers,
      },
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

export type DPMAccountStateMachineServices = MachineOptionsFrom<
  ReturnType<typeof createDPMAccountStateMachine>,
  true
>['services']

export function getDPMAccountStateMachineServices(
  web3Context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
): DPMAccountStateMachineServices {
  return {
    runTransaction: (context) => async (sendBack, _onReceive) => {
      const contracts = getNetworkContracts(context.networkId!)
      ensureEtherscanExist(context.networkId!, contracts)

      const { etherscan } = contracts

      const machine = createEthersTransactionStateMachine<
        CreateAccountParameters,
        UserDpmAccount
      >().withContext({
        etherscanUrl: etherscan.url,
        transaction: createCreateAccountTransaction,
        transactionParameters: { networkId: context.networkId!, signer: context.signer! },
        extract: extractResultFromContractReceipt,
      })

      const actor = interpret(machine, {
        id: 'ethersTransactionMachine',
      }).start()

      sendBack({ type: 'CREATED_MACHINE', refTransactionMachine: actor })

      actor.onTransition((state) => {
        if (state.matches('success')) {
          sendBack({ type: 'TRANSACTION_COMPLETED', result: state.context.result })
        } else if (state.matches('failure')) {
          sendBack({ type: 'TRANSACTION_FAILED', error: state.context.txError })
        }
      })

      return () => {
        actor.stop()
      }
    },
    gasEstimation$: (context) => {
      if (context.runWithEthers) {
        return web3Context$.pipe(
          filter((web3Context) => {
            return web3Context.status === 'connected'
          }),
          switchMap(({ chainId, transactionProvider }: ContextConnected) =>
            estimateGasCreateAccount({ networkId: chainId, signer: transactionProvider }),
          ),
          switchMap((gas) => gasEstimation$(gas ?? 0)),
          map((gasData) => ({ type: 'GAS_COST_ESTIMATION', gasData })),
          startWith({
            type: 'GAS_COST_ESTIMATION',
            gasData: { gasEstimationStatus: GasEstimationStatus.calculating },
          }),
          distinctUntilChanged(isEqual),
        )
      }
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
