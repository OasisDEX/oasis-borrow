import BigNumber from 'bignumber.js'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { cdpRegistryCdps, cdpRegistryOwns } from 'blockchain/calls/cdpRegistry'
import { charterUrnProxy } from 'blockchain/calls/charter'
import { cropperUrnProxy } from 'blockchain/calls/cropper'
import { DogIlk, dogIlk } from 'blockchain/calls/dog'
import { tokenBalance, TokenBalanceArgs } from 'blockchain/calls/erc20'
import { getCdps, GetCdpsArgs, GetCdpsResult } from 'blockchain/calls/getCdps'
import { createIlkToToken$ } from 'blockchain/calls/ilkToToken'
import { JugIlk, jugIlk } from 'blockchain/calls/jug'
import { observe } from 'blockchain/calls/observe'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import { createProxyAddress$, createProxyOwner$ } from 'blockchain/calls/proxy'
import { SpotIlk, spotIlk } from 'blockchain/calls/spot'
import { Urn, vatGem, VatIlk, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createVaultResolver$, VaultResolve } from 'blockchain/calls/vaultResolver'
import { resolveENSName$ } from 'blockchain/ens'
import { createGetRegistryCdps$ } from 'blockchain/getRegistryCdps'
import { createIlkData$, IlkData } from 'blockchain/ilks'
import { NetworkIds } from 'blockchain/networks'
import { createOraclePriceData$, OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices'
import { createBalance$ } from 'blockchain/tokens'
import { charterIlks, cropJoinIlks } from 'blockchain/tokens/mainnet'
import { getUserDpmProxies$, UserDpmAccount } from 'blockchain/userDpmProxies'
import {
  createStandardCdps$,
  createVault$,
  createVaults$,
  Vault,
  VaultWithType,
} from 'blockchain/vaults'
import { hasActiveAavePositionOnDsProxy$ } from 'features/aave/helpers'
import {
  createProxyConsumed$,
  createReadPositionCreatedEvents$,
  PositionCreated,
} from 'features/aave/services'
import { AccountDetails, createAccountData } from 'features/account/AccountData'
import { checkReferralLocalStorage$ } from 'features/referralOverview/referralLocal'
import { createUserReferral$, UserReferralState } from 'features/referralOverview/user'
import {
  getReferralRewardsFromApi$,
  getReferralsFromApi$,
  getUserFromApi$,
} from 'features/referralOverview/userApi'
import { createUserSettings$, UserSettingsState } from 'features/userSettings/userSettings'
import {
  checkUserSettingsLocalStorage$,
  saveUserSettingsLocalStorage$,
} from 'features/userSettings/userSettingsLocal'
import { bigNumberTostring } from 'helpers/bigNumberToString'
import { DepreciatedServices } from 'helpers/context/types'
import { ilkUrnAddressToString } from 'helpers/ilkUrnAddressToString'
import { WithChildren } from 'helpers/types'
import { memoize } from 'lodash'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

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

export function AccountContextProvider({ children }: WithChildren) {
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
      console.log('Account context setup')
      const ensName$ = memoize(curry(resolveENSName$)(context$), (address) => address)
      const proxyAddress$ = memoize(curry(createProxyAddress$)(onEveryBlock$, context$))
      const proxyOwner$ = memoize(curry(createProxyOwner$)(onEveryBlock$, context$))
      const proxyConsumed$ = memoize(curry(createProxyConsumed$)(context$))
      const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)

      const mainnetDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]> = memoize(
        curry(getUserDpmProxies$)(of({ chainId: NetworkIds.MAINNET })),
        (walletAddress) => walletAddress,
      )

      const mainnetReadPositionCreatedEvents$ = memoize(
        curry(createReadPositionCreatedEvents$)(
          of({ chainId: NetworkIds.MAINNET }),
          mainnetDpmProxies$,
        ),
      )

      const optimismDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]> = memoize(
        curry(getUserDpmProxies$)(of({ chainId: NetworkIds.OPTIMISMMAINNET })),
        (walletAddress) => walletAddress,
      )

      const optimismReadPositionCreatedEvents$ = memoize(
        curry(createReadPositionCreatedEvents$)(
          of({ chainId: NetworkIds.OPTIMISMMAINNET }),
          optimismDpmProxies$,
        ),
      )

      // Here we're aggregating events from all networks to show all open positions
      // Should add new networks here in the future to count all positions
      const allNetworkReadPositionCreatedEvents$ = (wallet: string) =>
        combineLatest([
          mainnetReadPositionCreatedEvents$(wallet),
          optimismReadPositionCreatedEvents$(wallet),
        ]).pipe(
          map(([mainnetEvents, optimismEvents]) => {
            return [...mainnetEvents, ...optimismEvents]
          }),
        )

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
      const charterUrnProxy$ = observe(onEveryBlock$, context$, charterUrnProxy)
      const cropperUrnProxy$ = observe(onEveryBlock$, context$, cropperUrnProxy)
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
        charterUrnProxy$,
        cropperUrnProxy$,
        cdpRegistryOwns$,
        cdpManagerOwner$,
        proxyOwner$,
      )
      const charterCdps$ = memoize(
        curry(createGetRegistryCdps$)(
          onEveryBlock$,
          chainContext$,
          cdpRegistryCdps$,
          proxyAddress$,
          charterIlks,
        ),
      )
      const cropJoinCdps$ = memoize(
        curry(createGetRegistryCdps$)(
          onEveryBlock$,
          chainContext$,
          cdpRegistryCdps$,
          proxyAddress$,
          cropJoinIlks,
        ),
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
      const vaults$ = memoize(
        curry(createVaults$)(onEveryBlock$, vault$, chainContext$, [
          charterCdps$,
          cropJoinCdps$,
          standardCdps$,
        ]),
      )
      const hasActiveDsProxyAavePosition$ = hasActiveAavePositionOnDsProxy$(
        connectedContext$,
        proxyAddress$,
        proxyConsumed$,
      )
      const accountData$ = createAccountData(
        web3Context$,
        balance$,
        vaults$,
        hasActiveDsProxyAavePosition$,
        allNetworkReadPositionCreatedEvents$,
        ensName$,
      )

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
        allNetworkReadPositionCreatedEvents$,
        balance$,
        cdpManagerIlks$,
        cdpManagerOwner$,
        cdpManagerUrns$,
        cdpRegistryCdps$,
        cdpRegistryOwns$,
        charterCdps$,
        charterUrnProxy$,
        cropJoinCdps$,
        cropperUrnProxy$,
        dogIlks$,
        ensName$,
        getCdps$,
        hasActiveDsProxyAavePosition$,
        ilkData$,
        ilkToToken$,
        jugIlks$,
        mainnetReadPositionCreatedEvents$,
        optimismReadPositionCreatedEvents$,
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
        vaults$,
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
  allNetworkReadPositionCreatedEvents$: (walletAddress: string) => Observable<PositionCreated[]>
  balance$: (token: string, address: string) => Observable<BigNumber>
  cdpManagerIlks$: (args: BigNumber) => Observable<string>
  cdpManagerOwner$: (args: BigNumber) => Observable<string>
  cdpManagerUrns$: (args: BigNumber) => Observable<string>
  cdpRegistryCdps$: (args: { ilk: string; usr: string }) => Observable<BigNumber | null>
  cdpRegistryOwns$: (args: BigNumber) => Observable<string>
  charterCdps$: (address: string) => Observable<BigNumber[]>
  charterUrnProxy$: (args: string) => Observable<string>
  cropJoinCdps$: (address: string) => Observable<BigNumber[]>
  cropperUrnProxy$: (args: string) => Observable<string>
  dogIlks$: (args: string) => Observable<DogIlk>
  ensName$: (address: string) => Observable<string | void | null>
  getCdps$: (args: GetCdpsArgs) => Observable<GetCdpsResult>
  hasActiveDsProxyAavePosition$: Observable<boolean>
  ilkData$: (ilk: string) => Observable<IlkData>
  ilkToToken$: (ilk: string) => Observable<string>
  jugIlks$: (args: string) => Observable<JugIlk>
  mainnetReadPositionCreatedEvents$: (walletAddress: string) => Observable<PositionCreated[]>
  optimismReadPositionCreatedEvents$: (walletAddress: string) => Observable<PositionCreated[]>
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
  urnResolver$: (cdpId: BigNumber) => Observable<VaultResolve>
  userReferral$: Observable<UserReferralState>
  userSettings$: Observable<UserSettingsState>
  vatGem$: (args: { ilk: string; urnAddress: string }) => Observable<BigNumber>
  vatIlks$: (args: string) => Observable<VatIlk>
  vatUrns$: (args: { ilk: string; urnAddress: string }) => Observable<Urn>
  vault$: (id: BigNumber) => Observable<Vault>
  vaults$: (address: string) => Observable<VaultWithType>
} & DepreciatedServices
