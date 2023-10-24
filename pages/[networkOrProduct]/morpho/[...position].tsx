import type { MorphoPosition } from '@oasisdex/dma-library'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { morphoOmniSteps, morphoSeoTags } from 'features/morpho/common/consts'
import { MorphoLayout, morphoPageSeoTags } from 'features/morpho/common/layout'
import type { MorphoPositionAuction } from 'features/morpho/common/types'
import { MorphoProductController } from 'features/morpho/controllers/MorphoProductController'
import { OmniProductController } from 'features/omni-kit/controllers'
import { useMorphoOmniData } from 'features/omni-kit/protocols/morpho-blue/hooks/useMorphoOmniData'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type MorphoPositionPageProps = OmniProductPage

function MorphoPositionPage(props: MorphoPositionPageProps) {
  return (
    <MorphoLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <OmniProductController<MorphoPositionAuction, PositionHistoryEvent[], MorphoPosition>
            {...props}
            controller={MorphoProductController}
            protocol={LendingProtocol.MorphoBlue}
            protocolHook={useMorphoOmniData}
            seoTags={morphoSeoTags}
            steps={morphoOmniSteps}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </MorphoLayout>
  )
}

MorphoPositionPage.seoTags = morphoPageSeoTags

export default MorphoPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({ locale, query })
}
