import { getNetworkContracts } from 'blockchain/contracts'
import { getNetworkByName, NetworkIds } from 'blockchain/networks'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { isAddress } from 'ethers/lib/utils'
import { ajnaSeoTags } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { AJNA_RAW_PROTOCOL_NAME, ajnaOmniSteps } from 'features/omni-kit/protocols/ajna/constants'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { useAjnaData } from 'features/omni-kit/protocols/ajna/hooks/useAjnaData'
import type { AjnaPositionAuction } from 'features/omni-kit/protocols/ajna/observables'
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
  const { collateralToken, networkName, positionId, productType, quoteToken } = props
  const networkId = getNetworkByName(networkName).id
  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken, networkId })
  )

  const positionUrl = `/ethereum/ajna/${productType}/${collateralToken}-${quoteToken}${
    positionId ? `$/{positionId}` : ''
  }`

  return (
    <WithFeatureToggleRedirect
      feature={FeaturesEnum.AjnaSafetySwitch}
      redirectUrl={`${EXTERNAL_LINKS.AJNA.OLD}${positionUrl}`}
      requireFalse
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
            protocolRaw={AJNA_RAW_PROTOCOL_NAME}
            seoTags={ajnaSeoTags}
            steps={ajnaOmniSteps}
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
    query,
  })
}
