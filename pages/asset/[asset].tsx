import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { ProductPagesLayout } from 'components/Layouts'
import { AssetPageContent, ASSETS_PAGES, assetsPageContentBySlug } from 'content/assets'
import { aaveContext, AaveContextProvider } from 'features/aave/AaveContextProvider'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'

import { AssetView } from '../../features/asset/AssetView'
import { WithWalletAssociatedRisk } from '../../features/walletAssociatedRisk/WalletAssociatedRisk'

export const getStaticPaths: GetStaticPaths<{ asset: string }> = async () => {
  const paths = ASSETS_PAGES.map((content) => ({ params: { asset: content.slug } })) // these paths will be generated at built time

  return {
    paths,
    fallback: true,
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

function AssetPage({ content }: { content: AssetPageContent }) {
  const { replace } = useRouter()

  if (!content) {
    void replace('/404')
    return null
  }

  return (
    <AaveContextProvider>
      <DeferedContextProvider context={aaveContext}>
        <WithConnection>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <AssetView content={content} />
            </WithWalletAssociatedRisk>
          </WithTermsOfService>
        </WithConnection>
      </DeferedContextProvider>
    </AaveContextProvider>
  )
}

AssetPage.layout = ProductPagesLayout

export default AssetPage
