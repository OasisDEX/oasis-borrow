import { IRiskRatio } from '@oasisdex/oasis-actions'
import { AaveV2ReserveConfigurationData } from 'blockchain/aave'
import { PositionId } from 'features/aave/types'
import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { AaveMultiplyManageComponentProps } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { Feature } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'
import { PreparedAaveReserveData } from 'lendingProtocols/aave-v2/pipelines'

import { AdjustRiskViewProps } from './components/SidebarAdjustRiskView'

export enum ProxyType {
  DsProxy = 'DsProxy',
  DpmProxy = 'DpmProxy',
}

export type ProductType = 'Multiply' | 'Earn' | 'Borrow'

export type ManagePositionAvailableActions =
  | 'adjust'
  | 'manage-debt'
  | 'manage-collateral'
  | 'close'

export interface IStrategyConfig {
  name: string
  urlSlug: string
  proxyType: ProxyType
  viewComponents: {
    headerOpen: AaveHeader
    headerManage: AaveHeader
    headerView: AaveHeader
    simulateSection: SimulateSection
    vaultDetailsManage: VaultDetails
    vaultDetailsView: VaultDetails
    adjustRiskView: AdjustRiskView
    positionInfo: PositionInfo
    sidebarTitle: string
    sidebarButton: string
  }
  availableActions: ManagePositionAvailableActions[]
  tokens: {
    collateral: string
    debt: string
    deposit: string
  }
  riskRatios: {
    minimum: IRiskRatio
    default: IRiskRatio | 'slightlyLessThanMaxRisk'
  }
  type: ProductType
  protocol: LendingProtocol
  featureToggle?: Feature
}

export type AaveHeaderProps = {
  strategyConfig: IStrategyConfig
  positionId: PositionId
}

export type ManageSectionComponentProps = {
  aaveReserveState: AaveV2ReserveConfigurationData
  aaveReserveDataDebtToken: PreparedAaveReserveData
}

type AaveHeader = (props: AaveHeaderProps) => JSX.Element
type SimulateSection = (props: AaveMultiplyManageComponentProps) => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps &
    ViewPositionSectionComponentProps &
    AaveMultiplyManageComponentProps,
) => JSX.Element
type AdjustRiskView = (props: AdjustRiskViewProps) => JSX.Element
type PositionInfo = () => JSX.Element
