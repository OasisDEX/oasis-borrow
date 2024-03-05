import { AaveLikePosition, IPosition, IRiskRatio, IStrategy } from "@oasisdex/dma-library";
import BigNumber from 'bignumber.js'
import {
  DpmExecuteOperationExecutorActionParameters,
  DpmExecuteOperationParameters
} from "blockchain/better-calls/dpm-account";
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context, ContextConnected } from 'blockchain/network.types'
import { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { getTxTokenAndAmount } from 'features/aave/helpers/getTxTokenAndAmount'
import { IStrategyConfig } from './strategy-config'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions.types'
import { UserSettingsState } from 'features/userSettings/userSettings.types'
import { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { AllowanceStateMachine } from 'features/stateMachines/allowance'
import { EthersTransactionStateMachine, TransactionStateMachine } from 'features/stateMachines/transaction'
import { zero } from 'helpers/zero'
import { ActorRefFrom, EventObject, Sender } from 'xstate'
import { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { AaveCumulativeData } from 'features/omni-kit/protocols/aave/history/types'
import { ProfitsSimulationMapped, TriggerTransaction } from "../../../helpers/triggers";
import { MigrateAaveContext } from "../manage/state/migrateAaveStateMachine";

export type UserInput = {
  riskRatio?: IRiskRatio
  amount?: BigNumber
  debtAmount?: BigNumber
}
export type ManageTokenInput = {
  manageAction?: ManageDebtActionsEnum | ManageCollateralActionsEnum
  manageInput1Value?: BigNumber
  manageInput2Value?: BigNumber
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

export type ReserveData = {
  collateral: AaveLikeReserveData
  debt: AaveLikeReserveData
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
  currentPosition?: AaveLikePosition

  currentStep: number
  totalSteps: number

  transition?: IStrategy
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
  userDpmAccount?: UserDpmAccount
  effectiveProxyAddress?: string
  refAllowanceStateMachine?: ActorRefFrom<AllowanceStateMachine>
  transactionToken?: string
  defaultRiskRatio?: IRiskRatio
  stopLossLevel?: BigNumber
  trailingDistance?: BigNumber
  collateralActive?: boolean
  stopLossTxData?: AutomationAddTriggerData
  stopLossTxDataLambda?: TriggerTransaction
  trailingStopLossTxDataLambda?: TriggerTransaction
  partialTakeProfitTxDataLambda?: TriggerTransaction
  partialTakeProfitProfits?: ProfitsSimulationMapped[] | undefined
  stopLossSkipped?: boolean
  getSlippageFrom: 'userSettings' | 'strategyConfig'
  reserveData?: ReserveData
  cumulatives?: AaveCumulativeData
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

export function contextToEthersTransactions(context: BaseAaveContext): DpmExecuteOperationExecutorActionParameters {
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

export function migrationContextToEthersTransactions(context: MigrateAaveContext): DpmExecuteOperationParameters {

  return {
    networkId: context.strategyConfig.networkId,
    proxyAddress: context.userDpmAccount?.proxy!,
    tx: context.strategy?.tx!,
    signer: (context.web3Context as ContextConnected).transactionProvider,
  }
}


