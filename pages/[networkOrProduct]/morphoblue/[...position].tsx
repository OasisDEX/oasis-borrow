import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { morphoSeoTags } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import { useMorphoData, useMorphoTxHandler } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { morphoPageSeoTags, MorphoWrapper } from 'features/omni-kit/protocols/morpho-blue/layout'
import { useMorphoMetadata } from 'features/omni-kit/protocols/morpho-blue/metadata'
import {
  morphoBorrowishRewardTokens,
  settings,
} from 'features/omni-kit/protocols/morpho-blue/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import { RefinanceGeneralContextProvider } from 'features/refinance/contexts'
import { ModalProvider } from 'helpers/modalHook'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type MorphoPositionPageProps = OmniProductPage

function MorphoPositionPage(props: MorphoPositionPageProps) {
  return (
    <AppLayout>
      <MorphoWrapper>
        <ProductContextHandler>
          <RefinanceGeneralContextProvider>
            <ModalProvider>
              <OmniProductController<MorphoHistoryEvent, MorphoHistoryEvent[], MorphoBluePosition>
                {...props}
                customState={({ children }) =>
                  children({
                    useDynamicMetadata: useMorphoMetadata,
                    useTxHandler: useMorphoTxHandler,
                  })
                }
                extraTokens={morphoBorrowishRewardTokens[props.networkId]}
                protocol={LendingProtocol.MorphoBlue}
                protocolHook={useMorphoData}
                seoTags={morphoSeoTags}
                settings={settings}
              />
            </ModalProvider>
          </RefinanceGeneralContextProvider>
        </ProductContextHandler>
      </MorphoWrapper>
    </AppLayout>
  )
}

MorphoPositionPage.seoTags = morphoPageSeoTags

export default MorphoPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({ locale, protocol: LendingProtocol.MorphoBlue, query, settings })
}
