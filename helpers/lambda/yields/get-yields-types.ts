import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetYieldsParams {
  actionSource?: string
  ltv: BigNumber
  quoteTokenAddress: string
  collateralTokenAddress: string
  networkId: NetworkIds
  protocol: LendingProtocol
  referenceDate: Date
}

export interface GetYieldsResponse {
  position: {
    collateral: string[]
    debt: string[]
    ltv: string
    referenceDate: string
  }
  results: {
    apy: number
    apy7d: number
    apy30d: number
    apy90d: number
  }
}

export interface GetYieldsResponseMapped {
  apy: BigNumber
  apy7d: BigNumber
  apy30d: BigNumber
  apy90d: BigNumber
}
