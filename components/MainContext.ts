import { createSend } from '@oasisdex/transactions'
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
import {
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from 'blockchain/network'
import { createGasPrice$ } from 'blockchain/prices'
import { createWeb3Context$ } from 'features/web3Context'
import { createTxHelpers$ } from 'helpers/createTxHelpers'
import { Observable, of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

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

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}

export type TxHelpers$ = Observable<TxHelpers>

export function setupMainContext() {
  const once$ = of(undefined).pipe(shareReplay(1))
  const [web3Context$, setupWeb3Context$, switchChains] = createWeb3Context$()
  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)
  const account$ = createAccount$(web3Context$)
  const connectedContext$ = createContextConnected$(context$)
  const initializedAccount$ = createInitializedAccount$(account$)
  const [send] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    // @ts-ignore
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$)

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)

  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    context$,
    onEveryBlock$,
    everyBlock$,
    txHelpers$,
    connectedContext$,
    once$,
    switchChains,
  }
}

export type MainContext = ReturnType<typeof setupMainContext>
