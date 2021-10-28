import { MarketingLayout } from 'components/Layouts'
import { AllAssetsView } from 'features/assets/AllAssetsView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export default function AllAssetsPage() {
  return (
    <>
      <BackgroundLight />
      <AllAssetsView />
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

AllAssetsPage.layout = MarketingLayout
