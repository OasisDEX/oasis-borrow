import { TxStatus } from '@oasisdex/transactions'
import { approve } from 'blockchain/calls/erc20'
import type { ApproveData } from 'blockchain/calls/erc20.types'
import type { CreateDsProxyData } from 'blockchain/calls/proxy'
import { createDsProxy } from 'blockchain/calls/proxy'
import type {
  DepositAndGenerateData,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { StandardDssProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/standardDssProxyActionsContractAdapter'
import type { MultiplyAdjustData } from 'blockchain/calls/proxyActions/proxyActions'
import { adjustMultiplyVault, closeVaultCall } from 'blockchain/calls/proxyActions/proxyActions'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { getQuote$, getTokenMetaData } from 'features/exchange/exchange'
import { checkIfGnosisSafe } from 'helpers/checkIfGnosisSafe'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { transactionToX } from 'helpers/form'
import { OAZO_FEE, SLIPPAGE } from 'helpers/multiply/calculations.constants'
import { one, zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { iif, of } from 'rxjs'
import { catchError, filter, first, startWith, switchMap } from 'rxjs/operators'

import type { ManageMultiplyVaultChange } from './ManageMultiplyVaultChange.types'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export function applyManageVaultTransaction<VS extends ManageMultiplyVaultState>(
  change: ManageMultiplyVaultChange,
  state: VS,
): VS {
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
  { chainId, walletLabel, web3 }: Context,
  change: (ch: ManageMultiplyVaultChange) => void,
  {
    account,
    proxyAddress,
    vault: { ilk, token, id },
    exchangeAction,
    depositDaiAmount,
    debtDelta,
    depositAmount,
    withdrawAmount,
    generateAmount,
    collateralDelta,
    slippage,
    oneInchAmount,
  }: ManageMultiplyVaultState,
) {
  const { tokensMainnet, defaultExchange } = getNetworkContracts(NetworkIds.MAINNET, chainId)
  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation, send }) => {
        const isGnosisSafe = checkIfGnosisSafe({
          walletLabel,
          web3,
        })
        const sendFn = isGnosisSafe ? send : sendWithGasEstimation

        return getQuote$(
          getTokenMetaData('DAI', tokensMainnet),
          getTokenMetaData(token, tokensMainnet),
          defaultExchange.address,
          oneInchAmount,
          slippage,
          exchangeAction!,
        ).pipe(
          first(),
          switchMap((swap) =>
            sendFn(adjustMultiplyVault, {
              kind: TxMetaKind.adjustPosition,
              depositCollateral: depositAmount || zero,
              depositDai: depositDaiAmount || zero,
              withdrawCollateral: withdrawAmount || zero,
              withdrawDai: generateAmount || zero,
              requiredDebt: debtDelta?.abs() || zero,
              borrowedCollateral: collateralDelta?.abs() || zero,
              userAddress: account!,
              proxyAddress: proxyAddress!,
              exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '',
              exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '',
              slippage,
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
      }),
      startWith({ kind: 'manageWaitingForApproval' } as ManageMultiplyVaultChange),
      catchError(() => of({ kind: 'manageFailure' } as ManageMultiplyVaultChange)),
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
        sendWithGasEstimation(
          vaultActionsLogic(StandardDssProxyActionsContractAdapter).depositAndGenerate,
          {
            kind: TxMetaKind.depositAndGenerate,
            generateAmount,
            depositAmount,
            proxyAddress: proxyAddress!,
            ilk,
            token,
            id,
          },
        ).pipe(
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
  context: Context,
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
      switchMap(({ sendWithGasEstimation, send }) => {
        const { walletLabel, web3 } = context
        const isGnosisSafe = checkIfGnosisSafe({
          walletLabel,
          web3,
        })
        const sendFn = isGnosisSafe ? send : sendWithGasEstimation

        return sendFn(
          vaultActionsLogic(StandardDssProxyActionsContractAdapter).withdrawAndPayback,
          {
            kind: TxMetaKind.withdrawAndPayback,
            withdrawAmount,
            paybackAmount,
            proxyAddress: proxyAddress!,
            ilk,
            token,
            id,
            shouldPaybackAll,
          },
        ).pipe(
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
        )
      }),
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
  { chainId, walletLabel, web3 }: Context,
  change: (ch: ManageMultiplyVaultChange) => void,
  {
    proxyAddress,
    vault: { ilk, token, id, lockedCollateral, debt, debtOffset },
    closeVaultTo,
    slippage,
    account,
    closeToDaiParams,
    closeToCollateralParams,
  }: ManageMultiplyVaultState,
) {
  const { fromTokenAmount, toTokenAmount, minToTokenAmount } =
    closeVaultTo === 'dai' ? closeToDaiParams : closeToCollateralParams
  const { tokensMainnet, defaultExchange } = getNetworkContracts(NetworkIds.MAINNET, chainId)

  txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation, send }) =>
        getQuote$(
          getTokenMetaData('DAI', tokensMainnet),
          getTokenMetaData(token, tokensMainnet),
          defaultExchange.address,
          fromTokenAmount,
          slippage,
          'SELL_COLLATERAL',
        ).pipe(
          first(),
          switchMap((swap) => {
            const isGnosisSafe = checkIfGnosisSafe({
              walletLabel,
              web3,
            })
            const sendFn = isGnosisSafe ? send : sendWithGasEstimation

            return sendFn(closeVaultCall, {
              kind: TxMetaKind.closeVault,
              closeTo: closeVaultTo!,
              token,
              ilk,
              id,
              exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '',
              exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '',
              userAddress: account!,
              totalCollateral: lockedCollateral,
              totalDebt: debt.plus(debtOffset),
              proxyAddress: proxyAddress!,
              fromTokenAmount,
              toTokenAmount,
              minToTokenAmount,
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
            )
          }),
        ),
      ),
      startWith({ kind: 'manageWaitingForApproval' } as ManageMultiplyVaultChange),
      catchError(() => of({ kind: 'manageFailure' } as ManageMultiplyVaultChange)),
    )
    .subscribe((ch) => change(ch))
}

export function applyEstimateGas(
  context: Context,
  addGasEstimation$: AddGasEstimationFunction,
  state: ManageMultiplyVaultState,
): Observable<ManageMultiplyVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const {
      proxyAddress,
      generateAmount,
      depositAmount,
      depositDaiAmount,
      withdrawAmount,
      paybackAmount,
      shouldPaybackAll,
      vault: { ilk, token, id, lockedCollateral, debt, debtOffset },
      requiredCollRatio,
      account,
      swap,
      slippage,
      exchangeAction,
      closeVaultTo,
      closeToDaiParams,
      closeToCollateralParams,
      isProxyStage,
    } = state

    /*
    For Gnosis wallets we experienced gas estimation errors for certain actions.
    This errors occurred within the Gnosis SDK are proved tricky to debug. Given the Gnosis t/x confirmation popup does correctly estimate gas
    We've opted to simply disable gas estimation on our side for those wallets for select actions
    */
    const isGnosisSafeWallet = checkIfGnosisSafe(context)
    const GNOSIS_GAS_ESTIMATE = undefined
    if (isGnosisSafeWallet) return GNOSIS_GAS_ESTIMATE

    if (proxyAddress) {
      if (requiredCollRatio) {
        const requiredDebt =
          swap?.status === 'SUCCESS'
            ? exchangeAction === 'BUY_COLLATERAL'
              ? // add oazo fee because Oazo takes the fee from the pre swap amount,
                // so that means that required debt on the vault must be increased
                // to incorporate this fee.
                swap.quoteAmount.div(one.minus(OAZO_FEE))
              : // remove slippage because we are selling collateral and buying DAI,
                // and so we will only end up with the amount of DAI that is
                // returned from the exchange minus the slippage.
                swap.quoteAmount.div(one.plus(SLIPPAGE))
            : zero

        const borrowedCollateral =
          swap?.status === 'SUCCESS'
            ? exchangeAction === 'BUY_COLLATERAL'
              ? // TODO: why are we removing slippage twice?
                // see proxyActions.getMultiplyAdjustCallData - slippage is also removed there.
                swap.collateralAmount.times(one.minus(SLIPPAGE))
              : swap.collateralAmount
            : zero

        return estimateGas(adjustMultiplyVault, {
          kind: TxMetaKind.adjustPosition,
          depositCollateral: depositAmount || zero,
          depositDai: depositDaiAmount || zero,
          withdrawCollateral: withdrawAmount || zero,
          withdrawDai: generateAmount || zero,
          requiredDebt: requiredDebt,
          borrowedCollateral: borrowedCollateral,
          userAddress: account!,
          proxyAddress: proxyAddress!,
          exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '',
          exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '',
          slippage,
          action: exchangeAction!,
          token,
          id,
          ilk,
        })
      } else {
        if (state.otherAction === 'closeVault' && !debt.isZero()) {
          const { fromTokenAmount, toTokenAmount, minToTokenAmount } =
            closeVaultTo === 'dai' ? closeToDaiParams : closeToCollateralParams

          return estimateGas(closeVaultCall, {
            kind: TxMetaKind.closeVault,
            closeTo: closeVaultTo!,
            token,
            ilk,
            id,
            exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '',
            exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '',
            userAddress: account!,
            totalCollateral: lockedCollateral,
            totalDebt: debt.plus(debtOffset),
            proxyAddress: proxyAddress!,
            fromTokenAmount,
            toTokenAmount,
            minToTokenAmount,
          })
        } else {
          const isDepositAndGenerate = depositAmount || generateAmount

          if (isDepositAndGenerate) {
            return estimateGas(
              vaultActionsLogic(StandardDssProxyActionsContractAdapter).depositAndGenerate,
              {
                kind: TxMetaKind.depositAndGenerate,
                generateAmount: generateAmount || zero,
                depositAmount: depositAmount || zero,
                proxyAddress: proxyAddress!,
                ilk,
                token,
                id,
              },
            )
          } else {
            return estimateGas(
              vaultActionsLogic(StandardDssProxyActionsContractAdapter).withdrawAndPayback,
              {
                kind: TxMetaKind.withdrawAndPayback,
                withdrawAmount: withdrawAmount || zero,
                paybackAmount: paybackAmount || zero,
                proxyAddress: proxyAddress!,
                ilk,
                token,
                id,
                shouldPaybackAll,
              },
            )
          }
        }
      }
    }

    if (isProxyStage) {
      return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
    }

    return undefined
  })
}
