import { MarketingTemplateHero } from 'features/marketing-layouts/components'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box } from 'theme-ui'

type MarketingTemplateViewProps = MarketingTemplateFreeform

export const MarketingTemplateView: FC<MarketingTemplateViewProps> = ({ blocks, hero }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <MarketingTemplateHero {...hero} />
    </Box>
  )
}
