import { Icon } from '@makerdao/dai-ui-icons'
import { useConnection } from 'features/web3OnBoard'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'

import { AppLink } from './Links'
import { Notice } from './Notice'

interface HomePageBannerProps {
  heading: string
  icon?: {
    name: string
    background: string
  }
  image?: string
  link?: string
}

export function HomePageBannerButton({ heading, image, icon }: Omit<HomePageBannerProps, 'link'>) {
  return (
    <Flex
      sx={{
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'left',
        flexDirection: ['row'],
        minHeight: '44px',
        '&:hover span + svg': {
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
        {image && (
          <Image src={staticFilesRuntimeUrl(image)} sx={{ height: '44px', width: '44px' }} />
        )}
        {icon && (
          <Flex
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '40px',
              width: '40px',
              background: icon.background,
              borderRadius: '50%',
            }}
          >
            <Icon name={icon.name} size="34px" />
          </Flex>
        )}
      </Flex>
      <Flex
        sx={{
          flexDirection: ['column', 'row', 'row', 'row'],
          mr: '7px',
          alignItems: 'flex-start',
        }}
      >
        <Text
          as="span"
          variant="text.paragraph3"
          sx={{
            zIndex: 1,
            fontWeight: 'semiBold',
            wordBreak: 'normal',
            lineHeight: '30px',
          }}
        >
          <Trans
            i18nKey={heading}
            components={{
              1: <Text as="span" sx={{ color: 'interactive100' }} />,
            }}
          />
          <Icon
            key="arrow"
            name="arrow_right"
            size="18px"
            sx={{
              position: 'relative',
              ml: '6px',
              top: '3px',
              transition: '0.2s',
              color: 'interactive100',
              pr: 1,
            }}
          />
        </Text>
      </Flex>
    </Flex>
  )
}

export function HomePageBanner({ link, ...rest }: HomePageBannerProps) {
  const { connect } = useConnection({ initialConnect: false })

  return (
    <Notice
      close={() => null}
      sx={{
        marginBottom: 0,
        overflow: 'hidden',
        borderRadius: '50px',
        maxWidth: ['353px', '530px'],
        width: 'fit-content',
        p: '3px 8px 3px 4px',
        '&:hover': {
          opacity: '80%',
          cursor: 'pointer',
        },
      }}
      withClose={false}
    >
      {link ? (
        <AppLink href={link} target="_self">
          <HomePageBannerButton {...rest} />
        </AppLink>
      ) : (
        <Box onClick={() => void connect()}>
          <HomePageBannerButton {...rest} />
        </Box>
      )}
    </Notice>
  )
}
