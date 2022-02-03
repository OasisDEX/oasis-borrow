import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'

import { TxError } from '../../helpers/types'

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
