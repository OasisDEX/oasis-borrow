// @ts-nocheck
import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelEventTypes } from 'analytics/types'
import type BigNumber from 'bignumber.js'
import { createDsProxy } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import { setDsrAllowance } from 'features/allowance/setAllowance'
import { createProxy } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultTransactions'
import { convertDsr, depositDsr, withdrawDsr } from 'features/dsr/helpers/actions'
import type { DsrSidebarTabOptions } from 'features/dsr/helpers/dsrDeposit.types'
import type { DaiDepositChange } from 'features/dsr/pipes/dsrWithdraw'
import { applyDsrAllowanceChanges } from 'features/dsr/utils/applyDsrAllowance'
import type { Dsr } from 'features/dsr/utils/createDsr'
import { applyProxyChanges } from 'features/proxy/proxy'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import type { ApplyChange } from 'helpers/form'
import { applyChange } from 'helpers/form'
import { combineApplyChanges } from 'helpers/pipelines/combineApply'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, merge, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import type {
  DaiBalanceChange,
  DsrCreationChange,
  DsrDepositMessage,
  DsrDepositState,
  SDaiBalanceChange,
  WalletAddressChange,
} from './dsrDeposit.types'
import { exit, join, savingsDaiConvert, savingsDaiDeposit } from './potCalls'

export function applyOther(state: DsrDepositState, change) {
  if (change.kind === 'progressAllowance') {
    return {
      ...state,
      stage: 'editing',
      selectedAllowanceRadio: undefined,
    }
  }

  if (change.kind === 'operation') {
    return {
      ...state,
      operation: change.operation,
      amount: undefined,
      stage: 'editing',
    }
  }

  return { ...state, change }
}

const apply: ApplyChange<DsrDepositState> = combineApplyChanges(
  applyChange,
  applyProxyChanges,
  (state, change) => applyDsrAllowanceChanges({ ...state, depositAmount: state.amount }, change),
  applyOther,
)

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: DsrCreationChange) => void,
  chainId: NetworkIds,
  walletType: string,
  state: DsrDepositState,
): DsrDepositState {
  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'amount', amount: undefined })
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      proxyProceed: () => createProxy(txHelpers$, proxyAddress$, change, { safeConfirmations: 6 }),
      proxyBack: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      proxyProceed: () =>
        change({
          kind: 'progressProxy',
        }),
    }
  }

  if (state.stage === 'allowanceWaitingForConfirmation' || state.stage === 'allowanceFailure') {
    return {
      ...state,
      updateAllowanceAmount: (allowanceAmount?: BigNumber) =>
        change({
          kind: 'allowanceAmount',
          allowanceAmount,
        }),
      setAllowanceAmountUnlimited: () => change({ kind: 'allowanceUnlimited' }),
      setAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'allowanceAsDepositAmount',
        }),
      setAllowanceAmountCustom: () =>
        change({
          kind: 'allowanceCustom',
        }),
      progress: () => {
        return setDsrAllowance(txHelpers$, change, state)
      },
      regress: () => change({ kind: 'regressAllowance' }),
    }
  }

  if (state.stage === 'allowanceSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'progressAllowance',
        }),
    }
  }

  // if (state.stage === 'allowanceWaiting4Confirmation') {
  //   return {
  //     ...state,
  //     reset,
  //     setAllowance: () => setAllowance(txHelpers, change, state),
  //   }
  // }

  if (state.stage === 'depositWaiting4Confirmation') {
    return {
      ...state,
      deposit: () => depositDsr(txHelpers$, change, state),
      back: () => change({ kind: 'stage', stage: 'editing' }),
      reset,
    }
  }

  if (state.stage === 'withdrawWaiting4Confirmation') {
    return {
      ...state,
      withdraw: () => withdrawDsr(txHelpers$, change, state),
      back: () => change({ kind: 'stage', stage: 'editing' }),
      reset,
    }
  }

  if (state.stage === 'depositSuccess' || state.stage === 'withdrawSuccess') {
    trackingEvents.daiSavingsRate(MixpanelEventTypes.ButtonClick, {
      depositAmount: state.amount?.toNumber(),
      txHash: state.depositTxHash,
      network: getNetworkById(chainId).name,
      walletType,
      isMintingSDai: state.isMintingSDai,
      operation: state.operation,
    })
    return {
      ...state,
      reset,
    }
  }

  if (
    state.stage === 'editing' ||
    state.stage === 'depositFiasco' ||
    state.stage === 'withdrawFiasco'
  ) {
    if (
      state.amount &&
      !state.proxyAddress &&
      state.operation !== 'convert' &&
      !state.isMintingSDai
    ) {
      return {
        ...state,
        deposit: () => change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' }),
        change,
        reset,
      }
    }
    if (
      state.amount?.gt(
        state.isMintingSDai ? state.daiWalletAllowance || zero : state.allowance || zero,
      ) &&
      state.operation === 'deposit'
    ) {
      return {
        ...state,
        deposit: () => change({ kind: 'stage', stage: 'allowanceWaitingForConfirmation' }),
        change,
        reset,
      }
    }
    if (state.messages.length === 0) {
      if (state.operation === 'deposit') {
        return {
          ...state,
          change,
          proceed: () => change({ kind: 'stage', stage: 'depositWaiting4Confirmation' }),
          reset,
          deposit: () => depositDsr(txHelpers$, change, state),
        }
      }

      if (state.operation === 'withdraw') {
        return {
          ...state,
          change,
          proceed: () => change({ kind: 'stage', stage: 'withdrawWaiting4Confirmation' }),
          reset,
          withdraw: () => withdrawDsr(txHelpers$, change, state),
        }
      }
      if (state.operation === 'convert') {
        return {
          ...state,
          change,
          proceed: () => change({ kind: 'stage', stage: 'withdrawWaiting4Confirmation' }),
          reset,
          convert: () => convertDsr(txHelpers$, change, state),
        }
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
  if (
    state.amount &&
    state.daiBalance &&
    state.amount.gt(state.daiBalance) &&
    state.operation === 'deposit'
  ) {
    messages[messages.length] = { kind: 'amountBiggerThanBalance' }
  }
  if (
    state.amount &&
    state.netValue &&
    state.amount.gt(state.netValue) &&
    state.operation === 'withdraw'
  ) {
    messages[messages.length] = { kind: 'amountBiggerThanDeposit' }
  }
  return { ...state, messages }
}

function constructEstimateGas(
  addGasEstimation: AddGasEstimationFunction,
  state: DsrDepositState,
): Observable<DsrDepositState> {
  return addGasEstimation(state, ({ estimateGas }: TxHelpers) => {
    const { messages, amount, proxyAddress, walletAddress, operation, isMintingSDai } = state

    if (
      state.stage === 'proxyWaitingForConfirmation' ||
      state.stage === 'proxyFailure' ||
      state.stage === 'proxyWaitingForApproval'
    ) {
      return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
    }

    if (!amount || messages.length > 0) {
      return undefined
    }

    if (operation === 'convert') {
      const convertArgs = {
        amount: amount.gt(state.sDaiBalance) ? state.sDaiBalance : amount,
        walletAddress,
      }
      return estimateGas(
        savingsDaiConvert as any,
        { ...convertArgs, kind: TxMetaKind.savingsDaiConvert } as any,
      )
    }

    if (isMintingSDai) {
      const sDaiArgs = { amount, walletAddress }
      return estimateGas(
        savingsDaiDeposit as any,
        { ...sDaiArgs, kind: TxMetaKind.savingsDaiDeposit } as any,
      )
    }

    if (!proxyAddress) {
      return undefined
    }

    const args = { amount, proxyAddress }

    if (state.operation === 'withdraw') {
      return estimateGas(exit as any, { ...args, kind: TxMetaKind.dsrExit } as any)
    }

    return estimateGas(join as any, { ...args, kind: TxMetaKind.dsrJoin } as any)
  })
}

export function createDsrDeposit$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  balancesInfoArray$: Observable<BigNumber[]>,
  daiDeposit$: Observable<BigNumber>,
  potDsr$: Observable<BigNumber>,
  dsr$: Observable<Dsr>, // TODO make use of it instead fetching dsrOverview separately
  addGasEstimation$: AddGasEstimationFunction,
  addressFromUrl: string,
): Observable<DsrDepositState> {
  return combineLatest(context$, proxyAddress$, balancesInfoArray$, daiDeposit$, potDsr$).pipe(
    first(),
    switchMap(([context, proxyAddress, balances, daiDeposit, potDsr]) => {
      const {
        tokens: { SDAI },
      } = getNetworkContracts(NetworkIds.MAINNET)
      return combineLatest(
        proxyAddress && context.status === 'connected' && context.account
          ? [
              allowance$('DAI', context.account, proxyAddress),
              allowance$('DAI', context.account, SDAI.address),
            ]
          : [of(undefined), allowance$('DAI', addressFromUrl, SDAI.address)],
      ).pipe(
        first(),
        switchMap(([daiProxyAllowance, daiWalletAllowance]) => {
          const change$ = new Subject<DsrCreationChange>()
          function change(ch: DsrCreationChange) {
            change$.next(ch)
          }

          const daiDepositChange$: Observable<DaiDepositChange> = daiDeposit$.pipe(
            map((daiDeposit) => ({ kind: 'daiDeposit', daiDeposit })),
          )

          const netValueChange$: Observable<any> = dsr$.pipe(
            map((dsr) => ({ kind: 'netValue', netValue: dsr?.pots?.dsr?.value?.dai })),
          )

          const initialState: DsrDepositState = {
            daiDeposit,
            potDsr,
            stage: 'editing',
            daiBalance: balances[0],
            sDaiBalance: balances[1],
            allowance: daiProxyAllowance,
            daiWalletAllowance,
            proxyAddress: proxyAddress!,
            walletAddress: context.account!,
            messages: [],
            gasEstimationStatus: GasEstimationStatus.unset,
            depositAmount: zero,
            isMintingSDai: false,
            token: 'DAI',
            operation: 'deposit',
            operationChange: (operation: DsrSidebarTabOptions) =>
              change({ kind: 'operation', operation }),
            change,
          }

          const daiBalanceChange$: Observable<DaiBalanceChange> = balancesInfoArray$.pipe(
            map(([daiBalance]) => ({ kind: 'daiBalance', daiBalance })),
          )

          const sDaiBalanceChange$: Observable<SDaiBalanceChange> = balancesInfoArray$.pipe(
            map(([_, sDaiBalance]) => ({ kind: 'sDaiBalance', sDaiBalance })),
          )

          const walletAddressChange$: Observable<WalletAddressChange> = context$.pipe(
            map((context) => ({ kind: 'walletAddress', walletAddress: context.account })),
          )

          return merge(
            change$,
            daiBalanceChange$,
            sDaiBalanceChange$,
            daiDepositChange$,
            netValueChange$,
            walletAddressChange$,
          ).pipe(
            scan(apply, initialState),
            map(validate),
            switchMap(curry(constructEstimateGas)(addGasEstimation$)),
            map(
              curry(addTransitions)(
                txHelpers$,
                proxyAddress$,
                change,
                context.chainId,
                context.walletLabel,
              ),
            ),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
