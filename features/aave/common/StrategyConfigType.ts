import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'

import { AavePositionHeaderPropsBase } from '../../earn/aave/components/AavePositionHeader'
import { ManageSectionComponentProps } from '../manage/components'

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
