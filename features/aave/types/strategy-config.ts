import { IPosition, IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkConfigHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
import { AaveManageComponentProps, ManageSectionComponentProps, ViewPositionSectionComponentProps } from 'features/aave/components'
import { BaseViewProps } from 'features/aave/types/base-aave-context'
import { BaseAaveEvent } from 'features/aave/types/base-aave-event'
import { ProductType } from 'features/aave/types/is-supported-product-type'
import { ManagePositionAvailableActions } from 'features/aave/types/manage-position-available-actions'
import { PositionId } from 'features/aave/types/position-id'
import { Feature } from 'helpers/useFeatureToggle'
import { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'

type AaveHeader = (props: AaveHeaderProps) => JSX.Element
type ManageAaveHeader = (props: ManageAaveHeaderProps) => JSX.Element
type SimulateSection = (props: AaveManageComponentProps) => JSX.Element
type VaultDetails = (
  props: ManageSectionComponentProps & ViewPositionSectionComponentProps & AaveManageComponentProps,
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
  showWarring?: boolean // displays warning
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

export interface IStrategyConfig {
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
    vaultDetailsView: VaultDetails
    secondaryInput: SecondaryInput
    adjustRiskInput: SecondaryInput
    positionInfo: PositionInfo
    sidebarTitle: string
    sidebarButton: string
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
  type: ProductType
  protocol: AaveLendingProtocol | SparkLendingProtocol
  featureToggle?: Feature
  defaultSlippage?: BigNumber
  executeTransactionWith: 'web3' | 'ethers'
  strategyType: StrategyType
}
