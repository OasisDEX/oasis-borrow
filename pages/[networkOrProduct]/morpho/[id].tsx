import type { MorphoPosition } from '@oasisdex/dma-library'
import { isSupportedNetwork, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { morphoSeoTags } from 'features/morpho/common/consts'
import { MorphoLayout, morphoPageSeoTags } from 'features/morpho/common/layout'
import type { MorphoPositionAuction } from 'features/morpho/common/types'
import { MorphoOmniProductController } from 'features/morpho/controllers/MorphoOmniProductController'
import { OmniProductController } from 'features/omni-kit/controllers/common/OmniProductController'
import { useMorphoOmniData } from 'features/omni-kit/hooks/morpho/useMorphoOmniData'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface MorphoManagePositionPageProps {
  id: string
}

function MorphoManagePositionPage({ id }: MorphoManagePositionPageProps) {
  return (
    <MorphoLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <OmniProductController<MorphoPositionAuction, PositionHistoryEvent[], MorphoPosition>
            id={id}
            flow="manage"
            protocol={LendingProtocol.MorphoBlue}
            controller={MorphoOmniProductController}
            protocolHook={useMorphoOmniData}
            seoTags={morphoSeoTags}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </MorphoLayout>
  )
}

MorphoManagePositionPage.seoTags = morphoPageSeoTags

export default MorphoManagePositionPage

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
