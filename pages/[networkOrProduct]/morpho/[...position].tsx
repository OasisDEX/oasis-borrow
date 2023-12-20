import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { morphoOmniSteps, morphoSeoTags } from 'features/omni-kit/protocols/morpho-blue/constants'
import { useMorphoData } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { morphoPageSeoTags, MorphoWrapper } from 'features/omni-kit/protocols/morpho-blue/layout'
import { useMorphoMetadata } from 'features/omni-kit/protocols/morpho-blue/metadata'
import type { MorphoPositionAuction } from 'features/omni-kit/protocols/morpho-blue/types'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type MorphoPositionPageProps = OmniProductPage

function MorphoPositionPage(props: MorphoPositionPageProps) {
  return (
    <AppLayout>
      <MorphoWrapper>
        <ProductContextHandler>
          <OmniProductController<MorphoPositionAuction, PositionHistoryEvent[], MorphoBluePosition>
            {...props}
            customState={({ children }) =>
              children({
                useDynamicMetadata: useMorphoMetadata,
                useTxHandler: () => () => {},
              })
            }
            protocol={LendingProtocol.MorphoBlue}
            protocolHook={useMorphoData}
            protocolRaw={LendingProtocol.MorphoBlue}
            seoTags={morphoSeoTags}
            steps={morphoOmniSteps}
          />
        </ProductContextHandler>
      </MorphoWrapper>
    </AppLayout>
  )
}

MorphoPositionPage.seoTags = morphoPageSeoTags

export default MorphoPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({ locale, query })
}
