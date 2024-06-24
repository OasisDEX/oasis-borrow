import type { LendingProtocol } from 'lendingProtocols'

export enum UserRaysMultipliersType {
  SWAP = 'SWAP',
  PROTOCOL_BOOST = 'PROTOCOL_BOOST',
}

export enum PositionRaysMultipliersType {
  TIME_OPEN = 'TIME_OPEN',
  AUTOMATION = 'AUTOMATION',
  LAZY_VAULT = 'LAZY_VAULT',
}

export type UserRaysMultipliers = {
  value: number
  type: UserRaysMultipliersType
}

export type PositionRaysMultipliers = {
  value: number
  type: PositionRaysMultipliersType
}

export type PositionRaysMultipliersData = {
  user: UserRaysMultipliers[]
  position: PositionRaysMultipliers[]
  allUserProtocols: LendingProtocol[]
}

export enum RaysEligibilityCondition {
  POSITION_OPEN_TIME = 'POSITION_OPEN_TIME',
  POINTS_EXPIRED = 'POINTS_EXPIRED',
  BECOME_SUMMER_USER = 'BECOME_SUMMER_USER',
}

export enum RaysUserType {
  GENERAL_ETHEREUM_USER = 'General Ethereum User',
  DEFI_USER = 'DeFi User',
  SUMMERFI_USER = 'SummerFi User',
  SUMMERFI_POWER_USER = 'SummerFi Power User',
}
