import BigNumber from 'bignumber.js'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import {
  transferErc20,
  TransferErc20Data,
  transferEth,
  TransferEthData,
} from 'components/dashboard/dsrPot/erc20Calls'
import { GasEstimationStatus, HasGasEstimation, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { merge, Observable, of, Subject } from 'rxjs'
import { map, scan, switchMap } from 'rxjs/operators'
import { UnreachableCaseError } from 'ts-essentials'
import Web3 from 'web3'

import { Dashboard } from './dashboard'
import { ManualChange } from './dsrPot/dsrDeposit'

type TokenSendStage =
  | 'editing'
  | 'readingQrCode'
  | 'sendWaiting4Confirmation'
  | 'sendWaiting4Approval'
  | 'sendInProgress'
  | 'sendFiasco'
  | 'sendSuccess'

export type TokenSendMessage = {
  kind: 'amountIsEmpty' | 'amountMoreThanBalance' | 'addressInvalid'
}

type StageChange = {
  kind: 'stage'
  stage: TokenSendStage
}

type TokenChange = {
  kind: 'token'
  dai: BigNumber
  daiUSD: BigNumber
  eth: BigNumber
  ethUSD: BigNumber
}

type TokenSendTxHashChange = {
  kind: 'sendTxHash'
  sendTxHash: string
}

type ActiveTokenChange = {
  kind: 'activeToken'
  activeToken: string
}

export type AddressChange = {
  kind: 'address'
  address?: string
}

export interface TokenSendState extends HasGasEstimation {
  stage: TokenSendStage
  sendTxHash?: string
  amount?: BigNumber
  address?: string
  messages: TokenSendMessage[]
  change?: (change: ManualChange | AddressChange | ActiveTokenChange) => void
  proceed?: () => void
  showQrCode?: () => void
  sendEth?: () => void
  sendDai?: () => void
  reset?: () => void
  dai: BigNumber
  daiUSD: BigNumber
  eth: BigNumber
  ethUSD: BigNumber
  canProceed: boolean
  activeToken?: string
}

type TokenSendChange =
  | ManualChange
  | StageChange
  | TokenSendTxHashChange
  | TokenChange
  | AddressChange
  | ActiveTokenChange

function applyChange(state: TokenSendState, change: TokenSendChange): TokenSendState {
  if (change.kind === 'amount') {
    return { ...state, amount: change.amount }
  }

  if (change.kind === 'stage') {
    return { ...state, stage: change.stage }
  }

  if (change.kind === 'token') {
    return {
      ...state,
      dai: change.dai,
      daiUSD: change.daiUSD,
      eth: change.eth,
      ethUSD: change.ethUSD,
    }
  }

  if (change.kind === 'address') {
    return { ...state, address: change.address }
  }

  if (change.kind === 'sendTxHash') {
    return { ...state, sendTxHash: change.sendTxHash }
  }

  if (change.kind === 'activeToken') {
    return { ...state, activeToken: change.activeToken }
  }

  throw new UnreachableCaseError(change)
}

function sendErc20(
  { send }: TxHelpers,
  change: (ch: TokenSendChange) => void,
  { amount, address }: TokenSendState,
) {
  send(transferErc20, {
    kind: TxMetaKind.transferErc20,
    token: 'DAI',
    amount: amount!,
    address: address!,
  })
    .pipe(
      transactionToX<TokenSendChange, TransferErc20Data>(
        { kind: 'stage', stage: 'sendWaiting4Approval' },
        (txState: any) =>
          of(
            { kind: 'sendTxHash', sendTxHash: txState.txHash as string },
            { kind: 'stage', stage: 'sendInProgress' },
          ),
        { kind: 'stage', stage: 'sendFiasco' },
        () => of({ kind: 'stage', stage: 'sendSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function sendEth(
  { send }: TxHelpers,
  change: (ch: TokenSendChange) => void,
  { amount, address }: TokenSendState,
) {
  send(transferEth, {
    kind: TxMetaKind.transferEth,
    amount: amount!,
    address: address!,
  })
    .pipe(
      transactionToX<TokenSendChange, TransferEthData>(
        { kind: 'stage', stage: 'sendWaiting4Approval' },
        (txState: any) =>
          of(
            { kind: 'sendTxHash', sendTxHash: txState.txHash as string },
            { kind: 'stage', stage: 'sendInProgress' },
          ),
        { kind: 'stage', stage: 'sendFiasco' },
        () => of({ kind: 'stage', stage: 'sendSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  txHelpers: TxHelpers,
  change: (ch: TokenSendChange) => void,
  state: TokenSendState,
): TokenSendState {
  if (state.stage === 'sendWaiting4Confirmation') {
    return {
      ...state,
      sendEth: () => sendEth(txHelpers, change, state),
      sendDai: () => sendErc20(txHelpers, change, state),
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }
  if (state.stage === 'sendFiasco') {
    return {
      ...state,
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }
  if (state.stage === 'readingQrCode') {
    return { ...state, change, reset: () => change({ kind: 'stage', stage: 'editing' }) }
  }
  if (state.stage === 'editing') {
    if (state.messages.length === 0) {
      return {
        ...state,
        change,
        showQrCode: () => {
          change({ kind: 'address', address: '' })
          change({ kind: 'stage', stage: 'readingQrCode' })
        },
        proceed: () => change({ kind: 'stage', stage: 'sendWaiting4Confirmation' }),
      }
    }
    return {
      ...state,
      change,
      showQrCode: () => {
        change({ kind: 'address', address: '' })
        change({ kind: 'stage', stage: 'readingQrCode' })
      },
    }
  }

  return state
}

// TODO: gas validation
function validate(state: TokenSendState): TokenSendState {
  const { amount, address, activeToken } = state
  const messages: TokenSendMessage[] = []
  if (!amount || amount.eq(zero)) {
    messages[messages.length] = { kind: 'amountIsEmpty' }
  }

  if (activeToken && amount && amount.gt(state[activeToken.toLowerCase() as 'dai' | 'eth'])) {
    messages[messages.length] = { kind: 'amountMoreThanBalance' }
  }

  if (!address || !Web3.utils.isAddress(address)) {
    messages[messages.length] = { kind: 'addressInvalid' }
  }

  return { ...state, messages }
}

function constructEstimateGas(
  addGasEstimation: AddGasEstimationFunction,
  state: TokenSendState,
): Observable<TokenSendState> {
  return addGasEstimation(state, ({ estimateGas }: TxHelpers) => {
    const { messages, amount, activeToken, address } = state

    if (!address || !activeToken || !amount || messages.length > 0) {
      return undefined
    }

    const args = { amount, address }

    if (activeToken === 'ETH') {
      return estimateGas(transferEth, { ...args, kind: TxMetaKind.transferEth })
    }

    return estimateGas(transferErc20, {
      ...args,
      token: activeToken,
      kind: TxMetaKind.transferErc20,
    })
  })
}

export function createTokenSend$(
  dashboard$: Observable<Dashboard>,
  txHelper$: Observable<TxHelpers>,
  addGasEstimation: AddGasEstimationFunction,
): Observable<TokenSendState> {
  return txHelper$.pipe(
    switchMap((txHelper) => {
      const change$ = new Subject<TokenSendChange>()
      function change(ch: TokenSendChange) {
        change$.next(ch)
      }

      const initialState: TokenSendState = {
        stage: 'editing',
        messages: [],
        dai: zero,
        daiUSD: zero,
        eth: zero,
        ethUSD: zero,
        canProceed: false,
        gasEstimationStatus: GasEstimationStatus.unset,
      }

      const tokenChange$ = dashboard$.pipe(
        map(({ dai, daiUSD, eth, ethUSD }) => ({ kind: 'token', dai, daiUSD, eth, ethUSD })),
      )

      return merge(change$, tokenChange$).pipe(
        scan(applyChange, initialState),
        map(validate),
        switchMap(curry(constructEstimateGas)(addGasEstimation)),
        map(curry(addTransitions)(txHelper, change)),
        map((state) => ({
          ...state,
          canProceed:
            (state.stage !== 'editing' && state.stage !== 'readingQrCode') ||
            !state.messages.length,
        })),
      )
    }),
  )
}
