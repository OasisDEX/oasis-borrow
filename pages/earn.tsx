import { Survey } from 'features/survey'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { EarnView } from '../features/earn/EarnView'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function EarnPage() {
  return (
    <WithConnection>
      <EarnView />
      <Survey for="earn" />
    </WithConnection>
  )
}

EarnPage.layout = ProductPagesLayout
EarnPage.theme = 'Landing'

export default EarnPage
