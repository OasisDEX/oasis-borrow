import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { guniFaq } from 'features/content/faqs/guni'
import { Survey } from 'features/survey'
import React from 'react'
import { Observable } from 'rxjs'
import { Container } from 'theme-ui'

import { OpenMultiplyVaultContainer } from '../../../../../components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../../../helpers/observableHook'
import { GuniVaultHeader } from '../../common/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from './GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from './GuniOpenMultiplyVaultForm'

export function GuniOpenVaultView({ ilk }: { ilk: string }) {
  const { openGuniVault$, gasPrice$, daiEthTokenPrice$ } = useAppContext()
  const [openVault, openVaultError] = useObservable(openGuniVault$(ilk))
  const [gasPrice, gasPriceError] = useObservable(gasPrice$)
  const [daiEthTokenPrice, daiEthTokenPriceError] = useObservable(
    daiEthTokenPrice$ as Observable<{ ETH: BigNumber; DAI: BigNumber }>,
  )

  return (
    <WithErrorHandler error={[openVaultError, gasPriceError, daiEthTokenPriceError]}>
      <WithLoadingIndicator
        value={[openVault, gasPrice, daiEthTokenPrice]}
        customLoader={<VaultContainerSpinner />}
      >
        {([openVault, gasPrice, daiEthTokenPrice]) => (
          <Container variant="vaultPageContainer">
            <OpenMultiplyVaultContainer
              header={<GuniVaultHeader {...openVault} />}
              details={
                <GuniOpenMultiplyVaultDetails {...openVault} {...gasPrice} {...daiEthTokenPrice} />
              }
              form={<GuniOpenMultiplyVaultForm {...openVault} />}
              faq={guniFaq}
              clear={openVault.clear}
            />
            <Survey for="earn" />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
