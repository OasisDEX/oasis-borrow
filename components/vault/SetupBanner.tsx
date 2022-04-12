import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Button, Card, Flex, Heading, Image, Text } from 'theme-ui'

interface ISetupBannerProps {
  header: string
  content: string
  button?: string
  backgroundImage?: string
  backgroundColor?: string
  backgroundColorEnd?: string
}

export function SetupBanner({
  header,
  content,
  button,
  backgroundImage,
  backgroundColor,
  backgroundColorEnd,
}: ISetupBannerProps) {
  const hasImage = backgroundImage && backgroundColor

  return (
    <Card
      sx={{
        p: 2,
        border: 'lightMuted',
      }}
    >
      <Flex>
        <Box
          sx={{
            my: 3,
            pr: hasImage ? 4 : 3,
            ml: 3,
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
          <Button variant="tertiary">{button}</Button>
        </Box>
        {hasImage && (
          <Box
            sx={{
              flexShrink: 0,
              width: '36%',
              borderRadius: 'mediumLarge',
              background: backgroundColorEnd
                ? `linear-gradient(180deg, ${backgroundColor} 0%, ${backgroundColorEnd} 100%)`
                : backgroundColor,
            }}
          >
            <Image
              src={staticFilesRuntimeUrl(backgroundImage)}
              sx={{
                width: 'calc(100% - 20px)',
                height: 'calc(100% - 20px)',
                m: '10px',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
      </Flex>
    </Card>
  )
}
