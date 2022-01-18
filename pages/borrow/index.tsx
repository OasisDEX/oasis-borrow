import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithConnection } from '../../components/connectWallet/ConnectWallet'
import { LandingPageLayout } from '../../components/Layouts'
import { BorrowView } from '../../features/borrow/BorrowView'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function BorrowPage() {
  const enabled = useFeatureToggle('MultiplyAndBorrowPage')
  const view = enabled ? <BorrowView /> : null

  return <WithConnection>{view}</WithConnection>
}

BorrowPage.layout = LandingPageLayout
BorrowPage.theme = 'Landing'
