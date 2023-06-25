import { Icon } from '@makerdao/dai-ui-icons'
import { TranslateStringType } from 'helpers/translateStringType'
import { useRouter } from 'next/router'
import React from 'react'
import { Box, Button, SxStyleProp, Text } from 'theme-ui'

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
}: HomePageHeadlineProps) => {
  const { replace } = useRouter()
  return (
    <Box sx={{ maxWidth, ...sx }}>
      <Text variant="header3" sx={{ color: 'primary100' }}>
        {primaryText}
        <Text as="span" variant="header3" sx={{ color: 'neutral80' }}>
          {secondaryText}
        </Text>
      </Text>
      {ctaURL && ctaLabel && (
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
          onClick={() => replace(ctaURL)}
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
