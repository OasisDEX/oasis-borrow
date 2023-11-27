import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { morphoOmniSteps, morphoSeoTags } from 'features/omni-kit/protocols/morpho-blue/constants'
import { useMorphoOmniData } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { MorphoOmniCustomStateProvider } from 'features/omni-kit/protocols/morpho-blue/state'
import type { MorphoPositionAuction } from 'features/omni-kit/protocols/morpho-blue/types'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import type { FC } from 'react'
import React from 'react'
import { FeaturesEnum } from 'types/config'

const MorphoWrapper: FC = ({ children }) => {
  return (
    <WithFeatureToggleRedirect feature={FeaturesEnum.MorphoBlue}>
      {children}
    </WithFeatureToggleRedirect>
  )
}

type MorphoPositionPageProps = OmniProductPage

function MorphoPositionPage(props: MorphoPositionPageProps) {
  return (
    <AppLayout>
      <MorphoWrapper>
        <ProductContextHandler>
          <GasEstimationContextProvider>
            <OmniProductController<
              MorphoPositionAuction,
              PositionHistoryEvent[],
              MorphoBluePosition
            >
              {...props}
              customState={MorphoOmniCustomStateProvider}
              protocol={LendingProtocol.MorphoBlue}
              protocolHook={useMorphoOmniData}
              seoTags={morphoSeoTags}
              steps={morphoOmniSteps}
            />
          </GasEstimationContextProvider>
        </ProductContextHandler>
      </MorphoWrapper>
    </AppLayout>
  )
}

MorphoPositionPage.seoTags = (
  <PageSEOTags title="seo.morpho.title" description="seo.morpho.description" url="/" />
)

export default MorphoPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({ locale, query })
}
