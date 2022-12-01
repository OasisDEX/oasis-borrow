import { IRiskRatio } from '@oasisdex/oasis-actions'
import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { AaveMultiplyManageComponentProps } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { Feature } from 'helpers/useFeatureToggle'

import { AaveReserveConfigurationData } from '../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { PreparedAaveReserveData } from '../helpers/aavePrepareReserveData'
import { AdjustRiskViewProps } from './components/SidebarAdjustRiskView'

export interface IStrategyConfig {
  name: string
  urlSlug: string
  viewComponents: {
    headerOpen: AaveHeader
    headerManage: AaveHeader
    headerView: AaveHeader
    simulateSection: SimulateSection
    vaultDetailsManage: VaultDetails
    vaultDetailsView: VaultDetails
    adjustRiskView: AdjustRiskView
    sidebarTitle: string
    sidebarButton: string
  }
  tokens: {
    collateral: string
    debt: string
    deposit: string
  }
  riskRatios: {
    minimum: IRiskRatio
    default: IRiskRatio
  }
  type: 'multiply' | 'earn'
  featureToggle: Feature
}

export type AaveHeaderProps = {
  strategyConfig: IStrategyConfig
}

export type ManageSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
}

type AaveHeader = (props: AaveHeaderProps) => JSX.Element
type SimulateSection = (props: AaveMultiplyManageComponentProps) => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps &
    ViewPositionSectionComponentProps &
    AaveMultiplyManageComponentProps,
) => JSX.Element
type AdjustRiskView = (props: AdjustRiskViewProps) => JSX.Element
