import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { AssetPageContent, assetsPageContentBySlug } from 'content/assets'
import { LpAssetsView } from 'features/asset/LpTokenView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const content: AssetPageContent | undefined = assetsPageContentBySlug['lp-token']
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      content: content || null,
    },
  }
}

export default function AssetPage({ content }: { content: AssetPageContent }) {
  const { replace } = useRouter()

  if (!content) {
    void replace('/404')
    return null
  }

  return (
    <WithConnection>
      <WithTermsOfService>
        <LpAssetsView content={content} />
        <BackgroundLight />
      </WithTermsOfService>
    </WithConnection>
  )
}

AssetPage.layout = AppLayout
