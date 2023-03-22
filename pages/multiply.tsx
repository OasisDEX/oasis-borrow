import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { ProductPagesLayout } from 'components/Layouts'
import { MultiplyView } from 'features/multiply/MultiplyView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function MultiplyPage() {
  return (
    <WithConnection>
      <MultiplyView />
    </WithConnection>
  )
}

MultiplyPage.layout = ProductPagesLayout
MultiplyPage.theme = 'Landing'

MultiplyPage.seoTags = (
  <PageSEOTags title="seo.multiply.title" description="seo.multiply.description" url="/multiply" />
)

export default MultiplyPage
