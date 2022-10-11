import { discoveryPagesMeta } from 'features/discovery/meta'
import { GetServerSidePropsContext } from 'next'
import React from 'react'

export default function DiscoveryPage() {
  return <></>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const network = context.query.network ? `?network=${context.query.network}` : ''
  const defaultDiscoveryPage = discoveryPagesMeta[0] // 0 => HIGH_RISK_POSITIONS

  return {
    redirect: {
      destination: `/discovery/${defaultDiscoveryPage.kind}${network}`,
      permanent: true,
    },
  }
}
