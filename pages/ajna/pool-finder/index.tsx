import React from 'react'
import { POOL_FINDER_DEFAULT_PRODUCT } from 'features/poolFinder/consts'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'

export default function () {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: `${INTERNAL_LINKS.ajnaPoolFinder}/${POOL_FINDER_DEFAULT_PRODUCT}`,
      permanent: true,
    },
  }
}
