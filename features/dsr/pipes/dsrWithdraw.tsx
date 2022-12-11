import BigNumber from 'bignumber.js'
import { Change, Changes, HasGasEstimation } from 'helpers/form'

export type DsrWithdrawStage =
  | 'editing'
  | 'withdrawWaiting4Confirmation'
  | 'withdrawWaiting4Approval'
  | 'withdrawInProgress'
  | 'withdrawFiasco'
  | 'withdrawSuccess'

export type DsrWithdrawMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanDeposit'
}

export interface DsrWithdrawState extends HasGasEstimation {
  stage: DsrWithdrawStage
  proxyAddress: string
  withdrawTxHash?: string
  daiDeposit: BigNumber
  potDsr: BigNumber
  amount?: BigNumber
  messages: DsrWithdrawMessage[]
  change: (change: ManualChange) => void
  reset?: () => void
  proceed?: () => void
  withdraw?: () => void
  back?: () => void
}

export type DsrWithdrawChange = Changes<DsrWithdrawState>
export type DaiDepositChange = Change<DsrWithdrawState, 'daiDeposit'>
export type ManualChange = Change<DsrWithdrawState, 'amount'>
