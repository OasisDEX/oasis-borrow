import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { MultiplyView } from '../features/multiply/MultiplyView'
import { useFeatureToggle } from '../helpers/useFeatureToggle'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function MultiplyPage() {
  const enabled = useFeatureToggle('MultiplyAndBorrowPage')
  const view = enabled ? <MultiplyView /> : null

  return <WithConnection>{view}</WithConnection>
}

MultiplyPage.layout = ProductPagesLayout
MultiplyPage.theme = 'Landing'
