import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'

import { AavePositionHeaderPropsBase } from '../../earn/aave/components/AavePositionHeader'
import { ManageSectionComponentProps } from '../manage/components'
import { AdjustRiskViewProps } from './components/SidebarAdjustRiskView'

export interface StrategyConfig {
  name: string
  urlSlug: string
  viewComponents: {
    headerOpen: AaveHeader
    headerView: AaveHeader
    headerManage: AaveHeader
    simulateSection: SimulateSection
    vaultDetailsManage: VaultDetails
    vaultDetailsView: VaultDetails
    adjustRiskView: AdjustRiskView
  }
  tokens?: {
    collateral: string
    debt: string
  }
}

type AaveHeader = (props: AavePositionHeaderPropsBase) => JSX.Element
type SimulateSection = () => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps & ViewPositionSectionComponentProps,
) => JSX.Element
type AdjustRiskView = (props: AdjustRiskViewProps) => JSX.Element
