import type { CreateDPMAccount } from 'blockchain/calls/accountFactory.types'
import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot.types'
import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator.types'
import type { ApproveData, DisapproveData } from 'blockchain/calls/erc20.types'
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
