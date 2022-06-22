import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'

import { WithConnection } from '../components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from '../components/Layouts'
import { EarnView } from '../features/earn/EarnView'
import { useFeatureToggle } from '../helpers/useFeatureToggle'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function EarnPage() {
  const enabled = useFeatureToggle('EarnProduct')

  if (!enabled) {
    const router = useRouter()
    if (typeof window !== 'undefined') {
      void router.push('/')
    }
  }

  const view = enabled ? <EarnView /> : null

  return <WithConnection>{view}</WithConnection>
}

EarnPage.layout = ProductPagesLayout
EarnPage.theme = 'Landing'

export default EarnPage
