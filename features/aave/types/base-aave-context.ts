import { IPosition, IRiskRatio, ISimplePositionTransition, IStrategy, PositionTransition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { DpmExecuteParameters } from 'blockchain/better-calls/dpm-account'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context, ContextConnected } from 'blockchain/network'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { getTxTokenAndAmount } from 'features/aave/helpers/getTxTokenAndAmount'
import { IStrategyConfig } from './strategy-config'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { HasGasEstimation } from 'helpers/context/types'
import { AllowanceStateMachine } from 'features/stateMachines/allowance'
import { EthersTransactionStateMachine, TransactionStateMachine } from 'features/stateMachines/transaction'
import { zero } from 'helpers/zero'
import { AaveLikeProtocolData } from 'lendingProtocols/aave-like-common'
import { ActorRefFrom, EventObject, Sender } from 'xstate'

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

export type RefTransactionMachine =
  | ActorRefFrom<TransactionStateMachine<OperationExecutorTxMeta>>
  | ActorRefFrom<EthersTransactionStateMachine<any>> // todo


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

  transition?: ISimplePositionTransition | PositionTransition | IStrategy
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
  protocolData?: AaveLikeProtocolData
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

export function contextToEthersTransactions(context: BaseAaveContext): DpmExecuteParameters {
  const { amount, token } = getTxTokenAndAmount(context)

  return {
    networkId: context.strategyConfig.networkId,
    proxyAddress: context.effectiveProxyAddress!,
    calls: context.transition!.transaction.calls,
    operationName: context.transition!.transaction.operationName,
    value: token === 'ETH' ? amount : zero,
    signer: (context.web3Context as ContextConnected).transactionProvider,
  }
}


