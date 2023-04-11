import {
  IPosition,
  IPositionTransition,
  IRiskRatio,
  ISimplePositionTransition,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context } from 'blockchain/network'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { getTxTokenAndAmount } from 'features/aave/helpers/getTxTokenAndAmount'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/strategyConfig'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import {
  AllowanceStateMachine,
  AllowanceStateMachineResponseEvent,
} from 'features/stateMachines/allowance'
import { TransactionStateMachineResultEvents } from 'features/stateMachines/transaction'
import { TransactionParametersStateMachineResponseEvent } from 'features/stateMachines/transactionParameters'
import { SLIPPAGE_DEFAULT, UserSettingsState } from 'features/userSettings/userSettings'
import { HasGasEstimation } from 'helpers/form'
import { zero } from 'helpers/zero'
import { ProtocolData } from 'lendingProtocols/aaveCommon'
import { ActorRefFrom, EventObject, Sender } from 'xstate'

import { IStrategyConfig } from './StrategyConfigTypes'

export type UserInput = {
  riskRatio?: IRiskRatio
  amount?: BigNumber
  debtAmount?: BigNumber
}
export type ManageTokenInput = {
  manageTokenAction?: ManageDebtActionsEnum | ManageCollateralActionsEnum
  manageTokenActionValue?: BigNumber
  closingToken?: string
}

export type IStrategyInfo = {
  oracleAssetPrice: {
    collateral: BigNumber
    debt: BigNumber
    deposit: BigNumber
  }
  liquidationBonus: BigNumber
  tokens: IStrategyConfig['tokens']
}

export type StrategyTokenAllowance = {
  collateral: BigNumber
  debt: BigNumber
  deposit: BigNumber
}

export type StrategyTokenBalance = {
  collateral: { price: BigNumber; balance: BigNumber }
  debt: { price: BigNumber; balance: BigNumber }
  deposit: { price: BigNumber; balance: BigNumber }
}

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

type AaveOpenPositionWithStopLossEvents =
  | { type: 'SET_STOP_LOSS_LEVEL'; stopLossLevel: BigNumber }
  | { type: 'SET_COLLATERAL_ACTIVE'; collateralActive: boolean }
  | { type: 'SET_STOP_LOSS_TX_DATA'; stopLossTxData: AutomationAddTriggerData }
  | { type: 'SET_STOP_LOSS_SKIPPED'; stopLossSkipped: boolean }

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
  | { type: 'UPDATE_PROTOCOL_DATA'; protocolData: ProtocolData }
  | { type: 'UPDATE_ALLOWANCE'; allowance: StrategyTokenAllowance }
  | { type: 'USE_SLIPPAGE'; getSlippageFrom: 'userSettings' | 'strategyConfig' }
  | TransactionParametersStateMachineResponseEvent
  | TransactionStateMachineResultEvents
  | AllowanceStateMachineResponseEvent
  | { type: 'SET_DEBT'; debt: BigNumber }
  | AaveOpenPositionWithStopLossEvents

export interface BaseAaveContext {
  strategyConfig: IStrategyConfig
  userInput: UserInput
  manageTokenInput?: ManageTokenInput
  tokens: {
    collateral: string
    debt: string
    deposit: string
  }
  currentPosition?: IPosition

  currentStep: number
  totalSteps: number

  transition?: IPositionTransition | ISimplePositionTransition
  estimatedGasPrice?: HasGasEstimation
  /**
   * @deprecated no idea what token it is. use **balance.__token__.balance** instead
   */
  tokenBalance?: BigNumber
  allowance?: StrategyTokenAllowance
  balance?: StrategyTokenBalance
  /**
   * @deprecated no idea what token it is 🤦‍. use **balance.{}.price** instead
   */
  tokenPrice?: BigNumber
  /**
   * @deprecated use **balance.collateral.price** instead
   */
  collateralPrice?: BigNumber
  /**
   * @deprecated use **balance.debt.price** instead
   */
  debtPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  connectedProxyAddress?: string
  strategyInfo?: IStrategyInfo
  web3Context?: Context
  userSettings?: UserSettingsState
  error?: string | unknown
  protocolData?: ProtocolData
  userDpmAccount?: UserDpmAccount
  effectiveProxyAddress?: string
  refAllowanceStateMachine?: ActorRefFrom<AllowanceStateMachine>
  transactionToken?: string
  defaultRiskRatio?: IRiskRatio
  stopLossLevel?: BigNumber
  collateralActive?: boolean
  stopLossTxData?: AutomationAddTriggerData
  stopLossSkipped?: boolean
  getSlippageFrom: 'userSettings' | 'strategyConfig'
}

export type BaseViewProps<AaveEvent extends EventObject> = {
  state: {
    context: BaseAaveContext
  }
  send: Sender<AaveEvent>
  isLoading: () => boolean
}

export function contextToTransactionParameters(context: BaseAaveContext): OperationExecutorTxMeta {
  const { token, amount } = getTxTokenAndAmount(context)
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transition!.transaction.calls as any,
    operationName: context.transition!.transaction.operationName,
    proxyAddress: context.effectiveProxyAddress!,
    token,
    amount,
  }
}

function allowanceForToken(
  transactionToken: string,
  context: BaseAaveContext,
): BigNumber | undefined {
  switch (transactionToken) {
    case context.tokens.collateral:
      return context.allowance?.collateral
    case context.tokens.debt:
      return context.allowance?.debt
    case context.tokens.deposit:
      return context.allowance?.deposit
    default:
      return zero
  }
}

export function isAllowanceNeeded(context: BaseAaveContext): boolean {
  const token = context.transactionToken || context.tokens.deposit
  if (token === 'ETH') {
    return false
  }

  const allowance = allowanceForToken(token, context)

  const isDepositingAction =
    context.manageTokenInput?.manageTokenAction ===
      ManageCollateralActionsEnum.DEPOSIT_COLLATERAL ||
    context.manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.PAYBACK_DEBT ||
    (context.userInput.amount || zero).gt(zero)

  return (
    isDepositingAction &&
    (context.userInput.amount || context.manageTokenInput?.manageTokenActionValue || zero).gt(
      allowance || zero,
    )
  )
}

export function getSlippage(
  context: Pick<BaseAaveContext, 'getSlippageFrom' | 'userSettings' | 'strategyConfig'>,
) {
  if (context.getSlippageFrom === 'userSettings') {
    return context.userSettings?.slippage || SLIPPAGE_DEFAULT
  }

  return (
    context.strategyConfig.defaultSlippage || context.userSettings?.slippage || SLIPPAGE_DEFAULT
  )
}
