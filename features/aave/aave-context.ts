import { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { ProxiesRelatedWithPosition } from 'features/aave/helpers'
import { ManageAaveStateMachine } from 'features/aave/manage/state'
import { OpenAaveStateMachine } from 'features/aave/open/state'
import { IStrategyConfig, PositionId } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType'
import { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import {
  AaveLikeReserveConfigurationData,
  AaveLikeServices,
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
import { Observable } from 'rxjs'

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
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>
  chainlinkUSDCUSDOraclePrice$: Observable<BigNumber>
  chainLinkETHUSDOraclePrice$: Observable<BigNumber>
  earnCollateralsReserveData: { [key: string]: Observable<AaveLikeReserveConfigurationData> }
  dpmAccountStateMachine: DPMAccountStateMachine
  aaveHistory$: (proxyAddress: string) => Observable<VaultHistoryEvent[]>
}
