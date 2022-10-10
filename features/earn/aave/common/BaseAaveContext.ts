import { IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import { ActorRefFrom, EventObject, Sender } from 'xstate'
import { ProxyStateMachine } from '../../../proxyNew/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import BigNumber from 'bignumber.js'
import { HasGasEstimation } from '../../../../helpers/form'
import { AaveProtocolData, ClosePositionParametersStateMachine } from '../manage/state'

export type IStrategyInfo = {
  oracleAssetPrice: BigNumber
  liquidationBonus: BigNumber
  collateralToken: string
}

export interface BaseAaveContext {
  transactionParameters?: IStrategy
  estimatedGasPrice?: HasGasEstimation
  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  tokenPrice?: BigNumber
  inputDelay: number
  token: string
  proxyAddress?: string
  strategyInfo?: IStrategyInfo
  riskRatio: IRiskRatio
}

export type BaseViewProps<AaveEvent extends EventObject> = {
  state: {
    context: BaseAaveContext
  }
  send: Sender<AaveEvent>
}
