import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SharedUIContext } from 'components/SharedUIProvider'
import {
  defaultMutableOpenMultiplyVaultState,
  MutableOpenMultiplyVaultState,
} from 'features/openMultiplyVault/openMultiplyVault'
import { MockOpenMultiplyVaultProps } from 'helpers/mocks/openMultiplyVault.mock'
import { AppContext } from 'next/app'
import React from 'react'
import { useEffect } from 'react'
import { EMPTY, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { GuniOpenMultiplyVaultView } from '../../features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultView'
import { mockGuniOpenMultiplyVault } from '../mocks/guniOpenMultiplyVault.mock'

type GuniOpenMultiplyVaultStory = { title?: string } & MockOpenMultiplyVaultProps

export function guniOpenMultiplyVaultStory({
  _ilks$,
  title,
  proxyAddress,
  priceInfo,
  balanceInfo,
  ilkData,
  allowance,
  ilks,
  ilk = 'GUNIV3DAIUSDC1-A',
  exchangeQuote,
}: GuniOpenMultiplyVaultStory) {
  return ({
    depositAmount,
    ...otherState
  }: Partial<MutableOpenMultiplyVaultState> = defaultMutableOpenMultiplyVaultState) => () => {
    const obs$ = mockGuniOpenMultiplyVault({
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

    const openGuniVault$ = () => obs$
    const ctx = ({
      openGuniVault$,
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
          <GuniOpenMultiplyVaultStoryContainer ilk={'GUNIV3DAIUSDC1-A'} title={title} />
        </SharedUIContext.Provider>
      </appContext.Provider>
    )
  }
}

const GuniOpenMultiplyVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <GuniOpenMultiplyVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
