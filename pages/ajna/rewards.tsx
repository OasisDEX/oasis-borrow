import { WithConnection } from 'components/connectWallet'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaRewardsController } from 'features/ajna/rewards/controls'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaRewardsPage() {
  return (
    <AjnaLayout>
      <FunctionalContextHandler>
        <WithConnection>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <AjnaRewardsController />
            </WithWalletAssociatedRisk>
          </WithTermsOfService>
        </WithConnection>
      </FunctionalContextHandler>
    </AjnaLayout>
  )
}

AjnaRewardsPage.seoTags = ajnaPageSeoTags

export default AjnaRewardsPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
