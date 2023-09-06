import React from 'react'
import BigNumber from 'bignumber.js'
import { useMainContext, useProductContext } from 'components/context'
import { OpenMultiplyVaultContainer } from 'components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultForm'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { Observable } from 'rxjs'
import { Container } from 'theme-ui'

export function GuniOpenVaultView({ ilk }: { ilk: string }) {
  const { gasPrice$ } = useMainContext()
  const { openGuniVault$, daiEthTokenPrice$, yields$ } = useProductContext()
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
