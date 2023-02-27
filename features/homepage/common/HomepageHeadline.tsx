import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import React, { LegacyRef } from 'react'
import { Box, SxStyleProp, Text } from 'theme-ui'

type HomePageHeadlineProps = {
  primaryText: string
  secondaryText: string
  maxWidth?: string
  ctaURL?: string
  ctaLabel?: string
  sx?: SxStyleProp
  wrapperRef?: LegacyRef<HTMLDivElement>
}

export const HomepageHeadline = ({
  primaryText,
  secondaryText,
  ctaURL,
  ctaLabel,
  maxWidth = '700px',
  sx,
  wrapperRef = null,
}: HomePageHeadlineProps) => (
  <Box sx={{ maxWidth, ...sx }} ref={wrapperRef}>
    <Text variant="header3" sx={{ color: 'primary100' }}>
      {primaryText}
      <Text as="span" variant="header3" sx={{ color: 'neutral80' }}>
        {secondaryText}
      </Text>
    </Text>
    {ctaURL && ctaLabel && (
      <WithArrow gap={1} sx={{ fontSize: 1, color: 'interactive100', mt: 4 }}>
        <AppLink href={ctaURL} internalInNewTab>
          {ctaLabel}
        </AppLink>
      </WithArrow>
    )}
  </Box>
)
