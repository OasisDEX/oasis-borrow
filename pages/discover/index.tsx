import { DISCOVER_URL } from 'features/discover/helpers'
import { discoverPagesMeta } from 'features/discover/meta'
import { GetServerSidePropsContext } from 'next'
import React from 'react'

export default function DiscoverPage() {
  return <></>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const network = context.query.network ? `?network=${context.query.network}` : ''
  const defaultDiscoverPage = discoverPagesMeta[0] // 0 => HIGH_RISK_POSITIONS

  return {
    redirect: {
      destination: `${DISCOVER_URL}/${defaultDiscoverPage.kind}${network}`,
      permanent: true,
    },
  }
}
