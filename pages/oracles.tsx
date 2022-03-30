import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { MarketingLayout } from 'components/Layouts'
import { CollateralPricesView } from 'features/collateralPrices/CollateralPricesView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function OraclesPage() {
  return (
    <WithConnection>
      <CollateralPricesView />
    </WithConnection>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

OraclesPage.layout = MarketingLayout
OraclesPage.layoutProps = {
  variant: 'landingContainer',
}

export default OraclesPage
