import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { Box, SxStyleProp, Text } from 'theme-ui'

type HomePageHeadlineProps = {
  primaryText: string
  secondaryText: string
  maxWidth?: string
  ctaURL?: string
  ctaLabel?: TranslateStringType
  sx?: SxStyleProp
}

export const HomepageHeadline = ({
  primaryText,
  secondaryText,
  ctaURL,
  ctaLabel,
  maxWidth = '700px',
  sx,
}: HomePageHeadlineProps) => (
  <Box sx={{ maxWidth, ...sx }}>
    <Text variant="header3" sx={{ color: 'primary100' }}>
      {primaryText}
      <Text as="span" variant="header3" sx={{ color: 'neutral80' }}>
        {secondaryText}
      </Text>
    </Text>
    {ctaURL && ctaLabel && (
      <WithArrow gap={1} sx={{ fontSize: 2, color: 'interactive100', mt: 3 }}>
        <AppLink href={ctaURL} internalInNewTab sx={{ fontSize: 4 }}>
          {ctaLabel}
        </AppLink>
      </WithArrow>
    )}
  </Box>
)
