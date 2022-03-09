import React, { ReactNode } from 'react'
import { Button, Flex, Heading, SxStyleProp, Text } from 'theme-ui'

import { Banner } from '../../../components/Banner'

interface ProtectionBannerProps {
  handleClose: () => void
  heading: ReactNode
  description: ReactNode
  image: ReactNode
  handleClick?: () => void
  buttonText?: ReactNode
  buttonSx?: SxStyleProp
}

export function ProtectionBanner({
  handleClose,
  heading,
  description,
  image,
  handleClick,
  buttonText,
  buttonSx = {},
}: ProtectionBannerProps) {
  return (
    <Banner
      close={() => {
        handleClose()
      }}
      sx={{ marginBottom: 3, height: '160px' }}
    >
      <Flex sx={{ flexDirection: 'column' }}>
        <Heading variant="header2" as="h1" sx={{ mb: 2, zIndex: 1 }}>
          {heading}
        </Heading>
        <Text
          variant="subheader"
          sx={{ fontSize: 2, mb: '23px', fontWeight: 'semiBold', zIndex: 1 }}
        >
          {description}
        </Text>
        {buttonText && handleClick && (
          <Button
            backgroundColor="selected"
            sx={{
              borderRadius: '6px',
              '&:hover': { backgroundColor: 'selected' },
              height: '28px',
              px: '5px',
              py: '2px',
              zIndex: 1,
              ...buttonSx,
            }}
            onClick={handleClick}
          >
            <Text
              color="link"
              variant="subheader"
              sx={{ fontSize: 1, fontWeight: 'semiBold', lineHeight: '100%' }}
            >
              {buttonText}
            </Text>
          </Button>
        )}
      </Flex>
      {image}
    </Banner>
  )
}
