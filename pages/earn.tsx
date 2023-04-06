import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { PageSEOTags } from 'components/HeadTags'
import { ProductPagesLayout } from 'components/Layouts'
import { aaveContext, AaveContextProvider } from 'features/aave/AaveContextProvider'
import { EarnView } from 'features/earn/EarnView'
import { Survey } from 'features/survey'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function EarnPage() {
  return (
    <AaveContextProvider>
      <DeferedContextProvider context={aaveContext}>
        <WithConnection>
          <EarnView />
          <Survey for="earn" />
        </WithConnection>
      </DeferedContextProvider>
    </AaveContextProvider>
  )
}

EarnPage.layout = ProductPagesLayout
EarnPage.theme = 'Landing'

EarnPage.seoTags = (
  <PageSEOTags title="seo.earn.title" description="seo.earn.description" url="/earn" />
)

export default EarnPage
