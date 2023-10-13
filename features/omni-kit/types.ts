import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import type { LendingProtocol } from 'lendingProtocols'

export interface OmniKitPosition {
  fee: BigNumber
}

export enum OmniKitProductType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
}

export enum OmniKitSidebarStep {
  Dpm = 'dpm',
  Manage = 'manage',
  Risk = 'risk',
  Setup = 'setup',
  Transaction = 'transaction',
  Transition = 'transition',
}

export type OmniKitEditingStep = OmniKitSidebarStep.Setup | OmniKitSidebarStep.Manage

export interface OmniKitProductPageProps {
  collateralToken: string
  network: NetworkNames
  positionId?: string
  productType: OmniKitProductType
  protocol: LendingProtocol
  quoteToken: string
}

export interface OmniKitHooksGeneratorResponse {
  useHeadlineDetails: () => HeadlineDetailsProp[]
}
