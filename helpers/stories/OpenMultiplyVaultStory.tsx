import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SharedUIContext } from 'components/SharedUIProvider'
import { OpenMultiplyVaultView } from 'features/multiply/open/containers/OpenMultiplyVaultView'
import {
  defaultMutableOpenMultiplyVaultState,
  MutableOpenMultiplyVaultState,
} from 'features/multiply/open/pipes/openMultiplyVault'
import {
  mockOpenMultiplyVault,
  MockOpenMultiplyVaultProps,
} from 'helpers/mocks/openMultiplyVault.mock'
import { AppContext } from 'next/app'
import React from 'react'
import { useEffect } from 'react'
import { EMPTY, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

type OpenMultiplyVaultStory = { title?: string } & MockOpenMultiplyVaultProps

export function openMultiplyVaultStory({
  _ilks$,

  title,
  proxyAddress,
  priceInfo,
  balanceInfo,
  ilkData,
  allowance,
  ilks,
  ilk = 'ETH-A',
  exchangeQuote,
}: OpenMultiplyVaultStory) {
  return ({
    depositAmount,
    ...otherState
  }: Partial<MutableOpenMultiplyVaultState> = defaultMutableOpenMultiplyVaultState) => () => {
    const obs$ = mockOpenMultiplyVault({
      _ilks$,
      balanceInfo,
      priceInfo,
      ilkData,
      proxyAddress,
      allowance,
      ilks,
      ilk,
      exchangeQuote,
    })

    useEffect(() => {
      const subscription = obs$
        .pipe(first())
        .subscribe(({ injectStateOverride, priceInfo: { currentCollateralPrice } }) => {
          const newState = {
            ...otherState,
            ...(depositAmount && {
              depositAmount,
              depositAmountUSD: depositAmount.times(currentCollateralPrice),
            }),
          }
          injectStateOverride(newState || {})
        })
      return subscription.unsubscribe()
    }, [])

    const openMultiplyVault$ = () => obs$
    const ctx = ({
      openMultiplyVault$,
      accountData$: of(EMPTY),
    } as any) as AppContext

    return (
      <appContext.Provider value={ctx as any}>
        <SharedUIContext.Provider
          value={{
            vaultFormOpened: true,
            setVaultFormOpened: () => null,
            setVaultFormToggleTitle: () => null,
          }}
        >
          <OpenMultiplyVaultStoryContainer ilk={'WBTC-A'} title={title} />
        </SharedUIContext.Provider>
      </appContext.Provider>
    )
  }
}

const OpenMultiplyVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <OpenMultiplyVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
