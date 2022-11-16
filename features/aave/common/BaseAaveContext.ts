import { IPosition, IRiskRatio, IStrategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ActorRef, EventObject, Sender } from 'xstate'

import { HasGasEstimation } from '../../../helpers/form'
import { UserSettingsState } from '../../userSettings/userSettings'

type UserInput = {
  riskRatio?: IRiskRatio
  amount?: BigNumber
}

export type IStrategyInfo = {
  oracleAssetPrice: BigNumber
  liquidationBonus: BigNumber
  collateralToken: string
}

export type BaseAaveEvent =
  | { type: 'PRICES_RECEIVED'; collateralPrice: BigNumber }
  | { type: 'USER_SETTINGS_CHANGED'; userSettings: UserSettingsState }
  | { type: 'RESET_RISK_RATIO' }
  | { type: 'TRANSACTION_FAILED'; error?: string | unknown }

export interface BaseAaveContext {
  refPriceObservable?: ActorRef<BaseAaveEvent, BaseAaveEvent>
  refUserSettingsObservable?: ActorRef<BaseAaveEvent, BaseAaveEvent>

  transactionParameters?: IStrategy
  estimatedGasPrice?: HasGasEstimation
  currentStep: number
  totalSteps: number
  tokenBalance?: BigNumber
  tokenPrice?: BigNumber
  inputDelay: number
  token: string
  proxyAddress?: string
  strategyInfo?: IStrategyInfo
  resetRiskRatio?: IRiskRatio
  userInput: UserInput
  collateralToken: string
  collateralPrice?: BigNumber
  slippage: BigNumber
  currentPosition: IPosition
  loading: boolean

  error?: string | unknown
}

export type BaseViewProps<AaveEvent extends EventObject> = {
  state: {
    context: BaseAaveContext
  }
  send: Sender<AaveEvent>
}
