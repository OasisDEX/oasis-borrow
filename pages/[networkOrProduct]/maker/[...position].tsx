import type { MakerPosition } from '@oasisdex/dma-library'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { makerSeoTags } from 'features/omni-kit/protocols/maker/constants'
import type { MakerHistoryEvent } from 'features/omni-kit/protocols/maker/history/types'
import { useMakerData, useMakerTxHandler } from 'features/omni-kit/protocols/maker/hooks'
import { makerPageSeoTags, MakerWrapper } from 'features/omni-kit/protocols/maker/layout'
import { useMakerMetadata } from 'features/omni-kit/protocols/maker/metadata'
import { settings } from 'features/omni-kit/protocols/maker/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import { RefinanceGeneralContextProvider } from 'features/refinance/contexts'
import { ModalProvider } from 'helpers/modalHook'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type MakerPositionPageProps = OmniProductPage

function MakerPositionPage(props: MakerPositionPageProps) {
  return (
    <AppLayout>
      <MakerWrapper>
        <ProductContextHandler>
          <RefinanceGeneralContextProvider>
            <ModalProvider>
              <OmniProductController<MakerHistoryEvent, MakerHistoryEvent[], MakerPosition>
                {...props}
                customState={({ children }) =>
                  children({
                    useDynamicMetadata: useMakerMetadata,
                    useTxHandler: useMakerTxHandler,
                  })
                }
                protocol={LendingProtocol.Maker}
                protocolHook={useMakerData}
                seoTags={makerSeoTags}
                settings={settings}
              />
            </ModalProvider>
          </RefinanceGeneralContextProvider>
        </ProductContextHandler>
      </MakerWrapper>
    </AppLayout>
  )
}

MakerPositionPage.seoTags = makerPageSeoTags

export default MakerPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({ locale, protocol: LendingProtocol.Maker, query, settings })
}
