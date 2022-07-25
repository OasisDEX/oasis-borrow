import { AccountDetails } from '../features/account/AccountData'

export function isFirstCdp(accountData?: AccountDetails) {
  return accountData?.numberOfVaults ? accountData.numberOfVaults === 0 : undefined
}
