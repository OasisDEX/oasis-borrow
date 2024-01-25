import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type { MarketingTemplateProductsProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box } from 'theme-ui'

export const MarketingTemplateProduct: FC<
  MarketingTemplateProductsProps & { i: number; mainGradient: string[] }
> = ({ actionsList, composition, description, i, image, link, mainGradient, title, type }) => {
  const isNarrow = composition === 'narrow'

  return (
    <Box
      sx={{
        gridArea: `p-${i}`,
        minHeight: '486px',
        background: renderCssGradient('180deg', mainGradient),
      }}
    >
      asd
    </Box>
  )
}
