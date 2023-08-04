import { WithConnection } from 'components/connectWallet'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import { AjnaRewardsController } from 'features/ajna/common/controls/AjnaRewardsController'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaRewardsPage() {
  return (
    <FunctionalContextHandler>
      <WithConnection>
        <WithTermsOfService>
          <WithWalletAssociatedRisk>
            <AjnaWrapper>
              <AjnaRewardsController />
            </AjnaWrapper>
          </WithWalletAssociatedRisk>
        </WithTermsOfService>
      </WithConnection>
    </FunctionalContextHandler>
  )
}

AjnaRewardsPage.layout = AjnaLayout
AjnaRewardsPage.seoTags = ajnaPageSeoTags

export default AjnaRewardsPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
