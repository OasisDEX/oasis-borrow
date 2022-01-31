import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { ProductPagesLayout } from 'components/Layouts'
import { AssetPageContent, assetsPageContentBySlug } from 'content/assets'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'

import { AssetView } from '../../features/asset/AssetView'

export const getStaticPaths: GetStaticPaths<{ asset: string }> = async () => {
  return {
    paths: [
      { params: { asset: 'eth' } },
      { params: { asset: 'btc' } },
      { params: { asset: 'lp-token' } },
      { params: { asset: 'yfi' } },
      { params: { asset: 'uni' } },
    ], // these paths will be generated at built time
    fallback: 'blocking',
  }
}

export async function getStaticProps(
  ctx: GetServerSidePropsContext & { params: { asset: string } },
) {
  const content: AssetPageContent | undefined =
    assetsPageContentBySlug[ctx.params.asset.toString().toLocaleLowerCase()]

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      asset: ctx.params.asset || null,
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
      </WithTermsOfService>
    </WithConnection>
  )
}

AssetPage.layout = ProductPagesLayout
