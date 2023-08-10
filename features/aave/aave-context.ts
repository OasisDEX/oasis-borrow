import { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import {
  AaveServices,
  AaveYieldsResponse,
  FilterYieldFieldsType,
  ReserveConfigurationData,
} from 'lendingProtocols/aaveCommon'
import { Observable } from 'rxjs'

import { ProxiesRelatedWithPosition } from './helpers'
import { ManageAaveStateMachine } from './manage/state'
import { OpenAaveStateMachine } from './open/state'
import { IStrategyConfig, PositionId } from './types'

type AaveTotalValueLocked = {
  totalValueLocked: BigNumber
}

export type AaveContext = AaveServices & {
  aaveStateMachine: OpenAaveStateMachine
  aaveManageStateMachine: ManageAaveStateMachine
  aaveTotalValueLocked$: Observable<AaveTotalValueLocked>
  aaveEarnYieldsQuery: (
    riskRatio: IRiskRatio,
    fields: FilterYieldFieldsType[],
  ) => Promise<AaveYieldsResponse>
  strategyConfig$: (
    positionId: PositionId,
    networkName: NetworkNames,
  ) => Observable<IStrategyConfig>
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>
  chainlinkUSDCUSDOraclePrice$: Observable<BigNumber>
  chainLinkETHUSDOraclePrice$: Observable<BigNumber>
  earnCollateralsReserveData: Record<string, Observable<ReserveConfigurationData>>
  dpmAccountStateMachine: DPMAccountStateMachine
  aaveHistory$: (proxyAddress: string) => Observable<VaultHistoryEvent[]>
}
