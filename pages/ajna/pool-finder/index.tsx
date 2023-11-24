import { POOL_FINDER_DEFAULT_PRODUCT } from 'features/ajna/pool-finder/constants'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'

export default function () {
  return <></>
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: `${INTERNAL_LINKS.ajnaPoolFinder}/${POOL_FINDER_DEFAULT_PRODUCT}`,
      permanent: true,
    },
  }
}
