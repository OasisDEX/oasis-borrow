import type { BigNumber } from 'bignumber.js'
import type { IlkData, IlkDataChange } from 'blockchain/ilks.types'
import type { BalanceInfo, BalanceInfoChange } from 'features/shared/balanceInfo.types'
import type { PriceInfo, PriceInfoChange } from 'features/shared/priceInfo.types'
import type { SlippageChange } from 'features/userSettings/userSettings.types'

export interface EnvironmentState {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
  invalidSlippage: boolean
}

export type EnvironmentChange = PriceInfoChange | BalanceInfoChange | IlkDataChange | SlippageChange

export function applyEnvironment<S extends EnvironmentState, Ch extends EnvironmentChange>(
  state: S,
  change: Ch,
): S {
  if (change.kind === 'priceInfo') {
    return {
      ...state,
      priceInfo: change.priceInfo,
    }
  }

  if (change.kind === 'balanceInfo') {
    return {
      ...state,
      balanceInfo: change.balanceInfo,
    }
  }

  if (change.kind === 'ilkData') {
    return {
      ...state,
      ilkData: change.ilkData,
    }
  }

  if (change.kind === 'slippage') {
    return {
      ...state,
      slippage: change.slippage,
    }
  }

  return state
}
