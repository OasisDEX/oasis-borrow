import { Icon } from 'components/Icon'
import type { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { arrow_right } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Button, Flex, Text } from 'theme-ui'

type HomePageHeadlineProps = {
  primaryText: string
  secondaryText?: string
  maxWidth?: string
  ctaOnClick?: () => void
  ctaLabel?: TranslateStringType
  sx?: ThemeUIStyleObject
  buttonVariant?: string
}

export const HomepageHeadline = ({
  primaryText,
  secondaryText,
  ctaOnClick,
  ctaLabel,
  maxWidth = '700px',
  sx,
  buttonVariant = 'primary',
}: HomePageHeadlineProps) => {
  return (
    <Flex sx={{ flexDirection: 'column', maxWidth, ...sx }}>
      <Text variant="header3" sx={{ color: 'primary100' }}>
        {primaryText}
        {secondaryText && (
          <Text as="span" variant="header3" sx={{ color: 'neutral80' }}>
            {secondaryText}
          </Text>
        )}
      </Text>
      {ctaOnClick && ctaLabel && (
        <Button
          variant={buttonVariant}
          sx={{
            mt: 3,
            py: 2,
            px: 4,
            alignItems: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
            width: 'fit-content',
          }}
          onClick={ctaOnClick}
        >
          {ctaLabel}{' '}
          <Icon
            icon={arrow_right}
            size={14}
            sx={{ ml: 2, position: 'relative', left: 2, transition: '0.2s' }}
          />
        </Button>
      )}
    </Flex>
  )
}
