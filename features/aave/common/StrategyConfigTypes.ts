import { IRiskRatio } from '@oasisdex/oasis-actions'
import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'

import { AaveReserveConfigurationData } from '../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { PreparedAaveTotalValueLocked } from '../helpers/aavePrepareAaveTotalValueLocked'
import { PreparedAaveReserveData } from '../helpers/aavePrepareReserveData'

export interface StrategyConfig {
  name: string
  urlSlug: string
  viewComponents: {
    headerOpen: AaveHeader
    headerManage: AaveHeader
    headerView: AaveHeader
    simulateSection: SimulateSection
    vaultDetailsManage: VaultDetails
    vaultDetailsView: VaultDetails
  }
  tokens?: {
    collateral: string
    debt: string
  }
}

export type AavePositionHeaderPropsBase = {
  maxRisk?: IRiskRatio
  aaveTVL?: PreparedAaveTotalValueLocked
  strategyName: string
}

export type ManageSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
}

type AaveHeader = (props: AavePositionHeaderPropsBase) => JSX.Element
type SimulateSection = () => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps & ViewPositionSectionComponentProps,
) => JSX.Element
