import { NetworkConfigHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
import { IPosition, IRiskRatio } from '@oasisdex/dma-library'
import { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import BigNumber from 'bignumber.js'

import { AaveManageComponentProps, ManageSectionComponentProps } from '../components'
import { ManagePositionAvailableActions } from './manage-position-available-actions'
import { PositionId } from './position-id'
import { BaseViewProps } from './base-aave-context'
import { BaseAaveEvent } from './base-aave-event'
import { ProductType } from './is-supported-product-type'
import { FeaturesEnum } from 'types/config'
import { AutomationFeatures } from "../../automation/common/types";


type AaveHeader = (props: AaveHeaderProps) => JSX.Element
type ManageAaveHeader = (props: ManageAaveHeaderProps) => JSX.Element
type SimulateSection = (props: AaveManageComponentProps) => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps & AaveManageComponentProps,
) => JSX.Element

type SecondaryInput = (props: SecondaryInputProps) => JSX.Element

type PositionInfo = () => JSX.Element

export type AaveHeaderProps = {
  strategyConfig: IStrategyConfig
}

export type ManageAaveHeaderProps = AaveHeaderProps & {
  positionId: PositionId
}

export type SecondaryInputProps = BaseViewProps<EventsRaisedFromSecondaryInput> & {
  viewLocked?: boolean // locks whole view
  showWarning?: boolean // displays warning
  onChainPosition?: IPosition
  stopLossError?: boolean
}

type EventsRaisedFromSecondaryInput =
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | {
  type: 'RESET_RISK_RATIO'
}
  | { type: 'SET_DEBT'; debt: BigNumber }
  | BaseAaveEvent

export enum ProxyType {
  DsProxy = 'DsProxy',
  DpmProxy = 'DpmProxy',
}

export enum StrategyType {
  Short = 'short',
  Long = 'long',
}

interface IStrategyBase {
  network: NetworkNames
  networkId: NetworkIds
  networkHexId: NetworkConfigHexId
  name: string
  urlSlug: string
  proxyType: ProxyType
  viewComponents: {
    headerOpen: AaveHeader
    headerManage: ManageAaveHeader
    headerView: ManageAaveHeader
    simulateSection: SimulateSection
    vaultDetailsManage: VaultDetails
    positionInfo: PositionInfo
    sidebarTitle: string
    sidebarButton: string
  }
  type: ProductType
  protocol: AaveLendingProtocol | SparkLendingProtocol
  executeTransactionWith: 'web3' | 'ethers'
  strategyType: StrategyType
  isAutomationFeatureEnabled: (feature: AutomationFeatures) => boolean
}

export interface IStrategyConfig extends IStrategyBase {
  viewComponents: IStrategyBase['viewComponents'] & {
    secondaryInput: SecondaryInput
    adjustRiskInput: SecondaryInput
  }
  availableActions: () => ManagePositionAvailableActions[]
  tokens: {
    collateral: string
    debt: string
    deposit: string
  }
  riskRatios: {
    minimum: IRiskRatio
    default: IRiskRatio | 'slightlyLessThanMaxRisk'
  }
  featureToggle?: FeaturesEnum
  defaultSlippage?: BigNumber
}


export interface IStrategyDepositConfig extends IStrategyBase {
  availableActions: () => ManagePositionAvailableActions[]
  tokens: {
    deposit: string
  }
  featureToggle?: FeaturesEnum
  defaultSlippage?: BigNumber
}
