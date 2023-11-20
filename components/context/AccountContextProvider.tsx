import type BigNumber from 'bignumber.js'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { cdpRegistryCdps, cdpRegistryOwns } from 'blockchain/calls/cdpRegistry'
import type { DogIlk } from 'blockchain/calls/dog'
import { dogIlk } from 'blockchain/calls/dog'
import { tokenBalance } from 'blockchain/calls/erc20'
import type { TokenBalanceArgs } from 'blockchain/calls/erc20.types'
import type { GetCdpsArgs, GetCdpsResult } from 'blockchain/calls/getCdps'
import { getCdps } from 'blockchain/calls/getCdps'
import { createIlkToToken$ } from 'blockchain/calls/ilkToToken'
import type { JugIlk } from 'blockchain/calls/jug'
import { jugIlk } from 'blockchain/calls/jug'
import { observe } from 'blockchain/calls/observe'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import { createProxyAddress$, createProxyOwner$ } from 'blockchain/calls/proxy'
import type { SpotIlk } from 'blockchain/calls/spot'
import { spotIlk } from 'blockchain/calls/spot'
import type { Urn, VatIlk } from 'blockchain/calls/vat'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createVaultResolver$ } from 'blockchain/calls/vaultResolver'
import { resolveENSName$ } from 'blockchain/ens'
import { createIlkData$ } from 'blockchain/ilks'
import type { IlkData } from 'blockchain/ilks.types'
import { createOraclePriceData$ } from 'blockchain/prices'
import type { OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices.types'
import { createBalance$ } from 'blockchain/tokens'
import { createStandardCdps$, createVault$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import { hasActiveAavePositionOnDsProxy$ } from 'features/aave/helpers'
import { createProxyConsumed$ } from 'features/aave/services'
import type { AccountDetails } from 'features/account/AccountData'
import { createAccountData } from 'features/account/AccountData'
import { checkReferralLocalStorage$ } from 'features/referralOverview/referralLocal'
import { createUserReferral$ } from 'features/referralOverview/user'
import type { UserReferralState } from 'features/referralOverview/user.types'
import {
  getReferralRewardsFromApi$,
  getReferralsFromApi$,
  getUserFromApi$,
} from 'features/referralOverview/userApi'
import { createUserSettings$ } from 'features/userSettings/userSettings'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import {
  checkUserSettingsLocalStorage$,
  saveUserSettingsLocalStorage$,
} from 'features/userSettings/userSettingsLocal'
import { bigNumberTostring } from 'helpers/bigNumberToString'
import type { DepreciatedServices } from 'helpers/context/types'
import { ilkUrnAddressToString } from 'helpers/ilkUrnAddressToString'
import { memoize } from 'lodash'
import type { PropsWithChildren } from 'react'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'
import type { Observable } from 'rxjs'

import { useMainContext } from './MainContextProvider'
import curry from 'ramda/src/curry'

export const accountContext = React.createContext<AccountContext | undefined>(undefined)

export function isAccountContextAvailable(): boolean {
  return !!checkContext(accountContext)
}

export function useAccountContext(): AccountContext {
  const ac = useContext(accountContext)
  if (!ac) {
    throw new Error("AccountContext not available! useAccountContext can't be used serverside")
  }
  return ac
}

export function AccountContextProvider({ children }: PropsWithChildren<{}>) {
  const [context, setContext] = useState<AccountContext | undefined>(undefined)
  const {
    context$,
    web3Context$,
    onEveryBlock$,
    once$,
    chainContext$,
    oracleContext$,
    connectedContext$,
    txHelpers$,
  } = useMainContext()

  useEffect(() => {
    setContext(() => {
      console.info('Account context setup')
      const ensName$ = memoize(curry(resolveENSName$)(context$), (address) => address)
      const proxyAddress$ = memoize(curry(createProxyAddress$)(onEveryBlock$, context$))
      const proxyOwner$ = memoize(curry(createProxyOwner$)(onEveryBlock$, context$))
      const proxyConsumed$ = memoize(curry(createProxyConsumed$)(context$))
      const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)

      const balance$ = memoize(
        curry(createBalance$)(onEveryBlock$, chainContext$, tokenBalance$),
        (token, address) => `${token}_${address}`,
      )

      const pipZzz$ = observe(onEveryBlock$, chainContext$, pipZzz)
      const pipHop$ = observe(onEveryBlock$, context$, pipHop)
      const pipPeek$ = observe(onEveryBlock$, oracleContext$, pipPeek)
      const pipPeep$ = observe(onEveryBlock$, oracleContext$, pipPeep)

      const oraclePriceData$ = memoize(
        curry(createOraclePriceData$)(chainContext$, pipPeek$, pipPeep$, pipZzz$, pipHop$),
        ({ token, requestedData }) => {
          return `${token}-${requestedData.join(',')}`
        },
      )

      const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumberTostring)
      const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumberTostring)
      const cdpManagerOwner$ = observe(
        onEveryBlock$,
        chainContext$,
        cdpManagerOwner,
        bigNumberTostring,
      )
      const cdpRegistryOwns$ = observe(onEveryBlock$, chainContext$, cdpRegistryOwns)
      const cdpRegistryCdps$ = observe(onEveryBlock$, chainContext$, cdpRegistryCdps)
      const vatUrns$ = observe(onEveryBlock$, chainContext$, vatUrns, ilkUrnAddressToString)
      const vatGem$ = observe(onEveryBlock$, chainContext$, vatGem, ilkUrnAddressToString)
      const vatIlks$ = observe(onEveryBlock$, chainContext$, vatIlk)
      const spotIlks$ = observe(onEveryBlock$, chainContext$, spotIlk)
      const jugIlks$ = observe(onEveryBlock$, chainContext$, jugIlk)
      const dogIlks$ = observe(onEveryBlock$, chainContext$, dogIlk)

      const ilkToToken$ = memoize(curry(createIlkToToken$)(chainContext$))

      const ilkData$ = memoize(
        curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, dogIlks$, ilkToToken$),
      )

      const getCdps$ = observe(onEveryBlock$, context$, getCdps)

      const urnResolver$ = curry(createVaultResolver$)(
        cdpManagerIlks$,
        cdpManagerUrns$,
        cdpManagerOwner$,
        proxyOwner$,
      )

      const standardCdps$ = memoize(curry(createStandardCdps$)(proxyAddress$, getCdps$))
      const vault$ = memoize(
        (id: BigNumber) =>
          createVault$(
            urnResolver$,
            vatUrns$,
            vatGem$,
            ilkData$,
            oraclePriceData$,
            ilkToToken$,
            chainContext$,
            id,
          ),
        bigNumberTostring,
      )
      const hasActiveDsProxyAavePosition$ = hasActiveAavePositionOnDsProxy$(
        connectedContext$,
        proxyAddress$,
        proxyConsumed$,
      )
      const accountData$ = createAccountData(web3Context$, balance$, ensName$)

      const userSettings$ = createUserSettings$(
        checkUserSettingsLocalStorage$,
        saveUserSettingsLocalStorage$,
      )

      const userReferral$ = createUserReferral$(
        web3Context$,
        txHelpers$,
        getUserFromApi$,
        getReferralsFromApi$,
        getReferralRewardsFromApi$,
        checkReferralLocalStorage$,
      )

      return {
        accountData$,
        balance$,
        cdpManagerIlks$,
        cdpManagerOwner$,
        cdpManagerUrns$,
        cdpRegistryCdps$,
        cdpRegistryOwns$,
        dogIlks$,
        ensName$,
        getCdps$,
        hasActiveDsProxyAavePosition$,
        ilkData$,
        ilkToToken$,
        jugIlks$,
        oraclePriceData$,
        pipHop$,
        pipPeek$,
        pipPeep$,
        pipZzz$,
        proxyAddress$,
        proxyConsumed$,
        proxyOwner$,
        spotIlks$,
        standardCdps$,
        tokenBalance$,
        urnResolver$,
        userReferral$,
        userSettings$,
        vatGem$,
        vatIlks$,
        vatUrns$,
        vault$,
      }
    })
  }, [
    chainContext$,
    connectedContext$,
    context$,
    onEveryBlock$,
    once$,
    oracleContext$,
    txHelpers$,
    web3Context$,
  ])

  return <accountContext.Provider value={context}>{children}</accountContext.Provider>
}

export type AccountContext = {
  accountData$: Observable<AccountDetails>
  balance$: (token: string, address: string) => Observable<BigNumber>
  cdpManagerIlks$: (args: BigNumber) => Observable<string>
  cdpManagerOwner$: (args: BigNumber) => Observable<string>
  cdpManagerUrns$: (args: BigNumber) => Observable<string>
  cdpRegistryCdps$: (args: { ilk: string; usr: string }) => Observable<BigNumber | null>
  cdpRegistryOwns$: (args: BigNumber) => Observable<string>
  dogIlks$: (args: string) => Observable<DogIlk>
  ensName$: (address: string) => Observable<string | void | null>
  getCdps$: (args: GetCdpsArgs) => Observable<GetCdpsResult>
  hasActiveDsProxyAavePosition$: Observable<boolean>
  ilkData$: (ilk: string) => Observable<IlkData>
  ilkToToken$: (ilk: string) => Observable<string>
  jugIlks$: (args: string) => Observable<JugIlk>
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>
  pipHop$: (args: string) => Observable<BigNumber>
  pipPeek$: (args: string) => Observable<[string, boolean]>
  pipPeep$: (args: string) => Observable<[string, boolean]>
  pipZzz$: (args: string) => Observable<BigNumber>
  proxyAddress$: (address: string) => Observable<string>
  proxyConsumed$: (address: string) => Observable<boolean>
  proxyOwner$: (address: string) => Observable<string>
  spotIlks$: (args: string) => Observable<SpotIlk>
  standardCdps$: (address: string) => Observable<BigNumber[]>
  tokenBalance$: (args: TokenBalanceArgs) => Observable<BigNumber>
  userReferral$: Observable<UserReferralState>
  userSettings$: Observable<UserSettingsState>
  vatGem$: (args: { ilk: string; urnAddress: string }) => Observable<BigNumber>
  vatIlks$: (args: string) => Observable<VatIlk>
  vatUrns$: (args: { ilk: string; urnAddress: string }) => Observable<Urn>
  vault$: (id: BigNumber) => Observable<Vault>
} & DepreciatedServices
