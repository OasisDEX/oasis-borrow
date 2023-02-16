import { Icon } from '@makerdao/dai-ui-icons'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Flex, Image, Text } from 'theme-ui'

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
        maxWidth: ['353px', '530px'],
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
              flexDirection: 'row',
              justifySelf: 'center',
              alignItems: 'center',
              textAlign: 'left',
              minHeight: '44px',
              minWidth: '44px',
              mr: '8px',
            }}
          >
            <Image
              src={staticFilesRuntimeUrl('/static/img/tokens/Aave.png')}
              sx={{ height: '44px', width: '44px' }}
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
              sx={{
                zIndex: 1,
                fontWeight: 'semiBold',
                wordBreak: 'normal',
                lineHeight: '30px',
              }}
            >
              {heading}
              <Icon
                key="arrow"
                name="arrow_right"
                size="20px"
                sx={{
                  position: 'relative',
                  ml: '4px',
                  top: '0.35em',
                  left: '0.3em',
                  transition: '0.2s',
                  color: 'black',
                  pr: 2,
                }}
              />
            </Text>
          </Flex>
        </Flex>
      </AppLink>
    </Notice>
  )
}
