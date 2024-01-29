import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type {
  MarketingTemplateBlock,
  MarketingTemplatePalette,
} from 'features/marketing-layouts/types'
import { getGradientColor } from 'helpers/getGradientColor'
import React, { type FC } from 'react'
import { Heading, Text } from 'theme-ui'

export const MarketingTemplateHeading: FC<
  MarketingTemplateBlock & { palette: MarketingTemplatePalette }
> = ({ description, palette: { foreground }, subtitle, title }) => {
  return (
    <>
      {(description || subtitle || title) && (
        <>
          {subtitle && (
            <Heading
              as="h3"
              variant="header4"
              sx={{ ...getGradientColor(renderCssGradient('90deg', foreground)) }}
            >
              {subtitle}
            </Heading>
          )}
          {title && (
            <Heading as="h2" variant="header2" sx={{ mt: subtitle ? 2 : 0 }}>
              {title}
            </Heading>
          )}
          {description && (
            <Text
              as="p"
              variant="paragraph2"
              sx={{ mt: subtitle || title ? '24px' : 0, color: 'neutral80' }}
            >
              {description}
            </Text>
          )}
        </>
      )}
    </>
  )
}
