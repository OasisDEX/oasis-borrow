import { IPosition, IPositionTransition, IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ActorRefFrom, EventObject, Sender } from 'xstate'

import { OperationExecutorTxMeta } from '../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../blockchain/calls/txMeta'
import { Context } from '../../../blockchain/network'
import { UserDpmProxy } from '../../../blockchain/userDpmProxies'
import { HasGasEstimation } from '../../../helpers/form'
import { zero } from '../../../helpers/zero'
import {
  AllowanceStateMachine,
  AllowanceStateMachineResponseEvent,
} from '../../stateMachines/allowance'
import { TransactionStateMachineResultEvents } from '../../stateMachines/transaction'
import { TransactionParametersStateMachineResponseEvent } from '../../stateMachines/transactionParameters'
import { UserSettingsState } from '../../userSettings/userSettings'
import { getTxTokenAndAmount } from '../helpers/getTxTokenAndAmount'
import { AaveProtocolData } from '../manage/services'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from '../strategyConfig'

type UserInput = {
  riskRatio?: IRiskRatio
  amount?: BigNumber
}
export type ManageTokenInput = {
  manageTokenAction?: ManageDebtActionsEnum | ManageCollateralActionsEnum
  manageTokenActionValue?: BigNumber
}

export type IStrategyInfo = {
  oracleAssetPrice: BigNumber
  liquidationBonus: BigNumber
  collateralToken: string
}

export type StrategyTokenAllowance = {
  collateral: BigNumber
  debt: BigNumber
  deposit: BigNumber
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
  | { type: 'DMP_PROXY_RECEIVED'; userDpmProxy: UserDpmProxy }
  | { type: 'SET_BALANCE'; tokenBalance: BigNumber; tokenPrice: BigNumber }
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | UpdateCollateralActionType
  | UpdateDebtActionType
  | UpdateTokenActionValueType
  | { type: 'UPDATE_STRATEGY_INFO'; strategyInfo: IStrategyInfo }
  | { type: 'UPDATE_PROTOCOL_DATA'; protocolData: AaveProtocolData }
  | { type: 'UPDATE_ALLOWANCE'; allowance: StrategyTokenAllowance }
  | TransactionParametersStateMachineResponseEvent
  | TransactionStateMachineResultEvents
  | AllowanceStateMachineResponseEvent

export interface BaseAaveContext {
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

  strategy?: IPositionTransition
  estimatedGasPrice?: HasGasEstimation
  tokenBalance?: BigNumber
  allowance?: StrategyTokenAllowance
  tokenPrice?: BigNumber
  collateralPrice?: BigNumber
  debtPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  connectedProxyAddress?: string
  strategyInfo?: IStrategyInfo
  web3Context?: Context
  userSettings?: UserSettingsState
  error?: string | unknown
  protocolData?: AaveProtocolData
  userDpmProxy?: UserDpmProxy
  effectiveProxyAddress?: string
  refAllowanceStateMachine?: ActorRefFrom<AllowanceStateMachine>
  transactionToken?: string
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
    calls: context.strategy!.transaction.calls as any,
    operationName: context.strategy!.transaction.operationName,
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
