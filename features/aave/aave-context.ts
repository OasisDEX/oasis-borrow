import type { IRiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkIds,NetworkNames  } from 'blockchain/networks'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import type { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeServices,
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'

import type { ProxiesRelatedWithPosition } from './helpers'
import type { ManageAaveStateMachine } from './manage/state'
import type { OpenAaveStateMachine } from './open/state'
import type { IStrategyConfig, PositionId } from './types'

type AaveTotalValueLocked = {
  totalValueLocked: BigNumber
}

export type AaveContext = AaveLikeServices & {
  aaveStateMachine: OpenAaveStateMachine
  aaveManageStateMachine: ManageAaveStateMachine
  aaveTotalValueLocked$: Observable<AaveTotalValueLocked>
  aaveEarnYieldsQuery: (
    riskRatio: IRiskRatio,
    fields: FilterYieldFieldsType[],
  ) => Promise<AaveLikeYieldsResponse>
  strategyConfig$: (
    positionId: PositionId,
    networkName: NetworkNames,
    /* Accepts vaultType to further filter retrieved strategy assuming the product type has changed since position creation */
    vaultType: VaultType,
  ) => Observable<IStrategyConfig>
  updateStrategyConfig?: (
    positionId: PositionId,
    networkName: NetworkNames,
  ) => (vaultType: VaultType) => void
  proxiesRelatedWithPosition$: (
    positionId: PositionId,
    networkId: NetworkIds,
  ) => Observable<ProxiesRelatedWithPosition>
  chainlinkUSDCUSDOraclePrice$: Observable<BigNumber>
  chainLinkETHUSDOraclePrice$: Observable<BigNumber>
  earnCollateralsReserveData: Record<string, Observable<AaveLikeReserveConfigurationData>>
  dpmAccountStateMachine: DPMAccountStateMachine
  aaveHistory$: (proxyAddress: string) => Observable<VaultHistoryEvent[]>
}
