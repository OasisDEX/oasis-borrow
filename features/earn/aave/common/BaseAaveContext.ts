import { IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { EventObject, Sender } from 'xstate'

import { HasGasEstimation } from '../../../../helpers/form'
import { AaveProtocolData } from '../manage/state'

type UserInput = {
  riskRatio?: IRiskRatio
  amount?: BigNumber
}

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
  resetRiskRatio?: IRiskRatio
  userInput: UserInput
  protocolData?: AaveProtocolData
}

export type BaseViewProps<AaveEvent extends EventObject> = {
  state: {
    context: BaseAaveContext
  }
  send: Sender<AaveEvent>
}
