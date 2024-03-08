import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { isAddress } from 'ethers/lib/utils'
import { ajnaSeoTags } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import { useAjnaData } from 'features/omni-kit/protocols/ajna/hooks/useAjnaData'
import type { AjnaPositionAuction } from 'features/omni-kit/protocols/ajna/observables'
import { settings } from 'features/omni-kit/protocols/ajna/settings'
import { AjnaCustomStateProvider } from 'features/omni-kit/protocols/ajna/state/AjnaCustomStateProvider'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type AjnaPositionPageProps = OmniProductPage

function AjnaPositionPage(props: AjnaPositionPageProps) {
  const { collateralToken, networkId, quoteToken } = props
  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken, networkId })
  )

  return (
    <AjnaLayout>
      <ProductContextHandler>
        <OmniProductController<AjnaPositionAuction, AjnaHistoryEvent[], AjnaGenericPosition>
          {...props}
          customState={AjnaCustomStateProvider}
          isOracless={isOracless}
          protocol={LendingProtocol.Ajna}
          protocolHook={useAjnaData}
          seoTags={ajnaSeoTags}
          settings={settings}
        />
      </ProductContextHandler>
    </AjnaLayout>
  )
}

AjnaPositionPage.seoTags = ajnaPageSeoTags

export default AjnaPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({
    isProductPageValid: ({ collateralToken, quoteToken }) => {
      const supportedPools = Object.keys({
        ...getNetworkContracts(NetworkIds.MAINNET).ajnaPoolPairs,
        ...getNetworkContracts(NetworkIds.GOERLI).ajnaPoolPairs,
        ...getNetworkContracts(NetworkIds.BASEMAINNET).ajnaPoolPairs,
        ...getNetworkContracts(NetworkIds.ARBITRUMMAINNET).ajnaPoolPairs,
        ...getNetworkContracts(NetworkIds.OPTIMISMMAINNET).ajnaPoolPairs,
      })

      return (
        supportedPools.includes(`${collateralToken}-${quoteToken}`) ||
        (isAddress(collateralToken) && isAddress(quoteToken))
      )
    },
    locale,
    protocol: LendingProtocol.Ajna,
    query,
    settings,
  })
}
