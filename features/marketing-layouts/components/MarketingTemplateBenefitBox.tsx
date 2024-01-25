import { IconWithPalette } from 'features/marketing-layouts/components'
import { marketingTemplatesIcons } from 'features/marketing-layouts/icons'
import type {
  MarketingTemplateBenefitBoxProps,
  MarketingTemplateIconPalette,
} from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box, Heading, Text } from 'theme-ui'

export const MarketingTemplateBenefitBox: FC<
  MarketingTemplateBenefitBoxProps & MarketingTemplateIconPalette
> = ({ description, icon, list, title, ...palette }) => {
  return (
    <Box
      sx={{
        p: 4,
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'rounder',
        bg: 'neutral10',
      }}
    >
      <IconWithPalette size={80} contents={marketingTemplatesIcons[icon]} {...palette} />
      <Heading as="h4" variant="header4" sx={{ my: 3 }}>
        {title}
      </Heading>
      {description && (
        <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
          {description}
        </Text>
      )}
      {list && (
        <Box as="ul" sx={{ mt: '12px', pl: '24px' }}>
          {list.map((item, i) => (
            <Box as="li" key={i} sx={{ '&::marker': { color: 'neutral80' } }}>
              <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
                {item}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
