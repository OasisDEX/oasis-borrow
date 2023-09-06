import { BigNumber } from 'bignumber.js'
import { Context, ContextConnected } from 'blockchain/network'
import { AccountDetails } from 'features/account/AccountData'

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
    case agent.includes('edge'):
      return 'MS Edge'
    case agent.includes('edg/'):
      return 'Edge ( chromium based)'
    case agent.includes('opr') && !!(window as any).opr:
      return 'Opera'
    case agent.includes('chrome') && !!(window as any).chrome:
      return 'Chrome'
    case agent.includes('trident'):
      return 'MS IE'
    case agent.includes('firefox'):
      return 'Mozilla Firefox'
    case agent.includes('safari'):
      return 'Safari'
    default:
      return 'other'
  }
}
