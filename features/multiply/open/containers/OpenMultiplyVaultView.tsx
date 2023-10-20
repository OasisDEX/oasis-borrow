import { trackingEvents } from 'analytics/trackingEvents'
import { NetworkHexIds } from 'blockchain/networks'
import { WithWalletConnection } from 'components/connectWallet'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { OpenMultiplyVaultContainer } from 'components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { createOpenMultiplyVaultAnalytics$ } from 'features/multiply/open/pipes/openMultiplyVaultAnalytics'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Container } from 'theme-ui'

import { OpenMultiplyVaultDetails } from './OpenMultiplyVaultDetails'
import { OpenMultiplyVaultForm } from './OpenMultiplyVaultForm'

export function OpenMultiplyVaultView({ ilk }: { ilk: string }) {
  const { openMultiplyVault$ } = useProductContext()
  const { accountData$ } = useAccountContext()
  const { context$ } = useMainContext()
  const multiplyVaultWithIlk$ = openMultiplyVault$(ilk)
  const { t } = useTranslation()

  const [openVault, openVaultError] = useObservable(openMultiplyVault$(ilk))

  useEffect(() => {
    const subscription = createOpenMultiplyVaultAnalytics$(
      accountData$,
      multiplyVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithWalletConnection chainId={NetworkHexIds.MAINNET}>
      <WithErrorHandler error={openVaultError}>
        <WithLoadingIndicator value={openVault} customLoader={<VaultContainerSpinner />}>
          {(_openVault) => (
            <Container variant="vaultPageContainer">
              <OpenMultiplyVaultContainer
                header={
                  <DefaultVaultHeader
                    {..._openVault}
                    header={t('vault.open-vault', { ilk: _openVault.ilk })}
                  />
                }
                details={<OpenMultiplyVaultDetails {..._openVault} />}
                form={<OpenMultiplyVaultForm {..._openVault} />}
                clear={_openVault.clear}
              />
            </Container>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </WithWalletConnection>
  )
}
