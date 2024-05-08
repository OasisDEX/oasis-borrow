import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetYieldsParams {
  actionSource?: string
  ltv: BigNumber
  quoteTokenAddress?: string
  collateralTokenAddress?: string
  quoteToken?: string
  collateralToken?: string
  networkId: NetworkIds
  protocol: LendingProtocol
  referenceDate?: Date
  poolAddress?: string
}

export interface GetYieldsResponse {
  position: {
    poolAddress?: string
    collateral: string[]
    debt: string[]
    ltv: string
    referenceDate: string
  }
  results: {
    apy?: number
    apy1d: number
    apy7d: number
    apy30d?: number
    apy90d?: number
  }
}

export interface GetYieldsResponseMapped {
  apy365d?: BigNumber
  apy1d: BigNumber
  apy7d: BigNumber
  apy30d?: BigNumber
  apy90d?: BigNumber
}
