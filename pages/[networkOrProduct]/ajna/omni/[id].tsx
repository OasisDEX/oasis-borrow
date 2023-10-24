import { isSupportedNetwork, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { ajnaSeoTags } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { omniSteps } from 'features/omni-kit/constants'
import { OmniProductController } from 'features/omni-kit/controllers'
import { AjnaOmniProductController } from 'features/omni-kit/protocols/ajna/controllers/AjnaOmniProductController'
import { useAjnaOmniData } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniData'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaManagePositionPageProps {
  id: string
  networkName: NetworkNames
}

function AjnaManagePositionPage({ id, networkName }: AjnaManagePositionPageProps) {
  return (
    <AjnaLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <OmniProductController<
            AjnaPositionAuction,
            AjnaUnifiedHistoryEvent[],
            AjnaGenericPosition
          >
            controller={AjnaOmniProductController}
            flow="manage"
            id={id}
            networkName={networkName}
            protocol={LendingProtocol.Ajna}
            protocolHook={useAjnaOmniData}
            seoTags={ajnaSeoTags}
            steps={omniSteps}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AjnaLayout>
  )
}

AjnaManagePositionPage.seoTags = ajnaPageSeoTags

export default AjnaManagePositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const networkName = query.networkOrProduct as NetworkNames
  const id = query.id as string

  if (
    isSupportedNetwork(networkName) &&
    networkName === NetworkNames.ethereumMainnet &&
    !isNaN(parseInt(id, 10))
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        id,
        networkName,
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
