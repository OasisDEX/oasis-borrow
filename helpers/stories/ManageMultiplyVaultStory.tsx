import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SharedUIContext } from 'components/SharedUIProvider'
import {
  createGeneralManageVault$,
  VaultType,
} from 'features/generalManageVault/generalManageVault'
import { GeneralManageVaultView } from 'features/generalManageVault/GeneralManageVaultView'
import {
  defaultMutableManageMultiplyVaultState,
  MutableManageMultiplyVaultState,
} from 'features/manageMultiplyVault/manageMultiplyVault'
import {
  MOCK_VAULT_ID,
  mockManageMultiplyVault$,
  MockManageMultiplyVaultProps,
} from 'helpers/mocks/manageMultiplyVault.mock'
import { memoize } from 'lodash'
import React from 'react'
import { useEffect } from 'react'
import { EMPTY, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

type ManageMultiplyVaultStory = { title?: string } & MockManageMultiplyVaultProps

export function manageMultiplyVaultStory({
  title,
  account,
  balanceInfo,
  priceInfo,
  vault,
  ilkData,
  proxyAddress,
  collateralAllowance,
  daiAllowance,
}: ManageMultiplyVaultStory = {}) {
  return ({
    depositAmount,
    withdrawAmount,
    generateAmount,
    paybackAmount,
    stage = 'adjustPosition',
    ...otherState
  }: Partial<MutableManageMultiplyVaultState> = defaultMutableManageMultiplyVaultState) => () => {
    const obs$ = mockManageMultiplyVault$({
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
        .subscribe(({ injectStateOverride, priceInfo: { currentCollateralPrice } }) => {
          const newState: Partial<MutableManageMultiplyVaultState> = {
            ...otherState,
            ...(stage && { stage }),
            ...(depositAmount && {
              depositAmount,
              depositAmountUSD: depositAmount.times(currentCollateralPrice),
            }),
            ...(withdrawAmount && {
              withdrawAmount,
              withdrawAmountUSD: withdrawAmount.times(currentCollateralPrice),
            }),
            ...(generateAmount && {
              generateAmount,
            }),
            ...(paybackAmount && {
              paybackAmount,
            }),
            // showDepositAndGenerateOption:
            //   (stage === 'daiEditing' && !!depositAmount) ||
            //   (stage === 'collateralEditing' && !!generateAmount),
            // showPaybackAndWithdrawOption:
            //   accountIsController &&
            //   ((stage === 'daiEditing' && !!withdrawAmount) ||
            //     (stage === 'collateralEditing' && !!paybackAmount)),
          }

          injectStateOverride(newState || {})
        })

      return subscription.unsubscribe()
    }, [])

    const ctx = ({
      vaultHistory$: memoize(() => of([])),
      context$: of({ etherscan: 'url' }),
      generalManageVault$: memoize(() =>
        createGeneralManageVault$(
          () => obs$,
          // @ts-ignore, don't need to mock regular here
          () => of(EMPTY),
          () => of(VaultType.Multiply),
          MOCK_VAULT_ID,
        ),
      ),
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
          <ManageMultiplyVaultStoryContainer title={title} />
        </SharedUIContext.Provider>
      </appContext.Provider>
    )
  }
}

const ManageMultiplyVaultStoryContainer = ({ title }: { title?: string }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <GeneralManageVaultView id={MOCK_VAULT_ID} />
      </Grid>
    </Container>
  )
}
