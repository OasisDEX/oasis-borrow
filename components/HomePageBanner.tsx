import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Flex, Text } from 'theme-ui'

import { AppLink } from './Links'
import { Notice } from './Notice'

interface HomePageBannerProps {
  heading: string
  link: string
}
const handleClose = () => null
export function HomePageBanner({ heading, link }: HomePageBannerProps) {
  return (
    <Notice
      close={() => {
        handleClose()
      }}
      sx={{
        marginBottom: 0,
        overflow: 'hidden',
        borderRadius: '50px',
        maxWidth: ['400px', '520px'],
        p: '3px 8px 3px 4px',
        '&:hover': {
          opacity: '80%',
          cursor: 'pointer',
        },
      }}
      withClose={false}
    >
      <AppLink href={link}>
        <Flex
          sx={{
            justifySelf: 'center',
            alignItems: 'center',
            textAlign: 'left',
            flexDirection: ['row'],
            justifyContent: ['start', 'space-between', 'space-between', 'space-between'],
            minHeight: '44px',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
        >
          <Flex
            sx={{
              background: '#D3F3F5',
              borderRadius: '50px',
              flexDirection: 'row',
              justifySelf: 'center',
              alignItems: 'center',
              textAlign: 'left',
              minHeight: '42px',
              minWidth: '44px',
              px: '8px',
              mr: '8px',
            }}
          >
            <Icon
              name="steth_circle_color"
              size="30px"
              sx={{
                transform: 'none !important',
              }}
            />
          </Flex>
          <Flex
            sx={{
              flexDirection: ['column', 'row', 'row', 'row'],
              mr: '7px',
              alignItems: 'flex-start',
            }}
          >
            <Text
              variant="text.paragraph3"
              sx={{ zIndex: 1, fontWeight: 'semiBold', wordBreak: 'normal' }}
            >
              {`${heading.split('.')[0]}.`}
            </Text>
            <Flex>
              <Text
                variant="text.paragraph3"
                sx={{
                  zIndex: 1,
                  fontWeight: 'semiBold',
                  wordBreak: 'normal',
                  whiteSpace: [null, 'pre'],
                }}
              >
                {` ${heading.split('.')[1]}`}
              </Text>
              <Icon
                key="arrow"
                name="arrow_right"
                size="20px"
                sx={{
                  position: 'relative',
                  ml: '4px',
                  transition: '0.2s',
                  color: 'black',
                  pr: 2,
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </AppLink>
    </Notice>
  )
}
