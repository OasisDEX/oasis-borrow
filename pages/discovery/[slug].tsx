import {
  discoveryPageLayout,
  discoveryPageLayoutProps,
  discoveryPageSeoTags,
} from 'features/discovery/layout'
import { discoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryPages } from 'features/discovery/types'
import { DiscoveryView } from 'features/discovery/views/DiscoveryView'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function DiscoveryPage({ kind }: { kind: DiscoveryPages }) {
  return <DiscoveryView kind={kind} />
}

DiscoveryPage.layout = discoveryPageLayout
DiscoveryPage.layoutProps = discoveryPageLayoutProps
DiscoveryPage.seoTags = discoveryPageSeoTags

export default DiscoveryPage

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = discoveryPagesMeta.map(({ kind }) => ({ params: { slug: kind } }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const meta = discoveryPagesMeta.filter((page) => page.kind === params?.slug)

  return {
    ...(meta.length === 0 && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(meta.length > 0 && { kind: meta[0].kind }),
    },
  }
}
