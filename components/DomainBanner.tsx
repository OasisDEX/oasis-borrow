import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { AppLink } from './Links'
import { Notice } from './Notice'

interface DomainBannerProps {
  heading: string
  link: string
}

export function DomainBanner({ heading, link }: DomainBannerProps) {
  return (
    <Notice
      close={() => {}}
      sx={{
        display: 'inline-block',
        width: 'auto',
        p: 0,
        borderRadius: '50px',
        border: '3px solid #fff',
        background: 'linear-gradient(-45deg, #fdf1d5, #ffeeea, #fff2f7, #f3f2fd, #e5eef8)',
        backgroundSize: '400% 400%',
        animation: 'gradient 5s ease infinite',
        cursor: 'pointer',
        overflow: 'hidden',
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
      withClose={false}
    >
      <Box
        sx={{
          backgroundColor: 'transparent',
          py: 1,
          pr: 2,
          pl: 3,
          transition: '200ms background-color',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
        }}
      >
        <AppLink href={link}>
          <Flex
            sx={{
              justifySelf: 'center',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '44px',
              '&:hover svg': {
                transform: 'translateX(10px)',
              },
            }}
          >
            <Icon
              name="star_circle_color"
              size="30px"
              sx={{
                transform: 'none !important',
                mr: 2,
              }}
            />
            <Text
              variant="text.paragraph3"
              sx={{ zIndex: 1, fontWeight: 'semiBold', wordBreak: 'normal' }}
            >
              {heading}
            </Text>
            <Icon
              key="arrow"
              name="arrow_right"
              size="20px"
              sx={{
                position: 'relative',
                ml: 2,
                transition: 'transform 200ms',
                color: 'black',
                pr: 2,
              }}
            />
          </Flex>
        </AppLink>
      </Box>
    </Notice>
  )
}
