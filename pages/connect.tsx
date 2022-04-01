import { ConnectWallet } from 'components/connectWallet/ConnectWallet'
import { ConnectPageLayout } from 'components/Layouts'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function ConnectPage() {
  return <ConnectWallet />
}

ConnectPage.layout = ConnectPageLayout

export default ConnectPage
