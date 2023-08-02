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
