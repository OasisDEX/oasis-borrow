import { AppSpinner } from 'helpers/AppSpinner'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import type { BannerProps } from './Banner.types'

export function Banner({ title, description, button, image, sx }: BannerProps) {
  const descriptionsArray = Array.isArray(description) ? description : [description]

  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted', p: 2, ...sx }}>
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
            flexGrow: 1,
          }}
        >
          <Heading as="h3" variant="boldParagraph1" sx={{ mb: 1 }}>
            {title}
          </Heading>
          <Grid gap={2} mb={3}>
            {descriptionsArray.map((item, index) => (
              <Text
                key={`banner-description-${index}`}
                as="p"
                sx={{
                  fontSize: 2,
                  lineHeight: 1.571,
                  color: 'neutral80',
                }}
              >
                {item}
              </Text>
            ))}
          </Grid>
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
              m: [3, null, null, 0],
              ...(image.spacing && { p: image.spacing }),
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
