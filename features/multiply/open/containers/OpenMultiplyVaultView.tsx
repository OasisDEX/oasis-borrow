import { useAppContext } from 'components/AppContextProvider'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Container } from 'theme-ui'

import { trackingEvents } from '../../../../analytics/analytics'
import { OpenMultiplyVaultContainer } from '../../../../components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { DefaultVaultHeader } from '../../../../components/vault/DefaultVaultHeader'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../../helpers/observableHook'
import { createOpenMultiplyVaultAnalytics$ } from '../pipes/openMultiplyVaultAnalytics'
import { OpenMultiplyVaultDetails } from './OpenMultiplyVaultDetails'
import { OpenMultiplyVaultForm } from './OpenMultiplyVaultForm'

export function OpenMultiplyVaultView({ ilk }: { ilk: string }) {
  const { openMultiplyVault$, accountData$, context$ } = useAppContext()
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
    <WithErrorHandler error={openVaultError}>
      <WithLoadingIndicator value={openVault} customLoader={<VaultContainerSpinner />}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenMultiplyVaultContainer
              header={
                <DefaultVaultHeader
                  {...openVault}
                  header={t('vault.open-vault', { ilk: openVault.ilk })}
                />
              }
              details={<OpenMultiplyVaultDetails {...openVault} />}
              form={<OpenMultiplyVaultForm {...openVault} />}
              clear={openVault.clear}
            />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
