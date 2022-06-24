import { Icon } from '@makerdao/dai-ui-icons'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { ReactNode } from 'react'
import { Box, Button, Card, Flex, Heading, IconButton, Image, Text } from 'theme-ui'

import { AppSpinner } from '../helpers/AppSpinner'

type BannerGradientPresetsArray = { [key: string]: [string, string] }
export const bannerGradientPresets: BannerGradientPresetsArray = {
  autoBuy: ['#e0e7ff', '#fae2fc'],
  autoSell: ['#fef1e1', '#fef5d6'],
  constantMultiply: ['#ffdde7', '#ffe7f5'],
  stopLoss: ['#ffeaea', '#fff5ea'],
}

type BannerButtonProps = {
  disabled?: boolean
  isLoading?: boolean
  text?: string | ReactNode
  action: (() => void) | undefined
}

type BannerProps = {
  title: string | ReactNode
  description: ReactNode
  button?: BannerButtonProps
  image?: { src: string; backgroundColor?: string; backgroundColorEnd?: string }
  close?: () => void
}

export function Banner({ title, description, button, image, close }: BannerProps) {
  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted', p: 2 }}>
      <Flex
        sx={{
          flexDirection: ['column', null, null, 'row'],
        }}
      >
        <Flex
          sx={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            mt: [image ? 2 : 3, null, null, 3],
            mr: [3, null, null, 0],
            mb: 3,
            ml: 3,
            pr: [0, null, null, image ? 4 : 3],
          }}
        >
          {close && (
            <IconButton
              onClick={close}
              sx={{
                cursor: 'pointer',
                height: 3,
                width: 3,
                padding: 0,
                position: 'absolute',
                top: 3,
                right: 3,
                zIndex: 1,
                color: 'onSurface',
                '&:hover': {
                  color: 'primary',
                },
              }}
            >
              <Icon name="close_squared" size={14} />
            </IconButton>
          )}
          <Heading as="h3" variant="headerSettings" sx={{ mb: 1 }}>
            {title}
          </Heading>
          <Text
            as="p"
            sx={{
              mb: 3,
              fontSize: 2,
              lineHeight: 1.571,
              color: 'text.subtitle',
            }}
          >
            {description}
          </Text>
          <Button disabled={button?.disabled} variant="tertiary" onClick={button?.action}>
            {button?.isLoading ? (
              <AppSpinner
                variant="styles.spinner.medium"
                size={20}
                sx={{
                  color: 'black',
                  boxSizing: 'content-box',
                }}
              />
            ) : (
              button?.text
            )}
          </Button>
        </Flex>
        {image && (
          <Box
            sx={{
              flexShrink: 0,
              order: [-1, null, null, 0],
              width: ['auto', null, null, '36%'],
              margin: [3, null, null, 0],
              borderRadius: 'mediumLarge',
              background: image?.backgroundColorEnd
                ? `linear-gradient(180deg, ${image?.backgroundColor} 0%, ${image?.backgroundColorEnd} 100%)`
                : image?.backgroundColor,
            }}
          >
            <Image
              src={staticFilesRuntimeUrl(image.src)}
              sx={{
                width: 'calc(100% - 24px)',
                height: 'calc(100% - 24px)',
                m: '12px',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
      </Flex>
    </Card>
  )
}
