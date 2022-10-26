import { AavePositionHeaderPropsBase } from '../../earn/aave/components/AavePositionHeader'
import { ManageSectionComponentProps } from '../manage/components'

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

type AaveHeader = (props: AavePositionHeaderPropsBase) => JSX.Element
type SimulateSection = () => JSX.Element
type VaultDetails = (props: ManageSectionComponentProps) => JSX.Element
