import BigNumber from 'bignumber.js'

import { TransactionLifecycle } from '../enums/TxStatus'

export interface AddFormChange {
  selectedSLValue: BigNumber
  txStatus: TransactionLifecycle
  collateralActive: boolean
}
