import { TxStatus } from '@oasisdex/transactions'
import { createDsProxy } from 'blockchain/calls/proxy'
import { OpenData } from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { VaultActionsLogicInterface } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { VaultType } from 'features/generalManageVault/vaultType'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { iif, Observable, of } from 'rxjs'

import { parseVaultIdFromReceiptLogs } from '../../../shared/transactions'
import { OpenVaultChange, OpenVaultState } from './openVault'

export function applyOpenVaultTransaction(
  state: OpenVaultState,
  change: OpenVaultChange,
): OpenVaultState {
  if (change.kind === 'allowanceWaitingForApproval') {
    return {
      ...state,
      stage: 'allowanceWaitingForApproval',
    }
  }

  if (change.kind === 'allowanceInProgress') {
    const { allowanceTxHash } = change
    return {
      ...state,
      allowanceTxHash,
      stage: 'allowanceInProgress',
    }
  }

  if (change.kind === 'allowanceFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'allowanceFailure',
      txError,
    }
  }

  if (change.kind === 'allowanceSuccess') {
    const { allowance } = change
    return { ...state, stage: 'allowanceSuccess', allowance }
  }

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

export function openVault(
  { sendWithGasEstimation }: TxHelpers,
  vaultActions: VaultActionsLogicInterface,
  change: (ch: OpenVaultChange) => void,
  {
    generateAmount,
    depositAmount,
    proxyAddress,
    ilk,
    account,
    token,
    openFlowWithStopLoss,
    openVaultSafeConfirmations,
  }: OpenVaultState,
) {
  sendWithGasEstimation(vaultActions.open, {
    kind: TxMetaKind.open,
    generateAmount: generateAmount || zero,
    depositAmount: depositAmount || zero,
    proxyAddress: proxyAddress!,
    ilk,
    token,
  })
    .pipe(
      transactionToX<OpenVaultChange, OpenData>(
        { kind: 'txWaitingForApproval' },
        (txState) => of({ kind: 'txInProgress', openTxHash: (txState as any).txHash as string }),
        (txState) =>
          of({
            kind: 'txFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        (txState) => {
          const id = parseVaultIdFromReceiptLogs(
            txState.status === TxStatus.Success && txState.receipt,
          )

          // assume that user went through ToS flow and can interact with application
          const jwtToken = jwtAuthGetToken(account)
          if (id && jwtToken) {
            saveVaultUsingApi$(
              id,
              jwtToken,
              VaultType.Borrow,
              parseInt(txState.networkId),
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
    )
    .subscribe((ch) => change(ch))
}

export function applyEstimateGas(
  addGasEstimation$: AddGasEstimationFunction,
  vaultActions: VaultActionsLogicInterface,
  state: OpenVaultState,
): Observable<OpenVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const { proxyAddress, generateAmount, depositAmount, ilk, token, isProxyStage } = state

    if (proxyAddress && (generateAmount || depositAmount)) {
      return estimateGas(vaultActions.open, {
        kind: TxMetaKind.open,
        generateAmount: generateAmount || zero,
        depositAmount: depositAmount || zero,
        proxyAddress,
        ilk,
        token,
      })
    }

    if (isProxyStage) {
      return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
    }

    return undefined
  })
}
