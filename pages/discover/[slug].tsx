import { WithConnection } from 'components/connectWallet'
import { FunctionalContextProvider } from 'components/context/FunctionalContextProvider'
import {
  DiscoverPageLayout,
  discoverPageLayoutProps,
  discoverPageSeoTags,
} from 'features/discover/layout'
import { discoverPagesMeta } from 'features/discover/meta'
import { DiscoverPages } from 'features/discover/types'
import { DiscoverView } from 'features/discover/views/DiscoverView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function DiscoverPage({ kind }: { kind: DiscoverPages }) {
  return (
    <FunctionalContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <WithWalletAssociatedRisk>
            <DiscoverView kind={kind} />
          </WithWalletAssociatedRisk>
        </WithTermsOfService>
      </WithConnection>
    </FunctionalContextProvider>
  )
}

DiscoverPage.layout = DiscoverPageLayout
DiscoverPage.layoutProps = discoverPageLayoutProps
DiscoverPage.seoTags = discoverPageSeoTags

export default DiscoverPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales
      ?.map((locale) => discoverPagesMeta.map(({ kind }) => ({ params: { slug: kind }, locale })))
      .flat() || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const meta = discoverPagesMeta.filter((page) => page.kind === params?.slug)

  return {
    ...(meta.length === 0 && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(meta.length > 0 && { kind: meta[0].kind }),
    },
  }
}
