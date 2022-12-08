import BigNumber from 'bignumber.js'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { RAY, WAD } from 'components/constants'
import { DsrExitAllData, DsrExitData, exit, exitAll } from './potCalls'
import {
  ApplyChange,
  applyChange,
  Change,
  Changes,
  GasEstimationStatus,
  HasGasEstimation,
  transactionToX,
} from 'helpers/form'
import { roundDown, roundHalfUp } from 'helpers/rounding'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

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

export interface DsrWithdrawState extends HasGasEstimation {
  stage: DsrWithdrawStage
  proxyAddress: string
  withdrawTxHash?: string
  daiDeposit: BigNumber
  potDsr: BigNumber
  amount?: BigNumber
  messages: DsrWithdrawMessage[]
  change: (change: ManualChange) => void
  reset?: () => void
  proceed?: () => void
  withdraw?: () => void
  back?: () => void
}

export type DsrWithdrawChange = Changes<DsrWithdrawState>
export type DaiDepositChange = Change<DsrWithdrawState, 'daiDeposit'>
export type ManualChange = Change<DsrWithdrawState, 'amount'>

const apply: ApplyChange<DsrWithdrawState> = applyChange

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
  sendWithGasEstimation(exit as any, {
    kind: TxMetaKind.dsrExit,
    proxyAddress: proxyAddress!,
    amount: amount!,
  } as any)
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
  sendWithGasEstimation(exitAll as any, {
    kind: TxMetaKind.dsrExitAll,
    proxyAddress: proxyAddress!,
  } as any)
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
        withdraw: () => withdraw(txHelpers, change, state),
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

    return estimateGas(exit as any, { ...args, kind: TxMetaKind.dsrExit } as any)
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
        change
      }

      return merge(change$, daiDepositChange$).pipe(
        scan(apply, initialState),
        map(validate),
        switchMap(curry(constructEstimateGas)(addGasEstimation)),
        map(curry(addTransitions)(txHelpers, proxyAddress$, change)),
      )
    }),
    shareReplay(1),
  )
}
