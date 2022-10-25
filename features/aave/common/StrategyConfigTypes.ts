import { ActorRefFrom } from 'xstate'

import { AaveReserveConfigurationData } from '../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { PreparedAaveTotalValueLocked } from '../helpers/aavePrepareAaveTotalValueLocked'
import { PreparedAaveReserveData } from '../helpers/aavePrepareReserveData'
import { AaveStEthSimulateStateMachine } from '../open/state'

export interface StrategyConfig {
  name: string
  urlSlug: string
  viewComponents: {
    headerOpen: AaveHeader
    headerManage: AaveHeader
    simulateSection: SimulateSection
    vaultDetails: VaultDetails
  }
}

export type AavePositionHeaderPropsBase = {
  simulationActor?: ActorRefFrom<AaveStEthSimulateStateMachine>
  aaveTVL?: PreparedAaveTotalValueLocked
  strategyName: string
  noDetails?: boolean
}

export type ManageSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
}

type AaveHeader = (props: AavePositionHeaderPropsBase) => JSX.Element
type SimulateSection = () => JSX.Element
type VaultDetails = (props: ManageSectionComponentProps) => JSX.Element
