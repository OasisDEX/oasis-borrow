import type { CreateDPMAccount } from 'blockchain/calls/accountFactory.types'
import type { DeployAjnaPoolTxData } from 'blockchain/calls/ajnaErc20PoolFactory.types'
import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot.types'
import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import type { EstimateGasFunction, SendTransactionFunction } from 'blockchain/calls/callsHelpers'
import type { ApproveData, DisapproveData } from 'blockchain/calls/erc20'
import type { ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import type { OasisActionsTxData } from 'blockchain/calls/oasisActions'
import type { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import type { CreateDsProxyData, SetProxyOwnerData } from 'blockchain/calls/proxy'
import type {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import type {
  CloseGuniMultiplyData,
  CloseVaultData,
  MultiplyAdjustData,
  OpenGuniMultiplyData,
  OpenMultiplyData,
  ReclaimData,
} from 'blockchain/calls/proxyActions/proxyActions'
import type { NetworkIds } from 'blockchain/networks'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation'
import type { LendingProtocol } from 'lendingProtocols'
import type { AaveLikeServices } from 'lendingProtocols/aave-like-common'
import type { getAaveV2Services } from 'lendingProtocols/aave-v2'
import type { Observable } from 'rxjs'

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
  | DeployAjnaPoolTxData

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
  [LendingProtocol.AaveV2]: AaveLikeServices
  [LendingProtocol.AaveV3]: {
    [NetworkIds.MAINNET]: AaveLikeServices
    [NetworkIds.OPTIMISMMAINNET]: AaveLikeServices
    [NetworkIds.ARBITRUMMAINNET]: AaveLikeServices
  }
  [LendingProtocol.SparkV3]: {
    [NetworkIds.MAINNET]: AaveLikeServices
  }
}

export type DepreciatedServices = {
  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveLikeLiquidations$ instead
   */
  aaveLikeLiquidations$?: ReturnType<typeof getAaveV2Services>['aaveLikeLiquidations$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveLikeUserAccountData$ instead
   */
  aaveLikeUserAccountData$?: ReturnType<typeof getAaveV2Services>['aaveLikeUserAccountData$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveLikeAvailableLiquidityInUSDC$ instead
   */
  aaveLikeAvailableLiquidityInUSDC$?: ReturnType<
    typeof getAaveV2Services
  >['aaveLikeAvailableLiquidityInUSDC$']

  /**
   * @deprecated use protocols[LendingProtocols.AaveV2].aaveLikeProtocolData$ instead
   */
  aaveLikeProtocolData$?: ReturnType<typeof getAaveV2Services>['aaveLikeProtocolData$']
}
