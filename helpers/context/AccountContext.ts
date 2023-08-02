import { createAccountData } from 'features/account/AccountData'

import { DepreciatedServices } from './types'

export function setupAccountContext() {
  const accountData$ = createAccountData(
    web3Context$,
    balance$,
    vaults$,
    hasActiveDsProxyAavePosition$,
    allNetworkReadPositionCreatedEvents$,
    ensName$,
  )
  return {
    accountData$,
  }
}

export type AccountContext = ReturnType<typeof setupAccountContext> & DepreciatedServices
