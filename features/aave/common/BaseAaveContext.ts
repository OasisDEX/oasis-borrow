import { IPosition, IPositionTransition, IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { EventObject, Sender } from 'xstate'

import { OperationExecutorTxMeta } from '../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../blockchain/calls/txMeta'
import { Context } from '../../../blockchain/network'
import { HasGasEstimation } from '../../../helpers/form'
import { TransactionStateMachineResultEvents } from '../../stateMachines/transaction'
import { TransactionParametersStateMachineResponseEvent } from '../../stateMachines/transactionParameters'
import { UserSettingsState } from '../../userSettings/userSettings'
import { AaveProtocolData } from '../manage/services'

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
  | { type: 'WEB3_CONTEXT_CHANGED'; web3Context: Context }
  | { type: 'RESET_RISK_RATIO' }
  | { type: 'CONNECTED_PROXY_ADDRESS_RECEIVED'; connectedProxyAddress: string | undefined }
  | { type: 'SET_BALANCE'; tokenBalance: BigNumber; tokenPrice: BigNumber }
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | { type: 'UPDATE_STRATEGY_INFO'; strategyInfo: IStrategyInfo }
  | { type: 'UPDATE_PROTOCOL_DATA'; protocolData: AaveProtocolData }
  | TransactionParametersStateMachineResponseEvent
  | TransactionStateMachineResultEvents

export interface BaseAaveContext {
  userInput: UserInput
  tokens: {
    collateral: string
    debt: string
    deposit: string
  }
  currentPosition?: IPosition

  currentStep: number
  totalSteps: number

  strategy?: IPositionTransition
  operationName?: string
  estimatedGasPrice?: HasGasEstimation
  tokenBalance?: BigNumber
  tokenPrice?: BigNumber
  collateralPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  connectedProxyAddress?: string
  strategyInfo?: IStrategyInfo
  web3Context?: Context
  userSettings?: UserSettingsState
  error?: string | unknown
  protocolData?: AaveProtocolData
}

export type BaseViewProps<AaveEvent extends EventObject> = {
  state: {
    context: BaseAaveContext
  }
  send: Sender<AaveEvent>
  isLoading: () => boolean
}

export function contextToTransactionParameters(context: BaseAaveContext): OperationExecutorTxMeta {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.strategy!.transaction.calls as any,
    operationName: context.operationName!,
    token: context.tokens.deposit,
    proxyAddress: context.connectedProxyAddress!,
    amount: context.userInput.amount,
  }
}
