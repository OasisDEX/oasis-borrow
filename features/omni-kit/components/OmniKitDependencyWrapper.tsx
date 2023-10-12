import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import type { FC } from 'react'
import React from 'react'

export const OmniKitDependencyWrapper: FC = ({ children }) => {
  return (
    <AppLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <WithConnection>
            <WithTermsOfService>
              <WithWalletAssociatedRisk>{children}</WithWalletAssociatedRisk>
            </WithTermsOfService>
          </WithConnection>
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}
