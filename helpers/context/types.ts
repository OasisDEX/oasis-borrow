import BigNumber from 'bignumber.js'
import { CreateDPMAccount } from 'blockchain/calls/accountFactory'
import { ClaimAjnaRewardsTxData } from 'blockchain/calls/ajnaRewardsClaimer'
import {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { EstimateGasFunction, SendTransactionFunction } from 'blockchain/calls/callsHelpers'
import { ApproveData, DisapproveData } from 'blockchain/calls/erc20'
import { ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { OasisActionsTxData } from 'blockchain/calls/oasisActions'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { CreateDsProxyData, SetProxyOwnerData } from 'blockchain/calls/proxy'
import {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import {
  CloseGuniMultiplyData,
  CloseVaultData,
  MultiplyAdjustData,
  OpenGuniMultiplyData,
  OpenMultiplyData,
  ReclaimData,
} from 'blockchain/calls/proxyActions/proxyActions'
import { NetworkIds } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { AaveServices } from 'lendingProtocols/aaveCommon'
import { Observable } from 'rxjs'

export type TxData =
  | OpenData
  | DepositAndGenerateData
  | WithdrawAndPaybackData
  | ApproveData
  | DisapproveData
  | CreateDsProxyData
  | SetProxyOwnerData
  | ReclaimData
  | OpenMultiplyData
  | MultiplyAdjustData
  | CloseVaultData
  | OpenGuniMultiplyData
  | AutomationBotAddTriggerData
  | AutomationBotV2AddTriggerData
  | CloseGuniMultiplyData
  | ClaimRewardData
  | ClaimMultipleData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotRemoveTriggersData
  | AutomationBotV2RemoveTriggerData
  | OperationExecutorTxMeta
  | CreateDPMAccount
  | OasisActionsTxData
  | ClaimAjnaRewardsTxData

export enum GasEstimationStatus {
  unset = 'unset',
  calculating = 'calculating',
  calculated = 'calculated',
  error = 'error',
  unknown = 'unknown',
}

export interface HasGasEstimationCost {
  gasEstimationUsd?: BigNumber
  gasEstimationEth?: BigNumber
  gasEstimationDai?: BigNumber
}

export interface HasGasEstimation extends HasGasEstimationCost {
  gasEstimationStatus: GasEstimationStatus
  error?: any
  gasEstimation?: number
}

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}
export type TxHelpers$ = Observable<TxHelpers>

export type AutomationTxData =
  | AutomationBotAddTriggerData
  | AutomationBotV2AddTriggerData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotRemoveTriggersData
  | AutomationBotV2RemoveTriggerData

export type AddGasEstimationFunction = <S extends HasGasEstimation>(
  state: S,
  call: (send: TxHelpers, state: S) => Observable<number> | undefined,
) => Observable<S>

export type ProtocolsServices = {
  [LendingProtocol.AaveV2]: AaveServices
  [LendingProtocol.AaveV3]: {
    [NetworkIds.MAINNET]: AaveServices
    [NetworkIds.OPTIMISMMAINNET]: AaveServices
    [NetworkIds.ARBITRUMMAINNET]: AaveServices
  }
}

export type DepreciatedServices = {
  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveLiquidations$ instead
   */
  aaveLiquidations$?: ReturnType<typeof getAaveV2Services>['aaveLiquidations$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveUserAccountData$ instead
   */
  aaveUserAccountData$?: ReturnType<typeof getAaveV2Services>['aaveUserAccountData$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveAvailableLiquidityInUSDC$ instead
   */
  aaveAvailableLiquidityInUSDC$?: ReturnType<
    typeof getAaveV2Services
  >['aaveAvailableLiquidityInUSDC$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveProtocolData$ instead
   */
  aaveProtocolData$?: ReturnType<typeof getAaveV2Services>['aaveProtocolData$']
}
