import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { OpenMultiplyData, openMultiplyVault } from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ContextConnected } from 'blockchain/network'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { getQuote$, getTokenMetaData } from 'features/exchange/exchange'
import { VaultType } from 'features/generalManageVault/generalManageVault'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { iif, Observable, of } from 'rxjs'
import { catchError, filter, first, startWith, switchMap } from 'rxjs/operators'
import Web3 from 'web3'

import { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault'

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

type AllowanceChange =
  | { kind: 'allowanceWaitingForApproval' }
  | {
      kind: 'allowanceInProgress'
      allowanceTxHash: string
    }
  | {
      kind: 'allowanceFailure'
      txError?: any
    }
  | {
      kind: 'allowanceSuccess'
      allowance: BigNumber
    }

type OpenChange =
  | { kind: 'openWaitingForApproval' }
  | {
      kind: 'openInProgress'
      openTxHash: string
    }
  | {
      kind: 'openFailure'
      txError?: any
    }
  | {
      kind: 'openSuccess'
      id: BigNumber
    }

export type OpenVaultTransactionChange = ProxyChange | AllowanceChange | OpenChange

export function applyOpenMultiplyVaultTransaction(
  change: OpenMultiplyVaultChange,
  state: OpenMultiplyVaultState,
): OpenMultiplyVaultState {
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

  if (change.kind === 'openWaitingForApproval') {
    return {
      ...state,
      stage: 'openWaitingForApproval',
    }
  }

  if (change.kind === 'openInProgress') {
    const { openTxHash } = change
    return {
      ...state,
      openTxHash,
      stage: 'openInProgress',
    }
  }

  if (change.kind === 'openFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'openFailure',
      txError,
    }
  }

  if (change.kind === 'openSuccess') {
    return { ...state, stage: 'openSuccess', id: change.id }
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

export function createProxy(
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenMultiplyVaultChange) => void,
  { safeConfirmations }: OpenMultiplyVaultState,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<OpenMultiplyVaultChange, CreateDsProxyData>(
        { kind: 'proxyWaitingForApproval' },
        (txState) =>
          of({ kind: 'proxyInProgress', proxyTxHash: (txState as any).txHash as string }),
        (txState) =>
          of({
            kind: 'proxyFailure',
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
                  kind: 'proxyConfirming',
                  proxyConfirmations: (txState as any).confirmations,
                }),
                of({ kind: 'proxySuccess', proxyAddress: proxyAddress! }),
              ),
            ),
          ),
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}

interface Receipt {
  logs: { topics: string[] | undefined }[]
}

export function parseVaultIdFromReceiptLogs({ logs }: Receipt): BigNumber | undefined {
  const newCdpEventTopic = Web3.utils.keccak256('NewCdp(address,address,uint256)')
  return logs
    .filter((log) => {
      if (log.topics) {
        return log.topics[0] === newCdpEventTopic
      }
      return false
    })
    .map(({ topics }) => {
      return new BigNumber(Web3.utils.hexToNumber(topics![3]))
    })[0]
}

export function multiplyVault(
  { sendWithGasEstimation }: TxHelpers,
  { tokens, exchange }: ContextConnected,
  change: (ch: OpenMultiplyVaultChange) => void,
  {
    depositAmount,
    proxyAddress,
    ilk,
    token,
    buyingCollateral,
    account,
    slippage,
    toTokenAmount,
    fromTokenAmount,
    borrowedDaiAmount,
    oneInchAmount,
  }: OpenMultiplyVaultState,
) {
  return getQuote$(
    getTokenMetaData('DAI', tokens),
    getTokenMetaData(token, tokens),
    exchange.address,
    oneInchAmount,
    slippage,
    'BUY_COLLATERAL',
  )
    .pipe(
      first(),
      switchMap((swap) =>
        sendWithGasEstimation(openMultiplyVault, {
          kind: TxMetaKind.multiply,
          depositCollateral: depositAmount || zero,
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
            { kind: 'openWaitingForApproval' },
            (txState) =>
              of({ kind: 'openInProgress', openTxHash: (txState as any).txHash as string }),
            (txState) =>
              of({
                kind: 'openFailure',
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

              const jwtToken = jwtAuthGetToken(account as string)
              if (id && jwtToken) {
                saveVaultUsingApi$(id, jwtToken, VaultType.Multiply).subscribe()
              }

              return of({
                kind: 'openSuccess',
                id: id!,
              })
            },
          ),
        ),
      ),
      startWith({ kind: 'openWaitingForApproval' } as OpenMultiplyVaultChange),
      catchError(() => of({ kind: 'openFailure' } as OpenMultiplyVaultChange)),
    )
    .subscribe((ch) => change(ch))
}

export function applyEstimateGas(
  addGasEstimation$: AddGasEstimationFunction,
  state: OpenMultiplyVaultState,
): Observable<OpenMultiplyVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const {
      proxyAddress,
      depositAmount,
      ilk,
      token,
      account,
      swap,
      buyingCollateral,
      borrowedDaiAmount,
      toTokenAmount,
      fromTokenAmount,
    } = state

    if (proxyAddress && depositAmount) {
      return estimateGas(openMultiplyVault, {
        kind: TxMetaKind.multiply,
        depositCollateral: depositAmount,
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
      })
    }

    return undefined
  })
}
