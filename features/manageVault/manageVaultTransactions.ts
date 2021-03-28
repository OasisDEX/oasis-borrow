import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import {
  depositAndGenerate,
  DepositAndGenerateData,
  withdrawAndPayback,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TxHelpers } from 'components/AppContext'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { iif, Observable, of } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

import { ManageVaultChange, ManageVaultState } from './manageVault'

export enum ManageVaultTransactionKind {
  proxyWaitingForApproval = 'proxyWaitingForApproval',
  proxyInProgress = 'proxyInProgress',
  proxyFailure = 'proxyFailure',
  proxyConfirming = 'proxyConfirming',
  proxySuccess = 'proxySuccess',

  collateralAllowanceWaitingForApproval = 'collateralAllowanceWaitingForApproval',
  collateralAllowanceInProgress = 'collateralAllowanceInProgress',
  collateralAllowanceFailure = 'collateralAllowanceFailure',
  collateralAllowanceSuccess = 'collateralAllowanceSuccess',

  daiAllowanceWaitingForApproval = 'daiAllowanceWaitingForApproval',
  daiAllowanceInProgress = 'daiAllowanceInProgress',
  daiAllowanceFailure = 'daiAllowanceFailure',
  daiAllowanceSuccess = 'daiAllowanceSuccess',

  manageWaitingForApproval = 'manageWaitingForApproval',
  manageInProgress = 'manageInProgress',
  manageFailure = 'manageFailure',
  manageSuccess = 'manageSuccess',
}

export type ManageVaultTransactionChange =
  | {
      kind: ManageVaultTransactionKind.proxyWaitingForApproval
    }
  | {
      kind: ManageVaultTransactionKind.proxyInProgress
      proxyTxHash: string
    }
  | {
      kind: ManageVaultTransactionKind.proxyFailure
      txError?: any
    }
  | {
      kind: ManageVaultTransactionKind.proxyConfirming
      proxyConfirmations?: number
    }
  | {
      kind: ManageVaultTransactionKind.proxySuccess
      proxyAddress: string
    }
  | { kind: ManageVaultTransactionKind.collateralAllowanceWaitingForApproval }
  | {
      kind: ManageVaultTransactionKind.collateralAllowanceInProgress
      collateralAllowanceTxHash: string
    }
  | {
      kind: ManageVaultTransactionKind.collateralAllowanceFailure
      txError?: any
    }
  | {
      kind: ManageVaultTransactionKind.collateralAllowanceSuccess
      collateralAllowance: BigNumber
    }
  | { kind: ManageVaultTransactionKind.daiAllowanceWaitingForApproval }
  | {
      kind: ManageVaultTransactionKind.daiAllowanceInProgress
      daiAllowanceTxHash: string
    }
  | {
      kind: ManageVaultTransactionKind.daiAllowanceFailure
      txError?: any
    }
  | {
      kind: ManageVaultTransactionKind.daiAllowanceSuccess
      daiAllowance: BigNumber
    }
  | { kind: ManageVaultTransactionKind.manageWaitingForApproval }
  | {
      kind: ManageVaultTransactionKind.manageInProgress
      manageTxHash: string
    }
  | {
      kind: ManageVaultTransactionKind.manageFailure
      txError?: any
    }
  | {
      kind: ManageVaultTransactionKind.manageSuccess
    }

export function applyManageVaultTransaction(
  change: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
  if (change.kind === ManageVaultTransactionKind.proxyWaitingForApproval) {
    return {
      ...state,
      stage: 'proxyWaitingForApproval',
    }
  }

  if (change.kind === ManageVaultTransactionKind.proxyInProgress) {
    const { proxyTxHash } = change
    return {
      ...state,
      stage: 'proxyInProgress',
      proxyTxHash,
    }
  }

  if (change.kind === ManageVaultTransactionKind.proxyFailure) {
    const { txError } = change
    return { ...state, stage: 'proxyFailure', txError }
  }

  if (change.kind === ManageVaultTransactionKind.proxyConfirming) {
    const { proxyConfirmations } = change
    return {
      ...state,
      proxyConfirmations,
    }
  }

  if (change.kind === ManageVaultTransactionKind.proxySuccess) {
    const { proxyAddress } = change
    return {
      ...state,
      proxyAddress,
      stage: 'proxySuccess',
    }
  }

  if (change.kind === ManageVaultTransactionKind.collateralAllowanceWaitingForApproval) {
    return {
      ...state,
      stage: 'collateralAllowanceWaitingForApproval',
    }
  }

  if (change.kind === ManageVaultTransactionKind.collateralAllowanceInProgress) {
    const { collateralAllowanceTxHash } = change
    return {
      ...state,
      collateralAllowanceTxHash,
      stage: 'collateralAllowanceInProgress',
    }
  }

  if (change.kind === ManageVaultTransactionKind.collateralAllowanceFailure) {
    const { txError } = change
    return {
      ...state,
      stage: 'collateralAllowanceFailure',
      txError,
    }
  }

  if (change.kind === ManageVaultTransactionKind.collateralAllowanceSuccess) {
    const { collateralAllowance } = change
    return { ...state, stage: 'collateralAllowanceSuccess', collateralAllowance }
  }

  if (change.kind === ManageVaultTransactionKind.daiAllowanceWaitingForApproval) {
    return {
      ...state,
      stage: 'daiAllowanceWaitingForApproval',
    }
  }

  if (change.kind === ManageVaultTransactionKind.daiAllowanceInProgress) {
    const { daiAllowanceTxHash } = change
    return {
      ...state,
      daiAllowanceTxHash,
      stage: 'daiAllowanceInProgress',
    }
  }

  if (change.kind === ManageVaultTransactionKind.daiAllowanceFailure) {
    const { txError } = change
    return {
      ...state,
      stage: 'daiAllowanceFailure',
      txError,
    }
  }

  if (change.kind === ManageVaultTransactionKind.daiAllowanceSuccess) {
    const { daiAllowance } = change
    return { ...state, stage: 'daiAllowanceSuccess', daiAllowance }
  }

  if (change.kind === ManageVaultTransactionKind.manageWaitingForApproval) {
    return {
      ...state,
      stage: 'manageWaitingForApproval',
    }
  }

  if (change.kind === ManageVaultTransactionKind.manageInProgress) {
    const { manageTxHash } = change
    return {
      ...state,
      manageTxHash,
      stage: 'manageInProgress',
    }
  }

  if (change.kind === ManageVaultTransactionKind.manageFailure) {
    const { txError } = change
    return {
      ...state,
      stage: 'manageFailure',
      txError,
    }
  }

  if (change.kind === ManageVaultTransactionKind.manageSuccess) {
    return { ...state, stage: 'daiAllowanceSuccess' }
  }

  return state
}

export function manageVaultDepositAndGenerate(
  { send }: TxHelpers,
  change: (ch: ManageVaultChange) => void,
  { generateAmount, depositAmount, proxyAddress, ilk, token, id }: ManageVaultState,
) {
  send(depositAndGenerate, {
    kind: TxMetaKind.depositAndGenerate,
    generateAmount: generateAmount || zero,
    depositAmount: depositAmount || zero,
    proxyAddress: proxyAddress!,
    ilk,
    token,
    id,
  })
    .pipe(
      transactionToX<ManageVaultChange, DepositAndGenerateData>(
        { kind: ManageVaultTransactionKind.manageWaitingForApproval },
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.manageInProgress,
            manageTxHash: (txState as any).txHash as string,
          }),
        (txState) => {
          return of({
            kind: ManageVaultTransactionKind.manageFailure,
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        () => of({ kind: ManageVaultTransactionKind.manageSuccess }),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function manageVaultWithdrawAndPayback(
  { send }: TxHelpers,
  change: (ch: ManageVaultChange) => void,
  { withdrawAmount, paybackAmount, proxyAddress, ilk, token, id }: ManageVaultState,
) {
  send(withdrawAndPayback, {
    kind: TxMetaKind.withdrawAndPayback,
    withdrawAmount: withdrawAmount || zero,
    paybackAmount: paybackAmount || zero,
    proxyAddress: proxyAddress!,
    ilk,
    token,
    id,
  })
    .pipe(
      transactionToX<ManageVaultChange, WithdrawAndPaybackData>(
        { kind: ManageVaultTransactionKind.manageWaitingForApproval },
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.manageInProgress,
            manageTxHash: (txState as any).txHash as string,
          }),
        (txState) => {
          return of({
            kind: ManageVaultTransactionKind.manageFailure,
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        () => of({ kind: ManageVaultTransactionKind.manageSuccess }),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function setDaiAllowance(
  { sendWithGasEstimation }: TxHelpers,
  daiAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: 'DAI',
    spender: state.proxyAddress!,
    amount: state.daiAllowanceAmount!,
  })
    .pipe(
      transactionToX<ManageVaultChange, ApproveData>(
        { kind: ManageVaultTransactionKind.daiAllowanceWaitingForApproval },
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.daiAllowanceInProgress,
            daiAllowanceTxHash: (txState as any).txHash as string,
          }),
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.daiAllowanceFailure,
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        () =>
          daiAllowance$.pipe(
            switchMap((daiAllowance) =>
              of({ kind: ManageVaultTransactionKind.daiAllowanceSuccess, daiAllowance }),
            ),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function setCollateralAllowance(
  { sendWithGasEstimation }: TxHelpers,
  collateralAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
    amount: state.collateralAllowanceAmount!,
  })
    .pipe(
      transactionToX<ManageVaultChange, ApproveData>(
        { kind: ManageVaultTransactionKind.collateralAllowanceWaitingForApproval },
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.collateralAllowanceInProgress,
            collateralAllowanceTxHash: (txState as any).txHash as string,
          }),
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.collateralAllowanceFailure,
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        () =>
          collateralAllowance$.pipe(
            switchMap((collateralAllowance) =>
              of({
                kind: ManageVaultTransactionKind.collateralAllowanceSuccess,
                collateralAllowance,
              }),
            ),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function createProxy(
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageVaultChange) => void,
  { safeConfirmations }: ManageVaultState,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<ManageVaultChange, CreateDsProxyData>(
        { kind: ManageVaultTransactionKind.proxyWaitingForApproval },
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.proxyInProgress,
            proxyTxHash: (txState as any).txHash as string,
          }),
        (txState) =>
          of({
            kind: ManageVaultTransactionKind.proxyFailure,
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        (txState) =>
          proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              iif(
                () => (txState as any).confirmations < safeConfirmations,
                of({
                  kind: ManageVaultTransactionKind.proxyConfirming,
                  proxyConfirmations: (txState as any).confirmations,
                }),
                of({ kind: ManageVaultTransactionKind.proxySuccess, proxyAddress: proxyAddress! }),
              ),
            ),
          ),
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}
