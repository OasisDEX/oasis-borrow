import type { IRiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkIds, NetworkNames } from 'blockchain/networks'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import type { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeServices,
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'

import type { AddressesRelatedWithPosition } from './helpers'
import type { ManageAaveStateMachine } from './manage/state'
import type { OpenAaveStateMachine } from './open/state'
import type { IStrategyConfig, ManageViewInfo, PositionId } from './types'

export type AaveTotalValueLocked = {
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
    protocol: AaveLikeLendingProtocol,
  ) => Observable<IStrategyConfig>
  updateStrategyConfig?: (
    positionId: PositionId,
    networkName: NetworkNames,
  ) => (vaultType: VaultType) => void
  proxiesRelatedWithPosition$: (
    positionId: PositionId,
    networkId: NetworkIds,
  ) => Observable<AddressesRelatedWithPosition>
  chainLinkETHUSDOraclePrice$: Observable<BigNumber>
  earnCollateralsReserveData: Record<string, Observable<AaveLikeReserveConfigurationData>>
  dpmAccountStateMachine: DPMAccountStateMachine
  aaveHistory$: (proxyAddress: string) => Observable<VaultHistoryEvent[]>
  manageViewInfo$: (args: { positionId: PositionId }) => Observable<ManageViewInfo>
  manageViewInfoExternal$: (args: { positionId: PositionId }) => Observable<ManageViewInfo>
}
