import type { BigNumber } from 'bignumber.js'
import type { Context, ContextConnected } from 'blockchain/network.types'
import type { AccountDetails } from 'features/account/AccountData'

export function isNullish(amount: BigNumber | undefined | null): boolean {
  return !amount || amount.isZero()
}

type UnknownAccountDetails = { context?: Context; accountData?: AccountDetails }
type ConnectedAccountDetails = { context: ContextConnected; accountData: AccountDetails }

export type ContextAccountDetails = UnknownAccountDetails | ConnectedAccountDetails

export function getShowHeaderSettings(
  props: ContextAccountDetails,
): props is ConnectedAccountDetails {
  const { context, accountData } = props
  return context !== undefined && context.status === 'connected' && accountData !== undefined
}

export function getBrowserName() {
  const agent = window?.navigator?.userAgent?.toLowerCase()

  if (!agent) {
    return 'n/a'
  }

  switch (true) {
    case agent.indexOf('edge') > -1:
      return 'MS Edge'
    case agent.indexOf('edg/') > -1:
      return 'Edge ( chromium based)'
    case agent.indexOf('opr') > -1 && !!(window as any).opr:
      return 'Opera'
    case agent.indexOf('chrome') > -1 && !!(window as any).chrome:
      return 'Chrome'
    case agent.indexOf('trident') > -1:
      return 'MS IE'
    case agent.indexOf('firefox') > -1:
      return 'Mozilla Firefox'
    case agent.indexOf('safari') > -1:
      return 'Safari'
    default:
      return 'other'
  }
}
