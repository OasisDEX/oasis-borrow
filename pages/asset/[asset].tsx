import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { AssetPageContent, assetsPageContentBySlug } from 'content/assets'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { AssetView } from '../../features/asset/AssetView'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const content: AssetPageContent | undefined =
    assetsPageContentBySlug[ctx.query.asset.toString().toLocaleLowerCase()]
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      asset: ctx.query.asset || null,
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
        <AssetView content={content} />
        <BackgroundLight />
      </WithTermsOfService>
    </WithConnection>
  )
}

AssetPage.layout = AppLayout
