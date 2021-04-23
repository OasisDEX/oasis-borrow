import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import {
  defaultMutableManageVaultState,
  MutableManageVaultState,
} from 'features/manageVault/manageVault'
import { ManageVaultView } from 'features/manageVault/ManageVaultView'
import {
  MOCK_VAULT_ID,
  mockManageVault$,
  MockManageVaultProps,
} from 'helpers/mocks/manageVault.mock'
import React from 'react'
import { useEffect } from 'react'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

type ManageVaultStory = { title?: string } & MockManageVaultProps

export function manageVaultStory({
  title,
  account,
  balanceInfo,
  priceInfo,
  vault,
  ilkData,
  proxyAddress,
  collateralAllowance,
  daiAllowance,
}: ManageVaultStory = {}) {
  return ({
    depositAmount,
    withdrawAmount,
    generateAmount,
    paybackAmount,
    stage,
    ...otherState
  }: Partial<MutableManageVaultState> = defaultMutableManageVaultState) => () => {
    const obs$ = mockManageVault$({
      account,
      balanceInfo,
      priceInfo,
      vault,
      ilkData,
      proxyAddress,
      collateralAllowance,
      daiAllowance,
    })

    useEffect(() => {
      const subscription = obs$
        .pipe(first())
        .subscribe(
          ({ injectStateOverride, accountIsController, priceInfo: { currentCollateralPrice } }) => {
            const newState: Partial<MutableManageVaultState> = {
              ...otherState,
              ...(stage && { stage }),
              ...(depositAmount && {
                depositAmount,
                depositAmountUSD: depositAmount.times(currentCollateralPrice),
                showDepositAndGenerateOption: stage === 'collateralEditing',
              }),
              ...(withdrawAmount && {
                withdrawAmount,
                withdrawAmountUSD: withdrawAmount.times(currentCollateralPrice),
                showPaybackAndWithdrawOption: stage === 'daiEditing' && accountIsController,
              }),
              ...(generateAmount && {
                generateAmount,
                showDepositAndGenerateOption: stage === 'collateralEditing',
              }),
              ...(paybackAmount && {
                paybackAmount,
                showPaybackAndWithdrawOption: stage === 'daiEditing' && accountIsController,
              }),
            }

            injectStateOverride(newState || {})
          },
        )
      return subscription.unsubscribe()
    }, [])

    const ctx = ({
      manageVault$: () => obs$,
    } as any) as AppContext

    return (
      <appContext.Provider value={ctx as any}>
        <ManageVaultStoryContainer title={title} />
      </appContext.Provider>
    )
  }
}

const ManageVaultStoryContainer = ({ title }: { title?: string }) => {
  if (!isAppContextAvailable()) return null
  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <ManageVaultView id={MOCK_VAULT_ID} />
      </Grid>
    </Container>
  )
}
