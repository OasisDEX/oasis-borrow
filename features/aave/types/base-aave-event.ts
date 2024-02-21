import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network.types'
import { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { type AaveLikePosition, IRiskRatio } from "@oasisdex/dma-library";
import { TransactionParametersStateMachineResponseEvent } from 'features/stateMachines/transactionParameters'
import { TransactionStateMachineResultEvents } from 'features/stateMachines/transaction'
import { AllowanceStateMachineResponseEvent } from 'features/stateMachines/allowance'
import {
  IStrategyInfo, ManageTokenInput,
  RefTransactionMachine, ReserveData,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from './base-aave-context'
import { AutomationAddTriggerData, AutomationAddTriggerLambda } from 'features/automation/common/txDefinitions.types'
import { UserSettingsState } from 'features/userSettings/userSettings.types'
import { ManageDebtActionsEnum } from './manage-debt-actions-enum'
import { ManageCollateralActionsEnum } from './manage-collateral-actions-enum'

type AaveOpenPositionWithStopLossEvents =
  | { type: 'SET_STOP_LOSS_LEVEL'; stopLossLevel: BigNumber }
  | { type: 'SET_TRAILING_STOP_LOSS_LEVEL'; trailingDistance: BigNumber }
  | { type: 'SET_COLLATERAL_ACTIVE'; collateralActive: boolean }
  | { type: 'SET_STOP_LOSS_TX_DATA'; stopLossTxData: AutomationAddTriggerData }
  | { type: 'SET_STOP_LOSS_TX_DATA_LAMBDA'; stopLossTxDataLambda: AutomationAddTriggerLambda }
  | { type: 'SET_TRAILING_STOP_LOSS_TX_DATA_LAMBDA'; trailingStopLossTxDataLambda: AutomationAddTriggerLambda }
  | { type: 'SET_STOP_LOSS_SKIPPED'; stopLossSkipped: boolean }


export type UpdateClosingAction = {
  type: 'UPDATE_CLOSING_ACTION'
  closingToken: string
}

export type UpdateCollateralActionType = {
  type: 'UPDATE_COLLATERAL_TOKEN_ACTION'
  manageTokenAction: ManageCollateralActionsEnum
}

export type UpdateDebtActionType = {
  type: 'UPDATE_DEBT_TOKEN_ACTION'
  manageTokenAction: ManageDebtActionsEnum
}

export type UpdateInput1ValueType = {
  type: 'UPDATE_INPUT1_ACTION_VALUE'
  manageInput1Value: ManageTokenInput['manageInput1Value']
}

export type UpdateInput2ActionValueType = {
  type: 'UPDATE_INPUT2_ACTION_VALUE'
  manageInput2Value: ManageTokenInput['manageInput2Value']
}

export type BaseAaveEvent =
  | { type: 'PRICES_RECEIVED'; collateralPrice: BigNumber; debtPrice: BigNumber }
  | { type: 'USER_SETTINGS_CHANGED'; userSettings: UserSettingsState }
  | { type: 'WEB3_CONTEXT_CHANGED'; web3Context: Context }
  | { type: 'RESET_RISK_RATIO' }
  | { type: 'CLOSE_POSITION' }
  | { type: 'CONNECTED_PROXY_ADDRESS_RECEIVED'; connectedProxyAddress: string | undefined }
  | { type: 'DPM_PROXY_RECEIVED'; userDpmAccount: UserDpmAccount }
  | { type: 'SET_BALANCE'; balance: StrategyTokenBalance }
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | { type: 'CURRENT_POSITION_CHANGED'; currentPosition: AaveLikePosition }
  | UpdateCollateralActionType
  | UpdateClosingAction
  | UpdateDebtActionType
  | UpdateInput1ValueType
  | UpdateInput2ActionValueType
  | { type: 'UPDATE_STRATEGY_INFO'; strategyInfo: IStrategyInfo }
  | { type: 'UPDATE_ALLOWANCE'; allowance: StrategyTokenAllowance }
  | { type: 'USE_SLIPPAGE'; getSlippageFrom: 'userSettings' | 'strategyConfig' }
  | TransactionParametersStateMachineResponseEvent
  | TransactionStateMachineResultEvents
  | AllowanceStateMachineResponseEvent
  | { type: 'SET_DEBT'; debt?: BigNumber }
  | AaveOpenPositionWithStopLossEvents
  | { type: 'CREATED_MACHINE'; refTransactionMachine: RefTransactionMachine }
  | { type: 'UPDATE_RESERVE_DATA', reserveData: ReserveData }
