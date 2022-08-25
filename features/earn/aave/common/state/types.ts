import BigNumber from 'bignumber.js'

import { HasGasEstimation } from '../../../../../helpers/form'

export type ProxyMachineEvents =
  | {
      readonly type: 'PROXY_ADDRESS_RECEIVED'
      readonly proxyAddress: string | undefined
    }
  | {
      readonly type: 'CREATE_PROXY'
    }
  | {
      readonly type: 'PROXY_CREATED'
      readonly proxyAddress: string
    }

export type TransactionMachineEvents =
  | {
      readonly type: 'TRANSACTION_WAITING_FOR_APPROVAL'
    }
  | {
      readonly type: 'TRANSACTION_IN_PROGRESS'
      readonly txHash: string
    }
  | {
      readonly type: 'TRANSACTION_SUCCESS'
      readonly vaultNumber: BigNumber
    }
  | {
      readonly type: 'TRANSACTION_CONFIRMED'
      readonly confirmations: number
    }
  | {
      readonly type: 'TRANSACTION_FAILURE'
      readonly txError?: string
    }

export type CommonMachineEvents =
  | {
      readonly type: 'CONFIRM_DEPOSIT'
    }
  | {
      readonly type: 'RETRY'
    }
  | {
      readonly type: 'GAS_COST_ESTIMATION'
      readonly gasData: HasGasEstimation
    }
  | {
      readonly type: 'BACK_TO_EDITING'
    }
  | {
      readonly type: 'xstate.update' // https://xstate.js.org/docs/guides/actors.html#sending-updates
    }
  | {
      readonly type: 'done.invoke.transaction'
    }
  | {
      readonly type: 'error.platform.transaction'
    }
  | {
      readonly type: 'done.invoke.proxy'
    }
  | {
      readonly type: 'error.platform.proxy'
    }
