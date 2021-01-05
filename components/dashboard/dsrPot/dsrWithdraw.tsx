import BigNumber from 'bignumber.js'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { RAY, WAD } from 'components/constants'
import { DsrExitAllData, DsrExitData, exit, exitAll } from 'components/dashboard/dsrPot/potCalls'
import { GasEstimationStatus, HasGasEstimation, transactionToX } from 'helpers/form'
import { roundDown, roundHalfUp } from 'helpers/rounding'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'
import { UnreachableCaseError } from 'ts-essentials'

export type DsrWithdrawStage =
  | 'editing'
  | 'withdrawWaiting4Confirmation'
  | 'withdrawWaiting4Approval'
  | 'withdrawInProgress'
  | 'withdrawFiasco'
  | 'withdrawSuccess'

export type DsrWithdrawMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanDeposit'
}

export type ManualChange = {
  kind: 'amount'
  amount?: BigNumber
}

type StageChange = {
  kind: 'stage'
  stage: DsrWithdrawStage
}

type WithdrawTxHashChange = {
  kind: 'withdrawTxHash'
  withdrawTxHash: string
}

interface DaiDepositChange {
  kind: 'daiDeposit'
  daiDeposit: BigNumber
}

type DsrWithdrawChange = ManualChange | StageChange | WithdrawTxHashChange | DaiDepositChange

export interface DsrWithdrawState extends HasGasEstimation {
  stage: DsrWithdrawStage
  proxyAddress: string
  withdrawTxHash?: string
  daiDeposit: BigNumber
  potDsr: BigNumber
  amount?: BigNumber
  messages: DsrWithdrawMessage[]
  change?: (change: ManualChange) => void
  reset?: () => void
  proceed?: () => void
  withdraw?: () => void
  back?: () => void
}

function applyChange(state: DsrWithdrawState, change: DsrWithdrawChange): DsrWithdrawState {
  if (change.kind === 'amount') {
    return { ...state, amount: change.amount }
  }

  if (change.kind === 'stage') {
    return { ...state, stage: change.stage }
  }

  if (change.kind === 'daiDeposit') {
    return {
      ...state,
      daiDeposit: change.daiDeposit,
    }
  }

  if (change.kind === 'withdrawTxHash') {
    return { ...state, withdrawTxHash: change.withdrawTxHash }
  }

  throw new UnreachableCaseError(change)
}

function withdraw(
  txHelpers: TxHelpers,
  change: (ch: DsrWithdrawChange) => void,
  state: DsrWithdrawState,
) {
  const amount = state.amount!
  const proxyAddress = state.proxyAddress!
  const lowerBound = roundDown(state.daiDeposit, 'DAI')
  const upperBound = roundHalfUp(state.daiDeposit, 'DAI')
  const betweenBounds = lowerBound.lt(amount) && upperBound.gte(amount)
  const WEI = new BigNumber(1).div(WAD)
  const zeroDsr = state.potDsr.div(RAY).eq(1)

  if (betweenBounds) {
    if (zeroDsr) {
      return dsrExit(txHelpers, change, proxyAddress, state.daiDeposit.plus(WEI))
    }
    return dsrExitAll(txHelpers, change, proxyAddress)
  }
  return dsrExit(txHelpers, change, proxyAddress, amount)
}

function dsrExit(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: DsrWithdrawChange) => void,
  proxyAddress: string,
  amount: BigNumber,
) {
  sendWithGasEstimation(exit, {
    kind: TxMetaKind.dsrExit,
    proxyAddress: proxyAddress!,
    amount: amount!,
  })
    .pipe(
      transactionToX<DsrWithdrawChange, DsrExitData>(
        { kind: 'stage', stage: 'withdrawWaiting4Approval' },
        (txState) =>
          of(
            { kind: 'withdrawTxHash', withdrawTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'withdrawInProgress' },
          ),
        { kind: 'stage', stage: 'withdrawFiasco' },
        () => of({ kind: 'stage', stage: 'withdrawSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}
function dsrExitAll(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: DsrWithdrawChange) => void,
  proxyAddress: string,
) {
  sendWithGasEstimation(exitAll, {
    kind: TxMetaKind.dsrExitAll,
    proxyAddress: proxyAddress!,
  })
    .pipe(
      transactionToX<DsrWithdrawChange, DsrExitAllData>(
        { kind: 'stage', stage: 'withdrawWaiting4Approval' },
        (txState) =>
          of(
            { kind: 'withdrawTxHash', withdrawTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'withdrawInProgress' },
          ),
        { kind: 'stage', stage: 'withdrawFiasco' },
        () => of({ kind: 'stage', stage: 'withdrawSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: DsrWithdrawChange) => void,
  state: DsrWithdrawState,
): DsrWithdrawState {
  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'amount', amount: undefined })
  }

  if (state.stage === 'withdrawWaiting4Confirmation') {
    return {
      ...state,
      withdraw: () => withdraw(txHelpers, change, state),
      back: () => change({ kind: 'stage', stage: 'editing' }),
      reset,
    }
  }
  if (state.stage === 'withdrawFiasco' || state.stage === 'withdrawSuccess') {
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
        proceed: () => change({ kind: 'stage', stage: 'withdrawWaiting4Confirmation' }),
        reset,
      }
    }
    return { ...state, change, reset }
  }
  return state
}

function validate(state: DsrWithdrawState): DsrWithdrawState {
  const messages: DsrWithdrawMessage[] = []
  if (!state.amount || state.amount.eq(zero)) {
    messages[messages.length] = { kind: 'amountIsEmpty' }
  }
  if (state.amount && state.daiDeposit && state.amount.gt(roundHalfUp(state.daiDeposit, 'DAI'))) {
    messages[messages.length] = { kind: 'amountBiggerThanDeposit' }
  }
  return { ...state, messages }
}

function constructEstimateGas(
  addGasEstimation: AddGasEstimationFunction,
  state: DsrWithdrawState,
): Observable<DsrWithdrawState> {
  return addGasEstimation(state, ({ estimateGas }: TxHelpers) => {
    const { messages, amount, proxyAddress } = state

    if (!proxyAddress || !amount || messages.length > 0) {
      return undefined
    }

    const args = { amount, proxyAddress }

    return estimateGas(exit, { ...args, kind: TxMetaKind.dsrExit })
  })
}

export function createDsrWithdraw$(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  daiDeposit$: Observable<BigNumber>,
  potDsr$: Observable<BigNumber>,
  addGasEstimation: AddGasEstimationFunction,
): Observable<DsrWithdrawState> {
  return combineLatest(proxyAddress$, txHelpers$, daiDeposit$, potDsr$).pipe(
    first(),
    switchMap(([proxyAddress, txHelpers, daiDeposit, potDsr]) => {
      const change$ = new Subject<DsrWithdrawChange>()
      function change(ch: DsrWithdrawChange) {
        change$.next(ch)
      }

      const daiDepositChange$: Observable<DaiDepositChange> = daiDeposit$.pipe(
        map((daiDeposit) => ({ kind: 'daiDeposit', daiDeposit })),
      )

      const initialState: DsrWithdrawState = {
        stage: 'editing',
        daiDeposit,
        potDsr,
        proxyAddress: proxyAddress!,
        messages: [],
        gasEstimationStatus: GasEstimationStatus.unset,
      }

      return merge(change$, daiDepositChange$).pipe(
        scan(applyChange, initialState),
        map(validate),
        switchMap(curry(constructEstimateGas)(addGasEstimation)),
        map(curry(addTransitions)(txHelpers, proxyAddress$, change)),
      )
    }),
    shareReplay(1),
  )
}
