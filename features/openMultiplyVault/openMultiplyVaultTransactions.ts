import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { OpenMultiplyData, openMultiplyVault } from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ContextConnected } from 'blockchain/network'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { getQuote$, getTokenMetaData } from 'features/exchange/exchange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { transactionToX } from 'helpers/form'
import { OAZO_FEE } from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { catchError, first, startWith, switchMap } from 'rxjs/operators'
import Web3 from 'web3'

import { TxError } from '../../helpers/types'
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
      txError?: TxError
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
      txError?: TxError
    }
  | {
      kind: 'allowanceSuccess'
      allowance: BigNumber
    }

type OpenChange =
  | { kind: 'txWaitingForApproval' }
  | {
      kind: 'txInProgress'
      openTxHash: string
    }
  | {
      kind: 'txFailure'
      txError?: TxError
    }
  | {
      kind: 'txSuccess'
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
  { tokensMainnet, defaultExchange }: ContextConnected,
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
  }: OpenMultiplyVaultState,
) {
  return getQuote$(
    getTokenMetaData('DAI', tokensMainnet),
    getTokenMetaData(token, tokensMainnet),
    defaultExchange.address,
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

              const jwtToken = jwtAuthGetToken(account as string)
              if (id && jwtToken) {
                saveVaultUsingApi$(
                  id,
                  jwtToken,
                  VaultType.Multiply,
                  parseInt(txState.networkId),
                ).subscribe()
              }

              return of({
                kind: 'txSuccess',
                id: id!,
              })
            },
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
    const { proxyAddress, depositAmount, ilk, token, account, swap, skipFL } = state

    const daiAmount = swap?.status === 'SUCCESS' ? swap.daiAmount.div(one.minus(OAZO_FEE)) : zero
    const collateralAmount = swap?.status === 'SUCCESS' ? swap.collateralAmount : zero

    if (proxyAddress && depositAmount) {
      return estimateGas(openMultiplyVault, {
        kind: TxMetaKind.multiply,
        depositCollateral: depositAmount,
        skipFL,
        userAddress: account,
        proxyAddress: proxyAddress!,
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

    return undefined
  })
}
