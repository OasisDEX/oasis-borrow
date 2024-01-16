import type { IPosition } from '@oasisdex/dma-library'
import type { AaveContainerProps } from 'features/aave/containers/types'
import { OmniProductController } from 'features/omni-kit/controllers'
import { aaveOmniProductType } from 'features/omni-kit/protocols/aave-like/helpers/aaveOmniProductType'
import { useAaveLikeSimpleEarnData } from 'features/omni-kit/protocols/aave-like/hooks'
import { useAaveLikeSimpleEarnMetadata } from 'features/omni-kit/protocols/aave-like/hooks/useAaveLikeSimpleEarnMetadata'
import { omniKitAaveSettings } from 'features/omni-kit/protocols/aave-like/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import React from 'react'

export default function OmniKitAaveContainerComponent({
  definedStrategy,
  product,
  ...props
}: AaveContainerProps) {
  return (
    <OmniProductController<{}, PositionHistoryEvent[], IPosition>
      {...{
        ...props,
        networkId: definedStrategy.networkId as OmniSupportedNetworkIds,
        protocol: definedStrategy.protocol,
        productType: aaveOmniProductType(product),
      }}
      customState={({ children }) =>
        children({
          useDynamicMetadata: useAaveLikeSimpleEarnMetadata,
          useTxHandler: () => () => {},
        })
      }
      singleToken
      protocolHook={useAaveLikeSimpleEarnData({ strategy: definedStrategy })}
      protocolRaw={omniKitAaveSettings.rawName}
      seoTags={{
        productKey: `seo.morphoProductPage.title`,
        descriptionKey: 'seo.morpho.description',
      }}
      steps={omniKitAaveSettings.steps}
    />
  )
}
