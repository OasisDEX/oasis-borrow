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
  const { openGuniVault$, gasPrice$, daiEthTokenPrice$, yields$ } = useAppContext()
  const [openVault, openVaultError] = useObservable(openGuniVault$(ilk))
  const [yields, yieldsError] = useObservable(yields$(ilk))
  const [gasPrice, gasPriceError] = useObservable(gasPrice$)
  const [daiEthTokenPrice, daiEthTokenPriceError] = useObservable(
    daiEthTokenPrice$ as Observable<{ ETH: BigNumber; DAI: BigNumber }>,
  )

  return (
    <WithErrorHandler error={[openVaultError, gasPriceError, daiEthTokenPriceError, yieldsError]}>
      <WithLoadingIndicator
        value={[openVault, gasPrice, daiEthTokenPrice, yields]}
        customLoader={<VaultContainerSpinner />}
      >
        {([openVault, gasPrice, daiEthTokenPrice, yields]) => (
          <Container variant="vaultPageContainer">
            <OpenMultiplyVaultContainer
              header={<GuniVaultHeader token={openVault.token} ilk={openVault.ilk} />}
              details={
                <GuniOpenMultiplyVaultDetails
                  {...openVault}
                  {...gasPrice}
                  {...daiEthTokenPrice}
                  {...yields}
                />
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
