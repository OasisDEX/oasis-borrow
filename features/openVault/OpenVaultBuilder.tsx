import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { buildIlkData$, BuildIlkDataProps, IlkData } from 'blockchain/ilks'
import { Context, protoContextConnected } from 'blockchain/network'
import { AppContext, ilkToToken$, protoTxHelpers } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { BalanceInfo, buildBalanceInfo$, BuildBalanceInfoProps } from 'features/shared/balanceInfo'
import { buildPriceInfo$, BuildPriceInfoProps, PriceInfo } from 'features/shared/priceInfo'
import React from 'react'
import { useEffect } from 'react'
import { Observable, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { createOpenVault$, OpenVaultState } from './openVault'
import { OpenVaultView } from './OpenVaultView'

interface BuildOpenVaultProps {
  _context$?: Observable<Context>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _allowance$?: Observable<BigNumber>
  _ilks$?: Observable<string[]>

  ilkData?: BuildIlkDataProps
  priceInfo?: BuildPriceInfoProps
  balanceInfo?: BuildBalanceInfoProps
  proxyAddress?: string
  allowance?: BigNumber
  account?: string
  status?: 'connected'
  ilks?: string[]
  ilk?: string
}

export function buildOpenVault$({
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _allowance$,
  _ilks$,
  ilkData,
  priceInfo,
  balanceInfo,
  proxyAddress,
  allowance = maxUint256,
  account = '0xVaultController',
  ilks,
  ilk = 'WBTC-A',
}: BuildOpenVaultProps = {}) {
  const token = ilk.split('-')[0]

  const context$ = of({
    ...protoContextConnected,
    account,
  })
  const txHelpers$ = of(protoTxHelpers)

  const priceInfo$ = () => _priceInfo$ || buildPriceInfo$({ ...priceInfo, token })
  const ilkData$ = () =>
    _ilkData$ ||
    buildIlkData$({
      ilk,
      _priceInfo$: priceInfo$(),
      ...ilkData,
    })

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

  const balanceInfo$ = () =>
    _balanceInfo$ || buildBalanceInfo$({ ...balanceInfo, address: account })

  const proxyAddress$ = () => _proxyAddress$ || of(proxyAddress)
  const allowance$ = () => _allowance$ || of(allowance)

  return createOpenVault$(
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    ilkToToken$,
    ilk,
  )
}

type SharedOpenVaultState = Partial<
  Omit<OpenVaultState, Extract<keyof OpenVaultState, keyof BuildOpenVaultProps>>
>
type OpenVaultStory = { title?: string } & BuildOpenVaultProps & SharedOpenVaultState

export function openVaultStory({
  _ilks$,
  title,
  proxyAddress,
  priceInfo,
  balanceInfo,
  ilkData,
  allowance,
  stage,
  depositAmount,
  generateAmount,
  ilks,
  ilk = 'WBTC-A',
  ...otherState
}: OpenVaultStory) {
  return () => {
    const obs$ = buildOpenVault$({
      _ilks$,
      balanceInfo,
      priceInfo,
      ilkData,
      proxyAddress,
      allowance,
      ilks,
      ilk,
    })

    useEffect(() => {
      const subscription = obs$
        .pipe(first())
        .subscribe(({ injectStateOverride, priceInfo: { currentCollateralPrice } }) => {
          const newState: Partial<OpenVaultState> = {
            ...otherState,
            ...(stage && { stage }),
            ...(depositAmount && {
              depositAmount,
              depositAmountUSD: depositAmount.times(currentCollateralPrice),
            }),
            ...(generateAmount && {
              generateAmount,
              showGenerateOption: !generateAmount.isZero(),
            }),
          }
          injectStateOverride(newState || {})
        })
      return subscription.unsubscribe()
    }, [])

    const openVault$ = () => obs$
    const ctx = ({
      openVault$,
    } as any) as AppContext

    return (
      <appContext.Provider value={ctx as any}>
        <OpenVaultStoryContainer ilk={ilk} title={title} />
      </appContext.Provider>
    )
  }
}

const OpenVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <OpenVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
