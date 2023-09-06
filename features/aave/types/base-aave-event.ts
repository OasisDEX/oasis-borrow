import { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import {
  IStrategyInfo, ManageTokenInput,
  RefTransactionMachine,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from 'features/aave/types/base-aave-context'
import { ManageCollateralActionsEnum } from 'features/aave/types/manage-collateral-actions-enum'
import { ManageDebtActionsEnum } from 'features/aave/types/manage-debt-actions-enum'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import { AllowanceStateMachineResponseEvent } from 'features/stateMachines/allowance'
import { TransactionStateMachineResultEvents } from 'features/stateMachines/transaction'
import { TransactionParametersStateMachineResponseEvent } from 'features/stateMachines/transactionParameters'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { AaveLikeProtocolData } from 'lendingProtocols/aave-like-common'

type AaveOpenPositionWithStopLossEvents =
  | { type: 'SET_STOP_LOSS_LEVEL'; stopLossLevel: BigNumber }
  | { type: 'SET_COLLATERAL_ACTIVE'; collateralActive: boolean }
  | { type: 'SET_STOP_LOSS_TX_DATA'; stopLossTxData: AutomationAddTriggerData }
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

export type UpdateTokenActionValueType = {
  type: 'UPDATE_TOKEN_ACTION_VALUE'
  manageTokenActionValue: ManageTokenInput['manageTokenActionValue']
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
  | UpdateCollateralActionType
  | UpdateClosingAction
  | UpdateDebtActionType
  | UpdateTokenActionValueType
  | { type: 'UPDATE_STRATEGY_INFO'; strategyInfo: IStrategyInfo }
  | { type: 'UPDATE_PROTOCOL_DATA'; protocolData: AaveLikeProtocolData }
  | { type: 'UPDATE_ALLOWANCE'; allowance: StrategyTokenAllowance }
  | { type: 'USE_SLIPPAGE'; getSlippageFrom: 'userSettings' | 'strategyConfig' }
  | TransactionParametersStateMachineResponseEvent
  | TransactionStateMachineResultEvents
  | AllowanceStateMachineResponseEvent
  | { type: 'SET_DEBT'; debt?: BigNumber }
  | AaveOpenPositionWithStopLossEvents
  | { type: 'CREATED_MACHINE'; refTransactionMachine: RefTransactionMachine }
