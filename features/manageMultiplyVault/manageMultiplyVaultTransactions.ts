import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import {
  adjustMultiplyVault,
  closeVaultCall,
  depositAndGenerate,
  DepositAndGenerateData,
  MultiplyAdjustData,
  withdrawAndPayback,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { iif, Observable, of } from 'rxjs'
import { filter, first, switchMap } from 'rxjs/operators'

import { ManageMultiplyVaultChange, ManageMultiplyVaultState } from './manageMultiplyVault'

type ProxyChange =
  | {
      kind: 'proxyWaitingForApproval'
    }
  | {
      kind: 'proxyInProgress'
      proxyTxHash: string
    }
  | {
      kind: 'proxyFailure'
      txError?: any
    }
  | {
      kind: 'proxyConfirming'
      proxyConfirmations?: number
    }
  | {
      kind: 'proxySuccess'
      proxyAddress: string
    }

type CollateralAllowanceChange =
  | { kind: 'collateralAllowanceWaitingForApproval' }
  | {
      kind: 'collateralAllowanceInProgress'
      collateralAllowanceTxHash: string
    }
  | {
      kind: 'collateralAllowanceFailure'
      txError?: any
    }
  | {
      kind: 'collateralAllowanceSuccess'
      collateralAllowance: BigNumber
    }

type DaiAllowanceChange =
  | { kind: 'daiAllowanceWaitingForApproval' }
  | {
      kind: 'daiAllowanceInProgress'
      daiAllowanceTxHash: string
    }
  | {
      kind: 'daiAllowanceFailure'
      txError?: any
    }
  | {
      kind: 'daiAllowanceSuccess'
      daiAllowance: BigNumber
    }

type ManageChange =
  | { kind: 'manageWaitingForApproval' }
  | {
      kind: 'manageInProgress'
      manageTxHash: string
    }
  | {
      kind: 'manageFailure'
      txError?: any
    }
  | {
      kind: 'manageSuccess'
    }

export type ManageVaultTransactionChange =
  | ProxyChange
  | CollateralAllowanceChange
  | DaiAllowanceChange
  | ManageChange

export function applyManageVaultTransaction(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (change.kind === 'proxyWaitingForApproval') {
    return {
      ...state,
      stage: 'proxyWaitingForApproval',
    }
  }

  if (change.kind === 'proxyInProgress') {
    const { proxyTxHash } = change
    return {
      ...state,
      stage: 'proxyInProgress',
      proxyTxHash,
    }
  }

  if (change.kind === 'proxyFailure') {
    const { txError } = change
    return { ...state, stage: 'proxyFailure', txError }
  }

  if (change.kind === 'proxyConfirming') {
    const { proxyConfirmations } = change
    return {
      ...state,
      proxyConfirmations,
    }
  }

  if (change.kind === 'proxySuccess') {
    const { proxyAddress } = change
    return {
      ...state,
      proxyAddress,
      stage: 'proxySuccess',
    }
  }

  if (change.kind === 'collateralAllowanceWaitingForApproval') {
    return {
      ...state,
      stage: 'collateralAllowanceWaitingForApproval',
    }
  }

  if (change.kind === 'collateralAllowanceInProgress') {
    const { collateralAllowanceTxHash } = change
    return {
      ...state,
      collateralAllowanceTxHash,
      stage: 'collateralAllowanceInProgress',
    }
  }

  if (change.kind === 'collateralAllowanceFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'collateralAllowanceFailure',
      txError,
    }
  }

  if (change.kind === 'collateralAllowanceSuccess') {
    const { collateralAllowance } = change
    return { ...state, stage: 'collateralAllowanceSuccess', collateralAllowance }
  }

  if (change.kind === 'daiAllowanceWaitingForApproval') {
    return {
      ...state,
      stage: 'daiAllowanceWaitingForApproval',
    }
  }

  if (change.kind === 'daiAllowanceInProgress') {
    const { daiAllowanceTxHash } = change
    return {
      ...state,
      daiAllowanceTxHash,
      stage: 'daiAllowanceInProgress',
    }
  }

  if (change.kind === 'daiAllowanceFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'daiAllowanceFailure',
      txError,
    }
  }

  if (change.kind === 'daiAllowanceSuccess') {
    const { daiAllowance } = change
    return { ...state, stage: 'daiAllowanceSuccess', daiAllowance }
  }

  if (change.kind === 'manageWaitingForApproval') {
    return {
      ...state,
      stage: 'manageWaitingForApproval',
    }
  }

  if (change.kind === 'manageInProgress') {
    const { manageTxHash } = change
    return {
      ...state,
      manageTxHash,
      stage: 'manageInProgress',
    }
  }

  if (change.kind === 'manageFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'manageFailure',
      txError,
    }
  }

  if (change.kind === 'manageSuccess') {
    return { ...state, stage: 'manageSuccess' }
  }

  return state
}

export function adjustPosition(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageMultiplyVaultChange) => void,
  {
    account,
    proxyAddress,
    vault: { ilk, token, id },
    exchangeAction,
    debtDelta,
    depositAmount,
    collateralDelta,
    swap,
    slippage,
  }: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(adjustMultiplyVault, {
          kind: TxMetaKind.adjustPosition,
          depositCollateral: depositAmount || zero,
          requiredDebt: debtDelta?.abs() || zero,
          borrowedCollateral: collateralDelta?.abs() || zero,
          userAddress: account!,
          proxyAddress: proxyAddress!,
          exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '',
          exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '',
          slippage: slippage,
          action: exchangeAction!,
          token,
          id,
          ilk,
        }).pipe(
          transactionToX<ManageMultiplyVaultChange, MultiplyAdjustData>(
            { kind: 'manageWaitingForApproval' },
            (txState) =>
              of({
                kind: 'manageInProgress',
                manageTxHash: (txState as any).txHash as string,
              }),
            (txState) => {
              return of({
                kind: 'manageFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              })
            },
            () => of({ kind: 'manageSuccess' }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function manageVaultDepositAndGenerate(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageMultiplyVaultChange) => void,
  {
    proxyAddress,
    vault: { ilk, token, id },
    depositAmount = zero,
    generateAmount = zero,
  }: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(depositAndGenerate, {
          kind: TxMetaKind.depositAndGenerate,
          generateAmount,
          depositAmount,
          proxyAddress: proxyAddress!,
          ilk,
          token,
          id,
        }).pipe(
          transactionToX<ManageMultiplyVaultChange, DepositAndGenerateData>(
            { kind: 'manageWaitingForApproval' },
            (txState) =>
              of({
                kind: 'manageInProgress',
                manageTxHash: (txState as any).txHash as string,
              }),
            (txState) => {
              return of({
                kind: 'manageFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              })
            },
            () => of({ kind: 'manageSuccess' }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}
export function manageVaultWithdrawAndPayback(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageMultiplyVaultChange) => void,
  {
    proxyAddress,
    vault: { ilk, token, id },
    shouldPaybackAll,
    withdrawAmount = zero,
    paybackAmount = zero,
  }: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(withdrawAndPayback, {
          kind: TxMetaKind.withdrawAndPayback,
          withdrawAmount,
          paybackAmount,
          proxyAddress: proxyAddress!,
          ilk,
          token,
          id,
          shouldPaybackAll,
        }).pipe(
          transactionToX<ManageMultiplyVaultChange, WithdrawAndPaybackData>(
            { kind: 'manageWaitingForApproval' },
            (txState) =>
              of({
                kind: 'manageInProgress',
                manageTxHash: (txState as any).txHash as string,
              }),
            (txState) => {
              return of({
                kind: 'manageFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              })
            },
            () => of({ kind: 'manageSuccess' }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function setDaiAllowance(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageMultiplyVaultChange) => void,
  state: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(approve, {
          kind: TxMetaKind.approve,
          token: 'DAI',
          spender: state.proxyAddress!,
          amount: state.daiAllowanceAmount!,
        }).pipe(
          transactionToX<ManageMultiplyVaultChange, ApproveData>(
            { kind: 'daiAllowanceWaitingForApproval' },
            (txState) =>
              of({
                kind: 'daiAllowanceInProgress',
                daiAllowanceTxHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                kind: 'daiAllowanceFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => of({ kind: 'daiAllowanceSuccess', daiAllowance: txState.meta.amount }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function setCollateralAllowance(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageMultiplyVaultChange) => void,
  state: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(approve, {
          kind: TxMetaKind.approve,
          token: state.vault.token,
          spender: state.proxyAddress!,
          amount: state.collateralAllowanceAmount!,
        }).pipe(
          transactionToX<ManageMultiplyVaultChange, ApproveData>(
            { kind: 'collateralAllowanceWaitingForApproval' },
            (txState) =>
              of({
                kind: 'collateralAllowanceInProgress',
                collateralAllowanceTxHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                kind: 'collateralAllowanceFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) =>
              of({
                kind: 'collateralAllowanceSuccess',
                collateralAllowance: txState.meta.amount,
              }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function createProxy(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageMultiplyVaultChange) => void,
  { safeConfirmations }: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy }).pipe(
          transactionToX<ManageMultiplyVaultChange, CreateDsProxyData>(
            { kind: 'proxyWaitingForApproval' },
            (txState) =>
              of({
                kind: 'proxyInProgress',
                proxyTxHash: (txState as any).txHash as string,
              }),
            (txState) =>
              of({
                kind: 'proxyFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => {
              return proxyAddress$.pipe(
                filter((proxyAddress) => !!proxyAddress),
                switchMap((proxyAddress) => {
                  return iif(
                    () => (txState as any).confirmations < safeConfirmations,
                    of({
                      kind: 'proxyConfirming',
                      proxyConfirmations: (txState as any).confirmations,
                    }),
                    of({ kind: 'proxySuccess', proxyAddress: proxyAddress! }),
                  )
                }),
              )
            },
            safeConfirmations,
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function closeVault(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageMultiplyVaultChange) => void,
  {
    proxyAddress,
    vault: { ilk, token, id, lockedCollateral, debt },
    closeVaultTo,
    slippage,
    swap,
    account,
  }: ManageMultiplyVaultState,
) {
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) =>
        sendWithGasEstimation(closeVaultCall, {
          kind: TxMetaKind.closeVault,
          closeTo: closeVaultTo!,
          token,
          ilk,
          id,
          slippage: slippage,
          exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '',
          exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '',
          userAddress: account!,
          totalCollateral: lockedCollateral,
          totalDebt: debt,
          marketPrice: swap?.status === 'SUCCESS' ? swap.tokenPrice : zero,
          proxyAddress: proxyAddress!,
        }).pipe(
          transactionToX<ManageMultiplyVaultChange, WithdrawAndPaybackData>(
            { kind: 'manageWaitingForApproval' },
            (txState) =>
              of({
                kind: 'manageInProgress',
                manageTxHash: (txState as any).txHash as string,
              }),
            (txState) => {
              return of({
                kind: 'manageFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              })
            },
            () => of({ kind: 'manageSuccess' }),
          ),
        ),
      ),
    )
    .subscribe((ch) => change(ch))
}
