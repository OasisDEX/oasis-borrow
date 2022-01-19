import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { open, OpenData } from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { VaultType } from 'features/generalManageVault/generalManageVault'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import Web3 from 'web3'

import { TxError } from '../../helpers/types'
import { OpenVaultChange, OpenVaultState } from './openVault'

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

export function applyOpenVaultTransaction(
  change: OpenVaultChange,
  state: OpenVaultState,
): OpenVaultState {
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

export function openVault(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: OpenVaultChange) => void,
  { generateAmount, depositAmount, proxyAddress, ilk, account, token }: OpenVaultState,
) {
  sendWithGasEstimation(open, {
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
          const jwtToken = jwtAuthGetToken(account as string)
          if (id && jwtToken) {
            saveVaultUsingApi$(
              id,
              jwtToken,
              VaultType.Borrow,
              parseInt(txState.networkId),
            ).subscribe()
          }

          return of({
            kind: 'txSuccess',
            id: id!,
          })
        },
      ),
    )
    .subscribe((ch) => change(ch))
}

export function applyEstimateGas(
  addGasEstimation$: AddGasEstimationFunction,
  state: OpenVaultState,
): Observable<OpenVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const { proxyAddress, generateAmount, depositAmount, ilk, token } = state

    if (proxyAddress && (generateAmount || depositAmount)) {
      return estimateGas(open, {
        kind: TxMetaKind.open,
        generateAmount: generateAmount || zero,
        depositAmount: depositAmount || zero,
        proxyAddress,
        ilk,
        token,
      })
    }

    return undefined
  })
}
