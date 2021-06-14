import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { OpenVaultView } from 'features/openVault/components/OpenVaultView'
import { defaultMutableOpenVaultState, MutableOpenVaultState } from 'features/openVault/openVault'
import { mockOpenVault$, MockOpenVaultProps } from 'helpers/mocks/openVault.mock'
import { AppContext } from 'next/app'
import React from 'react'
import { useEffect } from 'react'
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
  }: Partial<MutableOpenVaultState> = defaultMutableOpenVaultState) => () => {
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
