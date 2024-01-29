import { MarketingTemplateHero } from 'features/marketing-layouts/components'
import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import { MarketingTemplateBlockView } from 'features/marketing-layouts/views'
import { getGradientColor } from 'helpers/getGradientColor'
import React, { type FC } from 'react'
import { Box, Heading, Text } from 'theme-ui'

type MarketingTemplateViewProps = MarketingTemplateFreeform

export const MarketingTemplateView: FC<MarketingTemplateViewProps> = ({
  blocks,
  hero,
  palette,
}) => {
  const { foreground } = palette

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      <MarketingTemplateHero {...hero} />
      {blocks.map(({ description, subtitle, title, ...block }, i) => (
        <Box key={i} sx={{ mt: 7 }}>
          <Box sx={{ mb: 5, px: 6, textAlign: 'center' }}>
            <Heading
              as="h3"
              variant="header4"
              sx={{ mb: 3, ...getGradientColor(renderCssGradient('90deg', foreground)) }}
            >
              {subtitle}
            </Heading>
            <Heading as="h2" variant="header2" sx={{ mb: '24px' }}>
              {title}
            </Heading>
            <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
              {description}
            </Text>
          </Box>
          <MarketingTemplateBlockView palette={palette} block={block} />
        </Box>
      ))}
    </Box>
  )
}
