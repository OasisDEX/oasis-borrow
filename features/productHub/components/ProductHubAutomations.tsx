import { AutomationFeature } from '@prisma/client'
import { AutomationIcon } from 'components/AutomationIcon'
import type { FC } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

interface ProductHubAutomationsProps {
  automationFeatures?: AutomationFeature[]
  isHighlighted: boolean
}

export const ProductHubAutomations: FC<ProductHubAutomationsProps> = ({
  automationFeatures = [],
  isHighlighted,
}) => {
  return (
    <Flex sx={{ justifyContent: 'flex-end', columnGap: 1 }}>
      {Object.values(AutomationFeature).map((feature) => (
        <AutomationIcon
          enabled={automationFeatures.includes(feature)}
          type={feature}
          {...(isHighlighted && { iconNotActiveBg: 'neutral10' })}
        />
      ))}
    </Flex>
  )
}
