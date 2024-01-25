import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type { MarketingTemplateProductsProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box } from 'theme-ui'

export const MarketingTemplateProduct: FC<
  MarketingTemplateProductsProps & { mainGradient: string[] }
> = ({ actionsList, composition, description, image, link, mainGradient, title, type }) => {
  const isNarrow = composition === 'narrow'

  return (
    <Box
      sx={{
        flexShrink: 0,
        minHeight: '486px',
        background: renderCssGradient('180deg', mainGradient),
      }}
    >
      asd
    </Box>
  )
}
