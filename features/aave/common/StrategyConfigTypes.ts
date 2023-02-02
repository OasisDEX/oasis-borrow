import { IPosition, IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ViewPositionSectionComponentProps } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { AaveMultiplyManageComponentProps } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { Feature } from 'helpers/useFeatureToggle'

import { AaveV2ReserveConfigurationData } from '../../../blockchain/aave'
import { LendingProtocol } from '../../../lendingProtocols'
import { PreparedAaveReserveData } from '../../../lendingProtocols/aave-v2/pipelines'
import { BaseViewProps } from './BaseAaveContext'

export enum ProxyType {
  DsProxy = 'DsProxy',
  DpmProxy = 'DpmProxy',
}

export type ProductType = 'Multiply' | 'Earn' | 'Borrow'

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
    secondaryInput: SecondaryInput
    positionInfo: PositionInfo
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
    default: IRiskRatio | 'slightlyLessThanMaxRisk'
  }
  type: ProductType
  protocol: LendingProtocol
  featureToggle?: Feature
}

export type AaveHeaderProps = {
  strategyConfig: IStrategyConfig
}

export type ManageSectionComponentProps = {
  aaveReserveState: AaveV2ReserveConfigurationData
  aaveReserveDataDebtToken: PreparedAaveReserveData
}

export type SecondaryInputProps = BaseViewProps<EventsRaisedFromSecondaryInput> & {
  viewLocked?: boolean // locks whole view
  showWarring?: boolean // displays warning
  onChainPosition?: IPosition
}

type AaveHeader = (props: AaveHeaderProps) => JSX.Element
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

type PositionInfo = () => JSX.Element
