import type { BigNumber } from 'bignumber.js'
import type { Observable } from 'rxjs'

export interface Tickers {
  [label: string]: BigNumber
}
export type GasPriceParams = {
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}

export type GasPrice$ = Observable<GasPriceParams>

export interface OraclePriceData {
  currentPrice: BigNumber
  nextPrice: BigNumber
  currentPriceUpdate?: Date
  nextPriceUpdate?: Date
  priceUpdateInterval?: number
  isStaticPrice: boolean
  percentageChange: BigNumber
}
export type OraclePriceDataArgs = {
  token: string
  requestedData: Array<keyof OraclePriceData>
}
