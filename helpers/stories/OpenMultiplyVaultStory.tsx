import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SharedUIContext } from 'components/SharedUIProvider'
import { OpenMultiplyVaultView } from 'features/openMultiplyVault/components/OpenMultiplyVaultView'
import { defaultMutableOpenVaultState, MutableOpenVaultState } from 'features/openVault/openVault'
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
  title,

  priceInfo,
  balanceInfo,
  ilkData,
  allowance,
  ilks,
}: // ilk = 'WBTC-A',
OpenMultiplyVaultStory) {
  return ({
    depositAmount,
    generateAmount,
    ...otherState
  }: Partial<MutableOpenVaultState> = defaultMutableOpenVaultState) => () => {
    const obs$ = mockOpenMultiplyVault({
      balanceInfo,
      priceInfo,
      ilkData,
      allowance,
      ilks,
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

    const openMultiplyVault$ = () => obs$
    const ctx = ({
      multiplyVault$: openMultiplyVault$,
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
