import { useAppContext } from 'components/AppContextProvider'
import { Survey } from 'features/survey'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Container } from 'theme-ui'

import { OpenMultiplyVaultContainer } from '../../../../../components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../../../helpers/observableHook'
import { GuniVaultHeader } from '../../common/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from './GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from './GuniOpenMultiplyVaultForm'

export function GuniOpenVaultView({ ilk }: { ilk: string }) {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { openGuniVault$, accountData$, context$ } = useAppContext()
  // const multiplyVaultWithIlk$ = openGuniVault$(ilk)

  const [openVault, openVaultError] = useObservable(openGuniVault$(ilk))

  // useEffect(() => {
  //   const subscription = createOpenMultiplyVaultAnalytics$(
  //     accountData$,
  //     multiplyVaultWithIlk$,
  //     context$,
  //     trackingEvents,
  //   ).subscribe()
  //
  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return (
    <WithErrorHandler error={openVaultError}>
      <WithLoadingIndicator value={openVault} customLoader={<VaultContainerSpinner />}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenMultiplyVaultContainer
              header={
                <GuniVaultHeader
                  {...openVault}
                  header={t('vault.open-vault', { ilk: openVault.ilk })}
                />
              }
              details={<GuniOpenMultiplyVaultDetails {...openVault} />}
              form={<GuniOpenMultiplyVaultForm {...openVault} />}
              clear={openVault.clear}
            />
            <Survey for="earn" />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
