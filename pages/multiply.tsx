import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { MultiplyView } from '../features/multiply/MultiplyView'

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

export default MultiplyPage
