import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { LandingPageLayout } from '../components/Layouts'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function Multiply() {
  return <>hello from multiply page</>
}

Multiply.layout = LandingPageLayout
Multiply.theme = 'Landing'
