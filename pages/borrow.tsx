import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { BorrowView } from '../features/borrow/BorrowView'

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

export default BorrowPage
