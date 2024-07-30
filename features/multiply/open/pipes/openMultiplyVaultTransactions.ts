import { TxStatus } from '@oasisdex/transactions'
import { approve } from 'blockchain/calls/erc20'
import type { ApproveData } from 'blockchain/calls/erc20.types'
import { createDsProxy } from 'blockchain/calls/proxy'
import type { OpenMultiplyData } from 'blockchain/calls/proxyActions/proxyActions'
import { openMultiplyVault } from 'blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { getQuote$, getTokenMetaData } from 'features/exchange/exchange'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { parseVaultIdFromReceiptLogs } from 'features/shared/transactions'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { transactionToX } from 'helpers/form'
import { OAZO_FEE } from 'helpers/multiply/calculations.constants'
import { one, zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { iif, of } from 'rxjs'
import { catchError, first, startWith, switchMap } from 'rxjs/operators'

import type { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault.types'

export function applyOpenMultiplyVaultTransaction(
  state: OpenMultiplyVaultState,
  change: OpenMultiplyVaultChange,
): OpenMultiplyVaultState {
  if (change.kind === 'txWaitingForApproval') {
    return {
      ...state,
      stage: 'txWaitingForApproval',
    }
  }

  if (change.kind === 'txInProgress') {
    const { openTxHash } = change
    return {
      ...state,
      openTxHash,
      stage: 'txInProgress',
    }
  }

  if (change.kind === 'openVaultConfirming') {
    const { openVaultConfirmations } = change
    return {
      ...state,
      openVaultConfirmations,
    }
  }

  if (change.kind === 'txFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'txFailure',
      txError,
    }
  }

  if (change.kind === 'txSuccess') {
    return { ...state, stage: 'txSuccess', id: change.id }
  }

  return state
}

export function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: OpenMultiplyVaultChange) => void,
  state: OpenMultiplyVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
    amount: state.allowanceAmount!,
  })
    .pipe(
      transactionToX<OpenMultiplyVaultChange, ApproveData>(
        { kind: 'allowanceWaitingForApproval' },
        (txState) =>
          of({
            kind: 'allowanceInProgress',
            allowanceTxHash: (txState as any).txHash as string,
          }),
        (txState) =>
          of({
            kind: 'allowanceFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        (txState) => of({ kind: 'allowanceSuccess', allowance: txState.meta.amount }),
      ),
    )
    .subscribe((ch) => change(ch))
}

export function multiplyVault(
  { sendWithGasEstimation }: TxHelpers,
  { chainId }: ContextConnected,
  change: (ch: OpenMultiplyVaultChange) => void,
  {
    depositAmount,
    proxyAddress,
    ilk,
    token,
    buyingCollateral,
    skipFL,
    account,
    slippage,
    toTokenAmount,
    fromTokenAmount,
    borrowedDaiAmount,
    oneInchAmount,
    openFlowWithStopLoss,
    openVaultSafeConfirmations,
  }: OpenMultiplyVaultState,
) {
  const { tokensMainnet, defaultExchange } = getNetworkContracts(NetworkIds.MAINNET, chainId)
  return getQuote$({
    quote: getTokenMetaData('DAI', tokensMainnet),
    collateral: getTokenMetaData(token, tokensMainnet),
    account: defaultExchange.address,
    amount: oneInchAmount,
    slippage,
    action: 'BUY_COLLATERAL',
    eoaAddress: account,
    protocol: LendingProtocol.Maker,
  })
    .pipe(
      first(),
      switchMap((swap) =>
        sendWithGasEstimation(openMultiplyVault, {
          kind: TxMetaKind.multiply,
          depositCollateral: depositAmount || zero,
          skipFL,
          userAddress: account,
          proxyAddress: proxyAddress!,
          ilk,
          token,
          exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
          exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
          borrowedCollateral: buyingCollateral,
          requiredDebt: borrowedDaiAmount,
          toTokenAmount: toTokenAmount,
          fromTokenAmount,
        }).pipe(
          transactionToX<OpenMultiplyVaultChange, OpenMultiplyData>(
            { kind: 'txWaitingForApproval' },
            (txState) =>
              of({ kind: 'txInProgress', openTxHash: (txState as any).txHash as string }),
            (txState) =>
              of({
                kind: 'txFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => {
              const id = parseVaultIdFromReceiptLogs(
                txState.status === TxStatus.Success && txState.receipt,
              )

              if (id) {
                saveVaultUsingApi$(
                  id,
                  VaultType.Multiply,
                  parseInt(txState.networkId),
                  LendingProtocol.Maker,
                  account,
                ).subscribe()
              }

              if (openFlowWithStopLoss) {
                return iif(
                  () => (txState as any).confirmations < openVaultSafeConfirmations,
                  of({
                    kind: 'openVaultConfirming',
                    openVaultConfirmations: (txState as any).confirmations,
                  }),
                  of({
                    kind: 'stopLossTxWaitingForConfirmation',
                    id: id!,
                  }),
                )
              }

              return of({
                kind: 'txSuccess',
                id: id!,
              })
            },
            !openFlowWithStopLoss ? undefined : openVaultSafeConfirmations,
          ),
        ),
      ),
      startWith({ kind: 'txWaitingForApproval' } as OpenMultiplyVaultChange),
      catchError(() => of({ kind: 'txFailure' } as OpenMultiplyVaultChange)),
    )
    .subscribe((ch) => change(ch))
}

export function applyEstimateGas(
  addGasEstimation$: AddGasEstimationFunction,
  state: OpenMultiplyVaultState,
): Observable<OpenMultiplyVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const { proxyAddress, depositAmount, ilk, token, account, swap, skipFL, isProxyStage } = state

    const daiAmount = swap?.status === 'SUCCESS' ? swap.quoteAmount.div(one.minus(OAZO_FEE)) : zero
    const collateralAmount = swap?.status === 'SUCCESS' ? swap.collateralAmount : zero

    if (proxyAddress && depositAmount) {
      return estimateGas(openMultiplyVault, {
        kind: TxMetaKind.multiply,
        depositCollateral: depositAmount,
        skipFL,
        userAddress: account,
        proxyAddress,
        ilk,
        token,
        exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
        exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
        borrowedCollateral: collateralAmount,
        requiredDebt: daiAmount,
        toTokenAmount: collateralAmount,
        fromTokenAmount: daiAmount,
      })
    }

    if (isProxyStage) {
      return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
    }

    return undefined
  })
}
