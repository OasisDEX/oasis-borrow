import { GetServerSidePropsContext } from 'next'
import React from 'react'

export default function DiscoveryPage() {
  return <></>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const network = context.query.network ? `?network=${context.query.network}` : ''

  return {
    redirect: {
      destination: `/discovery/high-risk-positions${network}`,
      permanent: true,
    },
  }
}
