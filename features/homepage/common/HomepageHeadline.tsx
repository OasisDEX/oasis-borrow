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
  buttonSx?: ThemeUIStyleObject
  buttonVariant?: string
  textVariant?: string
}

export const HomepageHeadline = ({
  primaryText,
  secondaryText,
  ctaOnClick,
  ctaLabel,
  maxWidth = '700px',
  sx,
  buttonVariant = 'primary',
  textVariant = 'header3',
  buttonSx,
}: HomePageHeadlineProps) => {
  return (
    <Flex sx={{ flexDirection: 'column', maxWidth, ...sx }}>
      <Text variant={textVariant} sx={{ color: 'primary100' }}>
        {primaryText}
        {secondaryText && (
          <Text as="span" variant={textVariant} sx={{ color: 'neutral80' }}>
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
            ...buttonSx,
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
