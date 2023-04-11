import { IPosition, IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { PositionId } from 'features/aave/types'
import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { AaveMultiplyManageComponentProps } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { Feature } from 'helpers/useFeatureToggle'
import { AaveLendingProtocol } from 'lendingProtocols'
import { ReserveConfigurationData, ReserveData } from 'lendingProtocols/aaveCommon'

import { BaseAaveEvent, BaseViewProps } from './BaseAaveContext'

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
    headerManage: ManageAaveHeader
    headerView: ManageAaveHeader
    simulateSection: SimulateSection
    vaultDetailsManage: VaultDetails
    vaultDetailsView: VaultDetails
    secondaryInput: SecondaryInput
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
  protocol: AaveLendingProtocol
  featureToggle?: Feature
  defaultSlippage?: BigNumber
}
export type AaveHeaderProps = {
  strategyConfig: IStrategyConfig
}

export type ManageAaveHeaderProps = AaveHeaderProps & {
  positionId: PositionId
}

export type ManageSectionComponentProps = {
  aaveReserveState: ReserveConfigurationData
  aaveReserveDataDebtToken: ReserveData
}

export type SecondaryInputProps = BaseViewProps<EventsRaisedFromSecondaryInput> & {
  viewLocked?: boolean // locks whole view
  showWarring?: boolean // displays warning
  onChainPosition?: IPosition
  stopLossError?: boolean
}

type AaveHeader = (props: AaveHeaderProps) => JSX.Element
type ManageAaveHeader = (props: ManageAaveHeaderProps) => JSX.Element
type SimulateSection = (props: AaveMultiplyManageComponentProps) => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps &
    ViewPositionSectionComponentProps &
    AaveMultiplyManageComponentProps,
) => JSX.Element

type SecondaryInput = (props: SecondaryInputProps) => JSX.Element

type EventsRaisedFromSecondaryInput =
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | {
      type: 'RESET_RISK_RATIO'
    }
  | { type: 'SET_DEBT'; debt: BigNumber }
  | BaseAaveEvent

type PositionInfo = () => JSX.Element
