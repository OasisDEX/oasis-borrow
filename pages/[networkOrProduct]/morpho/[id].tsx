import { isSupportedNetwork, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { morphoSeoTags } from 'features/morpho/common/consts'
import { MorphoLayout, morphoPageSeoTags } from 'features/morpho/common/layout'
import { MorphoOmniProductController } from 'features/morpho/controllers/MorphoOmniProductController'
import { OmniProductController } from 'features/omni-kit/controllers/common/OmniProductController'
import { useAjnaOmniData } from 'features/omni-kit/hooks/ajna/useAjnaOmniData'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaManagePositionPageProps {
  id: string
}

function AjnaManagePositionPage({ id }: AjnaManagePositionPageProps) {
  return (
    <MorphoLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <OmniProductController<
            AjnaPositionAuction,
            AjnaUnifiedHistoryEvent[],
            AjnaGenericPosition
          >
            id={id}
            flow="manage"
            protocol={LendingProtocol.MorphoBlue}
            controller={MorphoOmniProductController}
            protocolHook={useAjnaOmniData}
            seoTags={morphoSeoTags}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </MorphoLayout>
  )
}

AjnaManagePositionPage.seoTags = morphoPageSeoTags

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
