import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { AutomationContextProvider } from 'components/AutomationContextProvider'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { PropsWithChildren, useMemo } from 'react'

interface GeneralManageControlProps {
  generalManageVault: GeneralManageVaultState
  context: Context
}

export function ContextLayerControl({
  children,
  generalManageVault,
  context,
}: PropsWithChildren<GeneralManageControlProps>) {
  const { tokenPriceUSD$ } = useAppContext()
  const { vault } = generalManageVault.state

  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['ETH', vault.token]), [vault.token])
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)

  return (
    <WithErrorHandler error={[ethAndTokenPricesError]}>
      <WithLoadingIndicator
        value={[ethAndTokenPricesData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([ethAndTokenPrices]) => (
          <AutomationContextProvider
            generalManageVault={generalManageVault}
            context={context}
            ethAndTokenPricesData={ethAndTokenPrices}
          >
            {children}
          </AutomationContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
