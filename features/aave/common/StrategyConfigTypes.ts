import { IRiskRatio } from '@oasisdex/oasis-actions'
import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'

import { AaveReserveConfigurationData } from '../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { PreparedAaveReserveData } from '../helpers/aavePrepareReserveData'
import { AdjustRiskViewProps } from './components/SidebarAdjustRiskView'

type CollateralTokenTypeList = 'STETH'
type DebtTokenTypeList = 'USDC' | 'ETH'

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
    adjustRiskView: AdjustRiskView
  }
  tokens: {
    collateral: CollateralTokenTypeList
    debt: DebtTokenTypeList
  }
  riskRatios: {
    minimum: IRiskRatio
    default: IRiskRatio
  }
  enabled: boolean
}

export type AaveHeaderProps = {
  strategyConfig: StrategyConfig
}

export type ManageSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  isManage?: boolean
}

type AaveHeader = (props: AaveHeaderProps) => JSX.Element
type SimulateSection = ({ isManage }: { isManage?: boolean }) => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps & ViewPositionSectionComponentProps,
) => JSX.Element
type AdjustRiskView = (props: AdjustRiskViewProps) => JSX.Element
