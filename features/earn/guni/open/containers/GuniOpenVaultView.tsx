import { useAppContext } from 'components/AppContextProvider'
import { Survey } from 'features/survey'
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
  const { openGuniVault$ } = useAppContext()
  const [openVault, openVaultError] = useObservable(openGuniVault$(ilk))

  return (
    <WithErrorHandler error={openVaultError}>
      <WithLoadingIndicator value={openVault} customLoader={<VaultContainerSpinner />}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenMultiplyVaultContainer
              header={<GuniVaultHeader {...openVault} />}
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
