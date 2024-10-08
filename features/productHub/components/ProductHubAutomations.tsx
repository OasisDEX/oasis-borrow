import { AutomationFeature } from '@prisma/client'
import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import type { OmniProductType } from 'features/omni-kit/types'
import { intersectionWith } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { auto_buy, auto_sell, stop_loss, take_profit } from 'theme/icons'
import { Flex } from 'theme-ui'

interface ProductHubAutomationsProps {
  automationFeatures: AutomationFeature[]
  product: OmniProductType
}

const automationGroups = [
  {
    features: [AutomationFeature.stopLoss, AutomationFeature.trailingStopLoss],
    icon: stop_loss,
    productSpecific: [],
  },
  {
    features: [AutomationFeature.autoBuy],
    icon: auto_buy,
    productSpecific: [],
  },
  {
    features: [AutomationFeature.autoSell],
    icon: auto_sell,
    productSpecific: [],
  },
  {
    features: [AutomationFeature.autoTakeProfit, AutomationFeature.partialTakeProfit],
    icon: take_profit,
    productSpecific: [],
  },
]

export const ProductHubAutomations: FC<ProductHubAutomationsProps> = ({
  automationFeatures = [],
  product,
}) => {
  const { t } = useTranslation()

  return (
    <Flex sx={{ justifyContent: ['flex-start', null, null, 'flex-end'], columnGap: 2 }}>
      {automationGroups.map(({ features, icon, productSpecific }) => {
        const intersection = intersectionWith(features, automationFeatures)

        return intersection.length &&
          (productSpecific.length
            ? (productSpecific as OmniProductType[]).includes(product)
            : true) ? (
          <StatefulTooltip
            tooltip={intersection
              .map((item) => t(`product-hub.automation-details.${item}`))
              .join(', ')}
            containerSx={{
              position: 'relative',
            }}
            tooltipSx={{
              top: '100%',
              right: ['auto', null, null, 0],
              mt: 1,
              fontSize: 1,
              textAlign: 'left',
              border: 'none',
              borderRadius: 'medium',
              boxShadow: 'buttonMenu',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon icon={icon} size="24px" sx={{ display: 'block' }} />
          </StatefulTooltip>
        ) : undefined
      })}
    </Flex>
  )
}
