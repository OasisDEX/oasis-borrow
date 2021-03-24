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

export function createProxy(
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageVaultChange) => void,
  { safeConfirmations }: ManageVaultState,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<ManageVaultChange, CreateDsProxyData>(
        { stage: 'proxyWaitingForApproval' },
        (txState) =>
          of({ proxyTxHash: (txState as any).txHash as string, stage: 'proxyInProgress' }),
        (txState) => {
          return of({
            stage: 'proxyFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        (txState) => {
          return proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              iif(
                () => (txState as any).confirmations < safeConfirmations,
                of({
                  proxyConfirmations: (txState as any).confirmations,
                  proxyAddress: proxyAddress!,
                  stage: 'proxySuccess',
                }),
              ),
            ),
          )
        },
        safeConfirmations,
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
        { stage: 'collateralAllowanceWaitingForApproval' },
        (txState) =>
          of({
            collateralAllowanceTxHash: (txState as any).txHash as string,
            stage: 'collateralAllowanceInProgress',
          }),
        (txState) => {
          return of({
            stage: 'collateralAllowanceFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        () =>
          collateralAllowance$.pipe(
            switchMap((collateralAllowance) =>
              of({ collateralAllowance, stage: 'collateralAllowanceSuccess' }),
            ),
          ),
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
        { stage: 'daiAllowanceWaitingForApproval' },
        (txState) =>
          of({
            daiAllowanceTxHash: (txState as any).txHash as string,
            stage: 'daiAllowanceInProgress',
          }),
        (txState) => {
          return of({
            stage: 'daiAllowanceFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        () =>
          daiAllowance$.pipe(
            switchMap((daiAllowance) => of({ daiAllowance, stage: 'daiAllowanceSuccess' })),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
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
        { stage: 'manageWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'manageTxHash', manageTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'manageInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'manageFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () => of({ kind: 'stage', stage: 'manageSuccess' }),
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
        { stage: 'manageWaitingForApproval' },
        (txState) =>
          of({ manageTxHash: (txState as any).txHash as string, stage: 'manageInProgress' }),
        (txState) => {
          return of({
            stage: 'manageFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        () => of({ stage: 'manageSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}
