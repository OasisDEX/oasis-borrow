import type { NetworkNames } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

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
