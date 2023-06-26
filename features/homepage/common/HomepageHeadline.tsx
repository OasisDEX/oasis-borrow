import { Icon } from '@makerdao/dai-ui-icons'
import { scrollToProductHub } from 'features/homepage/helpers/scrollToProductHub'
import { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { Box, Button, SxStyleProp, Text } from 'theme-ui'

type HomePageHeadlineProps = {
  primaryText: string
  secondaryText: string
  maxWidth?: string
  ctaLabel?: TranslateStringType
  sx?: SxStyleProp
}

export const HomepageHeadline = ({
  primaryText,
  secondaryText,
  ctaLabel,
  maxWidth = '700px',
  sx,
}: HomePageHeadlineProps) => {
  return (
    <Box sx={{ maxWidth, ...sx }}>
      <Text variant="header3" sx={{ color: 'primary100' }}>
        {primaryText}
        <Text as="span" variant="header3" sx={{ color: 'neutral80' }}>
          {secondaryText}
        </Text>
      </Text>
      {ctaLabel && (
        <Button
          variant="primary"
          sx={{
            mt: 3,
            py: 2,
            px: 4,
            alignItems: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
          onClick={scrollToProductHub}
        >
          {ctaLabel}{' '}
          <Icon
            name="arrow_right"
            size={14}
            sx={{ ml: 2, position: 'relative', left: 2, transition: '0.2s' }}
          />
        </Button>
      )}
    </Box>
  )
}
