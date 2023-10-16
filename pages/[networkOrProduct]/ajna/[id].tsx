import { isSupportedNetwork, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProductsController } from 'features/ajna/positions/common/controls/AjnaProductsController'
import { ProtocolProductController } from 'features/ajna/positions/common/controls/ProtocolProductController'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaManagePositionPageProps {
  id: string
}

function AjnaManagePositionPage({ id }: AjnaManagePositionPageProps) {
  return (
    <AjnaLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <ProtocolProductController
            id={id}
            flow="manage"
            protocol={LendingProtocol.Ajna}
            controller={AjnaProductsController}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AjnaLayout>
  )
}

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
