import { ajnaPageSeoTags } from 'features/ajna/common/layout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

function AjnaPositionPage() {
  return <></>
}

AjnaPositionPage.seoTags = ajnaPageSeoTags

export default AjnaPositionPage

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const [product, pool, id = null] = query.position as string[]
  const positionId = id ? `/${id}` : ''

  // for now we can assume that all existing ajna product under this route should be redirected
  // when Ajna v2 is available on DPM level, redirect needs to happen during positions loading
  return {
    redirect: {
      permanent: true,
      destination: `${EXTERNAL_LINKS.AJNA.OLD}/ethereum/ajna/${product}/${pool}${positionId}`,
    },
  }
}
