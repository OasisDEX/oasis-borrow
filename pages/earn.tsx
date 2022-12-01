import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { aaveContext, AaveContextProvider } from 'features/aave/AaveContextProvider'
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
    <AaveContextProvider>
      <DeferedContextProvider context={aaveContext}>
        <WithConnection>
          <EarnView />
          <Survey for="earn" />
        </WithConnection>
      </DeferedContextProvider>
    </AaveContextProvider>
  )
}

EarnPage.layout = ProductPagesLayout
EarnPage.theme = 'Landing'

export default EarnPage
