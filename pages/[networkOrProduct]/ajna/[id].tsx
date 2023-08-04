import { isSupportedNetwork, NetworkNames } from 'blockchain/networks'
import { PositionContextProvider } from 'components/context/PositionContextProvider'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProductController } from 'features/ajna/positions/common/controls/AjnaProductController'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaManagePositionPageProps {
  id: string
}

function AjnaManagePositionPage({ id }: AjnaManagePositionPageProps) {
  return (
    <PositionContextProvider>
      <AjnaProductController id={id} flow="manage" />
    </PositionContextProvider>
  )
}

AjnaManagePositionPage.layout = AjnaLayout
AjnaManagePositionPage.seoTags = ajnaPageSeoTags

export default AjnaManagePositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const network = query.networkOrProduct as string
  const id = query.id as string

  if (
    isSupportedNetwork(network) &&
    network === NetworkNames.ethereumMainnet &&
    !isNaN(parseInt(id, 10))
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        id,
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
