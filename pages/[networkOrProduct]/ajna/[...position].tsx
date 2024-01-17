import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { isAddress } from 'ethers/lib/utils'
import { ajnaSeoTags } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { useAjnaData } from 'features/omni-kit/protocols/ajna/hooks/useAjnaData'
import type { AjnaPositionAuction } from 'features/omni-kit/protocols/ajna/observables'
import { settings } from 'features/omni-kit/protocols/ajna/settings'
import { AjnaCustomStateProvider } from 'features/omni-kit/protocols/ajna/state/AjnaCustomStateProvider'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'
import { FeaturesEnum } from 'types/config'

type AjnaPositionPageProps = OmniProductPage

function AjnaPositionPage(props: AjnaPositionPageProps) {
  const { collateralToken, networkId, positionId, productType, quoteToken } = props
  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken, networkId })
  )

  const positionUrl = `/base/ajna/${productType}/${collateralToken}-${quoteToken}${
    positionId ? `$/{positionId}` : ''
  }`

  return (
    <WithFeatureToggleRedirect
      feature={FeaturesEnum.AjnaBase}
      redirectUrl={`${EXTERNAL_LINKS.AJNA.OLD}${positionUrl}`}
      requireFalse
      shouldRedirect={networkId === NetworkIds.BASEMAINNET}
    >
      <AjnaLayout>
        <ProductContextHandler>
          <OmniProductController<
            AjnaPositionAuction,
            AjnaUnifiedHistoryEvent[],
            AjnaGenericPosition
          >
            {...props}
            customState={AjnaCustomStateProvider}
            isOracless={isOracless}
            protocol={LendingProtocol.Ajna}
            protocolHook={useAjnaData}
            protocolRaw={settings.rawName[props.networkId] as string}
            seoTags={ajnaSeoTags}
            steps={settings.steps}
          />
        </ProductContextHandler>
      </AjnaLayout>
    </WithFeatureToggleRedirect>
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
      })

      return (
        supportedPools.includes(`${collateralToken}-${quoteToken}`) ||
        (isAddress(collateralToken) && isAddress(quoteToken))
      )
    },
    locale,
    protocol: LendingProtocol.Ajna,
    query,
  })
}
