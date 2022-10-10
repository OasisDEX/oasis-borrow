import { IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { EventObject, Sender } from 'xstate'

import { HasGasEstimation } from '../../../../helpers/form'

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
