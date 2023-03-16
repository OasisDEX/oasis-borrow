import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { BorrowPositionVM, MultiplyPositionVM } from 'components/dumb/PositionList'
import { AccountDetails } from 'features/account/AccountData'
import { Web3Context } from 'features/web3Context'

export function isNullish(amount: BigNumber | undefined | null): boolean {
  return !amount || amount.isZero()
}

/**
 * Utility to check if vault has been liquidated on the front end.
 * @param position
 * @returns boolean
 */
export function checkIfVaultEmptyAndProtectionActive(
  position: BorrowPositionVM | MultiplyPositionVM,
) {
  return (
    position.collateralLocked &&
    Number(position.collateralLocked.replace(/[^0-9]+/g, '')) === 0.0 &&
    position.protectionAmount &&
    Number(position.protectionAmount.replace(/[^0-9]+/g, '')) > 0
  )
}

export function getShouldHideHeaderSettings(
  context?: Context,
  accountData?: AccountDetails,
  web3Context?: Web3Context,
) {
  return (
    !context ||
    context.status === 'connectedReadonly' ||
    !accountData ||
    web3Context?.status !== 'connected'
  )
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
