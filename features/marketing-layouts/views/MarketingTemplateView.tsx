import {
  MarketingTemplateHeading,
  MarketingTemplateHero,
} from 'features/marketing-layouts/components'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import { MarketingTemplateBlockView } from 'features/marketing-layouts/views'
import React, { type FC } from 'react'
import { Box } from 'theme-ui'

type MarketingTemplateViewProps = MarketingTemplateFreeform

export const MarketingTemplateView: FC<MarketingTemplateViewProps> = ({
  blocks,
  hero,
  palette,
}) => {
  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      <MarketingTemplateHero {...hero} />
      {blocks.map((block, i) => (
        <Box key={i} sx={{ mt: 7 }}>
          {block.type !== 'benefit-box' && (
            <Box sx={{ mb: 5, px: [0, null, 5, 6], textAlign: ['left', 'center'] }}>
              <MarketingTemplateHeading
                palette={palette}
                description={block.description}
                subtitle={block.subtitle}
                title={block.title}
              />
            </Box>
          )}
          <MarketingTemplateBlockView palette={palette} {...block} />
        </Box>
      ))}
    </Box>
  )
}
