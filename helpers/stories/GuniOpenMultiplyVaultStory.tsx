import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SharedUIContext } from 'components/SharedUIProvider'
import {
  defaultMutableOpenMultiplyVaultState,
  MutableOpenMultiplyVaultState,
} from 'features/multiply/open/pipes/openMultiplyVault'
import { MockOpenMultiplyVaultProps } from 'helpers/mocks/openMultiplyVault.mock'
import { AppContext } from 'next/app'
import React from 'react'
import { useEffect } from 'react'
import { EMPTY, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { GuniOpenVaultView } from '../../features/earn/guni/open/containers/GuniOpenVaultView'
import { mockGuniOpenEarnVault } from '../mocks/guniOpenEarnVault.mock'

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
    const obs$ = mockGuniOpenEarnVault({
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
      const subscription = obs$.pipe(first()).subscribe(({ injectStateOverride }) => {
        const newState = {
          ...otherState,
          ...(depositAmount && {
            depositAmount,
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
        <GuniOpenVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
