import { MarketingTemplateMarkdown } from 'features/marketing-layouts/components'
import type { MarketingTemplateBenefitBoxProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Box, Heading, Image } from 'theme-ui'

export const MarketingTemplateBenefitBox: FC<MarketingTemplateBenefitBoxProps> = ({
  description,
  icon,
  title,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        p: 4,
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'rounder',
        bg: 'neutral10',
      }}
    >
      <Image src={icon} sx={{ width: '68px' }} />
      <Heading as="h4" variant="header4" sx={{ my: 3 }}>
        {title}
      </Heading>
      <MarketingTemplateMarkdown content={description} />
    </Box>
  )
}
