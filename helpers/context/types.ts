import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot.types'
import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator.types'
import type { NetworkIds } from 'blockchain/networks'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import type { LendingProtocol } from 'lendingProtocols'
import type { AaveLikeServices } from 'lendingProtocols/aave-like-common'
import type { getAaveV2Services } from 'lendingProtocols/aave-v2'
import type { Observable } from 'rxjs'

import type { TxHelpers } from './TxHelpers'

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
}
