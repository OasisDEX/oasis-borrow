import { isProductContextAvailable, productContext } from 'components/context'
import { SharedUIContext } from 'components/SharedUIProvider'
import { OpenVaultView } from 'features/borrow/open/containers/OpenVaultView'
import {
  defaultMutableOpenVaultState,
  MutableOpenVaultState,
} from 'features/borrow/open/pipes/openVault'
import { ProductContext } from 'helpers/context/ProductContext'
import { mockOpenVault$, MockOpenVaultProps } from 'helpers/mocks/openVault.mock'
import React, { useEffect } from 'react'
import { EMPTY, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

type OpenVaultStory = { title?: string } & MockOpenVaultProps

export function openVaultStory({
  _ilks$,
  title,
  proxyAddress,
  priceInfo,
  balanceInfo,
  ilkData,
  allowance,
  ilks,
  ilk = 'WBTC-A',
}: OpenVaultStory) {
  return ({
      depositAmount,
      generateAmount,
      ...otherState
    }: Partial<MutableOpenVaultState> = defaultMutableOpenVaultState) =>
    () => {
      const obs$ = mockOpenVault$({
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
            const newState = {
              ...otherState,
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
      const ctx = {
        openVault$,
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
            <OpenVaultStoryContainer ilk={ilk} title={title} />
          </SharedUIContext.Provider>
        </productContext.Provider>
      )
    }
}

const OpenVaultStoryContainer = ({ title, ilk }: { title?: string; ilk: string }) => {
  if (!isProductContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <OpenVaultView ilk={ilk} />
      </Grid>
    </Container>
  )
}
