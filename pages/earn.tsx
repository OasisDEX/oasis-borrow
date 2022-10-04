import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { earnContext, EarnContextProvider } from 'features/earn/EarnContextProvider'
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
    <EarnContextProvider>
      <DeferedContextProvider context={earnContext}>
        <WithConnection>
          <EarnView />
          <Survey for="earn" />
        </WithConnection>
      </DeferedContextProvider>
    </EarnContextProvider>
  )
}

EarnPage.layout = ProductPagesLayout
EarnPage.theme = 'Landing'

export default EarnPage
