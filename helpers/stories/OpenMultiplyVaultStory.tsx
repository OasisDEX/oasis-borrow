import { isProductContextAvailable, productContext } from 'components/context'
import { SharedUIContext } from 'components/SharedUIProvider'
import { OpenMultiplyVaultView } from 'features/multiply/open/containers/OpenMultiplyVaultView'
import {
  defaultMutableOpenMultiplyVaultState,
  MutableOpenMultiplyVaultState,
} from 'features/multiply/open/pipes/openMultiplyVault'
import { ProductContext } from 'helpers/context/ProductContext'
import {
  mockOpenMultiplyVault,
  MockOpenMultiplyVaultProps,
} from 'helpers/mocks/openMultiplyVault.mock'
import React, { useEffect } from 'react'
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
    }: Partial<MutableOpenMultiplyVaultState> = defaultMutableOpenMultiplyVaultState) =>
    () => {
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
      const ctx = {
        openMultiplyVault$,
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
            <OpenMultiplyVaultStoryContainer ilk={'WBTC-A'} title={title} />
          </SharedUIContext.Provider>
        </productContext.Provider>
      )
    }
}

const OpenMultiplyVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isProductContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <OpenMultiplyVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
