import { WithConnection } from 'components/connectWallet'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { discoverPageSeoTags } from 'features/discover/layout'
import { discoverPagesMeta } from 'features/discover/meta'
import type { DiscoverPages } from 'features/discover/types'
import { DiscoverView } from 'features/discover/views/DiscoverView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function DiscoverPage({ kind }: { kind: DiscoverPages }) {
  return (
    <AppLayout>
      <FunctionalContextHandler>
        <WithConnection>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <DiscoverView kind={kind} />
            </WithWalletAssociatedRisk>
          </WithTermsOfService>
        </WithConnection>
      </FunctionalContextHandler>
    </AppLayout>
  )
}

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
