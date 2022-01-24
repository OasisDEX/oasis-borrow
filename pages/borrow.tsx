import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { BorrowView } from '../features/borrow/BorrowView'
import { useFeatureToggle } from '../helpers/useFeatureToggle'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function BorrowPage() {
  const assetLandingPagesEnabled = useFeatureToggle('AssetLandingPages')
  if (!assetLandingPagesEnabled) {
    const router = useRouter()
    if (typeof window !== 'undefined') {
      void router.push('/')
    }
  }
  const view = assetLandingPagesEnabled ? <BorrowView /> : null

  return <WithConnection>{view}</WithConnection>
}

BorrowPage.layout = ProductPagesLayout
BorrowPage.theme = 'Landing'
