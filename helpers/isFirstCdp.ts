import type { AccountDetails } from 'features/account/AccountData'

export function isFirstCdp(accountData?: AccountDetails) {
  return accountData?.amountOfPositions ? accountData.amountOfPositions === 0 : undefined
}
