import { discoverPagesMeta } from 'features/discover/meta'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

export default function DiscoverPage() {
  return <></>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const network = context.query.network ? `?network=${context.query.network}` : ''
  const defaultDiscoverPage = discoverPagesMeta[0] // 0 => HIGH_RISK_POSITIONS

  return {
    redirect: {
      destination: `${INTERNAL_LINKS.discover}/${defaultDiscoverPage.kind}${network}`,
      permanent: true,
    },
  }
}
