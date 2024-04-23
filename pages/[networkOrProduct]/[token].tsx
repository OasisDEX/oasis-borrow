import type { GetServerSidePropsContext } from 'next'
import React from 'react'

export default function () {
  return <></>
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const product = query?.networkOrProduct

  return {
    redirect: {
      destination: `/${product}`,
      permanent: true,
    },
  }
}
