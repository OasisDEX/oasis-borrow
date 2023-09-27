import { isProductContextAvailable, productContext } from 'components/context'
import { SharedUIContext } from 'components/SharedUIProvider'
import { GuniOpenVaultView } from 'features/earn/guni/open/containers/GuniOpenVaultView'
import { defaultMutableOpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault.constants'
import type { MutableOpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault.types'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import { mockGuniOpenEarnVault } from 'helpers/mocks/guniOpenEarnVault.mock'
import type { MockOpenMultiplyVaultProps } from 'helpers/mocks/openMultiplyVault.mock'
import React, { useEffect } from 'react'
import { EMPTY, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

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
    }: Partial<MutableOpenMultiplyVaultState> = defaultMutableOpenMultiplyVaultState) =>
    () => {
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
      const ctx = {
        openGuniVault$,
        accountData$: of(EMPTY),
      } as any as ProductContext

      return (
        <productContext.Provider value={ctx as any}>
          <SharedUIContext.Provider
            value={{
              vaultFormOpened: true,
              setVaultFormOpened: () => null,
              setVaultFormToggleTitle: () => null,
            }}
          >
            <GuniOpenMultiplyVaultStoryContainer ilk={'GUNIV3DAIUSDC1-A'} title={title} />
          </SharedUIContext.Provider>
        </productContext.Provider>
      )
    }
}

const GuniOpenMultiplyVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isProductContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <GuniOpenVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
