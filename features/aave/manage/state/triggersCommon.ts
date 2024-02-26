import type BigNumber from 'bignumber.js'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'

export type PositionLike = {
  dpm: string
  ltv: number
  collateral: {
    token: {
      symbol: string
      address: string
      decimals: number
    }
    amount: BigNumber
  }
  debt: {
    token: {
      symbol: string
      address: string
      decimals: number
    }
    amount: BigNumber
  }
  protocol: AaveLendingProtocol | SparkLendingProtocol
  pricesDenomination: 'collateral' | 'debt'
}
