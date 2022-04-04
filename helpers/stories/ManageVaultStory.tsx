import BigNumber from 'bignumber.js'
import { AppContext } from 'components/AppContext'
import { appContext, isAppContextAvailable } from 'components/AppContextProvider'
import { SharedUIContext } from 'components/SharedUIProvider'
import {
  defaultMutableManageVaultState,
  MutableManageVaultState,
} from 'features/borrow/manage/pipes/manageVault'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import {
  MOCK_VAULT_ID,
  mockManageVault$,
  MockManageVaultProps,
} from 'helpers/mocks/manageVault.mock'
import { memoize } from 'lodash'
import React, { useEffect } from 'react'
import { EMPTY, from, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'

import { GeneralManageControl } from '../../components/vault/GeneralManageControl'

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
    stage = 'collateralEditing',
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
              showDepositAndGenerateOption:
                (stage === 'daiEditing' && !!depositAmount) ||
                (stage === 'collateralEditing' && !!generateAmount),
              showPaybackAndWithdrawOption:
                accountIsController &&
                ((stage === 'daiEditing' && !!withdrawAmount) ||
                  (stage === 'collateralEditing' && !!paybackAmount)),
            }

            injectStateOverride(newState || {})
          },
        )

      return subscription.unsubscribe()
    }, [])

    const ctx = ({
      vaultHistory$: memoize(() => of([])),
      context$: of({ etherscan: 'url' }),
      generalManageVault$: memoize(() =>
        createGeneralManageVault$(
          () => from([]),
          // @ts-ignore, don't need to mock Multiply here
          () => of(EMPTY),
          () => of(EMPTY),
          () => obs$,
          () => of(VaultType.Borrow),
          () => of(EMPTY),
          MOCK_VAULT_ID,
        ),
      ),
      manageVault$: () => obs$,
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
          <ManageVaultStoryContainer title={title} vaultId={vault?.id || MOCK_VAULT_ID} />
        </SharedUIContext.Provider>
      </appContext.Provider>
    )
  }
}

const ManageVaultStoryContainer = ({ title, vaultId }: { title?: string; vaultId: BigNumber }) => {
  if (!isAppContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <Grid>
        {title && <Card>{title}</Card>}
        <GeneralManageControl id={vaultId} />
      </Grid>
    </Container>
  )
}
