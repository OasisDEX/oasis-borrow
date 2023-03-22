import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { PageSEOTags } from 'components/HeadTags'
import { ProductPagesLayout } from 'components/Layouts'
import { AssetPageContent, ASSETS_PAGES, assetsPageContentBySlug } from 'content/assets'
import { aaveContext, AaveContextProvider } from 'features/aave/AaveContextProvider'
import { AssetView } from 'features/asset/AssetView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'

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

function AssetPage({ content, asset }: { content: AssetPageContent; asset: string }) {
  const { replace } = useRouter()
  const { t } = useTranslation()

  if (!content) {
    void replace('/not-found')
    return null
  }

  return (
    <AaveContextProvider>
      <DeferedContextProvider context={aaveContext}>
        <WithConnection>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <PageSEOTags
                title="seo.title-single-token"
                titleParams={{
                  product: t('seo.assets.title'),
                  token: asset.toLocaleUpperCase(),
                }}
                description="seo.assets.description"
                url={`/asset/${asset}`}
              />
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
