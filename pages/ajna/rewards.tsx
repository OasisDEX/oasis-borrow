import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'

function AjnaRewardsPage() {
  return <></>
}

export default AjnaRewardsPage

export async function getServerSideProps() {
  return {
    redirect: {
      permanent: true,
      destination: `${INTERNAL_LINKS.appUrl}/${INTERNAL_LINKS.ajnaRewards}`,
    },
  }
}
