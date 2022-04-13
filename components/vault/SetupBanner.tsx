import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Button, Card, Flex, Heading, Image, Text } from 'theme-ui'

type SetupBannerGradientPresetsArray = { [key: string]: [string, string] }
interface ISetupBannerProps {
  header: string
  content: string
  button: string
  backgroundImage?: string
  backgroundColor?: string
  backgroundColorEnd?: string
  handleClick: () => void
}

export const setupBannerGradientPresets: SetupBannerGradientPresetsArray = {
  autoBuy: ['#e0e7ff', '#fae2fc'],
  autoSell: ['#fef1e1', '#fef5d6'],
  constantMultiply: ['#ffdde7', '#ffe7f5'],
  stopLoss: ['#ffeaea', '#fff5ea'],
}

export function SetupBanner({
  header,
  content,
  button,
  backgroundImage,
  backgroundColor,
  backgroundColorEnd,
  handleClick,
}: ISetupBannerProps) {
  const hasImage = backgroundImage && backgroundColor

  return (
    <Card
      sx={{
        p: 2,
        border: 'lightMuted',
      }}
    >
      <Flex
        sx={{
          flexDirection: ['column', null, null, 'row'],
        }}
      >
        <Box
          sx={{
            mt: [hasImage ? 2 : 3, null, null, 3],
            mr: [3, null, null, 0],
            mb: 3,
            ml: 3,
            pr: [0, null, null, hasImage ? 4 : 3],
          }}
        >
          <Heading as="h3" variant="headerSettings" sx={{ mb: 1 }}>
            {header}
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
            {content}
          </Text>
          <Button variant="tertiary" onClick={handleClick}>
            {button}
          </Button>
        </Box>
        {hasImage && (
          <Box
            sx={{
              flexShrink: 0,
              order: [-1, null, null, 0],
              width: ['auto', null, null, '36%'],
              margin: [3, null, null, 0],
              borderRadius: 'mediumLarge',
              background: backgroundColorEnd
                ? `linear-gradient(180deg, ${backgroundColor} 0%, ${backgroundColorEnd} 100%)`
                : backgroundColor,
            }}
          >
            <Image
              src={staticFilesRuntimeUrl(backgroundImage)}
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
