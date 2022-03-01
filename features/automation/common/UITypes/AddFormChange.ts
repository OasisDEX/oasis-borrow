import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'

export interface AddFormChange {
  selectedSLValue: BigNumber
  collateralActive: boolean
  txDetails?: {
    txStatus?: TxStatus
    txHash?: string
    txCost?: BigNumber
  }
}
