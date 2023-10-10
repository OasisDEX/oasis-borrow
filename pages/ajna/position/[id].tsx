import type { GetServerSidePropsContext } from 'next'
import React from 'react'

function AjnaManagePositionPageRedirect() {
  return <></>
}

export default AjnaManagePositionPageRedirect

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const id = query.id as string

  if (!isNaN(parseInt(id, 10))) {
    return {
      redirect: {
        destination: `/ethereum/ajna/${id}`,
        permanent: true,
      },
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: '/not-found',
    },
  }
}
