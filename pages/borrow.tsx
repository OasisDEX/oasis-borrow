import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { ProductPagesLayout } from 'components/Layouts'
import { BorrowView } from 'features/borrow/BorrowView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function BorrowPage() {
  return (
    <WithConnection>
      <BorrowView />
    </WithConnection>
  )
}

BorrowPage.layout = ProductPagesLayout
BorrowPage.theme = 'Landing'
BorrowPage.seoTags = (
  <PageSEOTags title="seo.borrow.title" description="seo.borrow.description" url="/borrow" />
)

export default BorrowPage
