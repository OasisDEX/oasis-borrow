import { BigNumber } from 'bignumber.js'
import { IlkData, IlkDataChange } from 'blockchain/ilks'
import { BalanceInfo, BalanceInfoChange } from 'features/shared/balanceInfo'
import { PriceInfo, PriceInfoChange } from 'features/shared/priceInfo'

export interface EnvironmentState {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
}

export type EnvironmentChange = PriceInfoChange | BalanceInfoChange | IlkDataChange

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

  return state
}
