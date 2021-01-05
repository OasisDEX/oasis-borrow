import BigNumber from 'bignumber.js'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { ContextConnected } from 'components/blockchain/network'
import { GasEstimationStatus, HasGasEstimation, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { filter, first, map, mergeMap, scan, shareReplay, switchMap } from 'rxjs/operators'
import { UnreachableCaseError } from 'ts-essentials'

import { approve, ApproveData } from './erc20Calls'
import { DsrJoinData, join } from './potCalls'

export type DsrDepositStage =
  | 'editing'
  | 'allowanceWaiting4Confirmation'
  | 'allowanceWaiting4Approval'
  | 'allowanceInProgress'
  | 'allowanceFiasco'
  | 'depositWaiting4Confirmation'
  | 'depositWaiting4Approval'
  | 'depositInProgress'
  | 'depositFiasco'
  | 'depositSuccess'

type DsrDepositMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanBalance'
}

export type ManualChange = {
  kind: 'amount'
  amount?: BigNumber
}

type StageChange = {
  kind: 'stage'
  stage: DsrDepositStage
}

type DepositTxHashChange = {
  kind: 'depositTxHash'
  depositTxHash: string
}

type ProxyAddressChange = {
  kind: 'proxyAddress'
  proxyAddress: string
}

type DaiAllowanceChange = {
  kind: 'daiAllowance'
  daiAllowance: boolean
}

interface AllowanceTxHashChange {
  kind: 'allowanceTxHash'
  allowanceTxHash: string
}

interface DaiBalanceChange {
  kind: 'daiBalance'
  daiBalance: BigNumber
}

type DsrCreationChange =
  | ManualChange
  | StageChange
  | ProxyAddressChange
  | AllowanceTxHashChange
  | DaiBalanceChange
  | DepositTxHashChange
  | DaiAllowanceChange

export interface DsrDepositState extends HasGasEstimation {
  stage: DsrDepositStage
  proxyAddress: string
  allowanceTxHash?: string
  depositTxHash?: string
  daiBalance: BigNumber
  daiAllowance: boolean
  amount?: BigNumber
  messages: DsrDepositMessage[]
  change?: (change: ManualChange) => void
  reset?: () => void
  proceed?: () => void
  setAllowance?: () => void
  deposit?: () => void
  back?: () => void
}

function applyChange(state: DsrDepositState, change: DsrCreationChange): DsrDepositState {
  if (change.kind === 'amount') {
    return { ...state, amount: change.amount }
  }

  if (change.kind === 'stage') {
    return { ...state, stage: change.stage }
  }

  if (change.kind === 'allowanceTxHash') {
    return { ...state, allowanceTxHash: change.allowanceTxHash }
  }

  if (change.kind === 'proxyAddress') {
    return { ...state, proxyAddress: change.proxyAddress }
  }

  if (change.kind === 'daiBalance') {
    return { ...state, daiBalance: change.daiBalance }
  }

  if (change.kind === 'depositTxHash') {
    return { ...state, depositTxHash: change.depositTxHash }
  }

  if (change.kind === 'daiAllowance') {
    return { ...state, daiAllowance: change.daiAllowance }
  }

  throw new UnreachableCaseError(change)
}

function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  daiAllowance$: Observable<boolean>,
  change: (ch: DsrCreationChange) => void,
  state: DsrDepositState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: 'DAI',
    spender: state.proxyAddress!,
  })
    .pipe(
      transactionToX<DsrCreationChange, ApproveData>(
        { kind: 'stage', stage: 'allowanceWaiting4Approval' },
        (txState) =>
          of(
            {
              kind: 'allowanceTxHash',
              allowanceTxHash: (txState as any).txHash as string,
            },
            { kind: 'stage', stage: 'allowanceInProgress' },
          ),
        { kind: 'stage', stage: 'allowanceFiasco' },
        () =>
          daiAllowance$.pipe(
            filter((daiAllowance) => daiAllowance),
            first(),
            switchMap(() => of({ kind: 'stage', stage: 'depositWaiting4Confirmation' })),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

function deposit(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: DsrCreationChange) => void,
  { amount, proxyAddress }: DsrDepositState,
) {
  sendWithGasEstimation(join, {
    kind: TxMetaKind.dsrJoin,
    proxyAddress: proxyAddress!,
    amount: amount!,
  })
    .pipe(
      transactionToX<DsrCreationChange, DsrJoinData>(
        { kind: 'stage', stage: 'depositWaiting4Approval' },
        (txState) =>
          of(
            { kind: 'depositTxHash', depositTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'depositInProgress' },
          ),
        { kind: 'stage', stage: 'depositFiasco' },
        () => of({ kind: 'stage', stage: 'depositSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  daiAllowance$: Observable<boolean>,
  change: (ch: DsrCreationChange) => void,
  state: DsrDepositState,
): DsrDepositState {
  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'amount', amount: undefined })
  }

  if (state.stage === 'allowanceWaiting4Confirmation') {
    return {
      ...state,
      reset,
      setAllowance: () => setAllowance(txHelpers, daiAllowance$, change, state),
    }
  }
  if (state.stage === 'depositWaiting4Confirmation') {
    return {
      ...state,
      deposit: () => deposit(txHelpers, change, state),
      back: () => change({ kind: 'stage', stage: 'editing' }),
      reset,
    }
  }

  if (
    state.stage === 'depositFiasco' ||
    state.stage === 'depositSuccess' ||
    state.stage === 'allowanceFiasco'
  ) {
    return {
      ...state,
      reset,
    }
  }

  if (state.stage === 'editing') {
    if (state.messages.length === 0) {
      return {
        ...state,
        change,
        proceed: () =>
          state.daiAllowance
            ? change({ kind: 'stage', stage: 'depositWaiting4Confirmation' })
            : change({ kind: 'stage', stage: 'allowanceWaiting4Confirmation' }),
        reset,
      }
    }
    return { ...state, change, reset }
  }
  return state
}

function validate(state: DsrDepositState): DsrDepositState {
  const messages: DsrDepositMessage[] = []
  if (!state.amount || state.amount.eq(zero)) {
    messages[messages.length] = { kind: 'amountIsEmpty' }
  }
  if (state.amount && state.daiBalance && state.amount.gt(state.daiBalance)) {
    messages[messages.length] = { kind: 'amountBiggerThanBalance' }
  }
  return { ...state, messages }
}

function constructEstimateGas(
  addGasEstimation: AddGasEstimationFunction,
  state: DsrDepositState,
): Observable<DsrDepositState> {
  return addGasEstimation(state, ({ estimateGas }: TxHelpers) => {
    const { messages, amount, proxyAddress } = state

    if (!proxyAddress || !amount || messages.length > 0) {
      return undefined
    }

    const args = { amount, proxyAddress }

    return estimateGas(join, { ...args, kind: TxMetaKind.dsrJoin })
  })
}

export function createDsrDeposit$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  daiAllowance$: Observable<boolean>,
  daiBalance$: Observable<BigNumber>,
  addGasEstimation: AddGasEstimationFunction,
): Observable<DsrDepositState> {
  return combineLatest(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$).pipe(
    first(),
    switchMap(([context, txHelpers, proxyAddress, daiAllowance, daiBalance]) => {
      const change$ = new Subject<DsrCreationChange>()
      function change(ch: DsrCreationChange) {
        change$.next(ch)
      }

      const initialState: DsrDepositState = {
        stage: 'editing',
        daiBalance,
        daiAllowance,
        proxyAddress: proxyAddress!,
        messages: [],
        gasEstimationStatus: GasEstimationStatus.unset,
      }

      const daiBalanceChange$: Observable<DaiBalanceChange> = daiBalance$.pipe(
        map((daiBalance) => ({ kind: 'daiBalance', daiBalance })),
      )

      const addressChange$ = context$.pipe(
        map((ctx) => ctx.account),
        filter((account) => account !== context.account),
        mergeMap(() => {
          return combineLatest(daiAllowance$, proxyAddress$).pipe(
            switchMap(([daiAllowance, proxyAddress]) => {
              const stage =
                (!proxyAddress && 'proxyWaiting4Confirmation') ||
                (!daiAllowance && 'allowanceWaiting4Confirmation') ||
                'editing'

              return of({ kind: 'stage', stage }, { kind: 'proxyAddress', proxyAddress })
            }),
          )
        }),
      )

      return merge(change$, daiBalanceChange$, addressChange$).pipe(
        scan(applyChange, initialState),
        map(validate),
        switchMap(curry(constructEstimateGas)(addGasEstimation)),
        map(curry(addTransitions)(txHelpers, proxyAddress$, daiAllowance$, change)),
      )
    }),
    shareReplay(1),
  )
}
