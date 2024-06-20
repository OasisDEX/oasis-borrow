import type { LendingProtocol } from 'lendingProtocols'

export enum RaysMultipliersType {
  TIME_OPEN = 'TIME_OPEN',
  AUTOMATION = 'AUTOMATION',
  LAZY_VAULT = 'LAZY_VAULT',
  SWAP = 'SWAP',
  PROTOCOL_BOOST = 'PROTOCOL_BOOST',
}

export type RaysMultipliers = {
  value: number
  type: RaysMultipliersType
}

export type PositionRaysMultipliersData = {
  user: RaysMultipliers[]
  position: RaysMultipliers[]
  allUserProtocols: LendingProtocol[]
}
