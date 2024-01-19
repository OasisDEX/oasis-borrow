import type { AaveContainerProps } from 'features/aave/containers/types'
import { OmniProductController } from 'features/omni-kit/controllers'
import { aaveOmniProductType } from 'features/omni-kit/protocols/aave-like/helpers/aaveOmniProductType'
import { useAaveLikeSimpleEarnData } from 'features/omni-kit/protocols/aave-like/hooks'
import { useAaveLikeSimpleEarnMetadata } from 'features/omni-kit/protocols/aave-like/hooks/useAaveLikeSimpleEarnMetadata'
import type { AaveSimpleSupplyPosition } from 'features/omni-kit/protocols/aave-like/types/AaveSimpleSupply'
import type { OmniSidebarStepsSet, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import React from 'react'

export default function OmniKitAaveContainerComponent({
  definedStrategy,
  product,
  settings,
  ...props
}: AaveContainerProps) {
  return (
    <OmniProductController<{}, PositionHistoryEvent[], AaveSimpleSupplyPosition>
      {...{
        ...props,
        collateralToken: definedStrategy.tokens.collateral,
        quoteToken: definedStrategy.tokens.debt,
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
      protocolRaw={settings?.rawName || ''}
      seoTags={{
        productKey: `seo.aaveProductPage.title-product`,
        descriptionKey: 'seo.aaveProductPage.description',
      }}
      steps={settings?.steps || ([] as unknown as OmniSidebarStepsSet)}
    />
  )
}
